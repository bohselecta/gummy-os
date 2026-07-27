import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyBackupPackage,
  applyReset,
  BACKUP_SCHEMA,
  createBackupPackage,
  inspectBackupPackage,
  previewReset,
  recoverLocalBox,
  serializeBackupPackage
} from '../src/core/box-backup.js';
import { sha256 } from '../src/core/hash.js';
import { RecordRepository } from '../src/core/repository.js';

class MemoryByteStore {
  constructor() {
    this.files = new Map();
  }

  async writeGummy(gummyId, revision, value) {
    const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
    const hash = await sha256(bytes);
    const path = `/gummies/${encodeURIComponent(gummyId)}/${revision}-${hash}`;
    const prior = this.files.get(path);
    if (prior && await sha256(prior) !== hash) throw new Error('immutable byte collision');
    this.files.set(path, bytes.slice());
    return { path, hash, byteLength: bytes.byteLength };
  }

  async writeArtifact(boxId, name, value) {
    const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
    const hash = await sha256(bytes);
    const path = `/gummy-box/${encodeURIComponent(boxId)}/artifacts/${name}`;
    this.files.set(path, bytes.slice());
    return { path, hash, byteLength: bytes.byteLength };
  }

  async read(path) {
    const value = this.files.get(path);
    if (!value) throw new Error(`missing bytes: ${path}`);
    return value.slice();
  }
}

async function sourceFixture(t) {
  const repository = new RecordRepository({ databaseName: `backup-source-${crypto.randomUUID()}` });
  const byteStore = new MemoryByteStore();
  t.after(() => repository.close());
  const content = '# Restorable Production\nSource bytes survive.';
  const written = await byteStore.writeGummy('gummy:restorable-source', 1, content);
  await repository.put('boxes', {
    id: 'box:hayden',
    schema: 'gummy.box/v0',
    authoritativeLocation: 'Local Gummy Box'
  }, { validate: false });
  await repository.put('productions', {
    id: 'production:restorable',
    schema: 'gummy.production/v0',
    title: 'Restorable Production',
    revision: '1'
  }, { validate: false });
  await repository.put('gummies', {
    id: 'gummy:restorable-source',
    schema: 'gummy.gummy/v0',
    title: 'Restorable source',
    revision: 1,
    hash: { algorithm: 'sha256', value: written.hash },
    content: {
      mediaType: 'text/markdown',
      byteRef: written.path,
      sizeBytes: written.byteLength
    }
  }, { validate: false });
  await repository.put('returns', {
    id: 'return:restorable',
    schema: 'gummy.work-return/v0',
    result: 'completed',
    productionId: 'production:restorable'
  }, { validate: false });
  await repository.put('receipts', {
    id: 'receipt:restorable',
    schema: 'gummy.action-receipt/v0',
    action: 'test-fixture',
    outcome: 'completed',
    createdAt: '2026-07-27T00:00:00.000Z'
  }, { validate: false });
  return { repository, byteStore, content };
}

test('complete backup export inventories records and content-addressed bytes', async t => {
  const source = await sourceFixture(t);
  const backup = await createBackupPackage({
    repository: source.repository,
    byteStore: source.byteStore,
    sourceCommit: '9279d4535aa5f35361b554306ef757a7067d9a37',
    clock: () => '2026-07-27T08:00:00.000Z'
  });
  assert.equal(backup.schema, BACKUP_SCHEMA);
  assert.match(backup.packageHash, /^[a-f0-9]{64}$/);
  assert.equal(backup.records.productions[0].id, 'production:restorable');
  assert.equal(backup.bytes.length, 1);
  assert.equal(backup.bytes[0].sha256, await sha256(source.content));
  assert.ok(!Object.hasOwn(backup.records, 'leaseClaims'));
  assert.ok(!serializeBackupPackage(backup).includes('session_token'));
});

test('inspect-first import restores a complete Box into a clean context and is idempotent', async t => {
  const source = await sourceFixture(t);
  const backup = await createBackupPackage({ repository: source.repository, byteStore: source.byteStore });
  const target = new RecordRepository({ databaseName: `backup-target-${crypto.randomUUID()}` });
  const targetBytes = new MemoryByteStore();
  t.after(() => target.close());
  const inspection = await inspectBackupPackage(serializeBackupPackage(backup), { repository: target });
  assert.equal(inspection.readyToApply, true);
  assert.equal(inspection.counts.conflicting, 0);
  const imported = await applyBackupPackage({ inspection, repository: target, byteStore: targetBytes });
  assert.equal(imported.counts.added > 0, true);
  assert.equal((await target.get('productions', 'production:restorable')).title, 'Restorable Production');
  const gummy = await target.get('gummies', 'gummy:restorable-source');
  assert.equal(new TextDecoder().decode(await targetBytes.read(gummy.content.byteRef)), source.content);
  assert.ok(await target.get('receipts', imported.receiptId));

  const repeatedInspection = await inspectBackupPackage(serializeBackupPackage(backup), { repository: target });
  assert.equal(repeatedInspection.counts.added, 0);
  assert.equal(repeatedInspection.counts.conflicting, 0);
  const repeated = await applyBackupPackage({ inspection: repeatedInspection, repository: target, byteStore: targetBytes });
  assert.equal(repeated.idempotent, true);
});

