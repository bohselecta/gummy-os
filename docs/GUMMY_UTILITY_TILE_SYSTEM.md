# Gummy Utility Tile System

**Status:** Founder-supplied asset integration ruling  
**Date:** 2026-07-27  
**Scope:** The legacy translucent gummy tile masters supplied by Hayden, their semantic role, brand boundary, runtime use, drag-and-drop behavior, and production-asset pipeline.  
**Precedence:** Read after `docs/BRAND_SYSTEM.md` and `docs/PRODUCTION_ACTOR_RUNTIME.md`. This document creates one narrow exception for approved baked artwork; it does not unlock new interface hues, themes, accent colors, or authority semantics.

## 1. Finding

The supplied assets are usable.

They are not generic clip art and they should not be treated as a rainbow Actor taxonomy. They are tactile, translucent, first-party **Gummy utility tiles**: memorable visual handles for recurring object classes and operations inside the WebOS.

Their best job is to make the visual system easier to scan and manipulate while preserving the canonical object model beneath them.

> **The embossed shape names the thing. The tile color gives it candy character. Purple and gold still govern the interface.**

The tiles are presentation assets only. They never become protocol objects, authority principals, permissions, or execution identities.

## 2. Source inventory

The founder archive contains seven unique visual masters and one duplicate placeholder.

| Source master | Dimensions | SHA-256 | Canonical utility meaning |
| --- | ---: | --- | --- |
| `cliptogummy-tile.png` | 306×306 | `f9ffadebdb81951141628c289d4a1a4ee7fc77557f2f0f0ab3a51399c07bb5e0` | Attach/import a source Gummy; “clip to Gummy” |
| `gummybot-tile.png` | 306×306 | `94976c05d310742d8aafcd05640675cc861eca98f8ef157d3efae3ef1814198f` | Agent/executor inspection; runtime work performed beneath an Actor |
| `gummybowl-tile.png` | 306×306 | `a87e6af9749c17b839d62f49f199ee9a3ab9f6459dc1f8cfb39ae1587e681c1f` | Bowl/shared working environment |
| `gummyexport-tile.png` | 306×306 | `58b8c6164405fc0a8ce48e09113d40bd6b3996a34bb8f04cde3e2433c7119dc5` | Deliver, export, Return, downstream handoff |
| `gummylayout-tile.png` | 306×306 | `3e393dfff3ceb072606dc5659a2a09af991a89137a6295561cd0cd1293c3a4ea` | Setup/configuration, layout, Project Composer, Production arrangement |
| `gummyvision-tile.png` | 306×306 | `2fbf61e196a263f05655eb2045af9e0b6841ff27688bbeab42cf0f44cfe9c0b4` | Preview, inspect, visual input, visual-analysis surface |
| `loading-wheel.png` | 699×785 | `f59615d2757845a10c217f047f78f2ee95fdc010445f19aa0ac16ab16a27f558` | Gummy progress/loading mark; never a general app tile |
| `screenshot-placeholder.png` | 306×306 | `3e393dfff3ceb072606dc5659a2a09af991a89137a6295561cd0cd1293c3a4ea` | Exact duplicate of `gummylayout-tile.png`; excluded from canonical production assets |

AppleDouble `__MACOSX` files are metadata noise and must not enter the repository.

The untouched masters should live under:

```text
design/source/gummy-utility-tiles-legacy/
```

Do not overwrite, recolor, crop destructively, trace, redraw, or silently rename the source masters.

## 3. What the tiles are not

Do not use these tiles as:

- colors for different people;
- permanent Actor-kind colors;
- identity marks for Hayden, Hoyt, or another Human;
- replacements for the Gummy or Glopper mascots;
- replacements for the official ImageHoss, 3D-Bee, VideoBoss, ProjectComposer, or GummyStorage marks;
- permission, trust, risk, approval, locality, or execution-state indicators;
- a user-selectable rainbow theme system;
- protocol classes named after their colors;
- evidence that an Agent is authorized or running.

