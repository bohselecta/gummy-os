# Phase 17A Foundation Acceptance Matrix — 2026-07-29

**Scope:** Issue #44 docs/contracts/deterministic foundation only
**Base:** `a6ab3451720a279cc3b1281ad994058629355de0`
**Branch:** `codex/phase17a-runtime-identity-memory-foundation`
**Allowed statuses:** `PASS`, `BLOCKED`, `NOT CLAIMED`, `FAIL`

`PASS` means the checked-in deterministic foundation proves the row.
`BLOCKED` means sequencing deliberately prevents the row.
`NOT CLAIMED` means no truthful live evidence exists. No `PASS` row implies
live provider behavior.

## Identity and delegation

| Gate | Evidence | Status |
| --- | --- | --- |
| Human, Actor, Agent, Runtime Binding and provider principal are distinct | binding schema; delegation-chain test | PASS |
| Actor remains stable across runtime replacement | four-binding fixture; Actor-stability test | PASS |
| Actor remains stable across Agent replacement | binding revision 4; Agent-replacement test | PASS |
| runtime principal rotation is revisioned and revocable | binding revisions 1–2; rotation test | PASS |
| provider failover preserves Work Order and Return anchor | binding revisions 2–3; failover test | PASS |
| complete Human → Actor → Agent → Work Order → Lease/Grant → binding → principal chain | `assertDelegationChain` | PASS |
| provider registry cannot create a Gummy Actor | provider doctrine/profile | PASS |
| real Google Agent Identity principal and revocation | no credentials/resources provisioned | NOT CLAIMED |

## Operational memory

| Gate | Evidence | Status |
| --- | --- | --- |
| operational memory is explicitly non-authoritative | schema constants and tests | PASS |
| exact memory revisions are required | scope schema and selector | PASS |
| revision and supersession are preserved | fixture revisions 1–2; revision-chain test | PASS |
| TTL and expiry prevent use | expired fixture and test | PASS |
| invalidation prevents use | invalidated fixture and test | PASS |
| derivation includes source events and hashes | derivation schema/fixture/test | PASS |
| cross-Actor memory use fails closed | scope fixture and test | PASS |
| cross-Production memory use fails closed | scope fixture and test | PASS |
| provider is not the sole provenance copy | scope schema/profile constants | PASS |
| promotion requires explicit Human acceptance | memory schema and doctrine | PASS |
| real provider Memory Bank isolation/deletion | no provider resource provisioned | NOT CLAIMED |

## Long-running work

| Gate | Evidence | Status |
| --- | --- | --- |
| seven-day provider window creates no ambient authority | policy constants and expiry test | PASS |
| Lease expiry stops continuation | time-controlled test | PASS |
| Grant expiry stops continuation | time-controlled test | PASS |
| checkpoint and resume use exact Gummy Box checkpoint | deterministic chronology | PASS |
| provider outage/failover creates new binding revision | deterministic chronology | PASS |
| Human-input pause requires Master Control | failure and success tests | PASS |
| pause does not expand authority | policy constant and unchanged binding | PASS |
| cooperative cancellation ack remains distinct from termination | cancellation chronology/test | PASS |
| budget hard stop precedes unauthorized spend | budget chronology/test | PASS |
| canonical-state drift forces reconciliation | drift chronology/test | PASS |
| provider completion creates only result candidate | completion-only test | PASS |
| real asynchronous continuation after client disconnect | requires live proof | NOT CLAIMED |
| real provider checkpoint/restart/cancellation | requires live proof | NOT CLAIMED |

## Provider evidence, Return and acceptance

| Gate | Evidence | Status |
| --- | --- | --- |
| provider telemetry is Receipt input | evidence schema constant/test | PASS |
| exact memory revisions appear in Receipt evidence input | evidence fixture/compiler/test | PASS |
| provider evidence cannot create canonical mutation | schema constant/test | PASS |
| completion remains separate from Return | completion-only test | PASS |
| Return remains separate from Receipt | evidence compiler and existing runtime proof | PASS |
| Receipt remains separate from Human acceptance | evidence compiler and existing runtime proof | PASS |
| acceptance remains separate from publication | existing runtime conformance; unchanged | PASS |
| real provider cost/resource evidence | deterministic values only | NOT CLAIMED |
| live Return → Receipt → Human decision | requires accepted integration/live proof | NOT CLAIMED |

## Threat model

| Gate | Evidence | Status |
| --- | --- | --- |
| all 20 Issue #44 threat cases fail closed | deterministic threat catalogue/test | PASS |
| credential replay and wrong-Agent principal reuse denied | threat cases 1–2 | PASS |
| memory poisoning/leakage/expiry denied | threat cases 4–7 | PASS |
| stale state, authority expiry and revocation denied | threat cases 9–11 | PASS |
| incomplete logs and duplicate Return/Receipt denied | threat cases 13–14 | PASS |
| budget, region, outage and wrong Return anchor denied | threat cases 15–18 | PASS |
| prompt escalation and destructive misclassification denied | threat cases 19–20 | PASS |
| live red-team evidence against Google resources | no live provider | NOT CLAIMED |

## Sequencing and preservation

| Gate | Evidence | Status |
| --- | --- | --- |
| foundation extends existing Runtime Binding architecture | additive schema declares `extendsRuntimeBindingSchema` | PASS |
| active Issue #43 UI/runtime files are unchanged | branch diff review | PASS |
| no live Google or MCP adapter enabled | profile/fixture false flags; no runtime integration | PASS |
| no credentials provisioned | profile fixture and repository secret scan | PASS |
| migration is copy-on-write and preserves IDs/records | migration plan | PASS |
| rollback is documented | dated rollback record | PASS |
| public chronology avoids unsupported causation claims | updated demo record/provider profile | PASS |
| complete repository verification | validation, 202 Node tests, production build, security/dependency audit, 62 Chromium passes and final preservation gate | PASS |
| runtime/UI integration | exact founder-accepted Issue #43 merge not yet used | BLOCKED |
| live Repository Steward proof | depends on accepted Issue #43 integration and credentials | BLOCKED |
| full Phase 17A acceptance | live proof is an explicit acceptance requirement | BLOCKED |
| Issue #36 broader MCP execution parent | remains open beyond this foundation | PASS |

## Foundation decision

The additive docs/contracts foundation is ready for draft-PR review. The
complete repository suite passed on 2026-07-29:

- repository validation: `PASS`;
- finish kit: 11 controlling files, 10 phases, 19 release gates;
- product preservation: 8 pillars, 4 migrated products, 6 Phase 14 Places, 22
  protocol schemas and 8 brand masters;
- copy audit: 19 required messages across 10 surfaces;
- color, brand, utility-tile and realm-asset audits: `PASS`;
- Node tests: 202 passed, 0 failed, 0 skipped;
- focused Phase 17A tests: 16 passed inside the 202;
- production build: 62 modules and 38 PWA precache entries;
- source hardening: 392 files scanned, 0 source maps and 0 server-only markers
  in the browser bundle;
- dependency audit: 381 packages audited, 0 vulnerabilities;
- Chromium: 62 passed, 2 explicitly skipped live-bridge tests, 0 failed;
- accessibility: integrated desktop/tablet/phone, Night/Day and reduced-motion
  checks passed;
- suite-complete product preservation: `PASS`;
- secret scan: no credential or private-key value added; the only matched
  private-key phrase is the scanner’s own deny-list literal.

Phase 17A as a whole is **not complete**. Runtime/UI integration and the live
Repository Steward proof remain blocked until they stack on the exact
founder-accepted Issue #43 merge commit. Issue #36 remains open for broader live
MCP adoption.
