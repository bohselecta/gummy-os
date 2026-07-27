import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTION_RUN_SCHEMA,
  PRODUCTION_SCHEMA,
  RANCH_DAY_ACTOR_IDS,
  SERVICE_ACTOR_IDS,
  actorSurfaceWindowId,
  addActorToProduction,
  addRanchDayRoster,
  applyDragIntent,
  compileActorPlan,
  createDragIntent,
  createInitialProductionRuntime,
  createProduction,
  getSetupGuidance,
  invokeCapabilityAdapter,
  makeProduction,
  previewProductionRun,
  promoteSettingToActorDefault,
  recordTerminalNodeEvidence,
  revokeActorRelationship,
  saveProductionActorConfiguration,
  sha256,
  stableStringify
} from '../src/core/production-runtime.js';

async function readyRanchDay({ includeOptional3d = true } = {}) {
  let runtime = createInitialProductionRuntime();
  const created = createProduction(runtime);
  runtime = addRanchDayRoster(created.runtime, created.production.id, 'mention');
  for (const actorId of SERVICE_ACTOR_IDS) {
    if (actorId === 'actor:3d-bee' && !includeOptional3d) continue;
    runtime = (await saveProductionActorConfiguration(runtime, created.production.id, actorId, {})).runtime;
  }
  runtime = compileActorPlan(runtime, created.production.id).runtime;
  return { runtime, productionId: created.production.id };
}

test('creates a canonical durable Production without executing work', () => {
  const result = createProduction(createInitialProductionRuntime());
  assert.equal(result.production.schema, PRODUCTION_SCHEMA);
  assert.equal(result.production.id, 'production:ranch-day');
  assert.equal(result.executed, undefined);
  assert.equal(result.runtime.productionRuns.length, 0);
  assert.equal(result.runtime.workOrders.length, 0);
});

test('adds Actors by mention, search, and drag while Actor, Agent, and application remain separate', () => {
  const created = createProduction(createInitialProductionRuntime());
  let runtime = addActorToProduction(created.runtime, created.production.id, 'actor:imagehoss', 'mention').runtime;
  runtime = addActorToProduction(runtime, created.production.id, 'actor:videoboss', 'search').runtime;
  const proposal = createDragIntent(runtime, {
    productionId: created.production.id,
    sourceKind: 'actor',
    sourceId: 'actor:project-composer',
    targetKind: 'production',
    targetId: created.production.id,
    action: 'participant-membership'
  });
  const applied = applyDragIntent(proposal.runtime, proposal.intent.id);
  const sources = applied.runtime.participants.map(item => item.source);
  assert.ok(sources.includes('mention'));
  assert.ok(sources.includes('search'));
  assert.ok(sources.includes('drag'));
  const actor = applied.runtime.actors.find(item => item.id === 'actor:imagehoss');
  const agent = applied.runtime.agents.find(item => item.id === actor.agentIds[0]);
  const descriptor = applied.runtime.actorAppDescriptors.find(item => item.actorId === actor.id);
  assert.notEqual(actor.id, agent.id);
  assert.notEqual(actor.id, descriptor.id);
  assert.notEqual(agent.id, descriptor.id);
  assert.equal(applied.runtime.productionRuns.length, 0);
});

test('uses stable service Actor identities, addresses, capabilities, Molds, and reference Agents', () => {
  const runtime = createInitialProductionRuntime();
  for (const actorId of SERVICE_ACTOR_IDS) {
    const actor = runtime.actors.find(item => item.id === actorId);
    const descriptor = runtime.actorAppDescriptors.find(item => item.actorId === actorId);
    assert.equal(actor.kind, 'service');
    assert.match(actor.address, /^@/);
    assert.ok(descriptor.capabilityIds.length);
    assert.ok(runtime.molds.some(item => item.actorId === actorId));
    assert.ok(runtime.agents.some(item => item.actorIds.includes(actorId) && item.providerClass === 'gummy-reference'));
  }
});

test('opens the same Actor in standalone and two Production scopes without window collision', () => {
  assert.equal(actorSurfaceWindowId('actor:videoboss'), 'actor-surface:actor:videoboss:standalone:main');
  assert.notEqual(
    actorSurfaceWindowId('actor:videoboss', 'production:ranch-day'),
    actorSurfaceWindowId('actor:videoboss', 'production:sable-trailer')
  );
});

