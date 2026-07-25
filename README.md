# Gummy OS

> **A computer you can open. A playground with real boundaries.**

Gummy OS is the browser-delivered WebOS where persistent, addressable **Actors** can be opened, explored, composed, and connected to native **Agents** under Human-controlled **Master Control**.

It keeps the familiar computer—desktop, windows, folders, files, applications, dock, drag-and-drop, and browser-inside-browser—while adding provider-neutral intelligence, permissioned Molds, explicit synchronization, isolated runtimes, quarantined Gummies, and Action Receipts.

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
Actor in Gummy OS                       Agent in native OS
web-openable WebOS entity              executable intelligence
persistent identity/state              tools, compute, devices, models
```

Actor and Agent may produce one continuous experience, but they are not the same object.

## The native foundation already exists

The AI-native Linux distribution is not a future concept to recreate here. Hayden already has a substantial local implementation, including AI system control, a native chat/control surface, and a live-USB build.

That distribution remains a normal usable Linux system when AI control is not wanted. When enabled, its native Agent can connect to Gummy OS through explicit protocol, Mold, Grant, and Master Control boundaries.

The next Ubuntu session begins by inspecting and using that existing implementation—not rebuilding it from repository speculation.

## Gummy OS is the canvas

Gummy OS is intentionally an open-ended creative and computational toolkit, not one forced workflow.

Its primitives can be combined into interfaces the core team did not predict:

- Actors;
- Agents;
- Molds;
- Master Control;
- Gummies;
- Bowls;
- Links;
- Grabs;
- applications and mini-apps;
- runtimes and protocols;
- Receipts.

The prior hexagonal interface remains valuable as an optional mini-app inside Gummy OS. It is not the mandatory shell for every person.

## Z is always available

Inside Gummy OS, **Z is a persistent collapsed command bar that expands into a full conversation and control panel**.

Z is not trapped as an ordinary dock app. A person can speak, type, attach a Gummy, point to something on the canvas, request work, inspect authority, approve a Grant, and receive a result from anywhere in the WebOS.

```text
automatic availability != automatic authority
```

The native Z app or Linux chat panel is a second interface to the Agent. Master Control decides which conversation state, tasks, Gummies, approvals, and Receipts synchronize between native and WebOS environments.

## Corrected canonical language

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
Gummy OS = WebOS where Actors are opened and deployed
Native AI Linux / Glyphd OS = device-sovereignty and Agent execution layer
@address = stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how protocol objects relate
Grab = independent derivation without altering the source
```

Read these rulings before implementation:

1. [`docs/ACTOR_AGENT_MASTER_CONTROL.md`](docs/ACTOR_AGENT_MASTER_CONTROL.md)
2. [`docs/PLATFORM_PLAYGROUND_SECURITY.md`](docs/PLATFORM_PLAYGROUND_SECURITY.md)

## Recursive creation is part of the medium

Gummy OS allows Humans, Actors, and Agents to create and compose new Actors, Agents, Gummies, Molds, Bowls, tools, and shared surfaces.

Actors may discover other Actors by `@address`. Their surfaces may request Links, share Gummies, enter Bowls, or propose a composed environment. The result might later become a Bowl, Gummy, Mold, Actor, application, or temporary shared canvas.

The invariant is:

> **Creation never implies inherited authority.**

Every child Actor or Agent receives independent identity, provenance, capability ceilings, disclosure, Mold and Master Control relationships, and a revocation path.

## Security posture

Gummy OS does not replace endpoint security, enterprise identity, network controls, disk encryption, secure boot, EDR, MDM, biometrics, passkeys, hardware keys, or kernel protections. Those stay at the host, native OS, network, identity, and organization layers.

Gummy OS adds a containment and authority layer above them:

- most ordinary work can remain inside browser-origin or capsule boundaries;
- downloads can first land as quarantined Gummies;
- suspicious workspaces can be reset or burned;
- native access requires an explicit bridge, Mold, Grant, and approval;
- a native defensive Agent can monitor approved security signals;
- movement into native authority is a separate, receiptable promotion action.

A file inside Gummy OS does not automatically become a native executable file.

The goal is a smaller blast radius and explicit boundaries—not unsupported claims of perfect security.

## Portable deployment

Gummy OS can run in a normal browser on a computer or phone, as a PWA, inside a governed WebView, or inside the existing AI-native Linux distribution.

The existing live-USB direction can provide a portable native life: boot a trusted environment, authenticate, start the native Agent, open Gummy OS, resolve the Actor, restore only approved state, and leave without persisting unapproved local data.

## Current priority: make the first local loop real

```text
open a personal Actor in Gummy OS
→ import a real source Gummy
→ authorize one distinct Agent through a bounded Mold
→ Master Control shows location, data flow, and approval
→ Agent transforms the source without altering it
→ receive a result Gummy
→ inspect a Receipt naming Human, Actor, Agent, Mold, Grant, route, source, and result
→ revoke the Agent or Mold and prove future work is blocked
→ close and return later
→ the Actor and its state are still there
```

This proof comes before distributed native synchronization, public Actor discovery, celebrity or character systems, broad social features, enterprise, federation, or multiple runtime routes.

## What works now

- Web-native desktop with draggable, resizable, minimizable, and maximizable windows.
- Gummy Browser with native `gummy://` routes, sandboxed external frames, and external-tab fallback.
- My Files with drag-to-companion delegation.
- Provider-neutral demo chat and scoped capability requests.
- Legacy Protocol 0.1 social and enterprise proof surfaces.
- Persistent shell state through `localStorage`.
- Protocol schemas, deterministic tests, build, and validation.

The current scaffold does **not** yet ship durable OPFS bytes, a real native Agent bridge, the Z hybrid surface, Master Control synchronization, production `@addresses`, encrypted sync, hardened quarantine, tamper-evident Receipts, or verified enterprise security claims.

## Product map

```text
Gummy OS
├── Canvas            desktop, windows, apps, files, Actor surfaces
├── Z Surface         persistent bar + expandable conversation/control panel
├── Actor             persistent addressable WebOS entity
├── Agent             executable intelligence and operating process
├── Mold              permissioned embodiment and operating contract
├── Master Control    placement, synchronization, authority, revocation
├── Protocol          @addresses, routing, messaging, binding, discovery
├── Gummy             files, projects, apps, workflows, results
├── Bowl              shared environments
├── Link              explicit relationships and lineage
├── Grab              independent derivation preserving source
├── Quarantine        contained inspection before native promotion
├── Pack              application operating knowledge and contract
├── Bridge            deny-by-default connection to native authority
└── Receipt           evidence of request, authority, route, movement, outcome
```

## Founding rules

1. The WebOS shell stays familiar, playful, and fast.
2. Actor and Agent remain distinct.
3. Human authority remains above both.
4. Master Control governs synchronization, placement, and revocation.
5. Molds are operating contracts, not decorative profiles.
6. Z is always available, but consequential action is never automatic.
7. Intelligence, runtime, and provider remain replaceable.
8. No ambient authority and no ambient synchronization.
9. Consequential work and cross-boundary movement leave evidence.
10. Existing native security remains in place rather than being replaced.
11. Recursive creation is allowed; authority is never inherited automatically.
12. Personal utility and delight work before broad platform expansion.

## Read order

1. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
2. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
3. `docs/VOCABULARY.md`
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

The existing native AI Linux distribution is a real local implementation and integration target. Gummy OS is the WebOS playground that can run inside it or independently on ordinary computers and phones.

> **Open Gummy OS. Your Actor is already there—and the canvas is yours.**
