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
Gummy          = purple-dominant platform guide/personality
Glopper        = gold-dominant gummy-candy action companion
Glopper Panel  = expanded conversation and control surface
Glopper App    = standalone native/mobile interface
Gummy Box      = user-owned durable handoff space
Glopper Inbox  = pending Work Orders inside the Box
```

There is no separate public product called `Gummy Desktop` or `Gummy Web`. Device and deployment names describe how Gummy OS runs, not separate products.

## Locked brand system

Gummy OS has one visual universe and exactly two canonical expressions:

```text
Night Gummy
Day Gummy
```

> **Purple tells you where you are. Gold tells you what you can do.**

Purple owns environment, identity, navigation, conversation space, atmosphere, and location.

Gold owns action, focus, selection, approvals, active controls, notifications requiring attention, and moments of response.

### Core palette

```text
Deep Indigo      #4B187A
Gummy Violet     #7C2FD0
Honey Gold       #F2B544
Warm Cream       #FFF1C7
Aubergine Black  #100817
```

These five values are the only brand hue anchors. Derived surfaces may use opacity or mixes only between them.

### Night Gummy

Near-black aubergine Canvas, deep indigo structure, brighter violet energy, warm gold controls, and warm cream text.

### Day Gummy

Warm cream/honey surfaces, deep purple typography and navigation, restrained violet energy, and gold action areas with dark text.

Users choose day or night inside one locked world. No theme marketplace, arbitrary accent picker, teal Gummy, red Glopper, user-authored palette, or per-window hue chaos.

### Assistant emphasis

```text
Gummy    purple-dominant, gold accent
Glopper  gold-dominant, purple accent
```

Gummy emphasizes orientation, continuity, identity, focus, and environment.

Glopper emphasizes action, execution, Work Orders, approval, energy, and play.

Color is never the only identifier. Names, mascots, icons, labels, and the actual Agent executor remain explicit.

### Mascot and logo lock

- Gummy is the confident monkey with VR goggles, dark hoodie, purple energy, and gold trim.
- Glopper is the playful purple creature with large eyes, ears, tuft, paws, and fangs.
- Mascot silhouettes, proportions, colors, logos, and personalities are locked.
- Day/Night change surrounding surfaces and lighting—not the mascots.
- Wordmarks are approved graphic assets, not approximate text rendered in product code.

Read [`docs/BRAND_SYSTEM.md`](docs/BRAND_SYSTEM.md).

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

The **Gummy Bar** is the persistent candy-store system bar.

It may contain candy icons representing Glopper, applications, Actors, Gummies, Bowls, Work Orders, tasks, notifications, and controls.

A candy icon is presentation, not a protocol object or authority principal.

Purple establishes grouping and location. Gold marks selected candy, active task, approval request, action, or response. Every state also uses icon, label, shape, badge, or motion.

## Gummy and Glopper

Gummy guide surfaces help the Human understand where they are, how things relate, and what state is active.

Glopper lives as a special candy in the Gummy Bar. Selecting it expands the **Glopper Panel** without replacing the Canvas.

The panel supports conversation, voice, attachments, Canvas context, Actor/Agent/Mold state, Glopper Inbox, Master Control, Task Leases, Grant approvals, results, Returns, and Receipts.

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
- **Private GitHub** — code, versioned text, branches, diffs, and PRs;
- **Google Drive** — documents, images, media, and general collaboration.

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

GitHub or Google Drive access is scoped to the selected Box root—not the Human's entire account. Local Gummy OS remains useful without either provider.

Read [`docs/GUMMY_BOX_WORK_ORDERS.md`](docs/GUMMY_BOX_WORK_ORDERS.md).

## Existing Glopper lineage

`bohselecta/glopper` contains a real local-first process director for multi-agent build workflows. It remains independently useful and becomes Glopper's first substantial native application lineage: deterministic run state, project memory, gates, builder handoffs, Report Inbox behavior, evidence parsing, and hash-chained advancement.

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

```text
open a personal Actor in Gummy OS
→ choose Night or Day Gummy
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
→ Actor, expression, Box, Work Order, Return, and state remain
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