test('returns dependency-aware setup guidance and marks 3D-Bee optional', () => {
  const created = createProduction(createInitialProductionRuntime());
  const runtime = addRanchDayRoster(created.runtime, created.production.id);
  const guidance = getSetupGuidance(runtime, created.production.id);
  assert.deepEqual(guidance.map(item => item.actorId), RANCH_DAY_ACTOR_IDS);
  assert.equal(guidance.find(item => item.actorId === 'actor:3d-bee').optional, true);
  assert.ok(guidance.find(item => item.actorId === 'actor:imagehoss').order < guidance.find(item => item.actorId === 'actor:videoboss').order);
});

test('persists isolated Production-specific configurations for the same Actor', async () => {
  let runtime = createInitialProductionRuntime();
  const ranch = createProduction(runtime);
  runtime = addActorToProduction(ranch.runtime, ranch.production.id, 'actor:videoboss', 'mention').runtime;
  const other = createProduction(runtime, { title: 'Sable Trailer' });
  runtime = addActorToProduction(other.runtime, other.production.id, 'actor:videoboss', 'search').runtime;
  runtime = (await saveProductionActorConfiguration(runtime, ranch.production.id, 'actor:videoboss', { settings: { durationSeconds: 30 } })).runtime;
  runtime = (await saveProductionActorConfiguration(runtime, other.production.id, 'actor:videoboss', { settings: { durationSeconds: 90 } })).runtime;
  const ranchConfig = runtime.configurations.find(item => item.productionId === ranch.production.id && item.actorId === 'actor:videoboss');
  const otherConfig = runtime.configurations.find(item => item.productionId === other.production.id && item.actorId === 'actor:videoboss');
  assert.equal(ranchConfig.settings.durationSeconds, 30);
  assert.equal(otherConfig.settings.durationSeconds, 90);
  assert.notEqual(ranchConfig.id, otherConfig.id);
  assert.notEqual(ranchConfig.hash, otherConfig.hash);
  assert.equal(runtime.actorDefaults['actor:videoboss'], undefined);
});

test('promotes Production settings to Actor defaults only through explicit evidenced action', async () => {
  const ready = await readyRanchDay();
  const before = ready.runtime.actorDefaults['actor:videoboss'];
  const result = await promoteSettingToActorDefault(ready.runtime, ready.productionId, 'actor:videoboss', ['durationSeconds']);
  assert.equal(before, undefined);
  assert.equal(result.runtime.actorDefaults['actor:videoboss'].durationSeconds, 30);
  assert.equal(result.proposal.schema, 'gummy.actor-update-proposal/v0');
  assert.equal(result.proposal.status, 'approved');
  assert.ok(result.runtime.receipts.some(item => item.action === 'actor-default.promoted'));
});

test('typed drag/drop preview identifies boundaries and never grants authority or starts work', () => {
  const created = createProduction(createInitialProductionRuntime());
  const result = createDragIntent(created.runtime, {
    productionId: created.production.id,
    sourceKind: 'gummy',
    sourceId: 'gummy:ranch-day-source-brief',
    targetKind: 'actor',
    targetId: 'actor:videoboss',
    action: 'task-input',
    dataClasses: ['text/markdown'],
    moldId: 'mold:videoboss:private-family-video',
    inputMode: 'touch'
  });
  assert.equal(result.intent.status, 'preview');
  assert.equal(result.intent.grantsAuthority, false);
  assert.equal(result.intent.startsExecution, false);
  assert.equal(result.intent.frozenRunMutation, false);
  assert.equal(result.intent.inputMode, 'touch');
  assert.equal(result.runtime.grants.length, 0);
});

