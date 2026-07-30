# Phase 17B External-Influence Acceptance Matrix — 2026-07-30

**Status vocabulary:** `PASS`, `BLOCKED`, `NOT CLAIMED`, `FAIL`
**Proof class:** deterministic repository evidence
**Live provider execution:** `NOT CLAIMED`
**Founder approval:** Hayden Lindley, 2026-07-30

## Memory Admission Boundary

| Gate | Evidence | Status |
| --- | --- | --- |
| worker output begins as Memory Candidate | candidate schema and benchmark | PASS |
| Candidate has no durable or canonical effect | schema constants and domain validation | PASS |
| Actor, Agent, Production, Work Order, Lease and Runtime Binding are exact | domain validation and negative tests | PASS |
| source evidence, claims, digest, scope, expiry, risk and attestation are required | strict schema compilation | PASS |
| only explicit Human-governed Actor decision can admit memory | admission-decision schema and validator | PASS |
| admitted operational memory links exact Candidate and decision | admitted-memory schema and validator | PASS |
| admitted operational memory remains non-authoritative | schema constants and tests | PASS |
| malicious future-deployment rule is rejected | deterministic benchmark | PASS |
| all memory writes after compromise can be excluded | reconstruction test, including a previously accepted benign write | PASS |
| real persistent provider-memory deletion | no provider resource | NOT CLAIMED |

## Endpoint authority

| Gate | Evidence | Status |
| --- | --- | --- |
| endpoint capabilities are a subset of active Lease and Grant | `assertEndpointAuthority` | PASS |
| endpoint binds exact Agent, Work Order and Runtime Binding | domain validation | PASS |
| arbitrary shell capability fails closed | negative test | PASS |
| `memory.admit` cannot be exposed to a worker | negative test | PASS |
| live network endpoint enforcement | no live endpoint | NOT CLAIMED |

## Observer Plane

| Gate | Evidence | Status |
| --- | --- | --- |
| Observer Agent differs from every worker Agent | observation validator and negative test | PASS |
| Observer runtime differs from every worker runtime | observation validator and negative test | PASS |
| Observer has separate Lease, Grant and bounded endpoint | benchmark fixture and endpoint validation | PASS |
| before/after state, progress events and completion evidence are required | observation schema and strict validation | PASS |
| observation spans revoked and replacement worker segments | deterministic benchmark | PASS |
| progress events are ordered and bound to exact worker/runtime | observation validator | PASS |
| Observer cannot accept or mutate canonical state | schema constants and tests | PASS |
| real DOM, screenshot, local IndexedDB and test-output filesystem evidence | Phase 17B Playwright benchmark | PASS |
| real video observation or provider telemetry | no live observer/provider | NOT CLAIMED |

## Return reconciliation and Receipt

| Gate | Evidence | Status |
| --- | --- | --- |
| worker report is classified as claim | reconciliation contract | PASS |
| claim digest is checked against observed after-state | reconciliation test | PASS |
| commissioned, observed and current canonical versions must match | stale-state negative test | PASS |
| Work Order criteria require independent evidence | four-criterion benchmark | PASS |
| every Memory Candidate has a decision before match | unresolved-candidate negative test | PASS |
| match still awaits Human acceptance | reconciliation state and constants | PASS |
| Receipt lists every proposed/rejected/excluded memory mutation | Receipt test | PASS |
| real Human acceptance and provider Return | no live integration | NOT CLAIMED |

## Preservation

| Gate | Evidence | Status |
| --- | --- | --- |
| no v1 UI, storage migration or provider adapter added | diff review | PASS |
| Phase 17A records remain unchanged | diff review and existing tests | PASS |
| no credentials or live flags introduced | fixture and source review | PASS |
| complete repository validation and tests | final verification log | PASS |
| rollback documented | dated rollback record | PASS |

## Verification record

| Verification | Result | Status |
| --- | --- | --- |
| Phase 17B focused Node suite | 10/10 passed | PASS |
| complete Node suite | 214/214 passed | PASS |
| production browser suite | 69 passed, including Phase 17B observer benchmark; 2 intentionally live-provider tests skipped | PASS |
| production build | 65 modules; PWA 1.2.0; 39 precache entries | PASS |
| security hardening scan | 418 source files; no source maps or server-only markers in client output | PASS |
| repository validation, preservation, copy, color, brand, utility and realm checks | all passed | PASS |
| live provider execution | not exercised | NOT CLAIMED |

## Decision

The deterministic Phase 17B pass is complete. It adds enforceable domain
boundaries and recovery evidence without claiming live provider, robotics,
Ruflo or MCP behavior. Live provider execution remains NOT CLAIMED.

The numbered **What changed / Why it matters** report was approved in full by
Hayden Lindley on 2026-07-30.
