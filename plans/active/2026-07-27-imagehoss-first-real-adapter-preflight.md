# ImageHoss First Real Adapter — Preflight Work Order

**Date:** 2026-07-27  
**Status:** Waiting for founder completion of `docs/IMAGEHOSS_PRODUCTION_PROMPT_CONTRACT_WORKSHEET.md`  
**Canonical repositories:** `bohselecta/gummy-os`, `bohselecta/imagehoss`

## Ruling

The consolidated Gummy OS Production runtime is accepted as the implementation baseline.

The first real specialist application integration is ImageHoss.

Do not begin the adapter from the current deterministic reference Agent alone. The current proof intentionally narrows `@ImageHoss` to a reference-preparation capability. The real ImageHoss product covers the complete loop:

```text
Direction
→ References
→ Route
→ Generate
→ Compare
→ Accept
→ Handoff
→ Receipt
```

The founder must define the Production Prompt Contract before Codex implements the real adapter.

## Dependency gate

Implementation is blocked until the worksheet contains founder decisions for:

- natural instruction and required clarifying questions;
- direction hierarchy and lock semantics;
- reference-role influence;
- personal Actor context and permission behavior;
- provider-neutral Prompt Package;
- route-specific translation;
- variation strategy;
- comparison and acceptance;
- revision language;
- durable outputs;
- ImageHoss guidance voice;
- one complete reference Production example.

This is a product-definition dependency, not a missing engineering guess.

## Accepted architectural center

Read first:

1. `docs/ACTOR_HOME_PRODUCTION_UNDERGROUND_CENTER.md`
2. `docs/IMAGEHOSS_PRODUCTION_PROMPT_CONTRACT_WORKSHEET.md`
3. `docs/ACTOR_FIRST_PRODUCTION_MODEL.md`
4. `docs/PRODUCTION_ACTOR_RUNTIME.md`
5. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
6. `docs/FULL_PRODUCT_PRESERVATION_DIRECTIVE.md`
7. `docs/GUMMY_UTILITY_TILE_SYSTEM.md`
8. `evidence/consolidation-feature-source-map.json`

The Human-owned personal Actor and Living Self Page are the architectural center. Production remains the durable undertaking. ImageHoss is a service Actor and specialist application that extends the Actor and Production through explicit capabilities and evidence.

## Existing proven foundations

### Gummy OS

The consolidated main branch proves:

- branded Night/Day Gummy OS;
- IndexedDB protocol records and OPFS Gummy bytes;
- persistent windows, Gummy Canvas, Gummy Bar, and Glopper;
- Actor, Agent, Mold, Master Control separation;
- Productions, participants, Production configurations, Actor Plans, Context Envelopes, Runs, Work Orders, Leases, Grants, Returns, and Receipts;
- Make Production as the sole Production execution transition;
- typed non-executing drag proposals;
- deterministic reference service Agents;
- first-party application registry and app handoff contracts.

### ImageHoss

`bohselecta/imagehoss` proves:

- structured Direction;
- explicit reference roles;
- provider-free deterministic studies;
- fail-closed loopback ComfyUI discovery;
- one bounded allowlisted local ComfyUI execution route;
- real local model execution evidence;
- original/proxy SHA-256 lineage;
- project-scoped durable Assets;
- inspect-first `.hoss` export/import;
- typed read-only VideoBoss handoff;
- WorkOrder, Job, Receipt, artifact, evidence, and cost records.

## Target integration

```text
Gummy OS Production
        │
        ├── @ImageHoss participant
        │
        ▼
ImageHoss Actor App Surface
Production-scoped setup, references, prompt package, route, output contract
        │
        ▼
Saved ProductionActorConfiguration
no model call, no Job, no execution
        │
        ▼
Make Production
        │
        ▼
Frozen Context Envelope + Prompt Package
        │
        ▼
ImageHoss capability adapter
        │
        ▼
actual ImageHoss Agent / authenticated local bridge / detected ComfyUI
        │
        ▼
ImageHoss Job and accepted Assets
        │
        ▼
result Gummies + .hoss evidence + Return + Receipt
        │
        ├── optional VideoBoss handoff
        └── optional ActorUpdateProposal
```

