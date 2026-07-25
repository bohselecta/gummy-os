# Gummy OS

> **A computer you can open. A playground with real boundaries.**

Gummy OS is the browser-delivered WebOS where persistent, addressable **Actors** can be opened, explored, composed, and connected to executable **Agents** under Human-controlled **Master Control**.

It keeps the familiar computer—canvas, windows, files, applications, drag-and-drop, and browser-inside-browser—while adding provider-neutral intelligence, permissioned Molds, explicit synchronization, isolated runtimes, quarantined Gummies, user-owned Gummy Boxes, and Action Receipts.

The canonical personal address is **mygum.my**.

## Final product names

```text
Gummy OS       = universal platform and WebOS
Gummy Canvas   = open working and creation surface
Gummy Bar      = persistent candy-store system bar
Glopper        = gummy-candy companion and first-party Agent identity
Glopper Panel  = expanded conversation and control surface
Glopper App    = standalone native/mobile interface
Gummy Box      = user-owned durable handoff space
Glopper Inbox  = pending Work Orders inside the Box
```

There is no separate public product called `Gummy Desktop` or `Gummy Web`. Device and deployment names describe how Gummy OS runs, not separate products.

## Architecture

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
persistent identity/state              web, native, cloud, or phone
```

Actor and Agent may produce one continuous experience, but they are not the same object.

## Gummy Canvas

The **Gummy Canvas** is where Actors, Gummies, applications, mini-apps, worlds, tools, windows, and generated surfaces appear and combine. Gummy OS is a toolkit and playground, not one forced workflow.

The prior hexagonal interface remains valuable as an optional mini-app or Actor surface.

## Gummy Bar

The **Gummy Bar** is the persistent system bar, visually conceived like a candy store.

It may contain candy icons representing:

- Glopper;
- applications and mini-apps;
- Actors;
- Gummies;
- Bowls;
- Work Orders;
- tasks, notifications, and controls.

A candy icon is visual presentation, not a protocol object or authority principal.

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

## Glopper

Glopper is a gummy-candy character and the first-party companion identity.

Inside Gummy OS, Glopper lives as a special persistent candy in the Gummy Bar. Selecting it expands the **Glopper Panel** without replacing the Canvas.

The panel supports conversation, voice, attachments, current Canvas context, Actor/Agent/Mold state, Master Control, Task Leases, Grant approvals, results, Returns, and Receipts.

```text
automatic availability != automatic authority
```

Glopper may have separate executors:

```text
agent:glopper-web
agent:glopper-cloud
agent:glopper-native
agent:glopper-phone
```

They may share one character and an approved portable preference profile, but remain distinct execution identities with separate locality, capability, Task Lease, private-memory, and Receipt boundaries.

## Gummy Box

During onboarding, Gummy OS creates or connects a **user-owned Gummy Box**.

Choices:

- **Local only** — IndexedDB/OPFS, no external account required;
- **Private GitHub** — best for code, versioned text, branches, diffs, and PRs;
- **Google Drive** — best for documents, images, media, and general collaboration.

The provider is an adapter. The Box identity and protocol remain provider-neutral.

Frontier models can write structured **Work Orders** into the Box. Glopper validates them, shows them in **Glopper Inbox**, obtains Human approval, claims a **Task Lease**, executes under bounded **Capability Grants**, and writes a **Return**, artifacts, and Receipts back.

```text
Frontier model
→ Work Order
→ Gummy Box
→ Glopper Inbox
→ APPROVE / REVISE / REJECT / HOLD
→ Task Lease + Grant
→ Glopper executor
→ Return + artifacts + Receipt
→ Gummy Box
```

> **A Work Order is a proposal, not authority.**

GitHub or Google Drive connection is scoped to the selected Box root—not the Human's entire account. Local Gummy OS remains useful without either provider.

Read [`docs/GUMMY_BOX_WORK_ORDERS.md`](docs/GUMMY_BOX_WORK_ORDERS.md).

## Existing Glopper lineage

`bohselecta/glopper` contains a real local-first process director for multi-agent build workflows. It remains independently useful and becomes Glopper's first substantial native application lineage: deterministic run state, project memory, gates, builder handoffs, evidence parsing, and hash-chained advancement.

It does not yet claim to be the complete cross-surface Glopper Agent platform.

## Canonical language

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
Gummy Box = user-owned asynchronous handoff space
Work Order = structured proposal for bounded work
Task Lease = executor ownership of a task scope
Return = structured report of attempted/completed execution
@address = stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how protocol objects relate
Grab = independent derivation without altering the source
```

## Recursive creation

Gummy OS allows Humans, Actors, and Agents to create and compose new Actors, Agents, Gummies, Molds, Bowls, tools, Work Orders, and shared surfaces.

> **Creation never implies inherited authority.**

Every child Actor or Agent receives independent identity, provenance, capability ceilings, disclosure, Mold and Master Control relationships, task ownership, and revocation.

## Security posture