test('typed composition proposals cover Actor routing, preservation, config copy, plan reorder, and result handoff', async () => {
  const ready = await readyRanchDay();
  let runtime = ready.runtime;
  const route = createDragIntent(runtime, {
    productionId: ready.productionId,
    sourceKind: 'actor',
    sourceId: 'actor:imagehoss',
    targetKind: 'actor',
    targetId: 'actor:videoboss',
    action: 'actor-routing',
    dataClasses: ['approved-reference-set']
  });
  runtime = applyDragIntent(route.runtime, route.intent.id).runtime;
  assert.ok(runtime.links.some(item => item.relation === 'routes-to'));

  const preserve = createDragIntent(runtime, {
    productionId: ready.productionId,
    sourceKind: 'production',
    sourceId: ready.productionId,
    targetKind: 'actor',
    targetId: 'actor:gummy-storage',
    action: 'preservation-policy',
    dataClasses: ['sources', 'results', 'receipts']
  });
  runtime = applyDragIntent(preserve.runtime, preserve.intent.id).runtime;
  assert.equal(runtime.configurations.find(item => item.actorId === 'actor:gummy-storage').readiness, 'needs-configuration');

  const beforeOrder = runtime.actorPlans[0].nodes.map(item => item.id);
  const reorder = createDragIntent(runtime, {
    productionId: ready.productionId,
    sourceKind: 'plan-node',
    sourceId: beforeOrder[2],
    targetKind: 'plan',
    targetId: runtime.actorPlans[0].id,
    action: 'plan-reorder',
    dataClasses: ['editable-plan-order'],
    inputMode: 'keyboard'
  });
  runtime = applyDragIntent(reorder.runtime, reorder.intent.id).runtime;
  assert.equal(runtime.actorPlans[0].nodes[1].id, beforeOrder[2]);

  runtime = (await saveProductionActorConfiguration(runtime, ready.productionId, 'actor:gummy-storage', {})).runtime;
  const completed = await makeProduction(runtime, ready.productionId, { approvedBy: 'human:hayden' });
  runtime = completed.runtime;
  const videoResult = completed.results.find(item => item.creatorActorId === 'actor:videoboss');
  const handoff = createDragIntent(runtime, {
    productionId: ready.productionId,
    sourceKind: 'gummy',
    sourceId: videoResult.id,
    targetKind: 'actor',
    targetId: 'actor:project-composer',
    action: 'plan-edge',
    dataClasses: ['gummy/video-manifest']
  });
  runtime = applyDragIntent(handoff.runtime, handoff.intent.id).runtime;
  assert.ok(runtime.actorPlans[0].edges.some(item => item.sourceIntentId === handoff.intent.id));

  const other = createProduction(runtime, { title: 'Sable Trailer' });
  runtime = other.runtime;
  const sourceConfig = runtime.configurations.find(item => item.productionId === ready.productionId && item.actorId === 'actor:videoboss');
  const copied = createDragIntent(runtime, {
    productionId: other.production.id,
    sourceKind: 'configuration',
    sourceId: sourceConfig.id,
    targetKind: 'production',
    targetId: other.production.id,
    action: 'copy-configuration',
    dataClasses: ['versioned-production-settings']
  });
  runtime = applyDragIntent(copied.runtime, copied.intent.id).runtime;
  const copy = runtime.configurations.find(item => item.productionId === other.production.id && item.actorId === 'actor:videoboss');
  assert.equal(copy.copiedFrom, `${sourceConfig.id}@${sourceConfig.revision}`);
  assert.equal(copy.readiness, 'needs-configuration');
  assert.notEqual(copy.id, sourceConfig.id);
  assert.equal(runtime.productionRuns.length, 1);
  assert.equal(runtime.grants.length, completed.runtime.grants.length);
});

test('compiles a visible graph with non-execution context nodes and typed edge families', async () => {
  const ready = await readyRanchDay();
  const plan = ready.runtime.actorPlans.find(item => item.productionId === ready.productionId);
  const hoyt = plan.nodes.find(item => item.actorId === 'actor:hoyt');
  assert.equal(hoyt.nodeType, 'context');
  assert.equal(hoyt.agentId, undefined);
  const edgeTypes = new Set(plan.edges.map(item => item.edgeType));
  for (const type of ['setup', 'context', 'input', 'execution', 'review', 'approval', 'storage', 'publication']) {
    assert.ok(edgeTypes.has(type), `missing ${type} edge`);
  }
});

