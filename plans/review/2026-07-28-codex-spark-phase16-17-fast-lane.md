# Codex Spark Fast Lane — Phase 16 + Phase 17 + Managed Runtime Boundary

**Status:** READY FOR SPARK EXECUTION PLANNING / STACKED DELIVERY / FOUNDER-GATED RELEASE  
**Date:** 2026-07-28 (America/Chicago)  
**Repository:** `bohselecta/gummy-os`  
**Purpose:** Move quickly across Living Collaboration, MCP execution interoperability, and managed-agent runtime compatibility without overwriting active work or reducing Gummy OS to a vendor runtime.

---

# 0. Executive order

Codex Spark may execute the next three architectural layers as one coordinated release train, but **not as one unstructured branch and not as one indivisible merge**.

The delivery must be stacked:

```text
Phase 16 accepted implementation
        ↓
Phase 17 standards and execution contracts
        ↓
Managed Runtime provider-neutral boundary
        ↓
Integrated deterministic proof
        ↓
Optional verified live-adapter proof
        ↓
Founder acceptance
        ↓
Exact-commit production release
```

The reason for combining them is architectural coherence:

```text
Human and social intent
→ governed Production formation
→ replaceable execution transport/runtime
→ Return and Receipt
→ Human acceptance
→ distribution
```

The reason for stacking them is safety:

- Phase 16 is already being implemented by another Codex process.
- Spark must not edit the same runtime files against a stale base.
- MCP and managed runtimes belong beneath Gummy governance, not around or above it.
- A vendor preview must not become a hidden source of identity, authority, money, or canonical state.

Canonical rule:

> **Move fast by isolating ownership and proving interfaces, not by allowing concurrent agents to rewrite the same architecture.**

---

# 1. Current release state

Phase 15 is complete, merged, deployed, production-verified, and closed.

Phase 16 — Living Collaboration is the active product implementation layer.

Phase 17 — MCP Execution Fabric Integration is designed but held behind Phase 16.

The managed-agent runtime update is a provider-compatibility boundary that extends Phase 17. It is not a new identity or Production model.

Spark must discover and record the actual current state before editing:

```text
main commit
active Phase 16 issue
active Phase 16 implementation PR and head commit
Phase 16 design PR lineage, if still relevant
Phase 17 issue
open branches touching Phase 16 runtime files
production deployment commit
rollback deployment
```

Do not assume PR #34 remains the active implementation PR. Inspect the repository and use the current implementation head.

---

# 2. Non-negotiable preservation law

Do not delete, collapse, or silently rename:

```text
Human
Actor
Agent
Mold
Bowl
Session
Social Instance
Shared Vision
Production
Production Agreement
Production Pool
Contribution Ledger
Production Formation Event
Production Run
Actor Plan
Work Order
Task Lease
Grant
Master Control
Command Center
Gummy
Gummy Box
Return
Receipt
Distribution Plan
Place
Actor App Surface
```

Preserve all Phase 15 data, Place IDs, migrations, production recovery, security policy, visual system, and tests.

The Human-facing interface may use obvious verbs. The canonical object model remains machine-readable and visible in advanced inspection, Receipts, schemas, documentation, and LLM context.

Examples:

```text
Human surface                Canonical object
Open this group              Social Instance
Save this idea               Shared Vision
Agree how we will make it    Production Agreement
Choose your contribution     Production Pool authorization
See what needs attention     Command Center projection
Approve this                 Master Control decision
Make Production              Production Run boundary
Review the result            Return + acceptance
Send this somewhere          Distribution Plan
```

---

# 3. Agent ownership and conflict prevention

## 3.1 Existing Codex owns active Phase 16 runtime work

Until the active Phase 16 implementation reaches a merge-ready checkpoint, Spark must not modify files actively owned by that branch.

Spark must inspect the Phase 16 diff and generate an ownership map:

```text
Phase 16-owned runtime files
Phase 16-owned schemas
Phase 16-owned tests
Phase 16-owned migrations
Phase 16-owned UI surfaces
safe additive files
safe independent test fixtures
```

## 3.2 Spark may begin immediately on additive work

Before Phase 16 merges, Spark may create or refine only additive, non-conflicting artifacts:

- official-standard compatibility notes;
- provider-neutral schemas;
- adapter interfaces;
- deterministic conformance fixtures;
- test server design;
- threat model;
- dated announcement boundaries;
- migration strategy;
- integrated acceptance matrix;
- documentation cross-references.

