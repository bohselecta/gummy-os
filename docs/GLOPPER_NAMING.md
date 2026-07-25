# Glopper and Gummy OS Naming

**Status:** Founder-locked product naming  
**Date:** 2026-07-25

Read `BRAND_SYSTEM.md` for the authoritative visual system.

## Final public names

```text
Gummy OS       = the universal platform and WebOS
Gummy Canvas   = the open working and creation surface
Gummy Bar      = the persistent candy-store system bar
Gummy          = the purple-dominant platform guide/personality
Glopper        = the gummy-candy action companion and first-party Agent identity
Glopper Panel  = Glopper's expanded conversation and control surface
Glopper App    = the standalone native/mobile interface to Glopper
Glopper Agent  = the executable identity named in Grants and Receipts
```

Do not create separate public products called `Gummy Desktop` or `Gummy Web`. Gummy OS is the platform on desktops, laptops, phones, tablets, live-USB systems, and future devices. `desktop`, `browser`, `PWA`, `native shell`, and `mobile` describe deployment modes, not product identity.

## Gummy and Glopper

Gummy and Glopper belong to one locked visual universe but reverse emphasis:

```text
Gummy    = purple-dominant, gold accent
Glopper  = gold-dominant, purple accent
```

Gummy represents orientation, environment, identity, continuity, focus, and “where am I?”

Glopper represents action, execution, Work Orders, approvals, energy, play, and “what are we doing?”

These are Human-facing presentation identities. The actual Agent executor, locality, capability, Task Lease, and Receipt must remain explicit.

## Gummy Bar

The **Gummy Bar** replaces the ordinary dock/taskbar concept with a playful candy-store system surface.

It is always available and may contain candy icons representing:

- Glopper;
- applications and mini-apps;
- open or pinned Actors;
- active Gummies;
- Bowls;
- Work Orders and Glopper Inbox;
- tools and controls;
- current tasks or notifications.

A candy icon is a visual presentation, not a new protocol object type. The underlying object remains an Actor, Agent, Gummy, Bowl, application, task, Work Order, or control.

The Gummy Bar may visually behave like a candy counter, tray, shelf, jar, or store display. It remains inside the locked purple/gold/cream/aubergine system rather than becoming a rainbow launcher.

## Glopper in the Gummy Bar

Glopper is a special persistent candy in the Gummy Bar.

Selecting Glopper expands the **Glopper Panel** without replacing the Gummy Canvas.

```text
┌───────────────────────────────────────────────┐
│                                               │
│             GUMMY CANVAS                      │
│   Actors · Gummies · apps · worlds · tools   │
│                                               │
├───────────────────────────────────────────────┤
│  ◉  ◇  ▣  [GLOPPER]  ✦  ▰  ◉                 │
│                 GUMMY BAR                     │
└───────────────────────────────────────────────┘
```

Expanded:

```text
┌──────────────────────────┬────────────────────┐
│                          │ GLOPPER PANEL      │
│      GUMMY CANVAS        │ conversation       │
│                          │ current Actor       │
│                          │ Agent and Mold      │
│                          │ approvals           │
│                          │ results / Receipts  │
└──────────────────────────┴────────────────────┘
```

Glopper may also appear as a small animated candy character on the Canvas when useful, but the mascot must not obstruct work or imply authority the Agent does not possess.

## Glopper identity layers

### Glopper character

The friendly purple gummy creature, voice, motion, personality, and emotional relationship with the Human.

The mascot remains purple in Night and Day Gummy. Gold dominance belongs to Glopper's surrounding action surfaces, halo, response frame, controls, and moments of execution—not to recoloring the creature.

### Glopper Panel

The expanded in-Gummy-OS interface for:

- conversation;
- voice;
- attachments;
- current Actor and Canvas context;
- Glopper Inbox and Work Orders;
- task planning;
- Master Control decisions;
- Task Leases and Grant approvals;
- results and Returns;
- Receipts;
- executor and locality disclosure.

### Glopper App

A standalone native or mobile interface that can continue conversation, show approvals and notifications, access device-specific capabilities through explicit Grants, and open the relevant Actor or Gummy in Gummy OS.

### Glopper Agent

The executable first-party Agent identity. There may be multiple Glopper executors:

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They may share the Glopper character and an approved portable preference profile, but remain separate execution identities with separate locality, capability, Task Lease, private-memory, and Receipt records.

## Existing Glopper product lineage

`bohselecta/glopper` already implements a local-first process director for multi-agent build workflows. That is not a naming collision and must not be discarded.

It becomes the first substantial native Glopper application and a donor/foundation for:

- deterministic task sequencing;
- run state;
- project memory;
- gates and approvals;
- builder handoffs;
- Report Inbox behavior;
- evidence parsing;
- hash-chained advancement records;
- future local Agent and model routing.

Its current v1.0 product remains real and usable on its own. Expanding Glopper into the cross-surface companion does not falsely claim the current app already implements the entire Agent platform.

## Names retired in Gummy OS

The following are no longer current Gummy OS product terms:

- Z;
- Z bar;
- Z panel;
- native Z app;
- Z Agent;
- Zeke as the first-party Gummy OS companion.

Historical documents and code may retain these as migration inputs. New documentation, UI, schemas, and Receipts use Gummy and Glopper.

## Product sentences

- “Open Gummy OS.”
- “Switch to Night Gummy.”
- “Put it on the Gummy Canvas.”
- “Pin that Actor to the Gummy Bar.”
- “Ask Gummy where this belongs.”
- “Ask Glopper to do it.”
- “Open the Glopper Panel.”
- “The Glopper Agent completed the task locally.”
- “Continue this in the Glopper App.”

## Invariant

```text
The Gummy Bar is the candy store.
Gummy tells you where you are.
Glopper helps you act.
The Gummy Canvas is where the world is made.
Purple tells you where you are.
Gold tells you what you can do.
```
