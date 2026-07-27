# Master Release Roadmap

**Program:** Gummy OS founder-ready release candidate  
**Execution style:** One sustained Codex turn, sequential phases, evidence-gated continuation  
**Controlling principle:** Refinement and implementation, not renewed architecture

## How Codex must use this roadmap

Execute every phase in order. A phase checkpoint is a commit and evidence boundary, not a conversational stop.

At each phase:

1. inspect the exact current heads and prior phase output;
2. run the applicable baseline tests before source changes;
3. implement the complete bounded phase;
4. add or update automated tests before moving on;
5. record exact evidence and truthful limitations;
6. commit the checkpoint;
7. continue automatically to the next phase.

Do not pause for a proposal review unless the only remaining choice is an irreversible founder decision that cannot be inferred from accepted canon. When a preference is not irreversible, choose the option that preserves existing behavior, minimizes migration risk, and remains easy to revise.

## Program-wide branch strategy

Use one branch per touched repository:

```text
bohselecta/gummy-os   → codex/final-release-2026-07-27
bohselecta/imagehoss  → codex/final-release-2026-07-27
bohselecta/videoboss  → codex/final-release-2026-07-27
bohselecta/3d-bee     → codex/final-release-2026-07-27
```

If an equivalent active branch already exists and contains compatible work, reconcile it rather than creating a competing lane.

Use phase checkpoint commits with clear subjects:

```text
phase 0: freeze final release baseline
phase 1: close product readiness gaps
phase 2: finish onboarding and product copy
phase 3: prove the golden Production path
phase 4: integrate ImageHoss runtime
phase 5: integrate VideoBoss runtime
phase 6: integrate Meshmallow runtime
phase 7: finish Gummy Box setup and recovery
phase 8: harden and polish release candidate
phase 9: produce final acceptance release
```

Open one final PR per touched repository. Cross-link exact dependent heads. The Gummy OS integration PR is opened after specialist branches are pushed and contract references are stable.

---

# Phase 0 — Freeze the release baseline

## Why

The project has accumulated many accepted ideas, historical branches, and phase receipts. The final run must begin from exact, reproducible reality rather than from memory or a stale plan.

## Required work

### Repository state

- verify the exact default-branch head of all four repositories;
- list open PRs and classify each as required, superseded, deferred, or unrelated;
- do not silently merge unrelated work;
- preserve useful evidence branches while closing or clearly deferring competing release lanes;
- record package/runtime versions and available scripts;
- run the existing deterministic verification commands in every touched repository.

### Machine-readable baseline

Create `evidence/final-release-baseline.json` in Gummy OS containing:

- repository and head;
- branch used for final work;
- framework/runtime versions;
- baseline tests and totals;
- deployment/preview state;
- known external capability status;
- open PR disposition;
- exact limitations;
- timestamp.

### Product freeze

Record these as release invariants:

- Gummy OS, Gummy Canvas, Gummy Bar, Gummy, Glopper, Gummy Box, Actor, Agent, Mold, Master Control, Production, Work Order, Task Lease, Grant, Return, Receipt;
- Night Gummy and Day Gummy only;
- exact five-color source palette;
- Human authority above Actor and Agent;
- opening/configuring never executes;
- Make Production is the sole Production execution transition;
- Local Box works without an account;
- specialist repositories remain separate;
- specialist and Gummy OS Receipts remain linked but distinct;
- production-specific choices do not silently become Actor memory.

## Exit gate

- all baseline tests either pass or have exact pre-existing blockers;
- the baseline evidence file is committed;
- no competing release branch remains ambiguous;
- no source change beyond baseline/evidence housekeeping is mixed into this phase.

---

# Phase 1 — Product readiness audit and surgical cleanup

## Why

The underlying system is broad and technically coherent, but the current UI still exposes implementation-era language, a Ranch Day-specific setup, narrow placeholder specialist roles, and states that are accurate for the proof rather than ideal for a new user.

This phase does not redesign the product. It removes friction and contradiction before deeper integration.

## Required work

### Audit the complete user-visible product

Browser-automate and inspect:

- boot and first run;
- Canvas and window behavior;
- Gummy Bar;
- Glopper Panel and Inbox;
- Applications;
- Actors/Bowls;
- Production empty state, roster, setup rail, Actor Plan, Gummy shelf, Run history, Master Control;
- specialist Actor App Surfaces;
- Local Gummy Box, Work Orders, Returns, and Receipts;
- Night and Day at desktop, laptop, tablet, and phone widths;
- empty, loading, unavailable, denied, failed, revoked, offline, stale, cancelled, and completed states.

