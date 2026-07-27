# Creative Specialist Production Contracts

**Status:** Founder product definition complete; implementation and schema reconciliation remain active Codex work  
**Date:** 2026-07-27  
**Canonical platform repository:** `bohselecta/gummy-os`  
**Specialist repositories:** `bohselecta/imagehoss`, `bohselecta/videoboss`, `bohselecta/3d-bee`

## Founder ruling

Gummy OS must not reduce its specialist creative applications to generic prompt boxes, attachment pickers, or narrow placeholder capabilities.

Each specialist is a useful, persistent service Actor with a complete relationship to a Human and a Production:

```text
Human intent
→ Production-specific structured direction
→ inspectable configuration
→ Make Production
→ bounded actual runtime
→ candidates / checkpoints / takes
→ compare and Human acceptance
→ durable handoff
→ Return and linked Receipts
```

Opening, arranging, previewing, or saving a specialist inside Production does not execute. **Make Production executes.**

The first implementation remains ImageHoss. VideoBoss and the 3D specialist are defined now so the ImageHoss adapter establishes a reusable pattern without pretending all three applications are the same.

---

# Part I — Shared Production grammar

## 1. The two truthful modes

Every specialist has at least two truthful modes.

### Configure inside Production

```text
Open @Specialist
→ receive permitted Production context
→ structure direction
→ assign references and Assets
→ declare locks and exploration
→ preview compiled package and route
→ save Production-specific configuration
→ no model call and no creative runtime execution
```

Configuration may perform deterministic validation, compilation, cost estimation, capability discovery, hash lookup, and rights checks. It may not create a generation Job, execute Blender, spend credits, or claim work has begun.

### Make Production

```text
Make Production
→ freeze configuration revision
→ create Work Order
→ create Context Envelope
→ bind actual Agent/runtime
→ obtain Mold, Task Lease, and Capability Grant
→ execute bounded capability
→ return results and evidence
→ compare and accept
→ create typed handoff
→ Return and linked Receipts
```

A revision after execution creates a new immutable Run. Previous Runs remain inspectable and are never rewritten to match the latest decision.

## 2. Structured intent, not schema-first thinking

The Human should be able to speak naturally. The specialist's job is to expose the important decisions clearly enough that the Human can see what will remain fixed, what each reference contributes, what the runtime may explore, and what counts as success.

Each configuration therefore separates:

### Absolute locks

Facts that must survive every route and revision unless the Human explicitly weakens them for a new Run.

Examples:

- identity and likeness;
- product or character geometry;
- approved logos and text;
- composition or continuity anchors;
- target use, aspect, duration, dimensions, formats, engine, and budgets;
- rights, privacy, audience, locality, and cost ceilings;
- an accepted source Asset's protected regions.

### Creative direction

The desired meaning, experience, mood, story, era, atmosphere, visual language, pacing, or spatial feeling.

Creative direction is strong but may not override identity, rights, deliverable, or accepted continuity locks.

### Preferences

Soft choices such as lens, palette when not locked, material nuance, motion character, lighting detail, renderer, model, workflow, or export option.

Preferences may be translated by the selected route. Translation must be visible.

### Exploration budget

The dimensions the runtime is permitted to vary. Everything outside the declared exploration budget remains stable by default.

### Exclusions

Forbidden content, known failure modes, unwanted drift, unusable artifacts, disallowed transformations, and route-specific hazards.

### Acceptance contract

The objective eligibility gates, comparison dimensions, Human acceptance authority, and downstream role an accepted result will hold.

## 3. Authority order when intent conflicts

All three specialists use this order:

1. Human authority, consent, law, rights, and safety boundaries.
2. Frozen Production locks and accepted continuity Assets.
3. Deliverable contract and downstream compatibility.
4. Current explicit Human instruction.
5. Role-assigned references within their declared scope.
6. Creative direction.
7. Preferences and visible defaults.
8. Runtime-specific hints.

A contradiction involving a lock is never resolved by hidden guessing. The specialist identifies the conflict and classifies it as a blocker, warning, or named tradeoff.

## 4. Reference assignment

A reference is not merely attached. It is assigned work.

Every reference relationship states:

```text
source Asset
+ owner and provenance
+ role
+ what to extract
+ what to ignore
+ influence strength
+ lock status
+ rights / audience / retention
```

Shared strength language:

- **Exact:** authoritative for the assigned role; use the actual Asset/control where possible.
- **Strong:** dominant influence with limited variance.
- **Guide:** clear influence without copying unrelated qualities.
- **Accent:** minor influence.
- **Negative:** avoid the named quality.

One Asset may have several roles, but each role is explicit. Unassigned visible qualities are ignored by default.

## 5. Revision grammar

The crucial correction behavior is:

