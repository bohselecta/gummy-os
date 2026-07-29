export const RUNTIME_BINDING_SCHEMA = 'gummy.runtime-binding/v1';
export const MANAGED_RUNTIME_BINDING_SCHEMA = 'gummy.managed-runtime-binding/v1';
export const EXECUTION_TRACE_SCHEMA = 'gummy.execution-trace/v1';

const runtimeCollections = Object.freeze([
  'runtimeBindings',
  'managedRuntimeBindings',
  'executionTraces',
  'masterControlDecisions',
  'runtimeAcceptanceDecisions',
  'productionPools',
  'contributionLedgers',
  'distributionPlans'
]);

const clone = value => structuredClone(value);
const stamp = () => new Date().toISOString();

export function migrateRuntimeExecutionState(runtime) {
  const next = clone(runtime);
  for (const key of runtimeCollections) {
    if (!Array.isArray(next[key])) next[key] = [];
  }
  return next;
}

export function createUniversalRuntimeBinding(runtime, input) {
  const next = migrateRuntimeExecutionState(runtime);
  const production = requiredObject(next.productions, input.productionId, 'Production');
  const actor = requiredObject(next.actors, input.actorId, 'Actor');
  const agent = requiredObject(next.agents, input.agentId, 'Agent');
  const workOrder = requiredObject(next.workOrders, input.workOrderId, 'Work Order');
  const lease = requiredObject(next.taskLeases, input.authorityLeaseId, 'Task Lease');
  const mold = requiredObject(next.molds, input.moldId, 'Mold');
  const grant = requiredObject(next.grants, input.grantId, 'Grant');
  const pool = requiredObject(next.productionPools, input.productionPoolId, 'Production Pool');
  requiredObject(next.contributionLedgers, input.contributionLedgerId, 'Contribution Ledger');

  assertSameProduction(production.id, workOrder.productionId, 'Work Order');
  assertSameProduction(production.id, lease.productionId, 'Task Lease');
  assertReference(actor.id, workOrder.actorId, 'Work Order Actor');
  assertReference(agent.id, lease.agentId, 'Task Lease Agent');
  assertReference(mold.id, lease.moldId, 'Task Lease Mold');
  assertReference(lease.id, grant.taskLeaseId, 'Grant Task Lease');
  assertActive(lease, 'Task Lease');
  assertActive(grant, 'Grant');
  assertActive(mold, 'Mold');

  const authorization = (pool.authorizations || []).find(
    item => item.id === input.budgetAuthorizationId
  );
  if (!authorization || authorization.status !== 'approved') {
    throw new Error('Approved Production Pool authorization required');
  }
  if (authorization.currency !== 'USD') {
    throw new Error('Runtime budgets require external USD authorization');
  }
  if (
    !Number.isInteger(input.hardStopMicros) ||
    input.hardStopMicros < 0 ||
    input.hardStopMicros > authorization.authorizedMicros
  ) {
    throw new Error('Runtime hard stop exceeds approved Production Pool authorization');
  }
  if (input.canonicalProjectCopy?.location !== 'gummy-box') {
    throw new Error('Canonical Project copy must remain in Gummy Box');
  }
  if (next.runtimeBindings.some(item => item.id === input.id)) {
    throw new Error(`Runtime Binding already exists: ${input.id}`);
  }

  const createdAt = input.createdAt || stamp();
  const binding = {
    schema: RUNTIME_BINDING_SCHEMA,
    id: input.id,
    bindingId: input.id,
    actorId: actor.id,
    agentId: agent.id,
    productionId: production.id,
    workOrderId: workOrder.id,
    authorityLeaseId: lease.id,
    moldId: mold.id,
    grantId: grant.id,
    productionPoolId: pool.id,
    returnAnchor: input.returnAnchor,
    acceptancePolicy: input.acceptancePolicy,
    contributionLedgerId: input.contributionLedgerId,
    executionRoute: input.executionRoute,
    provider: clone(input.provider),
    stateHandle: input.stateHandle,
    budget: {
      authorizationId: authorization.id,
      currency: 'USD',
      authorizedMicros: authorization.authorizedMicros,
      consumedMicros: 0,
      hardStopMicros: input.hardStopMicros
    },
    canonicalProjectCopy: clone(input.canonicalProjectCopy),
    status: 'bound',
    acceptanceStatus: 'pending',
    distributionPlanId: null,
    releasedAt: null,
    createdAt,
    updatedAt: createdAt
  };
  const trace = {
    schema: EXECUTION_TRACE_SCHEMA,
    id: `trace:${binding.id}`,
    traceId: `trace:${binding.id}`,
    actorId: binding.actorId,
    agentId: binding.agentId,
    productionId: binding.productionId,
    workOrderId: binding.workOrderId,
    runtimeBindingId: binding.id,
    events: [{
      sequence: 0,
      eventId: `binding-created:${binding.id}`,
      kind: 'runtime-binding.created',
      at: createdAt,
      evidenceClass: 'authority'
    }]
  };

  next.runtimeBindings.push(binding);
  next.executionTraces.push(trace);
  return { runtime: next, binding: clone(binding), trace: clone(trace) };
}

