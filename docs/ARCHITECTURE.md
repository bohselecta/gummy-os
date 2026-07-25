# Gummy OS Architecture

## Thesis

Gummy OS is the universal browser-delivered platform.

- **Gummy Canvas** is the open working/creation surface.
- **Gummy Bar** is the persistent candy-store system bar.
- **Glopper** is the first-party companion character and Agent family.
- **Glopper Panel** is the expanded conversation/control interface.

The architecture separates persistent presence from execution:

```text
Human authority
      │
      ▼
Master Control
placement · sync · assignment · approval · revocation
      │
      ├──────── protocol / @address ────────┐
      │                                      │
      ▼                                      ▼
Actor in Gummy OS                       Agent executor
persistent state                       web/cloud/native/phone
Gummy Canvas + Bar                     tools/models/devices
```

Actor and Agent never collapse.

## Core entities

### Human

Ultimate personal authority. Controls Master Control, Molds, approval, and revocation.

### Actor

Persistent addressable WebOS entity with ID, `@address`, state/memory refs, Gummies, Molds, Agent bindings, Links/Bowls, deployment, authoritative location, sync policy, provenance, and Receipts.

### Agent

Executable intelligence/process with ID, provider/model/runtime, locality, operator, capability ceiling, task lease, Actor/Mold bindings, status, disclosure, and Receipt obligations.

### Glopper Agent family

```text
agent:glopper-web
agent:glopper-cloud
agent:glopper-native
agent:glopper-phone
```

Shared character does not create shared authority. Executors remain separately routed and receipted.

### Mold

Permissioned Actor operating contract specifying operators, representation, role, capabilities, data scopes, runtime/locality, synchronization, proof/license/disclosure, expiry, and revocation.

### Master Control

Human-controlled record/interface for authoritative location, Agent assignment, Mold, task lease, data flow, synchronization, approval, revocation, and locks.

### Gummy

Actor-owned or operated object: file, note, image, video, project, conversation, app, workflow, invitation, result, or artifact.

### Bowl, Link, Grab

Bowl is a shared environment. Link is an explicit relationship. Grab creates an independent Gummy with source provenance.

## Experience plane

### Gummy Canvas

Supports windows, Actor surfaces, Gummies, applications, mini-apps, worlds, generated surfaces, selection, drag/drop, and compositions.

### Gummy Bar

A candy-store system surface with visual items referencing underlying objects.

A Bar item may show:

- object kind/ID;
- candy icon/asset;
- pinned/open/selected state;
- task, approval, attention, error, and offline badges;
- ordering/grouping;
- accessibility labels.

Candy presentation has no independent authority.

### Glopper Panel

Expanded from Glopper's candy. Shows conversation, context, Human, Actor, Agent, Mold, Master Control, task lease, Grants, progress, results, Receipts, denial, errors, and revocation.

### Mini-apps

Optional interfaces—including the hexagonal interface—run inside Gummy OS without becoming mandatory shell primitives.

## Authority plane

Contains Human authority, Master Control, Molds, Capability Grants, task leases, approval rules, revocation, and data-flow/sync policy.

No prompt, candy icon, sign-in, model selection, or network connection creates authority.

## Actor/object plane

Stores Actors/`@addresses`, Gummies/bytes, Bowls, Links, Grabs, ownership, audience, rights, revision, provenance, quarantine, and project membership.

## Agent plane

Owns Agent identities, routing, planning, model adapters, tool/application selection, execution, recovery, cost/locality disclosure, task leases, and later native bridge adapters.

### Routing

Selects executor from data location, capability, privacy, availability, cost, latency, lease ownership, and Master Control/Mold policy.

### Executor collision prevention

Every task records Actor, repository/object scope, authoritative location, base state, executor, lease, branch/worktree where applicable, capabilities, expected Return, and expiry.

Web and native Glopper do not edit the same authoritative work simultaneously without an explicit parallel/integration plan.

## Data architecture

### Structured state

IndexedDB or equivalent stores Human, Actor, Agent, Mold, Master Control, Gummies metadata, Links, Grants, Receipts, Bar presentation state, task leases, preferences, and migrations.

### Bytes

OPFS or equivalent stores real Gummy bytes. Identity is separate from byte location.

### Adaptation

```text
private local memory
approved portable profile
current task context
```

Private memory never syncs automatically. The Human approves portable updates.

### Authoritative state

Every Actor/object/task identifies its authoritative location. Other copies are caches, mirrors, approved replicas, or peers only as Master Control declares.

## Runtime plane

```text
browser-native → governed server/cloud → native Linux → future phone/on-device
```

The first standalone build uses browser/server execution. Native integration is later.

## Native bridge

After standalone acceptance, the existing AI-native Linux distro may host `agent:glopper-native`.

The bridge is deny-by-default, capability-specific, auditable, revocable, and never a generic shell/filesystem/device API.

Potential explicit capabilities include scoped directory read/write, IDE/repo task, command execution from an allowlisted work order, local model inference, device interaction, and security telemetry.

## Quarantine plane

Untrusted content enters as a quarantined Gummy.

It receives no native process, package, shell, broad filesystem, or device authority. Promotion requires inspection/classification, explicit destination, Human/policy approval, bounded Grant, Bridge identity, and Receipt.

Disposable workspaces can be burned while accepted results/evidence survive.

## Protocol plane

Provides `@address` resolution, Actor opening, messaging, invitations, Agent binding, permissions, task delegation, synchronization, Bowl/Link/Gummy routing, Receipts, revocation signals, and compatibility negotiation.

## Application Pack architecture

A Pack teaches an authorized Agent how to operate an application through the highest-reliability interface:

1. typed capability;
2. vendor API/MCP/tool;
3. semantic command;
4. accessibility tree;
5. visual GUI;
6. coordinates as last resort.

Pack knowledge never grants authority.

## Recursive composition

Humans, Actors, and Agents may create Actors, Agents, Gummies, Molds, tools, apps, worlds, and shared surfaces.

Creation never implies inherited authority. Every child receives identity, provenance, capability ceiling, operator disclosure, Mold/Master Control relationship, task ownership, and revocation.

Composition may produce a temporary Canvas, Bowl, Gummy, Mold, app, or Actor. The protocol preserves sources and lets product evidence determine the useful type.

## Legacy migration

```text
Snack → Human + Actor + Mold
personal-broker / Z / Zeke / demo companion → agent:glopper-web + Glopper presentation
dock → Gummy Bar presentation
Drop/file → Gummy
Fork → Grab + grab-of Link
```

Migration is deterministic, idempotent, traceable, and non-destructive.

## Architecture invariants

- Gummy OS is the platform on every device.
- Gummy Canvas is open-ended.
- Gummy Bar is presentation, not authority.
- Glopper is one companion with separately governed executors.
- Human authority remains above Actor and Agent.
- Actor and Agent remain distinct.
- Mold is an operating contract.
- Master Control makes placement/sync/assignment explicit.
- No ambient authority or synchronization.
- Every consequential action/crossing is receiptable.
- Source Gummies remain immutable during transformations.
- Every provider/runtime is replaceable.
- Native integration begins only after standalone proof.