It must not wire those contracts into active runtime files until it rebases onto the accepted Phase 16 head.

## 3.3 Rebase gate

After Phase 16 is accepted and merged:

1. fetch current `main`;
2. record the exact Phase 16 merge commit and production evidence;
3. rebase or recreate the Spark implementation branch from that exact `main`;
4. rerun all Phase 15 and Phase 16 verification before adding execution integration;
5. never resolve conflicts by choosing the Spark version wholesale over the Phase 16 implementation.

When a conflict reflects architecture, preserve the current accepted implementation and adapt the new interface around it.

---

# 4. Delivery structure

Use one release train with independently reviewable checkpoints.

## Checkpoint A — Phase 16 reconciliation

Purpose:

- accept current Living Collaboration objects as the governing social and economic layer;
- ensure Spark understands the real implementation rather than only design documents;
- create no MCP or vendor runtime dependency.

Exit conditions:

- Phase 16 tests pass;
- active object schemas and storage locations are documented;
- Social Instance, Shared Vision, Agreement, Pool, Ledger, Formation, Command Center, and Distribution behavior are mapped to actual code;
- no duplicate canonical store is proposed.

## Checkpoint B — Standards compatibility pack

Purpose:

- implement provider-neutral execution bindings;
- implement MCP compatibility against the final official specification;
- preserve Gummy governance.

Exit conditions:

- schemas compile;
- deterministic MCP task fixture passes;
- lifecycle mapping is exact and source-backed;
- completion remains separate from acceptance;
- no live provider is required for CI.

## Checkpoint C — Managed runtime boundary

Purpose:

- support persistent/scheduled/budgeted/snapshotted managed runtimes as replaceable workers;
- create a Google provider profile only after official verification;
- compensate for provider fail-open behavior with Gummy-owned fail-closed enforcement.

Exit conditions:

- universal runtime binding exists;
- provider environment state remains non-canonical;
- provider hook failure cannot authorize a Gummy operation;
- environment expiry and recovery are explicit;
- deterministic provider fixture passes.

## Checkpoint D — Integrated vertical proof

Purpose:

Prove the full chain without depending on a paid or preview external service.

Exit conditions:

- one complete local deterministic journey passes;
- Human input pause/resume passes;
- budget continuation passes;
- cancellation and recovery pass;
- Return, Receipt, acceptance, and Distribution remain distinct.

## Checkpoint E — Optional live interoperability proof

Purpose:

Use one real MCP or managed-runtime adapter only when credentials, official SDK support, and provider availability are verified.

Exit conditions:

- adapter is feature-gated;
- no sensitive canonical data is exposed;
- no false production-ready claim is made for preview infrastructure;
- deterministic path remains available when provider is absent.

---

# 5. Required read and verification order

Spark must read, in order:

1. `AGENTS.md`
2. current release and finish-kit documents
3. current Phase 16 issue and implementation PR
4. current Phase 16 code, schemas, tests, migrations, and evidence
5. `docs/ACTOR_FIRST_PRODUCTION_MODEL.md`
6. `docs/PRODUCTION_ACTOR_RUNTIME.md`
7. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
8. `docs/SOCIAL_LAYER.md`
9. current Work Order, Task Lease, Grant, Return, Receipt, Gummy Box, and Places contracts
10. Phase 17 issue and work order
11. official MCP 2026-07-28 specification, extension documents, release tag, and official SDK support matrices
12. official Google Gemini API / Managed Agent / Environment / trigger / hook / budget documentation relevant to the July 28 release

For MCP and Google runtime facts, use primary official specifications, release tags, SDK repositories, and API documentation. Do not implement from news summaries alone.

Record:

- exact protocol/spec version;
- exact SDK version used;
- language-specific support status;
- preview/GA status;
- missing host/server support;
- provider limitations;
- verification date.

---

# 6. Canonical execution abstraction

Do not make Work Orders directly vendor-shaped.

Prefer one universal binding, adapted to current schemas after inspection:

```text
gummy.runtime-binding/v1
```

Required concepts:

```text
id
actorId
agentId
productionId
workOrderId
productionRunId
taskLeaseId
grantId
moldId
budgetGrantId
returnAnchor
acceptancePolicy
receiptPolicy
canonicalStateVersion
runtimeProvider
runtimeClass
runtimeState
createdAt
updatedAt
expiresAt
transport
```

