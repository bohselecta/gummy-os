# Gummy OS Protocol 0.2

## Status

Protocol 0.2 is the accepted specification target. The current July 24 scaffold implements Protocol 0.1 social labels in code. The Cursor migration must preserve readable 0.1 state while moving all new writes to 0.2.

## Objective

Protocol 0.2 defines portable objects for acting identity, representation, user-owned artifacts, shared environments, explicit relationships, provenance-preserving derivation, software operation, authority, enterprise policy, and evidence.

It is provider-neutral, runtime-neutral, and transport-neutral.

## Core language

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

## Artifact families

| Schema | Purpose |
| --- | --- |
| `gummy.actor/v0` | Accountable human, agent, organization, service, application, or character principal. |
| `gummy.mold/v0` | Portable representation and verification profile for one Actor. |
| `gummy.gummy/v0` | User-owned or operated object: file, project, conversation, app, workflow, result, or other artifact. |
| `gummy.bowl/v0` | Shared environment with explicit members, roles, visibility, and policy. |
| `gummy.link/v0` | Typed, scoped relationship between protocol objects. |
| `gummy.grab/v0` | Provenance-preserving creation of an independent Gummy from a source Gummy. |
| `gummy.app-pack/v0` | Vendor application contract for agent operation. |
| `gummy.capability-grant/v0` | Temporary authority for one bounded Actor action and resource. |
| `gummy.action-receipt/v0` | Evidence of request, Actor, authority, resources, and outcome. |
| `gummy.organization/v0` | Enterprise identity, deployment, brokers, registries, and runtime pools. |
| `gummy.policy-pack/v0` | Versioned organization or domain policy rules. |

Schemas live in `schemas/`. Examples live in `examples/`.

## Stable identifiers

```text
actor:hayden
actor:zeke
mold:hayden:default
mold:zeke:companion
bowl:gummy-builders
gummy:welcome
gummy:01J...
link:01J...
grab:01J...
pack:publishing-workbench:1.2.0
grant:01J...
receipt:01J...
org:gummy-labs
policy-pack:baseline-enterprise:0.2
```

Production deployments may use UUID, DID, content-addressed, or organization-scoped strategies as long as identity remains stable and collision-resistant.

## Actor contract

An Actor document identifies the accountable principal.

Required concepts:

- stable Actor ID;
- Actor class;
- human-readable name;
- status;
- owner/operator information where applicable;
- creation and update times;
- references to one or more Molds;
- optional organization, licensing, or delegated-authority context.

Actor classes include `human`, `agent`, `organization`, `service`, `application`, and `character`.

A public figure is a human Actor whose official presence is established through a verified Mold. Public-figure status is not a distinct authority class.

## Mold contract

A Mold document represents and verifies exactly one Actor.

It may include:

- handle and public name;
- Actor-class disclosure;
- visual form, shape, color, and presentation;
- public/private profile separation;
- identity proofs;
- keys and key rotation;
- operator disclosure for agents;
- organization or license assertions;
- discovery endpoints;
- supported protocol versions.

A Mold is not an Actor and cannot receive authority independently. Appearance is unsigned presentation unless covered by a validated proof.

## Gummy contract

Every Gummy declares:

- stable identity;
- kind;
- owner Actor;
- creator Actor;
- optional current operator Actor;
- visibility and audience;
- creation and update times;
- content or byte references;
- provenance;
- rights or usage terms;
- revision;
- source and dependency Links;
- required capabilities;
- signatures or hashes where applicable.

Gummy kinds may include `note`, `file`, `image`, `video`, `project`, `conversation`, `application`, `workflow`, `invitation`, `result`, and `artifact`.

## Bowl contract

A Bowl declares:

- stable identity;
- owner Actor;
- member Actors;
- allowed or preferred Molds;
- roles;
- visibility;
- contribution policy;
- moderation policy;
- default audience behavior;
- agent-participation rules;
- contained or linked Gummies;
- revocation and exit behavior.