test('Master Control preview blocks unresolved configuration and missing Human approval', async () => {
  const created = createProduction(createInitialProductionRuntime());
  const runtime = compileActorPlan(addRanchDayRoster(created.runtime, created.production.id), created.production.id).runtime;
  const preview = previewProductionRun(runtime, created.production.id);
  assert.ok(preview.blockers.some(item => item.startsWith('configuration-not-ready')));
  const denied = await makeProduction(runtime, created.production.id, {});
  assert.equal(denied.denied, true);
  assert.ok(denied.runtime.receipts.some(item => item.outcome === 'denied'));
});

test('Make Production creates an immutable frozen Run plus Work Orders, Leases, Grants, Returns, and Receipts', async () => {
  const ready = await readyRanchDay();
  const result = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  assert.equal(result.run.schema, PRODUCTION_RUN_SCHEMA);
  assert.equal(result.run.status, 'completed');
  assert.equal(result.run.workOrderIds.length, 5);
  assert.equal(result.run.taskLeaseIds.length, 5);
  assert.equal(result.run.grantIds.length, 5);
  assert.equal(result.run.returnIds.length, 5);
  assert.equal(result.run.receiptIds.length, 5);
  assert.equal(result.run.resultGummyIds.length, 5);
  assert.equal(result.runtime.workOrders.every(item => item.status === 'returned'), true);
  assert.equal(result.runtime.taskLeases.every(item => item.status === 'completed'), true);
  assert.equal(result.runtime.grants.every(item => item.approval === 'human' && item.revoked === false), true);
});

test('Run snapshot remains unchanged after editable Production configuration changes', async () => {
  const ready = await readyRanchDay();
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  const frozenBefore = stableStringify(completed.run.frozenConfigurations);
  const changed = await saveProductionActorConfiguration(completed.runtime, ready.productionId, 'actor:videoboss', { settings: { durationSeconds: 120 } });
  const persistedRun = changed.runtime.productionRuns.find(item => item.id === completed.run.id);
  assert.equal(stableStringify(persistedRun.frozenConfigurations), frozenBefore);
  assert.equal(persistedRun.frozenConfigurations.find(item => item.actorId === 'actor:videoboss').settings.durationSeconds, 30);
  assert.equal(changed.configuration.settings.durationSeconds, 120);
});

test('optional 3D-Bee may remain unconfigured without blocking required Ranch Day execution', async () => {
  const ready = await readyRanchDay({ includeOptional3d: false });
  const preview = previewProductionRun(ready.runtime, ready.productionId);
  assert.equal(preview.blockers.some(item => item.includes('actor:3d-bee')), false);
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  assert.equal(completed.run.resultGummyIds.length, 4);
  assert.equal(completed.run.workOrderIds.some(id => id.endsWith(':3d-bee')), false);
});

test('Context Envelopes contain approved node slices and exclude complete Actor memory', async () => {
  const ready = await readyRanchDay();
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  const video = completed.runtime.contextEnvelopes.find(item => item.targetActorId === 'actor:videoboss');
  assert.deepEqual(video.contextRefs, ['gummy:hoyt-likeness-approved', 'gummy:beagle-references-approved', 'gummy:family-video-private']);
  assert.ok(video.excludes.includes('complete-actor-memory'));
  assert.ok(video.excludes.includes('unrelated-private-memory'));
  assert.ok(video.forbiddenActions.includes('voice-cloning'));
  assert.equal('completeActorMemory' in video, false);
});

test('deterministic reference execution is honestly disclosed and produces provenance Links', async () => {
  const ready = await readyRanchDay();
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  for (const result of completed.results) {
    const output = JSON.parse(result.content);
    assert.equal(output.executor.providerClass, 'gummy-reference');
    assert.match(output.executor.truthfulLimitation, /not.*external media provider/i);
    assert.ok(result.operatingAgentId.startsWith('agent:reference-'));
    assert.ok(completed.runtime.links.some(item => item.target.id === result.id && item.relation === 'derived-from'));
  }
});

test('equivalent frozen Ranch Day inputs produce identical deterministic reference result hashes', async () => {
  const firstReady = await readyRanchDay();
  const secondReady = await readyRanchDay();
  const first = await makeProduction(firstReady.runtime, firstReady.productionId, { approvedBy: 'human:hayden' });
  const second = await makeProduction(secondReady.runtime, secondReady.productionId, { approvedBy: 'human:hayden' });
  assert.deepEqual(
    first.results.map(item => item.hash),
    second.results.map(item => item.hash)
  );
});

