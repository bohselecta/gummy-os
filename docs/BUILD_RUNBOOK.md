# Gummy OS Build Runbook

## Orientation

Read in this order before implementation:

1. `README.md`
2. `docs/VOCABULARY.md`
3. `docs/VISION.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PROTOCOL.md`
7. `docs/SECURITY_MODEL.md`
8. `docs/SOCIAL_GRAPH.md`
9. `docs/ROADMAP.md`
10. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
11. `AGENTS.md`

Do not inspect or import older repositories merely because they also use the Gummy name. The only active implementation repository is `bohselecta/gummy-os`.

## Baseline verification

```bash
npm run verify
npm run dev
```

Open `http://localhost:4173` and confirm the Protocol 0.1 scaffold still boots before migration:

1. Gummy OS opens into the browser-native desktop.
2. Desktop and dock icons open applications.
3. Windows move, resize, minimize, maximize, and close.
4. `gummy://home`, `gummy://chat`, and `gummy://protocol` work.
5. Files drag to the companion.
6. Medium-risk attachment asks for confirmation.
7. Demo chat returns a transparent non-networked response and Receipt.
8. Existing local state survives refresh.

Record the starting commit and baseline result before changing code.

## Active build sequence

### Gate 1 — Protocol 0.2 migration

Implement the accepted vocabulary:

```text
Actor
Mold
Gummy
Bowl
Link
Grab
```

Required behavior:

- `snack:*` becomes one Actor and at least one Mold;
- `drop:*` becomes a Gummy;
- Bowl identity is preserved;
- explicit relationship data becomes Links;
- Fork state becomes a Grab record and `grab-of` Link;
- migration is deterministic and idempotent;
- legacy state stays readable until parity is verified;
- new writes use Protocol 0.2;
- Actor is the authority principal;
- Mold is representation and verification only;
- current UI labels stop teaching Snack, Drop, or Fork as canon.

### Gate 2 — Durable local Gummy storage

Implement:

- IndexedDB metadata;
- OPFS file and artifact bytes;
- stable Gummy IDs;
- source and result hashes;
- project/folder membership;
- import and export;
- reload and browser-return recovery;
- migration from current `localStorage` without silent loss.

The browser must never expose an arbitrary host-filesystem authority surface.

### Gate 3 — One trusted model broker

Implement one provider-neutral broker contract:

- broker URL comes from trusted configuration;
- provider secrets never enter the browser bundle;
- request includes Actor, Mold, source Gummy, task, requested capabilities, privacy/locality preference, and output contract;
- response includes terminal status, result bytes or result reference, model route, cost, and evidence;
- failure and denial are explicit;
- no second production provider is required for this gate.

### Gate 4 — Real file-to-agent-to-Gummy loop

Acceptance journey:

1. Import a real text or Markdown file as a Gummy.
2. Drag it to the companion.
3. Ask for a bounded transformation.
4. Display a clear Grant request for source read and result create.
5. Run one real model route.
6. Preserve the source unchanged.
7. Create a result Gummy with identity, hash, provenance, and `created-by` / `derived-from` Links.
8. Create an Action Receipt identifying Actor, Mold, route, Grant, source, result, locality, cost, time, and outcome.
9. Close and return.
10. Confirm source, result, project, and Receipt remain understandable and usable.

### Gate 5 — Shell and PWA finish

After the core loop passes:

- installable PWA manifest and service worker;
- truthful offline behavior;
- polished first-run and full-screen entry;
- accessibility pass;
- responsive desktop and mobile-browser behavior;
- no social or enterprise expansion during this gate.

## Verification commands

The final lane must expose and pass:

```bash
npm run check
npm test
npm run build
npm run verify
```

Add focused tests for:

- Protocol 0.1 → 0.2 migration;
- migration idempotence;
- Actor/Mold authority separation;
- Gummy byte persistence;
- source immutability;
- result hashing;
- Grant denial;
- broker failure;
- successful result Receipt;
- return continuity.

## Git workflow

The Cursor lane owns ordinary repository hygiene:

1. inspect `main` and exact head;
2. run baseline verification;
3. create one bounded branch;
4. implement the complete active work order;
5. run verification;
6. record screenshots and evidence;
7. commit and push;
8. open one PR with exact proven and unproven boundaries;
9. do not self-accept the Return;
10. merge only after founder acceptance or explicit authorization.

Do not ask Hayden to manually perform ordinary branch, PR, merge, or cleanup work when connected tools can do it.

## Architecture change rule

Any implementation change introducing a new object type, Link type, capability, trust boundary, runtime, model route, connector path, enterprise policy, or federation behavior must update `docs/ARCHITECTURE.md`, `docs/PROTOCOL.md`, and `docs/SECURITY_MODEL.md` in the same lane.

## Stop rules

Stop and return an exact blocker rather than improvising when:

- the broker cannot protect credentials;
- OPFS/IndexedDB semantics cannot preserve bytes and metadata reliably;
- migration would discard or ambiguously merge legacy state;
- the source Gummy would be overwritten;
- a model or application receives broader authority than the displayed Grant;
- the Receipt cannot truthfully identify the route, source, result, and outcome;
- the build starts expanding the Social Layer, Enterprise Habitat, federation, or broad runtime matrix before the Personal Gummy OS exit passes.
