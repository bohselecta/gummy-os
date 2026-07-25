# Personal Gummy OS — Cursor Production Work Order

**Date:** 2026-07-25  
**Repository:** `bohselecta/gummy-os`  
**Authority:** Hayden's accepted handwritten Actor/Agent architecture in the Chief of Command thread  
**Active lane:** Personal Gummy OS  
**Target:** one dependable computer-within-a-computer loop with the correct future boundaries

## Mission

Finish the new July 24, 2026 Gummy OS—not any older repository that reused the Gummy name.

Gummy OS is the Web OS where persistent addressable Actors are opened. Glyphd OS is the future native execution environment where Agents such as Zeke may run. Master Control connects those planes and decides placement, synchronization, authority, and revocation.

The first Cursor build proves these boundaries locally. It does **not** implement the complete distributed Glyphd OS ↔ Gummy OS system.

## Read before changing code

1. `README.md`
2. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
3. `docs/VOCABULARY.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PROTOCOL.md`
7. `docs/SECURITY_MODEL.md`
8. `docs/ROADMAP.md`
9. `docs/BUILD_RUNBOOK.md`
10. `AGENTS.md`
11. current source and tests

## Corrected canonical model

```text
Human = ultimate personal authority
Actor = persistent addressable entity in Gummy OS / the web
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = where placement, synchronization, and authority are decided
@address = stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
```

The earlier draft made Actor too similar to an account and treated Agent as an Actor class. Do not implement that model.

## Absolute exclusions

Do not:

- inspect or import the old `gummy`, `gummy2`, `mygummy`, or `my-gummy` repositories;
- collapse Actor and Agent into one object;
- model Mold as only a profile or avatar;
- redesign the shell before proving the core loop;
- implement full native Glyphd OS integration, cross-device sync, public `@address` discovery, remote social accounts, celebrity/character systems, federation, enterprise administration, BrowserPod, CheerpX, Linux capsules, or multiple model providers;
- make Glyphd Desktop, `glyphd.com`, or Zeke a dependency;
- expose provider credentials to browser JavaScript;
- provide arbitrary host filesystem or shell authority;
- overwrite the source Gummy;
- call the work complete because a UI demonstration looks finished.

## Baseline

Before implementation:

1. record exact `main` SHA;
2. run `npm run verify`;
3. run the current app;
4. capture the existing shell and serialized state;
5. identify every place where Snack, Actor, Agent, Mold, Drop, Gummy, Fork, Grab, capability, and Receipt semantics appear;
6. identify every schema that treats Agent as an Actor class or Mold as a display profile;
7. write the migration plan before changing stored data.

## Work package A — Correct the object model

Implement distinct typed objects for:

### Human authority

A local personal principal record sufficient to sponsor an Actor and authorize an Agent. Do not attempt production identity verification in this lane.

### Actor

A persistent web-openable entity with:

- stable Actor ID;
- local provisional `@address`;
- display name and kind;
- owned Gummies;
- state and memory references;
- Mold references;
- Agent binding references;
- deployment state;
- local sync policy placeholder;
- legacy identity references.

### Agent

A separate executable entity with:

- stable Agent ID;
- provider/runtime class;
- version;
- locality;
- owner or operator;
- capability ceiling;
- current status;
- Actor bindings;
- disclosure information.

The first real Agent may be the trusted broker adapter. Label it honestly. Do not claim it is Zeke or a native Glyphd OS Agent.

### Mold

A permissioned embodiment and operating contract containing:

- Actor ID;
- allowed Human and/or Agent operators;
- representation fields;
- role and context;
- capability ceiling;
- permitted data access;
- permitted result locations;
- allowed runtime/locality;
- sync policy;
- disclosure;
- issue, expiry, and revocation state.

### Master Control

A local personal control record/UI sufficient to show and decide:

- Actor location: local web instance for this phase;
- authoritative state location;
- assigned Agent;
- active Mold;
- allowed data flow;
- approval requirements;
- revocation.

Do not build cloud synchronization. Prove that placement and sync policy are explicit rather than ambient.

## Work package B — Protocol migration

Migrate legacy state deterministically and idempotently.

```text
snack:hayden
→ human:hayden
→ actor:hayden
→ mold:hayden:personal

legacy demo companion/model
→ agent:personal-broker

drop/file objects
→ gummy objects

fork-of
→ grab record + grab-of Link
```

