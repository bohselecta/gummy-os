# Gummy OS Build Runbook

## Orientation

Read in this order:

1. `README.md`
2. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
3. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
4. `docs/VOCABULARY.md`
5. `docs/PRODUCT_SPEC.md`
6. `docs/ARCHITECTURE.md`
7. `docs/PROTOCOL.md`
8. `docs/SECURITY_MODEL.md`
9. `docs/SOCIAL_LAYER.md`
10. `docs/ROADMAP.md`
11. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
12. `AGENTS.md`

The active Gummy OS repository is `bohselecta/gummy-os`.

The AI-native Linux distribution is a separate existing local implementation. Inspect it in Ubuntu. Do not rebuild it from assumptions in this repository.

## Baseline verification

```bash
npm run verify
npm run dev
```

Open `http://localhost:4173` and confirm:

1. Gummy OS boots.
2. Desktop, dock, and windows work.
3. `gummy://home`, `gummy://chat`, and `gummy://protocol` work.
4. Files drag to the current companion surface.
5. Medium-risk attachment asks for confirmation.
6. Demo chat is transparently non-networked.
7. Receipts appear.
8. Existing state survives refresh.

Record the starting SHA and all baseline failures.

## Ubuntu native preflight

Before changing integration code:

1. locate the existing native distribution source and runtime;
2. record local path, launch command, branch/revision, and build state;
3. identify native Agent/chat services;
4. identify browser or WebView host;
5. identify existing IPC/API/MCP/localhost surfaces;
6. inspect current capability and security boundaries;
7. locate live-USB assets;
8. launch the native system and prove its current behavior;
9. choose the narrowest Gummy OS hosting route;
10. stop rather than replacing a working native component speculatively.

## Active gates

The detailed requirements live in the active work order. The implementation order is:

### Gate 0 — Existing native environment understood

The distro and native Agent/chat behavior are found, launched, and documented.

### Gate 1 — Gummy OS runs inside the distro

Use ordinary browser or existing WebView first. Preserve standalone browser use.

### Gate 2 — Z hybrid surface

Implement persistent collapsed Z bar and expandable Z panel. Z is globally available across the canvas, not an ordinary dock app.

```text
automatic availability != automatic authority
```

### Gate 3 — Correct Human / Actor / Agent / Mold / Master Control model

Actor and Agent remain distinct. Mold is an operating contract. Master Control owns placement, sync, assignment, approval, and revocation.

### Gate 4 — Deterministic migration

Legacy Snack/Drop/Fork/companion state migrates without deletion, duplication, or type collapse.

### Gate 5 — Durable local WebOS

IndexedDB metadata, OPFS bytes, stable IDs and hashes, projects, import/export, return continuity, and quarantine state.

### Gate 6 — Quarantine and burn proof

A harmless test file enters as a quarantined Gummy, lacks native authority, cannot promote without approval, and can be reset/burned while accepted evidence remains.

### Gate 7 — One deny-by-default Agent/native bridge

Only the exact bounded contract required by the active journey. No arbitrary shell, filesystem, process, package, device, or network endpoint.

### Gate 8 — Real Actor-to-Agent journey

Source Gummy → Human approval → Mold + Grant → distinct Agent → result Gummy → complete Receipt → revocation → durable return.

### Gate 9 — Small playground composition proof

Two local Actor surfaces create one temporary shared canvas or Bowl using selected test Gummies without merging private state or inheriting authority.

## Verification commands

```bash
npm run check
npm test
npm run build
npm run verify
```

Add:

- one end-to-end WebOS journey command;
- one native integration command when the bridge exists;
- one quarantine/promotion/burn test;
- one revocation test;
- one temporary Actor-composition test.

## Git workflow

1. inspect exact `main`;
2. run baseline verification;
3. create one bounded branch;
4. implement the active work order;
5. run all applicable verification;
6. record screenshots, hashes, Receipts, and native-boundary evidence;
7. commit and push;
8. open one PR with proven and unproven claims;
9. do not self-accept;
10. merge only after founder acceptance or explicit authorization.

Do not ask Hayden to perform ordinary branch, PR, merge, or cleanup work when connected tools can do it.

## Architecture change rule

Any change introducing an object, Link, capability, bridge, trust boundary, runtime, model route, connector path, synchronization behavior, security claim, composition primitive, enterprise policy, or federation behavior must update the relevant authoritative documents in the same lane.

## Stop rules

Stop and return an exact blocker when:

- the native distribution cannot be found or launched;
- working native code would be replaced without evidence;
- credentials cannot stay outside browser JavaScript;
- IndexedDB/OPFS cannot preserve bytes and metadata reliably;
- migration would discard or ambiguously merge state;
- Actor and Agent would collapse;
- the source Gummy would be overwritten;
- the bridge would expose broad native authority;
- quarantine cannot prevent native execution;
- a child Actor or Agent would inherit authority automatically;
- a Receipt cannot identify the Human, Actor, Agent, Mold, Master Control, route, source, result, and boundary crossing;
- security claims exceed test evidence;
- broad platform scope starts before the Personal Gummy OS exit passes.
