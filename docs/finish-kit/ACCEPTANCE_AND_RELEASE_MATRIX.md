# Acceptance and Release Matrix

## Purpose

This is the final evidence contract for the Gummy OS release-completion program.

The existing `docs/AUTOMATED_ACCEPTANCE.md` remains authoritative. This matrix applies it to the final multi-repository program and defines exactly what Codex must prove before using the phrases **release candidate**, **acceptance ready**, or **founder ready**.

## Status vocabulary

Every gate and live capability receives exactly one status:

- **PASS** — executable evidence exists for the exact referenced head/build;
- **BLOCKED** — required for the selected release target, but a named blocker remains;
- **NOT CLAIMED** — intentionally outside the release or impossible to prove in the current environment; no product claim is made;
- **FAIL** — attempted evidence contradicts the requirement.

Do not use `mostly passes`, `appears to work`, `should work`, `implemented`, or `ready` as substitutes.

## Release levels

### Code complete

Implementation exists, but final acceptance may not.

### Deterministic CI green

All hermetic/static/unit/integration/build/browser tests pass without external providers.

### Capability ready

The product includes complete discovery, configuration, authority, adapter, recovery, cancellation, and truthful unavailable behavior for an external capability.

### Live proven

A real external/local runtime execution completed on the exact head and produced verifiable evidence. This status is specific to that route/runtime, not the whole product.

### Acceptance ready

The complete critical product journey passes against a production-like exact-head build with retained evidence.

### Founder ready

Hayden can open the current release and use it as a customer without first serving as the regression tester.

## Program-wide non-negotiable gates

| Gate | Requirement | Evidence | Release consequence |
| --- | --- | --- | --- |
| Exact source | Every result names repository, branch, commit, dependency heads, and build/deployment | baseline and final manifest | Missing = BLOCKED |
| Clean checkout | Repositories install/build/test from a clean clone | CI/log summary | Missing = BLOCKED |
| Product preservation | Eight protected pillars, four first-party application IDs, brand masters, schemas, and Bar surfaces survive | product-preservation report | Failure = FAIL |
| Configuration truth | Opening/configuring a specialist creates no creative Job or spend | unit + E2E + Job inventory | Failure = FAIL |
| Execution boundary | Make Production is the sole Production-wide execution transition | E2E + Work Order/Run evidence | Failure = FAIL |
| Authority | Human/Actor/Agent/Mold/Lease/Grant/context intersection is enforced | unit/integration/denial Receipts | Failure = FAIL |
| Source immutability | Sources and accepted prior results remain byte/hash identical | integration + E2E hashes | Failure = FAIL |
| Persistence | close/reopen/browser-context restart restores accepted state and recoverable Jobs | E2E/storage evidence | Failure = BLOCKED |
| Truthful capability | simulated, connected, degraded, unavailable, and real states cannot be confused | UI + fixtures + live evidence | Failure = FAIL |
| Cancellation/recovery | owned Jobs cancel/recover without duplicate unsafe submission | adapter tests + E2E/live where available | Missing for executable route = BLOCKED |
| Human acceptance | completion never auto-accepts artistic/product result | E2E + acceptance record | Failure = FAIL |
| Receipt linkage | specialist-native and Gummy OS Receipts remain distinct and linked | schema/integration/evidence | Failure = FAIL |
| Local first | new user starts and completes deterministic golden path without external account | first-run E2E | Missing = BLOCKED |
| Backup/restore | Local Box exports, inspects, imports, and restores IDs/hashes/relationships | integration + clean-context E2E | Missing = BLOCKED |
| Accessibility | no unapproved critical/serious violations; keyboard and screen-reader semantics work | axe + browser evidence | Failure = BLOCKED |
| Responsive polish | desktop/laptop/tablet/phone critical paths are usable | visual/E2E evidence | Failure = BLOCKED |
| Security boundary | no browser secrets, path escape, ambient authority, self-authorizing Work Order, or untrusted native execution | static/integration/adversarial tests | Failure = FAIL |
| Known limits | current limitations are visible in product and final Return | copy audit + UI screenshots | Missing = BLOCKED |
| Rollback | prior accepted release/adapter can be restored without falsifying evidence | runbook + migration tests | Missing = BLOCKED |

## Required test environments

### Hermetic deterministic environment

- no provider credentials required;
- fixed timestamps/seeds/fixtures where applicable;
- deterministic browser routes and mocked adapters;
- production build, not dev-only component rendering;
- stable local storage origin;
- no dependence on Hayden’s private projects.

