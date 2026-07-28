import { PlaceSystemError, assertNoSecrets } from '../core/place-system.js';

export const PLACE_LOCAL_RECORD_SCHEMA = 'gummy.place-local-record/v1';
export const PLACE_OPERATION_RECEIPT_SCHEMA = 'gummy.place-operation-receipt/v1';
export const PLACE_EXPORT_SCHEMA = 'gummy.place-export/v1';

const CONTEXT_TYPES = new Set(['personal', 'production', 'session']);

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new PlaceSystemError('missing-field', `${field} is required`, { field });
  }
  return value;
}

function validateScope(scope) {
  requireString(scope?.placeId, 'scope.placeId');
  requireString(scope?.ownerActorId, 'scope.ownerActorId');
  if (!CONTEXT_TYPES.has(scope?.contextType)) {
    throw new PlaceSystemError('invalid-context', 'Context must be personal, production, or session.');
  }
  requireString(scope?.contextId, 'scope.contextId');
  return scope;
}

function encoded(value) {
  return encodeURIComponent(value);
}

function recordPrefix(scope) {
  return `place-local:${encoded(scope.placeId)}:${encoded(scope.ownerActorId)}:${scope.contextType}:${encoded(scope.contextId)}:`;
}

function receiptPrefix(scope) {
  return `place-operation:${encoded(scope.placeId)}:${encoded(scope.ownerActorId)}:${scope.contextType}:${encoded(scope.contextId)}:`;
}

export function placeLocalRecordId(scope, recordType, recordId) {
  validateScope(scope);
  requireString(recordType, 'recordType');
  requireString(recordId, 'recordId');
  return `${recordPrefix(scope)}${encoded(recordType)}:${encoded(recordId)}`;
}

export class LocalPlaceStore {
  constructor(repository, { clock = () => new Date().toISOString(), idFactory = () => crypto.randomUUID() } = {}) {
    if (!repository) throw new PlaceSystemError('repository-required', 'Local Place storage requires a repository.');
    this.repository = repository;
    this.clock = clock;
    this.idFactory = idFactory;
  }

