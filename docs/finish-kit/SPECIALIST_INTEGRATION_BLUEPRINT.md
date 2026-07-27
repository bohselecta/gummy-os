# Specialist Integration Blueprint

## Purpose

This document turns the accepted ImageHoss, VideoBoss, and Meshmallow product contracts into one implementable adapter pattern without pretending the three applications are identical.

Gummy OS is responsible for:

- Production scope;
- Human authority;
- participant and Actor configuration;
- Context Envelopes;
- Work Orders;
- Molds;
- Task Leases;
- Capability Grants;
- platform Runs;
- result Gummies and Links;
- Returns and Gummy OS Receipts;
- user-facing orchestration and recovery.

Each specialist remains responsible for:

- its native product model and UI;
- runtime discovery;
- native Jobs;
- native Assets/packages/takes/checkpoints;
- specialist comparison/review logic;
- specialist acceptance records;
- specialist Receipts and evidence;
- route-specific execution behavior.

## Shared relationship

```text
Human intent
→ Production-scoped specialist configuration
→ deterministic compile/preview
→ save isolated revision
→ Make Production
→ frozen Context Envelope
→ Work Order + Mold + Lease + Grant
→ actual eligible specialist Agent/runtime
→ native Job and native evidence
→ result import
→ compare/review
→ Human acceptance
→ typed handoff
→ Return + linked Receipts
```

## Two truthful modes

### Configure

Allowed:

- read the minimum permitted Production context;
- assign Assets and references;
- edit structured direction;
- validate rights and required fields;
- discover capabilities;
- estimate cost;
- compile a deterministic package;
- save an isolated configuration revision;
- show blockers and limitations.

Forbidden:

- creative model call;
- provider submission;
- Blender execution;
- credit spend;
- native Job creation;
- claim that work has started.

### Execute

Allowed only after **Make Production** freezes the current configuration and authority records.

## Shared adapter contract

The concrete TypeScript/JavaScript/Rust shape may differ by repository, but every specialist integration must support equivalent operations:

```ts
type SpecialistAdapter<Configuration, Package, WorkOrder, State, Return> = {
  discover(input: DiscoveryContext): Promise<CapabilitySnapshot>;
  validateConfiguration(input: Configuration): Promise<ValidationResult>;
  compilePackage(input: FrozenConfigurationContext): Promise<Package>;
  execute(input: WorkOrder): Promise<ExecutionStart>;
  recover(input: JobReference): Promise<State>;
  cancel(input: CancelRequest): Promise<Return>;
  inspectResult(input: JobReference): Promise<Return>;
};
```

### `discover`

Returns facts only:

- adapter/version;
- ready/degraded/offline/unavailable;
- locality;
- runtime identity/version;
- supported operations/models/formats;
- limitations;
- checked timestamp;
- trust/session requirements.

Discovery never grants authority.

### `validateConfiguration`

Checks:

- required fields;
- reference/Asset roles;
- locks and contradictions;
- rights/audience/retention;
- deliverable compatibility;
- route capability;
- cost ceiling;
- context minimums;
- downstream requirements.

Validation returns blockers, warnings, tradeoffs, and readiness. It does not silently choose through a lock conflict.

### `compilePackage`

Must be deterministic from frozen structured input. The same canonical input and compiler version produce the same package hash.

A route-specific provider payload is derived from the canonical package. It is not the canonical intent.

### `execute`

Must validate the intersection of:

```text
Human approval
∩ Production Run
∩ Context Envelope
∩ active Actor
∩ actual Agent/runtime
∩ active Mold
∩ active Task Lease
∩ Capability Grant
∩ current capability discovery
∩ cost/locality/privacy/rights policy
```

No missing component is inferred.

### `recover`

Inspects the existing native Job. It does not create a duplicate Job when a prior request may have reached the runtime/provider.

### `cancel`

Cancels only the Job named by the active authority and adapter. Cancellation is best-effort where a provider cannot guarantee immediate stop, and that limitation is visible.

