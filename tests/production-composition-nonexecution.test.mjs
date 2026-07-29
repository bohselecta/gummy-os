import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addCompositionNode,
  addCompositionReference,
  addCompositionReferenceWithIntent,
  addRecommendedCompositionElement,
  applyCompositionStarter,
  applyProductionComposition,
  bindCompositionToProduction,
  connectCompositionNodes,
  createProductionComposition,
  disconnectCompositionEdge,
  duplicateCompositionNode,
  duplicateProductionComposition,
  ensureProductionComposition,
  moveCompositionNode,
  moveCompositionNodeToLane,
  projectCompositionReadiness,
  removeCompositionNode,
  renameProductionComposition,
  replaceCompositionFromSnapshot,
  toggleCompositionBranch,
  updateProductionCompositionBrief
} from '../src/core/production-composition.js';
import {
  addNightGummyLaunchRoster,
  createInitialProductionRuntime,
  createProduction
} from '../src/core/production-runtime.js';

function executionInventory(runtime) {
  return {
    productionRuns: structuredClone(runtime.productionRuns || []),
    workOrders: structuredClone(runtime.workOrders || []),
    taskLeases: structuredClone(runtime.taskLeases || []),
    grants: structuredClone(runtime.grants || []),
    returns: structuredClone(runtime.returns || []),
    executionTraces: structuredClone(runtime.executionTraces || []),
    acceptedResults: structuredClone((runtime.gummies || []).filter(item => item.acceptance || item.status === 'accepted')),
    releasedDistributionPlans: structuredClone((runtime.distributionPlans || []).filter(item => (
      item.status === 'released' || item.status === 'published'
    )))
  };
}

function assertNonExecuting(name, beforeRuntime, result) {
  assert.equal(result.executed, false, `${name} must explicitly report executed: false`);
  assert.deepEqual(
    executionInventory(result.runtime),
    executionInventory(beforeRuntime),
    `${name} must leave all execution, acceptance, and release inventory unchanged`
  );
  return result;
}

function linkedRuntime() {
  const created = createProduction(createInitialProductionRuntime(), {
    id: 'production:composer-nonexecution',
    title: 'Composer Non-Execution',
    sourceGummyIds: ['gummy:night-gummy-launch-brief']
  });
  return {
    productionId: created.production.id,
    runtime: addNightGummyLaunchRoster(created.runtime, created.production.id, 'test')
  };
}

test('every exported Composer mutation path explicitly reports non-execution and preserves execution inventory', () => {
  const linked = linkedRuntime();
  let runtime = linked.runtime;
  const run = (name, operation) => {
    const before = runtime;
    const result = assertNonExecuting(name, before, operation(before));
    runtime = result.runtime;
    return result;
  };

  const created = run('create', value => createProductionComposition(value, {
    id: 'composition:composer-nonexecution',
    title: 'Composer Non-Execution',
    productionId: linked.productionId
  }));
  const compositionId = created.composition.id;
  run('ensure existing', value => ensureProductionComposition(value, linked.productionId));
  run('rename', value => renameProductionComposition(value, compositionId, 'Bounded Composer Proposal'));
  run('bind', value => bindCompositionToProduction(value, compositionId, linked.productionId));
  run('brief', value => updateProductionCompositionBrief(value, compositionId, {
    goal: 'Prepare a private cited brief',
    audience: 'Human owner',
    successCriteria: 'The Human can inspect and accept an exact revision',
    constraints: 'No execution or publication'
  }));
  run('add canonical reference', value => addCompositionReference(value, compositionId, {
    kind: 'gummy',
    id: 'gummy:external-content-addressed',
    revision: '7',
    hash: `sha256:${'a'.repeat(64)}`,
    label: 'External content-addressed source',
    lane: 'inputs'
  }));
  run('add canonical reference with intent', value => addCompositionReferenceWithIntent(value, compositionId, {
    kind: 'shared-vision',
    id: 'shared-vision:bounded-reference',
    revision: '2',
    hash: `sha256:${'b'.repeat(64)}`,
    label: 'Bounded Shared Vision',
    lane: 'inputs'
  }, { inputMode: 'touch' }));
  const added = run('add node', value => addCompositionNode(value, compositionId, {
    ref: { kind: 'place', id: 'place:local-review' },
    label: 'Local review place',
    description: 'A local proposal surface.',
    lane: 'steps-connections',
    availability: { state: 'available', reason: 'Available locally.' }
  }));
  run('move to lane', value => moveCompositionNodeToLane(
    value,
    compositionId,
    added.node.id,
    'people-tools'
  ));
  const duplicatedNode = run('duplicate node', value => duplicateCompositionNode(
    value,
    compositionId,
    added.node.id
  ));
  run('reorder node', value => moveCompositionNode(
    value,
    compositionId,
    duplicatedNode.node.id,
    'before'
  ));
  const current = runtime.compositions.find(item => item.id === compositionId);
  const reviewNode = current.nodes.find(node => node.lane === 'review-approval');
  const connected = run('connect', value => connectCompositionNodes(value, compositionId, {
    fromNodeId: duplicatedNode.node.id,
    toNodeId: reviewNode.id,
    edgeType: 'review',
    dataClasses: ['proposal-only'],
    approvalRule: 'Human review required'
  }));
  run('toggle branch', value => toggleCompositionBranch(value, compositionId, connected.edge.id));
  run('disconnect', value => disconnectCompositionEdge(value, compositionId, connected.edge.id));
  run('remove node', value => removeCompositionNode(value, compositionId, duplicatedNode.node.id));
  const snapshot = structuredClone(runtime.compositions.find(item => item.id === compositionId));
  run('restore snapshot', value => replaceCompositionFromSnapshot(value, compositionId, snapshot));
  run('apply starter', value => applyCompositionStarter(value, {
    compositionId,
    starterId: 'research-brief'
  }));
  run('add recommendation', value => addRecommendedCompositionElement(
    value,
    compositionId,
    'add-review'
  ));
  run('apply to editable Production', value => applyProductionComposition(value, compositionId));
  run('duplicate composition', value => duplicateProductionComposition(value, compositionId));
});