```text
Keep everything except X.
```

That sentence creates a **delta revision** from a selected or accepted baseline.

The specialist must:

1. identify the baseline;
2. lock every previously accepted dimension except X;
3. state the exact requested change;
4. select controls and a route capable of preserving the baseline;
5. warn before execution if preservation cannot be guaranteed;
6. compare the new result against the baseline on both changed and unchanged dimensions.

A **revision** preserves the direction. A **branch** intentionally creates a new direction while retaining lineage.

## 6. Compare and Human acceptance

The specialist may determine eligibility and provide analysis. The Human makes the final artistic or product decision.

```text
objective eligibility
→ explained comparison
→ Human acceptance
→ accepted role(s)
→ immutable acceptance record
→ downstream authority
```

Acceptance is role-specific. An image may be authoritative as a start frame but not as the only future depiction. A take may be accepted for one shot but not as the master edit. A 3D package may be accepted as a concept scene but not as manufacturing geometry.

## 7. Actor permission boundary

A participating personal Actor provides only a permissioned context slice. None of the specialists receive complete Actor memory by default.

Sensitive visual, voice, performance, scan, CAD, private-space, or identity Assets require an explicit Rights Envelope. Public, commercial, endorsement-like, identity-sensitive, or materially reputation-affecting use always requires explicit approval.

Revocation blocks future Runs that require the Asset. Prior evidence remains truthful and retained according to the original envelope.

## 8. Durable evidence

Every specialist preserves two linked evidence layers:

```text
specialist-native Job / Asset / package / Receipt
+
Gummy OS Work Order / Envelope / Lease / Grant / Return / Receipt
```

One Receipt is not flattened into the other. They are linked.

Accepted source Assets remain immutable. Downstream applications receive read-only source authority by default and create derived Assets with their own hashes and Receipts.

No specialist silently turns Production-specific choices into personal Actor memory. Repeated Human choices may create an evidence-backed `ActorUpdateProposal`; Human approval remains required.

---

# Part II — ImageHoss

## 1. Product-level definition

**ImageHoss is the visual-direction, reference-control, image-generation, comparison, acceptance, provenance, and handoff specialist.**

Its relationship is:

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

ImageHoss turns Human and Production intent into an inspectable provider-neutral visual direction, then compiles that direction into a truthful runtime-specific image workflow only when Make Production executes.

It is not:

- a generic image chatbot;
- a prompt textarea with attachments;
- a Photoshop replacement;
- a claim that all providers can honor all locks;
- merely `reference-preparation`.

The complete founder answer lives in `docs/IMAGEHOSS_PRODUCTION_PROMPT_CONTRACT_WORKSHEET.md`.

## 2. Complete example in seven decisions

### What the Human tells ImageHoss

Create a 16:9 Night Gummy launch image for a Production. Use canonical Gummy, Glopper, and wordmark Assets; keep central interface-safe negative space; explore chamber architecture and atmosphere; avoid extra text, off-brand colors, glossy toy surfaces, and generic dungeon imagery.

### Absolute locks

- mascot identities;
- wordmark geometry;
- composition zones;
- Night Gummy palette;
- 3840 × 2160 deliverable;
- private audience until launch;
- protected regions required by VideoBoss.

### Reference influence

- character Assets control identity only;
- sketch controls composition only;
- brand board controls color only;
- film still controls light/camera mood only;
- stone image controls material language only;
- failure board supplies negatives only.

### Allowed exploration

Architecture outside protected zones, atmosphere, practical-light placement, 28–35 mm lens choice, surface age, and four controlled candidates.

### What survives revision

When the Human says "keep everything except the arch," all accepted identity, composition, palette, light, fog, camera, and layout qualities become carry-forward locks. Only arch complexity changes.

### Acceptance

Automatic gates reject identity, wordmark, composition, dimensions, rights, or artifact failures. ImageHoss compares eligible candidates; the Human accepts one for `wallpaper.master` and `videoboss.start-frame`.

### VideoBoss handoff

Original/proxy references, hashes, rights, accepted role, protected and movable regions, camera/lens intent, allowed motion, forbidden changes, optional depth/masks, prompt-package revision, limitations, and linked Receipts.

## 3. ImageHoss Production configuration

Opening `@ImageHoss` may configure:

- deliverable and target use;
- subject and identity locks;
- composition and layout locks;
- creative direction and preferences;
- reference roles and strengths;
- positive and negative semantic direction;
- aspect, dimensions, count, seed policy, locality, privacy, and cost;
- available route and known limitations;
- controlled variation strategy;
- comparison and acceptance criteria;
- downstream VideoBoss or Meshmallow requirements.

The visible prompt package is compiled deterministically from structured state. Ambiguity remains visible; no hidden model call resolves it during configuration.

