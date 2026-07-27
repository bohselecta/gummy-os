# Production Actor Runtime

**Status:** Founder architecture ruling  
**Date:** 2026-07-26  
**Scope:** Runtime contract for Productions, Actor App Surfaces, saved per-Production configuration, Actor Plans, Production Runs, drag-and-drop composition, Master Control, and future browser/cloud/native execution.  
**Precedence:** Read after `docs/ACTOR_FIRST_PRODUCTION_MODEL.md`. This document extends the existing Actor/Agent/Mold/Master Control architecture; it does not replace it. Later explicit founder rulings take precedence.

## 1. Runtime thesis

Gummy OS is an Actor-first Production environment.

A Human starts a Production, adds personal or service Actors, configures each Actor through its window, saves the configuration for that Production, reviews the resulting Actor Plan, and selects **Make Production**.

Gummy OS then freezes an approved run snapshot and routes replaceable Agents beneath the participating Actors.

```text
Start Production
→ add or @mention Actors
→ open their Actor App Surfaces
→ configure each Actor for this Production
→ save Production-specific settings
→ inspect the Actor Plan and data flow
→ approve through Master Control
→ Make Production
→ Agents execute the frozen plan
→ Gummies, Returns, and Receipts persist
```

Canonical product rule:

> **Actors are the participants. Productions are what they make together. Agents are how the work is performed.**

Canonical runtime rule:

> **Adding or configuring an Actor never executes work. Make Production creates the governed execution attempt.**

## 2. What this document resolves

This document defines the bridge between the established Gummy OS object model and the practical visual workflow for applications such as:

```text
@3D-Bee
@ImageHoss
@VideoBoss
@ProjectComposer
@GummyStorage
```

These are not merely dock applications and they are not raw Agents.

Each should be represented as a persistent **service Actor** with:

- a stable Actor ID and `@address`;
- one or more published capabilities;
- one or more Molds;
- an Actor App Surface that opens as a Gummy OS window;
- Production-specific configuration;
- compatible Agent executors;
- explicit input, output, privacy, cost, locality, and retention contracts;
- Returns and Receipts for consequential work.

The service Actor remains stable while its implementation may move among browser, server, cloud, native Linux, phone, or future runtimes.

## 3. Canonical object roles

```text
Human
ultimate personal authority

Production
durable undertaking containing participants, work, state, and deliverables

Actor
persistent addressable participant or capability

Actor App Surface
windowed interface through which an Actor is inspected or configured

Production Actor Configuration
saved settings for one Actor inside one Production

Actor Plan
visible dependency graph for a piece of Production work

Production Run
immutable execution attempt created by Make Production

Agent
replaceable executor bound beneath an Actor Plan node

Mold
permissioned operating contract for an Actor

Master Control
visual authority, assignment, data-flow, synchronization, approval, and revocation layer

Bowl
shared working environment used by a Production

Gummy
source, reference, application object, intermediate, result, deliverable, or evidence object

Work Order / Task Lease / Grant
proposal, executor ownership, and bounded authority for one execution scope

Return / Receipt
terminal report and durable evidence of what actually happened
```

## 4. Production

A Production is the top-level durable undertaking.

It may include only the Human's own Actors, only external Actors, or any governed mixture.

Examples:

- a private family video;
- a product launch;
- a software application;
- an architectural package;
- a game prototype;
- a research effort;
- a film or episodic series;
- a public project available for collaboration, licensing, or acquisition.

A Production owns or references:

- its creator Human and owner Actor;
- participating Actors and their roles;
- Bowls;
- Production Actor Configurations;
- Actor Plans;
- Production Runs;
- source, working, and result Gummies;
- goals, milestones, budgets, and deliverables;
- rights, audience, publication, retention, and acquisition policies;
- authoritative storage location;
- Returns and Receipts;
- window/layout state needed for understandable return continuity.

A Production may optionally have a public or collaborative Actor, but Production and Actor remain distinct:

```text
production:ranch-day
persistent governed undertaking

@ranch-day
optional addressable Actor representing that Production to others
```

A private Production does not require a public Actor.

## 5. Production lifecycle

Recommended lifecycle:

```text
draft
→ configuring
→ ready
→ running
→ review
→ completed
→ archived
```

Additional terminal or exceptional states:

```text
blocked
cancelled
transferred
```

Meaning:

- **draft** — Production exists, but its roster and goal may be incomplete;
- **configuring** — Actors are being added and their Production settings are being prepared;
- **ready** — required Actor Configurations validate and no unresolved authority blocker remains;
- **running** — at least one Production Run is active;
- **review** — run outputs exist and require Human or Actor approval;
- **completed** — declared deliverables and acceptance checks are satisfied;
- **archived** — no active work is expected, but durable state remains;
- **blocked** — required permission, Actor, Agent, capability, data, budget, or runtime is unavailable;
- **cancelled** — the Production was intentionally stopped without erasing evidence;
- **transferred** — governance or transferable rights moved under an explicit agreement and Receipt.

