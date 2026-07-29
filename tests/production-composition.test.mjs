import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  addCompositionNode,
  applyProductionComposition,
  connectCompositionNodes,
  createProductionComposition,
  disconnectCompositionEdge,
  duplicateCompositionNode,
  duplicateProductionComposition,
  ensureProductionComposition,
  moveCompositionNode,
  moveCompositionNodeToLane,
  removeCompositionNode,
  replaceCompositionFromSnapshot
} from '../src/core/production-composition.js';
import {
  addNightGummyLaunchRoster,
  createDragIntent,
  createInitialProductionRuntime,
  createProduction
} from '../src/core/production-runtime.js';

function linkedRuntime() {
  const created = createProduction(createInitialProductionRuntime(), {
    id: 'production:composition-test',
    title: 'Composition Test',
    sourceGummyIds: ['gummy:night-gummy-launch-brief']
  });
  return {
    productionId: created.production.id,
    runtime: addNightGummyLaunchRoster(created.runtime, created.production.id, 'test')
  };
}

test('production composition contract is versioned and includes the durable Human representation fields', async () => {
  const schema = JSON.parse(await readFile(new URL('../schemas/production-composition.schema.json', import.meta.url)));
  assert.equal(schema.properties.schema.const, 'gummy.production-composition/v1');
  for (const field of ['id', 'title', 'revision', 'ownerActorId', 'nodes', 'edges', 'sourceObjects', 'destinationPlans', 'readiness', 'provenance', 'updatedAt']) {
    assert.ok(schema.required.includes(field), field);
  }
  assert.ok(schema.properties.nodes.items.properties.ref.properties.kind.enum.includes('composition'));
});

test('Composer edits add, move, reorder, duplicate, connect, disconnect, remove, undo, and duplicate durable state', () => {
  const created = createProductionComposition(createInitialProductionRuntime(), { title: 'Blank visual proposal' });
  let runtime = created.runtime;
  const compositionId = created.composition.id;
  const before = structuredClone(created.composition);

  runtime = addCompositionNode(runtime, compositionId, {
    ref: { kind: 'gummy', id: 'gummy:night-gummy-launch-brief', revision: '1', hash: 'sha256:test' },
    label: 'Launch brief',
    description: 'Visible source',
    lane: 'inputs',
    availability: { state: 'available', reason: 'Local' }
  }).runtime;
  runtime = addCompositionNode(runtime, compositionId, {
    ref: { kind: 'actor', id: 'actor:imagehoss' },
    label: 'ImageHoss',
    description: 'Image specialist',
    lane: 'people-tools',
    availability: { state: 'available', reason: 'Configurable' }
  }).runtime;
  let composition = runtime.compositions.find(item => item.id === compositionId);
  const [source, actor] = composition.nodes;

  runtime = connectCompositionNodes(runtime, compositionId, {
    fromNodeId: source.id,
    toNodeId: actor.id,
    edgeType: 'input',
    dataClasses: ['text/markdown'],
    approvalRule: 'Human approval required'
  }).runtime;
  composition = runtime.compositions.find(item => item.id === compositionId);
  assert.equal(composition.edges.length, 1);

  runtime = moveCompositionNodeToLane(runtime, compositionId, source.id, 'steps-connections').runtime;
  runtime = duplicateCompositionNode(runtime, compositionId, actor.id).runtime;
  composition = runtime.compositions.find(item => item.id === compositionId);
  const actorCopy = composition.nodes.find(item => item.label.endsWith('copy'));
  runtime = moveCompositionNode(runtime, compositionId, actorCopy.id, 'before').runtime;
  composition = runtime.compositions.find(item => item.id === compositionId);
  assert.equal(
    composition.nodes
      .filter(item => item.lane === 'people-tools')
      .sort((left, right) => left.position.order - right.position.order)[0].id,
    actorCopy.id
  );

  runtime = disconnectCompositionEdge(runtime, compositionId, composition.edges[0].id).runtime;
  runtime = removeCompositionNode(runtime, compositionId, actorCopy.id).runtime;
  assert.equal(runtime.compositions.find(item => item.id === compositionId).edges.length, 0);

  runtime = replaceCompositionFromSnapshot(runtime, compositionId, before).runtime;
  assert.equal(runtime.compositions.find(item => item.id === compositionId).nodes.length, 0);

  const duplicated = duplicateProductionComposition(runtime, compositionId);
  assert.notEqual(duplicated.composition.id, compositionId);
  assert.equal(duplicated.composition.productionId, null);
  assert.equal(duplicated.executed, false);
});

