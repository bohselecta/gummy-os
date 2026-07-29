import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { ByteStore } from '../src/core/byte-store.js';
import { ProductionRuntimeRepository, PRODUCTION_RUNTIME_INDEX_ID } from '../src/core/production-repository.js';
import { RecordRepository } from '../src/core/repository.js';

function harness() {
  const suffix = crypto.randomUUID();
  const repository = new RecordRepository({ databaseName: `gummy-production-fallback-${suffix}` });
  const byteStore = new ByteStore({
    storage: {},
    indexedDBFactory: globalThis.indexedDB,
    fallbackDatabaseName: `gummy-production-bytes-${suffix}`
  });
  const productionRepository = new ProductionRuntimeRepository({ repository, byteStore, storage: null });
  return { repository, byteStore, productionRepository };
}

test('Production runtime records IndexedDB rather than claiming OPFS when fallback is active', async () => {
  const { repository, byteStore, productionRepository } = harness();
  const runtime = await productionRepository.initialize();
  await productionRepository.flush();
  const index = await repository.get('meta', PRODUCTION_RUNTIME_INDEX_ID);
  assert.equal(byteStore.storageClass, 'indexeddb');
  assert.equal(index.byteStore, 'IndexedDB');
  assert.match(index.byteStoreFallback, /OPFS is unavailable/);
  assert.ok(runtime.gummies.length > 0);
  repository.close();
});