test('denied Composer mutations explicitly report that nothing executed', () => {
  const empty = createInitialProductionRuntime();
  const created = createProductionComposition(empty, {
    id: 'composition:denial-contract',
    title: 'Denial contract'
  });
  const compositionId = created.composition.id;
  const missing = 'composition:missing';
  const denials = [
    ['restore', empty, replaceCompositionFromSnapshot(empty, missing, {})],
    ['rename', empty, renameProductionComposition(empty, missing, 'Nope')],
    ['bind', created.runtime, bindCompositionToProduction(created.runtime, compositionId, 'production:missing')],
    ['add node', empty, addCompositionNode(empty, missing, { ref: { kind: 'gummy', id: 'gummy:missing' } })],
    ['remove node', created.runtime, removeCompositionNode(created.runtime, compositionId, 'composition-node:missing')],
    ['move to lane', created.runtime, moveCompositionNodeToLane(created.runtime, compositionId, 'composition-node:missing', 'inputs')],
    ['reorder', created.runtime, moveCompositionNode(created.runtime, compositionId, 'composition-node:missing', 'before')],
    ['duplicate node', created.runtime, duplicateCompositionNode(created.runtime, compositionId, 'composition-node:missing')],
    ['connect', created.runtime, connectCompositionNodes(created.runtime, compositionId, {
      fromNodeId: 'composition-node:missing-a',
      toNodeId: 'composition-node:missing-b'
    })],
    ['disconnect', created.runtime, disconnectCompositionEdge(created.runtime, compositionId, 'composition-edge:missing')],
    ['toggle', created.runtime, toggleCompositionBranch(created.runtime, compositionId, 'composition-edge:missing')],
    ['duplicate composition', empty, duplicateProductionComposition(empty, missing)],
    ['apply composition', empty, applyProductionComposition(empty, missing)],
    ['update brief', empty, updateProductionCompositionBrief(empty, missing, {})],
    ['add reference', empty, addCompositionReference(empty, missing, {
      kind: 'gummy',
      id: 'gummy:missing'
    })],
    ['apply starter', empty, applyCompositionStarter(empty, { starterId: 'starter:missing' })],
    ['add recommendation', created.runtime, addRecommendedCompositionElement(
      created.runtime,
      compositionId,
      'recommendation:missing'
    )]
  ];

  for (const [name, before, result] of denials) {
    assert.equal(result.denied, true, `${name} should be denied`);
    assertNonExecuting(name, before, result);
  }
});

test('external Gummy Box links require exact revision and hash without duplicating or executing the object', () => {
  const externalId = 'gummy:external-box-object';
  const created = createProductionComposition(createInitialProductionRuntime(), {
    id: 'composition:external-reference',
    title: 'External reference'
  });
  const hashed = assertNonExecuting('hashed external link', created.runtime, addCompositionReference(
    created.runtime,
    created.composition.id,
    {
      kind: 'gummy',
      id: externalId,
      revision: '12',
      hash: `sha256:${'c'.repeat(64)}`,
      label: 'Content-addressed external Gummy'
    }
  ));
  const hashedComposition = hashed.runtime.compositions.find(item => item.id === created.composition.id);
  assert.doesNotMatch(
    projectCompositionReadiness(hashedComposition, hashed.runtime).blockers.join(' '),
    new RegExp(externalId)
  );
  assert.equal(hashed.runtime.gummies.some(item => item.id === externalId), false);
  assert.equal(hashedComposition.nodes.filter(node => node.ref.id === externalId).length, 1);

  const unhashedCreated = createProductionComposition(createInitialProductionRuntime(), {
    id: 'composition:unhashed-reference',
    title: 'Unhashed reference'
  });
  const unhashed = assertNonExecuting('unhashed external link', unhashedCreated.runtime, addCompositionReference(
    unhashedCreated.runtime,
    unhashedCreated.composition.id,
    {
      kind: 'gummy',
      id: externalId,
      label: 'Unversioned external Gummy'
    }
  ));
  const unhashedComposition = unhashed.runtime.compositions.find(item => item.id === unhashedCreated.composition.id);
  assert.match(
    projectCompositionReadiness(unhashedComposition, unhashed.runtime).blockers.join(' '),
    new RegExp(`no longer exists: ${externalId}`)
  );
  assert.equal(unhashed.runtime.gummies.some(item => item.id === externalId), false);
});
