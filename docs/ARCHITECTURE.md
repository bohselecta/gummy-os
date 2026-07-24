# Gummy Architecture

## Architectural thesis

Gummy is one protocol expressed through three product modes:

1. **Personal computer** — private desktop, files, applications, companion, and local or connected intelligence.
2. **Snack Graph** — portable people/agent identities, Bowls, Drops, relationships, sharing, and forks.
3. **Enterprise Habitat** — organizations, roles, policies, registries, runtime pools, audit, and deployment controls.

These are not separate products glued together. They operate on the same object, capability, provenance, and receipt model.

## Planes

### 1. Experience Plane

The browser-native interface:

- desktop and window manager;
- dock and launcher;
- files and object browser;
- Gummy Browser;
- native chat;
- companion;
- Snack Bar;
- Snack Graph;
- Enterprise Habitat;
- approvals and receipts.

The Experience Plane must remain usable before any capsule or external model starts.

### 2. Object and Graph Plane

Everything a person can possess, open, share, or relate is represented as an object with stable identity, type, owner, visibility, provenance, and capabilities.

Core object classes:

- file;
- project;
- conversation;
- application;
- artifact;
- Snack;
- Bowl;
- Drop;
- Link;
- Application Pack;
- organization;
- policy pack;
- receipt.

The graph is not a surveillance profile. It is the explicit relationship structure required to answer questions such as who owns this, who can see it, where did it come from, what was forked, and which agent may act on it.

### 3. Agent Plane

The Agent Plane owns model adapters, routing, task planning, memory selection, tool and application selection, handoffs, recovery, cost controls, and explanation.

No specific model provider is architectural. A personal Gummy may use a local model, a user-funded provider, a managed Gummy service, or an organization broker.

### 4. Capability Plane

The Capability Plane is Gummy's security kernel.

A capability grant identifies actor, action, resource, scope, risk, reason, issuer, approval source, issue and expiry times, and revocation state.

Connectors, models, applications, capsules, and social sharing all cross this plane. Long-lived account credentials remain in a connector broker and are not copied into model prompts.

### 5. Runtime Plane

The runtime router selects the least expensive compatible execution environment:

```text
web-native → Wasm-native → Linux compatibility → governed cloud
```

Runtime categories:

- **Web-native application** — ordinary Gummy or SaaS application.
- **Wasm capsule** — fast local process and filesystem environment.
- **Linux compatibility capsule** — unmodified Linux or x86 software through an evaluated compatibility runtime.
- **Governed cloud capsule** — hardware-dependent, long-running, proprietary, or enterprise-controlled execution.

The user experiences one computer regardless of runtime location.

### 6. Enterprise Plane

The Enterprise Plane adds policy and administration without inventing a second incompatible object system:

- organization identity and roles;
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

### 7. Federation Plane

Federation allows Gummy editions to exchange signed protocol objects without one mandatory central social network.

It defines portable Snack documents, discovery endpoints, object signatures, Bowl invitations, Drop exchange, provenance and fork lineage, compatibility declarations, revocation and key rotation, and organization trust policies.

Federation is phased after strong local identity and sharing semantics exist.

## Trust boundaries

```text
Host browser / physical computer
        │ browser sandbox
Trusted Gummy origin
        │ capability broker
Object stores, connectors, Graph, organizations
        │ task grants
Runtime capsules and vendor software
        │ verified outputs
Artifacts + Action Receipts
```

No boundary is replaced by prompt instructions. Prompts may guide behavior; capabilities determine authority.

## Data architecture

### Local-first personal state

Initial personal Gummy stores profile and Snack metadata, desktop preferences, private object index, local files in OPFS, cached graph objects, receipt ledger, and encrypted connector references.

### Sync service

A future sync service replicates encrypted objects and graph changes with object-level versioning, conflict-safe merges, offline operation, selective synchronization, revocation, portable export, and organization policy overlays.

### Graph service

The Graph service stores explicit edges and audience decisions, not inferred behavioral advertising profiles. Public discovery indexes only fields a Snack or organization has deliberately published.

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

## Architecture invariants

- Gummy remains useful without a social account.
- Gummy remains useful without an enterprise organization.
- Enterprise policy narrows authority; it does not silently expand it.
- Every shared object carries audience and provenance.
- Every fork creates a new identity and lineage edge.
- Every consequential agent action is receiptable.
- Every runtime is replaceable through an adapter.
- Every provider is replaceable through an adapter.
- Every fork can remain protocol-compatible without using Gummy-hosted services.
