# Full Gummy OS Product Preservation Directive

**Founder correction:** 2026-07-26

## Controlling rule

> **Simplify the doorway. Do not flatten the house.**

The conversation-first and user-first work is a front-door UX layer over the existing Gummy OS vision. It is not permission to redefine Gummy OS as a small project manager, storage client, or generic assistant.

No existing product pillar may be removed, renamed away, hidden indefinitely, or declared outside the product merely because it is outside one implementation lane.

## Full product map

Gummy OS is a complete personal and social computing environment composed of:

1. **Gummy OS shell** — Gummy Canvas, Gummy Bar, windows, applications, projects, Gummies, Glopper, Master Control, Molds, permissions, local/native/cloud execution, and durable continuity.
2. **Gummy Operator** — a small local approximately 4B model lane that remains available as the persistent low-cost/offline operator, router, queue manager, continuity layer, and first responder; larger cloud models are escalations, not replacements.
3. **First-party specialist applications** — VideoBoss, ImageHoss, and 3D Bee are first-class Gummy OS applications with their own repositories, specialist interfaces, deterministic cores, protocols, evidence, and local/native bridges.
4. **Social computing** — Actors, Actor Homes, stable `@addresses`, Bowls, Links, Grabs, rooms, follows, memberships, collaboration, sharing, public/private state, and explicit Agent operation.
5. **Gummy Box** — local-first project storage and handoff, optional managed sync, and optional GitHub/Google Drive connections.
6. **Protocol and evidence** — Projects, Assets, Gummies, Work Orders, Jobs, Grants, leases, Returns, Receipts, provenance, cost, locality, executor identity, revocation, and migration.

A simple first-run screen changes only how a person enters this system. It does not shrink the system.

## Protected existing products

### VideoBoss

Canonical repository: `bohselecta/videoboss`

Preserve as the AI video production workbench:

- structured production planning;
- shot and sequence board;
- model routing;
- Cost Shield;
- render/take review;
- cinematic memory and locks;
- production brief, shot packet, review, continuity, and project exports;
- ImageHoss handoff consumption;
- future real video-provider adapters.

Do not replace VideoBoss with a generic chat prompt or a single “generate video” button.

### ImageHoss

Canonical repository: `bohselecta/imagehoss`

Preserve as the image-direction and provenance instrument:

- structured visual direction and references;
- route and capability supervision;
- comparison and acceptance;
- bounded ComfyUI execution;
- durable Assets and `.hoss` portability;
- provenance, rights, hashes, and evidence;
- typed handoff to VideoBoss.

Do not replace ImageHoss with a generic image-chat panel.

### 3D Bee

Canonical repository: `bohselecta/3d-bee`

Preserve as the world-building and 3D package studio:

- World Seed creative-intent flow;
- editable scene planning;
- explicit Blender capability approval;
- authenticated local supervisor transport;
- typed Blender operations;
- checkpoints and previews;
- `.blend`, `.fbx`, `.glb`, textures, and handoff manifests;
- Unity/Unreal continuation package.

Do not replace 3D Bee with a generic 3D prompt form.

### Social layer

Canonical specification: `docs/SOCIAL_LAYER.md`

Preserve:

- addressable Actors and Actor Homes;
- stable `@addresses`;
- follows, memberships, collaboration, sharing, delegation, provenance, and trust Links;
- Bowls as shared spaces;
- Grabs as independent provenance-preserving derivations;
- private and public Gummies;
- explicit Human, Agent, and Mold relationships;
- collaborative room lineage from `bohselecta/gummy2` and `bohselecta/mygummy`, including fair queues, live streaming, thread isolation, and live mirrors.

The Social Layer may ship after the personal proof, but it remains a first-class product pillar and must stay visible in the product map and architecture.

### Local 4B operator

Preserve the existing Gemma 3 4B lineage as the current reference implementation until benchmarking selects a replacement.

The local compact operator must be designed to:

- run locally/offline where hardware permits;
- understand current Gummy OS context;
- route work to VideoBoss, ImageHoss, 3D Bee, Glopper, or another approved executor;
- manage queues, reminders, continuity, and low-cost background operations;
- summarize and prepare bounded Work Orders;
- operate collaborative rooms fairly;
- escalate difficult work to larger models only when policy, cost, privacy, and Human approval permit it.

The 4B model is an operator lane under Human authority, not a decorative chat model and not a replacement for specialist applications.

## Integration law

Do not copy the specialist repositories wholesale into `gummy-os`.

Integrate them through a first-party application registry and versioned contracts.

Required registry fields:

```text
id
name
canonicalRepository
productPurpose
launchMode
webRoute
nativeRoute
capabilities
acceptedInputs
producedArtifacts
protocolVersions
locality
connectionStatus
releaseStatus
```

Required initial registry entries:

```text
app:videoboss
app:imagehoss
app:3d-bee
app:gummy-rooms
```

Gummy Bar → Applications must show these as real first-party products, not unnamed placeholders.

Launch behavior may be:

- embedded/sandboxed web surface;
- dedicated route;
- installed PWA;
- native bridge launch;
- unavailable-with-explanation when the required runtime is absent.

Every app must advertise truthful capability and current availability.

## Cross-application continuity

Preserve and implement these flows:

```text
ImageHoss accepted Asset
→ typed handoff
→ VideoBoss production project

VideoBoss production brief / shot packets / reviewed takes
→ Gummy project artifacts
→ sharing, continuation, or downstream editing

3D Bee World Seed / scene package
→ Gummy project artifacts
→ Unity/Unreal handoff

Any first-party app result
→ separate Gummy
→ provenance and evidence
→ optional sharing in a Bowl
```

Map existing protocol versions through explicit adapters. Do not erase IDs, hashes, provenance, rights, limitations, or existing local data.

## User-first shell law

The user-first shell is additive.

First open may show:

```text
Add a project
Talk to Gummy
Open an existing project
```

After entry, the full environment remains available through:

```text
Your projects
Applications
People & Spaces
Glopper
Activity
Access & control
```

Plain language is the default, with protocol detail under Details. Applications, social computing, local operator capability, and advanced controls must not disappear merely to make first-run comprehension easier.

## Immediate Codex instructions

1. **Stop any broad rewrite based solely on the conversation/storage plan.**
2. **Do not delete, hide, or replace current Gummy Bar surfaces, Applications, Actors/Bowls, protocol schemas, branding, migrations, or local execution boundaries.**
3. Finish PR #11 only as the branded standalone technical proof already defined.
4. Treat the user-first Cloudflare plan as one future lane, not the full product definition.
5. Before implementing that lane, produce a gap audit against:
   - `bohselecta/videoboss`;
   - `bohselecta/imagehoss`;
   - `bohselecta/3d-bee`;
   - `bohselecta/gummy2`;
   - `bohselecta/mygummy`;
   - `docs/SOCIAL_LAYER.md`;
   - this directive.
6. Add automated checks that fail if protected product pillars disappear from the product registry or visible Applications/product map.
7. Do not merge PR #11 or begin a replacement shell without explicit founder authorization.

## Required next Return

Codex must return:

- exact current branch and commit;
- confirmation that production branding remains present;
- a table of every protected product pillar and its current repository/status;
- files or runtime surfaces proposed for modification;
- explicit statement of what will not be changed;
- one non-destructive staged implementation plan;
- one canonical preview URL;
- automated evidence that no protected pillar was removed.

## Completion invariant

> **Gummy OS remains the revolutionary operating environment: a simple entrance into a deep system of specialist creative tools, local and cloud intelligence, user-owned projects, and social computing.**