## 4. ImageHoss provider-neutral package

The Human should see:

1. visual-direction summary;
2. deliverable contract;
3. locks;
4. reference influence map;
5. allowed exploration;
6. positive semantic prompt;
7. negative semantic prompt;
8. route/capability explanation;
9. output and seed policy;
10. cost/locality/privacy/rights disclosure;
11. acceptance contract;
12. downstream handoff requirements;
13. unresolved risks.

A ComfyUI workflow or future provider payload is compiled from this package. It is never the canonical intent.

## 5. ImageHoss comparison and outputs

ImageHoss compares:

- identity fidelity;
- composition fidelity;
- role-specific reference coverage;
- prompt adherence;
- continuity;
- technical quality;
- text/logo correctness;
- artifact defects;
- downstream production usefulness.

A completed Run returns:

- original and proxy candidate Assets;
- accepted Assets with role-specific authority;
- hashes and lineage;
- provider-neutral prompt package / Visual Intent Graph;
- safe route-specific payload evidence;
- comparison and acceptance records;
- model/workflow/seed/runtime facts;
- Rights Envelope;
- `.hoss` evidence;
- typed handoff(s);
- specialist Return/Receipt and Gummy OS Return/Receipt.

## 6. ImageHoss personality

ImageHoss is a decisive visual director and careful production technician. It challenges contradictions by naming the visual decision, not by delivering generic assistant prose. It distinguishes taste from measurable failure and never claims exact preservation when the route cannot provide it.

---

# Part III — VideoBoss

## 1. Product-level definition

**VideoBoss is the moving-image direction, sequence planning, shot construction, model routing, Cost Shield, take review, continuity, acceptance, and delivery specialist.**

Its complete relationship is:

```text
Direction
→ Assets and Continuity
→ Sequence
→ Shot Packets
→ Route and Cost
→ Render Takes
→ Review and Compare
→ Accept and Lock
→ Deliver and Handoff
→ Receipt
```

VideoBoss turns Production purpose into a structured cinematic plan and then coordinates actual video execution. It is not merely a prompt field for a video model, a list of clips, or a generic timeline editor.

The core product intelligence lives in the relationship between story intent, shot intent, continuity, route risk, cost, take review, and lessons carried into the next controlled revision.

## 2. Complete Production-scoped example

The same Production has an accepted ImageHoss Asset for `videoboss.start-frame` and needs a silent 12-second looping launch reveal.

### What the Human tells VideoBoss

```text
With @VideoBoss, turn the accepted Lantern Chamber start frame into a 12-second silent loop for the Gummy OS launch page.

Hold the opening frame for half a second. Use one slow forward camera move. Glopper may raise the lantern and move slightly; Gummy remains the visual anchor. The lantern light should reveal the calm center where interface windows will appear. End close enough to the opening composition that the loop is not distracting.

Preserve both mascot identities, the approved wordmark, the purple/gold palette, the interface-safe center, and the accepted architecture silhouette. Do not add speech, lip sync, new text, extra characters, a second camera angle, or large environmental motion.

Explore camera easing, subtle parallax, dust, fog movement, light bloom, and three motion-performance variants. Keep the total planned provider cost below the Production ceiling. Return a web master, review proxy, shot packet, continuity record, and evidence.
```

### Absolute locks

1. Accepted ImageHoss Asset as the start-frame authority.
2. Mascot and wordmark identity.
3. Central interface-safe negative space.
4. One-shot structure and 12-second duration.
5. Silent deliverable and looping use.
6. Night Gummy palette and accepted architecture silhouette.
7. Public-launch rights only after Production approval.
8. Cost ceiling and approved route/locality.

### What each reference influences

| Reference | Role | Influence | Must ignore |
| --- | --- | --- | --- |
| Accepted ImageHoss Asset | Start frame / continuity | Exact lock at frame 0 and visual anchor throughout | No inference of unseen motion |
| Mascot Assets | Subject identity | Exact lock | Old backgrounds and poses unless separately assigned |
| Motion sketch | Motion blocking | Strong | Drawing style and proportions |
| Camera clip | Camera movement | Guide | Subjects, setting, and color grade |
| Performance clip | Glopper action | Guide | Actor identity and wardrobe |
| Lighting clip | Temporal lighting | Guide | Camera and set geometry |
| Timing board | Edit/rhythm | Strong | Visual style |
| Failure reel | Negative | Exclusion | Nothing positive is copied |

### What VideoBoss may explore

- three subtle Glopper performance variants;
- camera easing and exact dolly distance within a declared range;
- parallax strength;
- atmospheric motion;
- practical-light timing;
- route/model choices that satisfy the same shot contract;
- draft versus premium take strategy within the cost ceiling.

