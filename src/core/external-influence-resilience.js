const clone = value => structuredClone(value);

function requireRecord(records, id, label, field = 'id') {
  const record = records.find(item => item[field] === id);
  if (!record) throw new Error(`${label} not found: ${id}`);
  return record;
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(message);
}

function assertActive(record, at, label) {
  if (record.status !== 'active') throw new Error(`${label} is not active`);
  if (record.revokedAt && Date.parse(record.revokedAt) <= Date.parse(at)) {
    throw new Error(`${label} is revoked`);
  }
  if (Date.parse(record.expiresAt) <= Date.parse(at)) {
    throw new Error(`${label} is expired`);
  }
}

export function assertEndpointAuthority({
  endpoint,
  binding,
  lease,
  grant,
  at
}) {
  assertActive(lease, at, 'Authority Lease');
  assertActive(grant, at, 'Grant');
  assertEqual(binding.authorityLeaseId, lease.id, 'Runtime Binding uses another Lease');
  assertEqual(binding.grantId, grant.id, 'Runtime Binding uses another Grant');
  assertEqual(lease.workOrderId, binding.workOrderId, 'Lease uses another Work Order');
  assertEqual(lease.agentId, binding.agentId, 'Lease uses another Agent');
  assertEqual(grant.authorityLeaseId, lease.id, 'Grant uses another Lease');
  assertEqual(endpoint.runtimeBindingId, binding.runtimeBindingId, 'Endpoint uses another Runtime Binding');
  assertEqual(endpoint.agentId, binding.agentId, 'Endpoint uses another Agent');

  const leaseCapabilities = new Set(lease.allowedCapabilities);
  const grantCapabilities = new Set(grant.allowedCapabilities);
  const excessive = endpoint.exposedCapabilities.filter(
    capability => !leaseCapabilities.has(capability) || !grantCapabilities.has(capability)
  );
  if (excessive.length) {
    throw new Error(`Endpoint exceeds Lease or Grant authority: ${excessive.join(', ')}`);
  }
  if (endpoint.exposedCapabilities.includes('memory.admit')) {
    throw new Error('Tool endpoint cannot admit durable operational memory');
  }
  return true;
}

export function assertWorkerReplacement(previous, replacement) {
  for (const field of [
    'humanOwnerId',
    'actorId',
    'productionId',
    'workOrderId',
    'returnAnchor',
    'canonicalStateVersion'
  ]) {
    assertEqual(
      replacement[field],
      previous[field],
      `Worker replacement changed ${field}`
    );
  }
  if (replacement.agentId === previous.agentId) {
    throw new Error('Worker replacement must change Agent identity');
  }
  if (replacement.runtimeBindingId === previous.runtimeBindingId) {
    throw new Error('Worker replacement must change Runtime Binding');
  }
  if (replacement.supersedesRuntimeBindingId !== previous.runtimeBindingId) {
    throw new Error('Worker replacement must name the superseded Runtime Binding');
  }
  if (!previous.revokedAt) {
    throw new Error('Compromised Runtime Binding must be revoked before replacement');
  }
  if (Date.parse(previous.revokedAt) > Date.parse(replacement.createdAt)) {
    throw new Error('Replacement began before the compromised binding was revoked');
  }
  return true;
}

