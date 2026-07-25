# Gummy OS

> **A computer you can open.**

Gummy OS is a browser-delivered personal AI computer. It gives people the familiar shell they already understand—desktop, windows, folders, files, applications, a dock, drag-and-drop, and a browser inside the browser—while adding the boundaries an AI-operated computer requires: replaceable intelligence, scoped authority, isolated runtimes, Application Packs, and Action Receipts.

The canonical personal address is **mygum.my**. Personal Gummy OS is intended to remain useful and free without requiring a social account, enterprise organization, or one model provider.

## Current priority: make the computer real

The active product lane is **Personal Gummy OS**.

The first dependable proof is:

```text
open Gummy OS
→ import a real file
→ drag it to the companion
→ ask a real model to transform it
→ approve bounded read + create authority
→ receive a new Gummy
→ inspect the Action Receipt
→ close and return later
→ the source, result, project, and Receipt are still there
```

Social, enterprise, federation, marketplace, and broad runtime work remain specified but must not delay this file-to-agent-to-artifact loop.

## Canonical object language

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

### Actor

The accountable acting principal: a person, AI agent, organization, service, application, or licensed character. Capability Grants and Action Receipts identify the Actor—not merely a display name or visual profile.

### Mold

The portable representation and verification profile through which an Actor appears inside Gummy OS. A Mold may carry a handle, public presentation, visual form, disclosure, identity proofs, keys, and compatibility information. A Mold never becomes authority merely because it looks official.

### Gummy

Anything an Actor creates, keeps, receives, shares, or operates inside Gummy OS: a note, file, image, project, conversation, application, workflow, invitation, or generated result. Every Gummy can carry ownership, audience, provenance, rights, history, and capabilities.

### Bowl

A shared environment with explicit members, roles, visibility, and rules. A Bowl may contain Actors, Molds, Gummies, conversations, projects, and Links.

### Link

An intentional, inspectable relationship such as follows, belongs-to, created-by, collaborates-with, delegates-to, trusts-for, shared-with, or derived-from.

### Grab

The user-facing action that creates an independent Gummy from an existing Gummy while preserving cryptographic provenance and a `grab-of` lineage Link. A Grab never changes the source.

## Protocol migration boundary

The current July 24 scaffold still contains Protocol 0.1 implementation labels such as **Snack**, **Drop**, **Fork**, **Snack Bar**, and **Snack Graph**. Those names are now legacy compatibility vocabulary.

The accepted Protocol 0.2 target is:

| Protocol 0.1 | Protocol 0.2 target |
| --- | --- |
| Snack | Actor + Mold |
| Drop / generic graph object | Gummy |
| Snack Graph | Gummy OS Social Layer |
| Fork | Grab |
| fork-of | grab-of |

Cursor must migrate state and UI deterministically rather than deleting old local data or pretending implementation already matches the new specification.

## Run the current scaffold

Requirements: Node.js 22 or newer.

```bash
npm run dev
```

Open `http://localhost:4173`.

```bash
npm run check
npm test
npm run build
npm run verify
```

The scaffold uses browser-native JavaScript and Node's standard library so the shell stays fast, inspectable, and easy to fork into compatible editions.

## What works now

- Web-native desktop with draggable, resizable, minimizable, and maximizable windows.
- Gummy Browser with `gummy://home`, `gummy://chat`, `gummy://protocol`, sandboxed external frames, and external-tab fallback.
- My Files with drag-to-companion delegation.
- Provider-neutral demo chat and scoped capability requests.
- Legacy Protocol 0.1 social and enterprise proof surfaces.
- Persistent shell state through `localStorage`.
- Protocol schemas, deterministic tests, build, and validation.

The scaffold does **not** yet ship a real model broker, durable OPFS file bytes, generated artifact writes, production authentication, encrypted sync, cryptographic signing, multi-tenant backend, BrowserPod, Wasm/Linux capsules, or a production policy engine.

## Product map

```text
Gummy OS
├── Shell          desktop, windows, dock, browser, files, companion
├── Actor          the accountable principal that acts
├── Mold           portable representation and verification for an Actor
├── Gummy          files, projects, conversations, apps, workflows, results
├── Bowl           shared environments for Actors and Gummies
├── Link           explicit relationships, authority, ownership, and lineage
├── Grab           independent derivation without altering the source
├── Pack           vendor-authored application knowledge and authority contract
├── Broker         model, connector, and task-scoped capability routing
├── Capsule        web, Wasm, Linux, or governed cloud execution
├── Receipt        evidence of request, authority, changes, and outcome
├── Organization   enterprise identity, roles, policies, registries, runtimes
└── Federation     portable signed objects and compatible Gummy OS editions
```

## The central product insight

Traditional AI integration asks:

> How do we connect this model to this application?

Gummy OS asks:

> How do we place the application inside a governed computer the agent already knows how to use?

A software vendor can eventually ship an Application Pack containing typed capabilities, operating documentation, semantic interface maps, workflow recipes, policy defaults, verification tests, and recovery instructions. Gummy OS supplies the habitat in which an authorized Actor may operate it.

## Founding rules

1. The shell is web-native.
2. The visible grammar stays familiar.
3. Intelligence is provider-neutral.
4. Actors receive no ambient authority.
5. Consequential work leaves evidence.
6. The host computer remains outside Gummy OS.
7. Social computing is consent-first.
8. A Mold's appearance is not authentication.
9. Compatibility is routed through explicit adapters.
10. Personal utility remains free.
11. Grabs preserve provenance without altering sources.
12. Delight is functional.

## Read order

1. `docs/VOCABULARY.md`
2. `docs/VISION.md`
3. `docs/PRODUCT_SPEC.md`
4. `docs/ARCHITECTURE.md`
5. `docs/PROTOCOL.md`
6. `docs/SECURITY_MODEL.md`
7. `docs/SOCIAL_GRAPH.md`
8. `docs/ENTERPRISE_FRAMEWORK.md`
9. `docs/ROADMAP.md`
10. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
11. `docs/BUILD_RUNBOOK.md`

## Status

This repository is the **new July 24, 2026 Gummy OS**. Older repositories that reused the Gummy name are historical name collisions and are not implementation donors unless a future work order names an exact file and reason.

The current scaffold is runnable. The accepted specification now targets Protocol 0.2 vocabulary and a dependable Personal Gummy OS loop.

> **Open Gummy OS. Your computer is already there.**
