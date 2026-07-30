import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  assertEndpointAuthority,
  assertWorkerReplacement,
  reconcileObservedReturn,
  runExternalInfluenceRecoveryBenchmark,
  validateExecutionObservation,
  validateMemoryAdmissionDecision,
  validateMemoryCandidate
} from '../src/core/external-influence-resilience.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath =
  'fixtures/runtime-conformance/phase17b-memory-admission-observer-recovery.json';

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

async function fixture() {
  return json(fixturePath);
}

test('Phase 17B Memory Admission and Observer contracts compile strictly', async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schemaNames = [
    'memory-candidate',
    'memory-admission-decision',
    'admitted-operational-memory',
    'execution-observation',
    'return-reconciliation',
    'work-return',
    'action-receipt'
  ];
  const validators = Object.fromEntries(
    await Promise.all(
      schemaNames.map(async name => {
        const schema = await json(`schemas/${name}.schema.json`);
        return [name, ajv.compile(schema)];
      })
    )
  );
  const proof = await fixture();
  for (const candidate of proof.memoryCandidates) {
    assert.equal(
      validators['memory-candidate'](candidate),
      true,
      ajv.errorsText(validators['memory-candidate'].errors)
    );
  }
  for (const decision of proof.memoryAdmissionDecisions) {
    assert.equal(
      validators['memory-admission-decision'](decision),
      true,
      ajv.errorsText(validators['memory-admission-decision'].errors)
    );
  }
  for (const memory of proof.admittedOperationalMemories) {
    assert.equal(
      validators['admitted-operational-memory'](memory),
      true,
      ajv.errorsText(validators['admitted-operational-memory'].errors)
    );
  }
  assert.equal(
    validators['execution-observation'](proof.executionObservation),
    true,
    ajv.errorsText(validators['execution-observation'].errors)
  );
  assert.equal(
    validators['work-return'](proof.workReturn),
    true,
    ajv.errorsText(validators['work-return'].errors)
  );

  const result = runExternalInfluenceRecoveryBenchmark(proof);
  assert.equal(
    validators['return-reconciliation'](result.reconciliation),
    true,
    ajv.errorsText(validators['return-reconciliation'].errors)
  );
  assert.equal(
    validators['action-receipt'](result.receipt),
    true,
    ajv.errorsText(validators['action-receipt'].errors)
  );
});

test('tool endpoints cannot exceed the Lease and Grant enforced beneath them', async () => {
  const proof = await fixture();
  const binding = proof.runtimeBindings[0];
  const lease = proof.leases.find(item => item.id === binding.authorityLeaseId);
  const grant = proof.grants.find(item => item.id === binding.grantId);
  const endpoint = proof.endpoints.find(
    item => item.runtimeBindingId === binding.runtimeBindingId
  );
  assert.equal(
    assertEndpointAuthority({
      endpoint,
      binding,
      lease,
      grant,
      at: binding.createdAt
    }),
    true
  );
  assert.throws(
    () =>
      assertEndpointAuthority({
        endpoint: {
          ...endpoint,
          exposedCapabilities: [...endpoint.exposedCapabilities, 'memory.admit']
        },
        binding,
        lease,
        grant,
        at: binding.createdAt
      }),
    /exceeds Lease or Grant authority|cannot admit/
  );
  assert.throws(
    () =>
      assertEndpointAuthority({
        endpoint: {
          ...endpoint,
          exposedCapabilities: [...endpoint.exposedCapabilities, 'shell.execute']
        },
        binding,
        lease,
        grant,
        at: binding.createdAt
      }),
    /exceeds Lease or Grant authority/
  );
  assert.throws(
    () =>
      assertEndpointAuthority({
        endpoint,
        binding,
        lease: { ...lease, agentId: 'agent:lease-confusion' },
        grant,
        at: binding.createdAt
      }),
    /Lease uses another Agent/
  );
});

