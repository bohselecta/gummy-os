import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addRanchDayRoster,
  createInitialProductionRuntime,
  createProduction
} from '../src/core/production-runtime.js';
import {
  clarifyPrivateReferenceContext,
  isReferenceGummy,
  isReferenceOnlyActor,
  isReferenceProduction,
  REFERENCE_CONTEXT_MIGRATION_ID
} from '../src/core/reference-context.js';

test('Hoyt is preserved as an archived project reference, not the current Human', () => {
  const clarified = clarifyPrivateReferenceContext(createInitialProductionRuntime());
  const hoyt = clarified.runtime.actors.find(actor => actor.id === 'actor:hoyt');
  assert.equal(hoyt.name, 'Hoyt — Ranch Day reference');
  assert.equal(hoyt.kind, 'project-role');
  assert.equal(hoyt.status, 'archived');
  assert.deepEqual(hoyt.humanAuthorityIds, []);
  assert.equal(hoyt.extensions.referenceContext.currentHuman, false);
  assert.equal(hoyt.extensions.referenceContext.defaultIdentity, false);
  assert.equal(isReferenceOnlyActor(hoyt), true);

  const hayden = clarified.runtime.actors.find(actor => actor.id === 'actor:hayden');
  assert.equal(isReferenceOnlyActor(hayden), false);
  assert.equal(hayden.status, 'active');
});

test('Ranch Day and its sources remain preserved but clearly labeled private references', () => {
  let runtime = createInitialProductionRuntime();
  const created = createProduction(runtime);
  runtime = addRanchDayRoster(created.runtime, created.production.id, 'reference-fixture');
  const clarified = clarifyPrivateReferenceContext(runtime);
  const ranch = clarified.runtime.productions.find(production => production.id === 'production:ranch-day');
  assert.equal(ranch.title, 'Ranch Day — private reference');
  assert.match(ranch.description, /not the current workspace or a default user account/i);
  assert.equal(ranch.status, 'completed');
  assert.equal(isReferenceProduction(ranch), true);
  assert.ok(ranch.participantIds.length > 1, 'reference participants must be preserved');

  const ranchBrief = clarified.runtime.gummies.find(gummy => gummy.id === 'gummy:ranch-day-source-brief');
  const hoytReference = clarified.runtime.gummies.find(gummy => gummy.id === 'gummy:hoyt-likeness-approved');
  assert.equal(ranchBrief.name, 'Saved reference · Ranch Day brief.md');
  assert.equal(hoytReference.name, 'Saved private reference · Hoyt (Ranch Day)');
  assert.equal(isReferenceGummy(ranchBrief), true);
  assert.equal(isReferenceGummy(hoytReference), true);
});

test('reference clarification is idempotent and records one migration entry', () => {
  const first = clarifyPrivateReferenceContext(createInitialProductionRuntime());
  assert.equal(first.changed, true);
  const second = clarifyPrivateReferenceContext(first.runtime);
  assert.equal(second.changed, false);
  assert.equal(second.runtime.migrationLog.filter(item => item.id === REFERENCE_CONTEXT_MIGRATION_ID).length, 1);
});
