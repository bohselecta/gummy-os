# Gummy OS Protocol 0.2

## Status

Protocol 0.2 is the current specification target. The July 25 founder drawing corrected the identity model before Cursor implementation:

- Actor is a persistent addressable web entity;
- Agent is a separate executable intelligence;
- Human authority sits above both;
- Mold is a permissioned embodiment and operating contract;
- Master Control governs placement, synchronization, permission, and revocation.

The current scaffold still contains Protocol 0.1 labels and earlier draft assumptions. Migration must preserve readable legacy state.

## Objective

Define portable, provider-neutral, runtime-neutral objects for:

- Human authority;
- addressable Actors;
- executable Agents;
- permissioned Molds;
- Master Control;
- Gummies, Bowls, Links, and Grabs;
- Application Packs;
- Capability Grants;
- Action Receipts;
- organization policy and federation later.

## Core language

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
Gummy OS = Web OS where Actors are opened and deployed
Glyphd OS = native AI execution and device-sovereignty environment
@address = stable protocol identity and route for an Actor
```

## Artifact families

| Schema | Purpose |
| --- | --- |
| `gummy.actor/v0` | Persistent addressable entity expressed through Gummy OS. |
| `gummy.agent/v0` | Executable intelligence or operating process. |
| `gummy.mold/v0` | Permissioned embodiment and operating contract for one Actor. |
| `gummy.master-control/v0` | Human-controlled placement, sync, approval, assignment, and revocation state. |
| `gummy.gummy/v0` | Actor-owned or operated object. |
| `gummy.bowl/v0` | Shared environment. |
| `gummy.link/v0` | Typed explicit relationship. |
| `gummy.grab/v0` | Independent derivation preserving source provenance. |
| `gummy.app-pack/v0` | Vendor application operating contract. |
| `gummy.capability-grant/v0` | Temporary authority for one bounded operator action through an Actor. |
| `gummy.action-receipt/v0` | Evidence of Human sponsor, Actor, Agent, Mold, route, resources, and outcome. |
| `gummy.organization/v0` | Enterprise identity and deployment context. |
| `gummy.policy-pack/v0` | Versioned policy rules. |

## Identifiers

```text
human:hayden
actor:hayden
@hayden
agent:zeke-local
agent:personal-broker
mold:hayden:personal
master-control:hayden
gummy:welcome
bowl:gummy-builders
link:01J...
grab:01J...
grant:01J...
receipt:01J...
```

The Actor ID is machine-stable. The `@address` is the human-facing protocol identity and route.

## Human authority reference

The first local implementation may use a simple `human:*` principal reference without claiming production identity verification.

Human authority may:

- sponsor Actors;
- authorize Agents;
- issue or approve Molds;
- control Master Control;
- approve Grants;
- revoke access.

Future identity systems may bind this reference to passkeys, organizations, or cryptographic identity.

## Actor contract

An Actor declares:

- stable Actor ID;
- stable `@address`;
- kind and display name;
- Human authority references;
- state and memory references;
- Mold IDs;
- Agent IDs;
- owned Gummy IDs;
- deployment mode;
- authoritative location;
- web endpoint where applicable;
- sync policy;
- status, times, and legacy IDs.

Actor kind describes what persistent presence it embodies, not what executes it. Agent is never an Actor kind.

## Agent contract

An Agent declares:

- stable Agent ID;
- name and version;
- provider/model class;
- runtime class;
- locality;
- status;
- Human authority or organization operator;
- Actor and Mold bindings;
- capability ceiling;
- autonomy and disclosure.

An Agent may act through an Actor only when Master Control, Mold, policy, and Grant allow it.

## Mold contract

A Mold declares:

- Actor ID;
- allowed Human and Agent operators;
- role and context;
- representation;
- capability scope;
- read/write/publish scope;
- runtime and locality policy;
- synchronization policy;
- proof, licensing, and disclosure requirements;
- issue, expiry, revocation, and status.

A Mold does not act and does not own the Actor. It defines the permitted embodiment and operating relationship.

## Master Control contract

Master Control declares:

- Human authority;
- Actor;
- active Agent;
- active Mold;
- authoritative state location;
- deployment mode;
- sync mode and direction;
- allowed data classes;
- approval rules;
- revoked Agents and Molds;
- lock and status state.

Sign-in state, network availability, or Agent preference never substitutes for Master Control.

## @address semantics

An `@address` supports:

- Actor identity resolution;
- opening an Actor;
- messaging and invitations;
- Agent binding;
- permission exchange;
- synchronization routing;
- Bowl membership;
- Gummy ownership and provenance;
- revocation and discovery.

An `@address` does not reveal private state by default and does not grant permission to operate the Actor.

## Gummy contract

Every Gummy declares stable identity, kind, owner Actor, creator Actor, optional operating Agent, Mold, audience, content/byte reference, hash, revision, provenance, rights, capabilities, Links, times, and legacy IDs.

## Bowl, Link, and Grab contracts

- Bowl defines shared membership, roles, visibility, policy, and contained Gummies.
- Link defines explicit relationships such as `operated-by-agent`, `controlled-by-human`, `represented-by`, `deployed-to`, `synchronized-with`, `created-by`, `member-of`, `derived-from`, and `grab-of`.
- Grab creates a new Gummy and provenance Link without changing the source.

## Capability Grant semantics

A Grant binds:

- Human authority;
- Actor;
- operator type and operator ID;
- Agent where applicable;
- Mold;
- Master Control record;
- action;
- resource;
- scope;
- risk;
- locality;
- approval;
- issue, expiry, and revocation.

The operator receives no capability beyond the Mold ceiling, Master Control policy, and issuing authority.

## Action Receipt semantics

A Receipt identifies:

- request and action;
- Human sponsor;
- Actor and `@address`;
- operator type;
- Agent if used;
- Mold;
- Master Control record;
- execution route, runtime, locality, and sync mode;
- Grants;
- source and result Gummies;
- Links and Grabs;
- capabilities;
- cost;
- outcome;
- denial, failure, cancellation, rollback, or revocation evidence;
- times and hashes.

The user-readable summary must stand on its own.

## Application Pack semantics

A Pack teaches an authorized Agent how to operate one application through typed capabilities, APIs/tools, semantic interfaces, accessibility, or GUI control.

The Pack provides knowledge and verification. It does not grant authority.

## Runtime and synchronization semantics

Runtime is replaceable:

```text
web-native → browser/Wasm → Linux-native → governed server/cloud
```

Synchronization is explicit:

- Actor declares authoritative location;
- Master Control declares data classes, direction, and mode;
- Mold constrains what the operator may synchronize;
- Grants authorize individual consequential flows;
- Receipts record what moved and why;
- revocation blocks future flow.

## Legacy compatibility

```text
legacy Snack
→ Human authority + Actor + Mold

legacy demo companion/model
→ provisional Agent

legacy Drop/file
→ Gummy

legacy fork
→ Grab + grab-of Link
```

Migration must be deterministic, idempotent, and non-destructive. Actor and Agent may never collapse into one record.

## Versioning and transport

Schema versions are explicit. Breaking semantic changes require a new protocol version. Unknown additive fields may be ignored only when authority and provenance are not weakened.

Transport may use local import/export, HTTPS, events, content-addressed storage, enterprise buses, signed documents, or future federation. Transport never creates authority.