export function validateMemoryCandidate({
  candidate,
  binding,
  lease,
  grant,
  endpoint
}) {
  assertEndpointAuthority({
    endpoint,
    binding,
    lease,
    grant,
    at: candidate.createdAt
  });
  assertEqual(candidate.originatingActorId, binding.actorId, 'Memory Candidate crosses Actor scope');
  assertEqual(candidate.executingAgentId, binding.agentId, 'Memory Candidate uses another Agent');
  assertEqual(candidate.productionId, binding.productionId, 'Memory Candidate crosses Production scope');
  assertEqual(candidate.workOrderId, binding.workOrderId, 'Memory Candidate uses another Work Order');
  assertEqual(candidate.authorityLeaseId, lease.id, 'Memory Candidate uses another Lease');
  assertEqual(candidate.runtimeBindingId, binding.runtimeBindingId, 'Memory Candidate uses another Runtime Binding');
  assertEqual(candidate.proposedScope.actorId, binding.actorId, 'Proposed memory scope crosses Actor');
  assertEqual(candidate.proposedScope.productionId, binding.productionId, 'Proposed memory scope crosses Production');
  if (!candidate.proposedScope.permittedAgentIds.includes(binding.agentId)) {
    throw new Error('Proposed memory scope excludes the executing Agent');
  }
  assertEqual(
    candidate.canonicalStateVersionObserved,
    binding.canonicalStateVersion,
    'Memory Candidate uses another canonical-state version'
  );
  assertEqual(
    candidate.runtimeAttestation.runtimeBindingId,
    binding.runtimeBindingId,
    'Memory Candidate attestation uses another Runtime Binding'
  );
  assertEqual(
    candidate.runtimeAttestation.runtimeBindingRevision,
    binding.runtimeBindingRevision,
    'Memory Candidate attestation uses another binding revision'
  );
  assertEqual(
    candidate.runtimeAttestation.runtimePrincipal,
    binding.runtimePrincipal,
    'Memory Candidate attestation uses another runtime principal'
  );
  assertEqual(
    candidate.runtimeAttestation.fingerprint,
    binding.principalAttestation.fingerprint,
    'Memory Candidate runtime attestation fingerprint mismatch'
  );
  if (!endpoint.exposedCapabilities.includes('memory.propose')) {
    throw new Error('Endpoint lacks memory.propose authority');
  }
  if (candidate.status !== 'proposed') {
    throw new Error('Memory Candidate is not awaiting admission');
  }
  if (Date.parse(candidate.proposedExpiry) <= Date.parse(candidate.createdAt)) {
    throw new Error('Memory Candidate expiry must follow creation');
  }
  if (Date.parse(candidate.runtimeAttestation.observedAt) > Date.parse(candidate.createdAt)) {
    throw new Error('Memory Candidate attestation cannot be observed in the future');
  }
  if (
    candidate.sourceEvidence.some(
      evidence => Date.parse(evidence.observedAt) > Date.parse(candidate.createdAt)
    )
  ) {
    throw new Error('Memory Candidate source evidence cannot be observed in the future');
  }
  if (
    candidate.authoritative !== false ||
    candidate.authorityEffect !== 'none' ||
    candidate.durableWriteApplied !== false ||
    candidate.canonicalMutationApplied !== false
  ) {
    throw new Error('Memory Candidate attempted to bypass admission');
  }
  if (!candidate.sourceEvidence.length) {
    throw new Error('Memory Candidate requires source evidence');
  }
  const evidenceIds = new Set(candidate.sourceEvidence.map(item => item.evidenceId));
  for (const claim of candidate.claims) {
    if (claim.sourceEvidenceIds.some(id => !evidenceIds.has(id))) {
      throw new Error(`Memory Candidate claim has missing evidence: ${claim.claimId}`);
    }
  }
  return clone(candidate);
}

export function validateMemoryAdmissionDecision(candidate, decision) {
  assertEqual(decision.candidateId, candidate.candidateId, 'Admission decision uses another candidate');
  assertEqual(decision.candidateDigest, candidate.contentDigest, 'Admission decision digest mismatch');
  assertEqual(decision.actorId, candidate.originatingActorId, 'Admission decision uses another Actor');
  assertEqual(decision.productionId, candidate.productionId, 'Admission decision uses another Production');
  if (
    decision.actorAcceptance !== true ||
    decision.automaticDecision !== false ||
    decision.canonicalMutationApplied !== false
  ) {
    throw new Error('Memory admission must remain explicit and non-canonical');
  }
  if (Date.parse(decision.decidedAt) < Date.parse(candidate.createdAt)) {
    throw new Error('Memory admission decision predates the candidate');
  }
  if (Date.parse(decision.decidedAt) >= Date.parse(candidate.proposedExpiry)) {
    throw new Error('Memory admission decision occurred after candidate expiry');
  }
  if (decision.decision === 'accept') {
    if (!Object.values(decision.validation).every(Boolean)) {
      throw new Error('Accepted memory requires every admission validation');
    }
    if (!decision.acceptedOperationalMemory) {
      throw new Error('Accepted memory requires an admitted operational-memory reference');
    }
  } else if (decision.acceptedOperationalMemory !== null) {
    throw new Error('Rejected or quarantined memory cannot create admitted memory');
  }
  return clone(decision);
}

