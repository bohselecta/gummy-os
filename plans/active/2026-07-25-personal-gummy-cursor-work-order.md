# Personal Gummy OS — Ubuntu / Cursor Production Work Order

**Date:** 2026-07-25  
**Repository:** `bohselecta/gummy-os`  
**Authority:** Hayden's final Gummy Bar, Glopper, Actor/Agent, playground, and security rulings  
**Active lane:** Standalone Personal Gummy OS  
**Target:** one real, secure, playful browser-first loop

## Mission

Finish the new July 24, 2026 Gummy OS as an independently useful WebOS before inspecting or integrating the existing AI-native Linux distribution.

The platform names are locked:

```text
Gummy OS       = universal platform
Gummy Canvas   = open working surface
Gummy Bar      = candy-store system bar
Glopper        = gummy-candy companion and first-party Agent identity
Glopper Panel  = expanded conversation/control surface
Glopper App    = future standalone native/mobile interface
```

The Gummy Bar is full of candy icons. Glopper is one special companion candy in the Bar.

## Read before changing code

1. `README.md`
2. `docs/GLOPPER_NAMING.md`
3. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
4. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
5. `docs/VOCABULARY.md`
6. `docs/PRODUCT_SPEC.md`
7. `docs/ARCHITECTURE.md`
8. `docs/PROTOCOL.md`
9. `docs/SECURITY_MODEL.md`
10. `docs/ROADMAP.md`
11. `docs/BUILD_RUNBOOK.md`
12. `AGENTS.md`
13. current source and tests

## Absolute exclusions

Do not:

- inspect or import the old `gummy`, `gummy2`, `mygummy`, or `my-gummy` repositories;
- inspect, rebuild, or depend on the native AI Linux distribution during the standalone phase;
- collapse Actor and Agent;
- reduce Mold to an avatar or profile;
- call the Gummy Bar a Glopper Bar;
- create products named Gummy Desktop, Gummy Web, Z, Z panel, Z app, or Zeke companion;
- make Glopper merely an ordinary dock application;
- grant a candy icon, Actor, Agent, model, or application ambient authority;
- expose provider credentials to browser JavaScript;
- expose arbitrary host filesystem, shell, process, package, device, or network authority;
- overwrite a source Gummy;
- claim browser execution alone proves security;
- implement broad public Actor discovery, celebrity/character systems, federation, enterprise administration, multiple providers, or full cross-device sync before the standalone proof passes;
- force the hexagonal interface into the shell;
- lock Actor composition into one universal output type.

## Baseline

Before implementation:

1. Record exact `main` SHA.
2. Run `npm run verify`.
3. Run the current scaffold in Ubuntu.
4. Capture shell behavior and serialized state.
5. Inventory all Snack, Drop, Fork, Z, Zeke, companion, Agent, Actor, Mold, Gummy, Bar, dock, Grant, and Receipt references.
6. Record current localStorage keys and test coverage.
7. Write the migration sequence before changing stored data.

## Work package A — Gummy Canvas and Gummy Bar

### Gummy Canvas

Preserve the familiar windowed environment while naming the open working surface **Gummy Canvas**.

The Canvas supports windows, Actors, Gummies, applications, mini-apps, generated surfaces, drag/drop, selection, and Glopper context.

### Gummy Bar

Replace the ordinary dock concept with the **Gummy Bar**, a candy-store system surface.

It must:

- remain visible without obstructing the Canvas;
- display candy icons for Glopper, apps, active/pinned Actors, Gummies, Bowls, tasks, notifications, and controls;
- distinguish pinned, open, active, awaiting-approval, and attention states;
- support keyboard and touch access;
- use underlying object types rather than creating a new `candy` protocol class;
- accept placeholder visual tokens until Hayden supplies the final logo and mascot.

## Work package B — Glopper Panel

Glopper is a special persistent candy in the Gummy Bar.

Selecting Glopper opens the **Glopper Panel** as a side panel, floating panel, or responsive sheet without replacing the Canvas.

Collapsed presence provides:

- Glopper candy/avatar;
- invocation;
- current Actor;
- current task/status;
- voice affordance placeholder;
- attachment/drop target;
- pending approval indicator.

Expanded panel provides:

- conversation;
- selected Canvas context;
- Human, Actor, `@address`, Agent, and Mold;
- Master Control summary;
- task lease and executor locality;
- requested Grants;
- progress;
- result Gummies;
- Receipts, errors, denial, and revocation state.

```text
automatic availability != automatic authority
```

## Work package C — typed platform objects

Implement distinct records for:

### Human authority

A local principal sufficient to sponsor the personal Actor and approve Agent operation. Do not claim production identity verification.

### Actor

- stable Actor ID;
- provisional local `@address`;
- name and kind;
- owned Gummies;
- state/memory references;
- Mold and Agent bindings;
- authoritative location;
- local sync policy;
- legacy references.

### Agent

Create a separate first-party web executor:

```text
agent:glopper-web
```

Record provider/runtime class, version, locality, Human operator, capability ceiling, Actor/Mold bindings, task lease, status, and disclosure.

Do not claim it is the native Glopper Agent.

### Mold

A permissioned Actor operating contract with allowed Human/Agent operators, representation, role, capabilities, read/write/publish scope, locality/runtime policy, sync policy, disclosure, issue/expiry, and revocation.

### Master Control

A local control surface for Human, Actor, Agent, Mold, authoritative location, allowed data flow, approval rules, task lease, revocation, and future sync policy.

## Work package D — deterministic legacy and naming migration

