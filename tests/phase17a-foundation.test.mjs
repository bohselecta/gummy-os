import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  DeterministicLongRunningWork,
  assertAgentReplacement,
  assertContinuationAuthority,
  assertDelegationChain,
  assertMemoryDerivation,
  assertMemoryRevisionChain,
  assertProviderFailover,
  assertRuntimePrincipalRotation,
  compileReceiptEvidenceInput,
  evaluateThreatCase,
  selectOperationalMemory
} from "./support/deterministic-phase17a-foundation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function foundation() {
  return json(
    "fixtures/runtime-conformance/phase17a-runtime-identity-memory-foundation.json"
  );
}

test("Phase 17A contracts compile strictly and deterministic fixtures conform", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schemaNames = [
    "actor-agent-runtime-binding",
    "operational-memory",
    "memory-derivation",
    "memory-scope-policy",
    "long-running-work-policy",
    "provider-evidence-bundle",
    "provider-profile-google-agent-platform"
  ];
  const validators = Object.fromEntries(
    await Promise.all(
      schemaNames.map(async (name) => {
        const schema = await json(`schemas/${name}.schema.json`);
        return [name, ajv.compile(schema)];
      })
    )
  );
  const fixture = await foundation();
  const profile = await json(
    "fixtures/runtime-conformance/google-agent-platform-profile-2026-07-29.json"
  );
  const cases = [
    ...fixture.runtimeBindings.map((value) => [
      "actor-agent-runtime-binding",
      value
    ]),
    ...fixture.memories.map((value) => ["operational-memory", value]),
    ...fixture.memoryDerivations.map((value) => ["memory-derivation", value]),
    ...fixture.memoryScopePolicies.map((value) => ["memory-scope-policy", value]),
    ["long-running-work-policy", fixture.longRunningWorkPolicy],
    ["provider-evidence-bundle", fixture.providerEvidenceBundle],
    ["provider-profile-google-agent-platform", profile]
  ];
  for (const [schemaName, value] of cases) {
    const validate = validators[schemaName];
    assert.equal(
      validate(value),
      true,
      `${schemaName}: ${ajv.errorsText(validate.errors)}`
    );
  }
});

test("Actor and Human owner remain stable across runtime and Agent replacement", async () => {
  const fixture = await foundation();
  const [initial, rotated, failedOver, replacement] = fixture.runtimeBindings;
  for (const binding of fixture.runtimeBindings) {
    assert.equal(
      assertDelegationChain(binding).length,
      7,
      "complete delegation chain remains inspectable"
    );
    assert.equal(binding.actorId, fixture.identities.actorId);
    assert.equal(binding.humanOwnerId, fixture.identities.humanId);
  }
  assert.equal(assertRuntimePrincipalRotation(initial, rotated), true);
  assert.equal(assertProviderFailover(rotated, failedOver), true);
  assert.equal(assertAgentReplacement(failedOver, replacement), true);
  assert.notEqual(initial.agentId, replacement.agentId);
  assert.equal(initial.actorId, replacement.actorId);
  assert.equal(initial.returnAnchor, replacement.returnAnchor);
});

test("runtime-principal rotation changes principal and attestation without changing Actor", async () => {
  const fixture = await foundation();
  const [initial, rotated] = fixture.runtimeBindings;
  assert.equal(assertRuntimePrincipalRotation(initial, rotated), true);
  assert.notEqual(initial.runtimePrincipal, rotated.runtimePrincipal);
  assert.notEqual(
    initial.principalAttestation.fingerprint,
    rotated.principalAttestation.fingerprint
  );
  assert.equal(initial.actorId, rotated.actorId);
  assert.equal(initial.agentId, rotated.agentId);
});

test("operational memory preserves immutable revision and derivation provenance", async () => {
  const fixture = await foundation();
  const revisions = assertMemoryRevisionChain(
    fixture.memories,
    "memory:repository-conventions"
  );
  assert.deepEqual(
    revisions.map((memory) => memory.revision),
    [1, 2]
  );
  assert.equal(
    assertMemoryDerivation(revisions[1], fixture.memoryDerivations[0]),
    true
  );
  assert.equal(revisions[1].authoritative, false);
  assert.equal(revisions[1].authorityEffect, "none");
  assert.equal(revisions[1].promotionPolicy.automaticPromotion, false);
});

test("operational-memory selection is exact and isolated by Actor and Production", async () => {
  const fixture = await foundation();
  const context = {
    memoryId: "memory:repository-conventions",
    revision: 2,
    actorId: fixture.identities.actorId,
    agentId: fixture.identities.agentId,
    productionId: fixture.identities.productionId,
    use: "planning-context",
    at: "2026-07-29T20:07:00.000Z"
  };
  assert.equal(selectOperationalMemory(fixture, context).revision, 2);
  assert.throws(
    () =>
      selectOperationalMemory(fixture, {
        ...context,
        memoryId: "memory:other-actor-private",
        revision: 1
      }),
    /cross-Actor/
  );
  assert.throws(
    () =>
      selectOperationalMemory(fixture, {
        ...context,
        productionId: fixture.identities.otherProductionId
      }),
    /cross-Production/
  );
  assert.throws(
    () => selectOperationalMemory(fixture, { ...context, revision: 1 }),
    /superseded/
  );
});

