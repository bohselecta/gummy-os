# ImageHoss Production Prompt Contract — Founder Answer

**Status:** Founder product definition complete; reconciled, implemented, live-proven, and Human accepted
**Date:** 2026-07-27  
**Canonical implementation repositories:** `bohselecta/gummy-os`, `bohselecta/imagehoss`  
**Related product contract:** `docs/CREATIVE_SPECIALIST_PRODUCTION_CONTRACTS.md`

> **ImageHoss is not a prompt box and not merely a reference-preparation utility. It is the specialist relationship that turns Human and Production intent into structured visual direction, routes that direction truthfully, generates controlled candidates, compares them, records Human acceptance, and hands authoritative visual Assets forward with evidence.**

Its complete relationship remains:

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

## 1. One complete Production-scoped example

This example defines the intended behavior before any schema or adapter design. It is a Production-specific exercise, not a lock on the final Gummy OS Underground wallpaper canon.

### Production

```text
Gummy OS — Lantern Chamber Launch
```

The Production needs a 16:9 Night Gummy hero image that can serve as:

- a 3840 × 2160 desktop wallpaper;
- launch-page key art;
- the accepted start frame for a later 12-second VideoBoss reveal.

### What the Human tells ImageHoss

```text
With @ImageHoss, create a Night Gummy hero image for the Lantern Chamber launch.

Use the canonical Gummy mascot and Glopper references as exact identity locks. Use the approved horizontal wordmark without changing its geometry. Follow the composition sketch strongly: Gummy is left of center, Glopper is low on the right, and the center must remain calm enough for interface windows.

Use the Night Gummy purple and gold as the only interface-brand colors. Use the stone reference only for material language and the film-lighting reference only for lighting.

The image should feel like a warm, strange, premium place below the ordinary web—not a dungeon and not a generic sci-fi cave.

Explore the chamber architecture, depth, fog, secondary practical lights, and a lens between 28 and 35 mm. Do not add text beyond the approved wordmark. Do not add extra mascots, blue or green interface accents, glossy toy-plastic skin, weapons, or dense crystal clutter.

Keep this private to the Production until launch approval. Produce four candidates: two tightly adjacent and two meaningfully different within the allowed exploration space.
```

### Absolute locks

1. **Gummy identity:** silhouette, face, proportions, and approved character details come from the canonical Asset.
2. **Glopper identity:** silhouette, proportions, and approved details come from the canonical Asset.
3. **Wordmark:** approved geometry only; no regenerated lettering.
4. **Composition:** Gummy left of center, Glopper low right, central interface-safe negative space.
5. **Palette:** Night Gummy purple and gold remain the branded interface colors.
6. **Deliverable:** 16:9, 3840 × 2160 master, lossless original plus display proxy.
7. **Rights and audience:** private Production use until an explicit launch approval.
8. **Downstream continuity:** accepted protected regions must be preserved in the VideoBoss handoff.

A route that cannot honor an absolute lock is not "close enough." ImageHoss must choose another truthful route, ask the Human to approve a named tradeoff, or block Make Production.

### What each reference influences

| Reference | Assigned role | Influence | Must ignore |
| --- | --- | --- | --- |
| Canonical Gummy Asset | Subject identity | Exact lock | Its old background, crop, lighting, and camera |
| Canonical Glopper Asset | Subject identity | Exact lock | Its old background, crop, lighting, and camera |
| Approved wordmark Asset | Layout/identity | Exact lock; place existing Asset | Any baked background around it |
| Composition sketch | Composition/layout | Strong lock on placement and negative space | Rough drawing style and colors |
| Night Gummy brand board | Color | Exact palette lock for branded elements | Example composition and materials |
| Stone chamber image | Material | Guide | Its architecture, color grade, and lighting |
| Film still | Lighting/camera mood | Guide | Its people, location, wardrobe, and palette |
| Failure board | Negative | Exclusion | Nothing is copied; listed failures are avoided |

References influence only their assigned roles. ImageHoss must not treat an attractive reference as permission to absorb every visible quality.

### What ImageHoss may explore

- chamber architecture outside the protected composition zones;
- depth and atmospheric layering;
- secondary props that do not compete with the mascots or interface-safe center;
- fog density within a visible range;
- secondary practical-light placement;
- a 28–35 mm lens and small camera-height variations;
- degrees of surface age and tactile detail;
- two adjacent candidates and two deliberately different candidates.

