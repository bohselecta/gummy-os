import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acceptProductionResult,
  addNightGummyLaunchRoster,
  compileActorPlan,
  createDeltaRevision,
  createInitialProductionRuntime,
  createProduction,
  makeProduction,
  saveProductionActorConfiguration
} from '../src/core/production-runtime.js';

async function completedLaunch() {
  let runtime = createInitialProductionRuntime();
  const created = createProduction(runtime, {
    id: 'production:night-gummy-launch',
    title: 'Night Gummy Launch',
    description: 'Safe repository-owned launch sample',
    audience: 'public-launch',
    sourceGummyIds: ['gummy:night-gummy-launch-brief', 'gummy:night-gummy-launch-brand-kit']
  });
  runtime = addNightGummyLaunchRoster(created.runtime, created.production.id);
  for (const actorId of ['actor:imagehoss', 'actor:3d-bee', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage']) {
    runtime = (await saveProductionActorConfiguration(runtime, created.production.id, actorId, {})).runtime;
  }
  runtime = compileActorPlan(runtime, created.production.id).runtime;
  const completed = await makeProduction(runtime, created.production.id, { approvedBy: 'human:hayden' });
  return completed;
}

test('Night Gummy Launch completes deterministically without private-person context', async () => {
  const completed = await completedLaunch();
  assert.equal(completed.run.status, 'completed');
  assert.equal(completed.results.length, 5);
  assert.equal(completed.run.policy.audience, 'public-launch');
  assert.equal(completed.runtime.participants.some(item => (
    item.productionId === 'production:night-gummy-launch' && item.actorId === 'actor:hoyt'
  )), false);
  const videoEnvelope = completed.runtime.contextEnvelopes.find(item => (
    item.productionRunId === completed.run.id && item.targetActorId === 'actor:videoboss'
  ));
  assert.deepEqual(videoEnvelope.relationshipLinkIds, []);
  assert.deepEqual(videoEnvelope.contextRefs.sort(), [
    'gummy:night-gummy-launch-brand-kit',
    'gummy:night-gummy-launch-brief'
  ]);
  assert.ok(videoEnvelope.excludes.includes('complete-actor-memory'));
  assert.ok(videoEnvelope.forbiddenActions.includes('unapproved-actor-context'));
  assert.equal(completed.runtime.returns.filter(item => completed.run.returnIds.includes(item.id)).length, 5);
  assert.equal(completed.runtime.receipts.filter(item => completed.run.receiptIds.includes(item.id)).length, 5);
});

test('role acceptance and keep-everything-except revision preserve immutable evidence', async () => {
  const completed = await completedLaunch();
  const image = completed.results.find(item => item.creatorActorId === 'actor:imagehoss');
  const accepted = acceptProductionResult(completed.runtime, {
    productionId: 'production:night-gummy-launch',
    resultGummyId: image.id,
    role: 'launch-image'
  });
  assert.equal(accepted.acceptance.sourceHash, image.hash);
  assert.equal(accepted.result.status, 'accepted');
  assert.equal(accepted.link.relation, 'accepted-as');

  const frozenRun = structuredClone(accepted.runtime.productionRuns[0]);
  const revised = createDeltaRevision(accepted.runtime, 'production:night-gummy-launch', {
    except: 'motion pacing',
    note: 'Make the reveal calmer.'
  });
  assert.equal(revised.delta.instruction, 'Keep everything except motion pacing.');
  assert.deepEqual(revised.delta.carryForwardAcceptedLocks, [{
    resultGummyId: image.id,
    role: 'launch-image',
    hash: image.hash
  }]);
  assert.deepEqual(revised.runtime.productionRuns[0], frozenRun);
  assert.match(revised.receipt.summary, /no work executed/i);
});
