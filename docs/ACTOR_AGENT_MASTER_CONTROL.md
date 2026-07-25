# Actor, Agent, and Master Control

**Status:** Founder architecture ruling  
**Date:** 2026-07-25  
**Source:** Hayden's handwritten system drawing in the Chief of Command thread  
**Precedence:** This document corrects any narrower Actor or Mold definition elsewhere in the repository.

## The central realization

Gummy OS is not merely a social identity layer and an Actor is not merely a user record.

The architecture has two distinct execution faces:

```text
WEB / GUMMY OS                     NATIVE OS / GLYPHD OS
Actor                              Agent
addressable, openable              executable, local, device-capable
persistent web presence            persistent intelligence/runtime
```

A human may directly control either side. Master Control decides how they are connected, where state lives, what synchronizes, and which Agent may operate which Actor.

## Canonical architecture

```text
Human authority
      │
      ▼
Master Control
placement · synchronization · permission · revocation
      │
      ├─────────────── protocol / @address ───────────────┐
      │                                                   │
      ▼                                                   ▼
Web Actor                                             OS Agent
inside Gummy OS                                       inside AI-native Linux / Glyphd OS
openable anywhere                                     runs locally or on governed compute
persistent addressable state                         executes tools and controls resources
```

The Web Actor and OS Agent may work together, but they are not the same object.

## Gummy OS

Gummy OS is the **Web OS plane**.

It is the familiar computer a person can open through the web: desktop, windows, applications, files, browser, projects, Gummies, Bowls, Links, Receipts, and Actor surfaces.

Gummy OS is where Actors can be deployed, opened, shared, visited, or inhabited from nearly any compatible device.

Gummy OS is not itself the native Linux Agent and does not silently inherit host-machine authority.

## Glyphd OS and AI-native Linux

Glyphd OS is the **native execution and device-sovereignty plane**.

It may host Zeke or another Agent with access to explicitly granted local capabilities: compute, local files, devices, applications, peripherals, models, and protected runtimes.

An AI-native Linux Agent can deploy, operate, or synchronize one or more Actors into Gummy OS through the protocol.

The native Agent does not own the Actor merely because it runs the computation.

## Actor

An Actor is a **persistent, addressable computational entity expressed through the web**.

An Actor can represent or embody:

- a person;
- a public figure or celebrity;
- an AI-facing persona;
- a licensed character;
- an organization;
- a service;
- a project role;
- a world or persistent computational presence.

An Actor:

- has a stable protocol identity and `@address`;
- may be opened from any compatible web device;
- carries state, permissions, memory, relationships, Gummies, and provenance;
- may be directly controlled by a human;
- may be operated by an authorized Agent;
- may move or synchronize between web and native environments according to Master Control;
- remains the same Actor even when its execution location changes.

**Actor is not synonymous with a human, account, model, process, or profile.** It is the persistent computational entity through which those participants act in the shared system.

## Agent

An Agent is an **executable intelligence or operating process**.

An Agent may run:

- locally inside Glyphd OS;
- inside another AI-native Linux distribution;
- in a trusted server environment;
- in a governed cloud runtime;
- in a bounded browser or Wasm runtime where capability permits.

An Agent:

- plans and executes work;
- uses tools and applications;
- controls only explicitly granted resources;
- may deploy or operate Actors;
- may synchronize Actor state;
- must identify itself in Receipts;
- does not become the Actor merely because it speaks or acts through it.

Zeke is the primary first-party example of an Agent operating inside Glyphd OS.

## Mold

A Mold is more than a visual profile.

A Mold is the **permissioned embodiment and reusable Actor definition** through which a human or Agent may open, instantiate, represent, or operate an Actor.

A Mold can specify:

- which Actor it applies to;
- who may use it;
- whether the operator is a human or Agent;
- visual and behavioral representation;
- role and context;
- permitted capabilities;
- allowed execution locations;
- synchronization policy;
- duration and revocation;
- identity, organization, character, celebrity, or licensing proofs;
- disclosure requirements;
- what state may be read, changed, or published.

Examples:

- Hayden opens his own Actor through his personal Mold.
- An authorized assistant Agent operates Hayden's Actor through a limited work Mold.
- A celebrity's team operates an official Actor through an organization-approved Mold.
- A licensed character Actor is performed by an Agent through a character Mold.
- A guest opens another Actor only through a temporary invitation Mold.

**A Mold does not independently act. It is the permissioned form and operating contract by which an Actor can be inhabited or controlled.**

## Master Control

Master Control is the human-controlled authority layer that decides:

- whether an Actor is web-only, local-only, or synchronized;
- which device, OS, server, or runtime currently holds authoritative state;
- which Agent may operate an Actor;
- which Mold the operator must use;
- which data may synchronize;
- which direction synchronization may flow;
- whether actions require approval;
- how authority is revoked;
- what evidence and Receipts must be retained.

Master Control prevents synchronization from becoming ambient replication or invisible platform ownership.

## Protocol and @addresses

Every Actor receives a stable protocol address, expressed in human-facing form as an `@address`.

The address is used for:

- identity resolution;
- routing;
- opening the Actor;
- invitations;
- permissions;
- Agent bindings;
- synchronization;
- messaging;
- Bowl membership;
- Gummy ownership and provenance;
- revocation and discovery.

The protocol connects Actors and Agents without forcing every Actor to live on one server or every Agent to use one model provider.

## Runtime stack from the drawing

```text
Physical device and human input
        ↓
Reality / device layer
        ↓
Network and protocol layer
        ↓
AI-native Linux distribution / Glyphd OS
        ↓
Agent runtime
        ↓ protocol, Mold, and Master Control
Gummy OS / Web OS
        ↓
Addressable Actor and its Gummies
```

The layers may be distributed across devices and networks. The user experiences one coherent computer and one persistent Actor.

## Corrected vocabulary

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
Gummy OS = Web OS where Actors are opened and deployed
Glyphd OS = native AI execution and device-sovereignty environment
@address = stable protocol identity and route for an Actor
Gummy = an object an Actor creates, owns, receives, or operates
Bowl = a shared environment
Link = an explicit relationship
Grab = independent derivation preserving source provenance
```

## Immediate implementation boundary

The first Personal Gummy OS milestone remains intentionally small:

```text
human opens personal Actor in Gummy OS
→ imports a real source Gummy
→ authorizes an Agent through a bounded Mold
→ Agent transforms the source without altering it
→ result Gummy returns
→ Actor, Agent, Mold, Grant, route, and result appear in the Receipt
→ state survives return visits
```

Cursor must not reduce this to a profile rename, nor attempt the entire distributed Linux/Web synchronization system in the first build.

The first build proves the object boundaries locally. Later phases connect a Gummy OS Actor to a native Glyphd OS Agent through Master Control and the protocol.
