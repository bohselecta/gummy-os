# ImageHoss Production Prompt Contract Worksheet

**Status:** Founder input required before the first real ImageHoss adapter pass  
**Date:** 2026-07-27  
**Next Human deliverable:** Hayden defines how ImageHoss should understand, compile, expose, and preserve visual direction inside a Gummy OS Production.

> **Do not begin the real ImageHoss adapter implementation from generic assumptions. Complete this prompt contract first.**

## Why this worksheet exists

The consolidated Gummy OS runtime now has a stable technical seam:

```text
@ImageHoss service Actor
→ Actor App Surface
→ Production Actor Configuration
→ frozen Context Envelope
→ actual Agent identity
→ Mold + Task Lease + Grant
→ capability adapter
→ result Gummy + Return + Receipt
```

The current deterministic `@ImageHoss` reference Agent proves routing and evidence. It does not define ImageHoss's real creative intelligence.

The existing `bohselecta/imagehoss` product is already broader than "reference preparation." Its proven loop is:

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

This worksheet defines the missing founder-level contract between Production intent and that complete ImageHoss loop.

## Locked mode distinction

ImageHoss must support three truthful modes.

### Standalone ImageHoss

The user opens ImageHoss outside a Gummy OS Production and may run its own explicit Jobs under ImageHoss authority and evidence rules.

### Production-scoped configuration

The user opens `@ImageHoss` inside a Production.

This mode may:

- receive the permitted Production context;
- assign references and their roles;
- compose visual direction;
- preview the compiled prompt package;
- choose a detected route;
- configure output and acceptance requirements;
- save Production-specific settings.

It must not call a model or generate an image merely because the window opened, settings changed, or configuration was saved.

### Production Run execution

**Make Production** freezes the approved ImageHoss configuration and creates the Work Order, Context Envelope, Task Lease, Grant, actual ImageHoss Job, outputs, Return, and Receipt.

A later explicit Production revision creates a new Run. It does not mutate the frozen prior Run.

## Current ImageHoss input vocabulary

The existing ImageHoss application already recognizes:

```text
Direction
- brief
- target use
- aspect: 16:9 | 4:5 | 1:1 | 9:16
- privacy: local-only | connected-ok
- constraints
- negative

Reference roles
- subject
- composition
- style
- lighting
- material
- color
- camera
- layout
- negative
```

The founder prompt contract may refine or extend this vocabulary, but must preserve the ability to identify what each reference is supposed to influence.

## Founder section 1 — What the Human says

Define the shortest natural instruction that should be sufficient to begin an ImageHoss Production configuration.

Complete or replace this pattern:

```text
With @ImageHoss, create [DELIVERABLE / TARGET USE]
for [PRODUCTION PURPOSE]
using [ACTORS / REFERENCES / GUMMIES]
while preserving [NON-NEGOTIABLES].
The image should feel [CREATIVE DIRECTION].
Avoid [NEGATIVE / FAILURE MODES].
```

Founder decisions:

- Which facts should ImageHoss infer from the Production?
- Which facts must the Human state explicitly?
- Which omissions should become questions?
- Which omissions may use a visible default?
- Which omissions must block Make Production?
- How conversational should ImageHoss be before showing the structured direction?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 2 — Direction hierarchy

Define the hierarchy ImageHoss must preserve when instructions conflict.

Suggested classes:

```text
LOCKED IDENTITY
people, products, characters, approved likeness, logos, protected details

LOCKED COMPOSITION
required objects, relationships, framing, placement, visual continuity

DELIVERABLE CONTRACT
target use, dimensions, aspect, transparency, output count, file requirements

CREATIVE DIRECTION
mood, era, atmosphere, genre, visual language

PREFERENCES
lighting, palette, camera, materials, texture, rendering choices

EXCLUSIONS
forbidden content, unwanted style drift, anatomical failures, text errors

MODEL-SPECIFIC HINTS
provider or workflow instructions that may be translated or omitted by route
```

Founder decisions:

- Which class always wins?
- Can creative direction override a reference?
- Can a reference override written instructions?
- How should contradictory references be handled?
- What is a blocker versus a warning versus an accepted tradeoff?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 3 — Reference influence

For each reference role, define what ImageHoss should extract, what it should ignore, and how strongly it should influence the result.

| Role | Extract | Ignore | Default strength | Lockable? |
| --- | --- | --- | --- | --- |
| Subject |  |  |  |  |
| Composition |  |  |  |  |
| Style |  |  |  |  |
| Lighting |  |  |  |  |
| Material |  |  |  |  |
| Color |  |  |  |  |
| Camera |  |  |  |  |
| Layout |  |  |  |  |
| Negative |  |  |  |  |

Founder decisions:

- Can one image hold several roles?
- Should ImageHoss encourage one role per reference?
- How should the Human express "copy this exactly" versus "use only this one quality"?
- How should references from another person's Actor be labeled and permission-checked?
- How should conflicting visual identities be surfaced?
- Which reference-derived facts may be saved to the Production?
- Which may become an ActorUpdateProposal only after repeated accepted evidence?

## Founder section 4 — Actor and permission context

Define how ImageHoss uses personal Actors inside a Production.

Example:

```text
@Hoyt × @ImageHoss

May provide:
- approved likeness Assets;
- approved clothing or appearance guidance;
- approved beagle references;
- private family-use permission.

May not provide:
- complete Actor memory;
- unrelated private photos;
- voice data;
- commercial or public rights not granted;
- inferred personal traits unrelated to the image.
```

Founder decisions:

- What should a represented person see before approval?
- Which private uses may be pre-authorized?
- Which public, commercial, or identity-sensitive uses always require approval?
- What must appear in the final Receipt?
- How should ImageHoss behave when a required Actor context slice is unavailable or revoked?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 5 — Prompt compiler output

