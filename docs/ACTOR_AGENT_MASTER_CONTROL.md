# Actor, Agent, and Master Control

**Status:** Founder architecture ruling  
**Date:** 2026-07-25  
**Precedence:** This document corrects narrower identity or runtime definitions elsewhere.

## Core realization

Gummy OS has distinct persistent and executable sides:

```text
GUMMY OS / WEB                      EXECUTION RUNTIMES
Actor                               Agent
addressable and openable            executable and replaceable
persistent state                    performs bounded work
```

A Human may directly control an Actor or authorize an Agent to operate it. Master Control decides connection, placement, data flow, approval, and revocation.

## Architecture

```text
Human authority
      │
      ▼
Master Control
placement · synchronization · permission · revocation
      │
      ├──────────── protocol / @address ────────────┐
      │                                              │
      ▼                                              ▼
Actor in Gummy OS                               Agent executor
Gummy Canvas + Gummy Bar                       web, cloud, native, phone
persistent addressable state                  tools, models, devices
```

Actor and Agent may produce one continuous experience, but are never the same object.

## Gummy OS

Gummy OS is the WebOS plane.

- **Gummy Canvas** is the open working and creation surface.
- **Gummy Bar** is the persistent candy-store system bar.
- **Glopper** is a special companion candy in the Bar.
- **Glopper Panel** is the expanded conversation/control interface.

Actors can be opened, visited, operated, shared, or composed from compatible devices. Gummy OS does not silently inherit host-machine authority.

## Actor

An Actor is a persistent addressable computational entity expressed through the web.

It may embody a person, public figure, character, organization, service, project role, world, or other persistent presence.

An Actor:

- has a stable ID and `@address`;
- carries state, memory, permissions, Gummies, Links, and provenance;
- may be opened from compatible devices;
- may be controlled directly by a Human;
- may be operated by an authorized Agent;
- remains the same Actor when device, runtime, or Agent changes.

Actor is not synonymous with Human, account, profile, model, or process.

## Agent

An Agent is executable intelligence or an operating process.

It may run in a browser/server route, cloud runtime, native Linux environment, future phone runtime, or another governed environment.

An Agent:

- plans and executes work;
- uses tools and applications;
- controls only granted resources;
- may operate Actors;
- may synchronize approved Actor state;
- owns a task lease while executing;
- identifies itself and its locality in Receipts;
- does not become the Actor it operates.

## Glopper Agent family

Glopper is the first-party companion identity.

```text
agent:glopper-web
agent:glopper-cloud
agent:glopper-native
agent:glopper-phone
```

These executors may share one character and Human-approved portable preferences. They retain separate identity, locality, capabilities, task leases, private-memory boundaries, and Receipts.

`bohselecta/glopper` is the existing local-first process-director application and the first substantial native Glopper lineage.

## Mold

A Mold is the permissioned embodiment and operating contract through which a Human or Agent may open, represent, instantiate, or operate an Actor.

It may specify:

- Actor;
- allowed Human and Agent operators;
- representation and behavior;
- role and context;
- capabilities and data scopes;
- runtime/locality;
- synchronization policy;
- proof/license/disclosure;
- issue, expiry, and revocation.

A Mold does not independently act.

## Master Control

Master Control decides:

- authoritative state location;
- assigned Agent;
- active Mold;
- task lease;
- allowed data classes;
- synchronization mode and direction;
- approval rules;
- revocation and lock state;
- evidence retention.

Sign-in or connectivity never substitutes for Master Control.

## @addresses

Every Actor receives a stable human-facing protocol address.

An `@address` supports resolution, opening, messaging, invitations, Agent binding, Bowl membership, Gummy ownership/provenance, synchronization routing, and revocation.

An address never grants control by itself.

## Native layer

The already-built AI-native Linux distribution is a future integration target, not a dependency for standalone Gummy OS.

After the browser proof passes, it may host `agent:glopper-native` with explicitly granted directories, IDEs, processes, local models, devices, and protected capabilities.

The native Agent does not own the Actor because it runs computation.

## Runtime stack

```text
Physical device / host security
        ↓
optional native AI Linux and local Agent
        ↓ explicit Bridge + Master Control + Mold + Grant
Gummy OS
        ↓
Gummy Canvas + Gummy Bar + addressable Actors + Gummies
```

Gummy OS can also run without the native layer.

## Immediate boundary

```text
Human opens personal Actor
→ uses Gummy Canvas and Gummy Bar
→ opens Glopper Panel
→ authorizes agent:glopper-web through bounded Mold
→ Glopper transforms source Gummy without altering it
→ result Gummy + complete Receipt
→ revoke Agent/Mold and prove blocked
→ state survives return
```

Native Glopper integration happens only after this standalone proof.
