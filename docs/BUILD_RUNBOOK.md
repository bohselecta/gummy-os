# Gummy OS Final Release Build Runbook

## Purpose

This runbook executes the founder-ready release program. It replaces the proof-stage gate sequence as the active build procedure while preserving all accepted evidence and product boundaries.

Detailed requirements live in `docs/finish-kit/`.

## Read first

1. `docs/finish-kit/README.md`
2. `docs/finish-kit/MASTER_RELEASE_ROADMAP.md`
3. `docs/finish-kit/PRODUCT_READINESS_AND_UX.md`
4. `docs/finish-kit/SPECIALIST_INTEGRATION_BLUEPRINT.md`
5. `docs/finish-kit/INFRASTRUCTURE_AND_GUMMY_BOX.md`
6. `docs/finish-kit/ACCEPTANCE_AND_RELEASE_MATRIX.md`
7. `docs/finish-kit/RISKS_STOP_RULES_AND_DEFERRED_SCOPE.md`
8. `docs/finish-kit/release-program.json`
9. `plans/active/2026-07-27-master-finish-up-execution.md`
10. `AGENTS.md`

Use `docs/finish-kit/CODEX_ONE_TURN_EXECUTION_PROMPT.md` to launch the complete Codex execution.

## Canonical repositories

```text
bohselecta/gummy-os
bohselecta/imagehoss
bohselecta/videoboss
bohselecta/3d-bee
```

Resolve exact default-branch heads before work. Do not assume the baseline recorded in the kit is still the tip. Inspect and preserve any newer canonical work.

## Workspace preparation

For each repository:

1. verify remote and default branch;
2. fetch all branches and PR refs needed for reconciliation;
3. inspect `git status`, recent commits, open PRs, and untracked files;
4. do not reset, stash, or discard changes of uncertain ownership;
5. run the current baseline verification before editing;
6. record versions for Node, npm, browser, Rust, Python, Blender, ComfyUI, and relevant provider/runtime tools;
7. create or reuse one branch:

```text
codex/final-release-2026-07-27
```

8. commit `evidence/final-release-baseline.json` in Gummy OS before implementation changes.

## Branch and commit policy

Use one final branch per touched repository and checkpoint commits:

```text
phase 0: freeze final release baseline
phase 1: close product readiness gaps
phase 2: finish onboarding and product copy
phase 3: prove golden Production path
phase 4: integrate ImageHoss runtime
phase 5: integrate VideoBoss runtime
phase 6: integrate Meshmallow runtime
phase 7: finish Gummy Box recovery
phase 8: harden release candidate
phase 9: produce final acceptance release
```

Not every repository receives every checkpoint. Do not create many tiny PRs or competing release branches.

## Phase loop

For every phase:

```text
inspect exact state
→ run applicable baseline tests
→ implement complete bounded phase
→ add/update automated tests
→ run phase gate
→ capture evidence and limitations
→ commit checkpoint
→ continue automatically
```

A phase gate is a commit/rollback boundary, not a mandatory founder conversation.

## Gummy OS commands

Current required deterministic baseline:

