const REQUIRED_BINDING_PREFIXES = Object.freeze({
  humanOwnerId: "human:",
  actorId: "actor:",
  agentId: "agent:",
  productionId: "production:",
  workOrderId: "work-order:",
  authorityLeaseId: "lease:",
  moldId: "mold:",
  grantId: "grant:",
  runtimeBindingId: "runtime-binding:",
  operationalMemoryScopeId: "memory-scope:",
  returnAnchor: "gummy-box:"
});

export function assertDelegationChain(binding) {
  for (const [field, prefix] of Object.entries(REQUIRED_BINDING_PREFIXES)) {
    if (!binding?.[field]?.startsWith(prefix)) {
      throw new Error(`delegation chain is missing ${field}`);
    }
  }
  if (binding.humanOwnerId === binding.actorId || binding.actorId === binding.agentId) {
    throw new Error("Human, Actor and Agent identities must remain distinct");
  }
  if (!binding.runtimePrincipal || binding.runtimePrincipal === binding.actorId) {
    throw new Error("provider runtime principal must remain distinct from the Actor");
  }
  return [
    binding.humanOwnerId,
    binding.actorId,
    binding.agentId,
    binding.workOrderId,
    `${binding.authorityLeaseId}+${binding.grantId}`,
    binding.runtimeBindingId,
    binding.runtimePrincipal
  ];
}

export function assertBindingSuccession(previous, next) {
  assertDelegationChain(previous);
  assertDelegationChain(next);
  for (const field of [
    "humanOwnerId",
    "actorId",
    "productionId",
    "workOrderId",
    "authorityLeaseId",
    "moldId",
    "grantId",
    "operationalMemoryScopeId",
    "returnAnchor"
  ]) {
    if (previous[field] !== next[field]) {
      throw new Error(`runtime succession changed ${field}`);
    }
  }
  if (next.runtimeBindingRevision <= previous.runtimeBindingRevision) {
    throw new Error("runtime binding revision must increase");
  }
  if (next.supersedesRuntimeBindingId !== previous.runtimeBindingId) {
    throw new Error("runtime binding succession must name the superseded binding");
  }
  if (!previous.revokedAt) {
    throw new Error("superseded runtime binding must be revoked");
  }
  if (Date.parse(previous.revokedAt) > Date.parse(next.createdAt)) {
    throw new Error("new runtime binding predates prior revocation");
  }
  return true;
}

export function assertRuntimePrincipalRotation(previous, next) {
  assertBindingSuccession(previous, next);
  for (const field of ["agentId", "runtimeProvider", "runtimeResourceId"]) {
    if (previous[field] !== next[field]) {
      throw new Error(`principal rotation changed ${field}`);
    }
  }
  if (previous.runtimePrincipal === next.runtimePrincipal) {
    throw new Error("runtime principal did not rotate");
  }
  if (
    previous.principalAttestation?.fingerprint ===
    next.principalAttestation?.fingerprint
  ) {
    throw new Error("runtime principal attestation did not rotate");
  }
  return true;
}

export function assertProviderFailover(previous, next) {
  assertBindingSuccession(previous, next);
  if (previous.agentId !== next.agentId) {
    throw new Error("provider failover changed the Agent");
  }
  if (previous.runtimeProvider === next.runtimeProvider) {
    throw new Error("provider failover did not change provider");
  }
  if (previous.runtimeResourceId === next.runtimeResourceId) {
    throw new Error("provider failover reused the runtime resource");
  }
  return true;
}

export function assertAgentReplacement(previous, next) {
  assertBindingSuccession(previous, next);
  if (previous.agentId === next.agentId) {
    throw new Error("Agent replacement did not change Agent identity");
  }
  if (previous.actorId !== next.actorId || previous.humanOwnerId !== next.humanOwnerId) {
    throw new Error("Agent replacement changed the enduring Actor or Human owner");
  }
  return true;
}

