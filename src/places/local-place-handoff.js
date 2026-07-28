import {
  approvePlaceHandoff,
  createPlaceHandoffPreview,
  createSourcePackage,
  PlaceSystemError
} from '../core/place-system.js';
import { LocalPlaceStore } from './local-place-store.js';

export const LOCAL_PLACE_RETURN_SCHEMA = 'gummy.place-local-return/v1';

function clone(value) {
  return structuredClone(value);
}

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(typeof value === 'string' ? value : canonical(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function requireScope(scope, name) {
  if (!scope?.placeId || !scope?.ownerActorId || !scope?.contextType || !scope?.contextId) {
    throw new PlaceSystemError('scope-required', `${name} requires a complete Place scope.`);
  }
  return scope;
}

export class LocalPlaceHandoffService {
  constructor(repository, { clock = () => new Date().toISOString(), idFactory = () => crypto.randomUUID() } = {}) {
    if (!repository) throw new PlaceSystemError('repository-required', 'Local Place handoffs require a repository.');
    this.repository = repository;
    this.local = new LocalPlaceStore(repository, { clock, idFactory });
    this.clock = clock;
    this.idFactory = idFactory;
  }

  async preview({
    sourceScope,
    targetScope,
    sourceRefs,
    includedFields,
    explicitExclusions = [],
    purpose,
    audience = 'Private owner',
    privacy = 'private',
    expectedOutput,
    permissionScopes,
    rights = { ownerApproved: true },
    retention = 'local-until-reset',
    limitations = []
  }) {
    requireScope(sourceScope, 'sourceScope');
    requireScope(targetScope, 'targetScope');
    if (sourceScope.ownerActorId !== targetScope.ownerActorId) {
      throw new PlaceSystemError('owner-mismatch', 'A local handoff cannot silently cross Human ownership.');
    }
    if (!Array.isArray(sourceRefs) || sourceRefs.length === 0) {
      throw new PlaceSystemError('source-required', 'Select at least one source record.');
    }
    const records = [];
    for (const ref of sourceRefs) {
      records.push(await this.local.get(sourceScope, ref.recordType, ref.recordId));
    }
    const sources = await Promise.all(records.map(async record => ({
      id: `${sourceScope.placeId}:${record.recordType}:${record.recordId}`,
      revision: record.revision,
      hash: await sha256(record.value)
    })));
    const createdAt = this.clock();
    const packageId = `source-package:${sourceScope.placeId.slice(4)}:${this.idFactory()}`;
    const sourcePackage = createSourcePackage({
      id: packageId,
      sources,
      includedFields,
      explicitExclusions,
      purpose,
      targetPlaceId: targetScope.placeId,
      privacy,
      audience,
      quotePermission: false,
      voiceLikenessPermission: false,
      rights,
      provenance: {
        sourcePlaceId: sourceScope.placeId,
        sourceContext: `${sourceScope.contextType}:${sourceScope.contextId}`,
        sourceRecords: records.map(record => ({ recordType: record.recordType, recordId: record.recordId, revision: record.revision }))
      },
      retention,
      costCeiling: 0,
      limitations,
      humanApproval: { approved: false, approvedBy: null, approvedAt: null },
      createdAt
    });
    const handoff = createPlaceHandoffPreview({
      id: `place-handoff:${sourceScope.placeId.slice(4)}:${targetScope.placeId.slice(4)}:${this.idFactory()}`,
      sourcePackage,
      sourcePlaceId: sourceScope.placeId,
      targetPlaceId: targetScope.placeId,
      expectedOutput,
      permissionScopes,
      locality: 'browser',
      runtime: 'gummy-local-place-handoff/v1',
      approvalBoundary: 'place-confirmation',
      createdAt
    });
    const preview = {
      schema: 'gummy.local-place-handoff-preview/v1',
      id: `local-handoff-preview:${this.idFactory()}`,
      sourceScope: clone(sourceScope),
      targetScope: clone(targetScope),
      sourcePackage,
      handoff,
      sourceRecords: records.map(record => ({ recordType: record.recordType, recordId: record.recordId, revision: record.revision, value: clone(record.value) })),
      execution: { executing: false, externalExecution: false },
      createdAt
    };
    await this.repository.put('workspaces', { ...clone(preview), id: preview.id }, { validate: false });
    return Object.freeze(preview);
  }

  async approveAndApply(preview, {
    approvedBy,
    targetRecordType,
    targetRecordId,
    transform = records => ({ sources: records.map(record => clone(record.value)) })
  }) {
    if (preview?.schema !== 'gummy.local-place-handoff-preview/v1') {
      throw new PlaceSystemError('preview-required', 'A local handoff preview is required.');
    }
    if (!approvedBy?.startsWith('actor:')) {
      throw new PlaceSystemError('approval-required', 'A Human Actor must approve the handoff.');
    }
    const approvedAt = this.clock();
    const approvedHandoff = approvePlaceHandoff(preview.handoff, { approved: true, approvedBy, approvedAt });
    const targetValue = await transform(preview.sourceRecords.map(clone), clone(preview.sourcePackage), clone(approvedHandoff));
    const applied = await this.local.put(preview.targetScope, targetRecordType, targetRecordId, {
      ...clone(targetValue),
      sourcePackageId: preview.sourcePackage.id,
      handoffId: approvedHandoff.id,
      sourcePlaceId: preview.sourceScope.placeId,
      receivedAt: approvedAt
    }, {
      operation: 'place.handoff.apply',
      limitations: preview.sourcePackage.limitations
    });
    const submittedHandoff = {
      ...clone(approvedHandoff),
      executionState: 'submitted'
    };
    const returned = {
      id: `place-local-return:${this.idFactory()}`,
      schema: LOCAL_PLACE_RETURN_SCHEMA,
      sourcePlaceId: preview.sourceScope.placeId,
      targetPlaceId: preview.targetScope.placeId,
      sourcePackageId: preview.sourcePackage.id,
      handoffId: submittedHandoff.id,
      targetRecordRef: {
        recordType: applied.record.recordType,
        recordId: applied.record.recordId,
        revision: applied.record.revision
      },
      outcome: 'completed',
      executedLocally: true,
      externalExecution: false,
      receiptId: applied.receipt.id,
      limitations: clone(preview.sourcePackage.limitations),
      createdAt: approvedAt
    };
    await this.repository.transaction(['workspaces'], 'readwrite', async transaction => {
      const store = transaction.objectStore('workspaces');
      await store.put({ ...clone(preview.sourcePackage), id: preview.sourcePackage.id });
      await store.put({ ...clone(submittedHandoff), id: submittedHandoff.id });
      await store.put(returned);
      await store.put({ ...clone(preview), status: 'applied', appliedReturnId: returned.id, updatedAt: approvedAt });
    });
    return Object.freeze({
      status: 'completed',
      sourcePackage: clone(preview.sourcePackage),
      handoff: submittedHandoff,
      record: clone(applied.record),
      receipt: clone(applied.receipt),
      returned
    });
  }
}