### Classify every finding

Use only:

- **Release blocker** — prevents understanding, setup, core use, data safety, authority safety, accessibility, or truthful operation;
- **Release requirement** — required for a polished founder-ready release;
- **Deferred enhancement** — useful but not required for this release;
- **Rejected drift** — would reopen architecture or flatten a protected product pillar.

Commit both a human-readable report and `evidence/product-readiness-audit.json`.

### Correct current implementation-era drift

At minimum:

- replace `reference-preparation`, `scene-preparation`, and other narrow public specialist descriptions with the complete accepted product relationships;
- show **Meshmallow** publicly while preserving `actor:3d-bee`, `app:3d-bee`, repository paths, protocol lineage, and historical Receipts;
- remove Ranch Day as the only visible first action; retain it as a fixture if tests still require it;
- make deterministic reference execution visibly a demonstration/test lane, never the apparent production capability;
- ensure every application state says what works now, what connection is needed, and what the user can do next;
- remove dead buttons, placeholder links, contradictory routes, and stale claims;
- make the current canonical deployment and repository status unambiguous.

### Protected code areas likely touched

- `src/core/production-runtime.js`
- `src/core/product-registry.js`
- `public/registry/first-party-applications.json`
- `src/apps/production.js`
- `src/apps/actor-surface.js`
- `src/apps/master-control.js`
- `src/app.js`
- `src/styles/*`
- product-preservation and E2E tests

## Exit gate

- all release blockers found in this phase are fixed or become exact external blockers;
- no protected product pillar disappears;
- the registry and UI use truthful current names and statuses;
- `npm run verify` passes;
- screenshots and audit evidence are retained.

---

# Phase 2 — Finish first-run experience, product copy, and setup

## Why

A new user should not need the architecture history to understand the product. The interface must explain the useful relationship first and reveal protocol detail when it becomes relevant.

## Required work

Implement the complete experience in `PRODUCT_READINESS_AND_UX.md`, including:

- five-second comprehension;
- ten-second first action;
- Local Gummy Box automatically available;
- simple choice between a blank Production and the safe sample Production;
- progressive disclosure of Actor, Agent, Mold, Lease, Grant, Return, and Receipt;
- a persistent “nothing runs until Make Production” explanation in configuration contexts;
- clear distinction between Gummy guidance and Glopper execution;
- useful onboarding completion state rather than a permanent tutorial overlay;
- restart-safe first-run state;
- in-product help and recovery paths;
- rewritten empty, unavailable, denied, failed, cancelled, and completed copy;
- plain-language setup for local specialist capabilities and optional connections.

### Copy requirement

Every user-facing sentence must answer at least one of:

- What is this?
- What can I do here?
- What will happen if I continue?
- What will **not** happen yet?
- What does this need from me?
- Where did this result come from?
- What can I safely do next?

### No jargon wall

Do not front-load schemas, hashes, Grants, Molds, or executor IDs. Preserve them in inspectable details and Master Control.

## Exit gate

Automated first-run acceptance proves:

```text
new browser context
→ understandable welcome
→ Local Box exists
→ blank or sample Production starts
→ user knows configuration does not execute
→ reload preserves progress
→ keyboard/touch/screen-reader journey remains usable
```

---

# Phase 3 — Build the canonical golden Production path

## Why

One complete, delightful, non-sensitive Production must demonstrate the whole system better than a collection of disconnected features.

## Canonical sample

Create a safe built-in sample called **Night Gummy Launch** or an equivalently brand-aligned neutral name. It must not require a private person’s likeness, external credentials, or rights-sensitive material.

Suggested deliverables:

- one 16:9 launch image;
- one short motion/shot plan derived from the accepted image;
- one simple 3D environment concept or scene package;
- one final Production package with evidence.

The sample exists in two truthful modes:

1. deterministic demonstration route available to every user;
2. connected real routes when ImageHoss, VideoBoss, or Meshmallow capabilities are present.

The UI must never confuse the two.

## Required journey

```text
Create/open Production
→ add specialist Actors
→ assign direction, locks, references, exploration, exclusions, acceptance
→ preview compiled packages
→ save isolated Production configurations
→ inspect plan, route, cost, locality, rights, and capability state
→ Make Production
→ freeze Run
→ Work Orders + Context Envelopes + Molds + Leases + Grants
→ execute eligible nodes
→ report blocked/unavailable optional nodes without corrupting the Run
→ receive candidates/assets/takes/packages
→ compare
→ Human accepts role-specific result
→ create downstream handoffs
→ Return + specialist Receipts + Gummy OS Receipts
→ close and return
```

