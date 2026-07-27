# ImageHoss Production Contract Reconciliation

**Date:** 2026-07-27

**Status:** Proposed contract package — founder review required before implementation

**Repositories:** `bohselecta/gummy-os`, `bohselecta/imagehoss`

## Decision

ImageHoss should become the first real specialist application connected to the
Gummy OS Production runtime through a narrow, versioned, authority-checked
adapter.

The integration must preserve two independent products:

- Gummy OS owns Production scope, configuration isolation, context disclosure,
  execution authority, result Gummies, and the Production-level Return and
  Receipt.
- ImageHoss owns visual-intent semantics, prompt compilation, route
  translation, ImageHoss Jobs and Assets, comparison and acceptance records,
  `.hoss` portability, and the specialist Receipt.

Opening `@ImageHoss`, editing a configuration, or previewing a Prompt Package
does not execute. `Make Production` is the only Production transition that may
create execution authority and submit ImageHoss work.

This document is the requested reconciliation package. It proposes contracts,
file boundaries, one bounded vertical slice, and acceptance evidence. It does
not authorize or contain the implementation.

## Repository anchors and ancestry

These anchors were inspected on 2026-07-26.

### Gummy OS

| Item | Value |
|---|---|
| Repository | `https://github.com/bohselecta/gummy-os.git` |
| Inspected branch | `agent/creative-specialist-intent-contracts` |
| Inspected head | `fdd4536626f5393471e382782d11264a1eded9f5` |
| Head subject | `Define ImageHoss VideoBoss and Meshmallow Production contracts` |
| Default-branch merge base | `4f67ab77343ee277d14aeef6c710ec7019a14285` |
| Distance from inspected `origin/main` | 0 behind, 4 ahead |

The four commits after the inspected default-branch anchor define the founder
handoff, preservation rules, completed ImageHoss worksheet, and the
ImageHoss/VideoBoss/Meshmallow Production contracts. They are the contract
source for this proposal.

### ImageHoss

| Item | Value |
|---|---|
| Repository | `https://github.com/bohselecta/imagehoss.git` |
| Inspected branch | `main` |
| Inspected head | `1c54a527ec290d6da4886a80474aad40c3433fff` |
| Head subject | `docs: add OpenAI Build Week submission packet` |
| Frozen R5 main-line commit | `2d643c4bc46f9b09cc9573f99ed2804ac4117ffb` |
| Distance from R5 to inspected head | 0 behind, 1 ahead |
| R5 implementation/evidence anchor recorded by its Receipt | `908ea97d28677158be35d9abb7e6b79d00e14ec8` |

The one commit after the frozen R5 main-line commit is documentation. The
inspected runtime behavior remains the R5 bounded local ComfyUI route.

## Existing contracts

### Gummy OS contract surface

Gummy OS currently proves:

- `gummy.production-actor-configuration/v0` for isolated, saved participant
  configuration;
- Production, Actor Plan, Context Envelope, Run, Work Order, Task Lease,
  Capability Grant, Return, and Receipt records;
- `Make Production` as the execution boundary;
- `actor:imagehoss` as the service Actor;
- `app:imagehoss` as the first-party application identity;
- `capability:imagehoss.reference-preparation/v0` as the deliberately narrow
  deterministic proof capability;
- `agent:reference-imagehoss-browser` and
  `mold:imagehoss:production-reference` as proof-only execution identities;
- `imagehoss.video-boss-handoff/r3` inside the Gummy OS app-handoff wrapper.

The current deterministic browser executor returns a prepared reference set. It
does not represent the complete ImageHoss product loop and must not be renamed
to imply real image generation.

### ImageHoss contract surface

ImageHoss currently proves:

| Contract | Current value |
|---|---|
| Protocol version | `1.0.0` |
| Protocol anchor constant | `b4bfc7c743d64dbaa225c7b7a2dab19bd4ba036c` |
| Project identity | `project_image_hoss` |
| Bundle format | `imagehoss.bundle` |
| Bundle version | `1.0.0` |
| VideoBoss handoff | `imagehoss.video-boss-handoff/r3` |

