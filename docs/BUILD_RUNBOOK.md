# Gummy OS Build Runbook

## Orientation

Read in this order:

1. `README.md`
2. `docs/BRAND_SYSTEM.md`
3. `docs/BRAND_ASSET_CATALOG.md`
4. `docs/GLOPPER_NAMING.md`
5. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
6. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
7. `docs/GUMMY_BOX_WORK_ORDERS.md`
8. `docs/VOCABULARY.md`
9. `docs/PRODUCT_SPEC.md`
10. `docs/ARCHITECTURE.md`
11. `docs/PROTOCOL.md`
12. `docs/SECURITY_MODEL.md`
13. `docs/SOCIAL_LAYER.md`
14. `docs/ROADMAP.md`
15. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
16. `plans/active/2026-07-25-gummy-box-cursor-addendum.md`
17. `plans/active/2026-07-25-brand-system-cursor-addendum.md`
18. `plans/active/2026-07-25-production-brand-assets-cursor-addendum.md`
19. `AGENTS.md`

The active repository is `bohselecta/gummy-os`.

Do not inspect the existing native AI Linux distribution until the standalone browser proof is accepted.

## Baseline

```bash
npm run verify
npm run dev
```

Open `http://localhost:4173` and confirm:

1. Gummy OS boots.
2. Current desktop/dock/windows work before migration.
3. Native `gummy://` routes work.
4. Files drag to the current companion surface.
5. Medium-risk actions ask for confirmation.
6. Demo chat is labeled non-networked.
7. Receipts appear.
8. State survives refresh.

Record starting SHA, localStorage keys, current labels, literal colors, and failures.

## Active gates

### Gate 1 — Locked source and semantic tokens

- create one source-token module with the five exact brand values;
- create semantic tokens for Canvas, surfaces, text, location, energy, action, focus, border, and shadow;
- remove scattered production color literals where practical;
- derived branded colors use only opacity/mixes between the five anchors.

### Gate 2 — Night Gummy and Day Gummy

- implement exactly two canonical expressions;
- persist selection;
- optional device-follow resolves only to Night or Day;
- invalid values fail safely;
- no accent picker, theme marketplace, or per-window hue customization;
- prove both modes are recognizably one product.

### Gate 3 — Gummy Canvas and Gummy Bar

- name the working surface Gummy Canvas;
- replace dock presentation with candy-store Gummy Bar;
- candy icons may represent apps, Actors, Gummies, Bowls, Work Orders, tasks, notifications, controls, and Glopper;
- purple establishes location/grouping;
- gold establishes selection/action/attention;
- candy remains presentation, not protocol;
- prove keyboard, touch, responsive, reduced-motion, and accessibility behavior.

### Gate 4 — Gummy and Glopper emphasis

- Gummy guide surfaces are purple-dominant with gold accents;
- Glopper surfaces are gold-dominant with purple accents;
- each is identified by name/avatar/accessibility label, not color alone;
- actual Agent executor remains explicit;
- no mascot recoloring.

### Gate 5 — Glopper Panel

- Glopper is a special candy in the Gummy Bar;
- collapsed status/invocation state;
- expandable conversation/control Panel;
- selected Canvas context;
- Human/Actor/Agent/Mold/Master Control state;
- Glopper Inbox, Task Lease, approvals, results, Returns, and Receipts;
- availability never becomes automatic authority.

### Gate 6 — Correct typed model

Human, Actor, Agent, Mold, Master Control, Gummy Box, Work Order, Task Lease, Return, Gummy, Bowl, Link, Grab, Grant, Receipt, and quarantine are distinct.

The first executor is `agent:glopper-web`.

### Gate 7 — Deterministic migration

Legacy Snack/Drop/Fork/Z/Zeke/companion/dock/theme state migrates without loss, duplication, type collapse, or unsupported palette values.

### Gate 8 — Durable local WebOS and Local Gummy Box

IndexedDB metadata, OPFS bytes, stable IDs/hashes, Actor-owned projects, import/export, Local Gummy Box, quota handling, return continuity, and quarantine.

### Gate 9 — Glopper Inbox and Work Orders

