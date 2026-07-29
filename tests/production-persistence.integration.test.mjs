import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256 as contentSha256 } from '../src/core/hash.js';
import { RecordRepository } from '../src/core/repository.js';
import {
  SERVICE_ACTOR_IDS,
  addActorToProduction,
  addRanchDayRoster,
  compileActorPlan,
  createInitialProductionRuntime,
  createProduction,
  makeProduction,
  saveProductionActorConfiguration
} from '../src/core/production-runtime.js';
import {
  LEGACY_PRODUCTION_STORAGE_KEY,
  PRODUCTION_RUNTIME_INDEX_ID,
  ProductionRuntimeRepository
} from '../src/core/production-repository.js';
import { ensureProductionComposition } from '../src/core/production-composition.js';

class MemoryByteStore {
  constructor() {
    this.files = new Map();
  }

  async writeGummy(gummyId, revision, value) {
    const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
    const digest = await contentSha256(bytes);
    const path = `/gummies/${encodeURIComponent(gummyId)}/${revision}-${digest}`;
    this.files.set(path, bytes.slice());
    return { path, hash: digest, byteLength: bytes.byteLength };
  }

  async read(path) {
    const bytes = this.files.get(path);
    if (!bytes) throw new Error(`Missing test bytes: ${path}`);
    return bytes.slice();
  }
}

test('Production state restarts from IndexedDB and OPFS with isolated configurations and immutable run evidence', async t => {
  const databaseName = `gummy-production-${crypto.randomUUID()}`;
  const byteStore = new MemoryByteStore();
  const legacyValue = JSON.stringify({ productionRuntime: createInitialProductionRuntime() });
  let storageWrites = 0;
  const storage = {
    getItem: key => key === LEGACY_PRODUCTION_STORAGE_KEY ? legacyValue : null,
    setItem: () => { storageWrites += 1; }
  };

  const firstRecords = new RecordRepository({ databaseName });
  let restartedRecords;
  t.after(() => {
    firstRecords.close();
    restartedRecords?.close();
  });
  const first = new ProductionRuntimeRepository({ repository: firstRecords, byteStore, storage });
  let runtime = await first.initialize();
  const migratedIndex = await firstRecords.get('meta', PRODUCTION_RUNTIME_INDEX_ID);
  assert.equal(migratedIndex.authoritativeStore, 'IndexedDB');
  assert.equal(migratedIndex.byteStore, 'OPFS');
  assert.equal(migratedIndex.localStorageRole, 'preferences-and-migration-input-only');
  assert.equal(migratedIndex.migration.importedAsMigrationInput, true);
  assert.equal(migratedIndex.migration.localStorageAuthoritative, false);
  assert.equal(storageWrites, 0);
  assert.equal(storage.getItem(LEGACY_PRODUCTION_STORAGE_KEY), legacyValue);

  const ranch = createProduction(runtime);
  runtime = addRanchDayRoster(ranch.runtime, ranch.production.id, 'mention');
  for (const actorId of SERVICE_ACTOR_IDS) {
    const patch = actorId === 'actor:videoboss' ? { settings: { durationSeconds: 30 } } : {};
    runtime = (await saveProductionActorConfiguration(runtime, ranch.production.id, actorId, patch)).runtime;
  }

  const second = createProduction(runtime, { title: 'Sable Trailer' });
  runtime = addActorToProduction(second.runtime, second.production.id, 'actor:videoboss', 'search').runtime;
  runtime = (await saveProductionActorConfiguration(runtime, second.production.id, 'actor:videoboss', {
    settings: { durationSeconds: 90 }
  })).runtime;

  runtime = compileActorPlan(runtime, ranch.production.id).runtime;
  const composed = ensureProductionComposition(runtime, ranch.production.id);
  runtime = composed.runtime;
  const completed = await makeProduction(runtime, ranch.production.id, { approvedBy: 'human:hayden' });
  assert.equal(completed.denied, undefined);
  await first.persist(completed.runtime);
  await first.flush();
  firstRecords.close();

  restartedRecords = new RecordRepository({ databaseName });
  const restarted = new ProductionRuntimeRepository({ repository: restartedRecords, byteStore, storage });
  const restored = await restarted.initialize();

  const videoConfigs = restored.configurations
    .filter(item => item.actorId === 'actor:videoboss')
    .sort((a, b) => a.productionId.localeCompare(b.productionId));
  assert.equal(videoConfigs.length, 2);
  assert.deepEqual(new Set(videoConfigs.map(item => item.settings.durationSeconds)), new Set([30, 90]));
  assert.notEqual(videoConfigs[0].id, videoConfigs[1].id);
  assert.notEqual(videoConfigs[0].hash, videoConfigs[1].hash);

  const run = restored.productionRuns.find(item => item.productionId === ranch.production.id);
  assert.equal(run.status, 'completed');
  assert.equal(run.frozenPlan.status, 'editable');
  assert.ok(run.frozenConfigurations.length > 0);
  assert.match(run.manifestHash, /^sha256:[a-f0-9]{64}$/);
  assert.ok(run.resultGummyIds.length > 0);
  assert.ok(restored.workOrders.some(item => item.id === run.workOrderIds[0]));
  assert.ok(restored.taskLeases.some(item => item.id === run.taskLeaseIds[0] && item.status === 'completed'));
  assert.ok(restored.grants.some(item => item.id === run.grantIds[0]));
  assert.ok(restored.returns.some(item => run.returnIds.includes(item.id) && item.result === 'completed'));
  assert.ok(restored.receipts.some(item => item.productionRunId === run.id && item.outcome === 'completed'));
  const restoredComposition = restored.compositions.find(item => item.id === composed.composition.id);
  assert.equal(restoredComposition.schema, 'gummy.production-composition/v1');
  assert.equal(restoredComposition.productionId, ranch.production.id);
  assert.ok(restoredComposition.nodes.length > 0);

  const source = restored.gummies.find(item => item.id === 'gummy:ranch-day-source-brief');
  const result = restored.gummies.find(item => run.resultGummyIds.includes(item.id));
  assert.equal(source.hash, 'sha256:d3885600ea886f751a6949b764edc715ea4b3a05f4daa1478fa3091e38054b5e');
  assert.match(source.content, /^# Ranch Day/);
  assert.equal(result.status, 'result');
  assert.ok(result.content.length > 0);
  assert.equal(storageWrites, 0);
});