export function assertMemoryRevisionChain(memories, memoryId) {
  const revisions = memories
    .filter((memory) => memory.memoryId === memoryId)
    .sort((left, right) => left.revision - right.revision);
  if (revisions.length < 2) throw new Error("revision proof requires two memories");
  for (let index = 0; index < revisions.length; index += 1) {
    const memory = revisions[index];
    if (index === 0 && memory.supersedes !== null) {
      throw new Error("first memory revision cannot supersede another revision");
    }
    if (index > 0) {
      const prior = revisions[index - 1];
      if (
        memory.supersedes?.memoryId !== prior.memoryId ||
        memory.supersedes?.revision !== prior.revision
      ) {
        throw new Error("memory revision does not preserve its predecessor");
      }
      if (prior.status !== "superseded") {
        throw new Error("prior memory revision is not marked superseded");
      }
    }
  }
  return revisions;
}

export function selectOperationalMemory(
  fixture,
  { memoryId, revision, actorId, agentId, productionId, use, at }
) {
  const memory = fixture.memories.find(
    (candidate) =>
      candidate.memoryId === memoryId && candidate.revision === revision
  );
  if (!memory) throw new Error("exact operational-memory revision not found");
  const scope = fixture.memoryScopePolicies.find(
    (candidate) => candidate.scopeId === memory.scopeId
  );
  if (!scope) throw new Error("operational memory has no Gummy scope policy");
  if (memory.actorId !== actorId || scope.actorId !== actorId) {
    throw new Error("cross-Actor operational memory use denied");
  }
  if (memory.productionId !== productionId || scope.productionId !== productionId) {
    throw new Error("cross-Production operational memory use denied");
  }
  if (memory.agentId !== agentId && !scope.permittedAgentIds.includes(agentId)) {
    throw new Error("Agent is not permitted by the memory scope");
  }
  if (!scope.permittedAgentIds.includes(agentId)) {
    throw new Error("Agent is not permitted by the memory scope");
  }
  if (memory.status !== "active") {
    throw new Error(`operational memory is ${memory.status}`);
  }
  if (memory.invalidatedAt) throw new Error("operational memory is invalidated");
  if (Date.parse(memory.expiresAt) <= Date.parse(at)) {
    throw new Error("operational memory is expired");
  }
  if (scope.revokedAt && Date.parse(scope.revokedAt) <= Date.parse(at)) {
    throw new Error("operational-memory scope is revoked");
  }
  if (Date.parse(scope.expiresAt) <= Date.parse(at)) {
    throw new Error("operational-memory scope is expired");
  }
  if (memory.ttl > scope.maximumTtl) {
    throw new Error("operational-memory TTL exceeds its scope policy");
  }
  if (!memory.allowedUses.includes(use) || !scope.allowedUses.includes(use)) {
    throw new Error("operational-memory use is not permitted");
  }
  if (
    memory.authoritative !== false ||
    memory.authorityEffect !== "none" ||
    memory.canonicalMutationApplied !== false
  ) {
    throw new Error("operational memory attempted to become authority");
  }
  return structuredClone(memory);
}

export function assertMemoryDerivation(memory, derivation) {
  for (const field of [
    "memoryId",
    "scopeId",
    "actorId",
    "agentId",
    "productionId",
    "generatorProvider",
    "generatorModel",
    "canonicalStateVersionObserved"
  ]) {
    if (memory[field] !== derivation[field]) {
      throw new Error(`memory derivation changed ${field}`);
    }
  }
  if (memory.revision !== derivation.memoryRevision) {
    throw new Error("memory derivation references the wrong revision");
  }
  for (const ref of memory.sourceEventRefs) {
    if (!derivation.sourceEventRefs.includes(ref)) {
      throw new Error("memory derivation omitted a source event");
    }
  }
  for (const hash of memory.sourceHashes) {
    if (!derivation.sourceHashes.includes(hash)) {
      throw new Error("memory derivation omitted a source hash");
    }
  }
  if (
    derivation.authoritative !== false ||
    derivation.authorityEffect !== "none" ||
    derivation.canonicalMutationApplied !== false
  ) {
    throw new Error("memory derivation attempted to become authority");
  }
  return true;
}