It may not invent a new scene, cut, line of dialogue, character action, or dramatic event merely because the provider performs better with more motion.

### What remains unchanged during revisions

Suppose Take 2 has the right motion but too much bloom:

```text
Keep Take 2 exactly as the baseline. Reduce only the lantern bloom and the reflected gold on the center floor. Preserve timing, camera path, Glopper performance, fog, palette, identity, and loop closure.
```

VideoBoss creates a take revision with Take 2 as the source. It carries forward shot timing, frame anchors, motion tracks, accepted continuity, and every unmentioned quality. If the provider cannot perform a local correction without temporal drift, VideoBoss offers a repair route, compositing step, or broader rerender and labels the tradeoff.

### How VideoBoss decides eligibility and supports acceptance

A take is ineligible when it fails:

- subject identity or protected-region integrity;
- duration, aspect, frame rate, or delivery format;
- required start/end frame relationship;
- temporal stability severe enough to be unusable;
- forbidden text, character, cut, or camera behavior;
- rights, cost, route, or evidence requirements;
- audio silence when silence is locked.

Eligible takes are compared on:

- story/beat clarity;
- shot-intent fidelity;
- identity and continuity;
- camera and motion coherence;
- temporal stability;
- light and atmosphere;
- loop quality;
- technical defects;
- cost and route risk;
- edit and downstream usefulness.

VideoBoss explains the tradeoffs. The Human accepts a take for a declared shot/master role.

### What VideoBoss hands off afterward

A completed accepted shot or sequence returns:

- immutable master and review proxy references;
- source image/video/audio Asset references and hashes;
- sequence, shot, and take IDs;
- accepted shot packet and cinematic intent;
- start/end frame anchors and protected regions;
- camera, motion, performance, environment, light, edit, and audio direction;
- timeline/EDL-like timing facts appropriate to the current product scope;
- continuity bible and accepted/rejected lessons;
- route/model/seed/job and actual runtime facts;
- Cost Shield estimate versus actual cost;
- review scores, defects, and unresolved risks;
- rights/audience/retention envelope;
- typed repair handoff to ImageHoss when a frame must be fixed;
- typed scene/camera handoff to Meshmallow when spatial reconstruction is required;
- VideoBoss specialist Receipt;
- Gummy OS Return and linked Production Receipt.

## 3. VideoBoss direction layers

### Identity and continuity locks

- people, characters, products, wardrobe, logos, text, and approved design;
- accepted start/end frames;
- spatial and temporal relationships;
- established action state and screen direction;
- protected regions;
- approved voice/performance boundaries.

### Deliverable locks

- target platform and use;
- duration and shot count;
- aspect, resolution, frame rate, codec/container when required;
- silent/audio/subtitle requirements;
- loop or non-loop behavior;
- cost ceiling, deadline, locality, and privacy;
- master, proxy, handles, stems, captions, or packet requirements.

### Creative direction

- story purpose;
- emotional beat;
- pacing and energy;
- visual language;
- performance intention;
- camera philosophy;
- edit rhythm;
- sound intention.

### Exploration budget

- shot alternatives when the sequence permits them;
- camera move within a range;
- motion intensity;
- performance nuance;
- timing within a bounded beat window;
- atmosphere and secondary movement;
- model/route strategy;
- draft/premium take mix.

## 4. VideoBoss reference roles

VideoBoss needs temporal roles in addition to visual roles:

| Role | Controls |
| --- | --- |
| Story/meaning | what the sequence must communicate |
| Character/product identity | who or what must remain recognizable |
| Continuity | state carried between shots and takes |
| Start frame | required opening appearance/composition |
| End frame | required closing appearance/composition |
| Composition | framing and spatial hierarchy |
| Camera | lens, path, height, angle, speed, stabilization |
| Motion | object/environment movement |
| Performance | gesture, expression, timing, physical intention |
| Environment | place and background behavior |
| Lighting/color | temporal light and grade direction |
| Edit/rhythm | shot length, beats, transitions, cadence |
| Audio/voice | music, ambience, dialogue, voice identity, silence |
| Negative | temporal and visual failures to avoid |

Each role states what to extract and what to ignore. A camera reference never grants permission to copy its actor, setting, or music.

## 5. Personal Actor permissions in VideoBoss

A personal Actor may contribute likeness, voice, performance, motion capture, wardrobe, approved biography, or private footage only within an explicit grant.

The represented Human must approve:

- the scene and intended implication;
- altered speech, lip sync, gesture, age, wardrobe, or setting;
- public/commercial audience;
- voice synthesis or transformation;
- whether the source may be handed to another application or provider;
- whether derived takes may remain after permission expires.

A voice Asset does not imply likeness permission, and likeness permission does not imply voice or endorsement permission.