### `inspectResult`

Returns normalized terminal state, artifacts, hashes, costs, provider/runtime facts, limitations, evidence links, and specialist Receipt references.

## Shared state machine

```text
configuration-draft
→ configuration-valid
→ frozen
→ blocked | ready
→ queued
→ running
→ completed | failed | denied | cancelled | expired | recovery-required
→ awaiting-acceptance
→ accepted | rejected | branched
```

Rules:

- `completed` does not automatically mean `accepted`;
- blocked configuration creates no Job;
- an ambiguous external call becomes `recovery-required`, not a silent retry;
- accepted output remains immutable;
- a revision creates a new Run/Job lineage;
- previous Runs never rewrite themselves to match the latest configuration.

## Shared versioned records

Use existing repository conventions where they are already stronger. Preferred platform-facing records:

```text
gummy.specialist-capability-snapshot/v1
gummy.specialist-package-envelope/v1
gummy.specialist-job-reference/v1
gummy.specialist-execution-return/v1
gummy.specialist-receipt-link/v1
gummy.specialist-acceptance/v1
```

These wrappers do not replace native ImageHoss, VideoBoss, or Meshmallow records. They name and preserve them.

## Receipt linking

A platform Receipt should include references similar to:

```json
{
  "specialist": {
    "applicationId": "app:imagehoss",
    "repository": "bohselecta/imagehoss",
    "protocolVersion": "imagehoss.v5-1",
    "jobId": "...",
    "receiptId": "...",
    "receiptHash": "sha256:..."
  }
}
```

The specialist Receipt remains separately inspectable. Never copy selected fields into a flattened platform Receipt and discard the source evidence.

## Authentication and route classes

### Browser-only deterministic route

Used for:

- tests;
- sample Production;
- package compilation;
- simulated study/take/scene proof.

Must say `simulation: true` or equivalent.

### Authenticated local companion route

Used for ImageHoss and Meshmallow.

Requirements:

- loopback only unless a separately accepted transport exists;
- ephemeral session or explicit pairing;
- strict origin allowlist;
- short-lived capability/session token;
- no ambient filesystem browser;
- no arbitrary workflow/Python/shell input;
- exact operation/job ownership;
- bounded message sizes;
- fail closed on stale/mismatched session;
- sanitized discovery facts;
- no secrets or absolute private paths returned to the browser.

### Trusted server broker route

Used for cloud model/provider execution such as VideoBoss rendering.

Requirements:

- provider credentials stay server-side;
- schema validation;
- explicit provider/model allowlist;
- idempotency key;
- cost ceiling;
- timeouts and no silent unsafe retry;
- normalized progress and terminal states;
- result import/hash;
- cancellation when supported;
- provider request/job ID retained;
- logs redact source content and credentials.

## ImageHoss mapping

### Current native types

Existing ImageHoss main already contains:

- `Direction`;
- `ImageReference` and nine reference roles;
- `RouteOption`;
- `ComfyCapability`;
- `ComfyExecutionInput`;
- original/proxy `GeneratedAssetPackage`;
- `ComfyJob`;
- `StudyVariant`;
- `AcceptedAsset`;
- V5-1 WorkOrder/Job/Receipt construction;
- `VideoBossHandoff`;
- durable project-scoped Assets and `.hoss`.

### Required compatible expansion

Add or adapt:

- explicit deliverable contract;
- absolute locks;
- creative direction vs preferences;
- reference extraction/ignore/strength/lock/rights fields;
- exploration budget;
- acceptance contract;
- downstream protected/movable regions;
- prompt-package revision/hash/compiler version;
- comparison records;
- delta revision lineage;
- Production context ID without mutable cross-Production sharing.

Do not break existing R1-R5 bundles. Import older versions through a deterministic migration that supplies explicit defaults and records the limitation.

### Preferred package

```text
imagehoss.prompt-package/v1
```

Minimum fields:

- id/version/revision/hash/compiler;
- Production/configuration IDs;
- target use and deliverable;
- direction summary;
- locks;
- reference assignments;
- exploration;
- exclusions;
- positive/negative semantics;
- route policy and current capability snapshot reference;
- seed/count/dimension policy;
- cost/locality/privacy/rights;
- acceptance;
- downstream requirements;
- unresolved risks;
- source evidence references.

### Execution mapping

```text
Gummy Work Order
→ AuthorizedImageHossWorkOrder
→ ImageHoss native WorkOrder/Job
→ Comfy bridge owned prompt
→ original/proxy Asset package
→ native Receipt
→ Gummy specialist execution Return
→ result Gummies
→ acceptance Link
→ optional VideoBoss handoff
```

### ImageHoss failure rules

- bridge missing: `capability-unavailable`, no Job;
- model/checkpoint missing: blocker with exact supported requirement;
- stale configuration/capability snapshot: require revalidation;
- prompt submission ambiguous: recover by prompt/job ID;
- hash mismatch/tampered Asset: fail closed and quarantine;
- partial output: never auto-accept;
- cancellation after runtime started: preserve truthful provider/runtime outcome.

## VideoBoss mapping

### Current native systems

Existing VideoBoss main contains:

- deterministic planner;
- production board;
- shot configuration;
- model registry/router;
- Cost Shield;
- deterministic simulator adapter;
- review and seven-axis scoring;
- continuity memory;
- exports;
- ImageHoss handoff consumer;
- shared Project/Asset/WorkOrder/Job/Receipt records.

### Required compatible expansion

Add:

- Production context ID and isolated configuration;
- canonical sequence package;
- versioned shot packet;
- accepted continuity Assets and protected/movable regions;
- provider-neutral take request;
- real broker adapter;
- normalized provider progress/result;
- take comparison and role-specific acceptance;
- correction/delta lineage;
- linked Gummy OS Return/Receipt;
- explicit ImageHoss repair and Meshmallow spatial handoffs.

### Preferred package set

```text
videoboss.sequence-package/v1
videoboss.shot-packet/v1
videoboss.take-request/v1
videoboss.take/v1
videoboss.take-acceptance/v1
```

### Real provider selection rule

Codex must inspect current environment, existing provider code, available secrets, and provider suitability.

Choose one route only when:

- API usage is supported and current;
- credentials exist or can be supplied without browser exposure;
- cost can be bounded;
- job status/cancellation/result retrieval are available;
- output rights and retention can be disclosed;
- the route can preserve the existing adapter abstraction.

Do not hard-code a fashionable provider merely to say a provider is wired. When no live credential exists, complete the broker contract and mock/live-smoke harness and leave the UI truthfully capability-gated.

### VideoBoss failure rules

- cost ceiling exceeded: block before submission;
- provider result ambiguous: recovery-required;
- provider lacks a requested lock/control: visible tradeoff before execution;
- failed take: prior accepted take remains unchanged;
- simulator result: always `simulation: true` and visually distinct;
- memory lesson: Production/VideoBoss scoped until explicit ActorUpdateProposal.

## Meshmallow mapping

### Current native systems

Existing `bohselecta/3d-bee` main contains:

- World Seed UI;
- Scene Plan and typed operation schemas;
- Rust validation and exact plan digest;
- Human approval bound to a revision;
- short-lived execution sessions;
- reviewed Blender handler floor;
- authenticated IPv4 loopback supervisor transport;
- deterministic mock mode;
- Return/evidence foundations.

### Public-name compatibility

Current display name becomes Meshmallow. Preserve:

```text
repository: bohselecta/3d-bee
application ID: app:3d-bee
Actor ID: actor:3d-bee
legacy protocols: 3d-bee.*
```

New records may use `meshmallow.*` with explicit aliases and `legacyIdentity` metadata. Historical records are never rewritten.

### Required compatible expansion

Add:

- Production context and isolated world intent;
- structured locks/exploration/references/rights;
- deterministic scene-package preview;
- Gummy OS capability discovery wrapper;
- exact Make Production Work Order mapping;
- Job/recovery/cancel/Return normalization;
- durable accepted checkpoint and export import;
- `.blend`, FBX/GLB, textures, manifest and hashes when genuinely produced;
- engine handoff acceptance role;
- linked specialist/platform Receipts.

### Preferred package set

```text
meshmallow.world-intent/v1
meshmallow.scene-package/v1
meshmallow.execution-plan/v1
meshmallow.checkpoint/v1
meshmallow.engine-handoff/v1
```

### Meshmallow failure rules

- no supported Blender: capability unavailable, mock remains usable;
- stale plan digest: deny execution;
- expired/mismatched supervisor session: deny;
- unknown operation: deny;
- path escape or arbitrary Python/shell: deny;
- export missing or invalid: do not claim completion;
- Blender process lost: recover from owned session/job evidence or fail truthfully;
- attractive mesh is not manufacturing, safety, compliance, or finished-game evidence.

## Gummy OS integration file map

Codex must inspect exact current source before editing. Expected integration areas:

### Domain/runtime

- `src/core/production-runtime.js`
- `src/core/production-repository.js`
- `src/core/records.js`
- `src/core/contracts.js`
- `src/core/policy-engine.js`
- `src/core/schema-validator.js`
- `src/core/product-registry.js`

### UI

- `src/apps/production.js`
- `src/apps/actor-surface.js`
- `src/apps/master-control.js`
- `src/app.js`
- `src/production.css`
- `src/styles/*`

### Integrations

- `src/integrations/app-handoff.js`
- new `src/integrations/specialist-adapter.js`
- new `src/integrations/imagehoss.js`
- new `src/integrations/videoboss.js`
- new `src/integrations/meshmallow.js`

### Trusted routes

- `server/api.mjs`
- `server/session.mjs`
- new bounded server broker modules only where cloud execution requires them

Do not proxy a local loopback companion through the public Vercel server. The browser pairs directly with the authenticated local companion under the accepted local trust boundary.

### Schemas and fixtures

- versioned specialist configuration/package/return/link/acceptance schemas;
- deterministic golden Production fixture;
- legacy migration fixtures;
- capability unavailable/degraded/ready fixtures;
- successful, failed, denied, cancelled, stale, recovery-required fixtures.

### Tests

- unit tests for package compiler and authority intersection;
- integration tests for persistence, migration, adapter normalization, Receipt linking;
- E2E for configuration-no-execution and Make Production execution;
- capability unavailable and recovery paths;
- cross-Production isolation;
- source immutability;
- accessibility and visual regression;
- live smokes separated from deterministic CI.

## Cross-repository compatibility workflow

1. define additive specialist-native types and migrations;
2. publish exact specialist branch/head and protocol version;
3. add Gummy OS wrapper/adapter against that exact contract;
4. test old fixtures and new fixtures;
5. run cross-repository fixture roundtrips;
6. only then update registry release status/protocol versions;
7. preserve rollback to prior deterministic reference capability.

## Rollback

Every specialist integration must retain a safe rollback path:

- old stored Production state migrates forward but remains exportable;
- deterministic demo adapter remains available for tests;
- a failed real capability integration can be disabled without deleting Production configuration or native evidence;
- registry status can return to capability-required without lying about prior Jobs;
- accepted Assets/Receipts remain readable after adapter rollback.

## Completion gate

A specialist is integrated only when all are true:

- product-native configuration surface exists;
- configuration compiles deterministically and does not execute;
- actual capability state is truthful;
- Make Production is the only execution transition;
- authority intersection is enforced;
- native Job is preserved;
- recovery and cancellation exist;
- result import and exact hashes exist where bytes are produced;
- comparison/review and Human acceptance exist;
- downstream handoff exists where applicable;
- native and platform Receipts are linked;
- persistence/restart works;
- deterministic tests pass;
- live claim is backed by live evidence or explicitly not claimed.