Production status is not a substitute for Run status. A completed Production may later be reopened and produce a new version through another Run.

## 6. Production Run

A Production is editable and persistent. A **Production Run** is a versioned execution attempt.

Selecting **Make Production** creates a Production Run.

The Run freezes:

- the Production revision;
- Actor roster and roles;
- applicable Molds and relationship bindings;
- Actor Plan graph;
- Production Actor Configuration versions;
- source Gummy IDs, revisions, and hashes;
- selected Agents and routing policies;
- Context Envelopes;
- approval state;
- cost ceilings;
- privacy, locality, retention, contribution, and publication policy;
- expected outputs and acceptance checks.

A Run must not silently mutate when the editable Production changes later.

Recommended Run states:

```text
planned
awaiting-approval
queued
running
paused
blocked
partially-completed
completed
failed
cancelled
```

After a Run becomes terminal, its frozen manifest and evidence are immutable. An annotation or Link may be added, but the historical claim must not be rewritten.

Retrying or changing the plan creates a new Run or a clearly linked retry attempt.

## 7. Actor App Surface

An **Actor App Surface** is the windowed interface of an Actor.

It is not a separate authority principal and it is not the Actor itself.

Examples:

```text
@VideoBoss       persistent service Actor
VideoBoss window Actor App Surface
video Agents     replaceable executors
```

An Actor App Surface may include:

- Actor identity and `@address`;
- current Production context;
- Production role;
- required and optional inputs;
- Actor-specific configuration controls;
- Production-specific saved settings;
- global/private defaults owned by the Human;
- upstream and downstream Actor relationships;
- selected Gummies;
- available capabilities and published Molds;
- current Agent family and locality options;
- cost and retention disclosure;
- validation and readiness state;
- previous Run outputs and Receipts;
- explicit save, reset, use-as-default, and revoke actions.

The surface opens as a normal Gummy OS window and remains draggable, resizable, minimizable, maximizable, closable, pinnable, and restorable.

Closing the window never deletes the Actor or its saved Production configuration.

## 8. Production-context mode and standalone mode

The same Actor App Surface can open in two modes.

### Production-context mode

Opened from a Production, Actor Plan, roster, or Production-scoped `@mention`.

It must show a persistent context indicator:

```text
Production: Ranch Day
Actor: @VideoBoss
Configuration: production:ranch-day / v3
```

All edits apply to that Production Actor Configuration unless the Human explicitly promotes a setting elsewhere.

### Standalone mode

Opened directly from the Gummy Bar, Actor search, or `@address` without a current Production.

It may show:

- Actor-global information;
- Human-owned private defaults;
- connected services or collaborators;
- recent Productions using the Actor;
- saved Production configurations;
- reusable presets;
- available capabilities;
- pending approvals and Receipts.

Standalone mode must not merge all Production data into one global memory pool.

A Human may explicitly:

```text
Open configuration from Production
Duplicate configuration into another Production
Save selected settings as my default
Propose an Actor memory/profile update
```

No Production-specific learning becomes Actor-global memory automatically.

## 9. Window identity and concurrent contexts

One Actor may participate in multiple Productions at the same time.

Window identity must therefore include context.

Recommended key:

```text
actor-surface:{actorId}:{productionId | standalone}:{surfaceId}
```

Examples:

```text
actor-surface:actor:videoboss:production:ranch-day:main
actor-surface:actor:videoboss:production:sable-trailer:main
actor-surface:actor:videoboss:standalone:main
```

The shell must never silently reuse a window from the wrong Production.

Every Production-scoped Actor window displays its Production name, role, save state, and readiness state without relying on color alone.

## 10. State layers

The runtime must keep these layers distinct.

### Layer 0 — application package and capability descriptor

Versioned code, UI, schemas, declared capabilities, supported executors, and compatibility information.

### Layer 1 — Actor canonical state

Stable identity, `@address`, ownership, published capabilities, Molds, public metadata, status, and authoritative location.

### Layer 2 — Human-to-Actor private relationship state

The Human's private connection, pinned state, local defaults, preferred runtime, spending preferences, and approved portable profile.

### Layer 3 — Actor-to-Actor relationship state

For example:

```text
@Hoyt × @VideoBoss
```

This may contain approved likeness references, allowed collaborators, purpose restrictions, audience rules, capability limits, expiry, revocation, and retention rules.

### Layer 4 — Production Actor Configuration

Settings for one Actor in one Production, including inputs, role, desired behavior, output contract, dependencies, and validation state.