test("TTL expiry and invalidation prevent future operational-memory use", async () => {
  const fixture = await foundation();
  const base = {
    actorId: fixture.identities.actorId,
    agentId: fixture.identities.agentId,
    productionId: fixture.identities.productionId,
    use: "resume-context",
    at: "2026-07-29T20:07:00.000Z",
    revision: 1
  };
  assert.throws(
    () =>
      selectOperationalMemory(fixture, {
        ...base,
        memoryId: "memory:expired-observation"
      }),
    /expired/
  );
  assert.throws(
    () =>
      selectOperationalMemory(fixture, {
        ...base,
        memoryId: "memory:invalidated-observation",
        use: "receipt-evidence"
      }),
    /invalidated/
  );
});

test("Receipt evidence input discloses exact memory revisions but is not a Receipt", async () => {
  const fixture = await foundation();
  const memory = selectOperationalMemory(fixture, {
    memoryId: "memory:repository-conventions",
    revision: 2,
    actorId: fixture.identities.actorId,
    agentId: fixture.identities.agentId,
    productionId: fixture.identities.productionId,
    use: "receipt-evidence",
    at: "2026-07-29T20:07:00.000Z"
  });
  const evidence = compileReceiptEvidenceInput(
    fixture.providerEvidenceBundle,
    [memory]
  );
  assert.deepEqual(evidence.exactMemoryRevisions, [
    {
      memoryId: "memory:repository-conventions",
      revision: 2,
      scopeId: "memory-scope:actor-hayden:production-repository-steward",
      contentHash:
        "sha256:4000000000000000000000000000000000000000000000000000000000000001"
    }
  ]);
  assert.equal(evidence.providerTelemetryClassification, "evidence-only");
  assert.equal(evidence.returnCreated, false);
  assert.equal(evidence.receiptCreated, false);
  assert.equal(evidence.acceptanceState, "not-requested");
});

test("seven-day provider capacity does not survive Lease or Grant expiry", async () => {
  const fixture = await foundation();
  const binding = { ...fixture.runtimeBindings[0], revokedAt: null };
  assert.equal(
    fixture.longRunningWorkPolicy.providerMaximumWallTime,
    7 * 24 * 60 * 60
  );
  assert.equal(
    assertContinuationAuthority(
      fixture.longRunningWorkPolicy,
      binding,
      "2026-07-29T20:11:59.000Z"
    ),
    true
  );
  assert.throws(
    () =>
      assertContinuationAuthority(
        fixture.longRunningWorkPolicy,
        binding,
        "2026-07-29T20:12:00.000Z"
      ),
    /Grant expired/
  );
  assert.throws(
    () =>
      assertContinuationAuthority(
        fixture.longRunningWorkPolicy,
        binding,
        "2026-07-29T20:16:00.000Z"
      ),
    /Authority Lease expired/
  );
});

test("checkpoint, provider failover, resume and Human-input pause remain authority-bound", async () => {
  const fixture = await foundation();
  const harness = new DeterministicLongRunningWork({
    policy: fixture.longRunningWorkPolicy,
    bindings: fixture.runtimeBindings
  });
  const result = harness.replay(
    fixture.chronologies.checkpointResumeAndDrift
  );
  assert.equal(result.runtimeBindingId, "runtime-binding:repository-steward:3");
  assert.equal(result.actorId, fixture.identities.actorId);
  assert.equal(result.workOrderId, "work-order:repository-steward-proof");
  assert.equal(
    result.returnAnchor,
    "gummy-box:production-gummy-os:repository-steward-return"
  );
  assert.equal(result.checkpointId, "gummy-box-checkpoint:1");
  assert.equal(result.state, "reconciliation-required");
  assert.equal(result.returnRecorded, false);
});

test("Human input cannot resume work outside Master Control", async () => {
  const fixture = await foundation();
  const harness = new DeterministicLongRunningWork({
    policy: fixture.longRunningWorkPolicy,
    bindings: fixture.runtimeBindings
  });
  harness.apply({ kind: "start", at: "2026-07-29T20:00:00.000Z" });
  harness.apply({
    kind: "input-required",
    at: "2026-07-29T20:01:00.000Z"
  });
  assert.throws(
    () =>
      harness.apply({
        kind: "human-input",
        at: "2026-07-29T20:01:01.000Z",
        authority: "provider"
      }),
    /Master Control/
  );
  assert.equal(harness.snapshot().state, "input-required");
});