## 6. VideoBoss provider-neutral package

Before execution, the Human sees:

1. Production purpose and sequence summary;
2. shot list and beat structure;
3. per-shot identity and continuity locks;
4. source Assets and temporal reference roles;
5. camera, motion, performance, environment, lighting, edit, and audio direction;
6. negative constraints;
7. allowed take variation;
8. route/model plan and Cost Shield status;
9. duration/aspect/resolution/frame-rate/output contract;
10. take count and seed/reproducibility policy where supported;
11. acceptance criteria;
12. rights/privacy/locality disclosure;
13. known provider risks;
14. downstream handoff requirements.

Provider prompts, keyframes, control tracks, model parameters, queue payloads, and polling data are route-specific compilations of this package.

## 7. VideoBoss runtime and comparison behavior

`Make Production` may execute a sequence as one governed Run with several bounded shot Jobs, or one shot as a vertical slice. The frozen Run records the exact sequence and shot revisions.

Cost Shield operates before execution and during route changes. It may recommend draft routes, premium routes, reduced take counts, shorter durations, or stronger locks. It does not silently downgrade the deliverable.

Review compares each take to the frozen shot contract and prior accepted continuity. Useful lessons remain Production-scoped unless promoted through an ActorUpdateProposal.

## 8. VideoBoss personality

VideoBoss behaves like a showrunner, cinematographer, production manager, and exacting review-room partner.

It is decisive about what the shot is for. It challenges vague motion requests, continuity conflicts, impossible duration, and wasteful route choices. It distinguishes:

- artistic preference;
- measurable temporal/technical failure;
- provider limitation;
- cost risk;
- rights or authority blocker.

It should say:

```text
The shot currently asks for a locked static composition and a large orbiting camera move. Those cannot both be true. Which one carries the story?
```

not:

```text
Please provide more details.
```

---

# Part IV — Meshmallow (public name for the current 3D Bee line)

## 1. Naming ruling

The public product name is **Meshmallow**.

```text
@Meshmallow
```

Meshmallow is more specific to the Gummy world than `3D Bee`, remains playful without sounding disposable, and says what the product actually works with: editable meshes, scenes, materials, cameras, lights, and world packages.

The current repository, application ID, native route, protocol IDs, historical Receipts, and evidence remain under the `3d-bee` lineage until Codex proposes and proves a compatibility migration.

Therefore, this pass locks:

```text
public product name: Meshmallow
legacy implementation name: 3D Bee
legacy repository: bohselecta/3d-bee
legacy app id: app:3d-bee
```

It does **not** authorize a destructive repository rename or historical protocol rewrite. Future registry work must add aliases and migration evidence rather than pretending the old identity never existed.

## 2. Product-level definition

**Meshmallow is the 3D direction, scene planning, bounded Blender construction, checkpoint comparison, editable-source preservation, validation, and engine-handoff specialist.**

Its complete relationship is:

```text
World Intent
→ References and Assets
→ Scene Plan
→ Capability / Operation Plan
→ Build
→ Checkpoint and Preview
→ Compare and Revise
→ Accept
→ Package and Validate
→ Engine / Production Handoff
→ Receipt
```

Meshmallow turns Human and Production intent into an inspectable provider-neutral scene direction and operation plan. It invokes Blender or another approved 3D runtime only when Make Production executes.

It is not:

- a generic 3D prompt box;
- a replacement for Blender;
- a finished-game generator;
- an unrestricted Python or shell bridge;
- a claim of precision manufacturing output;
- a tool that flattens editable source into an opaque generated mesh.

The useful product relationship is not "describe object, receive model." It is "declare a world or asset, lock the important spatial facts, plan bounded operations, inspect checkpoints, accept an editable package, and hand it to the next professional tool."

## 3. Complete Production-scoped example

The Lantern Chamber Production has an accepted ImageHoss hero frame and wants an editable 3D scene for future camera moves and engine use.

### What the Human tells Meshmallow

```text
With @Meshmallow, build an editable World Seed for the Lantern Chamber based on the accepted ImageHoss hero frame.

Match the accepted hero camera, the chamber silhouette, the central interface-safe volume, and the left/right mascot anchor locations. Use approved mascot model Assets if they exist; otherwise create clearly labeled non-rendering placeholders and do not invent character geometry.

Use the floor-plan sketch for layout, the scale markers for dimensions, the stone reference only for material language, and the accepted ImageHoss Asset for the hero-view target. Build the architecture, camera, lights, atmosphere volumes, and simple approved props.

Target Unreal continuation. Work in meters. Keep the first package below 250,000 visible triangles, use a maximum 4K texture set, name objects and materials clearly, preserve editable modifiers where practical, and return `.blend`, `.glb`, `.fbx`, PBR textures, previews, provenance, validation, and continuation notes.

Explore hidden support geometry, secondary passage placement, prop distribution, and material wear outside the hero view. Do not change the hero silhouette, camera, interface-safe center, anchor positions, or brand palette. Do not claim character models, game logic, collision quality, or manufacturing accuracy that were not actually produced and validated.
```

