# Memory Admission Boundary and Observer Plane — 2026-07-30

**Status:** Phase 17B deterministic enforcement complete
**Builds on:** Phase 17A runtime identity and operational-memory foundation
**Live providers:** disabled
**Canonical state location:** Human-governed Gummy Box records

## Architectural ruling

Persistent context and execution evidence are separate control planes:

```text
Memory Admission Plane
controls what may influence future work

Observer Plane
controls what evidence may support a completed Return
```

Neither plane can authorize execution, accept a result, mutate canonical state
or publish.

## Memory Admission Boundary

Phase 17A established that operational memory is derived, scoped and
non-authoritative. Phase 17B adds the missing durable-write boundary.

```text
ObservedEvent / RuntimeNote
    ↓
MemoryCandidate
├── originatingActorId
├── executingAgentId
├── productionId
├── workOrderId
├── authorityLeaseId
├── runtimeBindingId
├── sourceEvidence
├── claims
├── contentDigest
├── proposedScope
├── proposedExpiry
├── riskClassification
├── runtimeAttestation
└── canonicalStateVersionObserved
    ↓
Validation
    ↓
Human-governed Actor Acceptance
    ↓
AdmittedOperationalMemory
```

> **Agents may write runtime notes freely. They may only propose durable operational memory.**

A Memory Candidate is immutable evidence of a proposal. It has no authority
effect, applies no durable write and applies no canonical mutation. An
acceptance decision binds one exact candidate digest and records provenance,
scope, runtime attestation, Lease binding and risk review.

The accepted durable object is named **Admitted Operational Memory**, not
Canonical Operational Memory. It remains:

- contextual rather than authoritative;
- Actor- and Production-scoped;
- revisioned and expiring;
- traceable to one Candidate and one Human-governed Actor decision;
- prohibited from expanding a Lease, Grant, budget, ownership, acceptance or
  publication;
- separate from canonical Actor, Production and Project state.

Promotion into canonical state still requires the existing explicit target,
policy, Return/Receipt evidence and Human decision. Admission is necessary for
durable operational context; it is not sufficient for canonical truth.

## Endpoint authority

The orchestration flow is not the enforcement boundary. Every callable endpoint
must enforce the same authority beneath it.

> **No tool endpoint may possess more authority than the Lease enforced beneath it.**

The effective endpoint capability set is:

```text
endpoint declaration
∩ active Runtime Binding
∩ active Authority Lease
∩ active Grant
∩ exact Work Order
∩ exact Agent
```

An endpoint with an extra capability fails closed. `memory.propose` may be
granted. `memory.admit` is reserved for the Human-governed admission path and is
never exposed to a worker endpoint.

## Compromise reconstruction

Recovery accepts a Human-selected suspected compromise timestamp and the last
trusted canonical version.

The reconstruction includes only memory where:

1. the Candidate has a complete decision;
2. the decision is `accept`;
3. an exact admitted-memory record links the Candidate and decision;
4. the candidate creation and admitted write both predate the compromise point;
5. the memory remains active;
6. its content, Actor, Production and scope digests still match.

Every other candidate is listed as rejected, quarantined, unresolved, missing,
inactive or after the suspected compromise point. Even a benign memory that was
accepted after the compromise point can be excluded deterministically.

Canonical reconstruction therefore does not need to trust the compromised
worker’s later conversational memory or the provider’s remaining cache.

## Observer Plane

The execution worker and progress observer are separate Agents with separate
Runtime Bindings, Leases, Grants and endpoints.

```text
Work Agent
    performs bounded work

Progress Observer
    watches application state, screenshots, filesystem state,
    artifact hashes and runtime transitions

Return Reconciler
    compares Worker claim + Observer evidence + Work Order
    + commissioned/current canonical state
```

An `ExecutionObservation` records:

- Actor, Production, Work Order and originating execution Lease;
- separate Observer Lease, Agent and Runtime Binding;
- the initial executing Agent and runtime;
- every replacement runtime segment;
- the embodiment or window observed;
- before state and digest;
- ordered progress events;
- screenshot, filesystem, artifact, application-state or video evidence;
- after state and digest;
- Return anchor and canonical version;
- explicit `not-reviewed` acceptance status.

The Observer has evidence authority only. It cannot accept the result or mutate
canonical state.

## Return reconciliation

> **The worker’s report is a claim. The Observer supplies evidence. Return reconciles that evidence with the originating Work Order and canonical Project state.**

The Return Reconciler checks:

1. exact Work Order, Actor, Production and Return anchor;
2. all worker Runtime Bindings and Authority Leases;
3. worker-claimed result digest against independently observed after-state;
4. commissioned, observed and current canonical-state versions;
5. every Work Order acceptance criterion;
6. completion evidence kinds and digests;
7. every Memory Candidate’s admission decision;
8. rejected memory-mutation evidence.

A match produces `matched-awaiting-human-acceptance`. It never produces
acceptance. A mismatch, stale canonical version or unresolved Candidate
produces `reconciliation-required`.

## Deterministic benchmark

`fixtures/runtime-conformance/phase17b-memory-admission-observer-recovery.json`
proves:

```text
bounded worker starts
→ valid memory is proposed and accepted
→ malicious future-deployment rule is proposed
→ malicious candidate is rejected
→ compromise point is declared
→ worker Runtime Binding, Lease and Grant are revoked
→ replacement worker receives a separate Lease and Grant
→ independent Observer follows both runtime segments
→ replacement resumes from checkpoint
→ screenshots, filesystem state and artifact hashes show completion
→ worker Return claim matches the observed after-state
→ memory reconstructs from the last trusted point
→ rejected and post-compromise writes are excluded
→ Receipt identifies every mutation and observation
→ Human acceptance remains pending
```

This extends the prior foundation to:

```text
coordinator → replaceable executor → independent observer → receipted Return
```

## Browser/app benchmark

`tests/e2e/phase17b-observer-plane.spec.mjs` exercises the same separation
against the real Gummy browser application:

1. a first worker page starts Night Gummy Launch and persists two specialist
   configurations;
2. a separate observer page reads the application database and records a DOM
   screenshot plus the before-state artifact versions;
3. the first worker page is closed;
4. a fresh worker page restores the same Production and completes the remaining
   configurations, compiled plan and governed deterministic Run;
5. the observer—not the replacement worker—verifies the run, Work Orders,
   Leases, Grants, result hashes, Returns and Receipts;
6. the observer reloads and records an after-state screenshot and filesystem
   evidence.

This is a real browser/app recovery benchmark. The worker identities are
Playwright-controlled browser pages, not live provider Agents, and the
observation covers DOM and local application state rather than real video.

## External-development interpretation

The RufRoot disclosure is treated as evidence that persistent generated memory
is a post-compromise policy surface and that underlying tool endpoints must
enforce authority independently of orchestration.

The Gemini Robotics ER 2 announcement is treated as evidence that coordinator,
replaceable executor and independent progress observation are practical
separations. The Gummy extension remains differentiated by Human-owned Actor
identity, Leases, canonical state, admission decisions, Return reconciliation
and Human acceptance.

No copying or provider adoption is claimed. The developments motivated the
control tests; Gummy’s contracts remain provider-neutral.

## Truthful limitation

This pass proves deterministic contracts and fail-closed domain behavior.
Actual Ruflo remediation, Google Robotics endpoints, real video observation,
provider log completeness, process-level runtime cancellation and credential
isolation are not exercised. Live provider execution remains NOT CLAIMED.
