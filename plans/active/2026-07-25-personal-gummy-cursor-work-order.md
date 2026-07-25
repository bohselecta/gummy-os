# Personal Gummy OS — Ubuntu / Cursor Production Work Order

**Date:** 2026-07-25  
**Repository:** `bohselecta/gummy-os`  
**Authority:** Hayden's Actor/Agent, Z-surface, playground, and security rulings in the Chief of Command thread  
**Active lane:** Personal Gummy OS inside the existing AI-native Linux environment  
**Target:** one real, secure, playful computer-within-a-computer loop

## Mission

Finish the new July 24, 2026 Gummy OS and run it inside Hayden's **existing local AI-native Linux distribution**.

Do not rebuild that distribution. It is already substantially implemented, includes AI system control and a native chat/control surface, and has had a live-USB form.

Gummy OS is the WebOS canvas. The native distribution is the device-sovereignty and Agent layer. Z appears both as:

- an always-available collapsed bar and expandable panel inside Gummy OS;
- the existing or adapted native chat/control surface outside Gummy OS.

Master Control decides what connects and synchronizes between them.

## Read before changing code

1. `README.md`
2. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
3. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
4. `docs/VOCABULARY.md`
5. `docs/PRODUCT_SPEC.md`
6. `docs/ARCHITECTURE.md`
7. `docs/PROTOCOL.md`
8. `docs/SECURITY_MODEL.md`
9. `docs/ROADMAP.md`
10. `docs/BUILD_RUNBOOK.md`
11. `AGENTS.md`
12. current source and tests
13. the actual local native-distribution source and runtime

## Canonical model

```text
Human = ultimate personal authority
Actor = persistent addressable entity in Gummy OS / the web
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, synchronization, approval, and revocation
Gummy OS = playful WebOS canvas
Native AI Linux / Glyphd OS = existing local Agent and device layer
Z surface = persistent WebOS bar + expandable panel
Native Z surface = external chat, voice, approval, and device control
```

## Product character

Gummy OS is not one forced workflow. It is a toolkit and playground for creating interfaces, tools, Actors, Agents, Gummies, Bowls, and compositions.

The existing hexagonal interface belongs as an optional mini-app or Actor surface. Do not make it the mandatory shell.

Recursive creation is allowed. Authority is never inherited automatically.

## Absolute exclusions

Do not:

- inspect or import the old `gummy`, `gummy2`, `mygummy`, or `my-gummy` repositories;
- rebuild or replace the existing native AI Linux distribution before inspecting it;
- assume the native distribution is future work or absent because it is not fully represented in GitHub;
- collapse Actor and Agent into one object;
- model Mold as only a profile or avatar;
- make Z merely an ordinary dock application;
- grant Z, an Actor, Agent, model, or application ambient authority;
- synchronize everything merely because the same Human is authenticated;
- expose provider credentials to browser JavaScript;
- expose arbitrary native filesystem, shell, process, package, device, or network authority;
- overwrite the source Gummy;
- claim browser or Linux hosting alone proves security;
- implement public Actor discovery, celebrity/character systems, broad remote social accounts, federation, enterprise administration, broad Application Packs, multiple providers, or full cross-device sync before the local proof passes;
- make Glyphd Desktop or `glyphd.com` a dependency;
- lock Actor-page composition into one universal object type before prototyping.

## Work package 0 — Ubuntu and native-distribution preflight

Before modifying Gummy OS:

1. Record the exact `gummy-os` `main` SHA.
2. Run `npm run verify`.
3. Locate the actual native AI Linux distribution project and runtime.
4. Record:
   - local project path;
   - repository/branch if any;
   - launch command;
   - compositor/desktop/session details;
   - native Agent or chat process;
   - current AI system-control capabilities;
   - localhost/API/MCP/IPC surfaces;
   - browser or WebView availability;
   - security or permission layer;
   - live-USB image/build assets;
   - current tests and known failures.
5. Launch the existing distro and prove the current native chat/control path without changing it.
6. Identify the narrowest way to open Gummy OS inside it: ordinary browser first, existing WebView second.
7. Return an exact blocker rather than inventing a replacement if the local implementation cannot be found or started.

## Work package A — run Gummy OS inside the distro

