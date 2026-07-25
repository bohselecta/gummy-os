# Gummy OS

> **A computer you can open.**

Gummy OS is the browser-delivered Web OS where persistent, addressable **Actors** can be opened, operated, and connected to native **Agents** under human-controlled **Master Control**.

It preserves the familiar computer—desktop, windows, folders, files, applications, dock, drag-and-drop, and browser-inside-browser—while adding provider-neutral intelligence, scoped authority, explicit synchronization, permissioned Molds, isolated runtimes, and Action Receipts.

The canonical personal address is **mygum.my**.

## The architecture in one view

```text
Human authority
      │
      ▼
Master Control
where state lives · what syncs · who may operate · how access is revoked
      │
      ├──────── protocol / @address ────────┐
      │                                      │
      ▼                                      ▼
Actor in Gummy OS                       Agent in Glyphd OS
web-openable                            native executable intelligence
persistent identity/state              tools, compute, devices, models
```

The Actor and Agent may work as one experience, but they are not the same object.

## Corrected canonical language

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
Gummy OS = Web OS where Actors are opened and deployed
Glyphd OS = native AI execution and device-sovereignty environment
@address = stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how protocol objects relate
Grab = independent derivation without altering the source
```

Read [`docs/ACTOR_AGENT_MASTER_CONTROL.md`](docs/ACTOR_AGENT_MASTER_CONTROL.md) before implementing identity, synchronization, or runtime behavior.

## Actor

An Actor is a persistent computational presence with a stable `@address`. It may embody a person, celebrity, character, organization, service, project role, or world. A Human may open it directly; an authorized Agent may operate it; Master Control determines location and synchronization.

## Agent

An Agent is executable intelligence. It may run locally in Glyphd OS or another governed runtime, use tools, control explicitly granted resources, deploy Actors, and synchronize approved state. Zeke is the primary first-party native Agent.

## Mold

A Mold is the permissioned embodiment and reusable operating definition through which a Human or Agent may open, represent, instantiate, or control an Actor. It may include presentation, role, proofs, capabilities, runtime limits, sync rules, duration, and revocation.

## Current priority: make the first Actor real

The active product lane remains **Personal Gummy OS**.

The first dependable proof is:

```text
open a personal Actor in Gummy OS
→ import a real source Gummy
→ authorize one Agent through a bounded Mold
→ Agent transforms the source without altering it
→ receive a result Gummy
→ inspect a Receipt naming Human sponsor, Actor, Agent, Mold, Grant, route, source, and result
→ close and return later
→ the Actor and its state are still there
```

This local proof comes before distributed Glyphd OS ↔ Gummy OS synchronization, public Actors, celebrity/character Actors, social expansion, enterprise, federation, or broad runtime work.

## What works now

- Web-native desktop with draggable, resizable, minimizable, and maximizable windows.
- Gummy Browser with native `gummy://` routes, sandboxed external frames, and external-tab fallback.
- My Files with drag-to-companion delegation.
- Provider-neutral demo chat and scoped capability requests.
- Legacy Protocol 0.1 social and enterprise proof surfaces.
- Persistent shell state through `localStorage`.
- Protocol schemas, deterministic tests, build, and validation.

The current scaffold does **not** yet ship a real model broker, durable OPFS bytes, generated artifact writes, native Agent binding, Master Control synchronization, stable public `@addresses`, authentication, encrypted sync, cryptographic signing, hardened multi-tenancy, or production policy enforcement.

## Product map

```text
Gummy OS
├── Shell             desktop, windows, dock, browser, files
├── Actor             persistent web-openable computational entity
├── Agent             executable intelligence and operating process
├── Mold              permissioned embodiment and operating contract
├── Master Control    placement, synchronization, authority, revocation
├── Protocol          @addresses, routing, identity, messaging, binding
├── Gummy             files, projects, apps, workflows, results
├── Bowl              shared environments
├── Link              explicit relationships and lineage
├── Grab              independent derivation preserving source
├── Pack              application operating knowledge and contract
├── Broker            model and connector routing
├── Capsule           web, Wasm, Linux, or governed cloud execution
└── Receipt           evidence of request, authority, route, and outcome
```

## The central product insight

Traditional AI integration asks:

> How do we connect this model to this application?

Gummy OS asks:

> How do we give an Actor a computer, connect it to the right Agent, and let the Human decide exactly where authority and state live?

## Founding rules

1. The Web OS shell stays familiar and fast.
2. Actor and Agent remain distinct.
3. Human authority remains above both.
4. Master Control governs synchronization and placement.
5. Molds are permissioned operating contracts, not decorative profiles.
6. Intelligence is provider-neutral.
7. No ambient authority.
8. Consequential work leaves evidence.
9. The host computer remains outside Gummy OS authority.
10. Personal utility works before social or enterprise expansion.
11. Grabs preserve source provenance.
12. Delight is functional.

## Read order

1. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
2. `docs/VOCABULARY.md`
3. `docs/VISION.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PROTOCOL.md`
7. `docs/SECURITY_MODEL.md`
8. `docs/SOCIAL_LAYER.md`
9. `docs/ROADMAP.md`
10. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
11. `docs/BUILD_RUNBOOK.md`
12. `AGENTS.md`

## Run the current scaffold

Requirements: Node.js 22 or newer.

```bash
npm run dev
npm run verify
```

Open `http://localhost:4173`.

## Status

This is the **new July 24, 2026 Gummy OS**. Older repositories with reused Gummy names are historical collisions and are not implementation donors.

The July 25 handwritten architecture ruling corrected the narrower identity model before Cursor implementation: **Gummy OS is the Web OS for Actors; Glyphd OS is the native home for Agents; Master Control connects them.**

> **Open Gummy OS. Your Actor is already there.**