`runtimeProvider` examples:

```text
gummy-local
mcp
managed-google
cloud-provider
human
```

`runtimeClass` examples:

```text
browser
native
mcp-task
managed-environment
human-only
```

`transport` is a discriminated union.

## MCP transport

```text
kind: mcp-task
protocolVersion
serverId
serverRevision
serverCapabilities
hostCapabilities
taskId
applicationStateHandles
traceContext
```

## Managed runtime transport

```text
kind: managed-environment
provider
environmentId
interactionId
triggerId
scheduleId
snapshotId
budgetPolicy
hookPolicy
providerStatus
providerExpiresAt
```

## Local deterministic transport

```text
kind: deterministic-reference
fixtureId
clockId
faultProfile
```

Do not introduce a new canonical Work Order store when the existing Work Order can be extended or linked safely. The binding is an adapter/governance record, not a second Production system.

---

# 7. Required standards contracts

After inspecting current contracts, create or reconcile:

```text
gummy.runtime-binding/v1
gummy.mcp-task-binding/v1
gummy.mcp-server-descriptor/v1
gummy.mcp-app-surface/v1
gummy.execution-trace/v1
gummy.runtime-input-request/v1
gummy.runtime-checkpoint/v1
gummy.runtime-budget-report/v1
gummy.managed-runtime-profile/v1
```

Avoid redundant top-level objects. A specialized MCP task binding may be represented as an extension of the universal Runtime Binding when that preserves schema clarity.

## Required invariant

```text
Runtime Binding
≠ Work Order
≠ Task Lease
≠ Grant
≠ Return
≠ Receipt
≠ canonical Project state
```

---

# 8. MCP integration law

Canonical rule:

> **MCP may carry execution. Gummy defines identity, authority, ownership, Return, Receipt, and accepted Project truth.**

## 8.1 Stateless continuity

Do not depend on hidden transport sessions.

Continuity must use explicit Gummy and application handles:

```text
Actor ID
Production ID
Work Order ID
Production Run ID
Gummy IDs and revisions
application state handle
MCP task ID
Return anchor
```

An MCP task handle is execution continuity, not Project identity.

## 8.2 Task lifecycle

Map only the states and operations defined in the final official specification.

At minimum support the official equivalents of:

- creation/submission;
- working/running;
- requested Human input;
- continuation;
- completion;
- failure;
- cancellation;
- result retrieval;
- disconnected client recovery.

Do not invent wire-level enum names from summaries. Keep Gummy-facing lifecycle states separate from protocol state strings.

Canonical interpretation:

```text
MCP completion
→ Return candidate
→ Receipt
→ Human or policy acceptance
→ optional canonical mutation
```

`MCP completed` never means `Gummy accepted`.

## 8.3 Human input

Server-to-client input requests must map to an existing active Work Order/Run and an originating operation.

Create a Gummy input request that records:

- originating Actor;
- Production;
- Work Order and Run;
- MCP server/task;
- exact question and options;
- data requested;
- authority requested;
- budget effect;
- expiry;
- decision-maker;
- response Receipt.

An input request may pause execution. It may not independently create authority.

## 8.4 MCP Apps

An MCP App may render inside a bounded Actor App Surface.

Gummy chrome must continue to display:

- Actor identity;
- Agent/runtime identity;
- current Production context;
- server identity;
- locality;
- cost/budget state;
- data boundary;
- acceptance state;
- close/revoke/cancel controls;
- Return and Receipt links.

The embedded App does not own the Gummy window, Actor identity, Master Control, or canonical state.

Apply strict origin, sandbox, capability, message, and data contracts. No ambient same-origin authority.

## 8.5 Tracing

Correlate, do not collapse:

```text
Gummy trace ID
Production Run
Work Order
Task Lease
Grant
Agent
MCP task
MCP trace/span context
provider/tool calls
Return
Receipt
acceptance decision
```

Protocol tracing is execution telemetry. A Gummy Receipt is governed evidence including authority, purpose, movement, cost, outcome, limitations, and acceptance.

---

# 9. Managed runtime boundary

Create:

```text
docs/architecture/MANAGED_AGENT_RUNTIME_BOUNDARY_2026-07-28.md
```

Canonical rule:

> **A managed environment preserves execution state. A Gummy Project preserves canonical Human and Production state. Runtime continuation is not Return, an audit event is not a Receipt, and a tool hook is not an Actor-issued Lease.**

