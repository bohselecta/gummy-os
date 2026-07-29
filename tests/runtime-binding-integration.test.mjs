import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProductionRuntime } from '../src/core/production-runtime.js';
import {
  DeterministicRuntimeTransport,
  acceptRuntimeReturn,
  applyRuntimeObservation,
  attachDistributionPlan,
  continueRuntimeBinding,
  createUniversalRuntimeBinding,
  migrateRuntimeExecutionState,
  projectRuntimeCommandCenter,
  recordMasterControlDecision,
  recordRuntimeReceipt,
  recordRuntimeReturn,
  registerManagedRuntimeBoundary,
  releaseRuntimeDistribution
} from '../src/core/runtime-binding.js';

function canonicalRuntime() {
  const runtime = createInitialProductionRuntime();
  runtime.productions.push({
    id: 'production:runtime-proof',
    ownerActorId: 'actor:hayden',
    authoritativeLocation: 'browser:local-origin',
    status: 'active'
  });
  runtime.workOrders.push({
    id: 'work-order:runtime-proof',
    productionId: 'production:runtime-proof',
    actorId: 'actor:imagehoss',
    status: 'approved'
  });
  runtime.taskLeases.push({
    id: 'lease:runtime-proof',
    productionId: 'production:runtime-proof',
    agentId: 'agent:reference-imagehoss-browser',
    moldId: 'mold:imagehoss:production-reference',
    status: 'active'
  });
  runtime.grants.push({
    id: 'grant:runtime-proof',
    taskLeaseId: 'lease:runtime-proof',
    status: 'active'
  });
  runtime.productionPools.push({
    id: 'production-pool:runtime-proof',
    productionId: 'production:runtime-proof',
    authorizations: [{
      id: 'pool-authorization:runtime-proof',
      status: 'approved',
      currency: 'USD',
      authorizedMicros: 600000
    }]
  });
  runtime.contributionLedgers.push({
    id: 'contribution-ledger:runtime-proof',
    productionId: 'production:runtime-proof',
    entries: []
  });
  runtime.distributionPlans.push({
    schema: 'gummy.distribution-plan/v1',
    id: 'distribution-plan:runtime-proof',
    productionId: 'production:runtime-proof',
    status: 'approved'
  });
  return runtime;
}

function bindingInput() {
  return {
    id: 'runtime-binding:proof',
    actorId: 'actor:imagehoss',
    agentId: 'agent:reference-imagehoss-browser',
    productionId: 'production:runtime-proof',
    workOrderId: 'work-order:runtime-proof',
    authorityLeaseId: 'lease:runtime-proof',
    moldId: 'mold:imagehoss:production-reference',
    grantId: 'grant:runtime-proof',
    productionPoolId: 'production-pool:runtime-proof',
    budgetAuthorizationId: 'pool-authorization:runtime-proof',
    returnAnchor: 'return:runtime-proof',
    acceptancePolicy: 'human-explicit',
    contributionLedgerId: 'contribution-ledger:runtime-proof',
    executionRoute: 'mcp-task',
    provider: {
      kind: 'mcp',
      profileId: 'deterministic-mcp-2026-07-28',
      externalResourceId: 'task:runtime-proof'
    },
    stateHandle: 'production:runtime-proof',
    hardStopMicros: 400000,
    canonicalProjectCopy: {
      location: 'gummy-box',
      revisionId: 'revision:runtime-proof:1',
      persistedAt: '2026-07-28T20:00:00.000Z'
    },
    createdAt: '2026-07-28T20:00:00.000Z'
  };
}

test('Runtime Binding fails closed unless canonical authority and budget exist', () => {
  const runtime = canonicalRuntime();
  const input = bindingInput();
  input.authorityLeaseId = 'lease:missing';
  assert.throws(
    () => createUniversalRuntimeBinding(runtime, input),
    /Task Lease required/
  );

  const excessive = bindingInput();
  excessive.hardStopMicros = 700000;
  assert.throws(
    () => createUniversalRuntimeBinding(runtime, excessive),
    /hard stop exceeds/
  );
});