export function registerManagedRuntimeBoundary(runtime, input) {
  const next = migrateRuntimeExecutionState(runtime);
  requiredObject(next.runtimeBindings, input.runtimeBindingId, 'Runtime Binding');
  if (input.recovery?.checkpointLocation !== 'gummy-box') {
    throw new Error('Managed runtime recovery must use Gummy Box');
  }
  if (input.recovery?.providerIndependent !== true) {
    throw new Error('Managed runtime checkpoint must be provider independent');
  }
  const guarantees = input.guarantees || {};
  const liveVerified = [
    guarantees.credentialsVerified,
    guarantees.costVerified,
    guarantees.privacyVerified,
    guarantees.recoveryVerified
  ].every(Boolean);
  if (input.providerProfile?.liveEnabled && !liveVerified) {
    throw new Error('Live managed runtime requires every provider guarantee');
  }

  const managed = {
    schema: MANAGED_RUNTIME_BINDING_SCHEMA,
    ...clone(input),
    createdAt: input.createdAt || stamp()
  };
  next.managedRuntimeBindings.push(managed);
  return { runtime: next, managedRuntimeBinding: clone(managed) };
}

export function applyRuntimeObservation(runtime, bindingId, observation) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  const trace = traceFor(next, bindingId);
  const duplicate = trace.events.find(item => item.eventId === observation.eventId);
  if (duplicate) {
    return { runtime: next, binding: clone(binding), duplicate: true };
  }
  if (!observation.eventId) throw new Error('Runtime observation requires eventId');

  if (observation.kind === 'usage') {
    const projected = binding.budget.consumedMicros + observation.amountMicros;
    if (projected > binding.budget.hardStopMicros) {
      binding.status = 'budget_stopped';
      appendTrace(trace, observation, 'telemetry', {
        denied: true,
        projectedMicros: projected
      });
      binding.updatedAt = observation.at || stamp();
      return { runtime: next, binding: clone(binding), denied: true };
    }
    binding.budget.consumedMicros = projected;
    appendTrace(trace, observation, 'telemetry');
  } else if (observation.kind === 'checkpoint') {
    if (observation.location !== 'gummy-box') {
      throw new Error('Runtime checkpoint must be persisted in Gummy Box');
    }
    binding.status = 'checkpointed';
    binding.checkpoint = {
      handle: observation.handle,
      digest: observation.digest,
      location: 'gummy-box',
      at: observation.at || stamp()
    };
    appendTrace(trace, observation, 'checkpoint');
  } else if (observation.kind === 'provider-status') {
    const mapped = {
      submitted: 'dispatched',
      working: 'active',
      input_required: 'input_required',
      completed: 'return_pending',
      failed: 'failed',
      cancelled: 'cancelled'
    }[observation.status];
    if (!mapped) throw new Error(`Unsupported provider status: ${observation.status}`);
    binding.status = mapped;
    appendTrace(
      trace,
      observation,
      observation.status === 'completed' ? 'return-candidate' : 'telemetry'
    );
  } else if (observation.kind === 'provider-fault') {
    binding.status = 'checkpointed';
    binding.fault = observation.fault;
    appendTrace(trace, observation, 'telemetry');
  } else {
    throw new Error(`Unsupported runtime observation: ${observation.kind}`);
  }

  binding.updatedAt = observation.at || stamp();
  return { runtime: next, binding: clone(binding), duplicate: false };
}