export function validateAdmittedOperationalMemory({
  memory,
  candidate,
  decision
}) {
  validateMemoryAdmissionDecision(candidate, decision);
  if (decision.decision !== 'accept') {
    throw new Error('Only an accepted Memory Candidate can become admitted memory');
  }
  const accepted = decision.acceptedOperationalMemory;
  assertEqual(memory.memoryId, accepted.memoryId, 'Admitted memory ID differs from decision');
  assertEqual(memory.revision, accepted.revision, 'Admitted memory revision differs from decision');
  assertEqual(memory.scopeId, accepted.scopeId, 'Admitted memory scope differs from decision');
  assertEqual(memory.candidateId, candidate.candidateId, 'Admitted memory uses another candidate');
  assertEqual(memory.admissionDecisionId, decision.decisionId, 'Admitted memory uses another decision');
  assertEqual(memory.contentDigest, candidate.contentDigest, 'Admitted memory content digest mismatch');
  assertEqual(memory.actorId, candidate.originatingActorId, 'Admitted memory crosses Actor scope');
  assertEqual(memory.productionId, candidate.productionId, 'Admitted memory crosses Production scope');
  assertEqual(memory.acceptedByHumanId, decision.humanAuthorityId, 'Admitted memory uses another Human acceptance');
  assertEqual(memory.acceptedByActorId, decision.actorId, 'Admitted memory uses another Actor acceptance');
  if (
    memory.authoritative !== false ||
    memory.authorityEffect !== 'none' ||
    memory.canonicalMutationApplied !== false
  ) {
    throw new Error('Admitted operational memory attempted to become canonical authority');
  }
  return clone(memory);
}

export function reconstructTrustedOperationalMemory({
  candidates,
  decisions,
  admittedMemories,
  suspectedCompromiseAt,
  canonicalStateVersion
}) {
  const admitted = [];
  const excluded = [];
  const decisionByCandidate = new Map(
    decisions.map(decision => [decision.candidateId, decision])
  );
  const memoryByCandidate = new Map(
    admittedMemories.map(memory => [memory.candidateId, memory])
  );

  for (const candidate of candidates) {
    const decision = decisionByCandidate.get(candidate.candidateId);
    const memory = memoryByCandidate.get(candidate.candidateId);
    let reason = null;
    if (!decision) reason = 'unresolved-admission';
    else if (decision.decision !== 'accept') reason = `actor-${decision.decision}`;
    else if (!memory) reason = 'accepted-without-admitted-memory';
    else if (
      Date.parse(candidate.createdAt) >= Date.parse(suspectedCompromiseAt) ||
      Date.parse(memory.acceptedAt) >= Date.parse(suspectedCompromiseAt)
    ) {
      reason = 'after-suspected-compromise';
    } else if (memory.status !== 'active') {
      reason = `memory-${memory.status}`;
    }

    if (reason) {
      excluded.push({
        candidateId: candidate.candidateId,
        memoryId: memory?.memoryId || null,
        decisionId: decision?.decisionId || null,
        reason
      });
      continue;
    }
    validateAdmittedOperationalMemory({ memory, candidate, decision });
    admitted.push(clone(memory));
  }

  return {
    schema: 'gummy.operational-memory-reconstruction/v1',
    suspectedCompromiseAt,
    canonicalStateVersion,
    admitted,
    excluded,
    canonicalMutationApplied: false
  };
}