### Layer 5 — Production Run snapshot

Immutable versions of every configuration and policy used for one Make Production attempt.

### Layer 6 — ephemeral execution state

Progress events, streaming output, temporary caches, transient model context, and recoverable runtime state.

Ephemeral state may be discarded after terminal evidence is created. It must never be confused with durable Actor memory.

## 11. Production Actor Configuration

Each participating Actor receives a versioned Production-specific configuration.

It should record:

- Production ID;
- Actor ID;
- participant role;
- surface and capability version;
- active Mold and relevant Links/bindings;
- selected input Gummies;
- Actor-specific settings;
- requested capability;
- accepted input/output contracts;
- upstream and downstream Actor IDs;
- locality and privacy choice;
- cost ceiling;
- retention and contribution choice;
- approval requirements;
- validation result;
- readiness state;
- saved revision and hash;
- provenance and editor identity.

Recommended readiness states:

```text
not-started
needs-input
needs-permission
needs-configuration
invalid
ready
locked-for-run
```

A configuration is data, not authority. The active Mold, Master Control policy, and task-specific Grant still govern execution.

## 12. Service Actors and companion applications

Applications such as 3D-Bee, ImageHoss, and VideoBoss should be integrated as **service Actors with Actor App Surfaces**.

The service Actor supplies continuity and addressability. The application surface supplies visual configuration. Agents supply execution.

```text
@ImageHoss
├── ImageHoss Actor App Surface
├── published image/reference capabilities
├── Production-specific settings
├── browser/cloud/native Agent options
└── Returns and Receipts

@VideoBoss
├── VideoBoss Actor App Surface
├── storyboard/video capabilities
├── Production-specific settings
├── browser/cloud/native Agent options
└── Returns and Receipts

@3D-Bee
├── 3D-Bee Actor App Surface
├── modeling/scene capabilities
├── Production-specific settings
├── browser/cloud/native Agent options
└── Returns and Receipts
```

Not every small utility must become an Actor. An application should receive a service Actor when it needs stable identity, persistent relationships, published capability, Production participation, permissions, memory/configuration, or provider-independent continuity.

## 13. Capability and setup contract

Each service Actor must publish a versioned setup contract.

Minimum declaration:

- capability ID and version;
- supported Production roles;
- required and optional input types;
- output types;
- configuration schema;
- validation rules;
- setup dependencies;
- execution dependencies;
- accepted Molds and Agent classes;
- locality options;
- privacy and retention options;
- estimated cost model;
- approval requirements;
- failure and retry behavior;
- compatibility/migration policy.

Conceptual example:

```ts
type ActorAppDescriptor = {
  id: string;
  actorId: string;
  surfaceId: string;
  version: string;
  displayName: string;
  capabilityIds: string[];
  supportedRoles: string[];
  setupSchemaRef: string;
  acceptedInputTypes: string[];
  outputTypes: string[];
  setupDependencyKinds: string[];
  executionDependencyKinds: string[];
  supportedAgentFamilies: string[];
  localityOptions: string[];
  nativeBridgeCapabilities: string[];
  status: "active" | "deprecated" | "unavailable";
};
```

## 14. Guided setup order

Adding multiple service Actors to a Production should open their Actor App Surfaces with guidance in the useful order.

The order is determined by a **setup dependency graph**, not merely by mention order.

Example:

```text
@ImageHoss prepares identity/reference material
        ↓
@VideoBoss consumes references and configures shots
        ↓
@ProjectComposer configures assembly and delivery
        ↓
@GummyStorage configures preservation
```

A separate branch may run in parallel:

```text
@3D-Bee configures scene geometry
        └──────────────→ @VideoBoss
```

The Production window should provide a setup rail:

```text
1. ImageHoss       Ready
2. 3D-Bee          Needs input
3. VideoBoss       Waiting on 1 and 2
4. ProjectComposer Not started
5. GummyStorage    Ready
```

Guided setup behavior:

1. Open the next useful Actor App Surface.
2. Explain what this Actor needs and what it will produce.
3. Show inherited Production context and relationship-specific context.
4. Let the Human adjust and save configuration.
5. Validate without executing.
6. Mark readiness and move to the next setup step.
7. Keep prior windows available for visual comparison and revision.

The Human may rearrange windows and revisit any step. Dependency violations must be explained rather than silently corrected.

## 15. Actor Plan

An Actor Plan is the visible graph describing how Actors participate in one piece of Production work.

It includes both non-execution and execution roles.

Possible roles:

```text
context-contributor
represented-subject
executor
coordinator
router
reviewer
approver
recipient
publisher
storage
rights-holder
```

Not every Actor receives an Agent assignment.