- Start the current Gummy OS scaffold in the Ubuntu environment.
- Open it inside the distribution through a normal browser or existing WebView.
- Preserve ordinary standalone browser use on other computers and phones.
- Prove windows, browser, files, and existing shell behavior still work.
- Record process, origin, port, and host/native boundaries.
- Add no privileged native bridge during this package.

## Work package B — implement the Z hybrid surface

Inside Gummy OS, implement:

### Collapsed Z bar

Always visible but compact. It provides:

- text input;
- optional voice affordance;
- attach or drag a Gummy;
- current Actor indicator;
- current Agent indicator;
- current task/status;
- expand control;
- clear pending approval indicator.

### Expanded Z panel

Provides:

- conversation;
- selected canvas context;
- current Actor and `@address`;
- assigned Agent;
- active Mold;
- Master Control summary;
- requested Grants;
- task progress;
- results;
- Receipts;
- collapse control.

Z must be available globally across the WebOS, not launched as an ordinary dock app.

Z may understand selected context automatically. It may not perform consequential action automatically.

## Work package C — correct typed object model

Implement distinct records for:

### Human authority

A local personal principal sufficient to sponsor an Actor and approve Agent operation. Do not claim production identity verification.

### Actor

- stable Actor ID;
- local provisional `@address`;
- name and kind;
- owned Gummies;
- state and memory references;
- Mold references;
- Agent bindings;
- deployment state;
- authoritative location;
- local sync policy;
- legacy references.

### Agent

- stable Agent ID;
- provider/runtime class;
- version and locality;
- Human/organization operator;
- capability ceiling;
- status;
- Actor and Mold bindings;
- disclosure.

The first real Agent may be a trusted broker adapter. Do not falsely label it Zeke or the native distro Agent until it truly is.

### Mold

- Actor ID;
- allowed Human and Agent operators;
- representation and role;
- capability ceiling;
- read/write/publish scope;
- runtime and locality policy;
- synchronization policy;
- disclosure;
- proof/license references;
- issue, expiry, and revocation.

### Master Control

- Human authority;
- Actor;
- authoritative location;
- assigned Agent;
- active Mold;
- permitted data flow;
- synchronization mode/direction;
- approval rules;
- revocation and lock state.

## Work package D — deterministic legacy migration

```text
legacy snack:hayden
→ human:hayden
→ actor:hayden
→ mold:hayden:personal

legacy companion/model
→ agent:personal-broker

legacy drop/file
→ gummy

legacy fork
→ grab + grab-of Link
```

Requirements:

- migration is deterministic and idempotent;
- old state remains readable until parity is verified;
- Actor and Agent never share an ID or type;
- authority flows through Human sponsorship, Master Control, Mold, and Grant;
- new writes use the corrected model;
- UI copy distinguishes Actor, Agent, Mold, and Z surface;
- legacy references remain traceable in Receipts where useful.

## Work package E — durable local WebOS

Implement:

- IndexedDB for structured records and indexes;
- OPFS for actual Gummy bytes;
- stable IDs and hashes;
- Actor-owned projects/folders;
- import and export;
- versioned migrations;
- reload, browser restart, and return recovery;
- quota and storage errors;
- explicit quarantine state.

Gummy identity remains separate from byte location. OPFS is not arbitrary host filesystem access.

## Work package F — quarantine and burn proof

Use a harmless test file, not malware.

1. Import the file as a quarantined Gummy.
2. Show that it lacks native process, shell, package, device, and broad filesystem authority.
3. Display quarantine state in the UI.
4. Attempt native promotion without approval and prove denial.
5. Approve a bounded export into a harmless test destination and create a Receipt.
6. Create a disposable test workspace or session.
7. Reset/burn it.
8. Prove unapproved workspace state is removed while accepted result Gummies and Receipts remain.

Do not claim hardened containment beyond what the test actually proves.

## Work package G — one explicit Agent/native bridge

Implement the narrowest deny-by-default bridge required for the active journey.

Preferred sequence:

1. web-only broker/server Agent route;
2. localhost native bridge only when the native distro path is understood;
3. real native Agent binding after its capability interface is verified.

The request includes:

- Human sponsor ID;
- Actor ID and `@address`;
- Agent ID;
- Mold ID;
- Master Control ID;
- source Gummy ID and bounded content;
- requested task and capabilities;
- locality/privacy preference;
- output contract;
- cost ceiling.

The response includes:

- terminal status;
- Agent/provider/runtime identity;
- locality;
- result bytes/reference;
- usage and cost;
- failure/denial detail;
- evidence for a Receipt.

The bridge exposes no arbitrary shell or generic native control endpoint.

## Work package H — complete real journey

1. Start the existing AI-native Linux distribution.
2. Open Gummy OS inside it.
3. Open the local personal Actor.
4. Confirm the Z bar and expanded Z panel work.
5. Show `@address`, authoritative location, Agent, Mold, sync policy, and approval rules.
6. Import a real text or Markdown source Gummy.
7. Drag or attach it to Z.
8. Ask: “Turn this into a concise project brief. Preserve the original and create a new file.”
9. Master Control shows Actor, Agent, Mold, source access, result destination, locality, and requested bridge use.
10. Human approves or denies.
11. On approval, issue a bounded Grant and call the real Agent route.
12. Preserve the source bytes unchanged.
13. Create a result Gummy with stable identity, bytes, hash, provenance, and Links.
14. Create a Receipt naming Human, Actor, `@address`, Agent, Mold, Master Control, Grant, route, source, result, locality, cost, time, and outcome.
15. Revoke the Mold or Agent binding and prove future work is blocked.
16. Restore authorized state.
17. Close and return.
18. Confirm Actor state, Z conversation/task state selected for sync, Master Control, source, result, Links, and Receipt remain understandable.

## Work package I — playground composition proof

Only after the real journey passes, add one small non-authoritative composition experiment:

- open two local Actor surfaces;
- create an explicit Link;
- choose selected public/test Gummies from each;
- create a temporary shared canvas or Bowl;
- preserve source identities and provenance;
- do not merge private state;
- do not automatically mint a permanent new Actor or Mold;
- record what output type seems natural for a later product decision.

This tests the playground without prematurely freezing the universal composition model.

## Required tests

- native-distribution preflight evidence;
- Gummy OS shell inside distro;
- standalone browser regression;
- collapsed and expanded Z surface;
- Actor/Agent separation;
- Human sponsorship;
- Mold scope, expiry, and revocation;
- Agent assignment and removal;
- Master Control placement and sync policy;
- deterministic migration and idempotence;
- IndexedDB/OPFS persistence;
- source immutability and result hashing;
- Grant approval and denial;
- Agent success/failure/malformed response;
- no arbitrary native bridge;
- quarantine denial and approved promotion;
- burn/reset evidence;
- Receipt completeness;
- return continuity;
- temporary Actor composition without private-state merge.

## Acceptance commands

```bash
npm run verify
```

Add one end-to-end browser command and, when the local distro bridge exists, one integration command that proves the exact journey without requiring broad native privileges.

## Required Return

```text
Repository
Branch
Base SHA
Head SHA
Native distro local path
Native distro launch command
Native Agent/chat process
Gummy OS launch/origin
WebView/browser host
Z surface evidence
Human record
Actor record and @address
Agent record
Mold record
Master Control state
Migration behavior
Storage boundary
Quarantine state
Bridge contract
Commands run
Tests passed
Tests failed
Tests not run
Screenshots/artifacts
Source Gummy hash
Result Gummy hash
Example Grant
Example Receipt
Revocation proof
Quarantine/promotion proof
Burn/reset proof
Composition experiment result
Known limitations
What is proven
What is not proven
Recommended next action
```

Do not self-accept the Return.

## Definition of done

Personal Gummy OS is working when it runs inside the existing AI-native Linux distribution and independently in a normal browser; Z is globally available as a hybrid bar/panel; a Human opens a persistent Actor, authorizes a distinct Agent through a bounded Mold, creates a real result Gummy without changing the source, can revoke the relationship, receives a truthful Receipt, proves quarantined content lacks native authority, and returns later to the same understandable state.

After that proof, the next phase may bind the Actor to the real native Zeke Agent, expand live-USB deployment, activate selective synchronization, and prototype richer Actor composition.