test('MCP completion remains a Return candidate until Gummy records proof', () => {
  let runtime = createUniversalRuntimeBinding(
    canonicalRuntime(),
    bindingInput()
  ).runtime;
  runtime = applyRuntimeObservation(runtime, 'runtime-binding:proof', {
    eventId: 'provider:completed:1',
    kind: 'provider-status',
    status: 'completed',
    at: '2026-07-28T20:01:00.000Z'
  }).runtime;

  const binding = runtime.runtimeBindings[0];
  assert.equal(binding.status, 'return_pending');
  assert.equal(runtime.returns.length, 0);
  assert.equal(runtime.receipts.length, 0);
  assert.equal(binding.acceptanceStatus, 'pending');
});

test('budget stop, Human input and continuation remain Master Control decisions', () => {
  let runtime = createUniversalRuntimeBinding(
    canonicalRuntime(),
    bindingInput()
  ).runtime;
  runtime = applyRuntimeObservation(runtime, 'runtime-binding:proof', {
    eventId: 'provider:input:1',
    kind: 'provider-status',
    status: 'input_required'
  }).runtime;

  const projection = projectRuntimeCommandCenter(runtime);
  assert.equal(projection.bindings[0].waitingHumanInput, true);
  assert.equal(projection.authorityCanExecute, false);
  assert.throws(
    () => continueRuntimeBinding(runtime, 'runtime-binding:proof', {
      eventId: 'continue:unapproved'
    }),
    /Master Control/
  );

  runtime = recordMasterControlDecision(runtime, 'runtime-binding:proof', {
    id: 'decision:input',
    humanId: 'human:hayden',
    decision: 'approve-input',
    reason: 'Approved bounded reference selection'
  }).runtime;
  runtime = applyRuntimeObservation(runtime, 'runtime-binding:proof', {
    eventId: 'usage:350000',
    kind: 'usage',
    amountMicros: 350000
  }).runtime;
  const denied = applyRuntimeObservation(runtime, 'runtime-binding:proof', {
    eventId: 'usage:100000:denied',
    kind: 'usage',
    amountMicros: 100000
  });
  runtime = denied.runtime;
  assert.equal(denied.denied, true);
  assert.equal(runtime.runtimeBindings[0].budget.consumedMicros, 350000);
  assert.equal(runtime.runtimeBindings[0].status, 'budget_stopped');

  runtime = applyRuntimeObservation(runtime, 'runtime-binding:proof', {
    eventId: 'checkpoint:budget-stop',
    kind: 'checkpoint',
    handle: 'checkpoint:runtime-proof:1',
    digest: 'sha256:runtime-proof-1',
    location: 'gummy-box'
  }).runtime;
  runtime = recordMasterControlDecision(runtime, 'runtime-binding:proof', {
    id: 'decision:continue',
    humanId: 'human:hayden',
    decision: 'approve-continuation',
    reason: 'Approved within the existing Production Pool maximum',
    hardStopMicros: 500000
  }).runtime;
  runtime = continueRuntimeBinding(runtime, 'runtime-binding:proof', {
    eventId: 'continue:approved'
  }).runtime;

  assert.equal(runtime.runtimeBindings[0].status, 'active');
  assert.equal(runtime.runtimeBindings[0].budget.hardStopMicros, 500000);
  assert.equal(runtime.productionPools[0].authorizations[0].authorizedMicros, 600000);
});