### Production-like web environment

- exact commit deployed;
- HTTPS origin;
- production asset paths and PWA manifest;
- real server route configuration state;
- no obsolete alias/scaffold;
- acceptance pack isolated from private production data.

### Local capability environment

For ImageHoss and Meshmallow:

- exact local companion version;
- supported OS/runtime version;
- loopback/pairing/authentication state;
- exact model/checkpoint or Blender version;
- evidence that output is genuine or explicit NOT CLAIMED.

### Cloud provider environment

For any real VideoBoss/provider route:

- exact broker commit;
- provider/model/endpoint identity;
- secret stored server-side;
- cost table/version;
- bounded test input;
- provider Job/request ID;
- cancellation/recovery behavior;
- output hash and rights/retention disclosure.

## Repository command matrix

Codex must inspect current scripts before running and may add missing stable scripts as part of the finish program.

### Gummy OS

Minimum deterministic commands:

```bash
npm ci
npm run check
npm run test:unit
npm run test:integration
npm run build
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run test:acceptance
npm run verify
npm audit --audit-level=moderate
```

Optional/live:

```bash
npm run test:live
```

Required final outputs:

- test totals by layer;
- full-product preservation report;
- Night/Day screenshot set;
- viewport set;
- golden Production evidence;
- Local Box backup/restore evidence;
- exact deployed URL/commit;
- limitations and rollback.

### ImageHoss

Current minimum commands:

```bash
npm ci
npm test
npm run build
npm run check
npm run fixture
npm audit --audit-level=low
```

The final phase should expose stable equivalents for:

```bash
npm run test:contract
npm run test:integration
npm run test:e2e
npm run test:live
npm run verify
```

Live ImageHoss evidence must include:

- bridge/runtime versions;
- capability snapshot;
- model/checkpoint identity and permitted-use metadata;
- Prompt Package hash;
- native WorkOrder/Job/Receipt;
- `simulation: false`;
- original and proxy hashes;
- project-scoped durability after restart;
- Gummy OS Return/Receipt links;
- accepted role and VideoBoss handoff where in scope.

### VideoBoss

Current minimum commands:

```bash
npm ci
npm test
npm run build
npm audit --audit-level=low
```

The final phase must add stable equivalents for:

```bash
npm run check
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:live
npm run verify
```

Deterministic evidence must prove simulator truthfulness, planning, routing, Cost Shield, review, continuity, acceptance, and exports.

Live VideoBoss evidence, only when a provider route is available, must include:

- broker/provider/model versions;
- exact Shot Packet and hash;
- cost ceiling and actual cost;
- provider Job/request ID;
- progress/terminal normalization;
- cancellation or documented provider limitation;
- result bytes/hash/duration/format;
- take review and Human acceptance;
- native and platform Receipt links;
- `simulation: false` or equivalent provider fact.

### Meshmallow / `bohselecta/3d-bee`

Current deterministic minimum:

```bash
cargo test --workspace --locked
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
PYTHONPATH=bridge python3 -m unittest discover -s bridge/tests -v
cd apps/desktop && npm ci && npm run build
cargo check -p three-d-bee-desktop --locked
npm audit --audit-level=low
```

Run any repository-wide schema/example validation and `git diff --check` used by the current project.

The final phase should expose one documented orchestration command such as `npm run verify`, `just verify`, or a script that runs the accepted stack consistently.

Live Meshmallow evidence, only with supported Blender, must include:

- public Meshmallow identity plus preserved legacy IDs;
- companion/supervisor and Blender version;
- capability discovery;
- frozen Scene Plan and digest;
- approval/session/Lease/Grant linkage;
- exact named operations;
- genuine checkpoint/preview;
- genuine `.blend` hash;
- at least one genuine interoperable export when supported;
- manifest validation;
- native Return/Receipt and Gummy OS links;
- no arbitrary Python/shell/path escape.

## Static and contract acceptance

Automate:

- syntax/type/lint checks adopted by each repository;
- JSON Schema parsing and fixture validation;
- unknown-field and version behavior;
- legacy migration fixtures;
- protocol compatibility fixtures across repositories;
- forbidden stale public naming where applicable;
- forbidden narrow ImageHoss/VideoBoss/Meshmallow product reduction;
- no unauthorized palette literals in Gummy OS source;
- production brand asset hashes and dimensions;
- app registry and product-map integrity;
- route and asset existence;
- dependency audit;
- built-bundle secret markers;
- documentation links and finish-kit manifest consistency.

