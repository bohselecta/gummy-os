# Personal Gummy OS — Cursor Production Work Order

**Date:** 2026-07-25  
**Repository:** `bohselecta/gummy-os`  
**Authority:** Hayden's accepted direction in the Chief of Command thread  
**Active lane:** Personal Gummy OS  
**Target:** one dependable computer-within-a-computer loop

## Mission

Finish the new July 24, 2026 Gummy OS—not any older repository that reused the Gummy name.

The product starts as a browser-delivered computer. Once this shell works, it may open `glyphd.com`, Glyphd Desktop, or other applications through the correct web-native, installed, or runtime route. Those integrations do not block this work order.

## Read before changing code

1. `README.md`
2. `docs/VOCABULARY.md`
3. `docs/PRODUCT_SPEC.md`
4. `docs/ARCHITECTURE.md`
5. `docs/PROTOCOL.md`
6. `docs/SECURITY_MODEL.md`
7. `docs/ROADMAP.md`
8. `docs/BUILD_RUNBOOK.md`
9. `AGENTS.md`
10. current source and tests

## Canonical language

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

Do not reintroduce Snack, Drop, Fork, Snack Bar, or Snack Graph as current product language. They are Protocol 0.1 migration inputs only.

## Absolute exclusions

Do not:

- inspect or import the old `gummy`, `gummy2`, `mygummy`, or `my-gummy` repositories;
- redesign the shell before proving the core loop;
- expand remote social accounts, public discovery, federation, marketplace, enterprise administration, BrowserPod, CheerpX, Linux capsules, or multiple model providers;
- make Glyphd Desktop, `glyphd.com`, Zeke, or another product a dependency;
- expose provider credentials to browser JavaScript;
- provide arbitrary host filesystem or shell authority;
- overwrite the source Gummy;
- let a Mold become an authority principal;
- call the work complete because a UI demonstration looks finished.

## Baseline

Before implementation:

1. record exact `main` SHA;
2. run `npm run verify`;
3. run the current app;
4. capture the existing shell and Protocol 0.1 behavior;
5. list all current localStorage keys and serialized state shapes;
6. identify every Snack, Drop, Fork, Snack Graph, and Snack Bar reference in code, tests, docs, schemas, and examples.

## Work package A — Protocol 0.2 migration

Implement a deterministic, idempotent migration:

```text
snack:hayden
→ actor:hayden
→ mold:hayden:default

drop:welcome
→ gummy:welcome

fork-of
→ grab record
→ grab-of Link
```

Requirements:

- Actor receives authority, ownership, delegation, and Receipt identity.
- Mold receives handle, visual presentation, public/private profile fields, proofs, keys, and disclosure.
- Existing Bowl identity and membership are preserved.
- Existing relationship objects become Links.
- Existing source lineage remains inspectable.
- Legacy state remains readable until migration parity is verified.
- Re-running migration produces no duplicates or drift.
- New state writes Protocol 0.2 only.
- UI copy uses Actor, Mold, Gummy, Bowl, Link, and Grab.
- The app may retain explicit `legacyIds` for traceability.

## Work package B — durable local computer

Replace metadata-only/localStorage proof state with a clear local-first persistence boundary:

- IndexedDB for structured metadata and indexes;
- OPFS for real source and result bytes;
- stable Actor, Mold, Gummy, Link, Grant, and Receipt IDs;
- Gummy import and export;
- project/folder membership;
- content hashing;
- versioned migrations;
- reload, browser restart, and return recovery;
- bounded storage errors and quota handling.

Do not expose OPFS as if it were arbitrary host filesystem access.

## Work package C — trusted model broker

Implement one provider-neutral broker contract.

Browser request includes:

- acting Actor ID;
- sponsoring Actor ID if different;
- Mold ID;
- source Gummy ID and bounded content;
- task instruction;
- requested capabilities;
- privacy/locality preference;
- output media type and destination contract;
- cost ceiling.

Broker response includes:

- terminal status;
- model/provider class;
- runtime/locality;
- result bytes or explicit result reference;
- usage and cost;
- failure/denial detail;
- evidence suitable for a Receipt.

Only one real provider route is required. Preserve the demo adapter as an explicitly labeled offline fallback, not as fake proof.

## Work package D — real file-to-agent-to-Gummy loop

Build this exact journey:

1. Open Gummy OS.
2. Import a real text or Markdown file.
3. Store actual bytes as a source Gummy.
4. Drag the Gummy to the companion.
5. Ask: “Turn this into a concise project brief. Preserve the original and create a new file.”
6. Show an explicit Grant request for source read and result create.
7. Allow approval or denial.
8. On approval, call the real broker.
9. Preserve the source unchanged.
10. Write a result Gummy with stable identity, bytes, hash, provenance, and Links.
11. Write an Action Receipt naming Actor, Mold, broker route, Grant, source, result, locality, cost, time, and outcome.
12. Open the result.
13. Close Gummy OS and return.
14. Confirm the source, result, project, Links, and Receipt remain present and understandable.

Denial, provider failure, malformed response, cancellation, storage failure, and quota failure must produce truthful terminal states.

## Work package E — shell finish

Only after work package D passes:

- installable PWA;
- truthful offline shell behavior;
- polished full-screen onboarding;
- accessibility and keyboard operation;
- desktop and mobile-browser responsive pass;
- clear local/cloud/model/cost indicators;
- no unnecessary redesign of the familiar desktop grammar.

## Required tests

At minimum:

- Protocol 0.1 migration;
- migration idempotence;
- Actor/Mold separation;
- legacy ID traceability;
- source byte persistence;
- result byte persistence;
- source immutability;
- deterministic hashes;
- Grant approval;
- Grant denial;
- broker success;
- broker failure;
- malformed broker response;
- result Link creation;
- Receipt creation for success, denial, and failure;
- reload and return continuity;
- current shell/window/browser behavior regression.

## Acceptance command

```bash
npm run verify
```

Add any additional end-to-end command required to prove the real browser journey.

## Required Return

```text
Repository
Branch
Base SHA
Head SHA
Files changed
Migration behavior
Storage boundary
Broker boundary
Provider used
Commands run
Tests passed
Tests failed
Tests not run
Screenshots/artifacts
Exact source Gummy hash
Exact result Gummy hash
Example Grant
Example Receipt
Known limitations
What is proven
What is not proven
Recommended next action
```

Do not self-accept the Return.

## Definition of done

Gummy OS is working when a real file becomes a real result Gummy through a real bounded model task, the source remains unchanged, the Action Receipt tells the truth, and the whole state survives return visits.

After that proof, the next planning conversation may decide whether to open `glyphd.com`, package a Glyphd application, integrate Zeke, or activate the Social Layer. None of those decisions are required now.