export function compileReceiptEvidenceInput(bundle, memories) {
  if (bundle.classification !== "receipt-input" || bundle.receiptAuthority !== "gummy") {
    throw new Error("provider evidence attempted to become a Receipt");
  }
  const exactMemoryRevisions = memories.map((memory) => {
    const read = bundle.memoryReads.find(
      (candidate) =>
        candidate.memoryId === memory.memoryId &&
        candidate.revision === memory.revision &&
        candidate.scopeId === memory.scopeId
    );
    if (!read) {
      throw new Error(
        `provider evidence omitted ${memory.memoryId} revision ${memory.revision}`
      );
    }
    return {
      memoryId: read.memoryId,
      revision: read.revision,
      scopeId: read.scopeId,
      contentHash: read.contentHash
    };
  });
  return {
    schema: "gummy.receipt-evidence-input/v1",
    providerEvidenceBundleId: bundle.providerEvidenceBundleId,
    runtimeBindingId: bundle.runtimeBindingId,
    exactMemoryRevisions,
    providerTerminalState: bundle.observedTerminalState,
    providerTelemetryClassification: "evidence-only",
    returnCreated: false,
    receiptCreated: false,
    acceptanceState: "not-requested",
    canonicalMutationApplied: false
  };
}

export function assertContinuationAuthority(policy, binding, at) {
  const instant = Date.parse(at);
  if (Number.isNaN(instant)) throw new Error("invalid continuation timestamp");
  if (instant >= Date.parse(policy.leaseExpiry)) {
    throw new Error("Authority Lease expired during long work");
  }
  if (instant >= Date.parse(policy.grantExpiry)) {
    throw new Error("Grant expired during long work");
  }
  if (instant >= Date.parse(binding.expiresAt)) {
    throw new Error("Runtime Binding expired during long work");
  }
  if (binding.revokedAt && instant >= Date.parse(binding.revokedAt)) {
    throw new Error("Runtime Binding revoked during long work");
  }
  if (
    policy.providerContinuationRenewsAuthority !== false ||
    policy.ambientAuthorityAllowed !== false
  ) {
    throw new Error("provider continuity attempted to create ambient authority");
  }
  return true;
}

export class DeterministicLongRunningWork {
  constructor({ policy, bindings }) {
    this.policy = structuredClone(policy);
    this.bindings = new Map(
      bindings.map((binding) => [binding.runtimeBindingId, structuredClone(binding)])
    );
    this.binding = structuredClone(bindings[0]);
    this.state = "idle";
    this.canonicalStateVersion = this.binding.canonicalStateVersion;
    this.checkpointId = null;
    this.consumedMicros = policy.budgetCeiling.consumedMicros;
    this.providerCompleted = false;
    this.returnRecorded = false;
    this.receiptRecorded = false;
    this.accepted = false;
    this.terminated = false;
    this.events = [];
  }