For example, `@Hoyt` may contribute only an approved VideoBoss context slice while `@VideoBoss` receives the execution assignment.

The Actor Plan must distinguish:

- **setup edges** — what must be configured before another surface can validate;
- **context edges** — what permissioned information may flow;
- **execution edges** — what result becomes another Actor's input;
- **review edges** — who must inspect or approve;
- **storage edges** — where approved Gummies are preserved;
- **publication edges** — where output may be released.

Plans are graphs, not forced linear chains.

## 16. Plan compilation

A plan may be created from:

- `@mentions` in natural language;
- dragging Actors into a Production;
- dragging Gummies onto Actors;
- dragging outputs between Actor windows;
- selecting a saved Production template;
- expanding a collective Actor;
- explicit graph editing.

The compiler resolves:

- Actor IDs and kinds;
- requested participation roles;
- relationship-specific Molds and Links;
- Production Actor Configurations;
- required inputs and output contracts;
- setup and execution dependencies;
- approval gates;
- Context Envelopes;
- candidate Agents;
- data locality and cost;
- unresolved blockers.

Natural language proposes a plan. Master Control makes it explicit.

The Human can correct role inference before execution:

```text
@Hoyt is a represented subject, not an executor.
@GummyStorage receives finals and Receipts, not private source references.
@ProjectComposer runs only after VideoBoss approval.
Keep ranch photographs local.
```

## 17. Context Envelopes

Each execution node receives a task-specific Context Envelope.

The envelope contains only the minimum approved context required by that node.

```text
complete Actor memory
≠ execution context

complete Production state
≠ execution context
```

A Context Envelope may include:

- Run and node IDs;
- target Actor and actual Agent;
- task instruction;
- selected Production context;
- selected contributing Actor context refs;
- selected source Gummies and revisions;
- active Molds and relationship bindings;
- allowed capabilities;
- forbidden actions;
- output contract;
- locality, privacy, retention, and contribution rules;
- cost ceiling;
- provenance.

Context Envelopes must be inspectable in Master Control and identified by hash in Receipts.

## 18. Effective authority

Effective authority is the intersection of every applicable ceiling.

```text
Human authority
∩ initiating Actor policy
∩ contributing Actor policy
∩ service Actor policy
∩ active Mold
∩ Actor-to-Actor relationship rules
∩ Production policy
∩ Bowl policy
∩ Agent capability ceiling
∩ Task Lease
∩ task-specific Grant
∩ runtime/locality boundary
```

Adding an Actor, opening an app, dragging an object, saving configuration, connecting a provider, or signing in never creates ambient authority.

## 19. Make Production

**Make Production** is the explicit transition from editable setup to governed execution.

Before enabling it, Gummy OS must show:

- Production revision;
- participating Actors and roles;
- configuration readiness;
- actual or candidate Agents;
- source Gummies;
- expected outputs;
- data flow across Actor and runtime boundaries;
- required approvals;
- cost ceiling;
- locality;
- retention and contribution terms;
- unresolved warnings and blockers.

On confirmation:

1. Freeze the Production Run manifest.
2. Lock referenced configuration revisions for this Run.
3. Generate Work Orders for executor nodes.
4. Obtain or validate Human/Actor approvals.
5. Claim Task Leases.
6. Issue bounded Capability Grants.
7. Route Agents according to Master Control.
8. Stream progress without mutating the frozen plan.
9. Create result Gummies without altering source Gummies.
10. Produce terminal Returns and Receipts for success, denial, failure, cancellation, and expiry.
11. Update the editable Production through explicit result Links, not by rewriting history.

There is no hidden auto-run after the final setup window is saved.

## 20. Drag-and-drop composition

Drag and drop is a first-class Gummy OS interaction grammar.

Every drag operation creates or previews explicit typed intent. It never bypasses Mold, Master Control, Grant, audience, or data-flow rules.

| Drag source | Drop target | Proposed meaning |
| --- | --- | --- |
| Actor candy/window | Production | Add Actor as a participant and infer a role |
| Actor | Actor | Propose a relationship, handoff, or plan edge |
| Actor | Bowl | Propose Bowl membership |
| Gummy | Production | Add source/reference/working asset |
| Gummy | Actor | Assign approved input to that Actor's Production configuration |
| Gummy | Actor Plan node | Bind input to that exact node |
| Result Gummy | downstream Actor | Create an execution handoff edge |
| Production | storage Actor | Propose preservation/archive policy |
| Actor output port | Actor input port | Create a typed plan edge |
| Saved Actor configuration | another Production | Propose a versioned copy, never an implicit shared mutable record |

Rules:

- A drop produces a preview before consequential state changes.
- The preview names source, target, intended relation, data classes, Mold, required approval, and expected result.
- Invalid drops explain the missing capability or permission.
- Gold identifies a valid action or required response; purple identifies location/context; text and iconography carry the same meaning accessibly.
- Keyboard and touch alternatives must exist for every critical drag interaction.
- Cross-runtime or cross-owner drops always pass through Master Control.
- Dragging a source Gummy never transfers ownership or publication rights automatically.
- Dragging an Actor into a Production never executes the Actor.
- Dragging a result to another Actor modifies the editable plan; an active frozen Run is not silently rewritten.

Typed drag payload example:

```ts
type GummyDragIntent = {
  sourceKind: "actor" | "gummy" | "production" | "configuration" | "plan-node";
  sourceId: string;
  sourceRevision?: string;
  productionId?: string;
  suggestedAction?: string;
  dataClasses?: string[];
};
```

## 21. Production window

The Production opens as a normal Gummy OS window and serves as its visual headquarters.

Recommended regions:

### Header

- Production title and status;
- owner Actor;
- visibility;
- current revision;
- Make Production action;
- active Run status;
- Master Control shortcut.

### Roster

- participating Actors;
- roles;
- readiness;
- active Mold;
- assigned Agent where applicable;
- approval, offline, blocked, or running badges.

### Setup rail

- guided Actor App Surface order;
- required inputs;
- validation;
- unsaved state;
- blockers.

### Production Canvas

- Actor windows;
- Actor Plan graph;
- drag-and-drop relationships;
- selected Gummies and outputs.

### Gummy shelf

- source Gummies;
- approved references;
- intermediates;
- deliverables;
- quarantined objects;
- Returns and Receipts.

### Run history

- Run revisions;
- status;
- cost;
- actual Agents and locality;
- outputs;
- failures;
- retry/branch actions.

A Production may use multiple Bowls, but the Production window remains the durable top-level view.

## 22. Master Control window

Master Control is the complete visual control room for the system.

It remains a normal Gummy OS window, not a hidden settings website.

Primary views:

```text
Productions
Actors
Actor relationships
Actor Plans
Agents
Molds
Grants and Task Leases
Data flow and synchronization
Gummy Boxes and storage
Native Bridges
Costs
Returns and Receipts
Revocation and locks
```

Master Control must support both global and Production-scoped inspection.

Examples:

```text
Production → @Hoyt → @Hoyt × @VideoBoss binding
→ selected reference Gummies → Context Envelope
→ actual VideoBoss Agent → result clip → Receipt
```

```text
@VideoBoss → Productions using it
→ saved configurations → active Agents
→ data received → outputs created → retention status
```

Opening an object from Master Control should open the same canonical object editor used elsewhere rather than a disconnected duplicate settings form.

Master Control must answer:

- Who or what participates?
- What role does each Actor have?
- Which Agent actually performs each execution?
- Which Mold and Grant authorize it?
- What data enters and leaves each Actor?
- What is Production-specific versus Actor-global?
- Where does authoritative state live?
- What is retained, shared, contributed, or published?
- What costs money?
- What is blocked, revocable, or currently leased?
- What evidence proves the outcome?

## 23. Personal and external Actors

A Production may include another person's Actor without that Human being present at execution time only when prior authorization covers the exact relationship and purpose.

Example:

```text
@Hoyt × @VideoBoss

allowed:
- approved likeness references
- approved beagle references
- private family video
- Hayden as collaborator

blocked or approval-required:
- public release
- commercial use
- voice cloning
- unknown service Actor
```

The external Actor contributes a context slice, not its entire memory.

Revocation behavior:

- future Runs using the revoked relationship are blocked;
- an unstarted Work Order is denied;
- active work follows the declared revocation policy and must stop at the next safe boundary when required;
- completed historical Receipts remain as evidence;
- revocation never silently deletes another Actor's source ownership or prior evidence.

## 24. Rights, audience, and return policy

Production participation does not imply ownership, publication rights, commercial rights, training rights, or contribution rights.

A Production should be capable of recording:

- Production owner and producer Actors;
- source Gummy ownership;
- creator and operating Agent for each result;
- represented Actors appearing in media;
- active Molds authorizing representation;
- credit obligations;
- approval obligations;
- commercial/publication permissions;
- transferable and non-transferable rights;
- licensing/acquisition availability;
- retention and contribution terms.

A service Actor may publish a Return policy such as:

```text
private result only
aggregate operational telemetry
shared result
optional contribution
research pool with explicit approval
paid contribution
```

The selected policy is visible before Make Production and recorded in the Run snapshot and Receipt.

Public discovery, corporate scanning, licensing marketplaces, and acquisition workflows are downstream products. The runtime only needs truthful visibility and transferable rights metadata at this stage.

## 25. Persistence and authoritative state

Structured state should use IndexedDB or the accepted successor architecture.