export function validateExecutionObservation({
  observation,
  bindings,
  leases,
  grants,
  endpoints
}) {
  const observerBinding = requireRecord(
    bindings,
    observation.observerRuntimeId,
    'Observer Runtime Binding',
    'runtimeBindingId'
  );
  if (observation.observerAgentId === observation.executingAgentId) {
    throw new Error('Observer Agent must be independent from the executing Agent');
  }
  if (observation.observerRuntimeId === observation.executingRuntimeId) {
    throw new Error('Observer runtime must be independent from the executing runtime');
  }
  if (
    observation.independentObserver !== true ||
    observation.workerReportAuthority !== false ||
    observation.observerCanAccept !== false ||
    observation.canonicalMutationApplied !== false ||
    observation.acceptanceStatus !== 'not-reviewed'
  ) {
    throw new Error('Observer evidence attempted to become authority or acceptance');
  }
  for (const field of ['actorId', 'productionId', 'workOrderId', 'returnAnchor']) {
    assertEqual(
      observation[field],
      observerBinding[field],
      `Observer Binding changed ${field}`
    );
  }
  assertEqual(
    observation.observerAgentId,
    observerBinding.agentId,
    'Observation uses another observer Agent'
  );
  const observerLease = requireRecord(
    leases,
    observation.observerAuthorityLeaseId,
    'Observer Lease'
  );
  const observerGrant = requireRecord(
    grants,
    observerBinding.grantId,
    'Observer Grant'
  );
  const observerEndpoint = requireRecord(
    endpoints,
    observerBinding.runtimeBindingId,
    'Observer Endpoint',
    'runtimeBindingId'
  );
  assertEndpointAuthority({
    endpoint: observerEndpoint,
    binding: observerBinding,
    lease: observerLease,
    grant: observerGrant,
    at: observation.createdAt
  });

  const segmentBindings = observation.runtimeSegments.map(segment => {
    const binding = requireRecord(
      bindings,
      segment.runtimeBindingId,
      'Executing Runtime Binding',
      'runtimeBindingId'
    );
    assertEqual(segment.executingAgentId, binding.agentId, 'Runtime segment uses another Agent');
    assertEqual(segment.authorityLeaseId, binding.authorityLeaseId, 'Runtime segment uses another Lease');
    for (const field of ['actorId', 'productionId', 'workOrderId', 'returnAnchor']) {
      assertEqual(observation[field], binding[field], `Runtime segment changed ${field}`);
    }
    return binding;
  });
  if (
    segmentBindings.some(binding =>
      binding.agentId === observation.observerAgentId ||
      binding.runtimeBindingId === observation.observerRuntimeId
    )
  ) {
    throw new Error('Observer is not independent from every executing segment');
  }
  for (let index = 0; index < observation.progressEvents.length; index += 1) {
    const event = observation.progressEvents[index];
    if (event.sequence !== index) throw new Error('Observation progress sequence is not contiguous');
    const binding = requireRecord(
      segmentBindings,
      event.runtimeBindingId,
      'Observed Runtime Binding',
      'runtimeBindingId'
    );
    assertEqual(event.executingAgentId, binding.agentId, 'Progress event uses another Agent');
  }
  if (!observation.completionEvidence.length) {
    throw new Error('Observer requires completion evidence');
  }
  assertEqual(
    observation.canonicalStateVersion,
    observation.observedStateBefore.canonicalStateVersion,
    'Observed before-state uses another canonical version'
  );
  assertEqual(
    observation.canonicalStateVersion,
    observation.observedStateAfter.canonicalStateVersion,
    'Observed after-state uses another canonical version'
  );
  return clone(observation);
}

function evaluateCriterion(criterion, {
  observation,
  workReturn,
  candidates,
  decisions
}) {
  const evidenceRefs = [];
  let outcome = 'fail';
  if (criterion.kind === 'state-digest') {
    evidenceRefs.push(observation.observationId, workReturn.id);
    outcome =
      observation.observedStateAfter.digest === criterion.expected &&
      workReturn.extensions.claimedStateAfterDigest === criterion.expected
        ? 'pass'
        : 'fail';
  } else if (criterion.kind === 'completion-evidence-kind') {
    const match = observation.completionEvidence.find(
      evidence => evidence.kind === criterion.expected
    );
    if (match) evidenceRefs.push(match.ref);
    outcome = match ? 'pass' : 'fail';
  } else if (criterion.kind === 'progress-event-kind') {
    const match = observation.progressEvents.find(event => event.kind === criterion.expected);
    if (match) evidenceRefs.push(match.eventId);
    outcome = match ? 'pass' : 'fail';
  } else if (criterion.kind === 'memory-decisions-resolved') {
    const candidateIds = candidates
      .filter(candidate => candidate.workOrderId === workReturn.workOrderId)
      .map(candidate => candidate.candidateId);
    const resolved = candidateIds.every(candidateId =>
      decisions.some(decision => decision.candidateId === candidateId)
    );
    evidenceRefs.push(
      ...decisions
        .filter(decision => candidateIds.includes(decision.candidateId))
        .map(decision => decision.decisionId)
    );
    outcome = resolved ? 'pass' : 'blocked';
  } else {
    throw new Error(`Unsupported reconciliation criterion: ${criterion.kind}`);
  }
  return {
    criterionId: criterion.criterionId,
    outcome,
    evidenceRefs: evidenceRefs.length ? evidenceRefs : [observation.observationId]
  };
}