  apply(event) {
    const record = structuredClone(event);
    switch (event.kind) {
      case "start":
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.state = "running";
        break;
      case "runtime-binding-transition": {
        const next = this.requireBinding(event.runtimeBindingId);
        assertRuntimePrincipalRotation(this.binding, next);
        this.binding = next;
        break;
      }
      case "checkpoint":
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.checkpointId = event.checkpointId;
        this.state = "checkpointed";
        break;
      case "provider-outage":
        if (!this.checkpointId) throw new Error("provider outage has no Gummy checkpoint");
        this.state = "interrupted";
        break;
      case "failover": {
        if (!this.checkpointId) throw new Error("provider failover requires checkpoint");
        const next = this.requireBinding(event.runtimeBindingId);
        assertProviderFailover(this.binding, next);
        this.binding = next;
        this.state = "checkpointed";
        break;
      }
      case "resume":
        if (!this.checkpointId || event.checkpointId !== this.checkpointId) {
          throw new Error("resume requires the exact Gummy checkpoint");
        }
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.state = "running";
        break;
      case "input-required":
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.state = "input-required";
        break;
      case "human-input":
        if (this.state !== "input-required") {
          throw new Error("Human input has no active pause");
        }
        if (event.authority !== "master-control") {
          throw new Error("Human input must route through Master Control");
        }
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.state = "running";
        break;
      case "canonical-state-advanced":
        this.canonicalStateVersion = event.canonicalStateVersion;
        break;
      case "provider-completion":
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.providerCompleted = true;
        this.state =
          this.canonicalStateVersion === this.binding.canonicalStateVersion
            ? "result-candidate"
            : this.policy.staleCanonicalStatePolicy.state;
        break;
      case "cancellation-requested":
        assertContinuationAuthority(this.policy, this.binding, event.at);
        this.state = "cancellation-requested";
        break;
      case "cancellation-acknowledged":
        if (this.state !== "cancellation-requested") {
          throw new Error("cancellation acknowledgement has no request");
        }
        this.state = "cancellation-acknowledged";
        break;
      case "terminated":
        if (this.state !== "cancellation-acknowledged") {
          throw new Error("termination requires acknowledged cancellation");
        }
        this.terminated = true;
        this.state = "cancelled";
        break;
      case "budget-charge": {
        assertContinuationAuthority(this.policy, this.binding, event.at);
        const projected = this.consumedMicros + event.amountMicros;
        if (projected > this.policy.budgetCeiling.hardStopMicros) {
          this.state = "budget-stopped";
          this.checkpointId ||= "gummy-box-checkpoint:budget-stop";
          break;
        }
        this.consumedMicros = projected;
        if (projected >= this.policy.budgetCeiling.warningMicros) {
          this.state = "budget-warning";
        }
        break;
      }
      default:
        throw new Error(`unknown long-running event ${event.kind}`);
    }
    this.events.push(record);
    return this.snapshot();
  }

  replay(events) {
    for (const event of events) this.apply(event);
    return this.snapshot();
  }

  requireBinding(runtimeBindingId) {
    const binding = this.bindings.get(runtimeBindingId);
    if (!binding) throw new Error(`unknown runtime binding ${runtimeBindingId}`);
    return structuredClone(binding);
  }

  snapshot() {
    return {
      state: this.state,
      runtimeBindingId: this.binding.runtimeBindingId,
      actorId: this.binding.actorId,
      agentId: this.binding.agentId,
      workOrderId: this.binding.workOrderId,
      returnAnchor: this.binding.returnAnchor,
      canonicalStateVersion: this.canonicalStateVersion,
      checkpointId: this.checkpointId,
      consumedMicros: this.consumedMicros,
      providerCompleted: this.providerCompleted,
      returnRecorded: this.returnRecorded,
      receiptRecorded: this.receiptRecorded,
      accepted: this.accepted,
      terminated: this.terminated
    };
  }
}