## Adapter boundary

The adapter must not copy the ImageHoss repository into Gummy OS.

The adapter must not rebuild ImageHoss as a generic Gummy OS form.

It should connect through versioned contracts and a narrow trusted route.

Recommended boundary:

```ts
type ImageHossProductionAdapter = {
  discover(): Promise<ImageHossCapabilitySnapshot>;
  validateConfiguration(input: ImageHossProductionConfiguration): Promise<ValidationResult>;
  compilePromptPackage(input: FrozenImageHossContext): Promise<ImageHossPromptPackage>;
  execute(input: AuthorizedImageHossWorkOrder): Promise<ImageHossExecutionReturn>;
  recover(jobRef: ImageHossJobRef): Promise<ImageHossExecutionState>;
  cancel(jobRef: ImageHossJobRef, authority: CapabilityGrant): Promise<ImageHossExecutionReturn>;
};
```

Exact types are implementation decisions after repository inspection. The authority and evidence semantics are not optional.

## Identity mapping

Preserve separate identities:

```text
@ImageHoss
service Actor identity in Gummy OS

ImageHoss Actor App Surface
windowed view/controller

app:imagehoss
first-party application registry identity

actual ImageHoss Agent
execution identity disclosed in Lease, Grant, Return, and Receipt

ImageHoss Project / .hoss
specialist durable project and exchange identity
```

Do not use the green vision utility tile as the ImageHoss app logo. It remains an operation mnemonic.

## Capability expansion

The current Gummy OS proof uses:

```text
capability:imagehoss.reference-preparation/v0
```

The real integration must be designed around the founder prompt contract and ImageHoss's complete product loop.

Possible capability families to evaluate:

```text
imagehoss.direction.compose
imagehoss.references.assign
imagehoss.prompt.compile
imagehoss.route.select
imagehoss.generate
imagehoss.compare
imagehoss.accept
imagehoss.handoff
imagehoss.bundle.export
```

Do not lock these names until both repositories' contracts are reconciled. Prefer one coherent Production-facing aggregate capability with inspectable sub-operations over an unnecessarily fragmented user experience.

## Production-scoped behavior

Opening ImageHoss inside a Production should:

- show Production title and scope;
- receive only permitted context slices;
- display selected Actors and their approved visual Assets;
- allow reference-role assignment;
- expose locks, constraints, negative direction, aspect, route, output, cost, locality, privacy, and acceptance settings;
- compile a visible prompt preview;
- persist an isolated Production configuration;
- show downstream Actor requirements;
- create no model Job.

Opening ImageHoss standalone should:

- list saved Production contexts without merging them;
- allow explicit standalone ImageHoss Jobs under ImageHoss's own runtime contract;
- allow a versioned copy of a context into another Production with review;
- show Human-owned ImageHoss defaults separately from Production settings.

## Make Production execution

The ImageHoss node may execute only after:

- required Actor contexts are available;
- references carry hashes, roles, rights, and provenance;
- the ImageHoss configuration is valid and saved;
- a compatible actual runtime is detected;
- the selected Mold is active;
- the Task Lease is available;
- a bounded Capability Grant is approved;
- the frozen Prompt Package is included in the Context Envelope;
- Human approval is present.

The node must return truthful terminal evidence for:

- completed;
- denied;
- blocked;
- failed;
- cancelled;
- expired;
- capability unavailable.

## Context and privacy

ImageHoss receives the minimum required context.

Never send:

- complete personal Actor memory;
- unrelated Production history;
- provider credentials;
- ambient filesystem access;
- unapproved likeness Assets;
- private references outside the active Mold and Grant;
- inferred traits unrelated to the visual task.

Every reference must identify:

- source Gummy or ImageHoss Asset;
- owner Actor;
- role;
- hash;
- rights/audience;
- permitted use;
- retention;
- whether it may be included in a `.hoss` bundle or downstream handoff.