Exploration is a named budget, not permission for general drift.

### What remains unchanged during revision

Suppose Candidate B is accepted as the baseline but the arch is too ornate. The Human says:

```text
Keep everything except the central arch. Simplify that arch by about one third. Preserve the characters, wordmark, camera, lighting, palette, negative space, fog, and every other accepted quality.
```

ImageHoss creates a delta revision from Candidate B. All accepted dimensions become carry-forward locks except the named arch complexity. It does not silently reinterpret the whole prompt or present an unrelated fresh composition as a correction.

If the selected route cannot preserve the baseline closely enough, ImageHoss must say so before execution and offer a more controllable route, a mask/control workflow, or a clearly labeled broader regeneration.

### How the result is accepted

ImageHoss may automatically mark a candidate ineligible for:

- mascot or wordmark identity failure;
- composition-lock failure;
- forbidden colors or text;
- wrong aspect or dimensions;
- visible artifact defects that make the Asset unusable;
- unresolved rights or provenance;
- missing required evidence.

Eligible candidates are compared on identity fidelity, composition fidelity, reference-role coverage, atmosphere, technical quality, and downstream usefulness. ImageHoss can score and explain; it cannot make the artistic acceptance decision for the Human.

The Human accepts Candidate B for two explicit roles:

```text
wallpaper.master
videoboss.start-frame
```

Acceptance is role-specific. It does not make Candidate B the universal visual truth for every future Gummy OS Production.

### What goes to VideoBoss

The typed handoff contains:

- accepted original Asset and display proxy references;
- immutable hashes and lineage;
- role and Production references;
- rights, audience, retention, and contribution policy;
- the provider-neutral Visual Direction and accepted revision;
- protected regions for Gummy, Glopper, wordmark, and interface-safe space;
- allowed motion regions and explicitly forbidden changes;
- camera/lens intent and composition anchors;
- start-frame hold guidance;
- available masks, alpha, depth, or segmentation Assets, identified truthfully;
- unresolved risks and known limitations;
- ImageHoss specialist Receipt;
- the Gummy OS Return and linked Production Receipt.

VideoBoss receives read-only source authority by default. It may create derived Assets, but it must not overwrite the accepted ImageHoss source.

---

## 2. Locked Production behavior

### Opening `@ImageHoss` inside Production

Opening the Actor App Surface is configuration, not execution.

It may:

- receive only permitted Production context;
- show Production title, purpose, target deliverables, and downstream needs;
- assign reference roles and strengths;
- define locks, direction, preferences, exclusions, exploration, route, output, and acceptance requirements;
- discover available capabilities without generating;
- compile and preview the prompt package deterministically from structured state;
- save isolated Production-specific configuration.

It must not:

- call an image model;
- create a provider Job;
- spend credits;
- execute ComfyUI;
- reserve a Task Lease as though work has begun;
- silently infer unresolved identity, rights, or deliverable facts;
- mutate the personal Actor's durable preferences or Creative DNA.

No hidden LLM call is required to make the preview look intelligent. Ambiguous free text remains visible as unresolved direction until the Human structures or confirms it. Configuration may use deterministic parsing, capability discovery, validation, and compilation only.

### `Make Production`

`Make Production` is the sole Production execution transition.

It:

1. freezes the approved ImageHoss configuration;
2. records the exact configuration revision and source hashes;
3. creates the Work Order and Context Envelope;
4. binds the actual ImageHoss Agent/runtime, Mold, Task Lease, and Capability Grant;
5. revalidates rights, route capability, cost/locality, and required locks;
6. invokes the real ImageHoss runtime;
7. creates candidate Assets and comparison evidence;
8. records Human acceptance or a truthful non-completed outcome;
9. returns Assets, Gummies, `.hoss` evidence, Return, and linked Receipts.

A later revision creates a new frozen Run. It never mutates the evidence of the prior Run.

---

## 3. What the Human must say, what Production may supply, and what blocks execution

The shortest useful natural instruction is:

```text
With @ImageHoss, create [deliverable and target use]
for [Production purpose]
using [Actors, Assets, and references]
while preserving [non-negotiable locks].
It should feel [creative direction].
Explore [named degrees of freedom].
Avoid [failure modes].
```

Production may visibly supply, when already explicit and permissioned:

- Production title and purpose;
- accepted brand Assets and palette;
- target platform already chosen by the Production;
- participating Actors;
- existing accepted Assets and continuity anchors;
- downstream VideoBoss or Meshmallow requirements;
- audience and privacy defaults already approved for this Production.

The Human must explicitly confirm:

- the primary deliverable and target use;
- any represented identity or protected product/character;
- absolute locks;
- public, commercial, or identity-sensitive rights;
- the final acceptance decision;
- any tradeoff that weakens a lock.

Visible defaults may cover candidate count, adjacent/diverse variation mix, seed policy, display-proxy dimensions, and a preferred available route. Defaults must be shown and editable.

`Make Production` is blocked when any of the following is unresolved:

- required deliverable type or dimensions;
- primary subject/identity;
- required reference rights;
- a material contradiction between locks;
- no route capable of honoring the locks;
- missing Production approval, Mold, Lease, or Grant;
- unknown audience for sensitive likeness or private references;
- no acceptance contract for a deliverable that must become authoritative downstream.

---

## 4. Direction hierarchy

When instructions conflict, ImageHoss uses this order:

1. **Human authority, consent, law, rights, and safety boundaries.**
2. **Frozen Production locks and accepted continuity Assets.**
3. **Deliverable contract:** use, dimensions, format, count, transparency, audience, cost/locality.
4. **Current explicit Human instruction.**
5. **Role-assigned references within their declared scope.**
6. **Creative direction.**
7. **Preferences and visible defaults.**
8. **Route-specific hints.**

Identity, rights, and deliverable locks are never overridden by style. A written instruction overrides a reference only when the conflict is explicit and the affected lock is not absolute. A reference never overrides written intent outside its assigned role.

Contradictions are handled as follows:

- **Blocker:** two absolute locks cannot coexist, rights are missing, or no route can honor a required lock.
- **Warning:** a route can attempt the request but has a known fidelity or cost risk.
- **Visible tradeoff:** the Human may weaken a named lock for this Run only.
- **Preference conflict:** ImageHoss chooses the higher-priority preference and states the choice in the preview.

---

## 5. Reference roles, extraction, and strength

A reference assignment always states:

```text
Asset
+ owner/provenance
+ role
+ what to extract
+ what to ignore
+ strength
+ whether it is a lock
+ rights/audience/retention
```

### Strength vocabulary

- **Exact:** use the supplied Asset or control signal as the authoritative source for that role; do not approximate when placement/compositing is possible.
- **Strong:** this quality should dominate candidate design, but small route-dependent variance is allowed.
- **Guide:** use the quality as clear direction without copying unrelated details.
- **Accent:** minor influence only.
- **Negative:** detect and avoid the named quality.

A reference may carry several roles, but each role is assigned separately. The interface should encourage role precision, not force one file per role.

| Role | Extract | Ignore by default | Typical default | Lockable? |
| --- | --- | --- | --- | --- |
| Subject | identity, silhouette, proportions, approved details | background, crop, lighting, style | Strong | Yes |
| Composition | framing, placement, scale relationships, negative space | subject identity, palette, rendering style | Strong | Yes |
| Style | mark-making, abstraction, rendering language, era | identities, exact layout, logos | Guide | Yes, for art-direction continuity |
| Lighting | key/fill/rim relationship, softness, direction, contrast | subjects, location, palette unless also assigned | Guide | Yes |
| Material | surface response, roughness, translucency, wear | object identity and geometry | Guide | Yes |
| Color | palette and relative color hierarchy | composition, lighting geometry, subject identity | Strong | Yes |
| Camera | lens character, height, angle, distance, depth behavior | subject design, palette, location | Guide | Yes |
| Layout | graphic zones, text-safe areas, logo placement | illustration style and subjects | Strong | Yes |
| Negative | named failures and forbidden qualities | all desirable qualities | Exclusion | Always |

"Copy this exactly" is accepted only when the Human has rights and the route can use the source Asset/control faithfully. Otherwise ImageHoss translates it into a scoped lock or blocks the request rather than promising impossible exactness.

---

## 6. Personal Actor and permission context

A personal Actor contributes only a permissioned visual context slice. ImageHoss never receives complete Actor memory merely because the Actor participates in the Production.

A represented Actor may contribute:

- approved likeness Assets;
- approved wardrobe/appearance guidance;
- approved body, product, pet, location, or relationship references;
- audience, term, territory, commercial-use, and derivative-use permissions;
- explicit exclusions;
- a revocation path.

The represented Human must see, before approval:

- the intended depiction and target use;
- the exact source Assets;
- whether the result is private, shared, public, promotional, or commercial;
- whether generation may create altered poses, ages, clothes, settings, or expressions;
- whether the Asset may enter `.hoss` export or downstream handoff;
- how long the permission lasts and how revocation affects future Runs.

Public, commercial, biometric/identity-sensitive, sexualized, political endorsement, or materially reputation-affecting uses always require explicit approval. Private uses may be pre-authorized only by a narrow standing policy that identifies purpose, audience, and allowed transformations.

If a required context slice is unavailable or revoked, ImageHoss blocks new execution. Prior evidence and Receipts remain truthful; they are not silently rewritten. Retained Assets follow the original rights and retention envelope.

The final Receipt identifies represented Actors, source Assets, permission version, audience, permitted transformations, route, actual Agent/runtime, and accepted output role.

---

## 7. Prompt compiler output

Before execution, the Human sees an inspectable package with:

1. plain-language visual direction;
2. deliverable and target use;
3. absolute locks;
4. reference influence map;
5. allowed exploration space;
6. positive semantic prompt;
7. negative semantic prompt;
8. route and capability explanation;
9. aspect, dimensions, count, and seed policy;
10. cost, locality, privacy, and rights disclosure;
11. acceptance criteria;
12. unresolved conflicts, warnings, and known limitations;
13. downstream handoff requirements.

The positive prompt should be complete enough to preserve meaning but not repeat every workflow fact. Rights, hashes, file movement, acceptance rules, cost ceilings, and authority remain in structured workflow state rather than being stuffed into model prose.

There is one canonical provider-neutral semantic intent. Candidate prompts may vary only inside the approved exploration budget. The Human edits structured state and plain-language direction; route-specific syntax is inspectable in an advanced view but is regenerated from structured state rather than treated as the source of truth.

---

## 8. Provider-neutral intent and route translation

The provider-neutral contract preserves:

- deliverable purpose;
- identity and composition locks;
- reference roles and influence;
- creative direction;
- allowed exploration;
- exclusions;
- output and acceptance contract;
- rights, privacy, locality, and provenance requirements.

A ComfyUI payload, cloud-provider request, or future local workflow is a compiled implementation of that intent—not the intent itself.

Route-specific controls may include checkpoint, sampler, steps, CFG, denoise, seed, ControlNet/IP-adapter choices, masks, latent size, or workflow node configuration. They may not silently change semantic locks.

When a route cannot honor a lock, ImageHoss must:

1. select a more capable approved route when policy allows;
2. explain the route change and any cost/locality effect;
3. request a named Human tradeoff; or
4. block execution.

Equivalent outputs across routes means equivalent satisfaction of the Production's declared locks and use—not identical pixels.

---

## 9. Controlled variation

Identity, rights, deliverable, accepted continuity, and explicit composition locks remain fixed by default.

ImageHoss varies only named dimensions, such as:

- camera within an approved range;
- lighting arrangement;
- atmosphere;
- environment detail;
- palette only when not locked;
- material treatment;
- pose/expression only when permitted;
- degree of stylization;
- composition only when explicitly open.

Default candidate set:

- two tightly adjacent candidates that test execution quality;
- two meaningfully different candidates that use different parts of the allowed exploration space.

The Human may request fewer, more, all-adjacent, or all-diverse candidates. Candidate count must respect the cost ceiling.

"Keep everything except X" creates a delta revision whose baseline is an accepted or selected candidate. Everything observable and previously accepted is carried forward as a lock except the named change. ImageHoss records what it can and cannot technically preserve before the Run.

---

## 10. Compare and accept

Automatic evaluation may:

- verify dimensions, format, transparency, hashes, and evidence;
- check required Asset presence and protected-region integrity;
- detect obvious identity, anatomy, text, artifact, and layout failures;
- compare candidate coverage of assigned references;
- flag continuity and route-limit risks;
- calculate cost and production usefulness.

Automatic evaluation cannot decide whether the work is beautiful, emotionally right, surprising in the right way, or the final artistic choice.

The acceptance sequence is:

```text
Eligibility gate
→ explained comparison
→ Human selection
→ accepted role(s)
→ immutable acceptance record
→ handoff eligibility
→ Receipt
```

Several candidates may be accepted for distinct roles, such as hero image, alternate crop, thumbnail, concept variant, or VideoBoss start frame.

An Asset becomes authoritative downstream only for the role declared at acceptance. It permanently retains source hashes, prompt-package revision, reference map, route/runtime facts, rights envelope, actual Agent identity, comparison record, acceptance authority, and linked Receipts.

---

## 11. Revision and correction language

ImageHoss understands corrections as edits to structured state, not just new prose.

Examples:

```text
Keep everything except the camera angle.
Lock the face and clothing; explore only the environment.
Use Reference C for lighting, not color.
This composition is accepted, but make the product 15% larger.
Branch a warmer version without changing the current accepted direction.
Make Candidate B the Production's accepted subject reference.
```

A **revision** preserves the same direction and changes named dimensions. A **branch** intentionally creates a new direction while retaining lineage to its source.

Accepted qualities carry forward as explicit locks. Rejected qualities may be retained as Production-scoped negative evidence, but they do not become personal Actor memory. Repeated Human choices may create a separate ActorUpdateProposal with evidence and confidence; they never silently rewrite the Actor.

---

## 12. Durable outputs

Every completed ImageHoss Production Run returns, at minimum:

- original candidate Assets and display proxies;
- accepted Asset(s), if the Human accepts any;
- immutable source and result hashes;
- provider-neutral prompt package / Visual Intent Graph;
- route-specific compiled payload or a safe inspectable representation;
- reference-role and rights map;
- candidate comparison record;
- model/workflow/seed and actual runtime facts;
- acceptance or rejection record;
- `.hoss` project/evidence bundle where supported;
- typed downstream handoff(s), when requested;
- ImageHoss WorkOrder, Job, evidence, and specialist Receipt;
- Gummy OS Work Return and linked Production Receipt.

GummyStorage preserves accepted originals, proxies, hashes, structured intent, rights, handoffs, and Receipts by default. Temporary intermediates follow visible retention policy.

The personal Actor's Living Self Page may show the Production, accepted public-safe work, Human acceptance decisions, and evidence-backed contribution. Private prompts, references, rejected candidates, and Production-only rights remain inside the Production unless separately approved.

Sharing with another Production creates a reviewed versioned copy or read-only handoff. It never silently shares complete context or grants broader rights.

---

## 13. ImageHoss voice

ImageHoss behaves like a strong visual director paired with a careful production technician.

It is:

- direct;
- visually literate;
- concrete about what each reference is doing;
- opinionated when direction is weak or contradictory;
- honest about model and route limitations;
- economical with questions;
- clear about artistic judgment versus technical fact.

It challenges weak direction by naming the missing decision:

```text
The composition reference and the written placement conflict. Which one is the lock?
```

It offers alternatives only inside the declared exploration budget. It explains blocked capability in production language:

```text
This route cannot preserve the approved wordmark geometry. I can composite the supplied Asset after generation, switch to the controlled local workflow, or stop this Run.
```

It never uses bureaucratic policy language when a plain production explanation will do.

---

## 14. Reconciliation and implementation outcome

The repository reconciliation, provider-neutral Prompt Package, Production
configuration contract, paired runtime boundary, deterministic preview, Make
Production execution path, automated acceptance, and explicit limitations are
implemented.

The original `capability:imagehoss.reference-preparation/v0` proof remains
historical evidence. The finished relationship is additive and preserves
ImageHoss-native Jobs, Assets, `.hoss`, comparison, Human acceptance,
VideoBoss handoff, and specialist Receipts rather than renaming the narrow
proof.

Accepted implementation anchors:

- Gummy OS activation: `4369d7181868cfd173f88698816b9190f9c0ad11`;
- ImageHoss: `340f819b20c5b6d7ea988459c9380759941c757f`;
- accepted Image Asset:
  `2f53ecd6891137462908154427bf0bf8eaaf2b37bfe193309ff2050819c0956a`;
- accepted `.hoss`:
  `c31c39ab8ec0dadb0bd0b12d9b57dbdca636450990971f2076f3e7e4e8e78b97`.

See `docs/release/PHASE-10-UBUNTU-LIVE-ACTIVATION.md` for exact runtime,
cross-specialist, acceptance, and limitation evidence.