  async list(scope, { recordType = null } = {}) {
    validateScope(scope);
    const prefix = recordPrefix(scope);
    const records = (await this.repository.all('workspaces'))
      .filter(record => record.schema === PLACE_LOCAL_RECORD_SCHEMA && record.id.startsWith(prefix) && !record.deletedAt)
      .filter(record => !recordType || record.recordType === recordType)
      .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt));
    return freeze(records.map(clone));
  }

  async get(scope, recordType, recordId) {
    const record = await this.repository.get('workspaces', placeLocalRecordId(scope, recordType, recordId));
    if (!record || record.deletedAt) {
      throw new PlaceSystemError('record-unavailable', 'Place record is missing or deleted.', { recordType, recordId });
    }
    return freeze(clone(record));
  }

  async put(scope, recordType, recordId, value, {
    expectedRevision = null,
    operation = 'record.put',
    limitations = []
  } = {}) {
    validateScope(scope);
    assertNoSecrets(value);
    const id = placeLocalRecordId(scope, recordType, recordId);
    const current = await this.repository.get('workspaces', id);
    const currentRevision = current?.revision || 0;
    if (expectedRevision !== null && expectedRevision !== currentRevision) {
      throw new PlaceSystemError('revision-conflict', 'The Place record changed after it was opened.', {
        recordType,
        recordId,
        expectedRevision,
        actualRevision: currentRevision
      });
    }
    const now = this.clock();
    const record = {
      id,
      schema: PLACE_LOCAL_RECORD_SCHEMA,
      placeId: scope.placeId,
      ownerActorId: scope.ownerActorId,
      contextType: scope.contextType,
      contextId: scope.contextId,
      recordType,
      recordId,
      revision: currentRevision + 1,
      value: clone(value),
      createdAt: current?.createdAt || now,
      updatedAt: now,
      deletedAt: null
    };
    const receipt = this.operationReceipt(scope, {
      operation,
      recordRefs: [{ recordType, recordId }],
      priorRevisions: current ? [{ recordType, recordId, revision: currentRevision }] : [],
      resultRevisions: [{ recordType, recordId, revision: record.revision }],
      limitations
    });
    await this.repository.transaction(['workspaces'], 'readwrite', async transaction => {
      await transaction.objectStore('workspaces').put(record);
      await transaction.objectStore('workspaces').put(receipt);
    });
    return freeze({ record: clone(record), receipt: clone(receipt) });
  }

  async remove(scope, recordType, recordId, {
    expectedRevision = null,
    operation = 'record.remove',
    limitations = []
  } = {}) {
    const current = await this.get(scope, recordType, recordId);
    if (expectedRevision !== null && expectedRevision !== current.revision) {
      throw new PlaceSystemError('revision-conflict', 'The Place record changed after it was opened.', {
        recordType,
        recordId,
        expectedRevision,
        actualRevision: current.revision
      });
    }
    const now = this.clock();
    const deleted = { ...clone(current), revision: current.revision + 1, updatedAt: now, deletedAt: now };
    const receipt = this.operationReceipt(scope, {
      operation,
      recordRefs: [{ recordType, recordId }],
      priorRevisions: [{ recordType, recordId, revision: current.revision }],
      resultRevisions: [{ recordType, recordId, revision: deleted.revision }],
      limitations
    });
    await this.repository.transaction(['workspaces'], 'readwrite', async transaction => {
      await transaction.objectStore('workspaces').put(deleted);
      await transaction.objectStore('workspaces').put(receipt);
    });
    return freeze({ record: clone(deleted), receipt: clone(receipt) });
  }

  async receipts(scope) {
    validateScope(scope);
    const prefix = receiptPrefix(scope);
    const receipts = (await this.repository.all('workspaces'))
      .filter(record => record.schema === PLACE_OPERATION_RECEIPT_SCHEMA && record.id.startsWith(prefix))
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    return freeze(receipts.map(clone));
  }

  async exportPackage(scope, { recordTypes = null, recordIds = null } = {}) {
    let records = await this.list(scope);
    if (recordTypes) records = records.filter(record => recordTypes.includes(record.recordType));
    if (recordIds) records = records.filter(record => recordIds.includes(record.recordId));
    return freeze({
      schema: PLACE_EXPORT_SCHEMA,
      id: `place-export:${encoded(scope.placeId)}:${this.idFactory()}`,
      placeId: scope.placeId,
      ownerActorId: scope.ownerActorId,
      contextType: scope.contextType,
      contextId: scope.contextId,
      records: records.map(clone),
      limitations: ['Local Place export contains only the selected context and is not encrypted or signed.'],
      exportedAt: this.clock()
    });
  }

  async importPackage(scope, packageValue) {
    validateScope(scope);
    assertNoSecrets(packageValue);
    if (packageValue?.schema !== PLACE_EXPORT_SCHEMA || !Array.isArray(packageValue.records)) {
      throw new PlaceSystemError('invalid-import', 'A valid Gummy Place export is required.');
    }
    if (packageValue.placeId !== scope.placeId) {
      throw new PlaceSystemError('wrong-place', 'This export belongs to a different Place.');
    }
    const imported = [];
    for (const source of packageValue.records) {
      const value = await this.put(scope, source.recordType, source.recordId, source.value, {
        operation: 'record.import',
        limitations: ['Imported records require local review; external authority was not granted.']
      });
      imported.push(value.record);
    }
    return freeze({ status: 'imported', count: imported.length, records: imported.map(clone) });
  }

  async reset(scope) {
    const records = await this.list(scope);
    const now = this.clock();
    const receipt = this.operationReceipt(scope, {
      operation: 'context.reset',
      recordRefs: records.map(record => ({ recordType: record.recordType, recordId: record.recordId })),
      priorRevisions: records.map(record => ({ recordType: record.recordType, recordId: record.recordId, revision: record.revision })),
      resultRevisions: [],
      limitations: ['Only the selected Place context was reset. Other Places and contexts were preserved.']
    });
    await this.repository.transaction(['workspaces'], 'readwrite', async transaction => {
      const store = transaction.objectStore('workspaces');
      for (const record of records) {
        await store.put({ ...clone(record), revision: record.revision + 1, updatedAt: now, deletedAt: now });
      }
      await store.put(receipt);
    });
    return freeze({ status: 'reset', count: records.length, receipt: clone(receipt) });
  }

  operationReceipt(scope, {
    operation,
    recordRefs,
    priorRevisions,
    resultRevisions,
    limitations = []
  }) {
    validateScope(scope);
    return {
      id: `${receiptPrefix(scope)}${this.idFactory()}`,
      schema: PLACE_OPERATION_RECEIPT_SCHEMA,
      placeId: scope.placeId,
      ownerActorId: scope.ownerActorId,
      contextType: scope.contextType,
      contextId: scope.contextId,
      operation: requireString(operation, 'operation'),
      recordRefs: clone(recordRefs || []),
      priorRevisions: clone(priorRevisions || []),
      resultRevisions: clone(resultRevisions || []),
      executedLocally: true,
      externalExecution: false,
      limitations: clone(limitations),
      createdAt: this.clock()
    };
  }
}