Requirements:

- no duplicates on repeated migration;
- old state remains readable until parity is verified;
- Actor and Agent never share an ID or type;
- authority moves through Human sponsorship, Agent assignment, Mold, and Grant;
- new writes use the corrected model;
- current UI copy distinguishes Actor, Agent, and Mold;
- Receipts preserve legacy references where useful.

## Work package C — durable local computer

Replace metadata-only/localStorage proof state with:

- IndexedDB for structured records and indexes;
- OPFS for actual source and result bytes;
- stable IDs and content hashes;
- Actor-owned project/folder membership;
- import and export;
- versioned migrations;
- reload, browser restart, and return recovery;
- bounded storage and quota errors.

Gummy identity must remain separate from byte location. The browser must not expose arbitrary host-filesystem authority.

## Work package D — one trusted Agent route

Implement one provider-neutral Agent/broker contract.

Browser request includes:

- Human sponsor ID;
- Actor ID and `@address`;
- Agent ID;
- Mold ID;
- source Gummy ID and bounded content;
- requested task;
- requested capabilities;
- privacy/locality preference;
- output contract;
- cost ceiling.

Response includes:

- terminal status;
- Agent/provider/runtime identity;
- locality;
- result bytes or explicit result reference;
- usage and cost;
- failure/denial detail;
- evidence suitable for an Action Receipt.

Only one real route is required. Preserve the demo adapter as an explicitly labeled offline simulation, not proof of real Agent execution.

## Work package E — real Actor-to-Agent journey

Build this exact path:

1. Open Gummy OS.
2. Open the local personal Actor.
3. Show the Actor's provisional `@address`, current location, Agent assignment, active Mold, and sync policy.
4. Import a real text or Markdown file as a source Gummy owned by the Actor.
5. Drag the source Gummy to the companion/work surface.
6. Ask: “Turn this into a concise project brief. Preserve the original and create a new file.”
7. Master Control shows the proposed Actor, Agent, Mold, source access, result destination, locality, and approval requirement.
8. Human approves or denies.
9. On approval, issue a bounded Grant and call the real Agent route.
10. Preserve the source unchanged.
11. Create a result Gummy with stable identity, bytes, hash, provenance, and Links.
12. Create an Action Receipt naming Human sponsor, Actor, `@address`, Agent, Mold, Grant, route, source, result, locality, cost, time, and outcome.
13. Open the result.
14. Revoke the Mold or Agent binding and prove future work is blocked.
15. Restore an authorized binding.
16. Close and return.
17. Confirm Actor state, Master Control decisions, source, result, Links, and Receipt remain present and understandable.

Denial, revoked Mold, unassigned Agent, malformed response, Agent failure, cancellation, storage failure, and quota failure must produce truthful terminal states.

## Work package F — shell finish

Only after the core journey passes:

- installable PWA;
- truthful offline shell behavior;
- polished full-screen entry;
- accessibility and keyboard operation;
- responsive desktop and mobile-browser pass;
- clear Actor/Agent/Mold/location/sync/cost indicators;
- no unnecessary redesign of the desktop grammar.

## Required tests

At minimum:

- legacy migration;
- migration idempotence;
- Actor/Agent type separation;
- Human sponsorship;
- Mold permission scope;
- Mold expiry and revocation;
- Agent assignment and removal;
- local Master Control placement/sync policy;
- Gummy byte persistence;
- source immutability;
- result hashing;
- Grant approval and denial;
- Agent success, failure, and malformed response;
- Receipt completeness;
- return continuity;
- shell/window/browser regression.

## Acceptance command

```bash
npm run verify
```

Add an end-to-end browser command proving the exact journey.

## Required Return

```text
Repository
Branch
Base SHA
Head SHA
Files changed
Migration behavior
Actor record
Agent record
Mold record
Master Control state
Provisional @address
Storage boundary
Agent/broker boundary
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
Known limitations
What is proven
What is not proven
Recommended next action
```

Do not self-accept the Return.

## Definition of done

Personal Gummy OS is working when a Human opens a persistent Actor, explicitly authorizes a distinct Agent through a bounded Mold, creates a real result Gummy without changing the source, can revoke that operating relationship, receives a truthful Receipt, and returns later to the same understandable state.

After that, the next phase may connect the Actor to a native Zeke Agent inside Glyphd OS through real Master Control synchronization. That distributed step is not required now.