### Absolute locks

1. Accepted hero camera and frame relationship.
2. Chamber silhouette visible from that camera.
3. Interface-safe central volume.
4. Mascot anchor positions and approved source-Asset identity.
5. Scale convention and target engine.
6. triangle, texture, file, and package budgets;
7. editable `.blend` source as the canonical continuation Asset;
8. bounded operation authority—no arbitrary script execution;
9. private Production rights until launch approval;
10. truthful placeholders where source Assets are absent.

### What each reference influences

| Reference | Role | Influence | Must ignore |
| --- | --- | --- | --- |
| Accepted ImageHoss Asset | Hero-view target / composition | Strong visual lock from one camera | Unseen geometry cannot be inferred as fact |
| Floor-plan sketch | Layout | Strong dimensional relationship | Drawing style, colors, and material |
| Scale diagram | Scale | Exact units and key dimensions | Composition and style |
| Mascot 3D Assets | Identity/asset source | Exact source use | Old scene, light, and materials unless assigned |
| Stone image | Material | Guide | Architecture, color grade, and layout |
| Lighting diagram | Light rig | Strong | Set geometry and subjects |
| Engine budget sheet | Technical contract | Exact | Creative direction |
| Failure board | Negative | Exclusion | Nothing positive is copied |

### What Meshmallow may explore

- hidden wall thickness and structural support;
- secondary passages not visible in the locked hero view;
- modular breakdown;
- prop distribution outside protected zones;
- UV/material organization choices within the budget;
- material wear and microdetail;
- non-hero cameras and preview angles;
- optimization strategy;
- equivalent typed Blender operations that produce the same accepted plan.

It may not treat a single 2D image as proof of unseen geometry. Assumptions are labeled as design proposals.

### What remains unchanged during revisions

Suppose Checkpoint 3 matches the hero view but the arch is too deep:

```text
Keep Checkpoint 3 as the baseline. Reduce only the central arch depth by 20%. Preserve the hero camera, front silhouette, room width and height, anchor positions, lighting, materials, object names, topology outside the affected module, and engine budget.
```

Meshmallow creates a delta Scene Plan and an exact bounded operation diff. It does not reset the scene or rebuild unrelated objects. The Human sees which objects, files, and modifiers the revision will touch before Make Production.

### How Meshmallow decides eligibility and supports acceptance

A checkpoint/package is ineligible when it fails:

- the hero camera or locked silhouette;
- scale, axis, unit, budget, or target-engine contract;
- required source-Asset identity or placeholder truthfulness;
- missing editable source;
- missing textures or broken links;
- non-manifold/invalid geometry beyond the declared tolerance;
- path, hash, provenance, or package validation;
- bounded-operation or workspace restrictions;
- required rights or evidence.

Eligible checkpoints/packages are compared on:

- spatial-intent fidelity;
- hero-view match;
- scale and layout;
- material and lighting direction;
- editability and naming;
- topology/UV/material organization;
- performance budget;
- export compatibility;
- validation quality;
- downstream usefulness.

The Human accepts a checkpoint/package for a declared role such as:

```text
concept-scene.authority
videoboss.spatial-source
unreal.prototype-handoff
```

Acceptance as a concept scene does not imply final game-ready, collision-ready, rig-ready, or manufacturing-ready status.

### What Meshmallow hands off afterward

- canonical editable `.blend` source;
- `.glb` and `.fbx` interchange packages where validated;
- PBR textures and material manifest;
- cameras, lights, world settings, units, axes, and scale facts;
- thumbnails and preview renders;
- accepted checkpoint and scene-plan revisions;
- object/material naming map;
- source Asset links, hashes, licenses, rights, and provenance;
- triangle, texture, file-size, and other declared budget results;
- validation report and known limitations;
- concise Unity/Unreal continuation notes appropriate to the selected target;
- typed handoff to VideoBoss for spatially controlled shots;
- typed handoff back to ImageHoss for new concept frames rendered from accepted cameras;
- bounded operation log and actual Blender/supervisor identity;
- Meshmallow specialist Receipt;
- Gummy OS Return and linked Production Receipt.

## 4. Meshmallow Production configuration

Opening `@Meshmallow` may configure:

- world/asset purpose and target use;
- target engine or continuation tool;
- units, scale, axes, origin, and coordinate expectations;
- scene dimensions and layout;
- required source Assets and placeholders;
- geometry, material, texture, light, camera, atmosphere, and naming direction;
- topology, triangle, texture, memory, file-size, and platform budgets;
- collision/rig/animation expectations when explicitly in scope;
- reference roles and strengths;
- positive scene direction and negative constraints;
- exploration budget;
- checkpoint and acceptance requirements;
- requested exports and validation;
- exact named capabilities and proposed file effects.

It previews an inspectable Scene Plan and Capability/Operation Plan. It may discover Blender readiness and validate configuration. It does not execute `bpy`, create geometry, write project files, render, or export until Make Production.

## 5. Meshmallow provider-neutral package

The Human should see:

1. world/asset purpose;
2. spatial and identity locks;
3. reference influence map;
4. scene hierarchy and dimensions;
5. source Asset and placeholder plan;
6. geometry/material/light/camera direction;
7. units, axes, scale, naming, and target-engine facts;
8. budgets and validation contract;
9. allowed exploration and assumptions;
10. positive and negative scene direction;
11. proposed checkpoints and previews;
12. requested output package;
13. capability and file-effect plan;
14. rights/privacy/locality disclosure;
15. known limitations and downstream requirements.

Blender operators, `bpy` payloads, modifier choices, render settings, and exporter flags are route-specific compiled operations. They are not the canonical scene intent.

## 6. Meshmallow reference roles

| Role | Controls |
| --- | --- |
| Subject/asset identity | exact source object or protected design |
| Shape/silhouette | visible form and proportion |
| Layout/spatial relationship | placement, distance, adjacency, circulation |
| Scale/dimensions | units and measured size |
| Hero camera/composition | required view and frame hierarchy |
| Material | surface response and texture language |
| Lighting | light rig and exposure intention |
| Environment/world | place, atmosphere, terrain, boundaries |
| Functional behavior | doors, joints, collision, rig, movement expectations when in scope |
| Technical budget | triangles, textures, materials, draw calls, file size, platform |
| Target-engine/export | axes, units, package, naming, import expectations |
| Negative | forbidden geometry, style, topology, assumptions, and claims |

A concept image can guide silhouette and material while remaining silent about unseen geometry and exact dimensions.

## 7. Personal Actor and proprietary Asset permissions in Meshmallow

Meshmallow may receive body/face scans, private interiors, proprietary product CAD, architectural plans, game Assets, or licensed meshes only through explicit grants.

The rights contract states:

- who owns the source;
- whether edits and derivatives are allowed;
- private/public/commercial audience;
- whether provider upload is allowed;
- whether the Asset may enter a portable package;
- whether downstream engines or collaborators may receive it;
- retention and revocation rules;
- whether precision, safety, or manufacturing use is prohibited.

A visual concept reference never implies permission to reconstruct a copyrighted or proprietary object exactly.

## 8. Meshmallow runtime and checkpoint behavior

`Make Production` freezes the Scene Plan and exact capability set. The supervisor may execute only typed allowlisted operations against the approved workspace and active session.

Execution proceeds through meaningful checkpoints. Each checkpoint records:

- scene revision;
- affected objects/files;
- operations executed;
- preview and validation evidence;
- remaining plan;
- cancellation/recovery state.

Cancellation leaves the last valid checkpoint inspectable. Recovery never claims an operation completed without evidence.

## 9. Meshmallow personality

Meshmallow behaves like a production designer, 3D lead, and technical director who wants the Human to retain an editable, understandable project.

It challenges underdefined scale, impossible budgets, unearned assumptions from 2D references, and vague "game ready" claims. It explains file and engine consequences plainly:

```text
The image fixes the front silhouette but says nothing reliable about the back wall. I can propose two layouts, or you can lock one before build.
```

It is playful in identity, rigorous in execution, and never uses charm to hide technical uncertainty.

---

# Part V — Cross-specialist relationships

## 1. The applications remain specialists, not one monolith

Gummy OS provides the Production, Actor, authority, handoff, and evidence plane. Each application retains its own repository, interface, runtime, native project format, and specialist Receipt.

```text
@ImageHoss
visual authority and accepted image Assets

@VideoBoss
sequence, shot, take, continuity, and video authority

@Meshmallow
scene, source geometry, checkpoint, package, and engine-handoff authority
```

No adapter copies the entire specialist repository into Gummy OS or rebuilds it as a generic form.

## 2. ImageHoss → VideoBoss

Transfers accepted frames, visual locks, protected regions, allowed motion, camera intent, rights, hashes, and evidence.

VideoBoss derives takes without overwriting the source image.

## 3. ImageHoss → Meshmallow

Transfers accepted concept views, silhouette/composition locks, materials, camera intent, scale clues, rights, hashes, and uncertainty labels.