Real Gummy bytes should use OPFS or another explicitly governed byte store.

Optional synchronization may use a Gummy Box provider.

Persist at minimum:

- Production records and revisions;
- participant records;
- Production Actor Configurations;
- Actor Plan revisions;
- window positions and Production layout;
- Run manifests and statuses;
- source/result Gummy metadata and hashes;
- Work Orders, Task Leases, Grants, Returns, and Receipts;
- relationship and revocation state;
- migration versions.

Every Production, Actor, configuration, Gummy, and Run identifies its authoritative location.

Opening an Actor outside a Production may show references to its Production configurations, but one Production must never gain write access to another Production's state without an explicit Link, copy, share, or Grant.

## 26. Browser, cloud, and native execution

The Actor-first Product interface must remain stable across runtimes.

```text
Actor App Surface inside Gummy OS
        ↓
Actor capability contract
        ↓
Agent routing
        ↓
browser | governed server/cloud | native Linux | future phone/on-device
```

For native applications:

- the authoritative user-facing setup surface still opens inside Gummy OS;
- the surface communicates through a typed capability adapter;
- raw host application, shell, process, filesystem, or device authority is never implied;
- native execution requires an explicit Bridge, Mold, Master Control approval, task-specific Grant, locality disclosure, and Receipt;
- only declared state classes synchronize between WebOS and native runtime;
- the actual native Agent identity appears in Task Leases, Returns, and Receipts;
- a disconnected native executor produces visible blocked/offline state rather than a hidden fallback.

The browser-first implementation may initially use deterministic or web-backed executor adapters for 3D-Bee, ImageHoss, VideoBoss, ProjectComposer, and GummyStorage while preserving the final contract.

Do not import native application code directly into the shell merely to make a demo. Stabilize the Actor App Surface and capability contract first.

## 27. Native app state boundary

A native app may have its own internal files and caches, but Gummy OS recognizes only state explicitly exported through its adapter.

Declared exchange classes may include:

```text
configuration snapshot
selected source references
job manifest
progress event
result artifact
application project file
validation report
Return
Receipt evidence
```

Undeclared native state is not Actor memory and is not synchronized automatically.

Production-specific native project state should be addressable by Production ID and Run ID so opening the same app for another Production cannot overwrite it.

## 28. Failure and recovery

The runtime must handle:

- missing Actor;
- incompatible capability version;
- unresolved Mold;
- permission denial;
- expired relationship;
- missing source Gummy;
- invalid configuration;
- unavailable Agent;
- disconnected native Bridge;
- cost ceiling exceeded;
- partial output;
- malformed result;
- lost browser context;
- Run cancellation;
- storage quota or provider failure.

Required behavior:

- preserve valid saved configuration;
- never overwrite source Gummies;
- identify the blocked node and reason;
- produce terminal evidence for denied/failed/cancelled work;
- allow retry from an explicit safe boundary;
- permit replacing an unavailable Actor or Agent in the editable plan;
- create a new Run snapshot after plan changes;
- preserve accepted outputs from partial Runs according to Production policy;
- never claim completion without acceptance evidence.

## 29. Data model sketches

These are implementation guides, not final schema files.

### Production

```ts
type Production = {
  schema: "gummy.production/v0";
  id: string;
  title: string;
  description?: string;
  creatorHumanId: string;
  ownerActorId: string;
  publicActorId?: string;
  status:
    | "draft"
    | "configuring"
    | "ready"
    | "running"
    | "review"
    | "completed"
    | "blocked"
    | "cancelled"
    | "archived"
    | "transferred";
  visibility: "private" | "invite" | "unlisted" | "public";
  participantIds: string[];
  bowlIds: string[];
  actorPlanIds: string[];
  activeActorPlanId?: string;
  runIds: string[];
  gummyIds: string[];
  deliverableIds: string[];
  rightsPolicyRef?: string;
  publicationPolicyRef?: string;
  storagePolicyRef?: string;
  authoritativeLocation: string;
  revision: string;
  createdAt: string;
  updatedAt: string;
};
```

### Production participant

```ts
type ProductionParticipant = {
  id: string;
  productionId: string;
  actorId: string;
  roles: string[];
  source: "creator" | "mention" | "drag" | "invite" | "template";
  moldId?: string;
  relationshipLinkIds: string[];
  configurationId?: string;
  assignedAgentId?: string;
  approvalState: "not-required" | "pending" | "approved" | "denied";
  status: "invited" | "configuring" | "ready" | "blocked" | "active" | "removed";
};
```

### Production Actor Configuration