```bash
npm ci
npm run brand:generate
npm run utility:generate
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

Use `npm run test:live` only when its required provider/configuration environment is intentionally available. Live tests never replace deterministic gates.

Run the exact production build locally and against the canonical preview/deployment. Verify the actual HTML, brand assets, API capability state, build identifier, and critical journeys—not only the deployment status badge.

## ImageHoss commands

Current baseline:

```bash
npm ci
npm test
npm run build
npm run check
npm run fixture
npm audit --audit-level=low
```

The final implementation should expose stable equivalents for contract, integration, browser, live, and aggregate verification:

```bash
npm run test:contract
npm run test:integration
npm run test:e2e
npm run test:live
npm run verify
```

For a genuine local smoke, record exact ImageHoss bridge, ComfyUI, device, checkpoint/model, Prompt Package, Job, Asset hashes, Receipt, restart recovery, and `simulation: false` evidence.

When the runtime is absent, run deterministic adapter and unavailable-state tests, record live execution as NOT CLAIMED, and continue.

## VideoBoss commands

Current baseline:

```bash
npm ci
npm test
npm run build
npm audit --audit-level=low
```

The final implementation should add stable check/unit/integration/browser/live/verify scripts.

The deterministic simulator remains part of the test/demo system and must always identify itself as simulated.

A real provider smoke runs only through the trusted server-side broker and records provider/model, Shot Packet, idempotency key, cost ceiling/actual cost, provider Job ID, result hash, review, Human acceptance, and linked Receipts.

When no provider credential exists, finish the broker contract, mock tests, UI, and live-smoke command; record real rendering as NOT CLAIMED and continue.

## Meshmallow / 3D Bee commands

Current deterministic baseline:

```bash
cargo test --workspace --locked
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
PYTHONPATH=bridge python3 -m unittest discover -s bridge/tests -v
cd apps/desktop && npm ci && npm run build
cargo check -p three-d-bee-desktop --locked
npm audit --audit-level=low
git diff --check
```

Also run repository schema/example validation and any current audit commands.

The final implementation should add one documented aggregate verification command.

For a genuine Blender smoke, record the public Meshmallow identity and legacy IDs, companion/supervisor version, Blender version, frozen Scene Plan/digest, approval/session/Lease/Grant, exact named operations, checkpoint, `.blend` and export hashes, manifest validation, and linked Receipts.

When supported Blender is absent, run deterministic mock and fail-closed discovery tests; record live artifact output as NOT CLAIMED and continue.

## Cross-repository contract procedure

1. add backward-compatible specialist-native types and migrations;
2. commit exact specialist protocol fixtures;
3. record specialist branch/head/version;
4. implement Gummy OS wrapper/adapter against that exact contract;
5. run old and new specialist fixtures;
6. run cross-repository roundtrip fixtures;
7. update Gummy OS application registry only after compatibility passes;
8. retain rollback to the prior deterministic/reference route.

Do not integrate against an imagined or uncommitted specialist contract.

## Configuration/no-execution gate

Before any specialist execution work, automate:

```text
open specialist
→ edit fields
→ assign references
→ discover capability
→ compile preview
→ save Production configuration
→ assert zero creative native Jobs
→ assert zero provider submissions
→ assert zero Blender operations
→ assert zero creative credit spend
```

Failure is a hard release failure.

## Make Production gate

Automate:

```text
review frozen revision
→ create immutable Run
→ create Context Envelopes and Work Orders
→ require Human, Actor, actual Agent/runtime, Mold, Lease, Grant, capability state
→ execute one owned Job per eligible node
→ normalize terminal state
→ import results without source overwrite
→ compare/review
→ Human accepts role-specific output
→ handoff
→ Return and linked Receipts
→ close/reopen continuity
```

## Golden Production gate

The neutral built-in sample is **Night Gummy Launch**.

It must run without private likenesses, external accounts, or provider credentials through deterministic routes. Connected real routes may replace or augment eligible nodes only with explicit truth and evidence.

The sample must demonstrate:

- direction, locks, reference roles, exploration, exclusions;
- deterministic package preview;
- route/cost/locality/privacy/rights;
- Make Production authority;
- results and limitations;
- Human comparison and acceptance;
- downstream handoffs;
- linked native/platform Receipts;
- restart continuity.

Keep Ranch Day as a regression fixture where useful, not the only product doorway.

## Local Gummy Box gate

Automate:

```text
clean first run
→ automatic Local Box
→ write records and bytes
→ close/reopen
→ export versioned inspectable backup
→ clean browser context
→ inspect and import backup
→ verify identical IDs, revisions, hashes, relationships, Returns, and Receipts
→ continue using restored Production
```

Normal setup never asks for GitHub App, PEM, installation, repository, bucket, or deployment configuration.

## Evidence

Create or update:

```text
evidence/final-release-baseline.json
evidence/product-readiness-audit.json
evidence/product-copy-audit.json
evidence/final-acceptance-summary.json
evidence/final-release-manifest.json
evidence/performance-budget.json
evidence/rollback-plan.md
evidence/screenshots/
evidence/receipts/
evidence/cross-repo-fixtures/
```

Retain large videos/traces/binaries in CI or the producing specialist repository when appropriate. Link exact artifact, commit, browser/runtime, viewport, fixture, and hash from the manifest.

## External blocker behavior

A missing optional external capability stops only that live lane.

For the affected lane:

1. finish code and deterministic tests;
2. finish capability discovery and truthful unavailable UI;
3. finish recovery/cancellation contracts;
4. add one-command live smoke;
5. record exact BLOCKED or NOT CLAIMED state;
6. continue every unaffected phase.

Do not stop the complete turn because a provider key, ComfyUI, Blender, managed Box, Drive, GitHub connector, or Gummy Rooms is absent.

## Hard stops

Stop the unsafe mutation when:

- data may be lost or ambiguously migrated;
- a source or accepted Asset would be overwritten;
- Actor/Agent or Human authority boundaries collapse;
- configuration executes;
- Work Order self-authorizes;
- secrets enter browser-visible material;
- local bridge becomes arbitrary execution;
- cost, rights, locality, or retention cannot be enforced;
- ambiguous provider calls may duplicate;
- simulation and genuine output cannot be distinguished;
- specialist-native evidence would be destroyed;
- historical 3D Bee identity would be rewritten;
- tests are being skipped or loosened merely for green status;
- a release claim exceeds executable evidence.

Continue unaffected work and return exact evidence.

## PR and merge procedure

1. push final specialist branches;
2. open one ready PR per specialist;
3. include exact tests, evidence, migrations, rollback, limitations, and Gummy OS dependency contract;
4. merge additive/backward-compatible specialist prerequisites only after applicable gates pass and old fixtures remain compatible;
5. reconcile Gummy OS onto exact resulting specialist heads;
6. run the complete production-like acceptance matrix;
7. open one final ready Gummy OS PR;
8. merge only when every required final gate is PASS;
9. when a required gate remains BLOCKED/FAIL, leave the complete PR open and return the exact blocker rather than discarding work.

Do not make Hayden perform ordinary branch, PR, merge, cleanup, or routine testing tasks that connected tools and automation can perform.

## Final Return

Return one release report containing:

- repository/branch/head/PR/merge status for all four repositories;
- phase-by-phase completion;
- test commands and totals;
- production-like deployment URL and commit;
- deterministic golden Production evidence;
- live specialist status using PASS, BLOCKED, NOT CLAIMED, or FAIL;
- Local Box backup/restore proof;
- accessibility, visual, security, reliability, and performance status;
- migration and rollback anchors;
- exact limitations and external blockers;
- final release level.

Do not return another plan or a manual regression checklist.

> **The computer tests the computer. Hayden builds the world.**