Meshmallow distinguishes observed 2D facts from proposed unseen geometry.

## 4. Meshmallow → VideoBoss

Transfers accepted scene packages, cameras, lights, spatial anchors, render proxies, movement bounds, engine/runtime facts, rights, and validation.

VideoBoss can route shots through a 3D-controlled lane without claiming a generative-video model created the source scene.

## 5. VideoBoss → ImageHoss

Transfers a frame-repair request with the exact problem frame, neighboring temporal context, protected regions, named defect, desired correction, and required return format.

ImageHoss repairs or regenerates within that bounded frame contract.

## 6. VideoBoss → Meshmallow

Transfers a spatial reconstruction or camera-control request with accepted frames/takes, camera estimates, continuity anchors, scale clues, and desired downstream shot.

Meshmallow returns a truthful scene proposal and labels unknown geometry.

## 7. Meshmallow → ImageHoss

Transfers accepted cameras, render passes, material IDs, depth/normals/masks when actually available, and a request for concept paintover or image variation.

ImageHoss retains scene provenance and does not present a derived image as an unrelated generation.

## 8. Gummy OS view of accepted authority

A Production may hold several authoritative Assets at once:

```text
ImageHoss Asset
accepted as visual keyframe authority

VideoBoss Take
accepted as shot or sequence authority

Meshmallow Scene Package
accepted as spatial/source authority
```

Authority is typed by role and scope. One accepted artifact never silently supersedes every other representation.

---

# Part VI — Remaining Codex work

## 1. Preserve the existing order

The accepted sequence remains:

1. reconcile the completed ImageHoss founder contract with both repositories;
2. propose the first real ImageHoss adapter contract and one vertical slice;
3. review and accept that contract before broad implementation;
4. use the proven ImageHoss pattern to propose, not blindly duplicate, the VideoBoss adapter;
5. propose the Meshmallow naming/identity compatibility migration;
6. reconcile the Meshmallow contract with the current 3D Bee scene-plan and authenticated Blender supervisor types;
7. implement later slices only after their contract reviews are accepted.

## 2. ImageHoss next return

Codex must return:

- exact repository heads and ancestry;
- existing-type mapping;
- proposed versioned Prompt Package;
- deterministic configuration-preview boundary;
- Make Production execution boundary;
- adapter interface;
- files to change;
- one vertical slice;
- automated acceptance;
- explicit limitations and non-goals.

## 3. VideoBoss next return

After the ImageHoss adapter contract is accepted, Codex must return:

- mapping to current production board, planner, router, Cost Shield, reviewer, memory, render-adapter, and handoff types;
- proposed provider-neutral sequence/shot/take package;
- real-provider adapter boundary without credentials in the client;
- per-shot Job and Production Run relationship;
- cost and cancellation semantics;
- ImageHoss and Meshmallow handoff mappings;
- one vertical real-render slice and acceptance evidence.

## 4. Meshmallow next return

Codex must return:

- public-name migration proposal from 3D Bee to Meshmallow;
- compatibility handling for repository, app ID, protocol IDs, routes, stored records, and historical Receipts;
- mapping to current World Seed, Scene Plan, capability, operation, checkpoint, export, and supervisor contracts;
- proposed provider-neutral scene package;
- exact Make Production boundary for Blender operations;
- one vertical scene-build slice and validation evidence;
- explicit non-goals, especially game-ready, rig-ready, collision-ready, and manufacturing claims.

## 5. No runtime or visual-canon shortcut in this doctrine pass

This product-definition pass does not:

- attach a real adapter;
- call a model;
- rename the 3D repository destructively;
- rewrite historical evidence;
- merge specialist repositories into Gummy OS;
- declare the exact Underground cave, crystal, or wallpaper appearance to be canonical.

## 6. Wallpaper lane after this architecture pass

The next founder-facing visual lane remains Gummy OS wallpapers and the surrounding Underground visual world.

That lane should use the contracts above as a real Production exercise:

```text
ImageHoss
→ create and accept wallpaper/keyframe Assets

VideoBoss
→ create optional motion-wallpaper / launch-loop derivatives

Meshmallow
→ create optional editable spatial source for repeatable cameras and future environments
```

Wallpaper art may become authoritative for named Production and brand roles only after explicit visual acceptance. It must not be treated as locked canon merely because it appears in an adapter example.

---

## Canonical summary

```text
ImageHoss turns visual intent into accepted image authority.
VideoBoss turns cinematic intent into accepted moving-image authority.
Meshmallow turns spatial intent into accepted editable-scene authority.

Configuration makes the intent inspectable.
Make Production performs the work.
Human acceptance creates downstream authority.
Gummies carry the Assets and context.
Returns and Receipts carry the truth.
```
