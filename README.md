# Gummy OS

> **A computer you can open. A playground with real boundaries.**

Gummy OS is the browser-delivered WebOS where persistent, addressable **Actors** can be opened, explored, composed, and connected to executable **Agents** under Human-controlled **Master Control**.

It keeps the familiar computer—canvas, windows, files, applications, drag-and-drop, and browser-inside-browser—while adding provider-neutral intelligence, permissioned Molds, explicit synchronization, isolated runtimes, quarantined Gummies, and Action Receipts.

The canonical personal address is **mygum.my**.

## Final surface and companion names

```text
Gummy OS       = the universal platform and WebOS
Gummy Canvas   = the open working and creation surface
Gummy Bar      = the persistent candy-store system bar
Glopper        = the gummy-candy companion and first-party Agent identity
Glopper Panel  = Glopper's expanded conversation and control surface
Glopper App    = the standalone native/mobile interface
Glopper Agent  = the executor named in Grants and Receipts
```

There is no separate public product called `Gummy Desktop` or `Gummy Web`. Gummy OS runs on desktops, laptops, phones, tablets, PWAs, native shells, governed WebViews, and future devices. Those are deployment modes, not product identities.

Read [`docs/GLOPPER_NAMING.md`](docs/GLOPPER_NAMING.md) before implementing the shell or companion.

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
Actor in Gummy OS                       Glopper or another Agent
web-openable WebOS entity              executable intelligence
persistent identity/state              web, native, cloud, or future phone
```

Actor and Agent may produce one continuous experience, but they are not the same object.

## Gummy Canvas

Gummy OS is intentionally an open-ended creative and computational toolkit, not one forced workflow.

The **Gummy Canvas** is where Actors, Gummies, applications, mini-apps, worlds, tools, windows, and generated surfaces appear and combine. The earlier hexagonal interface remains valuable as an optional mini-app or Actor surface inside the Canvas.

## Gummy Bar

The **Gummy Bar** is the persistent system bar, visually conceived like a candy store.

It contains candy icons representing pinned or active:

- Glopper;
- applications and mini-apps;
- Actors;
- Gummies;
- Bowls;
- tools, tasks, notifications, and controls.

A candy icon is visual presentation, not a new protocol object type. The underlying object remains an Actor, Agent, Gummy, Bowl, application, task, or control.

```text
┌───────────────────────────────────────────────┐
│                                               │
│               GUMMY CANVAS                    │
│  Actors · Gummies · apps · worlds · tools    │
│                                               │
├───────────────────────────────────────────────┤
│  🍬  🍭  ◉  ◇  [GLOPPER]  ✦  ▣  🍬          │
│                 GUMMY BAR                     │
└───────────────────────────────────────────────┘
```

## Glopper is always available

Glopper is a gummy-candy character and the first-party companion identity.

Inside Gummy OS, Glopper lives as a special persistent candy in the Gummy Bar. Selecting it expands the **Glopper Panel** without replacing the Canvas.

The collapsed presence supports invocation, voice, attachment, current context, and status. The expanded panel supports conversation, task planning, Actor/Agent/Mold context, Master Control, Grant approvals, results, and Receipts.

```text
automatic availability != automatic authority
```

The standalone **Glopper App** may run on Linux, Windows, macOS, phones, or other native environments. It continues conversation, shows approvals and notifications, accesses device-specific capabilities through explicit Grants, and opens the relevant Actor or Gummy in Gummy OS.

Glopper may have separate executors:

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They may share one character and an approved portable preference profile, but remain distinct execution identities with separate locality, capability, task lease, and Receipt records.

## Existing Glopper lineage

`bohselecta/glopper` already contains a real local-first process director for multi-agent build workflows. It is not an unrelated naming collision.

That product remains usable on its own and becomes Glopper's first substantial native application and engineering lineage: deterministic run state, project memory, gates, builder handoffs, evidence parsing, and hash-chained advancement records.

The existing app does not yet claim to be the entire cross-surface Glopper Agent platform.

## Canonical language

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
Gummy OS = WebOS where Actors are opened and deployed
@address = stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how protocol objects relate
Grab = independent derivation without altering the source
```