```text
legacy snack:hayden
→ human:hayden
→ actor:hayden
→ mold:hayden:personal

legacy companion/model/Z references
→ agent:glopper-web + Glopper presentation

legacy dock
→ Gummy Bar presentation

legacy drop/file
→ Gummy

legacy fork
→ Grab + grab-of Link
```

Requirements:

- deterministic and idempotent;
- old state readable until parity is verified;
- Actor and Agent never share an ID/type;
- new UI uses Gummy Canvas, Gummy Bar, Glopper, and Glopper Panel;
- new writes use corrected objects;
- Receipts retain useful legacy references.

## Work package E — durable local WebOS

Implement:

- IndexedDB structured records and indexes;
- OPFS actual Gummy bytes;
- stable IDs and hashes;
- Actor-owned projects/folders;
- import/export;
- versioned migrations;
- reload and browser-return recovery;
- quota/storage errors;
- explicit quarantine state.

Gummy identity remains separate from byte location. OPFS is not arbitrary host filesystem access.

## Work package F — Glopper Web Agent route

Implement one provider-neutral route for `agent:glopper-web`.

Request includes Human, Actor, `@address`, Agent, Mold, Master Control, source Gummy, task, requested capabilities, privacy/locality preference, output contract, and cost ceiling.

Response includes terminal status, provider/model/runtime identity, locality, result bytes/reference, usage/cost, error/denial, and Receipt evidence.

Provider secrets remain server-side or in a trusted broker.

## Work package G — real source-to-result journey

1. Open Gummy OS.
2. Open the local personal Actor.
3. Use the Gummy Canvas and Gummy Bar.
4. Open the Glopper Panel.
5. Show `@address`, `agent:glopper-web`, active Mold, authoritative location, and approval rules.
6. Import a real text or Markdown file as a source Gummy.
7. Drag/attach it to Glopper.
8. Ask: “Turn this into a concise project brief. Preserve the original and create a new file.”
9. Master Control shows source read, result create, route, locality, and cost ceiling.
10. Human approves or denies.
11. On approval, issue a bounded Grant and call the real route.
12. Preserve source bytes unchanged.
13. Create result Gummy with stable identity, bytes, hash, provenance, and Links.
14. Create Receipt naming Human, Actor, `@address`, Agent, Mold, Master Control, Grant, route, source, result, locality, cost, time, and outcome.
15. Revoke Mold or Agent assignment and prove future work is blocked.
16. Restore authorized state.
17. Close and return.
18. Confirm all relevant state remains understandable.

## Work package H — quarantine and burn proof

Use a harmless test file.

1. Import it as a quarantined Gummy.
2. Show it has no native process, shell, package, device, or host-filesystem authority.
3. Attempt native promotion and prove deny-by-default behavior.
4. Simulate or implement a bounded approved export destination without creating a generic native bridge.
5. Create a disposable test workspace/session.
6. Burn/reset it.
7. Prove unapproved state disappears while accepted Gummies and Receipts remain.

Do not claim hardened containment beyond the evidence.

## Work package I — local adaptation harness foundation

Create interfaces, not an overbuilt model system, for:

```text
private local memory
approved portable profile
current task context
```

The standalone build may use structured preferences and embeddings. Ollama/llama.cpp integration is optional until the basic contract is proven.

The Human approves any preference promoted from private adaptation into the portable profile.

## Work package J — small composition experiment

Only after the core journey passes:

- open two local test Actors;
- create an explicit Link;
- choose selected test Gummies;
- create a temporary shared Canvas or Bowl;
- preserve source identity and provenance;
- do not merge private state;
- do not automatically mint a permanent Actor/Mold;
- record which output type feels natural.

## Work package K — native integration preflight, last

Only after A–J pass:

1. Locate the already-built AI-native Linux distribution.
2. Record local path, launch process, Agent/chat surfaces, browser/WebView support, capabilities, security boundary, and live-USB assets.
3. Preserve working code.
4. Determine whether the existing Glopper app/process director is already present or can serve as the native companion foundation.
5. Design one deny-by-default task bridge for `agent:glopper-native`.
6. Do not implement broad native control in this lane without a new accepted work order.

## Required tests

- shell and Gummy Canvas regression;
- Gummy Bar keyboard/touch states;
- Glopper Panel collapsed/expanded behavior;
- naming migration and idempotence;
- Actor/Agent separation;
- Human sponsorship;
- Mold scope/expiry/revocation;
- Agent assignment/removal and task lease;
- Master Control policy;
- IndexedDB/OPFS persistence;
- source immutability and result hashing;
- Grant approval/denial;
- Agent success/failure/malformed response;
- quarantine denial;
- burn/reset evidence;
- Receipt completeness;
- return continuity;
- composition without private-state merge.

## Acceptance commands

```bash
npm run verify
```

Add one end-to-end browser command proving the exact journey.

## Required Return

```text
Repository
Branch
Base SHA
Head SHA
Files changed
Gummy Canvas evidence
Gummy Bar evidence
Glopper Panel evidence
Human record
Actor record and @address
Agent record
Mold record
Master Control state
Task lease
Migration behavior
Storage boundary
Quarantine state
Agent/broker contract
Commands run
Tests passed / failed / not run
Screenshots and artifacts
Source and result hashes
Example Grant
Example Receipt
Revocation proof
Burn/reset proof
Composition observation
Known limitations
What is proven
What is not proven
Recommended next action
```

Do not self-accept the Return.

## Definition of done

Standalone Personal Gummy OS is working when a Human opens a persistent Actor, uses the Gummy Canvas and candy-filled Gummy Bar, directs `agent:glopper-web` through the Glopper Panel and bounded Mold, receives a real result Gummy without changing the source, can revoke the relationship, can quarantine and burn test state, and returns later to the same understandable system.

The native distro is inspected only after this proof.
