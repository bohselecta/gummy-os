import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { RecordRepository } from '../src/core/repository.js';
import { LocalPlaceStore, PLACE_EXPORT_SCHEMA } from '../src/places/local-place-store.js';

function scope(overrides = {}) {
  return {
    placeId: 'app:gummy-wardrobe',
    ownerActorId: 'actor:hayden',
    contextType: 'personal',
    contextId: 'actor:hayden',
    ...overrides
  };
}

function store() {
  let index = 0;
  return new LocalPlaceStore(
    new RecordRepository({ databaseName: `phase15-${crypto.randomUUID()}` }),
    {
      clock: () => `2026-07-28T15:00:${String(index++).padStart(2, '0')}.000Z`,
      idFactory: () => `id-${index++}`
    }
  );
}

test('local Place records persist with optimistic revisions and operation receipts', async () => {
  const local = store();
  const created = await local.put(scope(), 'item', 'jacket', { name: 'Gold work jacket', owned: true });
  assert.equal(created.record.revision, 1);
  assert.equal(created.receipt.executedLocally, true);
  assert.equal(created.receipt.externalExecution, false);

  const updated = await local.put(scope(), 'item', 'jacket', { name: 'Gold work jacket', owned: true, state: 'available' }, { expectedRevision: 1 });
  assert.equal(updated.record.revision, 2);
  await assert.rejects(
    () => local.put(scope(), 'item', 'jacket', { name: 'Stale overwrite' }, { expectedRevision: 1 }),
    error => error.evidence.code === 'revision-conflict'
  );
  assert.equal((await local.receipts(scope())).length, 2);
  local.repository.close();
});

test('Place state is isolated by Place and context', async () => {
  const local = store();
  await local.put(scope(), 'item', 'shirt', { name: 'Purple shirt', owned: true });
  await local.put(scope({ contextType: 'production', contextId: 'production:event' }), 'outfit', 'event-look', { itemIds: ['shirt'] });
  await local.put(scope({ placeId: 'app:gummy-house' }), 'room', 'front-room', { title: 'Front room' });

  assert.equal((await local.list(scope())).length, 1);
  assert.equal((await local.list(scope({ contextType: 'production', contextId: 'production:event' }))).length, 1);
  assert.equal((await local.list(scope({ placeId: 'app:gummy-house' }))).length, 1);
  assert.equal((await local.list(scope({ contextId: 'actor:someone-else' }))).length, 0);
  local.repository.close();
});

test('Place export is scoped, importable, and contains no unrelated context', async () => {
  const local = store();
  await local.put(scope(), 'item', 'jacket', { name: 'Gold work jacket', owned: true });
  await local.put(scope({ contextId: 'actor:someone-else' }), 'item', 'private-item', { name: 'Other person item', owned: true });

  const exported = await local.exportPackage(scope());
  assert.equal(exported.schema, PLACE_EXPORT_SCHEMA);
  assert.equal(exported.records.length, 1);
  assert.equal(exported.records[0].recordId, 'jacket');

  const importedScope = scope({ contextType: 'production', contextId: 'production:trip' });
  const imported = await local.importPackage(importedScope, exported);
  assert.equal(imported.count, 1);
  assert.equal((await local.list(importedScope))[0].value.name, 'Gold work jacket');
  local.repository.close();
});

test('Place reset removes only the selected context and preserves receipts', async () => {
  const local = store();
  await local.put(scope(), 'item', 'jacket', { name: 'Gold work jacket', owned: true });
  await local.put(scope({ placeId: 'app:gummy-house' }), 'room', 'front-room', { title: 'Front room' });

  const reset = await local.reset(scope());
  assert.equal(reset.count, 1);
  assert.equal((await local.list(scope())).length, 0);
  assert.equal((await local.list(scope({ placeId: 'app:gummy-house' }))).length, 1);
  assert.ok((await local.receipts(scope())).some(receipt => receipt.operation === 'context.reset'));
  local.repository.close();
});

test('Place records reject secret-bearing fields', async () => {
  const local = store();
  await assert.rejects(
    () => local.put(scope(), 'item', 'bad', { name: 'Bad record', apiKey: 'never-store-this' }),
    error => error.evidence.code === 'secret-field'
  );
  local.repository.close();
});