## 9.1 Runtime state

Provider-owned or provider-hosted runtime state may include:

- environment ID;
- sandbox files;
- installed packages;
- snapshots;
- interaction ID;
- scheduled trigger;
- execution logs;
- temporary secrets;
- provider cache;
- token/runtime budget state.

This state is never the sole authoritative copy of:

- accepted Assets;
- Production agreements;
- contribution evidence;
- Human identity;
- Actor state;
- rights;
- canonical Project files;
- Receipts;
- final acceptance.

## 9.2 Return anchor

Every runtime binding has a deterministic Return anchor to the exact commissioning object:

```text
Actor
Production
Production Run
Work Order
selected Gummy revisions
Gummy Box destination
acceptance policy
```

Provider interaction continuation is not a Gummy Return.

## 9.3 Scheduled triggers

A provider schedule may activate an eligible runtime request, but Gummy owns the commissioning policy.

Required checks before every scheduled execution:

- active Production/workflow;
- active schedule authorization;
- Actor and Agent binding;
- non-expired Mold;
- active Lease and Grant or a policy-authorized mechanism to mint the exact bounded lease/grant;
- budget availability;
- data availability;
- provider/runtime availability;
- cancellation/revocation state;
- canonical state version compatibility.

A schedule never creates new standing authority merely because it exists at the provider.

## 9.4 Budget continuation

A provider token/runtime budget is one enforcement ceiling.

Gummy still owns:

- Production Pool;
- contributor authorizations;
- Cost Compiler estimate;
- total approved budget;
- per-run ceiling;
- per-provider ceiling;
- continuation approval;
- actual-usage reconciliation;
- contribution evidence.

When a runtime stops incomplete because of budget:

```text
preserve checkpoint
create partial Return
record actual usage
show continuation estimate
require new or existing approved budget authority
create a new continuation attempt or linked revision
```

Never silently increase a contributor maximum or provider budget.

## 9.5 Hooks and fail-closed authority

Provider hooks are enforcement helpers, not the source of Gummy authority.

The Google profile currently described for this release must be treated as **fail-open at the provider-hook layer unless official documentation and tests prove otherwise**.

Therefore Gummy must implement a fail-closed wrapper outside the provider hook:

```text
Gummy preflight authorization
→ freeze exact request and hashes
→ verify Lease, Grant, Mold, budget, expiry, scope, canonical version
→ issue one-time execution capability or signed request
→ provider hook may add further restriction
→ provider execution
→ Gummy postflight validation
→ quarantine result until Return and Receipt are complete
→ Human/policy acceptance
```

If Gummy preflight fails, execution is never submitted.

If the provider hook crashes, times out, returns malformed data, or becomes unreachable, Gummy must not interpret that as authorization.

If a provider operation cannot be safely intercepted, limit it to a non-sensitive sandbox and disclose the limitation.

## 9.6 Environment expiry and snapshots

Record:

- environment creation time;
- last verified time;
- provider expiry policy;
- snapshot identifiers;
- resumability state;
- canonical files exported;
- files still stranded in runtime;
- recovery instructions.

Before expiry, Gummy may offer an explicit checkpoint/export operation. It may not silently treat provider persistence as durable Gummy Box storage.

---

# 10. Google managed-runtime provider profile

Implement Google only as a provider profile behind the universal Runtime Binding.

Before coding, verify from current official documentation:

- exact product/API names;
- GA versus public-preview boundaries;
- free-tier scope;
- environment API contracts;
- schedule/trigger API contracts;
- snapshot/resume behavior;
- seven-day or current retention policy;
- token/runtime budget behavior;
- hook request/response format;
- hook timeout/failure semantics;
- supported regions/languages/SDKs;
- cancellation and recovery;
- data retention and privacy;
- quota and billing behavior.

Do not claim independent reliability validation that does not exist.

Provider profile must disclose:

```text
provider: google
status: preview | ga | mixed
verifiedCapabilities
unverifiedCapabilities
knownLimitations
hookFailureMode
retentionPolicy
sdkVersions
lastVerifiedAt
```

A preview provider may support an experimental proof, but cannot become the only path for a core Gummy capability.

---

# 11. Command Center and Master Control

Phase 16 Command Center remains a generated awareness projection.

Add runtime projections for:

- active and scheduled runtime bindings;
- MCP tasks;
- managed environments;
- Human input requests;
- paused/incomplete work;
- budget remaining;
- environment expiry;
- recovery required;
- trace health;
- provider degradation;
- pending Returns;
- acceptance required.

Command Center actions route to governed objects.

Master Control remains the authority surface for:

- approve/deny;
- assign runtime;
- issue/revoke Lease and Grant;
- approve continuation;
- cancel;
- accept/quarantine/reject result;
- authorize Distribution.

Zeke may explain and route. Glopper remains the companion. Neither receives hidden authority.

---

# 12. Cost and shared-compute integration

Use Phase 16 Production Pools and Contribution Ledgers.

Required chain:

```text
Production estimate
→ Production Pool allocation proposal
→ contributor maximum authorizations
→ Budget Grant
→ Runtime Binding ceiling
→ provider execution
→ actual usage report
→ reconciliation
→ Contribution Ledger entry
→ Receipt
```

Keep these distinct:

```text
provider token ceiling
provider monetary ceiling
Production Run ceiling
Production Pool approved total
individual contributor maximum
actual usage
accepted contribution credit
ownership/compensation rules
```

The runtime may report usage. It does not decide who pays, who owns, or how contribution is credited.

No internal currency, speculative token, hidden pooled-fund custody, or automatic charge reallocation.

---

# 13. Deterministic conformance harness

To move quickly without external fragility, build a local deterministic standards harness.

## 13.1 MCP reference server fixture

Implement a test-only MCP server/adapter supporting the exact verified task extension behavior needed for:

- durable task creation;
- status retrieval;
- explicit application state handle;
- requested Human input;
- response submission;
- cancellation;
- disconnect/reconnect;
- eventual result retrieval;
- trace propagation;
- malformed/failure cases.

Do not present this fixture as a live external server.

## 13.2 Managed runtime fixture

Implement a provider-neutral fixture supporting:

- environment creation;
- persistent files;
- snapshot/restore;
- scheduled trigger simulation with deterministic clock;
- budget stop;
- continuation with a new approved budget;
- hook allow/deny;
- hook crash/timeout/malformed response;
- environment expiry;
- cancellation;
- provider disconnect/recovery.

The fixture must prove the Gummy fail-closed wrapper even when the simulated provider fails open.

## 13.3 Fault profiles

Automate:

```text
network disconnect before task ID received
network disconnect after task ID received
unknown outcome
stale canonical state version
revoked Lease
expired Grant
budget exhausted
contributor authorization revoked
input request expires
provider hook crashes
provider hook times out
provider returns malformed result
snapshot missing
runtime expires
duplicate callback/result
cancel races completion
completed result fails postflight validation
```

No duplicate submission on unknown outcome. Recover using owned handles.

---

# 14. Integrated complete proof

After Phase 16 is merged, build this single deterministic journey:

```text
Restore a saved Social Instance
→ show truthful Human / AI-represented / static / offline Actor presence
→ select exact Session provenance
→ create Shared Vision
→ approve exact Production Agreement revision
→ create $10.00 Production Pool proposal
→ authorize $4.00 / $3.00 / $3.00 contributor maximums
→ add a fourth contributor
→ propose future allocation without changing existing authorizations
→ create immutable Production Formation Event
→ form Production
→ compile Actor Plan and Work Order
→ approve through Master Control
→ create Task Lease, Grant, Budget Grant, and Runtime Binding
→ dispatch through deterministic MCP task transport
→ persist explicit application state handle
→ request Human input
→ route decision through Master Control
→ stop incomplete at execution budget
→ preserve checkpoint and partial Return
→ approve bounded continuation
→ resume exact task/runtime state
→ complete execution
→ create Return candidate and execution trace
→ validate and create Receipt
→ require Human acceptance before canonical mutation
→ create Distribution Plans for Radio and Channels
→ explicitly release only one approved destination
→ reload and restore Social Instance, Production, runtime history, Returns, Receipts, and distribution state
```

No step may silently create:

- identity;
- representation;
- membership;
- authority;
- budget;
- ownership;
- contribution meaning;
- acceptance;
- publication.

---

# 15. Live adapter strategy

A live adapter is optional for the combined release until all of these are true:

- official SDK support is stable enough for the chosen language;
- host/server/provider capability is available;
- credentials are configured through existing secret-safe infrastructure;
- no credentials enter browser bundles or canonical records;
- the adapter has deterministic fallback;
- privacy and data retention are disclosed;
- cost ceiling is approved;
- cancellation and recovery are verified;
- the provider cannot become canonical storage;
- failure does not corrupt accepted state.

Preferred proof order:

1. deterministic MCP task server;
2. local or self-controlled MCP server;
3. non-sensitive managed Google preview environment;
4. specialist adapter only after its native authority and acceptance model is preserved.

Do not connect Meshmallow, VideoBoss, or Radio by flattening their existing Jobs, Assets, checkpoints, reviews, or Receipts into generic MCP results.

---

# 16. Specialist integration boundaries

## Meshmallow

MCP/managed runtime may transport a validated World Plan and return job/checkpoint/package evidence.

Preserve:

- exact bounded tool surface;
- no arbitrary Python/shell/filesystem;
- authenticated supervisor;
- job ownership;
- editable source;
- checkpoint and export validation;
- native Return and Receipt;
- Gummy acceptance.

## VideoBoss

MCP/managed runtime may carry a video Work Order, progress, input pause, render result, and evidence.

Preserve:

- direction;
- continuity;
- sequence and shot packets;
- Cost Shield;
- provider routing;
- takes and review;
- Human acceptance;
- delivery and exports;
- native evidence.

## Radio

MCP/managed runtime may carry scoped source packages, script revisions, input pauses, rendering, and output packages.

Preserve:

- exact source boundary;
- per-person permissions;
- script revision approvals;
- voice/likeness authorization;
- synthetic disclosure;
- private/public separation;
- acceptance versus publication.

---

# 17. Required migrations

Migrations must be:

- additive;
- idempotent;
- inspectable;
- revisioned;
- reversible where possible;
- non-destructive to existing Phase 15/16 data.

Do not convert existing local/cloud/native execution records into MCP or managed-runtime records merely to normalize them.

Existing records keep their original runtime identity. New Runtime Bindings may reference them through compatibility adapters.

Do not change stable IDs without aliases and migration evidence.

---

# 18. Required verification

## Existing preservation

- complete Phase 15 suite;
- complete Phase 16 suite;
- Places persistence and activation;
- private-reference migration;
- Production recovery;
- Actor/Agent separation;
- Make Production boundary;
- Master Control authority;
- Gummy Box sovereignty;
- Return/Receipt integrity;
- accessibility and visual identity.

## Standards and runtime contracts

- all schemas compile;
- official protocol version is recorded;
- capability negotiation is explicit;
- unsupported host/server capabilities fail clearly;
- hidden transport sessions are not authoritative;
- state handles are typed and context-bound;
- task completion does not accept results;
- Human input cannot create authority;
- cancellation and unknown-outcome recovery are idempotent;
- trace/Receipt relationship is preserved.

## Managed runtime safety

- provider files are not canonical;
- environment expiry is visible;
- snapshot recovery does not overwrite newer canonical state;
- stale canonical versions block submission/import;
- provider hook crash/timeout/malformed response cannot authorize execution;
- budget stop preserves work without silently continuing;
- continuation requires valid authority and budget;
- schedule revocation blocks future activation;
- runtime telemetry cannot mutate Contribution Ledger or acceptance state directly.

## UX and browser flows

- desktop and phone;
- reduced motion;
- keyboard and screen-reader semantics;
- clear runtime/provider disclosure;
- obvious waiting-input and recovery actions;
- advanced canonical inspection remains available;
- no jargon-only dead ends;
- no false “background work is happening” claims.

## Security

- no secrets in records or browser bundles;
- strict origin/message validation for MCP Apps;
- sandboxed embedded surfaces;
- CSP remains bounded;
- no ambient filesystem or host authority;
- signed/hashed exact request where appropriate;
- replay and duplicate-result protection;
- least-privilege provider tokens;
- cancellation and revocation tests.

## Performance and release

- preserve initial-load budget;
- lazy-load standards/provider adapters;
- no provider SDK in first paint unless essential;
- service-worker migration/update test;
- exact-head preview;
- production-like acceptance;
- rollback deployment and data strategy.

---

# 19. Stop rules

Spark must stop and document rather than guess when:

- the Phase 16 implementation branch is still changing the same files;
- official SDK support does not match the specification;
- host/server task support is absent;
- provider API is preview-only and cannot satisfy a required release claim;
- a provider hook is the only enforcement point;
- a live adapter would require exposing secrets to the browser;
- a runtime cannot be recovered idempotently;
- provider state would become the only copy of canonical data;
- a schema duplicates an existing authoritative object;
- a conflict would require deleting accepted Phase 16 behavior;
- payment or custody behavior would be implied without a real compliant system.

A stop rule blocks only the unsafe capability. It should not stop additive contracts, deterministic proofs, or the remainder of the release train.

---

# 20. Branch and PR strategy

Do not use one 100-commit unreviewable branch.

Recommended stack:

## PR S0 — Fast-lane work order

Docs only. This plan.

## PR S1 — Standards and provider-neutral contracts

Can be prepared while Phase 16 is active if it touches only additive files.

Contains:

- compatibility docs;
- schemas;
- fixtures/interfaces;
- conformance tests;
- no production runtime wiring.

## PR S2 — Phase 16 reconciliation + runtime integration

Created from the accepted Phase 16 merge commit.

Contains:

- Runtime Binding storage/integration;
- Work Order routing;
- Command Center projection;
- Master Control decisions;
- deterministic MCP/managed fixtures;
- migrations.

## PR S3 — Integrated proof and optional live adapter

Contains:

- complete vertical journey;
- fault tests;
- screenshots/evidence;
- optional provider feature flag;
- release notes.

Each PR must preserve a green base and declare which phase checkpoint it satisfies.

Squash or merge strategy may follow repository norms, but exact accepted commits and deployment evidence must remain traceable.

---

# 21. Evidence and chronology

Create or complete:

```text
docs/demonstrations/2026-07-28-public-demo-timeline.md
docs/architecture/MANAGED_AGENT_RUNTIME_BOUNDARY_2026-07-28.md
docs/architecture/MCP_2026-07-28_GUMMY_COMPATIBILITY.md
```

The public demonstration record must preserve, when supplied:

- exact TikTok URL;
- exact Instagram URL;
- platform-visible posting timestamps;
- source video file/hash;
- demo-site URL;
- deployed commit and deployment ID;
- screenshots;
- features visible;
- verbal claims;
- implementation status at the time.

Google’s announcement and Hayden’s demonstration occurred on the same calendar date. Do not claim which came first without exact timestamps from reliable evidence.

Preserve the stronger supportable statement:

> The public Gummy demonstration and major runtime-standard announcements independently reveal convergence at the worker/runtime layer, while Gummy remains differentiated at the Human, Actor, social, economic, Production, authority, Return, Receipt, and acceptance layers.

---

# 22. Founder acceptance gates

## Gate A — Phase 16 preservation

Founder confirms Spark did not flatten or regress Living Collaboration.

## Gate B — standards architecture

Founder confirms MCP and managed runtimes sit beneath Gummy governance.

## Gate C — complete proof

Founder reviews the full deterministic journey and usability.

## Gate D — live provider claim

Required only for a live adapter. Founder reviews actual capability, cost, privacy, and preview limitations.

No merge or production promotion beyond the authorized gate.

---

# 23. Completion definition

The combined Spark fast lane is complete when:

- Phase 16 accepted behavior remains intact;
- the universal Runtime Binding is implemented without duplicating canonical stores;
- final MCP task behavior is supported through a standards-conformant deterministic adapter;
- explicit application state handles replace hidden continuity;
- Human input pause, cancellation, disconnect, recovery, result retrieval, and tracing work;
- provider-neutral managed environments support scheduled, persistent, checkpointed, budget-bounded continuation in the deterministic harness;
- the Google profile is accurately documented and optionally proven without being required for core operation;
- Gummy remains fail-closed even where a provider hook fails open;
- runtime state remains separate from canonical Human/Production state;
- Production Pools govern approved spend and contributor maximums;
- Return, Receipt, acceptance, and distribution remain separate;
- the complete vertical proof passes after reload;
- all prior tests pass;
- hosted preview and evidence are complete;
- founder acceptance is recorded;
- exact accepted commits are merged, deployed, production-verified, and rollback-ready.

---

# 24. Final instruction to Spark

> **Do not chase the news by rebuilding Gummy around each new runtime. Move faster by making every runtime plug into one stable governed architecture. Finish the active social-production layer, standardize the execution seam, prove it deterministically, then connect live providers only where their actual guarantees are sufficient. Do not destroy Gummy. Improve its interoperability while preserving its identity, authority, sovereignty, and Human acceptance model.**
