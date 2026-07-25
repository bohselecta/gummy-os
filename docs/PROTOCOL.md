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
```

These are product/interface names. The Gummy Bar's candy icons do not create a `candy` protocol class.

## Artifact families

| Schema | Purpose |
| --- | --- |
| `gummy.actor/v0` | Persistent addressable Actor. |
| `gummy.agent/v0` | Executable intelligence/process. |
| `gummy.mold/v0` | Permissioned embodiment and operating contract. |
| `gummy.master-control/v0` | Human-controlled assignment, placement, sync, approval, revocation. |
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
gummy:welcome
bowl:gummy-builders
link:01J...
grab:01J...
grant:01J...
receipt:01J...
```

## Actor contract

Actor declares stable ID, `@address`, kind, Human authority, state/memory refs, Molds, Agents, owned Gummies, deployment/authoritative location, sync policy, status, times, and legacy IDs.

Agent is never an Actor kind.

## Agent contract

Agent declares stable ID, name/character family, version, provider/model class, runtime, locality, status, Human/organization operator, Actor/Mold bindings, capability ceiling, task lease, private-memory boundary, autonomy, and disclosure.

Glopper executors are separate Agents despite sharing the Glopper character.

## Mold contract

Mold declares Actor, allowed Human/Agent operators, representation, role/context, capabilities, data scopes, runtime/locality, synchronization, proof/license/disclosure, issue/expiry/revocation, and status.

Mold does not act or own the Actor.

## Master Control contract

Master Control declares Human, Actor, active Agent, active Mold, task lease, authoritative location, deployment, sync, allowed data classes, approval rules, revoked Agents/Molds, locks, and status.

Sign-in, connectivity, or character continuity never substitutes for Master Control.

## Gummy Bar presentation contract

A Gummy Bar item references an underlying object and local presentation state:

- object kind and ID;
- icon/visual asset reference;
- pinned/open/selected state;
- task/approval/attention badges;
- order/grouping;
- accessibility label.

It does not receive capability authority independently.

## Glopper routing

A Human-facing Glopper interaction resolves to an Agent executor through explicit routing.

Routing considers:

- authoritative data location;
- capability requirements;
- privacy/data classification;
- Agent availability;
- locality, cost, and latency;
- current task lease;
- Mold and Master Control policy.

The Receipt identifies the actual executor, not only the Glopper character.

## Capability Grant

A Grant binds Human, Actor, operator type/ID, Agent, Mold, Master Control, task lease, action, resource, scope, locality, risk, approval, issue/expiry, and revocation.

No capability exceeds the Mold ceiling, Agent ceiling, Master Control policy, or Human authority.

## Action Receipt

A Receipt identifies request/action, Human, Actor/`@address`, operator, Agent, Glopper character where relevant, Mold, Master Control, task lease, runtime/locality, Grants, source/result Gummies, Links/Grabs, capabilities, cost, outcome, errors/denial/revocation, time, and hashes.

The user-readable summary stands alone.

## Quarantine and promotion

A quarantined Gummy has no native execution authority.

Promotion across a native boundary requires explicit destination, scan/classification result where applicable, Human/policy approval, bounded Grant, Bridge identity, and Receipt.

## Synchronization

Actor declares authoritative location. Master Control declares allowed data classes, direction, and mode. Mold constrains operator sync. Grants authorize consequential transfer. Receipts record movement. Revocation blocks future flow.

Private local adaptation and approved portable profile are separate data classes.

## Legacy compatibility

```text
legacy Snack
→ Human + Actor + Mold

legacy companion / personal-broker / Z / Zeke
→ agent:glopper-web plus Glopper presentation

legacy dock
→ Gummy Bar presentation

legacy Drop/file
→ Gummy

legacy Fork
→ Grab + grab-of Link
```

Migration is deterministic, idempotent, traceable, and non-destructive. Actor and Agent never collapse.

## Transport and versioning

Transport may use local import/export, HTTPS, events, content-addressed storage, enterprise buses, signed documents, or federation. Transport never creates authority.

Breaking semantics require a new protocol version; additive fields may be ignored only when authority/provenance remain intact.