export function recordMasterControlDecision(runtime, bindingId, input) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  if (!input.humanId) throw new Error('Master Control decision requires Human identity');
  const allowed = [
    'approve-input',
    'approve-continuation',
    'approve-acceptance',
    'approve-release',
    'deny',
    'cancel'
  ];
  if (!allowed.includes(input.decision)) {
    throw new Error(`Unsupported Master Control decision: ${input.decision}`);
  }

  if (input.decision === 'approve-input' && binding.status !== 'input_required') {
    throw new Error('Input approval requires input_required state');
  }
  if (input.decision === 'approve-continuation') {
    if (!['budget_stopped', 'checkpointed'].includes(binding.status)) {
      throw new Error('Continuation approval requires a stopped checkpoint');
    }
    if (
      !Number.isInteger(input.hardStopMicros) ||
      input.hardStopMicros < binding.budget.hardStopMicros ||
      input.hardStopMicros > binding.budget.authorizedMicros
    ) {
      throw new Error('Continuation ceiling is outside Production Pool authorization');
    }
    binding.budget.hardStopMicros = input.hardStopMicros;
  }
  if (input.decision === 'approve-acceptance') {
    const receipt = receiptFor(next, binding);
    if (!receipt) throw new Error('Acceptance requires a Gummy Receipt');
  }
  if (input.decision === 'approve-release') {
    if (binding.acceptanceStatus !== 'accepted' || !binding.distributionPlanId) {
      throw new Error('Release requires acceptance and a Distribution Plan');
    }
  }
  if (input.decision === 'deny') binding.status = 'checkpointed';
  if (input.decision === 'cancel') binding.status = 'cancelled';

  const decision = {
    schema: 'gummy.master-control-decision/v1',
    id: input.id,
    runtimeBindingId: binding.id,
    productionId: binding.productionId,
    humanId: input.humanId,
    decision: input.decision,
    reason: input.reason,
    hardStopMicros: input.hardStopMicros,
    createdAt: input.createdAt || stamp()
  };
  next.masterControlDecisions.push(decision);
  appendTrace(traceFor(next, binding.id), {
    eventId: `decision:${decision.id}`,
    kind: `master-control.${decision.decision}`,
    at: decision.createdAt
  }, 'authority');
  binding.updatedAt = decision.createdAt;
  return { runtime: next, binding: clone(binding), decision: clone(decision) };
}

export function continueRuntimeBinding(runtime, bindingId, input) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  const approved = next.masterControlDecisions
    .filter(item => item.runtimeBindingId === bindingId)
    .some(item => item.decision === 'approve-continuation');
  if (!approved) throw new Error('Runtime continuation requires Master Control approval');
  if (binding.status === 'return_pending') {
    throw new Error('Runtime completion cannot be continued');
  }
  binding.status = 'active';
  binding.updatedAt = input.at || stamp();
  appendTrace(traceFor(next, binding.id), {
    eventId: input.eventId,
    kind: 'runtime.continued',
    at: binding.updatedAt
  }, 'authority');
  return { runtime: next, binding: clone(binding) };
}

export function recordRuntimeReturn(runtime, bindingId, input) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  if (binding.status !== 'return_pending') {
    throw new Error('Gummy Return requires a completed return candidate');
  }
  const existing = next.returns.find(item => item.id === input.id);
  if (existing) return { runtime: next, returned: clone(existing), duplicate: true };

  const returned = {
    schema: 'gummy.work-return/v0',
    id: input.id,
    runtimeBindingId: binding.id,
    productionId: binding.productionId,
    workOrderId: binding.workOrderId,
    actorId: binding.actorId,
    agentId: binding.agentId,
    result: input.result,
    summary: input.summary,
    gummyIds: clone(input.gummyIds || []),
    providerEvidenceIds: clone(input.providerEvidenceIds || []),
    createdAt: input.createdAt || stamp()
  };
  next.returns.push(returned);
  binding.status = 'returned';
  binding.returnId = returned.id;
  binding.updatedAt = returned.createdAt;
  appendTrace(traceFor(next, binding.id), {
    eventId: `return:${returned.id}`,
    kind: 'gummy-return.recorded',
    at: returned.createdAt
  }, 'return');
  return { runtime: next, returned: clone(returned), duplicate: false };
}