test('pointer, keyboard, and touch Composer adds create semantically equivalent typed proposals', () => {
  const created = createProductionComposition(createInitialProductionRuntime());
  const values = {
    sourceKind: 'gummy',
    sourceId: 'gummy:night-gummy-launch-brief',
    targetKind: 'lane',
    targetId: 'inputs',
    action: 'composition-add',
    dataClasses: ['box', 'inputs']
  };
  const intents = ['pointer', 'keyboard', 'touch'].map(inputMode => (
    createDragIntent(created.runtime, { ...values, inputMode }).intent
  ));
  for (const intent of intents) {
    assert.equal(intent.proposedRelation, 'composition-add');
    assert.deepEqual(intent.source, intents[0].source);
    assert.deepEqual(intent.target, intents[0].target);
    assert.deepEqual(intent.dataClasses, intents[0].dataClasses);
    assert.equal(intent.startsExecution, false);
    assert.equal(intent.grantsAuthority, false);
  }
  assert.deepEqual(intents.map(item => item.inputMode), ['pointer', 'keyboard', 'touch']);
});

test('applying a composition revises configuration and Actor Plan without creating execution or acceptance inventory', () => {
  const linked = linkedRuntime();
  const ensured = ensureProductionComposition(linked.runtime, linked.productionId);
  const before = {
    runs: ensured.runtime.productionRuns.length,
    workOrders: ensured.runtime.workOrders.length,
    leases: ensured.runtime.taskLeases.length,
    grants: ensured.runtime.grants.length,
    returns: ensured.runtime.returns.length,
    traces: ensured.runtime.executionTraces.length,
    accepted: ensured.runtime.gummies.filter(item => item.status === 'accepted').length
  };
  const applied = applyProductionComposition(ensured.runtime, ensured.composition.id);
  assert.equal(applied.denied, undefined);
  assert.equal(applied.executed, false);
  assert.equal(applied.executionInventoryUnchanged, true);
  assert.equal(applied.composition.linkedActorPlan.id, applied.plan.id);
  assert.equal(applied.plan.status, 'editable');
  assert.deepEqual({
    runs: applied.runtime.productionRuns.length,
    workOrders: applied.runtime.workOrders.length,
    leases: applied.runtime.taskLeases.length,
    grants: applied.runtime.grants.length,
    returns: applied.runtime.returns.length,
    traces: applied.runtime.executionTraces.length,
    accepted: applied.runtime.gummies.filter(item => item.status === 'accepted').length
  }, before);
});

test('an unavailable destination remains a visible plan and cannot execute', () => {
  const linked = linkedRuntime();
  let ensured = ensureProductionComposition(linked.runtime, linked.productionId);
  ensured = addCompositionNode(ensured.runtime, ensured.composition.id, {
    ref: { kind: 'destination', id: 'destination:channels' },
    label: 'Prepare for Channels',
    description: 'Remote service is not connected',
    lane: 'destinations',
    availability: { state: 'planned', reason: 'No authenticated service connection.' }
  });
  const composition = ensured.runtime.compositions.find(item => item.id === ensured.composition.id);
  assert.equal(composition.destinationPlans.find(item => item.type === 'channels').status, 'blocked');
  assert.match(composition.readiness.warnings.join(' '), /planned and cannot execute/);
  const applied = applyProductionComposition(ensured.runtime, composition.id);
  assert.equal(applied.executed, false);
  assert.equal(applied.runtime.productionRuns.length, 0);
  assert.equal(applied.runtime.distributionPlans.length, 0);
});
