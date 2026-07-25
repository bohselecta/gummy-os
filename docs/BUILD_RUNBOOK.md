# Gummy OS Build Runbook

## Orientation

Read in this order:

1. `README.md`
2. `docs/GLOPPER_NAMING.md`
3. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
4. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
5. `docs/VOCABULARY.md`
6. `docs/PRODUCT_SPEC.md`
7. `docs/ARCHITECTURE.md`
8. `docs/PROTOCOL.md`
9. `docs/SECURITY_MODEL.md`
10. `docs/SOCIAL_LAYER.md`
11. `docs/ROADMAP.md`
12. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
13. `AGENTS.md`

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

Record starting SHA, localStorage keys, current labels, and failures.

## Active gates

### Gate 1 — Gummy Canvas and Gummy Bar

- name the working surface Gummy Canvas;
- replace dock presentation with candy-store Gummy Bar;
- candy icons may represent apps, Actors, Gummies, Bowls, tasks, notifications, controls, and Glopper;
- candy remains presentation, not protocol;
- prove keyboard, touch, responsive, and accessibility behavior.

### Gate 2 — Glopper Panel

- Glopper is a special candy in the Gummy Bar;
- collapsed status/invocation state;
- expandable conversation/control Panel;
- selected Canvas context;
- Human/Actor/Agent/Mold/Master Control state;
- task lease, approvals, results, and Receipts;
- availability never becomes automatic authority.

### Gate 3 — Correct typed model

Human, Actor, Agent, Mold, Master Control, Gummy, Bowl, Link, Grab, Grant, Receipt, quarantine, and task lease are distinct.

The first executor is `agent:glopper-web`.

### Gate 4 — Deterministic migration

Legacy Snack/Drop/Fork/Z/Zeke/companion/dock state migrates without loss, duplication, or type collapse.

### Gate 5 — Durable local WebOS

IndexedDB metadata, OPFS bytes, stable IDs/hashes, Actor-owned projects, import/export, quota handling, return continuity, and quarantine.

### Gate 6 — Real Glopper Agent route

One provider-neutral route, no browser secrets, bounded capabilities, explicit locality/cost, truthful error/denial, complete Receipt evidence.

### Gate 7 — Real source-to-result journey

Source Gummy → Human approval → `agent:glopper-web` + Mold + Grant → result Gummy → complete Receipt → revocation → durable return.

### Gate 8 — Quarantine and burn proof

Harmless test content remains non-native, promotion is deny-by-default, bounded approved movement is receipted, disposable state burns while accepted evidence remains.

### Gate 9 — Adaptation foundation

Private local memory, approved portable profile, and current task context remain separate. Human approval is required to promote learned preferences.

### Gate 10 — Composition proof

Two local test Actors create a temporary shared Canvas or Bowl from selected Gummies without merging private state or inheriting authority.

### Gate 11 — Native preflight, last

After Gates 1–10 pass, locate and inspect the existing distro, evaluate the existing Glopper process-director app as native lineage, and design one deny-by-default `agent:glopper-native` bridge. No broad native implementation without a new work order.

## Verification

```bash
npm run check
npm test
npm run build
npm run verify
```

Add:

- end-to-end Gummy Canvas/Bar/Glopper journey;
- naming and migration test;
- revocation test;
- quarantine/promotion/burn test;
- task lease test;
- composition test;
- native integration test only after Gate 11 begins.

## Git workflow

1. inspect exact `main`;
2. run baseline verification;
3. create one bounded branch;
4. implement the active work order;
5. run applicable verification;
6. record screenshots, hashes, Grants, Receipts, and boundaries;
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
- a candy icon would become authority;
- quarantine cannot remain separated from native execution;
- a child Actor/Agent would inherit authority;
- a Receipt cannot name Human, Actor, Agent, Mold, Master Control, route, source, result, and outcome;
- security claims exceed evidence;
- native-distro work begins before the standalone proof passes;
- broad platform scope starts before the accepted exit.