export function recordRuntimeReceipt(runtime, bindingId, input) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  const returned = next.returns.find(item => item.id === binding.returnId);
  if (!returned) throw new Error('Gummy Receipt requires a Gummy Return');
  const existing = next.receipts.find(item => item.id === input.id);
  if (existing) return { runtime: next, receipt: clone(existing), duplicate: true };

  const receipt = {
    schema: 'gummy.action-receipt/v0',
    id: input.id,
    runtimeBindingId: binding.id,
    productionId: binding.productionId,
    action: 'runtime.return-recorded',
    outcome: input.outcome,
    summary: input.summary,
    resources: [binding.id, returned.id, ...(input.resources || [])],
    createdAt: input.createdAt || stamp()
  };
  next.receipts.push(receipt);
  binding.receiptId = receipt.id;
  binding.updatedAt = receipt.createdAt;
  appendTrace(traceFor(next, binding.id), {
    eventId: `receipt:${receipt.id}`,
    kind: 'gummy-receipt.recorded',
    at: receipt.createdAt
  }, 'receipt');
  return { runtime: next, receipt: clone(receipt), duplicate: false };
}

export function acceptRuntimeReturn(runtime, bindingId, input) {
  let next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  if (!receiptFor(next, binding)) throw new Error('Human acceptance requires Receipt');
  if (binding.acceptanceStatus === 'accepted') {
    return { runtime: next, binding: clone(binding), duplicate: true };
  }
  const recorded = recordMasterControlDecision(next, bindingId, {
    id: input.id,
    humanId: input.humanId,
    decision: 'approve-acceptance',
    reason: input.reason,
    createdAt: input.createdAt
  });
  next = recorded.runtime;
  const acceptedBinding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  acceptedBinding.acceptanceStatus = 'accepted';
  const acceptance = {
    schema: 'gummy.human-acceptance/v1',
    id: `acceptance:${input.id}`,
    runtimeBindingId: bindingId,
    returnId: acceptedBinding.returnId,
    receiptId: acceptedBinding.receiptId,
    humanId: input.humanId,
    decisionId: input.id,
    createdAt: input.createdAt || stamp()
  };
  next.runtimeAcceptanceDecisions.push(acceptance);
  appendTrace(traceFor(next, bindingId), {
    eventId: acceptance.id,
    kind: 'human-acceptance.recorded',
    at: acceptance.createdAt
  }, 'acceptance');
  return { runtime: next, binding: clone(acceptedBinding), acceptance };
}

export function attachDistributionPlan(runtime, bindingId, distributionPlanId) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  if (binding.acceptanceStatus !== 'accepted') {
    throw new Error('Distribution Plan requires Human acceptance');
  }
  const plan = requiredObject(next.distributionPlans, distributionPlanId, 'Distribution Plan');
  assertSameProduction(binding.productionId, plan.productionId, 'Distribution Plan');
  binding.distributionPlanId = plan.id;
  binding.updatedAt = stamp();
  return { runtime: next, binding: clone(binding), distributionPlan: clone(plan) };
}

export function releaseRuntimeDistribution(runtime, bindingId, input) {
  const next = migrateRuntimeExecutionState(runtime);
  const binding = requiredObject(next.runtimeBindings, bindingId, 'Runtime Binding');
  const approval = next.masterControlDecisions.some(
    item => item.runtimeBindingId === bindingId && item.decision === 'approve-release'
  );
  if (!approval || binding.acceptanceStatus !== 'accepted' || !binding.distributionPlanId) {
    throw new Error('Publication requires explicit release approval');
  }
  binding.releasedAt = input.releasedAt || stamp();
  binding.updatedAt = binding.releasedAt;
  appendTrace(traceFor(next, bindingId), {
    eventId: input.eventId,
    kind: 'distribution.released',
    at: binding.releasedAt
  }, 'publication');
  return { runtime: next, binding: clone(binding) };
}