test('tampering, active content, unsafe paths, and missing inspection fail closed', async t => {
  const source = await sourceFixture(t);
  const backup = await createBackupPackage({ repository: source.repository, byteStore: source.byteStore });
  const tampered = structuredClone(backup);
  tampered.bytes[0].data = btoa('tampered');
  await assert.rejects(() => inspectBackupPackage(JSON.stringify(tampered)), /package hash mismatch/);

  const active = structuredClone(backup);
  active.bytes[0].mediaType = 'text/html';
  const unsigned = structuredClone(active);
  delete unsigned.packageHash;
  active.packageHash = await sha256(unsigned);
  await assert.rejects(() => inspectBackupPackage(JSON.stringify(active)), /Active content/);

  const escaped = structuredClone(backup);
  escaped.bytes[0].path = '/../outside';
  const escapedUnsigned = structuredClone(escaped);
  delete escapedUnsigned.packageHash;
  escaped.packageHash = await sha256(escapedUnsigned);
  await assert.rejects(() => inspectBackupPackage(JSON.stringify(escaped)), /Unsafe backup path/);
  await assert.rejects(() => applyBackupPackage({ inspection: {}, repository: source.repository, byteStore: source.byteStore }), /inspect-first/);
});

test('unresolved sync conflict preserves current and imported versions without overwrite', async t => {
  const source = await sourceFixture(t);
  const backup = await createBackupPackage({ repository: source.repository, byteStore: source.byteStore });
  const target = new RecordRepository({ databaseName: `backup-conflict-${crypto.randomUUID()}` });
  const targetBytes = new MemoryByteStore();
  t.after(() => target.close());
  await target.put('productions', {
    id: 'production:restorable',
    schema: 'gummy.production/v0',
    title: 'Current local version',
    revision: '2'
  }, { validate: false });
  const inspection = await inspectBackupPackage(JSON.stringify(backup), { repository: target });
  assert.deepEqual(inspection.changes.conflicting, [{ store: 'productions', id: 'production:restorable' }]);
  await applyBackupPackage({ inspection, repository: target, byteStore: targetBytes });
  assert.equal((await target.get('productions', 'production:restorable')).title, 'Current local version');
  const conflicts = (await target.all('profiles')).filter(record => record.schema === 'gummy.backup-conflict/v1');
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].current.title, 'Current local version');
  assert.equal(conflicts[0].imported.title, 'Restorable Production');
});

test('recovery expires stale leases and repairs corrupt preferences without erasing evidence', async t => {
  const repository = new RecordRepository({ databaseName: `backup-recovery-${crypto.randomUUID()}` });
  t.after(() => repository.close());
  await repository.put('taskLeases', {
    id: 'lease:stale',
    status: 'active',
    expiresAt: '2020-01-01T00:00:00.000Z',
    scopeHash: 'scope:stale'
  }, { validate: false });
  await repository.put('meta', { id: 'preference:mode', value: 'ultraviolet' }, { validate: false });
  await repository.put('receipts', {
    id: 'receipt:history',
    schema: 'gummy.action-receipt/v0',
    action: 'history',
    createdAt: '2026-01-01T00:00:00.000Z'
  }, { validate: false });
  const report = await recoverLocalBox(repository, { clock: () => '2026-07-27T08:00:00.000Z' });
  assert.equal(report.status, 'recovered');
  assert.equal((await repository.get('taskLeases', 'lease:stale')).status, 'expired');
  assert.equal((await repository.get('meta', 'preference:mode')).value, 'night');
  assert.ok(await repository.get('receipts', 'receipt:history'));
  assert.deepEqual(await recoverLocalBox(repository), {
    ...(await repository.get('meta', 'recovery:last')),
    status: 'clean',
    recovered: [],
    unresolved: []
  });
});

test('reset scopes expose exact preview, typed confirmation, and preservation boundary', async t => {
  const source = await sourceFixture(t);
  await source.repository.put('meta', { id: 'window:guide', x: 10 }, { validate: false });
  await source.repository.put('gummies', {
    id: 'gummy:disposable',
    status: 'quarantined',
    extensions: { disposable: true }
  }, { validate: false });
  const layout = await previewReset(source.repository, { scope: 'layout' });
  assert.equal(layout.confirmation, 'RESET LAYOUT');
  assert.ok(layout.preserves.includes('Productions'));
  await assert.rejects(() => applyReset(source.repository, layout, 'wrong'), /RESET LAYOUT/);
  await applyReset(source.repository, layout, 'RESET LAYOUT');
  assert.equal(await source.repository.get('meta', 'window:guide'), undefined);
  assert.ok(await source.repository.get('productions', 'production:restorable'));

  const workspace = await previewReset(source.repository, { scope: 'workspace' });
  assert.ok(workspace.records.some(item => item.id === 'gummy:disposable'));
  await applyReset(source.repository, workspace, 'CLEAR WORKSPACE');
  assert.equal(await source.repository.get('gummies', 'gummy:disposable'), undefined);
  assert.ok(await source.repository.get('gummies', 'gummy:restorable-source'));
  assert.ok(await source.repository.get('returns', 'return:restorable'));
});
