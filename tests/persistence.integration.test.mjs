import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, LEGACY_STORAGE_KEY, loadState, migrateState, saveState, STORAGE_KEY } from '../src/core/state.js';
import {
  addRanchDayRoster,
  compileActorPlan,
  createProduction,
  makeProduction,
  revokeActorRelationship,
  saveProductionActorConfiguration
} from '../src/core/production-runtime.js';

class MemoryStorage {
  #items = new Map();
  getItem(key) { return this.#items.get(key) ?? null; }
  setItem(key, value) { this.#items.set(key, String(value)); }
  removeItem(key) { this.#items.delete(key); }
  clear() { this.#items.clear(); }
}

async function completedPersistedState() {
  let state = migrateState(defaultState);
  const created = createProduction(state.productionRuntime);
  let runtime = addRanchDayRoster(created.runtime, created.production.id);
  for (const actorId of ['actor:imagehoss', 'actor:3d-bee', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage']) {
    runtime = (await saveProductionActorConfiguration(runtime, created.production.id, actorId, {})).runtime;
  }
  runtime = compileActorPlan(runtime, created.production.id).runtime;
  runtime = (await makeProduction(runtime, created.production.id, { approvedBy: 'human:hayden' })).runtime;
  runtime = revokeActorRelationship(runtime, 'link:hoyt-videoboss-private-family').runtime;
  return { ...state, productionRuntime: runtime };
}

test('browser-origin persistence restores Production, configuration, plan, Run, outputs, evidence, and revocation', async () => {
  globalThis.localStorage = new MemoryStorage();
  const state = await completedPersistedState();
  saveState(state);
  const restored = loadState();
  const runtime = restored.productionRuntime;
  assert.equal(runtime.productions[0].id, 'production:ranch-day');
  assert.equal(runtime.participants.length, 7);
  assert.equal(runtime.configurations.filter(item => item.readiness === 'ready').length, 5);
  assert.equal(runtime.actorPlans.length, 1);
  assert.equal(runtime.productionRuns[0].status, 'completed');
  assert.equal(runtime.productionRuns[0].resultGummyIds.length, 5);
  assert.equal(runtime.returns.length, 5);
  assert.ok(runtime.receipts.length >= 1);
  assert.equal(runtime.relationships[0].status, 'revoked');
});

test('serialized origin state restores in a fresh storage object without state collision', async () => {
  globalThis.localStorage = new MemoryStorage();
  const state = await completedPersistedState();
  saveState(state);
  const transfer = localStorage.getItem(STORAGE_KEY);
  globalThis.localStorage = new MemoryStorage();
  localStorage.setItem(STORAGE_KEY, transfer);
  const restored = loadState();
  const videoConfig = restored.productionRuntime.configurations.find(item => item.productionId === 'production:ranch-day' && item.actorId === 'actor:videoboss');
  assert.equal(videoConfig.settings.durationSeconds, 30);
  assert.equal(restored.productionRuntime.actorDefaults['actor:videoboss'], undefined);
  assert.equal(restored.productionRuntime.productionRuns.length, 1);
});

test('legacy v0.1 state migrates once into v0.2 while leaving legacy bytes available', () => {
  globalThis.localStorage = new MemoryStorage();
  const legacyRaw = JSON.stringify({
    snack: { id: 'snack:legacy', name: 'Legacy', handle: '@legacy' },
    files: [{ id: 'file:legacy', content: 'byte-identical legacy state' }]
  });
  localStorage.setItem(LEGACY_STORAGE_KEY, legacyRaw);
  const migrated = loadState();
  assert.equal(migrated.files[0].content, 'byte-identical legacy state');
  assert.equal(migrated.stateVersion, 2);
  assert.ok(localStorage.getItem(STORAGE_KEY));
  assert.equal(localStorage.getItem(LEGACY_STORAGE_KEY), legacyRaw);
});
