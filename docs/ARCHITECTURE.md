# Gummy OS Architecture

## Architectural thesis

Gummy OS is the browser-delivered **Web OS plane** where persistent, addressable Actors are opened and experienced.

Glyphd OS is the native AI execution and device-sovereignty plane where Agents such as Zeke may run.

Master Control connects those planes and keeps Human authority above both.

```text
Human authority
      │
      ▼
Master Control
placement · sync · permission · revocation
      │
      ├──────────── protocol / @address ────────────┐
      │                                              │
      ▼                                              ▼
Actor in Gummy OS                               Agent in Glyphd OS
persistent web entity                          executable intelligence
```

The Actor and Agent can produce one coherent experience without becoming the same object.

## Core entities

### Human

The ultimate personal authority. A Human may directly control an Actor, authorize an Agent, choose a Mold, approve synchronization, and revoke access.

### Actor

A persistent, addressable computational entity expressed through the web and shared protocol.

An Actor has:

- stable ID and `@address`;
- state and memory references;
- Gummies;
- Molds;
- Agent bindings;
- Links and Bowl membership;
- deployment location;
- synchronization policy;
- provenance and Receipts.

An Actor may embody a person, public figure, character, organization, service, project role, world, or other persistent presence.

### Agent

An executable intelligence or operating process.

An Agent has:

- stable ID;
- runtime and locality;
- provider/model disclosure;
- capability ceiling;
- Human authority references;
- Actor bindings;
- Mold bindings;
- status and version;
- evidence and Receipt obligations.

Zeke is the primary first-party native Agent example.

### Mold

A permissioned embodiment and operating contract for one Actor.

A Mold defines:

- which Humans or Agents may use it;
- representation and role;
- capability scope;
- read/write/publish scope;
- runtime and locality rules;
- synchronization policy;
- proof and licensing requirements;
- disclosure;
- issue, expiry, and revocation.

### Master Control

The Human-controlled authority record and interface that decides:

- authoritative location;
- web/local/hybrid placement;
- active Agent;
- active Mold;
- allowed data flow;
- synchronization direction and frequency;
- approval requirements;
- revocation and lock state.

### Gummy

An object an Actor creates, owns, receives, shares, or operates: file, note, project, conversation, application, workflow, result, or artifact.

### Bowl, Link, and Grab

Bowls are shared environments. Links are explicit relationships. Grabs create independent Gummies while preserving source provenance.

## Product modes

### 1. Personal Gummy OS

The first active product mode:

- browser-native desktop;
- personal Actor;
- local Master Control;
- one bounded Agent route;
- permissioned Mold;
- local Gummies and Receipts;
- durable return continuity.

### 2. Gummy OS Social Layer

Later:

- public and private Actors;
- verified Molds;
- Bowls;
- social Links;
- Grabs;
- invitations;
- provenance and audience controls;
- public-figure and licensed-character structures.

### 3. Native Agent Bridge

Later:

- Actor in Gummy OS;
- Agent in Glyphd OS;
- protocol binding through `@address`;
- Master Control placement and synchronization;
- local-device capabilities;
- native applications and protected resources.

### 4. Enterprise Habitat

Later:

- organization-controlled Humans, Actors, Agents, and Molds;
- policy overlays;
- Application Pack registries;
- model and connector brokers;
- runtime pools;
- audit, retention, deployment, and revocation.

## Architecture planes

### Experience Plane

- desktop and window manager;
- dock and launcher;
- Gummy Browser;
- Actor surface;
- Agent surface;
- Mold surface;
- Master Control;
- My Gummies;
- Bowls, Links, Grabs;
- approvals and Receipts.

The Experience Plane remains useful before any native Agent or external model starts.

### Authority Plane

The security kernel:

- Human authority;
- Master Control;
- Molds;
- Capability Grants;
- approval rules;
- revocation;
- data-flow and sync policy.

No prompt creates authority.

### Actor and Object Plane

Stores:

- Actors and `@addresses`;
- Gummies and bytes;
- Bowls;
- Links;
- Grab lineage;
- ownership, audience, rights, revisions, and provenance.

### Agent Plane

Owns:

- Agent identities;
- model adapters;
- routing;
- planning;
- tool and application selection;
- execution;
- recovery;
- cost and locality disclosure;
- native Glyphd OS binding later.

**An Agent is not an Actor class.**

### Runtime Plane

```text
web-native → browser/Wasm → Linux-native → governed server/cloud
```

Gummy OS chooses the least-authoritative compatible runtime under Master Control and Mold policy.

### Protocol Plane

Provides:

- stable `@address` resolution;
- Actor discovery and opening;
- Agent binding;
- permission exchange;
- synchronization;
- messaging;
- Bowl invitations;
- Gummy routing;
- Receipt and revocation signals;
- compatibility negotiation.

### Enterprise and Federation Plane

Adds organization policy, trusted registries, signed object exchange, independent editions, deployment modes, and cross-domain trust without changing the core Human/Actor/Agent/Mold separation.

## Runtime stack from the founder drawing

```text
Physical device and Human input
        ↓
Reality / device layer
        ↓
Network and protocol layer
        ↓
AI-native Linux distribution / Glyphd OS
        ↓
Agent runtime
        ↓ Mold + Grant + Master Control
Gummy OS / Web OS
        ↓
Addressable Actor and owned Gummies
```

The layers may be distributed. The user experiences one coherent computer.

## Trust boundaries

```text
Physical device / host OS
        │
        ├── Human input and hardware authority
        │
Glyphd OS / governed native runtime
        │ Agent capabilities
        │
Protocol + Master Control
        │ Mold + Grant + sync policy
        │
Gummy OS trusted origin
        │ Actor and Gummy state
        │
External sites, services, Bowls, and applications
```

The host remains outside Gummy OS authority unless an explicit native Agent capability crosses the boundary.

## Data architecture

### Personal local state

- Human authority record;
- Actor record and provisional `@address`;
- Agent record;
- Mold contracts;
- Master Control record;
- Gummy metadata in IndexedDB;
- Gummy bytes in OPFS;
- Links, Grants, and Receipts;
- deterministic legacy migration state.

### Authoritative state

Every Actor declares an authoritative location. Master Control—not sign-in state—decides whether other locations are mirrors, caches, approved replicas, or active peers.

### Synchronization

Future synchronization is selective and explicit:

- data classes are allowlisted;
- direction is visible;
- approval is configurable;
- conflicts preserve evidence;
- revocation blocks future flow;
- sync never silently expands Agent authority.

## Application Pack architecture

An Application Pack teaches an authorized Agent how to operate one application through the highest-reliability available interface:

1. typed application capability;
2. vendor API or MCP tool;
3. semantic command;
4. accessibility-tree interaction;
5. visual GUI interaction;
6. coordinate interaction as last resort.

The Pack does not grant authority. Mold, Master Control, policy, and Grants do.

## Legacy migration

The current scaffold contains Snack, Drop, Fork, demo companion, and Actor-as-account assumptions.

Cursor must migrate them into:

```text
legacy Snack
→ Human authority + Actor + Mold

legacy companion/model
→ Agent

legacy file/drop
→ Gummy

legacy fork
→ Grab + grab-of Link
```

Migration must be deterministic, idempotent, and non-destructive.

## Architecture invariants

- Human authority remains above Actor and Agent.
- Actor and Agent are distinct.
- Actor has a stable address independent of execution location.
- Mold is an operating contract, not merely presentation.
- Master Control makes placement and synchronization explicit.
- Gummy OS remains useful without Glyphd OS.
- Glyphd OS may enhance an Actor without owning it.
- No model, Agent, application, or synchronized device receives ambient authority.
- Every consequential action is receiptable.
- Every provider and runtime is replaceable.
- Every Grab preserves source provenance.
- Personal Gummy OS works before broad social, enterprise, native bridge, or federation expansion.