Current ImageHoss types and runtime preserve:

- a `Direction` with brief, target use, aspect, privacy, constraints, and
  negative direction;
- `ImageReference` records with an identity, role, name, and note;
- the reference roles `subject`, `composition`, `style`, `lighting`,
  `material`, `color`, `camera`, `layout`, and `negative`;
- an intent manifest composed of Direction plus references;
- deterministic provider-free studies;
- fail-closed loopback capability discovery;
- one allowlisted local ComfyUI text-to-image workflow;
- ImageHoss Work Orders, Jobs, Receipts, accepted Assets, and typed read-only
  VideoBoss handoff;
- content-addressed original/proxy Assets with SHA-256 verification and
  project-root confinement;
- cancellation and recovery by ImageHoss/Comfy prompt identity;
- exact-key `.hoss` v1 validation and inspect-first import.

The local route accepts text direction, aspect, model, and seed. It does not
currently consume reference image pixels, masks, ControlNet inputs, arbitrary
workflows, or arbitrary filesystem paths.

## Founder contract mapped to current ImageHoss types

| Founder concept | Current representation | Reconciliation |
|---|---|---|
| Natural instruction | `Direction.brief` | Preserve verbatim instruction separately from normalized direction. |
| Target deliverable/use | `Direction.targetUse` | Promote to a typed deliverable with downstream role and output requirements. |
| Aspect | `Direction.aspect` | Preserve; validate against the selected route. |
| Privacy/locality | `Direction.privacy` plus local route facts | Split Human policy from discovered runtime facts. |
| Constraints | `Direction.constraints` | Classify as hard locks, soft guidance, or acceptance criteria. |
| Negative direction | `Direction.negative` | Preserve semantic exclusions independently from provider syntax. |
| Direction hierarchy | Not explicit | Add ordered goals and conflict precedence. |
| Identity/wordmark/composition/palette locks | Not explicit | Add typed lock records with subject, strength, provenance, and satisfiability. |
| Reference role | `ImageReference.role` | Extend the reference contract without deleting current roles. |
| Reference Asset/hash/owner | Outside `ImageReference` | Require source identity, SHA-256, owner Actor, rights, audience, and provenance. |
| Influence/extract/ignore | Free-form note only | Add bounded semantic influence directives. |
| Reference retention and handoff | Not explicit | Add retention and downstream inclusion policy. |
| Personal Actor context | Not explicit | Pass only approved context slices through the Gummy OS Context Envelope. |
| Provider-neutral Prompt Package | Not explicit | Add `imagehoss.prompt-package/v1`. |
| Route-specific translation | Runner/workflow internals | Record separately as a route compilation record. |
| Candidate strategy | Seed and route behavior | Add candidate count, seed policy, diversity intent, and resource ceiling. |
| Compare | UI/workbench behavior | Add a durable comparison record with objective checks and Human notes. |
| Role-specific acceptance | `AcceptedAsset.selectedUse` string | Add a typed acceptance record; keep existing Asset lineage. |
| Delta revision | Not explicit | Add baseline acceptance plus preserved locks and requested deltas. |
| Durable original/proxy | Existing Asset store | Reuse unchanged. |
| `.hoss` evidence | `.hoss` v1 | Introduce v2 only for new fields; retain v1 read/import support. |
| VideoBoss handoff | Typed read-only handoff | Preserve unchanged until an explicitly versioned successor is required. |
| Specialist Receipt | Existing ImageHoss Receipt | Preserve and link; do not flatten into a Gummy OS Receipt. |
| Actor learning | Not an ImageHoss concern | Emit evidence only; Gummy OS may create a Human-reviewed `ActorUpdateProposal`. |

## Ownership and versioning

### Gummy OS-owned Production configuration

The ImageHoss settings payload inside
`gummy.production-actor-configuration/v0` should identify itself as:

```text
gummy.imagehoss-production-configuration/v1
```

