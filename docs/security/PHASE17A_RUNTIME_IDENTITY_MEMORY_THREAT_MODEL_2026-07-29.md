# Phase 17A Runtime Identity and Memory Threat Model — 2026-07-29

**Scope:** additive contracts and deterministic conformance for Issue #44
**Live providers:** disabled
**Security posture:** every ambiguity is visible and fails closed

## Protected assets

- Human authority and Actor ownership;
- Actor / Agent / Runtime Binding / provider-principal separation;
- Work Orders, Authority Leases, Molds and Grants;
- Production Agreements and Production Pool authorization;
- canonical Production, Project and Gummy Box state;
- operational-memory scope, provenance, revision and deletion;
- checkpoints and Return anchors;
- Returns, Receipts, Human acceptance and Distribution Plans;
- provider credentials, runtime handles, logs and cost evidence.

## Trust boundaries

| Boundary | Untrusted input | Required control |
| --- | --- | --- |
| Human/Actor to Agent | representation claim | explicit Actor-to-Agent authorization; labels never collapse identities |
| Gummy to runtime adapter | binding and continuation request | compile-checked binding, complete delegation chain and earliest-expiry check |
| Runtime Binding to provider principal | principal, token and attestation | bind fingerprint to one Agent and binding revision; rotate/revoke explicitly |
| Agent to memory projection | generated or retrieved context | exact Actor/Production scope, exact revision, TTL and provenance |
| Provider memory to Gummy | generated claim | non-authoritative classification; no automatic canonical promotion |
| Provider runtime to checkpoint | continuation state | Gummy Box copy and hash; provider state is non-canonical |
| Provider telemetry to Receipt | logs, traces, usage and status | evidence bundle integrity; Gummy compiles the Receipt |
| Provider completion to Return | result candidate | exact Return anchor and canonical-version reconciliation |
| Prompt to tool | requested operation | Grant and operation-class check; prompt cannot expand permission |
| Cancellation to terminal state | acknowledgement | require observed terminal confirmation |

## Deterministic threat catalogue

The fixture
`fixtures/runtime-conformance/phase17a-runtime-identity-memory-foundation.json`
contains one input for every row. `tests/phase17a-foundation.test.mjs` evaluates
all rows through `evaluateThreatCase` and requires `fail-closed`.

| Threat | Detection | Fail-closed result and evidence |
| --- | --- | --- |
| provider principal credential replay | observed attestation fingerprint differs from binding | deny use; record principal/binding mismatch |
| runtime principal reused by the wrong Agent | requested Agent differs from bound Agent | deny dispatch/continuation; preserve both IDs |
| Actor/Agent/runtime identity confusion | identity value or namespace used for the wrong class | deny attribution; surface the distinct hierarchy |
| memory poisoning | missing/invalid source hashes or derivation mismatch | deny memory use; retain suspect revision for review |
| cross-Actor memory leakage | memory Actor differs from binding Actor | deny retrieval; disclose scope mismatch without leaking content |
| cross-Production memory leakage | Production differs from binding Production | deny retrieval; record both Production IDs |
| expired memory use | TTL/`expiresAt` boundary reached | deny retrieval and classify revision expired |
| generated memory treated as canonical truth | canonical mutation requested from operational memory | deny mutation; require explicit promotion and acceptance |
| stale canonical-state application | current canonical version differs from bound version | `stale-return-anchor` or `reconciliation-required` |
| Lease/Grant expiry during long work | current time reaches either expiry | checkpoint and stop; provider window cannot renew authority |
| provider runtime surviving Gummy revocation | provider activity occurs after binding revocation | deny all results/continuation; cancel and confirm termination |
| cancellation acknowledgement mistaken for termination | ack exists without terminal state | remain `cancellation-acknowledged`; do not claim stopped |
| provider logs omitted or altered | required log absent or hash mismatch | mark evidence incomplete; no Receipt acceptance path |
| duplicate Return and Receipt creation | idempotency key already consumed | reject duplicate; reference original record |
| budget overrun | projected charge exceeds local hard stop | checkpoint and `budget-stopped` before charge |
| region/data-residency mismatch | provider region differs from binding/scope | deny dispatch or memory projection |
| provider outage and restart | provider loss without valid Gummy checkpoint | stop; no recovery from provider-only state |
| runtime redeployment with wrong Return anchor | successor binding changes anchor | reject binding revision |
| prompt/tool permission expansion | requested operation class absent from Grant/binding | deny call; record attempted escalation |
| destructive action misclassified | observed/registered operation is destructive but declared otherwise | deny call and mark classification fault |

## Additional invariants

### Seven-day continuation

The provider-reported maximum is capability, not authority. Continuation is
checked against Lease, Grant, binding, budget and wall-time policy at each
transition. Human-input pause does not extend any boundary.

### Memory deletion and contradiction

Deletion or provider consolidation cannot erase Gummy derivation evidence.
Contradictory memories remain revisioned. Invalidated content is unavailable for
future use but remains auditable under retention policy.

### Evidence integrity

A provider evidence bundle records source/container digest, principal
attestation, ordered provider events, tool calls, policy decisions, traces,
exact memory reads, generated revisions, resource usage, cost and log hashes.
Incomplete or altered evidence cannot become sufficient Receipt evidence.

Provider telemetry remains `receipt-input`. Its terminal state cannot set
Return, Receipt, acceptance or canonical mutation.

### Canonical-state safety

Checkpoints and runtime memory never outrank the accepted Gummy Box version.
Completion against a stale version creates a reconciliation state. No automated
merge, publication or ownership change is allowed.

## Incident response

On an identity, scope, authority, locality, budget or evidence fault:

1. deny new dispatch, input and tool calls;
2. create a Gummy-owned checkpoint when safe;
3. revoke the Runtime Binding and affected memory scope if necessary;
4. request cooperative cancellation;
5. keep cancellation distinct from confirmed termination;
6. preserve hashed evidence without promoting provider claims;
7. project the fault into Command Center after Issue #43 integration;
8. route any changed authority only through Master Control;
9. reconcile against the latest canonical state;
10. require a new binding revision before recovery.

## Foundation limitations

These tests are deterministic contract proofs. They do not prove Google
credential isolation, real provider cancellation, provider log completeness,
actual cost, regional processing or live memory deletion. Those remain
`NOT CLAIMED` until a later branch stacks on the accepted Issue #43 merge,
provisions scoped credentials and executes the bounded Repository Steward proof.