test('vertical proof separates completion, Return, Receipt, acceptance and release', () => {
  let runtime = createUniversalRuntimeBinding(
    canonicalRuntime(),
    bindingInput()
  ).runtime;
  runtime = applyRuntimeObservation(runtime, 'runtime-binding:proof', {
    eventId: 'provider:completed:vertical',
    kind: 'provider-status',
    status: 'completed'
  }).runtime;
  runtime = recordRuntimeReturn(runtime, 'runtime-binding:proof', {
    id: 'return:runtime-proof',
    result: 'completed',
    summary: 'Deterministic runtime output is available for review',
    gummyIds: ['gummy:runtime-proof-result'],
    providerEvidenceIds: ['provider-evidence:runtime-proof']
  }).runtime;
  assert.throws(
    () => acceptRuntimeReturn(runtime, 'runtime-binding:proof', {
      id: 'decision:accept-too-soon',
      humanId: 'human:hayden'
    }),
    /requires Receipt/
  );

  runtime = recordRuntimeReceipt(runtime, 'runtime-binding:proof', {
    id: 'receipt:runtime-proof',
    outcome: 'completed',
    summary: 'Return recorded with canonical evidence'
  }).runtime;
  runtime = acceptRuntimeReturn(runtime, 'runtime-binding:proof', {
    id: 'decision:accept',
    humanId: 'human:hayden',
    reason: 'Human accepted reviewed Return'
  }).runtime;
  assert.throws(
    () => releaseRuntimeDistribution(runtime, 'runtime-binding:proof', {
      eventId: 'release:too-soon'
    }),
    /explicit release approval/
  );

  runtime = attachDistributionPlan(
    runtime,
    'runtime-binding:proof',
    'distribution-plan:runtime-proof'
  ).runtime;
  runtime = recordMasterControlDecision(runtime, 'runtime-binding:proof', {
    id: 'decision:release',
    humanId: 'human:hayden',
    decision: 'approve-release',
    reason: 'Approved named Distribution Plan'
  }).runtime;
  runtime = releaseRuntimeDistribution(runtime, 'runtime-binding:proof', {
    eventId: 'release:approved',
    releasedAt: '2026-07-28T20:10:00.000Z'
  }).runtime;

  const restored = migrateRuntimeExecutionState(JSON.parse(JSON.stringify(runtime)));
  const binding = restored.runtimeBindings[0];
  assert.equal(restored.returns.length, 1);
  assert.equal(restored.receipts.some(item => item.id === 'receipt:runtime-proof'), true);
  assert.equal(restored.runtimeAcceptanceDecisions.length, 1);
  assert.equal(binding.acceptanceStatus, 'accepted');
  assert.equal(binding.distributionPlanId, 'distribution-plan:runtime-proof');
  assert.equal(binding.releasedAt, '2026-07-28T20:10:00.000Z');
  assert.equal(binding.canonicalProjectCopy.location, 'gummy-box');
});

test('managed runtime remains optional and provider state never becomes canonical', () => {
  let runtime = createUniversalRuntimeBinding(
    canonicalRuntime(),
    bindingInput()
  ).runtime;
  assert.throws(
    () => registerManagedRuntimeBoundary(runtime, {
      runtimeBindingId: 'runtime-binding:proof',
      providerProfile: { provider: 'google', liveEnabled: true },
      recovery: {
        checkpointLocation: 'gummy-box',
        providerIndependent: true
      },
      guarantees: {
        credentialsVerified: false,
        costVerified: false,
        privacyVerified: false,
        recoveryVerified: false
      }
    }),
    /every provider guarantee/
  );

  runtime = registerManagedRuntimeBoundary(runtime, {
    runtimeBindingId: 'runtime-binding:proof',
    providerProfile: {
      provider: 'google',
      service: 'vertex-ai-agent-engine',
      project: 'deterministic-only',
      location: 'us-central1',
      liveEnabled: false
    },
    resourceHandle: 'providers/google/resources/deterministic',
    continuationHandle: 'checkpoint:runtime-proof:1',
    recovery: {
      checkpointLocation: 'gummy-box',
      providerIndependent: true
    },
    guarantees: {
      credentialsVerified: false,
      costVerified: false,
      privacyVerified: false,
      recoveryVerified: false
    }
  }).runtime;

  assert.equal(runtime.managedRuntimeBindings[0].providerProfile.liveEnabled, false);
  assert.equal(runtime.runtimeBindings[0].canonicalProjectCopy.location, 'gummy-box');
});

test('deterministic transport implements dispatch, polling, checkpoint and recovery', () => {
  const transport = new DeterministicRuntimeTransport({
    profileId: 'deterministic-mcp',
    observations: [{
      eventId: 'provider:working:1',
      kind: 'provider-status',
      status: 'working'
    }]
  });
  const binding = createUniversalRuntimeBinding(
    canonicalRuntime(),
    bindingInput()
  ).binding;
  const dispatched = transport.dispatch(binding, 'idempotency:dispatch:1');
  assert.equal(dispatched.handle, 'deterministic:runtime-binding:proof');
  assert.equal(transport.poll().status, 'working');
  const checkpoint = transport.checkpoint(dispatched.handle, 'sha256:checkpoint');
  assert.equal(transport.restore(checkpoint).restored, true);
  assert.throws(
    () => transport.provideInput(dispatched.handle, { authority: 'provider' }),
    /Master Control/
  );
});