It is Production-scoped and revisioned. It contains:

- Production, participant, and configuration identities;
- the Human instruction;
- permitted Actor context references, never ambient Actor memory;
- deliverable and downstream role;
- structured direction, locks, constraints, and negative direction;
- reference descriptors with source, owner, hash, role, rights, audience,
  permitted use, retention, and bundle/handoff inclusion;
- candidate, route-policy, cost, locality, privacy, and output policies;
- comparison and acceptance criteria;
- optional accepted baseline plus delta-revision instructions;
- capability-snapshot identity and hash used for preview;
- visible blockers, warnings, limitations, and unresolved decisions;
- configuration revision, canonical content hash, and saved-at evidence
  supplied by the Gummy OS record envelope.

Provider credentials, bridge session tokens, actual model paths, arbitrary
filesystem paths, Leases, Grants, Jobs, and execution timestamps are forbidden
in this configuration.

### ImageHoss-owned semantic package

The provider-neutral package should identify itself as:

```text
imagehoss.prompt-package/v1
```

Its normative fields are:

```text
schema
packageId
packageVersion
owner
source
deliverable
direction
locks[]
references[]
revisionIntent
candidatePolicy
acceptanceContract
downstreamRequirements[]
policy
capabilityAssumptions
unresolved[]
warnings[]
limitations[]
compiler
contentHash
```

Required semantics:

- `owner` is ImageHoss; Gummy OS stores an inspectable copy with the owning
  version and hash.
- `source` cross-links Production, configuration revision/hash, Context
  Envelope, and Visual Intent Graph revision.
- `deliverable` identifies the artifact class, aspect, intended use, and
  accepted downstream role.
- each lock has a stable identity, category, target, strength, provenance,
  verification method, and `required` or `advisory` status;
- each reference preserves source Asset/Gummy identity, SHA-256, owner Actor,
  role, extract/ignore directives, influence strength, rights, audience,
  permitted use, retention, and downstream inclusion;
- `revisionIntent` distinguishes a fresh request from a delta revision and, for
  a delta, identifies the accepted baseline and every preserved quality;
- `candidatePolicy` defines count, deterministic seed derivation, variation
  dimensions, and resource ceilings without selecting a provider;
- `acceptanceContract` defines the Human decision role and machine-checkable
  preconditions without pretending that artistic acceptance is automatic;
- `policy` captures privacy, locality, cost, rights, and data-movement limits;
- `capabilityAssumptions` records the sanitized snapshot hash against which the
  package was compiled;
- unresolved ambiguity remains unresolved and visible;
- limitations distinguish contract support from route support.

Provider-specific model names, checkpoints, sampler choices, node graphs,
provider syntax, secrets, and local absolute paths are excluded. They belong in
an ImageHoss-owned route compilation record created only after authorization.

### Deterministic compiler

Prompt preview is a pure compilation step:

```text
saved Production configuration
+ explicit sanitized capability snapshot
+ compiler version
→ canonical Prompt Package
```

The compiler must:

1. validate the input schemas;
2. normalize text only according to documented, versioned rules;
3. preserve the verbatim Human instruction;
4. sort unordered collections by their stable identities;
5. preserve ordered direction and precedence lists;
6. calculate deterministic package and seed material with SHA-256;
7. emit blockers for unsupported required locks or unresolved rights;
8. emit canonical JSON with byte-identical output for identical inputs.

The compiler must not read the clock, generate a random UUID, call a model,
probe the network, discover a runtime, access ambient files, spend credits, or
create a Job. Volatile discovery happens separately; its sanitized result is an
explicit compiler input.

Saving the configuration may create a Gummy OS configuration Receipt. It must
not create an ImageHoss Work Order, Job, Lease, Grant, model call, or specialist
Receipt.

## Proposed Production capability

Use one coherent Production-facing aggregate capability:

```text
capability:imagehoss.production-image/v1
```

Its inspectable sub-operations are:

```text
direction.compose
references.assign
prompt.compile
route.select
generate
compare
accept
handoff
bundle.export
recover
cancel
```

Sub-operations describe and constrain the aggregate capability. They are not
independent ambient permissions.

Proposed first runtime identities:

```text
agent:imagehoss-local-comfyui
mold:imagehoss:production-image/v1
```

The existing `capability:imagehoss.reference-preparation/v0`,
`agent:reference-imagehoss-browser`, and
`mold:imagehoss:production-reference` remain truthful proof identities. They
must not be silently upgraded or rewritten.

## Adapter interface

The cross-repository boundary should be narrow and versioned:

```ts
type ImageHossProductionAdapter = {
  discover(input: DiscoveryRequest):
    Promise<ImageHossCapabilitySnapshot>;
  validateConfiguration(input: ImageHossProductionConfiguration):
    Promise<ValidationResult>;
  compilePromptPackage(input: FrozenImageHossContext):
    Promise<ImageHossPromptPackage>;
  execute(input: AuthorizedImageHossExecutionRequest):
    Promise<ImageHossExecutionReturn>;
  recover(input: AuthorizedImageHossRecoveryRequest):
    Promise<ImageHossExecutionState>;
  cancel(input: AuthorizedImageHossCancellationRequest):
    Promise<ImageHossExecutionReturn>;
};
```

`discover` returns sanitized capabilities, versions, locality, allowed route
classes, available resource identities, and limitations. It returns no
credential, session secret, arbitrary path, or provider secret.

`validateConfiguration` and `compilePromptPackage` are non-executing. The
canonical compiler should be ImageHoss-owned and reusable by the authenticated
companion boundary so the two products do not maintain divergent semantics.

`execute`, `recover`, and `cancel` accept only cross-linked, unexpired
Production authority. The request/return envelopes should be:

```text
imagehoss.production-execution-request/v1
imagehoss.production-execution-return/v1
```

## Make Production authority boundary

Before submission, Gummy OS must:

1. reload the saved Production configuration;
2. recompile it against the selected capability snapshot;
3. require the resulting Prompt Package hash to match the approved preview;
4. block on unresolved required direction, rights, route, cost, or approval;
5. freeze configuration, package, input Asset, and source-context hashes;
6. create the minimum Context Envelope;
7. create one aggregate Work Order for the ImageHoss Production node;
8. bind the actual ImageHoss Agent and active Mold;
9. issue an expiring Task Lease and least-privilege Capability Grant;
10. obtain the Human execution approval required by the Production contract.

At the authenticated ImageHoss boundary, the adapter must:

1. validate schema versions and every cross-linked identity;
2. validate package, configuration, context, and Asset hashes;
3. validate Agent, Mold, Lease, Grant, expiry, capability, operation, project
   root, locality, cost ceiling, and requested outputs;
4. reject replay, missing authority, mismatched authority, expired authority,
   unsupported locks, unavailable routes, and out-of-scope references;
5. create one specialist execution contract and one authorized ImageHoss Job
   containing the bounded candidate attempts;
6. record route compilation separately from the semantic Prompt Package;
7. return truthful terminal or recoverable state.

The local companion should use explicit Human pairing and a short-lived session
token bound to the allowed Gummy OS origin and configured ImageHoss project
root. The token must never enter configurations, Prompt Packages, URLs,
Receipts, exported evidence, or logs. Pairing proves a local session; it does
not replace the Work Order, Lease, or Grant as authority.

The bridge remains loopback-only and allowlisted. It does not gain arbitrary
workflow submission, remote filesystem browsing, or ambient repository write
authority.

## Exact authority and data flow

