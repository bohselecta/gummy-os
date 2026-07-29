import { STORES } from './repository.js';
import { canonicalize, sha256 } from './hash.js';
import { createReceipt } from './records.js';

export const BACKUP_SCHEMA = 'gummy-box-backup/v1';
export const BACKUP_MIME = 'application/vnd.gummy.box-backup+json';
export const BACKUP_EXTENSION = '.gummybox';
export const MAX_BACKUP_BYTES = 32 * 1024 * 1024;

const excludedStores = new Set(['leaseClaims', 'outbox']);
const activeMediaTypes = new Set([
  'application/javascript',
  'text/javascript',
  'text/html',
  'application/xhtml+xml'
]);
const clone = value => structuredClone(value);

function encodeBase64(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function collectByteRefs(value, refs = new Map()) {
  if (Array.isArray(value)) {
    for (const item of value) collectByteRefs(item, refs);
    return refs;
  }
  if (!value || typeof value !== 'object') return refs;
  if (typeof value.byteRef === 'string') {
    refs.set(value.byteRef, {
      mediaType: value.mediaType || 'application/octet-stream',
      declaredLength: Number(value.sizeBytes || 0)
    });
  }
  for (const nested of Object.values(value)) collectByteRefs(nested, refs);
  return refs;
}

function safeBackupPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return false;
  const parts = path.split('/').filter(Boolean);
  return parts.length >= 2
    && !parts.includes('..')
    && !parts.includes('.')
    && !path.includes('\\')
    && (parts[0] === 'gummies' || parts[0] === 'gummy-box');
}

function sourceRecordHash(record) {
  const hash = record?.hash;
  if (typeof hash === 'string') return hash.replace(/^sha256:/, '');
  if (hash?.algorithm === 'sha256') return hash.value;
  return null;
}