test('source Gummies remain byte-identical and hash-identical after full Ranch Day execution', async () => {
  const ready = await readyRanchDay();
  const sourceBefore = ready.runtime.gummies.filter(item => item.status === 'source').map(item => ({ id: item.id, content: item.content, hash: item.hash }));
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  const sourceAfter = completed.runtime.gummies.filter(item => item.status === 'source').map(item => ({ id: item.id, content: item.content, hash: item.hash }));
  assert.deepEqual(sourceAfter, sourceBefore);
  for (const source of sourceAfter) assert.equal(await sha256(source.content), source.hash);
});

test('every terminal execution node has a Return and Receipt with actual executor evidence', async () => {
  const ready = await readyRanchDay();
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  for (const returnId of completed.run.returnIds) {
    const returned = completed.runtime.returns.find(item => item.id === returnId);
    assert.ok(returned.agentId.startsWith('agent:reference-'));
    assert.equal(returned.result, 'completed');
    assert.equal(returned.receiptIds.length, 1);
    const receipt = completed.runtime.receipts.find(item => item.id === returned.receiptIds[0]);
    assert.equal(receipt.agentId, returned.agentId);
    assert.match(receipt.contextEnvelopeId, /^context-envelope:/);
    assert.equal(receipt.cost.amount, 0);
  }
});

test('denial, failure, cancellation, and expiry produce truthful terminal Return and Receipt evidence', () => {
  let runtime = createInitialProductionRuntime();
  for (const outcome of ['denied', 'failed', 'cancelled', 'expired']) {
    const result = recordTerminalNodeEvidence(runtime, {
      productionId: 'production:ranch-day',
      runId: 'production-run:ranch-day:test',
      actorId: 'actor:videoboss',
      agentId: 'agent:reference-videoboss-browser',
      outcome,
      reason: `Truthful ${outcome} fixture`
    });
    runtime = result.runtime;
    assert.equal(result.returned.result, outcome);
    assert.equal(result.receipt.outcome, outcome);
  }
});

test('revocation blocks future Runs and preserves completed historical evidence', async () => {
  const ready = await readyRanchDay();
  const completed = await makeProduction(ready.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  const history = {
    runs: completed.runtime.productionRuns.length,
    returns: completed.runtime.returns.length,
    receipts: completed.runtime.receipts.length
  };
  const revoked = revokeActorRelationship(completed.runtime, 'link:hoyt-videoboss-private-family');
  const preview = previewProductionRun(revoked.runtime, ready.productionId);
  const future = await makeProduction(revoked.runtime, ready.productionId, { approvedBy: 'human:hayden' });
  assert.ok(preview.blockers.includes('relationship-revoked:actor:hoyt:actor:videoboss'));
  assert.equal(future.denied, true);
  assert.equal(future.runtime.productionRuns.length, history.runs);
  assert.equal(future.runtime.returns.length, history.returns);
  assert.ok(future.runtime.receipts.length > history.receipts);
  assert.ok(future.runtime.receipts.some(item => item.action === 'relationship.revoked'));
});

test('native invocation is denied without explicit Bridge, Mold, Lease, and Grant path', async () => {
  const result = await invokeCapabilityAdapter({
    agent: { id: 'agent:native-test', runtimeClass: 'linux-native', providerClass: 'native', locality: 'local' },
    mold: null,
    lease: null,
    grant: null,
    envelope: null,
    configuration: {},
    production: {},
    run: {}
  });
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('explicit-native-bridge-required'));
  assert.ok(result.blockers.includes('active-mold-required'));
  assert.ok(result.blockers.includes('active-task-lease-required'));
  assert.ok(result.blockers.includes('active-bounded-grant-required'));
  assert.ok(result.blockers.includes('context-envelope-required'));
});

test('Production runtime seed is deterministic and records non-destructive migration intent', () => {
  const first = createInitialProductionRuntime();
  const second = createInitialProductionRuntime();
  assert.equal(first.version, 2);
  assert.equal(first.migrationLog[0].preservesLegacyState, true);
  assert.deepEqual(second, first);
});