Define what ImageHoss should produce before execution.

Recommended visible package:

```text
1. Human-readable Visual Direction
2. Locked requirements
3. Reference influence map
4. Positive prompt
5. Negative prompt
6. Model/workflow route
7. Aspect and dimensions
8. Seed policy
9. Output count
10. Cost/locality/privacy disclosure
11. Acceptance criteria
12. Known risks or unresolved conflicts
```

Recommended machine package:

```text
ImageHossPromptPackage
- schema and version
- Production and Run refs
- target capability
- normalized direction
- reference Assets with role, hash, rights, and influence
- locked facts
- preference facts
- exclusions
- provider-neutral semantic prompt
- route-specific compiled payload
- output contract
- acceptance contract
- provenance requirements
- retention/contribution policy
```

Founder decisions:

- Should the positive prompt be concise or exhaustive?
- Which information belongs outside the literal model prompt but inside the workflow?
- Should ImageHoss generate one canonical prompt or a family of candidates?
- Should the Human see provider-specific syntax?
- What should be editable directly?
- What must be regenerated from structured state rather than hand-edited?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 6 — Route translation

ImageHoss must preserve one provider-neutral visual intent while translating it to the selected route.

Current proven route:

```text
local ComfyUI
```

Future routes may include approved cloud image providers.

Founder decisions:

- Which semantic facts must survive every route?
- Which controls may be route-specific?
- What should happen when a route cannot honor a lock?
- Should ImageHoss block, ask for a tradeoff, or select another route?
- How should model/checkpoint/workflow choice be explained?
- What counts as an equivalent output across routes?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 7 — Variation strategy

Define how ImageHoss should explore without losing intent.

Possible controlled variations:

- composition;
- camera;
- lighting;
- material;
- palette;
- expression or pose;
- environment;
- degree of stylization.

Founder decisions:

- Which dimensions should remain locked by default?
- Which dimensions should vary first?
- How many candidates are useful?
- Should variations be deliberately diverse or tightly adjacent?
- How does the Human ask for "same image, only fix X"?
- How does ImageHoss prevent a correction from changing unrelated accepted qualities?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 8 — Compare and accept

Define the evaluation system.

Possible dimensions:

```text
identity fidelity
composition fidelity
reference-role coverage
prompt adherence
continuity
technical quality
legibility
artifact defects
production usefulness
```

Founder decisions:

- What should ImageHoss evaluate automatically?
- What is only the Human's judgment?
- Which failures make a candidate ineligible?
- Can multiple candidates be accepted for different uses?
- What makes an accepted Asset authoritative for downstream VideoBoss or 3D-Bee work?
- What information must remain attached to the Asset forever?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 9 — Revision and correction language

Define the natural correction grammar ImageHoss should understand.

Examples:

```text
Keep everything except the camera angle.

Lock the face and clothing. Explore the environment.

Use the lighting from Reference C, not its color palette.

This is the right composition, but the product is too small.

Make this the accepted subject reference for the Production.
```

Founder decisions:

- What does "keep everything" lock?
- When should ImageHoss create a new prompt revision?
- When should it branch a new direction instead?
- How should accepted qualities be carried forward?
- How should rejected qualities be remembered for this Production without becoming permanent Actor memory?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 10 — Durable outputs

Define what the ImageHoss execution node returns to Gummy OS.

Recommended outputs:

```text
accepted original image Asset
accepted display proxy
ImageHoss Prompt Package
VisualIntentGraph or equivalent structured direction
candidate comparison record
model/workflow/seed facts
source and result hashes
rights and audience envelope
.hoss project or exchange bundle
optional typed VideoBoss handoff
Work Return
Action Receipt
```

Founder decisions:

- Which outputs are always required?
- Which are optional?
- What should appear on the personal Actor's Living Self Page?
- What should remain only inside the Production?
- What should GummyStorage preserve by default?
- What may be shared with another Production?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 11 — ImageHoss personality and guidance

Define the product voice while configuring visual intent.

ImageHoss should be a specialist instrument, not a generic assistant.

Founder decisions:

- Is it terse, direct, encouraging, opinionated, technical, or cinematic?
- When should it challenge weak direction?
- When should it offer creative alternatives?
- How does it explain a blocked capability without sounding bureaucratic?
- How does it distinguish artistic judgment from technical truth?

### Founder answer

```text
[WRITE HERE]
```

## Founder section 12 — One complete reference example

Write one complete Production-scoped example from natural request through accepted output.

Use a real Gummy OS scenario, preferably one with:

- at least one personal Actor;
- several references with distinct roles;
- one strong identity or composition lock;
- one creative choice ImageHoss may explore;
- a clear downstream use such as VideoBoss;
- explicit private/public rights;
- an accepted Asset and Receipt.

### Founder example

```text
[WRITE HERE]
```

## Technical reconciliation required after founder completion

Once the founder sections are complete, the implementation pass must reconcile the contract with:

- `bohselecta/imagehoss` Direction and reference-role types;
- ImageHoss R1–R5 local capability and evidence model;
- the current `.hoss` project/Asset portability contract;
- `gummy.application-registry/v1`;
- `gummy.app-handoff/v1`;
- `gummy.production-actor-configuration/v0`;
- `gummy.context-envelope/v0`;
- Work Orders, Task Leases, Grants, Returns, and Receipts;
- the personal Actor memory proposal boundary;
- the rule that Make Production is the only execution transition inside a Production.

## Reminder

> **Hayden's next product-definition task is the ImageHoss Prompt Contract. Do this before asking Codex to attach the real ImageHoss adapter.**