test("cooperative cancellation acknowledgement is not termination", async () => {
  const fixture = await foundation();
  const events = fixture.chronologies.cooperativeCancellation;
  const harness = new DeterministicLongRunningWork({
    policy: fixture.longRunningWorkPolicy,
    bindings: fixture.runtimeBindings
  });
  harness.replay(events.slice(0, 3));
  assert.equal(harness.snapshot().state, "cancellation-acknowledged");
  assert.equal(harness.snapshot().terminated, false);
  harness.apply(events[3]);
  assert.equal(harness.snapshot().state, "cancelled");
  assert.equal(harness.snapshot().terminated, true);
});

test("budget ceiling checkpoints and stops before unauthorized spend", async () => {
  const fixture = await foundation();
  const harness = new DeterministicLongRunningWork({
    policy: fixture.longRunningWorkPolicy,
    bindings: fixture.runtimeBindings
  });
  const state = harness.replay(fixture.chronologies.budgetStop);
  assert.equal(state.state, "budget-stopped");
  assert.equal(state.consumedMicros, 450000);
  assert.equal(state.checkpointId, "gummy-box-checkpoint:budget-stop");
});

test("provider completion creates only a result candidate", async () => {
  const fixture = await foundation();
  const harness = new DeterministicLongRunningWork({
    policy: fixture.longRunningWorkPolicy,
    bindings: fixture.runtimeBindings
  });
  const state = harness.replay(fixture.chronologies.providerCompletionOnly);
  assert.equal(state.state, fixture.expected.completionCreates);
  assert.equal(state.providerCompleted, true);
  assert.equal(state.returnRecorded, fixture.expected.completionCreatesReturn);
  assert.equal(state.receiptRecorded, fixture.expected.completionCreatesReceipt);
  assert.equal(state.accepted, fixture.expected.completionCreatesAcceptance);
});

test("all Issue #44 threat cases are deterministic and fail closed", async () => {
  const fixture = await foundation();
  const results = fixture.threatCases.map((threat) =>
    evaluateThreatCase(fixture, threat)
  );
  assert.equal(results.length, 20);
  assert.deepEqual(
    results.map((result) => result.status),
    fixture.threatCases.map((threat) => threat.expected)
  );
  assert.equal(new Set(results.map((result) => result.id)).size, results.length);
});

test("Google profile remains provider-neutral, uncredentialed and live-disabled", async () => {
  const profile = await json(
    "fixtures/runtime-conformance/google-agent-platform-profile-2026-07-29.json"
  );
  assert.equal(profile.provider, "google-agent-platform");
  assert.equal(profile.maximumRuntimeDuration, 604800);
  assert.equal(profile.memoryBank.providerIsCanonical, false);
  assert.equal(profile.agentRegistry.canonicalIdentityRegistry, false);
  assert.equal(profile.observability.receiptAuthority, false);
  assert.equal(profile.features.a2a.allowedInFirstProof, false);
  assert.equal(profile.features.llamaIndex.allowedInFirstProof, false);
  assert.equal(profile.credentialsProvisioned, false);
  assert.equal(profile.liveExecutionEnabled, false);
});

test("dated doctrine, threat, migration, rollback and acceptance records preserve phase boundaries", async () => {
  const documents = await Promise.all(
    [
      "docs/architecture/ACTOR_IDENTITY_VS_RUNTIME_IDENTITY_2026-07-29.md",
      "docs/architecture/OPERATIONAL_MEMORY_VS_CANONICAL_STATE_2026-07-29.md",
      "docs/providers/GOOGLE_AGENT_PLATFORM_PROFILE_2026-07-29.md",
      "docs/security/PHASE17A_RUNTIME_IDENTITY_MEMORY_THREAT_MODEL_2026-07-29.md",
      "plans/review/2026-07-29-phase17a-runtime-identity-memory-migration.md",
      "evidence/phase17a-runtime-identity-memory-rollback.md",
      "evidence/phase17a-foundation-acceptance-matrix.md",
      "docs/demonstrations/2026-07-28-gummy-os-public-demonstration.md"
    ].map((relativePath) => readFile(path.join(root, relativePath), "utf8"))
  );
  const record = documents.join("\n");
  for (const doctrine of [
    "Agent Identity identifies the executing worker.",
    "Actor Identity identifies the enduring Human-owned social and creative principal.",
    "Operational Memory is derived, scoped and non-authoritative.",
    "Runtime continuation is not Return.",
    "Seven-day provider support never creates ambient authority.",
    "Provider telemetry is evidence for a Receipt, not the Receipt or acceptance.",
    "exact founder-accepted Issue #43 merge commit",
    "Issue #36 remains open"
  ]) {
    assert.ok(record.includes(doctrine), `missing doctrine: ${doctrine}`);
  }
  assert.ok(record.includes("No evidence of copying, plagiarism"));
  assert.ok(record.includes("no live Google or MCP adapter"));
});
