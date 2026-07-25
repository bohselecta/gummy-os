# Gummy OS Product Specification

## Product statement

Gummy OS is a browser-delivered Web OS where persistent, addressable Actors can be opened from compatible devices and connected to executable Agents under explicit human-controlled Master Control.

The familiar desktop is the access surface. The protocol, Actor/Agent separation, Molds, Master Control, Gummies, Grants, and Receipts are the deeper system.

The active priority is **Personal Gummy OS**: prove one local Human → Actor → Mold → Agent → result Gummy loop that survives return visits before implementing distributed Glyphd OS synchronization or expanding social, enterprise, federation, or runtime scope.

## Canonical architecture

```text
Human = ultimate personal authority
Actor = persistent addressable entity in Gummy OS / the web
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
@address = stable identity and route for an Actor
```

See `docs/ACTOR_AGENT_MASTER_CONTROL.md` and `docs/VOCABULARY.md`.

## Product participants

- **Human** — controls Master Control, opens Actors, authorizes Agents, selects Molds, and approves consequential work.
- **Actor** — persistent web-openable computational entity with state, Gummies, Links, Molds, Agent bindings, deployment, and `@address`.
- **Agent** — executable intelligence operating locally or remotely under explicit capability and Mold constraints.
- **Mold** — permissioned embodiment and operating contract defining who may operate an Actor, how, where, for how long, and with what capabilities.
- **Auditor** — inspects Human sponsor, Actor, Agent, Mold, Grant, route, Gummies, state changes, and Receipts.
- **Software vendor** — later provides an Application Pack for controlled operation by an authorized Agent.

## Core loops

```text
Personal:
Human opens Actor
→ selects/approves Mold and Agent
→ imports source Gummy
→ Master Control displays scope and locality
→ Agent performs bounded task
→ result Gummy + Receipt
→ state survives return

Native bridge, later:
Actor in Gummy OS
↔ protocol / @address / Master Control
↔ Agent in Glyphd OS

Social, later:
Actor enters Bowl
→ shares Gummy
→ creates Link
→ another Actor Grabs if allowed
→ provenance remains visible
```

## Core surfaces

### Gummy OS Desktop

Familiar browser-native desktop, windows, dock, applications, files, Gummies, Bowls, Links, and Receipts.

### Actor surface

Shows Actor identity, provisional or verified `@address`, deployment location, owned Gummies, active Molds, Agent bindings, state, and Links.

### Master Control

Shows and controls:

- authoritative state location;
- web/local/hybrid deployment;
- assigned Agent;
- active Mold;
- allowed data flow;
- synchronization mode;
- approval rules;
- revocation.

### Agent surface

Shows Agent identity, runtime, provider/model disclosure, locality, status, capability ceiling, assigned Actors, and current authorization.

### Mold surface

Shows representation plus operating contract: allowed Humans/Agents, role, capability scope, runtime policy, sync policy, proofs, expiry, and revocation.

### Gummy Browser

Opens native Gummy routes and compatible external sites. Later it may open `glyphd.com` or web-native Glyphd surfaces without making them dependencies.

### My Gummies / Object Space

Stores files, projects, conversations, applications, workflows, and result artifacts with stable identity, bytes, provenance, ownership, and hashes.

## Personal Gummy OS acceptance criteria

The first implementation is accepted only when:

1. Gummy OS boots as a usable browser-native desktop without an Agent running.
2. A local Human authority record exists.
3. A persistent Actor exists with a stable provisional `@address`.
4. A separate Agent record exists.
5. A Mold explicitly allows that Human/Agent relationship and bounded capabilities.
6. Master Control shows location, Agent, Mold, sync policy, approval rules, and revocation state.
7. A real text or Markdown file imports as a source Gummy with actual persisted bytes.
8. A real provider-neutral Agent/broker route performs one bounded transformation.
9. Provider credentials never enter browser JavaScript.
10. Human approval is required for source read and result create.
11. The source Gummy remains unchanged.
12. The result is written as a new Gummy with stable identity, provenance, Links, and hash.
13. The Receipt identifies Human sponsor, Actor, `@address`, Agent, Mold, Master Control, Grant, route, source, result, locality, cost, outcome, and time.
14. Mold or Agent revocation blocks future execution.
15. Denial and failure produce truthful terminal evidence.
16. Reload and browser return preserve all state.
17. Gummy Browser and window behavior continue to work.
18. `npm run verify` and the end-to-end journey pass.

## Migration acceptance

- Legacy `snack:*` state becomes a local Human authority, Actor, and Mold where appropriate.
- Legacy model/companion proof becomes a separate provisional Agent, not an Actor class.
- Legacy Drop/file state becomes Gummies.
- Fork lineage becomes Grab records and `grab-of` Links.
- Actor and Agent IDs/types never collapse.
- Mold becomes an operating contract, not only presentation.
- New Receipts distinguish Human, Actor, Agent, and Mold.
- Migration is deterministic, idempotent, and non-destructive.

## Out of scope for the active lane

- Native Glyphd OS integration;
- real Zeke binding;
- cross-device or cloud Actor synchronization;
- production public `@address` discovery;
- public celebrity or licensed-character Actors;
- remote social accounts and Bowls;
- enterprise identity and policy;
- federation;
- broad Application Pack execution;
- Linux compatibility capsules;
- multiple production model routes;
- billing and marketplace behavior.

These are preserved future layers. They must not delay the first correct local proof.