The scaffold does **not** yet ship production Night/Day tokens, final mascot assets, the final Gummy Bar, Glopper Panel, durable OPFS bytes, Gummy Box adapters, Glopper Inbox, real Glopper Agent route, hardened quarantine, native Bridge, production `@addresses`, encrypted sync, tamper-evident Receipts, or verified enterprise security.

## Product map

```text
Gummy OS
├── Night / Day        two canonical expressions
├── Brand Grammar      purple = place; gold = action
├── Gummy Canvas       working and creation surface
├── Gummy Bar          candy-store launcher/context/status
├── Gummy              purple-dominant guide/personality
├── Glopper            gold-dominant action companion
├── Glopper Panel      conversation/control surface
├── Glopper Inbox      pending Work Orders
├── Gummy Box          local/GitHub/Drive handoff space
├── Work Order         proposed bounded task
├── Task Lease         executor ownership
├── Return             execution report
├── Actor              persistent addressable entity
├── Agent              executable intelligence
├── Mold               permissioned operating contract
├── Master Control     placement, sync, authority, revocation
├── Gummy              files, projects, apps, workflows, results
├── Bowl               shared environments
├── Link               relationships and lineage
├── Grab               independent derivation preserving source
├── Quarantine         inspection before native promotion
├── Pack               application operating knowledge
├── Bridge             deny-by-default native connection
└── Receipt            evidence of authority, route, movement, outcome
```

## Founding rules

1. The platform is always Gummy OS, regardless of device.
2. Gummy Canvas stays open-ended, playful, and fast.
3. Gummy Bar is the candy store; Glopper is the companion candy.
4. Purple tells you where you are; gold tells you what you can do.
5. Night Gummy and Day Gummy are the only canonical expressions.
6. Gummy is purple-dominant; Glopper is gold-dominant.
7. Mascots, logos, proportions, identity colors, and personality remain locked.
8. Gummy Box belongs to the Human.
9. Frontier models may author Work Orders but cannot authorize them.
10. Actor and Agent remain distinct.
11. Human authority remains above both.
12. Master Control governs synchronization, placement, and revocation.
13. Molds are operating contracts, not decorative profiles.
14. Glopper is always available, but consequential action is never automatic.
15. Task Leases prevent conflicting executor ownership.
16. No ambient authority and no ambient synchronization.
17. Recursive creation is allowed; authority is never inherited automatically.
18. Personal utility and delight work before broad platform expansion.

## Read order

1. `docs/BRAND_SYSTEM.md`
2. `docs/GLOPPER_NAMING.md`
3. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
4. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
5. `docs/GUMMY_BOX_WORK_ORDERS.md`
6. `docs/VOCABULARY.md`
7. `docs/PRODUCT_SPEC.md`
8. `docs/ARCHITECTURE.md`
9. `docs/PROTOCOL.md`
10. `docs/SECURITY_MODEL.md`
11. `docs/SOCIAL_LAYER.md`
12. `docs/ROADMAP.md`
13. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
14. `plans/active/2026-07-25-gummy-box-cursor-addendum.md`
15. `plans/active/2026-07-25-brand-system-cursor-addendum.md`
16. `docs/BUILD_RUNBOOK.md`
17. `AGENTS.md`

## Run the current scaffold

Requirements: Node.js 22 or newer.

```bash
npm run dev
npm run verify
```

Open `http://localhost:4173`.

## Status

This is the **new July 24, 2026 Gummy OS**. Older repositories with reused Gummy names are historical collisions and are not implementation donors.

Hayden owns the final production mascot masters, Gummy/Glopper logos, motion references, and candy-store art direction.

> **Open Gummy OS. Pick a candy. Make a world.**