```text
Human
  │ opens @ImageHoss inside one Production
  ▼
Gummy OS ImageHoss Actor App Surface
  │ permitted Actor/Asset context slices only
  │ edit + validate + deterministic preview
  ▼
Saved ProductionActorConfiguration
  │ gummy.imagehoss-production-configuration/v1
  │ no execution authority
  ▼
Human selects Make Production
  │ recompile + preview-hash match + approval
  ▼
Frozen Context Envelope + Prompt Package
  │
  ├── Gummy OS Work Order
  ├── actual Agent: agent:imagehoss-local-comfyui
  ├── Mold: mold:imagehoss:production-image/v1
  ├── expiring Task Lease
  └── least-privilege Capability Grant
        │ authenticated loopback companion
        ▼
ImageHoss execution contract
  │ route compilation + one Job with bounded candidate attempts
  ▼
Allowlisted local ComfyUI route
  │ original/proxy bytes + exact hashes
  ▼
ImageHoss Assets + comparison record
  │
  ▼
Human role-specific acceptance
  │
  ├── ImageHoss acceptance + specialist Receipt + .hoss evidence
  ├── Gummy OS result Gummies + Return + Production Receipt
  └── optional untouched typed VideoBoss handoff
```

The two Receipts retain their own namespaces and semantics. Each stores the
other's stable identity and content hash as a link.

## Execution, comparison, and acceptance

Successful generation is not successful Production acceptance.

After generation, the Production Run should enter a review state such as
`awaiting-human-acceptance`. ImageHoss may report objective results such as
dimensions, Asset hashes, route identity, local-only execution, reference
availability, and whether a machine-verifiable constraint passed. It must not
claim that identity, composition, style, or overall artistic quality was
accepted.

A role-specific acceptance record should identify:

- accepted original and proxy Asset identities and hashes;
- Production and ImageHoss Project;
- accepted downstream role;
- Prompt Package and comparison record;
- Human decision identity and time;
- accepted criteria and documented exceptions;
- superseded acceptance, if this is a revision;
- permission for `.hoss` inclusion or downstream handoff.

The Human can reject all candidates, request a delta revision, or accept one.
“Keep everything except X” means the accepted Asset is the baseline, every
other accepted quality is copied into preserved locks, and only X becomes the
requested delta. A model output must never silently replace the accepted
baseline.

## Bundle evolution

`.hoss` v1 uses exact-key validation. Adding Prompt Packages, comparisons,
role-specific acceptance, Production links, and linked Receipts to that
manifest would be a breaking change.

The first implementation should therefore:

- continue to read and import `imagehoss.bundle` `1.0.0`;
- introduce `imagehoss.bundle` `2.0.0` for the expanded manifest;
- add Prompt Packages, comparison records, acceptance records, Production
  links, and Receipt links in v2;
- provide an inspect-first, deterministic, non-destructive v1-to-v2 migration;
- never rewrite a v1 bundle in place;
- preserve all v1 Assets, hashes, lineage, rights, selection, and evidence.

## Bounded first vertical slice

The first slice should prove the complete authority and evidence loop without
claiming capabilities the R5 route does not have.

### Scenario

A Production requests two local-only, 16:9 concept/background candidates for
the role:

```text
production.concept-reference
```

The configuration uses text direction, negative direction, aspect, candidate
count two, deterministic seeds derived from the configuration/package hash,
local-only privacy, zero provider spend, and objective output criteria. It uses
no identity lock, wordmark lock, image-conditioned composition lock, mask,
ControlNet input, or other reference-pixel requirement.

Preview produces a byte-stable `imagehoss.prompt-package/v1` and creates no
Job. `Make Production` creates one authorized aggregate ImageHoss Work Order
and one ImageHoss Job with two bounded, independently evidenced candidate
attempts. The actual runtime is
`agent:imagehoss-local-comfyui`.

ImageHoss returns two original/proxy pairs with exact hashes. The Human compares
them and accepts one for `production.concept-reference`. ImageHoss emits its
acceptance, `.hoss` evidence, and specialist Receipt. Gummy OS creates linked
result Gummies without changing any source Gummy, then creates its Return and
Production Receipt.

If the same slice requests an exact identity, wordmark, source-image
composition, or other required reference lock, preview or pre-execution
validation must block with a truthful limitation:

```text
required lock unsupported by selected ImageHoss R5 text-to-image route
```