- validate Work Orders as untrusted data;
- show issuer, target, scope, privacy, locality, risk, expiry, and acceptance checks;
- support approve/revise/reject/hold;
- claim exclusive Task Lease;
- reject conflicting claims;
- preserve Local-only operation.

### Gate 10 — Real Glopper Agent route

One provider-neutral route, no browser secrets, bounded capabilities, explicit locality/cost, truthful error/denial, complete Return and Receipt evidence.

### Gate 11 — Real source-to-result journey

Work Order/source Gummy → Human approval → `agent:glopper-web` + Mold + Task Lease + Grant → result Gummy → Return + Receipt → revocation → durable return.

### Gate 12 — Quarantine and burn proof

Harmless test content remains non-native, promotion is deny-by-default, bounded approved movement is receipted, disposable state burns while accepted evidence remains.

### Gate 13 — One external Gummy Box adapter

After Local Box works, complete exactly one scoped external adapter: private GitHub or Google Drive. Do not require whole-account access or block standalone acceptance on both providers.

### Gate 14 — Adaptation foundation

Private local memory, approved portable profile, and current task context remain separate. Human approval is required to promote learned preferences.

### Gate 15 — Composition proof

Two local test Actors create a temporary shared Canvas or Bowl from selected Gummies without merging private state or inheriting authority.

### Gate 16 — Native preflight, last

After Gates 1–15 pass, locate and inspect the existing distro, evaluate the existing Glopper process-director app as native lineage, and design one deny-by-default `agent:glopper-native` bridge. No broad native implementation without a new work order.

## Brand verification matrix

Return evidence for:

- Night Gummy Canvas and Bar;
- Day Gummy Canvas and Bar;
- Gummy purple-dominant guide surface;
- Glopper gold-dominant action surface;
- theme selector;
- exact source tokens;
- unsupported-theme rejection;
- keyboard focus;
- awaiting-approval state;
- quarantined/blocked state without new brand hue;
- phone-width layout;
- reduced-motion behavior;
- placeholder/final asset inventory.

## Verification

```bash
npm run brand:generate
npm run check
npm test
npm run build
npm run verify
```

Add:

- production master hash, derivative dimension, favicon/PWA, and placeholder-removal checks;
- source/semantic brand-token tests;
- Night/Day persistence and fallback tests;
- unsupported-theme rejection;
- Gummy/Glopper emphasis tests;
- literal-color audit;
- end-to-end Gummy Canvas/Bar/Glopper journey;
- Gummy Box and Work Order tests;
- naming and migration test;
- revocation test;
- quarantine/promotion/burn test;
- Task Lease conflict test;
- accessibility checks;
- composition test;
- native integration test only after Gate 16 begins.

## Git workflow

1. inspect exact `main`;
2. run baseline verification;
3. create one bounded branch;
4. implement the active work order and addenda;
5. run applicable verification;
6. record screenshots, token maps, hashes, Grants, Returns, Receipts, and boundaries;
7. commit and push;
8. open one PR with proven/unproven claims;
9. do not self-accept;
10. merge only after founder acceptance or explicit authorization.

Do not ask Hayden to perform ordinary branch, PR, merge, or cleanup work when connected tools can do it.

## Stop rules

Stop and return an exact blocker when:

- credentials cannot stay outside browser JavaScript;
- storage cannot preserve bytes/metadata reliably;
- migration would discard or ambiguously merge state;
- Actor and Agent would collapse;
- source Gummy would be overwritten;
- a candy icon, mascot, or Work Order would become authority;
- a new branded hue appears necessary instead of icon/language/shape;
- accessible contrast cannot be achieved within the locked palette without restructuring the component;
- final mascot/wordmark assets are required but unavailable;
- Day and Night begin behaving like separate products;
- purple stops communicating place or gold stops communicating action;
- quarantine cannot remain separated from native execution;
- a child Actor/Agent would inherit authority;
- a Receipt cannot name Human, Actor, Agent, Mold, Master Control, Task Lease, route, source, result, and outcome;
- security claims exceed evidence;
- native-distro work begins before the standalone proof passes;
- broad platform, provider, or theme scope starts before the accepted exit.