```ts
type ProductionActorConfiguration = {
  id: string;
  productionId: string;
  actorId: string;
  surfaceId: string;
  capabilityId: string;
  capabilityVersion: string;
  role: string;
  moldId?: string;
  relationshipLinkIds: string[];
  inputGummyIds: string[];
  settingsSchemaRef: string;
  settings: unknown;
  upstreamActorIds: string[];
  downstreamActorIds: string[];
  outputContract: unknown;
  localityPolicy: unknown;
  retentionPolicy: unknown;
  contributionPolicy: unknown;
  costCeiling?: unknown;
  validation: unknown;
  readiness:
    | "not-started"
    | "needs-input"
    | "needs-permission"
    | "needs-configuration"
    | "invalid"
    | "ready"
    | "locked-for-run";
  revision: string;
  hash: string;
  updatedBy: string;
  updatedAt: string;
};
```

### Production Run

```ts
type ProductionRun = {
  schema: "gummy.production-run/v0";
  id: string;
  productionId: string;
  productionRevision: string;
  actorPlanRevision: string;
  configurationRevisionIds: string[];
  sourceGummyRevisions: Array<{ id: string; revision: string; hash: string }>;
  manifestHash: string;
  status:
    | "planned"
    | "awaiting-approval"
    | "queued"
    | "running"
    | "paused"
    | "blocked"
    | "partially-completed"
    | "completed"
    | "failed"
    | "cancelled";
  workOrderIds: string[];
  taskLeaseIds: string[];
  grantIds: string[];
  returnIds: string[];
  receiptIds: string[];
  resultGummyIds: string[];
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
};
```

## 30. Required runtime commands

The implementation should expose typed operations equivalent to:

```text
createProduction
openProduction
addActorToProduction
removeActorFromProduction
openActorSurface
saveProductionActorConfiguration
validateProductionActorConfiguration
compileActorPlan
previewProductionRun
makeProduction
pauseProductionRun
cancelProductionRun
retryProductionRunNode
linkRunResultsToProduction
promoteSettingToActorDefault
revokeActorRelationship
```

Each consequential command returns structured success, denial, or failure information and generates Receipt evidence where appropriate.

## 31. Event model

Useful runtime events include:

```text
production.created
production.actor-added
production.actor-removed
production.configuration-saved
production.configuration-invalid
production.ready
actor-surface.opened
actor-plan.compiled
actor-plan.changed
production-run.previewed
production-run.approved
production-run.started
production-run.node-started
production-run.node-blocked
production-run.node-completed
production-run.completed
production-run.failed
production-run.cancelled
production.result-linked
relationship.revoked
```

Events do not create authority and must not contain undeclared private context.

## 32. Minimal reference Production

```text
Production: Ranch Day
Owner: @Hayden
Visibility: private

Participants:
@Hayden          creative owner and context contributor
@Hoyt            represented participant and optional reviewer
@ImageHoss       reference preparation service
@3D-Bee          scene/asset service
@VideoBoss       video generation service
@ProjectComposer assembly service
@GummyStorage    preservation service
```

Setup behavior:

1. `@Hoyt` resolves the pre-approved `@Hoyt × @VideoBoss` relationship.
2. ImageHoss opens to select or prepare approved references.
3. 3D-Bee opens to configure optional ranch/Mule scene assets.
4. VideoBoss opens with the selected references and scene outputs available, but not yet executed.
5. ProjectComposer opens to define assembly, soundtrack, titles, and final project format.
6. GummyStorage opens to choose source, working, final, Receipt, and retention policy.
7. Master Control shows all Actor roles, context slices, Agents, cost, data movement, and approval gates.
8. Hayden selects **Make Production**.
9. A frozen Production Run is created.
10. Agents execute in the approved graph order.
11. Source Gummies remain unchanged.
12. Results, project files, Returns, and Receipts are linked back to Ranch Day.
13. Closing and reopening Gummy OS restores the Production, windows, saved configurations, Run history, and understandable state.
14. Opening VideoBoss standalone later shows Ranch Day as one saved Production context without leaking Ranch Day settings into another Production.

## 33. Automated acceptance criteria

The runtime milestone is accepted only when automated tests prove:

1. A Human can create a Production.
2. Actors can be added through `@mention`, search, and drag/drop.
3. Personal and service Actors remain distinct from Agents and applications.
4. Adding Actors does not execute work.
5. Each service Actor opens an Actor App Surface inside Gummy OS.
6. Setup surfaces open in dependency-aware guidance order.
7. Production-context windows are visibly and programmatically scoped to the correct Production.
8. The same Actor can be open in two Productions without state collision.
9. Production Actor Configuration saves, validates, versions, and survives browser restart.
10. Opening an Actor standalone exposes saved Production contexts without automatically merging them.
11. Promotion of Production settings to Actor defaults requires explicit action.
12. Dragging a Gummy onto an Actor creates a typed input proposal.
13. Dragging an Actor into a Production creates a participant proposal.
14. Dragging an output to another Actor creates an editable plan edge.
15. Drag/drop never grants ambient authority or starts execution.
16. The Actor Plan distinguishes setup, context, execution, review, storage, and publication edges.
17. Master Control previews participants, Agents, Molds, context, data flow, cost, locality, and approvals.
18. Make Production is blocked while required configurations or permissions are unresolved.
19. Make Production creates an immutable Production Run snapshot.
20. Executor nodes generate Work Orders, Task Leases, and Grants.
21. Context Envelopes contain only approved task-specific slices.
22. Deterministic reference Agents can execute the full Ranch Day graph.
23. Source Gummies remain byte-identical.
24. Result Gummies carry provenance and Links.
25. Every terminal node creates a Return and Receipt.
26. Denial, failure, cancellation, and expiry create truthful terminal evidence.
27. Revoking `@Hoyt × @VideoBoss` blocks future Runs using that relationship.
28. Completed historical evidence remains after revocation.
29. A disconnected native executor is visibly blocked and receives no fallback authority.
30. Native invocation is denied without the explicit Bridge/Mold/Grant path.
31. Reload and a fresh browser context restore the Production and Run history.
32. Critical drag/drop actions have keyboard and touch equivalents.
33. Accessibility, visual regression, persistence, migration, and failure-path suites pass.
34. The exact production-like preview commit and automated evidence are recorded before founder review.

## 34. Implementation order

Codex should implement in this order unless a new accepted work order changes it:

1. Add Production, participant, configuration, and Production Run schemas/types.
2. Add versioned persistence and deterministic migrations.
3. Implement first-class `openActorSurface(actorId, productionId?)` shell behavior.
4. Implement the Production window, roster, setup rail, and Gummy shelf.
5. Create deterministic reference service Actors for ImageHoss, 3D-Bee, VideoBoss, ProjectComposer, and GummyStorage.
6. Implement Actor App Descriptors and Production Actor Configuration persistence.
7. Implement dependency-aware guided setup without real execution.
8. Implement Actor Plan compilation and visual inspection.
9. Implement Master Control Production scope and Run preview.
10. Implement Make Production with deterministic browser-backed Agents.
11. Implement typed drag/drop intents and accessible equivalents.
12. Implement full Returns, Receipts, failure, retry, revocation, and return continuity.
13. Stabilize the capability adapter contract.
14. Only then bind real cloud or native executors behind the same service Actors.
15. Add native capabilities one narrow Bridge at a time; never replace the WebOS contract with raw native access.

## 35. Non-goals for the first runtime milestone

Do not block the core proof on:

- a public Actor marketplace;
- broad corporate Production search;
- licensing or acquisition checkout;
- global federation;
- autonomous rights negotiation;
- automatic public-figure verification;
- arbitrary third-party native embedding;
- full multi-provider routing;
- automatic Actor memory rewriting;
- unrestricted Agent-to-Agent communication;
- replacing the Gummy Bar, Bowl, Gummy Box, Work Order, or Receipt model.

The runtime should preserve extension points for those futures without pretending they are already proven.

## 36. Architecture invariants

- Human authority remains above Actor and Agent.
- Production is the durable undertaking; Production Run is the frozen execution attempt.
- Actor and Agent never collapse.
- An Actor App Surface is a view/controller, not an authority principal.
- Application and service Actor remain distinct.
- Adding or opening an Actor never executes work.
- Make Production is the explicit execution transition.
- Production-specific configuration never becomes global Actor memory automatically.
- One Actor may have separate simultaneous Production contexts.
- Mold remains the operating contract.
- Master Control governs assignment, data flow, synchronization, approval, and revocation.
- Effective authority is the intersection of all relevant ceilings.
- Drag/drop creates explicit typed proposals, not ambient authority.
- Plans are graphs, not forced linear chains.
- Only execution nodes require Agents.
- Context is sliced per node and relationship.
- Source Gummies remain unchanged.
- Every consequential boundary and terminal outcome is receiptable.
- Provider and runtime remain replaceable.
- Native execution remains behind a deny-by-default Bridge.
- The visual Gummy OS experience remains useful before native integration.

## 37. Final runtime statement

```text
Start a Production.
Add or @mention Actors.
Open their windows.
Configure each Actor for this Production.
Save the settings.
Inspect the plan and permissions.
Make Production.
Let governed Agents perform beneath the Actors.
Move Gummies through the work.
Keep the Returns and Receipts.
Close it.
Come back later.
Continue from the same understandable Production.
```

> **Actors participate. Actor App Surfaces configure. Production Runs execute. Gummies bind the work together. Master Control keeps the whole system visible and governed.**