## Unit acceptance

At minimum:

- canonical serialization and package hashes;
- configuration validation;
- reference role/strength/rights behavior;
- lock conflict classification;
- delta revision carry-forward;
- capability snapshot validation and expiry;
- Actor/Agent/Mold/Lease/Grant intersection;
- Work Order cannot grant itself authority;
- cost and locality policy;
- Task Lease conflict/staleness;
- status transitions;
- cancellation/recovery decisions;
- Receipt linking;
- Human acceptance role assignment;
- source/result immutability;
- Box revisions, backup inventory, import conflict policy;
- migrations and idempotency;
- public Meshmallow alias with legacy identity preservation.

## Integration acceptance

At minimum:

- IndexedDB/OPFS writes, reads, interruption, quota, and recovery;
- configuration saved without native Job creation;
- frozen Run and Context Envelopes;
- one and only one native specialist Job per authorized node/idempotency key;
- adapter unavailable/degraded/ready transitions;
- specialist result import and hashes;
- specialist and platform Receipt linkage;
- accepted output and downstream handoff;
- cross-Production isolation;
- browser/bridge restart recovery;
- backup export/import in clean storage context;
- legacy Production and specialist record migration;
- optional node failure vs required node failure semantics;
- provider disconnect/reconnect and offline queue where implemented.

## Browser critical journeys

### Journey 1 — New user

```text
clean browser
→ welcome explains Gummy OS
→ Local Gummy Box created
→ choose blank or sample Production
→ enter Canvas
→ reload
→ state persists
```

### Journey 2 — Configuration does not execute

```text
open Production
→ add ImageHoss/VideoBoss/Meshmallow
→ edit configuration
→ compile previews
→ save
→ assert no creative native Job, provider request, credit spend, or Blender operation
```

### Journey 3 — Golden deterministic Production

```text
open Night Gummy Launch
→ review ready configurations
→ Make Production
→ freeze Run
→ execute deterministic eligible nodes
→ show truthful optional unavailable nodes
→ receive results and evidence
→ compare
→ Human accepts
→ handoff and final package
→ close/reopen
→ all accepted state remains
```

### Journey 4 — Real ImageHoss when connected

```text
pair trusted bridge
→ discover supported ComfyUI
→ configure and compile
→ Make Production
→ one native Job
→ progress/result import
→ original/proxy hashes
→ compare/accept
→ linked Receipts
→ restart recovery
```

When capability is absent, run the matching unavailable journey and mark live execution NOT CLAIMED.

### Journey 5 — VideoBoss

```text
consume accepted ImageHoss Asset
→ edit sequence/shot
→ Cost Shield
→ compile without rendering
→ Make Production
→ simulator or connected provider route
→ review takes
→ Human accepts
→ deliver package
→ linked evidence
```

### Journey 6 — Meshmallow

```text
configure world/scene intent
→ inspect typed operation plan
→ compile without Blender execution
→ Make Production
→ mock or authenticated Blender route
→ checkpoint/export/validate when available
→ Human accepts package role
→ linked evidence
```

### Journey 7 — Authority denial and revocation

```text
remove approval/revoke Mold or Agent
→ attempt Make Production or specialist Job
→ blocked before work
→ denial Receipt
→ restore authorized state
→ new work may proceed
```

### Journey 8 — Cancellation and recovery

```text
start owned Job
→ cancel or interrupt browser/network
→ reopen
→ inspect existing Job
→ no duplicate unsafe submission
→ truthful terminal/recovery state
```

### Journey 9 — Backup and restore

```text
create accepted Production state
→ export backup
→ clean browser context
→ inspect/import
→ verify IDs/hashes/relationships/Receipts
→ continue working
```

### Journey 10 — Responsive and accessible

Run first-run, configuration, Make Production review, acceptance, and Receipt inspection with keyboard and at all required viewport classes.

## Viewport and visual matrix

Minimum:

```text
1440 × 900 desktop
1280 × 800 laptop
768 × 1024 tablet
390 × 844 phone
```

Capture Night and Day where the surface supports both.

Required surfaces:

- welcome and Local Box ready;
- blank Production empty state;
- Night Gummy Launch sample;
- setup rail/roster;
- ImageHoss structured configuration and preview;
- VideoBoss structured configuration and Cost Shield;
- Meshmallow structured configuration and capability state;
- Make Production review;
- active progress;
- capability unavailable;
- blocked/denied;
- completed awaiting acceptance;
- comparison/acceptance;
- Run history;
- Receipt linkage;
- backup inspect/import;
- phone layout;
- reduced-motion state where visually relevant.