export function evaluateThreatCase(fixture, threat) {
  const binding = fixture.runtimeBindings[0];
  const policy = fixture.longRunningWorkPolicy;
  const activeMemory = fixture.memories.find(
    (memory) =>
      memory.memoryId === "memory:repository-conventions" && memory.revision === 2
  );
  let denied = false;
  let reason = "";

  switch (threat.id) {
    case "provider-principal-credential-replay":
      denied =
        threat.observedFingerprint !== binding.principalAttestation.fingerprint;
      reason = "runtime-principal attestation mismatch";
      break;
    case "runtime-principal-reused-by-wrong-agent":
      denied = threat.requestedAgentId !== binding.agentId;
      reason = "runtime principal is bound to another Agent";
      break;
    case "actor-agent-runtime-identity-confusion":
      denied =
        threat.claimedActorId !== binding.actorId ||
        !threat.claimedActorId.startsWith("actor:");
      reason = "Actor claim uses the wrong identity class";
      break;
    case "memory-poisoning":
      denied =
        threat.sourceHashesValid !== true ||
        activeMemory.sourceHashes.length !==
          fixture.memoryDerivations[0].sourceHashes.length;
      reason = "memory provenance is incomplete";
      break;
    case "cross-actor-memory-leakage": {
      const memory = fixture.memories.find(
        (candidate) => candidate.memoryId === threat.memoryId
      );
      denied = memory.actorId !== binding.actorId;
      reason = "memory belongs to another Actor";
      break;
    }
    case "cross-production-memory-leakage":
      denied = threat.requestedProductionId !== binding.productionId;
      reason = "memory request crosses Production scope";
      break;
    case "expired-memory-use": {
      const memory = fixture.memories.find(
        (candidate) => candidate.memoryId === threat.memoryId
      );
      denied =
        memory.status === "expired" ||
        Date.parse(memory.expiresAt) <= Date.parse(fixture.clock.startedAt);
      reason = "memory revision is expired";
      break;
    }
    case "generated-memory-treated-as-canonical":
      denied =
        threat.canonicalMutationRequested === true &&
        activeMemory.canonicalMutationApplied === false;
      reason = "operational memory cannot mutate canonical state";
      break;
    case "stale-canonical-state-application":
      denied = threat.observedVersion !== threat.currentVersion;
      reason = "Return anchor is stale and requires reconciliation";
      break;
    case "lease-grant-expiry":
      try {
        assertContinuationAuthority(policy, { ...binding, revokedAt: null }, threat.at);
      } catch {
        denied = true;
      }
      reason = "Lease or Grant expired";
      break;
    case "provider-survives-gummy-revocation":
      denied =
        Boolean(binding.revokedAt) &&
        Date.parse(threat.at) >= Date.parse(binding.revokedAt);
      reason = "Gummy revocation terminates provider authority";
      break;
    case "cancellation-acknowledgement-as-termination":
      denied =
        policy.cancellationPolicy.acknowledgementIsTermination === false &&
        threat.terminalConfirmed !== true;
      reason = "cancellation acknowledgement is not termination";
      break;
    case "provider-logs-omitted-or-altered":
      denied = threat.logsComplete !== true || threat.hashesMatch !== true;
      reason = "provider evidence is incomplete or altered";
      break;
    case "duplicate-return-and-receipt":
      denied = threat.idempotencyKeySeen === true;
      reason = "duplicate Return or Receipt idempotency key";
      break;
    case "budget-overrun":
      denied =
        policy.budgetCeiling.consumedMicros + threat.chargeMicros >
        policy.budgetCeiling.hardStopMicros;
      reason = "budget hard stop reached";
      break;
    case "region-data-residency-mismatch":
      denied = threat.requestedRegion !== binding.region;
      reason = "runtime region violates the binding";
      break;
    case "provider-outage-without-checkpoint":
      denied = threat.checkpointAvailable !== true;
      reason = "provider outage has no Gummy-owned recovery point";
      break;
    case "runtime-redeployment-wrong-return-anchor":
      denied = threat.returnAnchor !== binding.returnAnchor;
      reason = "runtime redeployment changed Return anchor";
      break;
    case "prompt-attempts-permission-expansion":
      denied = !binding.operationClasses.includes(threat.requestedOperationClass);
      reason = "prompt requested an operation outside the Grant";
      break;
    case "destructive-action-misclassified":
      denied =
        threat.actualOperationClass === "destructive" &&
        threat.declaredOperationClass !== "destructive";
      reason = "destructive action was misclassified";
      break;
    default:
      throw new Error(`unknown threat case ${threat.id}`);
  }

  return {
    id: threat.id,
    status: denied ? "fail-closed" : "allowed",
    reason: denied ? reason : "all checked constraints remain valid"
  };
}