export function projectRuntimeCommandCenter(runtime, productionId = null) {
  const source = migrateRuntimeExecutionState(runtime);
  const bindings = source.runtimeBindings
    .filter(item => !productionId || item.productionId === productionId)
    .map(binding => ({
      runtimeBindingId: binding.id,
      actorId: binding.actorId,
      agentId: binding.agentId,
      productionId: binding.productionId,
      workOrderId: binding.workOrderId,
      provider: clone(binding.provider),
      status: binding.status,
      consumedMicros: binding.budget.consumedMicros,
      hardStopMicros: binding.budget.hardStopMicros,
      waitingHumanInput: binding.status === 'input_required',
      returnId: binding.returnId || null,
      receiptId: binding.receiptId || null,
      acceptanceStatus: binding.acceptanceStatus,
      distributionPlanId: binding.distributionPlanId,
      releasedAt: binding.releasedAt,
      authorityCanExecute: false
    }));
  return Object.freeze({
    schema: 'gummy.command-center-runtime-projection/v1',
    generatedAt: stamp(),
    productionId,
    bindings,
    decisions: source.masterControlDecisions
      .filter(item => bindings.some(binding => binding.runtimeBindingId === item.runtimeBindingId))
      .map(clone),
    authorityCanExecute: false
  });
}

export class DeterministicRuntimeTransport {
  constructor({ profileId, observations = [] }) {
    this.profileId = profileId;
    this.observations = clone(observations);
    this.offset = 0;
    this.cancelled = false;
  }

  describe() {
    return { profileId: this.profileId, live: false, deterministic: true };
  }

  dispatch(binding, idempotencyKey) {
    if (!binding?.id || !idempotencyKey) {
      throw new Error('Deterministic dispatch requires binding and idempotency key');
    }
    return { handle: `deterministic:${binding.id}`, idempotencyKey };
  }

  poll() {
    if (this.cancelled) return { kind: 'provider-status', status: 'cancelled' };
    return clone(this.observations[this.offset++] || null);
  }

  provideInput(_handle, decision) {
    if (decision?.authority !== 'master-control') {
      throw new Error('Deterministic input requires Master Control');
    }
    return { accepted: true };
  }

  checkpoint(handle, digest) {
    return { handle, digest, location: 'gummy-box' };
  }

  restore(checkpoint) {
    if (checkpoint?.location !== 'gummy-box') {
      throw new Error('Deterministic restore requires Gummy Box');
    }
    return { restored: true, handle: checkpoint.handle };
  }

  cancel() {
    this.cancelled = true;
    return { cancelled: true };
  }
}

function appendTrace(trace, event, evidenceClass, extra = {}) {
  trace.events.push({
    sequence: trace.events.length,
    eventId: event.eventId,
    kind: event.kind,
    at: event.at || stamp(),
    evidenceClass,
    ...extra
  });
}

function traceFor(runtime, bindingId) {
  return requiredObject(
    runtime.executionTraces,
    `trace:${bindingId}`,
    'Execution Trace'
  );
}

function receiptFor(runtime, binding) {
  return runtime.receipts.find(item => item.id === binding.receiptId);
}

function requiredObject(collection, id, label) {
  const found = (collection || []).find(item => item.id === id);
  if (!found) throw new Error(`${label} required: ${id}`);
  return found;
}

function assertReference(expected, actual, label) {
  if (actual && actual !== expected) throw new Error(`${label} mismatch`);
}

function assertSameProduction(expected, actual, label) {
  if (actual && actual !== expected) throw new Error(`${label} Production mismatch`);
}

function assertActive(object, label) {
  if (!['active', 'approved', 'issued'].includes(object.status)) {
    throw new Error(`${label} is not active`);
  }
}