That blocked case is part of the vertical slice, not deferred error handling.

### Why this slice

It proves configuration isolation, deterministic compilation, explicit
authority, an actual specialist Agent, authenticated local execution, multiple
candidates, Human acceptance, durable Asset lineage, linked evidence, and
truthful capability failure. It does not pretend the founder's full Lantern
Chamber identity-lock example is achievable through the current text-only
route.

## Files proposed for a later implementation

The names below are review targets, not changes authorized by this document.

### Gummy OS

Add:

- `schemas/imagehoss-production-configuration.schema.json`
- `schemas/imagehoss-execution-request.schema.json`
- `schemas/imagehoss-execution-return.schema.json`
- `src/integrations/imagehoss-production-adapter.js`
- `tests/imagehoss-production-contract.test.mjs`

Update:

- `src/core/production-runtime.js`
- `src/core/production-repository.js`
- `src/core/schema-validator.js`
- `src/apps/actor-surface.js`
- `src/apps/production.js`
- `public/registry/first-party-applications.json`
- `tests/production-runtime.test.mjs`
- `tests/production-persistence.integration.test.mjs`
- `tests/e2e/production.spec.mjs`

If Gummy OS vendors the ImageHoss Prompt Package schema for local validation,
the vendored file must declare ImageHoss ownership, exact upstream version, and
content hash. Gummy OS must not become a second owner of that schema.

### ImageHoss

Add:

- `src/protocol/production-v1.ts`
- `src/protocol/production-v1.test.ts`
- `src/core/prompt-package.ts`
- `src/core/prompt-package.test.ts`
- `services/comfy-bridge/authority.mjs`
- `services/comfy-bridge/authority.test.mjs`

Update:

- `src/core/types.ts`
- `src/core/routes.ts`
- `src/core/runner.ts`
- `src/core/engine.ts`
- `src/adapters/capabilityClient.test.ts`
- `src/adapters/comfyClient.test.ts`
- `src/adapters/hossClient.test.ts`
- `services/comfy-bridge/server.mjs`
- `services/comfy-bridge/execution.mjs`
- `services/comfy-bridge/execution.test.mjs`
- `services/comfy-bridge/hoss-bundle.mjs`
- `services/comfy-bridge/hoss-bundle.test.mjs`

Documentation and frozen Receipt updates should be written only after the
implementation and evidence are real. Existing R1–R5 Receipts must remain
unchanged.

## Automated acceptance plan

### Contract and compiler

1. Identical frozen configuration, capability snapshot, and compiler version
   produce byte-identical Prompt Packages and SHA-256 hashes.
2. Preview performs no model, network, Job, Lease, Grant, credit, or specialist
   Receipt action.
3. Unknown keys, version mismatches, invalid rights, and malformed hashes fail
   closed.
4. Reference role, source identity, hash, owner, rights, audience, permitted
   use, retention, and downstream inclusion round-trip exactly.
5. Delta revision preserves all accepted locks except the explicit delta.
6. Unapproved Actor context cannot appear in the package.
7. Two Productions maintain isolated configurations and package hashes.

### Discovery and authority

8. ImageHoss is unavailable when its trusted loopback companion or compatible
   route is absent.
9. Discovery returns sanitized capabilities and no secret or arbitrary path.
10. Missing or mismatched Agent, Mold, Lease, Grant, Human approval, package
    hash, input hash, or capability blocks execution.
11. Expired authority, replay, and authority from another Production fail
    closed.
12. The paired session token is origin/root-bound, short-lived, redacted, and
    insufficient without Production authority.
13. Unsupported required locks block before a model Job.

### Execution and evidence

14. `Make Production` creates one aggregate ImageHoss Work Order and exactly
    one authorized ImageHoss Job for the first slice; that Job contains exactly
    two bounded candidate attempts.
15. The selected route remains loopback-only, local-only, and allowlisted.
16. Original/proxy bytes survive bridge restart and reproduce recorded hashes.
17. Result Gummies preserve ImageHoss Asset identity and source hash without
    altering source Gummies.