## Recursive creation is part of the medium

Gummy OS allows Humans, Actors, and Agents to create and compose new Actors, Agents, Gummies, Molds, Bowls, tools, and shared surfaces.

The invariant is:

> **Creation never implies inherited authority.**

Every child Actor or Agent receives independent identity, provenance, capability ceilings, disclosure, Mold and Master Control relationships, task ownership, and a revocation path.

## Security posture

Gummy OS does not replace endpoint security, enterprise identity, network controls, disk encryption, secure boot, EDR, MDM, biometrics, passkeys, hardware keys, or kernel protections.

Gummy OS adds a containment and authority layer:

- everyday work can remain inside browser-origin or capsule boundaries;
- downloads can first land as quarantined Gummies;
- suspicious workspaces can be reset or burned;
- native access requires an explicit bridge, Mold, Grant, and approval;
- movement into native authority is a separate receiptable promotion action;
- Glopper or another native Agent can monitor only approved security signals.

A file inside Gummy OS does not automatically become a native executable.

The claim is **explicit boundaries and smaller blast radius**, verified progressively—not perfect security by slogan.

## Current priority: make the standalone platform real

The first development pass does **not** depend on the existing AI-native Linux distribution.

```text
open a personal Actor in Gummy OS
→ use the Gummy Canvas and Gummy Bar
→ open the Glopper Panel
→ import a real source Gummy
→ authorize agent:glopper-web through a bounded Mold
→ Master Control shows location, data flow, and approval
→ Glopper transforms the source without altering it
→ receive a result Gummy
→ inspect a complete Receipt
→ revoke the Agent or Mold and prove future work is blocked
→ quarantine and burn/reset a harmless test workspace
→ close and return later
→ the Actor and state are still there
```

After the standalone browser system works, evaluate the existing native distribution and connect `agent:glopper-native` through one deny-by-default bridge. Do not rebuild the distribution from GitHub assumptions.

## What works now

- Web-native shell with draggable, resizable, minimizable, and maximizable windows.
- Gummy Browser with native `gummy://` routes, sandboxed external frames, and external-tab fallback.
- My Files with drag-to-companion delegation.
- Provider-neutral demo chat and scoped capability requests.
- Legacy Protocol 0.1 social and enterprise proof surfaces.
- Persistent shell state through `localStorage`.
- Protocol schemas, deterministic tests, build, and validation.

The current scaffold does **not** yet ship the Gummy Bar, final Glopper Panel, durable OPFS bytes, real Glopper Agent route, hardened quarantine, native bridge, production `@addresses`, encrypted sync, tamper-evident Receipts, or verified enterprise security.

## Product map

```text
Gummy OS
├── Gummy Canvas      open working and creation surface
├── Gummy Bar         candy-store launcher, context, tasks, and status
├── Glopper           companion character and first-party Agent identity
├── Glopper Panel     expanded conversation and control surface
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

1. The platform is always Gummy OS, regardless of device.
2. The Gummy Canvas stays open-ended, playful, and fast.
3. The Gummy Bar is the candy store; Glopper is the companion candy.
4. Actor and Agent remain distinct.
5. Human authority remains above both.
6. Master Control governs synchronization, placement, and revocation.
7. Molds are operating contracts, not decorative profiles.
8. Glopper is always available, but consequential action is never automatic.
9. Intelligence, runtime, and provider remain replaceable.
10. No ambient authority and no ambient synchronization.
11. Recursive creation is allowed; authority is never inherited automatically.
12. Personal utility and delight work before broad platform expansion.

## Read order

1. `docs/GLOPPER_NAMING.md`
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
12. `docs/BUILD_RUNBOOK.md`
13. `AGENTS.md`

## Run the current scaffold

Requirements: Node.js 22 or newer.

```bash
npm run dev
npm run verify
```

Open `http://localhost:4173`.

## Status

This is the **new July 24, 2026 Gummy OS**. Older repositories with reused Gummy names are historical collisions and are not implementation donors.

Hayden owns the next visual inputs: final Glopper mascot/avatar, Gummy logo, and candy-store art direction.

> **Open Gummy OS. Pick a candy. Make a world.**
