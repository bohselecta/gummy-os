# Gummy OS Protocol 0.2

## Status

Protocol 0.2 is the current specification target. Current source still contains legacy Protocol 0.1 and temporary companion naming; Cursor must migrate it deterministically.

## Core entities

```text
Human = ultimate personal authority
Actor = persistent addressable web entity
Agent = separate executable intelligence
Mold = permissioned Actor operating contract
Master Control = assignment, placement, sync, approval, revocation
Gummy Box = user-owned asynchronous handoff space
Work Order = structured proposal for bounded work
Task Lease = executor ownership of one task scope
Return = structured execution report
Gummy = Actor-owned/operated object
Bowl = shared environment
Link = explicit relationship
Grab = provenance-preserving independent derivation
```

## Product presentation names

```text
Gummy OS
Gummy Canvas
Gummy Bar
Glopper
Glopper Panel
Glopper App
Glopper Inbox
Gummy Box
```

These are product/interface names. Candy icons do not create a `candy` protocol class.

## Artifact families

| Schema | Purpose |
| --- | --- |
| `gummy.actor/v0` | Persistent addressable Actor. |
| `gummy.agent/v0` | Executable intelligence/process. |
| `gummy.mold/v0` | Permissioned embodiment and operating contract. |
| `gummy.master-control/v0` | Human-controlled assignment, placement, sync, approval, revocation. |
| `gummy.box/v0` | User-owned provider-neutral handoff space. |
| `gummy.work-order/v0` | Proposed bounded task written into a Gummy Box. |
| `gummy.task-lease/v0` | Exclusive or explicitly shared task ownership. |
| `gummy.work-return/v0` | Structured terminal account of Work Order execution. |
| `gummy.gummy/v0` | Actor-owned/operated object. |
| `gummy.bowl/v0` | Shared environment. |
| `gummy.link/v0` | Typed relationship. |
| `gummy.grab/v0` | Independent derivation preserving source. |
| `gummy.app-pack/v0` | Application operating knowledge/contract. |
| `gummy.capability-grant/v0` | Bounded temporary authority. |
| `gummy.action-receipt/v0` | Evidence of request, participants, route, objects, and outcome. |
| `gummy.organization/v0` | Enterprise context. |
| `gummy.policy-pack/v0` | Versioned policy. |

## Canonical identifiers

```text
human:hayden
actor:hayden
@hayden
agent:glopper-web
agent:glopper-cloud
agent:glopper-native
agent:glopper-phone
mold:hayden:personal
master-control:hayden
box:hayden
work-order:project-brief
lease:project-brief
return:project-brief
gummy:welcome
bowl:gummy-builders
link:01J...
grab:01J...
grant:01J...
receipt:01J...
```

## Actor contract

Actor declares stable ID, `@address`, kind, Human authority, state/memory refs, Molds, Agents, Gummy Boxes, owned Gummies, deployment/authoritative location, sync policy, status, times, and legacy IDs.

Agent is never an Actor kind.

## Agent contract

Agent declares stable ID, name/character family, version, provider/model class, runtime, locality, status, Human/organization operator, Actor/Mold bindings, capability ceiling, Task Leases, private-memory boundary, autonomy, and disclosure.

Glopper executors are separate Agents despite sharing the Glopper character.

## Mold contract

Mold declares Actor, allowed Human/Agent operators, representation, role/context, capabilities, data scopes, runtime/locality, synchronization, proof/license/disclosure, issue/expiry/revocation, and status.

Mold does not act or own the Actor.

## Master Control contract

Master Control declares Human, Actor, active Agent, active Mold, active Task Lease, authoritative location, deployment, sync, allowed data classes, approval rules, executor policy, revoked Agents/Molds/leases, locks, and status.

Sign-in, connectivity, character continuity, or provider connection never substitutes for Master Control.

## Gummy Box contract

A Gummy Box declares:

- stable Box ID;
- Human and Actor owner;
- provider adapter and scoped connection;
- authoritative root location;
- optional mirrors;
- allowed writers/readers;
- logical paths for inbox, claimed, running, returns, artifacts, receipts, archive, and profile;
- synchronization policy;
- protocol version and status.

Provider options may include Local, private GitHub, Google Drive, and future compatible providers.

A provider connection is scoped to the selected Box root. It does not imply whole-account access.

## Work Order contract

A Work Order is a structured proposal containing:

- Work Order and Box IDs;
- issuer identity/model/provider disclosure;
- target Human, Actor, Agent family/executor, Mold, and Master Control;
- goal and context;
- source references;
- requested capability and write scope;
- forbidden actions;
- privacy, locality, inference, native, offline, and cost constraints;
- acceptance checks and expected Return;
- risk, approval, expiry, and status.

A Work Order may be authored by a frontier model, but:

> **A Work Order is not a Capability Grant.**

It remains untrusted data until validated and approved.

## Task Lease contract

A Task Lease binds Human, Actor, Agent, Mold, Master Control, task/Work Order, authoritative location, work scope, capabilities, expected Return, mode, issue/expiry, and status.

Exclusive is the default. Parallel execution requires explicit non-overlapping scopes or Human-approved shared mode.

## Work Return contract

A Return identifies Box, Work Order, Task Lease, Human, Actor, actual Agent, Mold, base/source state, files/Gummies changed, actions, checks, artifacts, Receipts, limitations, proven/unproven claims, recommended next action, result, and time.

Failed, denied, blocked, cancelled, and expired attempts also produce terminal evidence.

## Glopper Inbox contract

Glopper Inbox is a view over pending Box Work Orders. It displays issuer, target, goal, sources, capabilities, privacy/locality, native requirement, risk, expiry, acceptance tests, conflicts, and status.

Human decisions are:

```text
APPROVE
REVISE
REJECT
HOLD
```

## Gummy Bar presentation contract

A Gummy Bar item references an underlying object and local presentation state:

- object kind and ID;
- icon/visual asset reference;
- pinned/open/selected state;
- task/approval/attention badges;
- order/grouping;
- accessibility label.

A Work Orders candy may open Glopper Inbox. The candy has no independent authority.

## Glopper routing

A Glopper interaction or approved Work Order resolves to an Agent executor through explicit routing.

Routing considers authoritative data location, required capability, GitHub/Drive/local availability, privacy, provider availability, locality, cost, latency, Task Lease ownership, and Mold/Master Control policy.

The Receipt identifies the actual executor, not only the Glopper character.

## Capability Grant

A Grant binds Human, Actor, operator type/ID, Agent, Mold, Master Control, Task Lease, action, resource, scope, locality, risk, approval, issue/expiry, and revocation.

No capability exceeds the Work Order-approved scope, Mold ceiling, Agent ceiling, Master Control policy, or Human authority.

## Action Receipt

A Receipt identifies request/Work Order, Human, Actor/`@address`, operator, actual Agent, Glopper character where relevant, Mold, Master Control, Task Lease, provider/Box, runtime/locality, Grants, source/result Gummies, artifacts, Links/Grabs, capabilities, cost, outcome, errors/denial/revocation, time, and hashes.

The user-readable summary stands alone.

## Provider adapters

Adapters expose scoped operations for connect/disconnect, Box initialization, Work Order listing/reading/claiming, Return/artifact/Receipt writes, archival, revision IDs/hashes, and disconnected queues.

GitHub may use private repositories, commits, branches, and PRs. Google Drive may use one selected folder and provider-native file/version IDs. Local uses IndexedDB/OPFS.

Adapter transport never creates authority.

## Quarantine and promotion

A quarantined Gummy or provider file has no native execution authority.

Promotion across a native boundary requires explicit destination, classification where applicable, Human/policy approval, bounded Grant, Bridge identity, and Receipt.

## Synchronization

Actor and Box declare authoritative locations. Master Control declares allowed data classes, direction, and mode. Mold constrains operator sync. Grants authorize consequential transfer. Receipts record movement. Revocation blocks future flow.

Private local adaptation and approved portable profile remain separate data classes.

## Legacy compatibility

```text
legacy Snack
→ Human + Actor + Mold

legacy companion / personal-broker / Z / Zeke
→ agent:glopper-web plus Glopper presentation

legacy dock
→ Gummy Bar presentation

legacy external handoff folder / prompt queue
→ Gummy Box + Work Orders where migration is unambiguous

legacy Drop/file
→ Gummy

legacy Fork
→ Grab + grab-of Link
```

Migration is deterministic, idempotent, traceable, and non-destructive. Actor and Agent never collapse.

## Transport and versioning

Transport may use local import/export, GitHub, Google Drive, HTTPS, events, content-addressed storage, enterprise buses, signed documents, or federation. Transport never creates authority.

Breaking semantics require a new protocol version; additive fields may be ignored only when authority/provenance remain intact.