test('Agents can propose durable memory but cannot admit it', async () => {
  const proof = await fixture();
  for (const candidate of proof.memoryCandidates) {
    const binding = proof.runtimeBindings.find(
      item => item.runtimeBindingId === candidate.runtimeBindingId
    );
    const lease = proof.leases.find(item => item.id === candidate.authorityLeaseId);
    const grant = proof.grants.find(item => item.id === binding.grantId);
    const endpoint = proof.endpoints.find(
      item => item.runtimeBindingId === binding.runtimeBindingId
    );
    const proposed = validateMemoryCandidate({
      candidate,
      binding,
      lease,
      grant,
      endpoint
    });
    assert.equal(proposed.durableWriteApplied, false);
    assert.equal(proposed.canonicalMutationApplied, false);
    assert.equal(endpoint.exposedCapabilities.includes('memory.admit'), false);
  }

  const malicious = proof.memoryCandidates.find(
    item => item.candidateId === 'memory-candidate:attacker-deployment-rule'
  );
  const rejection = proof.memoryAdmissionDecisions.find(
    item => item.candidateId === malicious.candidateId
  );
  assert.equal(validateMemoryAdmissionDecision(malicious, rejection).decision, 'reject');
  assert.equal(rejection.acceptedOperationalMemory, null);

  const binding = proof.runtimeBindings.find(
    item => item.runtimeBindingId === malicious.runtimeBindingId
  );
  const lease = proof.leases.find(item => item.id === malicious.authorityLeaseId);
  const grant = proof.grants.find(item => item.id === binding.grantId);
  const endpoint = proof.endpoints.find(
    item => item.runtimeBindingId === binding.runtimeBindingId
  );
  assert.throws(
    () =>
      validateMemoryCandidate({
        candidate: {
          ...malicious,
          proposedScope: {
            ...malicious.proposedScope,
            actorId: 'actor:scope-confusion'
          }
        },
        binding,
        lease,
        grant,
        endpoint
      }),
    /scope crosses Actor/
  );
  assert.throws(
    () =>
      validateMemoryCandidate({
        candidate: {
          ...malicious,
          runtimeAttestation: {
            ...malicious.runtimeAttestation,
            fingerprint:
              'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          }
        },
        binding,
        lease,
        grant,
        endpoint
      }),
    /attestation fingerprint mismatch/
  );
  assert.throws(
    () =>
      validateMemoryAdmissionDecision(malicious, {
        ...rejection,
        decidedAt: malicious.proposedExpiry
      }),
    /after candidate expiry/
  );
});

test('memory-poisoning recovery excludes rejected and all post-compromise writes', async () => {
  const proof = await fixture();
  const result = runExternalInfluenceRecoveryBenchmark(proof);
  assert.deepEqual(
    result.reconstruction.admitted.map(item => item.memoryId),
    proof.expected.admittedMemoryIds
  );
  assert.deepEqual(
    result.reconstruction.excluded.map(item => item.candidateId).sort(),
    [...proof.expected.excludedCandidateIds].sort()
  );
  assert.equal(
    result.reconstruction.excluded.find(
      item => item.candidateId === 'memory-candidate:attacker-deployment-rule'
    ).reason,
    'actor-reject'
  );
  assert.equal(
    result.reconstruction.excluded.find(
      item => item.candidateId === 'memory-candidate:post-compromise-benign'
    ).reason,
    'after-suspected-compromise'
  );
  assert.equal(result.reconstruction.canonicalMutationApplied, false);
});

test('compromised worker replacement preserves Actor, Work Order and Return anchor', async () => {
  const proof = await fixture();
  const [compromised, replacement] = proof.runtimeBindings;
  assert.equal(assertWorkerReplacement(compromised, replacement), true);
  assert.notEqual(compromised.agentId, replacement.agentId);
  assert.notEqual(compromised.authorityLeaseId, replacement.authorityLeaseId);
  assert.equal(compromised.actorId, replacement.actorId);
  assert.equal(compromised.workOrderId, replacement.workOrderId);
  assert.equal(compromised.returnAnchor, replacement.returnAnchor);
});

test('independent Observer follows both workers and never accepts their result', async () => {
  const proof = await fixture();
  const observation = validateExecutionObservation({
    observation: proof.executionObservation,
    bindings: [...proof.runtimeBindings, proof.observerBinding],
    leases: proof.leases,
    grants: proof.grants,
    endpoints: proof.endpoints
  });
  assert.equal(observation.runtimeSegments.length, 2);
  assert.equal(observation.progressEvents[3].kind, 'worker-replaced');
  assert.equal(observation.independentObserver, true);
  assert.equal(observation.workerReportAuthority, false);
  assert.equal(observation.observerCanAccept, false);
  assert.equal(observation.acceptanceStatus, 'not-reviewed');

  assert.throws(
    () =>
      validateExecutionObservation({
        observation: {
          ...proof.executionObservation,
          observerAgentId: proof.executionObservation.executingAgentId
        },
        bindings: [...proof.runtimeBindings, proof.observerBinding],
        leases: proof.leases,
        grants: proof.grants,
        endpoints: proof.endpoints
      }),
    /independent/
  );
});

test('Return Reconciler treats the worker report as a claim and leaves acceptance to the Human', async () => {
  const proof = await fixture();
  const result = runExternalInfluenceRecoveryBenchmark(proof);
  assert.equal(result.reconciliation.state, proof.expected.reconciliationState);
  assert.equal(result.reconciliation.workerReportClassification, 'claim');
  assert.equal(result.reconciliation.observerEvidenceRequired, true);
  assert.equal(result.reconciliation.humanAcceptanceRequired, true);
  assert.equal(result.reconciliation.acceptanceStatus, 'pending');
  assert.equal(result.reconciliation.canonicalMutationApplied, false);
  assert.deepEqual(
    result.reconciliation.rejectedMemoryCandidateIds,
    proof.expected.rejectedCandidateIds
  );
  assert.ok(
    result.reconciliation.criteriaEvaluations.every(item => item.outcome === 'pass')
  );
});

test('claim mismatch, stale canonical state and unresolved memory fail into reconciliation', async () => {
  const proof = await fixture();
  const mismatch = reconcileObservedReturn({
    reconciliationId: proof.expected.reconciliationId,
    workOrder: proof.workOrder,
    workReturn: {
      ...proof.workReturn,
      extensions: {
        ...proof.workReturn.extensions,
        claimedStateAfterDigest:
          'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      }
    },
    observation: proof.executionObservation,
    currentCanonicalStateVersion: proof.currentCanonicalStateVersion,
    candidates: proof.memoryCandidates,
    decisions: proof.memoryAdmissionDecisions,
    createdAt: proof.clock.reconciledAt
  });
  assert.equal(mismatch.state, 'reconciliation-required');

  const stale = reconcileObservedReturn({
    reconciliationId: proof.expected.reconciliationId,
    workOrder: proof.workOrder,
    workReturn: proof.workReturn,
    observation: proof.executionObservation,
    currentCanonicalStateVersion: 'canonical:gummy-os:v4',
    candidates: proof.memoryCandidates,
    decisions: proof.memoryAdmissionDecisions,
    createdAt: proof.clock.reconciledAt
  });
  assert.equal(stale.state, 'reconciliation-required');

  const unresolved = reconcileObservedReturn({
    reconciliationId: proof.expected.reconciliationId,
    workOrder: proof.workOrder,
    workReturn: proof.workReturn,
    observation: proof.executionObservation,
    currentCanonicalStateVersion: proof.currentCanonicalStateVersion,
    candidates: proof.memoryCandidates,
    decisions: proof.memoryAdmissionDecisions.slice(0, 2),
    createdAt: proof.clock.reconciledAt
  });
  assert.equal(unresolved.state, 'reconciliation-required');
  assert.equal(
    unresolved.criteriaEvaluations.find(
      item => item.criterionId === 'criterion:memory-decisions-resolved'
    ).outcome,
    'blocked'
  );
});

test('Receipt identifies every proposed, rejected and excluded memory mutation', async () => {
  const proof = await fixture();
  const result = runExternalInfluenceRecoveryBenchmark(proof);
  assert.equal(
    result.receipt.evidence.memoryMutationEvidence.length,
    proof.memoryCandidates.length
  );
  assert.equal(
    result.receipt.evidence.memoryMutationEvidence.find(
      item => item.candidateId === 'memory-candidate:attacker-deployment-rule'
    ).decision,
    'reject'
  );
  assert.deepEqual(
    result.receipt.evidence.reconstructedMemoryIds,
    proof.expected.admittedMemoryIds
  );
  assert.equal(result.receipt.outcome, 'completed');
  assert.match(result.receipt.detail, /Human acceptance pending/);
});

test('dated Phase 17B records lock both external developments without live claims', async () => {
  const documents = await Promise.all(
    [
      'plans/active/2026-07-30-memory-admission-observer-plane-pass.md',
      'docs/architecture/MEMORY_ADMISSION_AND_OBSERVER_PLANE_2026-07-30.md',
      'docs/security/PHASE17B_EXTERNAL_INFLUENCE_RESILIENCE_THREAT_MODEL_2026-07-30.md',
      'evidence/phase17b-external-influence-acceptance-matrix.md',
      'evidence/phase17b-external-influence-rollback.md'
    ].map(relativePath => readFile(path.join(root, relativePath), 'utf8'))
  );
  const record = documents.join('\n');
  for (const doctrine of [
    'Agents may write runtime notes freely. They may only propose durable operational memory.',
    'No tool endpoint may possess more authority than the Lease enforced beneath it.',
    'The worker’s report is a claim. The Observer supplies evidence.',
    'coordinator → replaceable executor → independent observer → receipted Return',
    'live provider execution remains NOT CLAIMED'
  ]) {
    assert.ok(record.includes(doctrine), `missing Phase 17B doctrine: ${doctrine}`);
  }
});