export async function createBackupPackage({
  repository,
  byteStore,
  boxId = 'box:hayden',
  sourceVersion = '0.1.0',
  sourceCommit = 'unknown',
  clock = () => new Date().toISOString()
}) {
  const snapshot = await repository.export();
  const records = {};
  for (const store of STORES.filter(name => !excludedStores.has(name)).sort()) {
    records[store] = clone(snapshot[store] || []).sort((a, b) => a.id.localeCompare(b.id));
  }
  const byteRefs = collectByteRefs(records);
  const bytes = [];
  for (const [path, metadata] of [...byteRefs.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (!safeBackupPath(path)) throw new Error(`Backup blocked unsafe byte path: ${path}`);
    const content = await byteStore.read(path);
    const hash = await sha256(content);
    if (metadata.declaredLength && metadata.declaredLength !== content.byteLength) {
      throw new Error(`Backup blocked byte length mismatch: ${path}`);
    }
    bytes.push({
      path,
      mediaType: metadata.mediaType,
      length: content.byteLength,
      sha256: hash,
      data: encodeBase64(content)
    });
  }
  const box = records.boxes.find(record => record.id === boxId);
  const inventory = Object.fromEntries(Object.entries(records).map(([store, values]) => [
    store,
    values.map(record => ({
      id: record.id,
      revision: record.revision ?? null,
      hash: sourceRecordHash(record)
    }))
  ]));
  const unsigned = {
    schema: BACKUP_SCHEMA,
    createdAt: clock(),
    source: { version: sourceVersion, commit: sourceCommit },
    box: {
      id: boxId,
      authority: box?.authoritativeLocation || 'Local Gummy Box',
      role: 'authoritative-local'
    },
    inventory,
    records,
    bytes,
    externalReferences: [],
    encryption: { status: 'not-encrypted', disclosure: 'Protect this file as private Box data.' },
    limitations: [
      'Browser session state, provider credentials, private keys, Task Lease claims, and pending outbox operations are excluded.',
      'The package is integrity-hashed but not encrypted or signed.'
    ]
  };
  const portable = JSON.parse(JSON.stringify(unsigned));
  const packageHash = await sha256(portable);
  return Object.freeze({ ...portable, packageHash });
}

export function serializeBackupPackage(backup) {
  return JSON.stringify(backup, null, 2);
}

export async function inspectBackupPackage(input, { repository = null } = {}) {
  const text = typeof input === 'string' ? input : new TextDecoder().decode(input);
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 32 MiB inspection limit');
  let source;
  try {
    source = JSON.parse(text);
  } catch {
    throw new Error('Backup is not valid JSON');
  }
  if (source?.schema !== BACKUP_SCHEMA) throw new Error('Unsupported Gummy Box backup schema');
  if (!source.packageHash || !Array.isArray(source.bytes) || !source.records || typeof source.records !== 'object') {
    throw new Error('Backup manifest is incomplete');
  }
  const unsigned = clone(source);
  delete unsigned.packageHash;
  if (await sha256(unsigned) !== source.packageHash) throw new Error('Backup package hash mismatch');

  const bytePaths = new Set();
  let totalByteLength = 0;
  for (const entry of source.bytes) {
    if (!safeBackupPath(entry.path)) throw new Error(`Unsafe backup path: ${entry.path}`);
    if (bytePaths.has(entry.path)) throw new Error(`Duplicate backup byte path: ${entry.path}`);
    bytePaths.add(entry.path);
    if (activeMediaTypes.has(entry.mediaType)) throw new Error(`Active content is not accepted in a backup: ${entry.path}`);
    const content = decodeBase64(entry.data);
    totalByteLength += content.byteLength;
    if (content.byteLength !== entry.length) throw new Error(`Backup byte length mismatch: ${entry.path}`);
    if (await sha256(content) !== entry.sha256) throw new Error(`Backup byte hash mismatch: ${entry.path}`);
  }
  if (totalByteLength > MAX_BACKUP_BYTES) throw new Error('Expanded backup bytes exceed the 32 MiB limit');

  const changes = { added: [], unchanged: [], conflicting: [] };
  for (const [store, values] of Object.entries(source.records)) {
    if (!STORES.includes(store) || excludedStores.has(store)) throw new Error(`Backup contains unsupported store: ${store}`);
    if (!Array.isArray(values)) throw new Error(`Backup store is not an array: ${store}`);
    const ids = new Set();
    for (const record of values) {
      if (!record?.id || ids.has(record.id)) throw new Error(`Duplicate or missing record ID in ${store}`);
      ids.add(record.id);
      const current = repository ? await repository.get(store, record.id) : null;
      if (!current) changes.added.push({ store, id: record.id });
      else if (canonicalize(current) === canonicalize(record)) changes.unchanged.push({ store, id: record.id });
      else changes.conflicting.push({ store, id: record.id });
    }
  }
  const recordByteRefs = collectByteRefs(source.records);
  const missingBytes = [...recordByteRefs.keys()].filter(path => !bytePaths.has(path));
  if (missingBytes.length) throw new Error(`Backup is missing referenced bytes: ${missingBytes.join(', ')}`);
  return Object.freeze({
    schema: 'gummy-box-backup-inspection/v1',
    source: clone(source),
    packageHash: source.packageHash,
    boxId: source.box?.id,
    sourceVersion: source.source?.version,
    counts: {
      records: Object.values(source.records).reduce((sum, values) => sum + values.length, 0),
      bytes: source.bytes.length,
      byteLength: totalByteLength,
      added: changes.added.length,
      unchanged: changes.unchanged.length,
      conflicting: changes.conflicting.length
    },
    changes,
    limitations: clone(source.limitations || []),
    readyToApply: true
  });
}

async function restoreByte(byteStore, entry) {
  const content = decodeBase64(entry.data);
  const parts = entry.path.split('/').filter(Boolean);
  if (parts[0] === 'gummies' && parts.length === 3) {
    const gummyId = decodeURIComponent(parts[1]);
    const separator = parts[2].indexOf('-');
    const revision = parts[2].slice(0, separator);
    const written = await byteStore.writeGummy(gummyId, revision, content);
    if (written.path !== entry.path || written.hash !== entry.sha256) throw new Error(`Restored Gummy bytes changed identity: ${entry.path}`);
    return;
  }
  if (parts[0] === 'gummy-box' && parts[2] === 'artifacts' && parts.length === 4) {
    const written = await byteStore.writeArtifact(decodeURIComponent(parts[1]), parts[3], content);
    if (written.path !== entry.path || written.hash !== entry.sha256) throw new Error(`Restored artifact bytes changed identity: ${entry.path}`);
    return;
  }
  throw new Error(`Unsupported restored byte path: ${entry.path}`);
}

export async function applyBackupPackage({ inspection, repository, byteStore, clock = () => new Date().toISOString() }) {
  if (inspection?.schema !== 'gummy-box-backup-inspection/v1' || inspection.readyToApply !== true) {
    throw new Error('A successful inspect-first result is required');
  }
  for (const entry of inspection.source.bytes) await restoreByte(byteStore, entry);
  const conflictKeys = new Set(inspection.changes.conflicting.map(item => `${item.store}:${item.id}`));
  const unchangedKeys = new Set(inspection.changes.unchanged.map(item => `${item.store}:${item.id}`));
  const conflictEnvelopeIds = new Map();
  for (const item of inspection.changes.conflicting) {
    conflictEnvelopeIds.set(
      `${item.store}:${item.id}`,
      `backup-conflict:${await sha256({ store: item.store, id: item.id, packageHash: inspection.packageHash })}`
    );
  }
  const stores = [...new Set([...Object.keys(inspection.source.records), 'profiles'])];
  await repository.transaction(stores, 'readwrite', async transaction => {
    for (const [store, values] of Object.entries(inspection.source.records)) {
      for (const record of values) {
        const key = `${store}:${record.id}`;
        if (unchangedKeys.has(key)) continue;
        if (conflictKeys.has(key)) {
          const existing = await transaction.objectStore(store).get(record.id);
          const envelopeId = conflictEnvelopeIds.get(key);
          const prior = await transaction.objectStore('profiles').get(envelopeId);
          if (!prior) {
            await transaction.objectStore('profiles').put({
              id: envelopeId,
              schema: 'gummy.backup-conflict/v1',
              store,
              recordId: record.id,
              current: clone(existing),
              imported: clone(record),
              sourcePackageHash: inspection.packageHash,
              resolution: 'preserve-both',
              createdAt: clock()
            });
          }
        } else {
          await transaction.objectStore(store).put(clone(record));
        }
      }
    }
  });
  const receipt = await createReceipt(repository, {
    action: 'import-gummy-box-backup',
    resources: [inspection.boxId, inspection.packageHash],
    outcome: 'completed',
    reversible: true,
    evidence: {
      added: inspection.counts.added,
      unchanged: inspection.counts.unchanged,
      conflictsPreserved: inspection.counts.conflicting
    },
    detail: 'Applied an inspected backup atomically. Unresolved record conflicts were preserved as both current and imported versions.'
  });
  return {
    schema: 'gummy-box-backup-import/v1',
    packageHash: inspection.packageHash,
    counts: clone(inspection.counts),
    receiptId: receipt.id,
    idempotent: inspection.counts.added === 0 && inspection.counts.conflicting === 0
  };
}

export async function recoverLocalBox(repository, { clock = () => new Date().toISOString() } = {}) {
  const recovered = [];
  const unresolved = [];
  const staleLeases = (await repository.all('taskLeases')).filter(lease => (
    ['active', 'claimed'].includes(lease.status) && Date.parse(lease.expiresAt) <= Date.now()
  ));
  for (const lease of staleLeases) {
    await repository.put('taskLeases', {
      ...lease,
      status: 'expired',
      releasedAt: clock(),
      extensions: { ...(lease.extensions || {}), recoveredAtBoot: true }
    }, { validate: false });
    if (lease.scopeHash) await repository.releaseLeaseClaim(lease.scopeHash, lease.id);
    recovered.push(`expired-stale-lease:${lease.id}`);
  }
  const mode = await repository.get('meta', 'preference:mode');
  if (mode && !['night', 'day'].includes(mode.value)) {
    await repository.put('meta', { id: 'preference:mode', value: 'night', recoveredAt: clock() }, { validate: false });
    recovered.push('repaired-corrupt-mode-preference');
  }
  const activeRuns = (await repository.all('productionRuns')).filter(run => ['running', 'active'].includes(run.status));
  for (const run of activeRuns) unresolved.push(`production-run-recovery-required:${run.id}`);
  const report = {
    id: 'recovery:last',
    schema: 'gummy.box-recovery-report/v1',
    recovered,
    unresolved,
    status: unresolved.length ? 'attention-required' : recovered.length ? 'recovered' : 'clean',
    checkedAt: clock()
  };
  await repository.put('meta', report, { validate: false });
  return report;
}

const resetStores = Object.freeze({
  layout: ['meta'],
  workspace: ['workspaces', 'outbox', 'gummies'],
  production: [
    'productions', 'productionParticipants', 'productionConfigurations', 'productionCompositions', 'actorPlans',
    'contextEnvelopes', 'productionRuns', 'actorUpdateProposals', 'dragIntents',
    'workOrders', 'taskLeases', 'grants', 'returns', 'receipts', 'links', 'gummies'
  ],
  box: STORES
});

export async function previewReset(repository, { scope, productionId = null }) {
  if (!resetStores[scope]) throw new Error('Unknown reset scope');
  const records = [];
  for (const store of resetStores[scope]) {
    for (const record of await repository.all(store)) {
      const selected = scope === 'layout'
        ? record.id.startsWith('window:') || record.id.startsWith('preference:')
        : scope === 'workspace'
          ? store === 'outbox' || store === 'workspaces' || (store === 'gummies' && (record.status === 'quarantined' || record.extensions?.disposable === true))
          : scope === 'production'
            ? record.productionId === productionId
              || record.id === productionId
              || record.productionRunId?.includes(productionId?.replace(/^production:/, ''))
            : true;
      if (selected) records.push({ store, id: record.id });
    }
  }
  const confirmation = scope === 'layout'
    ? 'RESET LAYOUT'
    : scope === 'workspace'
      ? 'CLEAR WORKSPACE'
      : scope === 'production'
        ? `REMOVE ${productionId}`
        : 'ERASE LOCAL GUMMY BOX';
  return {
    schema: 'gummy.box-reset-preview/v1',
    scope,
    productionId,
    records,
    count: records.length,
    confirmation,
    backupOffered: true,
    preserves: scope === 'layout'
      ? ['Productions', 'Gummies', 'Returns', 'Receipts']
      : scope === 'workspace'
        ? ['accepted sources', 'accepted results', 'Returns', 'Receipts']
        : scope === 'production'
          ? ['other Productions', 'unrelated Box records']
          : []
  };
}

export async function applyReset(repository, preview, confirmation) {
  if (preview?.schema !== 'gummy.box-reset-preview/v1') throw new Error('Reset preview required');
  if (confirmation !== preview.confirmation) throw new Error(`Type ${preview.confirmation} to confirm`);
  const byStore = new Map();
  for (const item of preview.records) {
    if (!byStore.has(item.store)) byStore.set(item.store, []);
    byStore.get(item.store).push(item.id);
  }
  if (byStore.size) {
    await repository.transaction([...byStore.keys()], 'readwrite', async transaction => {
      for (const [store, ids] of byStore) {
        for (const id of ids) await transaction.objectStore(store).delete(id);
      }
    });
  }
  if (preview.scope === 'box') {
    return {
      schema: 'gummy.box-reset-return/v1',
      result: 'erased',
      removed: preview.count,
      finalReceipt: {
        schema: 'gummy.action-receipt/v0',
        action: 'erase-local-gummy-box',
        outcome: 'completed',
        resources: ['box:hayden'],
        detail: 'Local Gummy Box records were erased after typed confirmation.'
      }
    };
  }
  const receipt = await createReceipt(repository, {
    action: `reset-gummy-box-${preview.scope}`,
    resources: preview.productionId ? [preview.productionId] : [],
    outcome: 'completed',
    reversible: false,
    evidence: { removed: preview.count, preserved: preview.preserves },
    detail: `Applied the exact ${preview.scope} reset preview after explicit confirmation.`
  });
  return { schema: 'gummy.box-reset-return/v1', result: 'completed', removed: preview.count, receiptId: receipt.id };
}
