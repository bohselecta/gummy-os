import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { ByteStore, ByteStoreError } from '../src/core/byte-store.js';

function store() {
  return new ByteStore({
    storage: {},
    indexedDBFactory: globalThis.indexedDB,
    fallbackDatabaseName: `gummy-byte-test-${crypto.randomUUID()}`
  });
}

test('IndexedDB fallback preserves Gummy bytes when OPFS is unavailable', async () => {
  const bytes = new TextEncoder().encode('portable local bytes');
  const byteStore = store();
  const written = await byteStore.writeGummy('gummy:portable', 1, bytes);
  assert.equal(written.storageClass, 'indexeddb');
  assert.equal(written.byteLength, bytes.byteLength);
  assert.deepEqual(await byteStore.read(written.path), bytes);

  assert.equal(await byteStore.delete(written.path), true);
  await assert.rejects(
    () => byteStore.read(written.path),
    error => error instanceof ByteStoreError && error.code === 'not-found'
  );
});

test('IndexedDB fallback preserves artifacts through the same Local Gummy Box API', async () => {
  const byteStore = store();
  const written = await byteStore.writeArtifact('box:hayden', 'result.json', '{"ok":true}');
  assert.equal(written.storageClass, 'indexeddb');
  assert.equal(new TextDecoder().decode(await byteStore.read(written.path)), '{"ok":true}');
});

test('ByteStore reports a truthful unsupported state only when both stores are absent', async () => {
  const byteStore = new ByteStore({ storage: {}, indexedDBFactory: null });
  await assert.rejects(
    () => byteStore.writeGummy('gummy:none', 1, 'no storage'),
    error => error instanceof ByteStoreError && error.code === 'unsupported'
  );
});