export function reconcileObservedReturn({
  reconciliationId,
  workOrder,
  workReturn,
  observation,
  currentCanonicalStateVersion,
  candidates,
  decisions,
  createdAt
}) {
  const mismatches = [];
  for (const [actual, expected, label] of [
    [workReturn.workOrderId, workOrder.id, 'Work Return uses another Work Order'],
    [observation.workOrderId, workOrder.id, 'Observation uses another Work Order'],
    [workReturn.actorId, observation.actorId, 'Work Return uses another Actor'],
    [workReturn.extensions.productionId, observation.productionId, 'Work Return uses another Production'],
    [workReturn.extensions.returnAnchor, observation.returnAnchor, 'Work Return uses another Return anchor'],
    [
      workReturn.extensions.claimedStateAfterDigest,
      observation.observedStateAfter.digest,
      'Worker claim differs from observed state'
    ],
    [
      workOrder.canonicalStateVersion,
      observation.canonicalStateVersion,
      'Observation uses a stale commissioned canonical version'
    ],
    [
      currentCanonicalStateVersion,
      observation.canonicalStateVersion,
      'Current canonical state requires reconciliation'
    ]
  ]) {
    if (actual !== expected) mismatches.push(label);
  }
  if (workReturn.result !== 'completed') {
    mismatches.push('Worker Return is not completed');
  }
  const criteriaEvaluations = workOrder.acceptanceCriteria.map(criterion =>
    evaluateCriterion(criterion, {
      observation,
      workReturn,
      candidates,
      decisions
    })
  );
  if (criteriaEvaluations.some(item => item.outcome !== 'pass')) {
    mismatches.push('One or more Work Order acceptance criteria did not pass');
  }
  const relevantDecisions = decisions.filter(decision =>
    candidates.some(candidate =>
      candidate.workOrderId === workOrder.id &&
      candidate.candidateId === decision.candidateId
    )
  );
  const state = mismatches.length
    ? 'reconciliation-required'
    : 'matched-awaiting-human-acceptance';
  return {
    schema: 'gummy.return-reconciliation/v1',
    reconciliationId,
    workReturnId: workReturn.id,
    observationId: observation.observationId,
    actorId: observation.actorId,
    productionId: observation.productionId,
    workOrderId: workOrder.id,
    authorityLeaseIds: [...new Set(observation.runtimeSegments.map(item => item.authorityLeaseId))],
    runtimeBindingIds: [...new Set(observation.runtimeSegments.map(item => item.runtimeBindingId))],
    returnAnchor: observation.returnAnchor,
    commissionedCanonicalStateVersion: workOrder.canonicalStateVersion,
    observedCanonicalStateVersion: observation.canonicalStateVersion,
    currentCanonicalStateVersion,
    workerClaimDigest: workReturn.extensions.claimedStateAfterDigest,
    observedStateAfterDigest: observation.observedStateAfter.digest,
    completionEvidenceDigests: [
      ...new Set(observation.completionEvidence.map(item => item.digest))
    ],
    criteriaEvaluations,
    memoryAdmissionDecisionIds: relevantDecisions.map(item => item.decisionId),
    rejectedMemoryCandidateIds: relevantDecisions
      .filter(item => item.decision !== 'accept')
      .map(item => item.candidateId),
    workerReportClassification: 'claim',
    observerEvidenceRequired: true,
    humanAcceptanceRequired: true,
    acceptanceStatus: 'pending',
    state,
    canonicalMutationApplied: false,
    createdAt
  };
}

