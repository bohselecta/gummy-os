# Operational Memory vs Canonical State — 2026-07-29

**Status:** Phase 17A additive foundation
**Controlling issue:** GitHub Issue #44
**Canonical project location:** Gummy Box
**Provider memory:** optional projection, never the only provenance copy

## Doctrine

> **Operational Memory is derived, scoped and non-authoritative.**

> **Memory resumes context. Return reconciles work into canonical Production or Project state.**

Memory may tell an Agent what could be relevant. It cannot decide what is true,
permitted, owned, accepted or publishable.

## Three distinct state classes

| Class | Role | Mutation model | Authority |
| --- | --- | --- | --- |
| Session/event evidence | immutable or append-only observations used as derivation inputs | new events and preserved hashes | evidence only |
| Operational Memory | generated, revisioned, expiring context for resume, planning, retrieval and reconciliation | explicit revisions, supersession, invalidation and deletion | none |
| Canonical Actor / Production / Project state | Human-governed accepted Gummy objects and Gummy Box records | canonical object rules, Return, Receipt and Human decision | Human-governed |

References may cross these classes. Silent promotion may not.

## Contracts

### `gummy.operational-memory/v1`

`schemas/operational-memory.schema.json` records:

- Actor, Agent, Production and exact memory scope;
- source event references and content hashes;
- generator provider/model and generation time;
- immutable numeric revision and predecessor;
- claims and confidence;
- allowed and prohibited uses;
- canonical-state version observed;
- TTL, expiry, invalidation, review and promotion policy;
- explicit `authoritative: false`, `authorityEffect: none` and
  `canonicalMutationApplied: false`.

### `gummy.memory-derivation/v1`

`schemas/memory-derivation.schema.json` preserves the event references, hashes,
generator, method, conflict disposition and derivation hash for one exact memory
revision. Contradictory source material remains inspectable through revisions.
Provider consolidation may aid retrieval but cannot erase Gummy provenance.

### `gummy.memory-scope-policy/v1`

`schemas/memory-scope-policy.schema.json` binds memory to one Actor and
Production, an explicit Agent allowlist, data classes, allowed uses, maximum
TTL, provider projection, region and revocation state. It requires:

- no cross-Actor access;
- no cross-Production access;
- exact-revision selection;
- Gummy Box provenance;
- a non-sole provider copy;
- provider deletion after revocation.

## Retrieval algorithm

Before an Agent consumes memory, Gummy must:

1. resolve the exact `memoryId` and numeric revision named by the Work Order;
2. resolve the Gummy memory-scope policy;
3. match Actor, Production and permitted Agent;
4. match the intended use against both the memory and scope policy;
5. reject superseded, expired, invalidated, deleted or missing revisions;
6. reject an expired or revoked scope;
7. verify source and derivation hashes;
8. preserve the exact read in provider evidence and eventual Receipt evidence;
9. treat all claims as context, never authority.

A “latest memory” lookup is insufficient for execution. The Work Order and
Receipt evidence bind exact revisions so a replay can identify what influenced
the work.

## Revision, TTL and invalidation

Every mutation creates a new revision. A successor names the exact prior
`memoryId` and revision. The predecessor remains evidence and is marked
superseded. An expired, invalidated or deleted revision cannot be used in future
work, even when a provider cache still returns it.

TTL is bounded twice:

- the memory has a concrete TTL and `expiresAt`;
- the scope policy has a maximum TTL and its own expiry/revocation.

The earliest boundary wins. Provider retention defaults do not override Gummy
scope.

## Promotion into canonical state

Operational Memory cannot directly mutate:

- Human or Actor identity;
- a Production Agreement;
- a Contribution Ledger;
- a Production or Project;
- accepted Gummy content;
- a Lease, Grant, budget or publication scope.

Promotion requires an explicit target object and policy. Consequential promotion
requires Human acceptance. The accepted canonical object is a new canonical
record with provenance back to memory; the operational-memory record itself
remains non-authoritative.

## Phase 17B admission boundary

The 2026-07-30 external-influence resilience pass adds a required boundary
before new generated context becomes durable operational memory:

```text
runtime note
→ gummy.memory-candidate/v1
→ provenance, scope, runtime-attestation and risk validation
→ gummy.memory-admission-decision/v1
→ gummy.admitted-operational-memory/v1
```

Agents may write ephemeral runtime notes and may propose a Memory Candidate.
They cannot call `memory.admit`, create an admission decision or write an
admitted-memory record.

Admitted Operational Memory is intentionally not called Canonical Operational
Memory. Admission makes context durable and reviewable; it does not make the
context authoritative. Canonical Actor, Production and Project promotion
remains the separate Human-governed path above.

Recovery may select a suspected compromise timestamp and reconstruct
operational memory using only Candidate/decision/admitted-memory chains written
before that point. Every later write can be excluded even when it was
previously accepted. See
`MEMORY_ADMISSION_AND_OBSERVER_PLANE_2026-07-30.md`.

## Runtime continuation, Return and Receipt

A checkpoint or provider session can resume runtime state. Neither is a Return.
A completed provider task creates a result candidate. Gummy then decides whether
the candidate can form a Return against the exact Return anchor and canonical
version.

`gummy.provider-evidence-bundle/v1` records exact memory reads. Gummy combines
that bundle with the Work Order, Lease, Grant, Production Pool authorization,
Return and Human decisions. Provider telemetry is therefore evidence for a
Receipt, not the Receipt or acceptance.

> **Provider telemetry is evidence for a Receipt, not the Receipt or acceptance.**

## Canonical-state drift

If canonical state changes after the binding’s observed version:

```text
provider completion
→ result candidate
→ stale-return-anchor or reconciliation-required
→ Human-visible comparison
→ explicit revision, rejection or accepted Return
```

Silent application is forbidden. The runtime may continue only while authority
is valid, but continuation does not cure drift.

## Deterministic proof

The Phase 17A fixture includes:

- two revisions of one operational memory with complete derivation;
- an expired revision;
- an invalidated revision;
- an isolated memory owned by another Actor and Production;
- exact revision `2` in provider evidence;
- a canonical-state advance that forces `reconciliation-required`.

The conformance tests prove revision order, TTL, expiry, invalidation,
provenance, cross-scope denial, exact Receipt evidence and non-authority.

## Provider projection rule

Google Memory Bank, another managed memory service or a local index may project
Gummy operational memory for retrieval. The provider resource must retain the
same Actor/Production scope key and region policy. Gummy preserves the scope
policy, derivation, source hashes and exact revision evidence independently.

Deleting or losing a provider projection cannot delete canonical Gummy state.
Revoking the Gummy scope requires invalidating the provider projection.
