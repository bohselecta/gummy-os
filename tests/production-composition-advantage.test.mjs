import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMPOSITION_STARTERS,
  addCompositionReference,
  analyzeProductionComposition,
  applyCompositionStarter,
  createProductionComposition,
  updateProductionCompositionBrief
} from '../src/core/production-composition.js';

function runtime() {
  return {
    actors: [
      { id: 'actor:hayden', name: 'Hayden', kind: 'person' },
      { id: 'actor:glopper', name: 'Glopper', kind: 'service', role: 'Companion' },
      { id: 'actor:imagehoss', name: 'ImageHoss', kind: 'service', role: 'Visual direction' },
      { id: 'actor:videoboss', name: 'VideoBoss', kind: 'service', role: 'Video production' },
      { id: 'actor:3d-bee', name: 'Meshmallow', kind: 'service', role: '3D execution' }
    ],
    gummies: [{
      id: 'gummy:brief',
      title: 'Project brief',
      kind: 'source',
      revision: 1,
      hash: { value: 'a'.repeat(64) }
    }],
    productions: [],
    participants: [],
    actorAppDescriptors: [],
    actorPlans: [],
    configurations: [],
    compositions: [],
    dragIntents: [],
    links: [],
    receipts: [],
    productionRuns: [],
    workOrders: [],
    taskLeases: [],
    grants: [],
    returns: [],
    executionTraces: [],
    distributionPlans: [],
    masterControlDecisions: [],
    productionPools: []
  };
}

test('starter patterns create editable, non-executing compositions with Human review and destinations', () => {
  assert.equal(COMPOSITION_STARTERS.length, 5);
  const result = applyCompositionStarter(runtime(), { starterId: 'video-release' });
  assert.equal(result.executed, false);
  assert.equal(result.composition.brief.goal.includes('video'), true);
  assert.ok(result.composition.nodes.some(node => node.ref.id === 'actor:imagehoss'));
  assert.ok(result.composition.nodes.some(node => node.ref.id === 'actor:videoboss'));
  assert.ok(result.composition.nodes.some(node => node.ref.id === 'review-gate:human-acceptance'));
  assert.ok(result.composition.nodes.some(node => node.ref.id === 'destination:gummy-box'));
  assert.ok(result.composition.nodes.some(node => node.ref.id === 'destination:channels' && node.availability.state === 'planned'));
  assert.equal(result.runtime.productionRuns.length, 0);
  assert.equal(result.runtime.workOrders.length, 0);
  assert.equal(result.runtime.grants.length, 0);
  assert.equal(result.receipt.action, 'production-composition.starter-applied');
  assert.equal(result.receipt.cost.amount, 0);
});

test('a starter pattern preserves an existing Human brief and records the proposal change', () => {
  const created = createProductionComposition(runtime(), { title: 'Human-defined work' });
  const briefed = updateProductionCompositionBrief(created.runtime, created.composition.id, {
    goal: 'Prepare a cited launch brief',
    audience: 'Founding collaborators',
    successCriteria: 'Every claim resolves to an approved source',
    constraints: 'No publication and no private source leakage'
  });
  const patterned = applyCompositionStarter(briefed.runtime, {
    compositionId: briefed.composition.id,
    starterId: 'research-brief'
  });
  assert.equal(patterned.composition.brief.goal, 'Prepare a cited launch brief');
  assert.equal(patterned.composition.brief.audience, 'Founding collaborators');
  assert.equal(patterned.composition.brief.constraints.includes('No publication'), true);
  assert.equal(patterned.composition.brief.starterId, 'research-brief');
  assert.equal(patterned.receipt.summary.includes('Human brief was preserved'), true);
  const analysis = analyzeProductionComposition(patterned.composition, patterned.runtime);
  assert.equal(analysis.authority, 'proposal-only');
  assert.equal(analysis.executionState, 'not-started');
  assert.equal(analysis.nextMoves.some(item => item.id === 'define-goal'), false);
});

test('external canonical references create accepted typed intents, deduplicate, and do not execute', () => {
  const started = applyCompositionStarter(runtime(), { starterId: 'research-brief' });
  const first = addCompositionReference(started.runtime, started.composition.id, {
    kind: 'production',
    id: 'production:another',
    label: 'Another Production',
    description: 'A linked undertaking.',
    lane: 'inputs'
  });
  const second = addCompositionReference(first.runtime, started.composition.id, {
    kind: 'production',
    id: 'production:another',
    label: 'Another Production',
    description: 'A linked undertaking.',
    lane: 'inputs'
  });
  const canonical = second.runtime.compositions.find(item => item.id === started.composition.id);
  assert.equal(canonical.nodes.filter(node => node.ref.id === 'production:another').length, 1);
  assert.equal(second.intent.status, 'accepted');
  assert.equal(second.intent.startsExecution, false);
  assert.equal(second.intent.grantsAuthority, false);
  assert.equal(second.runtime.productionRuns.length, 0);
  assert.equal(second.runtime.receipts.some(receipt => receipt.action?.includes('run')), false);
});