export function compileExternalInfluenceReceipt({
  receiptId,
  fixture,
  reconstruction,
  reconciliation
}) {
  const initialBinding = fixture.runtimeBindings[0];
  return {
    schema: 'gummy.action-receipt/v0',
    id: receiptId,
    action: 'external-influence.recovery-reconciled',
    humanAuthorityId: initialBinding.humanOwnerId,
    actorId: initialBinding.actorId,
    operatorType: 'agent',
    operatorId: fixture.returnReconciler.agentId,
    agentId: fixture.returnReconciler.agentId,
    moldId: fixture.returnReconciler.moldId,
    masterControlId: fixture.returnReconciler.masterControlId,
    taskLeaseId: fixture.returnReconciler.authorityLeaseId,
    application: 'Gummy OS Return Reconciler',
    outcome: reconciliation.state === 'matched-awaiting-human-acceptance'
      ? 'completed'
      : 'failed',
    reversible: true,
    resources: [
      reconciliation.reconciliationId,
      reconciliation.observationId,
      ...reconciliation.runtimeBindingIds,
      ...reconciliation.memoryAdmissionDecisionIds
    ],
    evidence: {
      traceRef: fixture.traceRef,
      executionObservationIds: [reconciliation.observationId],
      memoryMutationEvidence: fixture.memoryCandidates.map(candidate => {
        const decision = fixture.memoryAdmissionDecisions.find(
          item => item.candidateId === candidate.candidateId
        );
        return {
          candidateId: candidate.candidateId,
          candidateDigest: candidate.contentDigest,
          decisionId: decision?.decisionId || null,
          decision: decision?.decision || 'unresolved'
        };
      }),
      reconstructedMemoryIds: reconstruction.admitted.map(memory => memory.memoryId),
      excludedMemoryCandidates: reconstruction.excluded,
      workerReplacement: {
        revokedRuntimeBindingId: fixture.runtimeBindings[0].runtimeBindingId,
        replacementRuntimeBindingId: fixture.runtimeBindings[1].runtimeBindingId
      }
    },
    detail: 'Rejected and post-compromise memory mutations stayed out of reconstructed operational memory; independent observation reconciled the replacement worker Return and left Human acceptance pending.',
    createdAt: fixture.clock.receiptAt
  };
}

export function runExternalInfluenceRecoveryBenchmark(fixture) {
  const [initialBinding, replacementBinding] = fixture.runtimeBindings;
  assertWorkerReplacement(initialBinding, replacementBinding);

  for (const binding of fixture.runtimeBindings) {
    const lease = requireRecord(fixture.leases, binding.authorityLeaseId, 'Lease');
    const grant = requireRecord(fixture.grants, binding.grantId, 'Grant');
    const endpoint = requireRecord(
      fixture.endpoints,
      binding.runtimeBindingId,
      'Endpoint',
      'runtimeBindingId'
    );
    assertEndpointAuthority({
      endpoint,
      binding,
      lease,
      grant,
      at: binding.createdAt
    });
  }

  for (const candidate of fixture.memoryCandidates) {
    const binding = requireRecord(
      fixture.runtimeBindings,
      candidate.runtimeBindingId,
      'Candidate Runtime Binding',
      'runtimeBindingId'
    );
    const lease = requireRecord(fixture.leases, candidate.authorityLeaseId, 'Candidate Lease');
    const grant = requireRecord(fixture.grants, binding.grantId, 'Candidate Grant');
    const endpoint = requireRecord(
      fixture.endpoints,
      binding.runtimeBindingId,
      'Candidate Endpoint',
      'runtimeBindingId'
    );
    validateMemoryCandidate({ candidate, binding, lease, grant, endpoint });
    const decision = requireRecord(
      fixture.memoryAdmissionDecisions,
      candidate.candidateId,
      'Memory Admission Decision',
      'candidateId'
    );
    validateMemoryAdmissionDecision(candidate, decision);
  }

  const reconstruction = reconstructTrustedOperationalMemory({
    candidates: fixture.memoryCandidates,
    decisions: fixture.memoryAdmissionDecisions,
    admittedMemories: fixture.admittedOperationalMemories,
    suspectedCompromiseAt: fixture.clock.suspectedCompromiseAt,
    canonicalStateVersion: fixture.workOrder.canonicalStateVersion
  });
  const observation = validateExecutionObservation({
    observation: fixture.executionObservation,
    bindings: [...fixture.runtimeBindings, fixture.observerBinding],
    leases: fixture.leases,
    grants: fixture.grants,
    endpoints: fixture.endpoints
  });
  const reconciliation = reconcileObservedReturn({
    reconciliationId: fixture.expected.reconciliationId,
    workOrder: fixture.workOrder,
    workReturn: fixture.workReturn,
    observation,
    currentCanonicalStateVersion: fixture.currentCanonicalStateVersion,
    candidates: fixture.memoryCandidates,
    decisions: fixture.memoryAdmissionDecisions,
    createdAt: fixture.clock.reconciledAt
  });
  const receipt = compileExternalInfluenceReceipt({
    receiptId: fixture.expected.receiptId,
    fixture,
    reconstruction,
    reconciliation
  });
  return {
    reconstruction,
    observation,
    reconciliation,
    receipt
  };
}
