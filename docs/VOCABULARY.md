# Gummy OS Canonical Vocabulary

**Status:** Founder-corrected specification target  
**Date:** 2026-07-25  
**Implementation state:** Current scaffold and Protocol 0.2 schemas require revision in Cursor

Read `ACTOR_AGENT_MASTER_CONTROL.md` first. It is the authoritative architecture ruling behind these definitions.

## The complete mental model

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = where authority, placement, and synchronization are decided
Gummy OS = the Web OS where Actors are opened and deployed
Glyphd OS = the native AI execution and device-sovereignty environment
@address = the stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how protocol objects relate
Grab = how a Gummy becomes independent without altering its source
```

## Human

A Human is the ultimate personal authority behind one or more Actors and Agents.

A Human may:

- directly open and control an Actor;
- authorize an Agent;
- choose a Mold;
- decide what synchronizes;
- approve or deny consequential work;
- revoke access through Master Control.

A Human is not automatically identical to an Actor record. The same Human may operate multiple Actors in different roles and contexts.

## Actor

An **Actor** is a persistent, addressable computational entity expressed through the web and shared protocol.

An Actor may embody a person, celebrity, character, organization, project role, service, world, or other persistent presence.

An Actor:

- has a stable `@address`;
- can be opened through Gummy OS from a compatible device;
- owns or operates Gummies;
- joins Bowls and creates Links;
- carries state, memory, permissions, relationships, and provenance;
- may be directly controlled by a Human;
- may be operated by an authorized Agent;
- may synchronize between web and native execution environments;
- remains the same Actor when its location or operator changes.

**Invariant:** Actor is not merely an account, profile, human, model, or operating-system process.

## Agent

An **Agent** is an executable intelligence or operating process.

An Agent may run locally inside Glyphd OS, another AI-native Linux environment, a governed server, a cloud runtime, or a bounded browser/Wasm runtime.

An Agent:

- plans and executes work;
- uses tools and applications;
- accesses only granted resources;
- may deploy or operate Actors;
- may synchronize Actor state under Master Control;
- identifies itself in Action Receipts;
- never becomes the Actor merely because it acts through it.

Zeke is the primary first-party example of a native Agent.

## Mold

A **Mold** is the permissioned embodiment and reusable Actor definition through which a Human or Agent may open, instantiate, represent, or operate an Actor.

A Mold may specify:

- Actor identity;
- authorized Human or Agent operators;
- visual and behavioral presentation;
- role and context;
- permitted capabilities;
- allowed runtime and device locations;
- synchronization policy;
- disclosure requirements;
- identity, organization, celebrity, character, or license proofs;
- duration, expiry, and revocation;
- which state may be read, changed, or published.

A Mold may be personal, professional, temporary, delegated, official, character-bound, or organization-controlled.

**Invariant:** a Mold does not independently act. It is the permissioned form and operating contract for the Actor.

## Master Control

**Master Control** is the human-controlled authority layer that decides:

- where an Actor runs;
- which copy of state is authoritative;
- what synchronizes between web and OS;
- which Agent may operate an Actor;
- which Mold is required;
- what approval is needed;
- what may leave the device;
- how access is revoked;
- what evidence must be retained.

Master Control prevents sync from becoming ambient replication or invisible platform ownership.

## Gummy OS

**Gummy OS** is the Web OS plane: the familiar computer that can be opened through the browser.

It contains desktops, windows, applications, files, Gummies, Bowls, Links, Receipts, and Actor surfaces.

Actors can be deployed and opened there. Gummy OS does not silently inherit host-machine authority.

## Glyphd OS

**Glyphd OS** is the native AI execution and device-sovereignty plane.

It may host Zeke or another Agent with explicit access to local compute, files, models, devices, applications, and protected runtimes.

A native Agent may deploy or synchronize Actors into Gummy OS through the protocol.

## @address

An **@address** is the stable human-facing protocol identity and route for an Actor.

It supports identity resolution, opening, messaging, invitations, permission, synchronization, Agent binding, Bowl membership, Gummy ownership, provenance, and revocation.

## Gummy

A **Gummy** is anything an Actor creates, owns, keeps, receives, shares, or operates.

Examples include notes, files, images, videos, projects, conversations, applications, workflows, invitations, generated results, and verified artifacts.

A Gummy may carry owner Actor, creator Actor, operating Agent, Mold, audience, provenance, revision history, rights, capabilities, hashes, and Links.

## Bowl

A **Bowl** is a shared environment in which Actors and Gummies gather under explicit membership, roles, visibility, and rules.

## Link

A **Link** is an intentional, inspectable relationship between protocol objects.

Examples include represented-by, operated-by-agent, controlled-by-human, deployed-to, synchronized-with, member-of, created-by, delegates-to, shared-with, derived-from, grab-of, and approved-by.

## Grab

A **Grab** creates an independent Gummy from an existing Gummy while preserving provenance, source identity, applicable rights, and a `grab-of` Link. The source is never changed.

## Natural language examples

Correct:

- “Open the Actor at `@hayden`.”
- “Hayden is controlling this Actor directly.”
- “Zeke is the Agent operating the Actor through a work Mold.”
- “Master Control keeps this Actor local-only.”
- “Sync this Actor's approved Gummies to Gummy OS.”
- “Which Actor owns this Gummy?”
- “Which Agent performed the work?”
- “Which Mold authorized that operation?”
- “Grab this Gummy without changing the source.”

Incorrect:

- “The Mold created this.”
- “The profile is the Actor.”
- “The Agent and Actor are the same thing.”
- “Opening the Actor grants control automatically.”
- “Sync everything because the account is signed in.”

## Protocol migration consequence

The earlier Protocol 0.2 draft correctly separated Mold from Actor, but still made Actor too similar to an acting account and treated Agent as an Actor class.

Cursor must correct that model:

- Actor becomes the persistent addressable web entity;
- Agent becomes a separate executable object;
- Human authority is represented separately from Actor execution;
- Mold expands into a permissioned embodiment and operating contract;
- Master Control governs placement and synchronization;
- Actor records gain stable `@address`, deployment, Agent-binding, and sync state;
- Receipts identify Human sponsor, Actor, Agent, Mold, Grant, source, and result;
- no existing local data is silently discarded.

The initial build still proves one local Personal Gummy OS loop before implementing distributed Glyphd OS ↔ Gummy OS synchronization.