Gummy OS does not replace endpoint security, enterprise identity, network controls, disk encryption, secure boot, EDR, MDM, biometrics, passkeys, hardware keys, or kernel protections.

It adds containment and explicit authority:

- everyday work can remain inside browser-origin or capsule boundaries;
- downloads begin as quarantined Gummies;
- provider files and Work Orders are untrusted until validated;
- Gummy Box access is scoped to one selected repository/folder;
- suspicious workspaces can be reset or burned;
- native access requires an explicit Bridge, Mold, Grant, and approval;
- movement into native authority is separately receipted;
- Task Leases prevent silent duplicate execution.

A file inside Gummy OS or Gummy Box does not automatically become a native executable.

The promise is **explicit boundaries and smaller blast radius**, verified progressively.

## Current priority

The first development pass does not depend on the native AI Linux distribution.

```text
open a personal Actor in Gummy OS
→ use Gummy Canvas and Gummy Bar
→ initialize Local Gummy Box
→ open Glopper Panel and Inbox
→ validate a frontier-authored Work Order
→ Human approves
→ agent:glopper-web claims Task Lease
→ transform source without altering it
→ receive result Gummy
→ write Return + artifact + Receipt to Box
→ revoke Agent/Mold and prove blocked
→ quarantine and burn/reset harmless test workspace
→ close and return later
→ Actor, Box, Work Order, Return, and state remain
```

After the standalone browser system works, evaluate the existing native distribution and connect `agent:glopper-native` through one deny-by-default Bridge.

## What works now

- Web-native shell with draggable, resizable, minimizable, and maximizable windows.
- Gummy Browser with native routes, sandboxed external frames, and external-tab fallback.
- My Files with drag-to-companion delegation.
- Provider-neutral demo chat and scoped capability requests.
- Legacy social and enterprise proof surfaces.
- Persistent shell state through `localStorage`.
- Protocol schemas, deterministic tests, build, and validation.

The scaffold does **not** yet ship the final Gummy Bar, Glopper Panel, durable OPFS bytes, Gummy Box adapters, Glopper Inbox, real Glopper Agent route, hardened quarantine, native Bridge, production `@addresses`, encrypted sync, tamper-evident Receipts, or verified enterprise security.

## Product map

```text
Gummy OS
├── Gummy Canvas      working and creation surface
├── Gummy Bar         candy-store launcher/context/status
├── Glopper           companion character and Agent family
├── Glopper Panel     conversation/control surface
├── Glopper Inbox     pending Work Orders
├── Gummy Box         local/GitHub/Drive handoff space
├── Work Order        proposed bounded task
├── Task Lease        executor ownership
├── Return            execution report
├── Actor             persistent addressable entity
├── Agent             executable intelligence
├── Mold              permissioned operating contract
├── Master Control    placement, sync, authority, revocation
├── Gummy             files, projects, apps, workflows, results
├── Bowl              shared environments
├── Link              relationships and lineage
├── Grab              independent derivation preserving source
├── Quarantine        inspection before native promotion
├── Pack              application operating knowledge
├── Bridge            deny-by-default native connection
└── Receipt           evidence of authority, route, movement, outcome
```

## Founding rules

1. The platform is always Gummy OS, regardless of device.
2. Gummy Canvas stays open-ended, playful, and fast.
3. Gummy Bar is the candy store; Glopper is the companion candy.
4. Gummy Box belongs to the Human.
5. Frontier models may author Work Orders but cannot authorize them.
6. Actor and Agent remain distinct.
7. Human authority remains above both.
8. Master Control governs synchronization, placement, and revocation.
9. Molds are operating contracts, not decorative profiles.
10. Glopper is always available, but consequential action is never automatic.
11. Task Leases prevent conflicting executor ownership.
12. No ambient authority and no ambient synchronization.
13. Recursive creation is allowed; authority is never inherited automatically.
14. Personal utility and delight work before broad platform expansion.

## Read order

1. `docs/GLOPPER_NAMING.md`
2. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
3. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
4. `docs/GUMMY_BOX_WORK_ORDERS.md`
5. `docs/VOCABULARY.md`
6. `docs/PRODUCT_SPEC.md`
7. `docs/ARCHITECTURE.md`
8. `docs/PROTOCOL.md`
9. `docs/SECURITY_MODEL.md`
10. `docs/SOCIAL_LAYER.md`
11. `docs/ROADMAP.md`
12. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
13. `plans/active/2026-07-25-gummy-box-cursor-addendum.md`
14. `docs/BUILD_RUNBOOK.md`
15. `AGENTS.md`

## Run the current scaffold

Requirements: Node.js 22 or newer.

```bash
npm run dev
npm run verify
```

Open `http://localhost:4173`.

## Status

This is the **new July 24, 2026 Gummy OS**. Older repositories with reused Gummy names are historical collisions and are not implementation donors.

Hayden owns the final Glopper mascot/avatar, Gummy logo, and candy-store art direction.

> **Frontier models write the instructions. Glopper owns the execution contract. The Human owns the Box and the authority.**