A Bowl is a shared environment, not merely a chat feed.

## Link contract

Every Link declares:

- stable identity;
- typed relation;
- source object;
- target object;
- scope;
- creating Actor;
- authority or consent basis;
- creation time;
- revocation or expiry when applicable.

Common relation types include:

- `represented-by`;
- `created-by`;
- `operated-by`;
- `owned-by`;
- `member-of`;
- `belongs-to`;
- `follows`;
- `collaborates-with`;
- `delegates-to`;
- `trusts-for`;
- `shared-with`;
- `derived-from`;
- `grab-of`;
- `approved-by`.

## Grab contract

A Grab creates a new Gummy from a source Gummy without altering the source.

A Grab record declares:

- Grab ID;
- source Gummy ID;
- result Gummy ID;
- grabbing Actor;
- Mold used for presentation where relevant;
- source revision and hash;
- carried rights and attribution;
- timestamp;
- resulting `grab-of` Link;
- optional transformation note.

The result Gummy is independently owned and revisioned subject to the source's policy.

## Application Pack contract

A Pack defines vendor and application identity, compatible versions, runtime requirements, typed capabilities, side effects and risk, workflow recipes, semantic interface map, operating documentation, policy defaults, verification suite, recovery, rollback, signatures, and revocation status.

A Pack is broader than a tool API. It is the authorized operating relationship between an application and an Actor operating through an agent or automation runtime.

## Capability semantics

A Grant is explicit, Actor-bound, resource-bound, action-bound, time-bound, revocable, attributable, and auditable.

A Grant may identify:

- acting Actor;
- sponsoring Actor;
- Mold used for presentation or verification;
- source Gummies;
- allowed result locations;
- model, application, connector, and runtime restrictions.

The broker may derive a Grant from personal policy, direct human approval, organization policy, or a combination. A Grant cannot exceed the issuing authority's own permission.

## Receipt semantics

Action Receipts are append-only evidence records.

A Receipt should identify:

- request;
- acting Actor;
- sponsoring Actor where applicable;
- Mold used;
- model/provider and runtime route;
- Application Pack version where applicable;
- Grants;
- source Gummies;
- result Gummies;
- Links or Grabs created;
- locality and network boundary;
- cost;
- outcome;
- failure, denial, or rollback information;
- time and evidence hashes.

A Receipt may reference encrypted or access-controlled trace material, but its user-readable summary must stand on its own. Receipts record denied and failed actions as well as success.

## Protocol 0.1 compatibility

Protocol 0.1 artifacts remain recognized as migration inputs:

| Protocol 0.1 | Protocol 0.2 |
| --- | --- |
| `gummy.snack/v0` | `gummy.actor/v0` + `gummy.mold/v0` |
| `gummy.graph-object/v0` kind `drop` | `gummy.gummy/v0` |
| `gummy.graph-object/v0` kind `bowl` | `gummy.bowl/v0` |
| `gummy.graph-object/v0` kind `link` | `gummy.link/v0` |
| fork operation / `fork-of` | `gummy.grab/v0` + `grab-of` Link |

Migration must be deterministic and idempotent. Legacy inputs may remain stored until parity is verified. New writes after migration acceptance use Protocol 0.2.

## Versioning

- Schema versions are explicit in `schema` values.
- Additive fields are allowed when readers ignore unknown fields.
- Breaking semantic changes require a new protocol version.
- Application Packs declare application and protocol compatibility ranges.
- Federation peers publish supported versions and downgrade policy.
- A compatibility bridge must never silently discard ownership, audience, rights, provenance, or authority.

## Transport

Protocol 0.2 does not mandate one transport. Objects may move through local import/export, HTTPS APIs, WebSocket or event streams, content-addressed storage, enterprise message buses, signed static documents, or future federated Gummy OS endpoints.

Transport does not create authority. A received object is data until local policy accepts its requested capabilities or relationships.