In particular, `gummybot-tile.png` means **Agent/executor tooling**. It must never collapse Actor and Agent or become a generic personal Actor avatar.

## 4. Canonical semantic mapping

The first implementation should expose the following stable utility IDs:

```text
gummy.utility.attach
gummy.utility.agent
gummy.utility.bowl
gummy.utility.deliver
gummy.utility.setup
gummy.utility.vision
gummy.utility.progress
```

| Utility ID | Default label | Common surfaces |
| --- | --- | --- |
| `gummy.utility.attach` | Attach Gummy | import, reference selection, source shelf, drag proxy |
| `gummy.utility.agent` | Agent Runtime | Master Control, executor disclosure, task/lease inspection |
| `gummy.utility.bowl` | Bowl | Bowl launcher, Production workspace membership, shared context |
| `gummy.utility.deliver` | Deliver | export, Return, publish proposal, downstream Actor handoff |
| `gummy.utility.setup` | Production Setup | setup rail, ProjectComposer configuration, plan arrangement |
| `gummy.utility.vision` | Inspect | preview, visual reference review, ImageHoss-adjacent inspection |
| `gummy.utility.progress` | Gummy Working | boot/progress/queued work, reduced-motion static fallback |

The label and accessible name remain authoritative. The asset is a visual mnemonic.

## 5. Brand-system boundary

The locked Gummy OS shell remains:

```text
Night Gummy / Day Gummy
Purple = location, identity, context
Gold = action, focus, approval, response
```

The tile masters contain orange, pink, purple, green, yellow, and blue/cyan candy material. Those colors are permitted only as **intrinsic baked colors inside approved first-party raster artwork**, comparable to colors inside a mascot, photograph, video, or user-created Gummy.

This is a narrow material-art exception:

- no tile color becomes a CSS design token;
- no surrounding panel inherits the tile color;
- no focus ring, selection, action, status, or permission state uses the tile color;
- no user chooses tile colors;
- no automatic recoloring by Night/Day expression;
- no arbitrary new multicolor launcher family may be added without founder approval;
- the shell around every tile remains within the five locked brand anchors and their allowed mixes.

When a tile is selected or actionable:

- purple structure communicates where it lives;
- gold edge/focus/action treatment communicates what can be done;
- label, icon, state text, and accessible name communicate the same meaning without color.

This preserves the rule “Purple tells you where you are; gold tells you what you can do” while allowing approved candy objects to look like candy.

## 6. Where the tiles belong

### Production setup rail

Use the utility tiles as memorable stage markers:

```text
Attach sources       → gummy.utility.attach
Inspect references   → gummy.utility.vision
Configure production → gummy.utility.setup
Inspect executor     → gummy.utility.agent
Deliver downstream   → gummy.utility.deliver
Open shared Bowl     → gummy.utility.bowl
Working/queued       → gummy.utility.progress
```

A service Actor still displays its own name, `@address`, service mark, and actual Agent disclosure. The utility tile describes the stage or operation, not the Actor’s identity.

### Gummy shelf and object cards

Use the tiles for empty states, category headers, and drag handles. Do not replace file-type thumbnails, personal Actor portraits, or real result previews when those are available.

### Master Control

Use the Agent tile only beside actual executor identity, runtime, locality, Task Lease, and Grant. Use the other tiles for delivery, Bowl scope, setup, and inspection without hiding canonical IDs or authority objects.

### Gummy Bar

The Gummy Bar may use a utility tile only for a stable utility or underlying object it genuinely represents. Keep the Bar curated. Do not fill it with all seven colors merely because the assets exist.

### Loading and progress

`loading-wheel.png` is the approved candidate for a Gummy working/progress mark. Reduced-motion mode uses a static image plus textual status. It never implies authority and never replaces real queue, progress, failure, or executor disclosure.

## 7. Drag-and-drop behavior

The utility tiles should make typed drag-and-drop feel physical without changing protocol semantics.

### Drag start

- create a dedicated drag proxy rather than moving the canonical object view;
- show the relevant utility tile, object label, owner/source Actor, and Production scope;
- use a subtle 4–6% gummy compression or stretch;
- preserve the typed `GummyDragIntent` payload.