## Output mapping

The adapter should preserve ImageHoss-native evidence while creating Gummy OS-native result objects.

Expected mapping:

```text
ImageHoss original Asset
→ immutable result Gummy byte + source hash

ImageHoss proxy Asset
→ display/proxy Gummy linked to original

Visual direction / Prompt Package
→ structured Production Gummy

.hoss bundle
→ portable specialist-project Gummy or attachment

accepted Asset
→ accepted-for Link to Production and downstream role

VideoBoss handoff
→ gummy.app-handoff/v1 preserving untouched source envelope

ImageHoss Receipt
→ retained specialist evidence

Gummy OS Return and Receipt
→ Production-level route, authority, cost, movement, and outcome evidence
```

Do not flatten one Receipt into the other. Link them.

## Actor learning boundary

ImageHoss output may update:

- the current Production;
- the ImageHoss Project;
- accepted Gummy Assets;
- downstream handoff state.

It must not silently update personal Actor identity, taste, skill, or creative DNA.

Repeated accepted decisions may create an `ActorUpdateProposal` such as:

```text
Hayden frequently accepts low-angle, wide cinematic compositions for vehicle concepts.
```

The proposal must identify evidence, confidence, scope, exceptions, and whether the pattern is Human-selected or merely model-produced. Human approval is required before durable promotion.

## Required automated acceptance after implementation

1. Gummy OS discovers ImageHoss truthfully.
2. ImageHoss remains unavailable when its trusted bridge/runtime is absent.
3. Production-scoped ImageHoss opens as a real specialist surface or authenticated companion route.
4. Configuration does not execute.
5. Prompt Package is deterministic from frozen structured input.
6. References preserve role, hash, rights, provenance, and Actor ownership.
7. Unapproved Actor context is excluded.
8. Make Production creates one authorized ImageHoss Job.
9. The actual Agent/runtime is disclosed.
10. Missing Mold, Lease, Grant, approval, or capability blocks execution.
11. Local ComfyUI execution remains loopback-only and allowlisted.
12. Completed execution returns original/proxy Assets with exact hashes.
13. `.hoss` evidence remains inspectable and portable.
14. Gummy OS creates linked result Gummies without altering source Gummies.
15. ImageHoss and Gummy OS Receipts are both retained and linked.
16. Optional VideoBoss handoff preserves the source envelope.
17. Cancellation and recovery remain truthful.
18. Two Productions maintain isolated ImageHoss configurations and Jobs.
19. Standalone ImageHoss lists Production contexts without merging them.
20. Actor memory changes occur only through an approved ActorUpdateProposal.
21. Browser restart preserves Production, ImageHoss Job, Assets, and evidence.
22. Accessibility, visual regression, failure paths, and exact-head hosted/native evidence pass.

## Non-goals for the first adapter pass

- cloud provider expansion;
- arbitrary ComfyUI workflow submission;
- remote filesystem browsing;
- broad collaboration or public publishing;
- payment and marketplace systems;
- automatic personal taste profiling;
- VideoBoss or 3D-Bee execution integration beyond preserving typed handoff seams;
- Underground 3D navigation;
- wallpaper production;
- generic specialist-app SDK design before the first real adapter proves the pattern.

## Required next founder action

Complete:

```text
docs/IMAGEHOSS_PRODUCTION_PROMPT_CONTRACT_WORKSHEET.md
```

The highest-value output is not code yet. It is a clear description of how ImageHoss should turn Human and Production intent into a structured, inspectable, provider-neutral visual direction and prompt package.

## Required next Codex return after founder completion

Codex must return:

- repository ancestry for both projects;
- exact versions and current protocol contracts;
- mapping from founder prompt contract to existing ImageHoss types;
- proposed versioned Prompt Package schema;
- proposed Gummy OS/ImageHoss adapter interface;
- files to change in each repository;
- exact authority/data-flow diagram;
- acceptance plan;
- explicit non-goals;
- one vertical implementation slice;
- exact evidence and limitations;
- no broad implementation until the contract review is accepted.
