# Phase 17B — Memory Admission and Observer Plane Pass

**Status:** Completed; founder-approved 2026-07-30
**Authorized by:** Hayden Lindley, 2026-07-30
**Canonical repository:** `bohselecta/gummy-os`
**Execution class:** bounded post-v1 resilience pass
**Live provider execution:** disabled and not required

## Why this pass exists

Two outside developments exposed adjacent weaknesses that the existing Phase
17A foundation named but did not yet enforce as one recovery system:

1. RufRoot / CVE-2026-59726 demonstrated that compromised runtime access can
   poison persistent operational memory and influence later runs after the
   original intrusion.
2. Gemini Robotics ER 2 publicly demonstrated coordinator/executor separation,
   independent progress observation and executor replacement under a surviving
   objective.

The response is one additive pass, not a provider integration and not a new
product ontology.

## Locked outcomes

### Memory Admission Boundary

```text
runtime note or observed event
→ Memory Candidate
→ provenance, scope, attestation and risk validation
→ explicit Human-governed Actor decision
→ Admitted Operational Memory
→ still non-authoritative
```

> **Agents may write runtime notes freely. They may only propose durable operational memory.**

Admitted operational memory is not renamed canonical Actor, Production or
Project truth. Promotion into those objects remains a separate existing
Human-governed path.

### Execution boundary

> **No tool endpoint may possess more authority than the Lease enforced beneath it.**

Every exposed capability must be present in both the active Authority Lease and
Grant. `memory.admit` is never an Agent endpoint capability.

### Observer Plane

```text
Work Agent
→ replaceable execution segments

Progress Observer
→ independent state, progress and completion evidence

Return Reconciler
→ Work Order + worker claim + Observer evidence + canonical version
→ matched-awaiting-human-acceptance | reconciliation-required
```

> **The worker’s report is a claim. The Observer supplies evidence. Return reconciles that evidence with the originating Work Order and canonical Project state.**

The target relationship is:

```text
coordinator → replaceable executor → independent observer → receipted Return
```

## Work performed

1. Added versioned contracts for Memory Candidate, Memory Admission Decision,
   Admitted Operational Memory, Execution Observation and Return
   Reconciliation.
2. Added production-domain enforcement for endpoint/Lease intersection,
   candidate validation, explicit admission, trusted reconstruction,
   independent observation, Return reconciliation and memory-mutation Receipt
   evidence.
3. Added one deterministic benchmark that:
   - starts a bounded worker;
   - injects a plausible malicious future-deployment rule;
   - rejects that candidate;
   - revokes the compromised worker;
   - resumes through a separately leased replacement;
   - observes both workers from an independent runtime;
   - reconstructs operational memory from the last trusted point;
   - excludes every admitted or proposed write after that point;
   - reconciles the replacement worker’s claim against screenshots,
     filesystem state and artifact evidence;
   - leaves Human acceptance pending;
   - produces a Receipt listing every proposed, rejected and excluded memory
     mutation.
4. Added fail-closed tests for endpoint overreach, Agent admission, scope and
   attestation mismatch, non-independent observation, worker-claim mismatch,
   stale canonical state and unresolved memory decisions.
5. Added a real browser/app benchmark in which one page performs the first
   production steps, a separate observer page records DOM screenshots and
   IndexedDB artifact versions, the first worker page is closed, and a fresh
   worker page resumes and completes the Production. The observer verifies
   Work Orders, Leases, Grants, result hashes, Returns and Receipts without
   using either worker's narrative.
6. Added dated architecture, threat, acceptance and rollback records.
7. Added the new contracts, fixture and browser benchmark to repository
   validation.

## Deliberate non-changes

- no credential, provider account, runtime resource or network endpoint;
- no live Google, Ruflo, MCP or robotics integration;
- no UI or Gummy Bar change;
- no Local Gummy Box database migration;
- no rewriting of Phase 17A fixtures or accepted v1 evidence;
- no automatic memory promotion, Return acceptance or publication;
- no generic shell, filesystem, Python, workflow or device bridge.

## Exit gate

The pass is complete when:

- all five contracts compile strictly;
- the deterministic compromise/replacement benchmark passes;
- all negative cases fail closed;
- the real browser/app worker-replacement benchmark passes;
- the complete repository validation and Node suite remain green;
- the production build and existing security/preservation gates remain green;
- live provider execution remains NOT CLAIMED.