### Valid target

- show a gold magnetic rim and explicit action verb;
- show the proposed relation, such as `Attach`, `Add to Production`, `Route to`, `Store`, or `Create plan edge`;
- do not commit until the drop preview is accepted when consequential.

### Invalid or blocked target

- rebound or settle without a destructive animation;
- state the exact missing capability, Mold, Grant, relationship, or compatible input type;
- do not introduce a red brand accent solely for error;
- never silently coerce the source into a different type.

### Successful proposal

A short sticky/stretch connector may visually join source and target while Gummy OS creates the typed proposal. The animation represents relationship formation only. It does not imply execution.

> **Drag proposes. Master Control authorizes. Make Production executes.**

Keyboard and touch alternatives must exist for every critical drag action.

## 8. Asset pipeline

Generate production derivatives rather than shipping the source PNGs everywhere.

```text
public/brand/gummy/utility-tiles/
  attach-64.webp
  attach-96.webp
  attach-192.webp
  agent-64.webp
  ...
  progress-96.webp
  progress-192.webp
  manifest.json
```

Requirements:

- preserve alpha edges and visible material texture;
- use contain-fit with safe padding; never stretch;
- avoid sharpening halos on transparent edges;
- generate deterministic outputs;
- record source and derivative hashes;
- centralize paths and semantic IDs in one runtime registry;
- include width/height and accessible default label;
- lazy-load large derivatives outside critical boot paths;
- do not embed source masters as data URLs in CSS or JavaScript;
- fail validation if the duplicate placeholder is imported as a second canonical asset.

Suggested registry:

```ts
type GummyUtilityTile = {
  id: string;
  label: string;
  description: string;
  sourcePath: string;
  sourceHash: string;
  derivatives: Record<string, string>;
  allowedSurfaces: string[];
  forbiddenSemantics: string[];
};
```

## 9. Service Actor relationship

ImageHoss, 3D-Bee, VideoBoss, ProjectComposer, and GummyStorage remain first-party service Actors/applications with their own stable identities and companion surfaces.

The utility tiles may support those surfaces:

```text
ImageHoss        → Inspect and Attach
3D-Bee           → Attach, Inspect, Deliver
VideoBoss        → Attach, Inspect, Agent Runtime, Deliver
ProjectComposer  → Production Setup, Deliver
GummyStorage     → Attach, Deliver
```

This does not turn the tiles into their logos. When official app marks are available, use those for identity and the utility tiles for operations.

## 10. Automated acceptance

The tile milestone is accepted only when automation proves:

1. All seven unique source hashes match the founder archive.
2. The duplicate placeholder is excluded from canonical outputs.
3. No AppleDouble metadata enters the repository.
4. Derived dimensions and alpha are valid.
5. No source asset is stretched, recolored, or destructively cropped.
6. Night and Day shells remain within the locked palette.
7. No new CSS hue token is introduced from a tile color.
8. Tile meaning is never color-only.
9. Actor, Agent, app, Mold, Grant, and Production identities remain explicit.
10. Gummy Bar remains curated rather than displaying every tile.
11. Production setup rail uses the tiles as stage/operation mnemonics.
12. Master Control uses the Agent tile only alongside actual executor disclosure.
13. Drag proxies preserve typed intent and do not execute work.
14. Valid, blocked, and inaccessible drag states have text and keyboard/touch alternatives.
15. Reduced-motion progress is understandable without animation.
16. Desktop and phone visual-regression evidence is retained.
17. Existing production mascot/wordmark assets remain byte-identical.
18. Existing Production runtime and full-product preservation tests continue to pass.

## 11. Final ruling

These assets should be used as a small, founder-approved family of physical **Gummy utility tiles** that help users recognize setup, attachment, inspection, Agent execution, shared Bowls, delivery, and progress.

Do not use them to color-code people, replace service identities, or create a rainbow authority system.

> **The gummy material makes the interface memorable. The embossed symbol makes it understandable. The purple/gold shell makes it coherent and governed.**