## Runtime requirements

- a Run is immutable after freezing;
- retry/revision creates a new Run linked to the prior baseline;
- `keep everything except X` creates a delta revision with carry-forward locks;
- optional node failure does not falsely complete or corrupt unrelated nodes;
- required node failure yields a truthful terminal Production state;
- cancellation and restart recovery are visible;
- source Assets and prior accepted outputs remain immutable;
- each Production keeps isolated specialist configuration and Jobs.

## Exit gate

The complete golden path passes in a clean browser using deterministic routes and produces durable evidence. Connected routes are exercised separately when available.

---

# Phase 4 — Real ImageHoss integration

## Why first

ImageHoss has the most mature real execution path and defines the reusable specialist integration pattern.

## Required contract reconciliation and implementation

Do not stop after the mapping. Reconcile and implement:

### Production configuration

Preferred versioned records:

- `gummy.imagehoss-production-configuration/v1`
- `imagehoss.prompt-package/v1`
- versioned reference assignments and acceptance records

Map the founder contract onto current ImageHoss `Direction`, `ImageReference`, reference roles, `AcceptedAsset`, generated original/proxy package, V5-1 WorkOrder/Job/Receipt, `.hoss`, and `VideoBossHandoff` types.

Expand current reference roles as needed without breaking old imports. Preserve legacy R1-R5 records through explicit adapters/migrations.

### Deterministic configuration compiler

From frozen structured input, compile a visible provider-neutral package containing:

- visual direction summary;
- deliverable contract;
- absolute locks;
- creative direction and preferences;
- reference influence map with role, extraction, ignore list, strength, lock, rights, audience, and retention;
- exploration budget;
- positive and negative semantic direction;
- route/capability translation;
- dimensions, count, seed policy, cost, locality, privacy;
- acceptance contract;
- downstream requirements;
- unresolved risks and limitations.

Compilation performs no model call and creates no ImageHoss Job.

### Adapter behavior

Implement the shared specialist adapter contract:

```text
discover
validateConfiguration
compilePackage
execute
recover
cancel
inspectResult
```

For local ImageHoss:

- preserve authenticated loopback-only discovery;
- preserve project-root ownership outside browser choice;
- preserve bounded workflow allowlist;
- create one authorized ImageHoss Job only after Make Production;
- import original/proxy bytes and exact hashes;
- retain `.hoss` portability;
- retain specialist-native evidence;
- create linked result Gummies and Gummy OS Return/Receipt;
- support compare, role-specific acceptance, and VideoBoss handoff;
- exclude unapproved Actor context;
- keep two Production contexts isolated;
- recover after browser/bridge restart;
- cancel only the owned Job.

### Gummy OS files likely touched

- `src/core/production-runtime.js`
- `src/core/production-repository.js`
- `src/core/records.js`
- `src/apps/actor-surface.js`
- `src/apps/production.js`
- `src/integrations/app-handoff.js`
- new `src/integrations/imagehoss.js`
- server/API capability routing where required
- new schemas and fixtures
- runtime, schema, persistence, E2E, accessibility, and visual tests

### ImageHoss files likely touched

- `src/core/types.ts`
- `src/protocol/v1.ts` or a new compatible protocol module
- bridge capability/session endpoints
- workbench configuration/compare/accept surfaces
- `.hoss` manifest versioning and migrations
- tests and phase receipt

## Live gate

When the trusted ImageHoss bridge and supported ComfyUI runtime are available, run one real Job and prove `simulation: false`, exact original/proxy hashes, restart recovery, linked Receipts, and accepted handoff.

When unavailable, the release still includes the complete adapter, deterministic tests, capability discovery, truthful user guidance, and one-command live smoke. It must not claim real output on that environment.

## Exit gate

All 22 ImageHoss acceptance requirements in the preflight are implemented and automated; the earlier “proposal only” stop is retired.

---

# Phase 5 — Real VideoBoss integration

## Why

VideoBoss already has useful planning, routing, Cost Shield, review, continuity, and export behavior. The release task is to connect that complete relationship to Production and add a trusted real-render seam without flattening it into a video prompt box.

## Required implementation

### Versioned packages

Preferred records:

- `gummy.videoboss-production-configuration/v1`
- `videoboss.sequence-package/v1`
- `videoboss.shot-packet/v1`
- `videoboss.take/v1`
- `videoboss.take-acceptance/v1`

Preserve current Project/Asset/WorkOrder/Job/Receipt and ImageHoss handoff compatibility.

### Production-scoped surface

Expose:

- purpose, audience, duration, aspect, format, continuity locks;
- accepted ImageHoss Assets and protected/movable regions;
- sequence and editable shot packets;
- route/model options and Cost Shield;
- take count and variation budget;
- review dimensions and acceptance roles;
- delivery package and downstream handoff;
- deterministic compiled preview without render execution.

### Real render seam

Preserve the simulator for deterministic tests and demonstration. Add one trusted server-side provider adapter selected from repository/environment reality. Do not place provider keys in the browser.

The broker must support:

- capability discovery;
- request validation and idempotency;
- bounded submission;
- progress polling/webhook normalization;
- cancellation;
- timeout/ambiguous-call handling without unsafe retries;
- cost ceiling;
- result byte/hash import;
- provider/model disclosure;
- terminal Return and Receipt evidence.

If no live provider credential exists, finish the production adapter, broker contract, mock server tests, UI, and live-smoke command. Do not claim live video until the smoke succeeds.

### Review and revision

- compare takes on continuity, motion, camera, identity, prompt adherence, artifacts, cost, and downstream usefulness;
- Human accepts by shot/deliverable role;
- lessons stay Production/VideoBoss scoped unless an ActorUpdateProposal is explicitly approved;
- `keep everything except X` carries forward accepted shot/take locks;
- failed shot repair may create a typed ImageHoss handoff;
- spatial needs may create a typed Meshmallow handoff.

## Exit gate

The full plan → route → render/simulate → review → accept → deliver loop is integrated with Gummy OS. The live-render claim is made only when an actual provider smoke passes.

---

# Phase 6 — Real Meshmallow integration

## Public identity migration

Use **Meshmallow** in current user-facing copy and new contracts while preserving:

- repository `bohselecta/3d-bee`;
- `app:3d-bee`;
- `actor:3d-bee` unless a separately versioned alias is introduced;
- existing `3d-bee.*` protocol records;
- historical hashes, receipts, routes, and evidence.

Add aliases/migration metadata; do not destructively rewrite history.

## Required implementation

Preferred new records may use:

- `gummy.meshmallow-production-configuration/v1`
- `meshmallow.world-intent/v1`
- `meshmallow.scene-package/v1`
- `meshmallow.checkpoint/v1`
- `meshmallow.engine-handoff/v1`

Reconcile them with existing World Seed, Scene Plan, typed operation, plan digest, approval session, supervisor transport, Return, and export schemas.

### Production-scoped configuration

Expose:

- world intent and target use;
- dimensions/scale and coordinate assumptions;
- accepted source Assets and rights;
- scene plan and requested typed operations;
- allowed exploration and exact locks;
- Blender capability discovery;
- output formats and engine target;
- checkpoints, previews, validation, and acceptance contract;
- deterministic plan/package preview without Blender execution.

### Execution

Only Make Production may:

- freeze the scene plan;
- bind exact plan digest to Human approval;
- create Work Order, Context Envelope, Lease, and Grant;
- open a short-lived authenticated supervisor session;
- execute only reviewed named operations;
- produce checkpoints/previews;
- export supported editable/source packages;
- validate manifests, hashes, containment, and engine handoff;
- return specialist and Gummy OS evidence.

No arbitrary Python, shell, custom node execution, manufacturing claim, finished-game claim, or unrestricted filesystem access.

### Live gate

When a supported Blender runtime exists, complete one small scene proof and capture genuine `.blend` plus one interoperable export and validation evidence. When absent, retain mock mode, complete the adapter, prove fail-closed discovery, and provide the live-smoke command without claiming an artifact.

## Exit gate

Gummy OS can configure Meshmallow, truthfully discover it, execute a bounded approved plan when available, and preserve editable output/evidence without breaking legacy 3D Bee identity.

---

# Phase 7 — Finish Gummy Box setup, recovery, and optional connections

## Why

A user must not need to understand GitHub Apps, repository installation, environment variables, buckets, or deployment wiring to start Gummy OS.

## Required implementation

Detailed behavior is in `INFRASTRUCTURE_AND_GUMMY_BOX.md`.

At minimum:

- Local Box is created automatically and remains authoritative by default;
- first use requires no external account;
- import/export and a complete backup package work;
- destructive reset requires preview and explicit confirmation;
- state migration is idempotent and non-destructive;
- storage quota/failure paths are useful and truthful;
- optional GitHub/Drive/managed connections are introduced as mirrors or selected authorities only through explicit Human choice;
- normal onboarding never asks for a GitHub App, PEM, installation ID, or Vercel environment variable;
- connected scope is visible and revocable;
- sync conflicts preserve both versions and evidence rather than silently overwriting.

A managed Box may be implemented when deployment infrastructure and credentials are available. It does not block a strong local-first release candidate.

## Exit gate

A clean user can start locally, back up, restore, migrate, disconnect optional services, and retain Productions, Assets, Returns, and Receipts.

---

# Phase 8 — Release polish, accessibility, security, and performance

## Product polish

- finish all empty/loading/progress/error/denied/revoked/offline/cancelled/completed states;
- remove placeholder and development-only copy from normal user paths;
- preserve exact production brand assets and palette;
- verify Gummy/Glopper identity separation;
- ensure utility tiles remain operation mnemonics, not app identities;
- make desktop, laptop, tablet, and phone layouts intentionally usable;
- apply reduced-motion behavior;
- use one coherent microcopy voice;
- add a useful About/Capabilities/Limits surface.

## Accessibility

- complete keyboard operation;
- logical focus order and visible focus;
- no state by color alone;
- screen-reader-readable approvals, progress, Returns, and Receipts;
- accessible dialogs and cancellation;
- contrast validation for Night and Day;
- touch targets and zoom/reflow;
- no critical/serious axe violations without a documented founder exception.

## Security and reliability

- secret scanning and browser-bundle inspection;
- CSP and cross-origin local-bridge review;
- schema/size/rate/idempotency boundaries;
- source immutability and hash checks;
- authority-link validation;
- cancellation/recovery/timeout tests;
- duplicate delivery and stale lease handling;
- storage interruption and quota tests;
- dependency audit;
- no indefinite spinner without terminal state.

## Performance

Measure and set evidence-backed budgets for:

- initial application load;
- time to interactive on a normal laptop and phone viewport;
- large Production reopen;
- IndexedDB/OPFS hydration;
- memory growth during long sessions;
- asset/proxy loading;
- PWA/offline shell.

Optimize only measured bottlenecks. Do not replace the architecture for speculative performance.

## Optional wallpaper lane

A final wallpaper or Underground visual may be added only after functional and acceptance gates pass, using approved assets and without becoming a release blocker or reopening the UI architecture.

## Exit gate

The full acceptance matrix passes and all remaining limitations are visible in product and documentation.

---

# Phase 9 — Release candidate, PRs, deployment, and final Return

## Repository completion

For every touched repository:

- clean checkout verification;
- exact dependency install;
- all deterministic tests;
- production build;
- audit results;
- phase receipt/evidence;
- documentation synchronized with code;
- one final PR with exact head and dependency links.

Do not merge a repository that would leave Gummy OS referencing a non-existent contract. Prefer this dependency order:

```text
ImageHoss contract/runtime
→ VideoBoss contract/runtime
→ Meshmallow contract/runtime
→ Gummy OS integration
```

Independent specialist PRs may merge earlier only when backward compatible.

## Gummy OS release gate

- `npm run verify` passes;
- `npm run test:acceptance` passes against the exact production-like build;
- current preview/deployment reports the exact commit;
- critical journeys have no uncaught console errors;
- Night/Day and viewport evidence exists;
- source/result immutability is proven;
- authority, revocation, cancellation, recovery, and persistence are proven;
- Local Box first run and backup/restore are proven;
- deterministic golden Production passes;
- every live specialist claim has a matching live smoke;
- every unavailable external capability has a truthful user path;
- known limitations and rollback are documented.

## Final Return format

Codex returns one concise release report containing:

1. exact head and PR for every repository;
2. what changed by phase;
3. test commands and totals;
4. deployment/preview URLs;
5. screenshots/evidence locations;
6. live specialist results and exact external blockers;
7. migrations and rollback points;
8. remaining limitations;
9. whether each release gate is PASS, BLOCKED, or NOT CLAIMED;
10. the one founder decision, if any, that cannot be automated.

Do not return a manual regression checklist. Do not call the release founder-ready unless the evidence in `ACCEPTANCE_AND_RELEASE_MATRIX.md` is complete.