18. Generation transitions to Human review; it does not auto-accept.
19. Role-specific Human acceptance links the chosen Asset, Prompt Package,
    comparison, Production, and downstream role.
20. ImageHoss and Gummy OS Receipts remain separate and cross-linked.
21. `.hoss` v1 remains readable; v2 round-trips new records; migration is
    deterministic, inspect-first, and non-destructive.
22. Recovery and cancellation return truthful completed, denied, blocked,
    failed, cancelled, expired, or capability-unavailable evidence.
23. Browser restart preserves the Production, configuration, ImageHoss Jobs,
    Assets, acceptance, linked Gummies, and Receipts.

### Product quality

24. Accessibility and keyboard behavior pass on the specialist surface and
    Human comparison/acceptance flow.
25. Visual regression evidence covers configuration, preview, execution,
    blocked capability, comparison, acceptance, and receipt-link views.
26. Exact-head evidence records both repository commits, schema/compiler
    versions, runtime identity, route limitation, tests, and artifact hashes.
27. Optional VideoBoss handoff preserves the accepted source envelope and
    remains read-only.
28. Actor memory changes occur only through an explicit, Human-approved
    `ActorUpdateProposal`.

## Evidence required for implementation acceptance

The later implementation Receipt must include:

- exact Gummy OS and ImageHoss heads and their reviewed baselines;
- schema, protocol, bundle, adapter, and compiler versions and hashes;
- capability snapshot and selected route identities;
- Work Order, Agent, Mold, Lease, Grant, Job, Return, and Receipt cross-links;
- Prompt Package and input/output Asset hashes;
- proof that preview created no Job;
- proof of the one authorized ImageHoss Job and its two real local candidate
  attempts;
- bridge-restart Asset hash recovery;
- the unsupported-required-lock blocked case;
- Human comparison and role-specific acceptance;
- `.hoss` v1 compatibility and v2 round-trip/migration evidence;
- linked but distinct specialist and Production Receipts;
- automated test, accessibility, visual, build, audit, and diff-check results;
- exact cost, locality, data movement, model/runtime, and quality limitations.

## Explicit limitations

- The proven R5 local workflow is text-to-image. It cannot satisfy exact visual
  identity, wordmark, reference-pixel composition, mask, pose, or ControlNet
  locks.
- The frozen R5 proof used an older Stable Diffusion 1.5 checkpoint for
  integration evidence. It is not a production-quality model-roster approval.
- A deterministic Prompt Package makes intent and execution reproducible at the
  contract level; it does not make stochastic model pixels identical across
  every runtime, device, dependency, or model revision.
- Human acceptance remains final for visual quality and downstream role.
- Local pairing and loopback reduce exposure but do not replace explicit
  Production authority or rights checks.
- Production-specific choices do not silently become personal Actor memory.

## Non-goals

- cloud provider expansion;
- arbitrary ComfyUI workflow or custom-node submission;
- remote filesystem browsing;
- provider credentials in Gummy OS or the browser;
- broad collaboration, public publishing, payment, or marketplace systems;
- automatic personal taste profiling;
- automatic promotion into Actor memory;
- VideoBoss execution wiring;
- Meshmallow execution wiring or migration of existing `3d-bee` history;
- wallpaper production;
- a generic specialist-app SDK before this adapter proves the pattern;
- rewriting ImageHoss inside Gummy OS;
- changing the existing R1–R5 frozen Receipts;
- implementing the contract before founder review accepts this package.

## Review gate

Implementation remains blocked until the founder accepts or amends:

1. contract ownership and version names;
2. Prompt Package semantics;
3. required-lock fail-closed behavior;
4. the authenticated loopback authority boundary;
5. role-specific Human acceptance;
6. `.hoss` v2 compatibility strategy;
7. the bounded first vertical slice and its explicit quality limitations.

After acceptance, implementation should proceed only through that vertical
slice, collect exact-head evidence, and stop again for review before expanding
routes or specialist integrations.
