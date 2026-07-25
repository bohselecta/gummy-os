# Gummy OS Architecture

## Architectural thesis

Gummy OS is one protocol expressed through three product modes:

1. **Personal computer** — private desktop, Gummies, applications, companion, and local or connected intelligence.
2. **Gummy OS Social Layer** — portable Actors and Molds, Bowls, Gummies, Links, sharing, and Grabs.
3. **Enterprise Habitat** — organizations, Actor roles, policies, registries, runtime pools, audit, and deployment controls.

These are not separate products glued together. They operate on the same object, capability, provenance, and Receipt model.

The current build priority is the first mode: a dependable Personal Gummy OS file-to-agent-to-artifact loop.

## Canonical object model

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

### Actor authority

Actor is the principal used for capability, ownership, delegation, and Receipt semantics. Human, agent, organization, service, application, and licensed-character Actors must disclose their class where relevant.

### Mold representation

Mold is the presentation and verification profile for an Actor. One Actor may have multiple Molds. Every Mold points to one Actor. A Mold cannot grant itself authority and visual appearance is never authentication.

### Gummy object

Gummy is the general owned or operated object class: file, note, image, video, project, conversation, application, workflow, invitation, or generated artifact.

### Bowl environment

Bowl is a governed shared environment containing Actors, Molds, Gummies, and Links.

### Link relation

Link is a typed, explicit relation between protocol objects.

### Grab derivation

Grab creates a new independent Gummy and a `grab-of` Link while preserving the source.

## Planes

### 1. Experience Plane

The browser-native interface:

- desktop and window manager;
- dock and launcher;
- My Files and object browser;
- Gummy Browser;
- native chat and companion;
- Mold editor;
- Gummy OS Social Layer;
- Enterprise Habitat;
- approvals and Receipts.

The Experience Plane must remain useful before any capsule or external model starts.

### 2. Object and Relationship Plane

Everything a person can possess, open, share, operate, or relate is represented with stable identity, ownership, audience, provenance, and capabilities.

Core object classes:

- Actor;
- Mold;
- Gummy;
- Bowl;
- Link;
- Grab record;
- Application Pack;
- organization;
- policy pack;
- capability grant;
- Action Receipt.

The relationship model is not a surveillance profile. It exists to answer explicit questions:

- Which Actor owns this Gummy?
- Which Actor created or operated it?
- Which Mold represented that Actor?
- Who may see it?
- Which Bowl contains it?
- Which Links explain its relationships?
- Was it Grabbed, and from which source?
- Which Grant authorized the action?

### 3. Agent Plane

The Agent Plane owns model adapters, routing, task planning, memory selection, tool and application selection, handoffs, recovery, cost controls, and explanation.

No model provider is architectural. A personal Gummy OS may use a local model, a user-funded provider, a managed service, or an organization broker.

An agent is an Actor. It must not be confused with its Mold, provider, or application host.

### 4. Capability Plane

The Capability Plane is Gummy OS's security kernel.

A Capability Grant identifies:

- Actor;
- optional sponsoring Actor;
- optional Mold used for presentation or verification;
- action;
- resource Gummy or other resource;
- scope;
- risk;
- reason;
- issuer;
- approval source;
- issue and expiry times;
- revocation state.

Connectors, models, applications, capsules, Links, Grabs, and sharing all cross this plane. Long-lived credentials remain in a trusted broker and are not copied into model prompts.

### 5. Runtime Plane

The runtime router selects the least expensive compatible execution environment:

```text
web-native → Wasm-native → Linux compatibility → governed cloud
```

Runtime categories:

- **Web-native application** — ordinary Gummy OS or SaaS application.
- **Wasm capsule** — fast local process and filesystem environment.
- **Linux compatibility capsule** — Linux or x86 software through an evaluated compatibility runtime.
- **Governed cloud capsule** — hardware-dependent, long-running, proprietary, or enterprise-controlled execution.

The user experiences one computer regardless of runtime location.

### 6. Enterprise Plane

The Enterprise Plane adds policy and administration without inventing an incompatible object system:

- organization identity and Actor roles;
- tenant boundaries;
- policy packs;
- Application Pack registries;
- model and connector brokers;
- runtime pools;
- data residency;
- retention and legal hold;
- audit export;
- deployment controls;
- incident response.

Enterprise policy narrows what an Actor may do. It does not silently expand authority.

### 7. Federation Plane

Federation allows compatible Gummy OS editions to exchange signed protocol objects without one mandatory central social network.

It defines portable Actor and Mold documents, discovery endpoints, signatures, Bowl invitations, Gummy exchange, Links, Grab lineage, compatibility declarations, revocation, key rotation, and organization trust policies.

Federation is phased after strong local identity, object, sharing, and migration semantics exist.

## Trust boundaries

```text
Host browser / physical computer
        │ browser sandbox
Trusted Gummy OS origin
        │ capability broker
Actors, Gummies, object stores, connectors, Bowls, organizations
        │ task Grants
Runtime capsules and vendor software
        │ verified outputs
Result Gummies + Action Receipts
```

No boundary is replaced by prompt instructions. Prompts may guide reasoning; capability grants determine authority.

## Data architecture

### Local-first personal state

Personal Gummy OS stores:

- Actor and Mold metadata;
- desktop preferences;
- project and Gummy index;
- actual local Gummy bytes in OPFS;
- cached Bowls and Links where enabled;
- Receipt ledger;
- encrypted connector references;
- deterministic Protocol 0.1 migration state.

### Object persistence

Structured metadata belongs in IndexedDB or an equivalently explicit local-first store. File and artifact bytes belong in OPFS or an equivalently explicit byte store. A Gummy identity must not be confused with its storage location.

### Sync service

A future sync service replicates encrypted Gummies and relationship changes with object-level versioning, conflict-safe merges, offline operation, selective synchronization, revocation, portable export, and organization policy overlays.

### Relationship service

The relationship service stores explicit Links and audience decisions, not inferred behavioral advertising profiles. Public discovery indexes only fields an Actor deliberately publishes through a Mold.

## Application Pack architecture

An Application Pack contains:

```text
application.agentpack/
├── manifest.json
├── capabilities.json
├── permissions.json
├── semantic-interface-map.json
├── workflows/
├── documentation/
├── policies/
├── verification/
├── recovery/
└── signatures/
```

Preferred control hierarchy:

1. typed application capability;
2. vendor API or MCP tool;
3. semantic interface command;
4. accessibility-tree interaction;
5. visual GUI interaction;
6. coordinate interaction as a last resort.

## Protocol 0.1 compatibility bridge

The current scaffold stores `snack`, `drop`, and `fork` concepts. The accepted target is Protocol 0.2.

The bridge must:

- split each Snack into an Actor and at least one Mold;
- convert each Drop or compatible graph object into a Gummy;
- preserve Bowls;
- convert relationship objects into Links;
- convert fork lineage into Grab records and `grab-of` Links;
- preserve IDs through deterministic mapping where possible;
- keep source data readable until migration is verified;
- never write new Protocol 0.1 social objects after migration acceptance.

## Architecture invariants

- Gummy OS remains useful without a social account.
- Gummy OS remains useful without an enterprise organization.
- Actor is the authority principal.
- Mold is representation and verification, not authority.
- Every Gummy carries ownership and provenance appropriate to its risk.
- Every shared Gummy declares audience.
- Every Grab creates a new Gummy identity and preserves a `grab-of` Link.
- Every consequential Actor action is receiptable.
- Every runtime is replaceable through an adapter.
- Every provider is replaceable through an adapter.
- Every compatible independent edition may remain protocol-compatible without using Gummy-hosted services.