Visual baselines update only with an explanation of why the new result is correct.

## Accessibility matrix

Automate and manually inspect only where automation cannot judge quality:

- axe critical/serious findings;
- keyboard reachability and order;
- visible focus;
- focus trap/return for dialogs;
- accessible names for candy icons, mascots, tiles, application cards, status, and actions;
- live-region or equivalent progress/terminal announcements;
- no color-only state;
- Night/Day contrast;
- reduced motion;
- 200% zoom/reflow;
- touch target size;
- readable errors, approvals, and Receipt summaries;
- technical JSON secondary to readable content.

Any exception must name exact element, user impact, workaround, owner, and founder approval. Do not blanket-waive a page.

## Security/adversarial matrix

Prove rejection of:

- self-authorizing Work Order;
- Actor/Agent identity collapse;
- revoked/expired Mold, Lease, Grant, or capability session;
- stale configuration/capability snapshot;
- unapproved Actor memory or likeness context;
- source overwrite;
- provider secret in browser bundle or backup;
- path traversal/archive bomb/active-content bundle;
- arbitrary ComfyUI workflow;
- arbitrary Blender Python/shell/operation;
- local companion origin/session mismatch;
- external Box scope escape;
- duplicate provider submission after ambiguous response;
- cost ceiling bypass;
- malformed/oversized response;
- Receipt or artifact hash mismatch;
- unsupported future schema applied as current;
- destructive migration without rollback.

## Reliability matrix

Exercise:

- refresh during configuration;
- refresh during deterministic execution;
- close/reopen during native/provider Job;
- offline transition;
- local companion restart;
- provider timeout;
- duplicate event delivery;
- stale Task Lease;
- failed byte write;
- low quota;
- interrupted backup export/import;
- optional specialist unavailable;
- required specialist failure;
- rejected and branched candidate;
- previous accepted result retained after failed revision;
- rollback to prior application deployment.

Every case must reach a truthful terminal or recoverable state. No infinite spinner.

## Performance evidence

Measure on exact production build:

- initial shell load and time to interactive;
- first-run completion responsiveness;
- Production reopen with realistic acceptance fixture;
- IndexedDB/OPFS hydration;
- large receipt/history list rendering;
- image proxy loading;
- memory after repeated window/Production open-close;
- PWA cached shell start;
- phone interaction responsiveness.

Codex should set practical budgets after collecting the baseline and record them in `evidence/performance-budget.json`. A regression beyond an accepted threshold blocks the release unless an explicit tradeoff is documented.

## Evidence directory contract

Create or update:

```text
evidence/final-release-baseline.json
evidence/product-readiness-audit.json
evidence/product-copy-audit.json
evidence/final-acceptance-summary.json
evidence/final-release-manifest.json
evidence/performance-budget.json
evidence/rollback-plan.md
evidence/screenshots/...
evidence/receipts/...
evidence/cross-repo-fixtures/...
```

Generated large binary evidence may live in retained CI artifacts or specialist repositories when repository size makes that more appropriate. The manifest must link it unambiguously.

## Final acceptance summary schema

`evidence/final-acceptance-summary.json` should contain:

- exact repositories/heads/PRs;
- test command, status, total, duration, environment;
- deployed build/URL;
- deterministic golden path status;
- per-specialist capability-ready status;
- per-specialist live-proven status;
- Local Box backup/restore status;
- accessibility/visual/security/performance status;
- migration/rollback status;
- known limitations;
- external blockers;
- release-level decision;
- timestamp and evidence references.

## Founder-ready decision rule

Founder-ready is **PASS** only when:

- every program-wide non-negotiable gate is PASS;
- deterministic critical journeys are PASS;
- Local Box and backup/restore are PASS;
- the production-like exact-head deployment is PASS;
- no open critical data-loss, authority, security, persistence, onboarding, or accessibility defect remains;
- connected live capabilities are supported by live evidence;
- unconnected live capabilities are plainly shown as unavailable and NOT CLAIMED rather than blocking deterministic use;
- Hayden is being invited to use the product, not to run a test script.

The final instruction to Hayden should be equivalent to:

> Open this exact release. Start locally or open the sample Production. Begin using Gummy OS.

It must not be a list of buttons Hayden needs to click to prove the builder’s work.
