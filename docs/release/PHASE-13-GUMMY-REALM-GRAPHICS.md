# Phase 13 — Gummy Realm graphics and first-impression sales pass

Issue: `#27`

Baseline: `00115aae2dcec1908a9f355b61c85e7b21468c8a`

Branch: `codex/phase13-gummy-realm-graphics`
Canonical place: The Lantern Chamber in the Gummy Realm

## Result

Phase 13 replaces the generic first impression with one proprietary world. Night Gummy and Day Gummy share the same chamber, architecture, framing, and application-safe visual space; only the lighting state changes. Violet communicates place and honey-gold communicates action.

The artwork is integrated into the first-run doorway, boot state, Canvas, Night/Day selectors, orientation guide, Actor presence cards, Glopper panel and private chat, Production covers, and public social metadata. Public social derivatives combine repository-owned Realm artwork with a screenshot captured from the real built application. No generated interface, words, labels, dashboard, logo, or specialist mascot is present.

The approved Gummy monkey, lockups, wordmarks, icons, visor, silhouette, proportions, and colors were read as immutable inputs and were not regenerated or edited.

## Generation workflow

The built-in `imagegen` workflow produced immutable PNG sources. The provider manages its seed and does not expose it, so the source files are SHA-256 recorded in `evidence/phase13-visual-asset-manifest.json`. The generator creates review masters, responsive derivatives, and manifests deterministically from those sources.

Normalized final prompt contracts:

1. **Night Lantern Chamber** — “Create a clean 16:9 environment-only plate of a connected, human-scale underground creative sanctuary called The Lantern Chamber. Use rounded carved architecture, inhabited work niches, restrained violet energy to establish place, and honey-gold lanterns and practical task lights to establish action. Preserve broad quiet foreground and central negative space for real application windows. Branching chambers imply five connected creative functions without words, logos, screens, dashboards, characters, invented mascots, or generated UI. Avoid blue, cyan, teal, green, rainbow accents, crystal spectacle, dungeon, horror, castle, mine, spaceship, candy-land, and generic SaaS gradients.”
2. **Day Lantern Chamber edit** — “Edit the supplied Night chamber into Day Gummy while preserving the exact camera, architecture, proportions, openings, object placement, and application-safe negative space. Lift the ambient exposure and warm practical illumination while retaining violet as place and gold as action. Do not redesign the environment or add words, characters, UI, blue/cyan/teal/green, crystals, or new scenery.”
3. **Glopper candidate set** — “Create one full-body standing three-quarter Glopper candidate on a flat chroma background for clean local extraction: purple; very large expressive cream-and-violet eyes; pointed ears; a distinct forehead tuft; two small fangs; paws; compact human-scale proportions; soft matte gummy dimensionality. Friendly, private creative guide—not a robot, fox, cat, gummy bear, wet plastic toy, vinyl figure, or cellophane balloon. No clothing, props, text, logo, UI, blue, cyan, teal, green, or rainbow surface accents.” Three bounded candidates were produced.
4. **Glopper pose edits** — “Using selected candidate C as the exact identity reference, preserve face, ears, tuft, eyes, fangs, paws, proportions, purple material, and silhouette. Produce a window-peeking pose and a friendly chat bust on a flat chroma background. Do not redesign, add accessories, add text, or shift material toward glossy plastic.”
5. **Connected portal environments** — “Using the Night Lantern Chamber as the architecture and palette reference, make one connected 16:9 chamber extension with rounded carved architecture, violet place light, honey-gold task light, and clean real-window space. No text, fake UI, logos, or invented mascot.” The functional variants were Glopper Guide Alcove, ImageHoss Light Table, VideoBoss Projection Bay, and Meshmallow Form Workshop.

The Glopper Guide Alcove combines the environment-only generated plate with the selected transparent Glopper master locally. Production covers are deterministic crops of the Lantern Chamber master. Social imagery is a deterministic composition of the Realm master, the approved hash-locked Gummy lockup, and `artifacts/evidence/phase13-desktop-night-two-windows.png`.

### Source-size disclosure

Built-in image generation returned 1672×941 environment sources and character sources up to 1254×1254 rather than requested preservation-master dimensions. It provides no output-size control. The untouched results remain in `design/source/gummy-realm/` with hashes and dimensions recorded. The 3840×2160 environment preservation masters and 2048-pixel character preservation masters are explicitly documented Lanczos3 enlargements—not claims of newly generated native detail. Browser delivery never uses those masters.

## Glopper decision

Candidate C is selected for the review preview.

- Candidate A was rejected because the cheek and ear treatment reads too feline and the tall proportions weaken the compact guide silhouette.
- Candidate B was rejected because the round head/body treatment reads too close to a generic gummy bear and is less expressive at small UI sizes.
- Candidate C best preserves the pointed ears, three-lobed tuft, large eyes, tiny fangs, paws, compact silhouette, and matte soft dimensionality. It remains pending the single founder visual accept/reject gate.

The candidate sheet is `design/source/gummy-realm/lantern-chamber/contact-sheets/phase13-glopper-candidates.png`.

## Delivery and performance

Runtime assets are local AVIF/WebP files. Portal and Production artwork is lazy-loaded. The boot and Canvas backgrounds use compact responsive files and low-quality placeholders; dimensions and aspect ratios reserve layout space. Reduced motion removes the Glopper entrance animation.

Measured initial AVIF files:

| State | Desktop 1280×720 | Budget | Phone 828×1472 | Budget |
| --- | ---: | ---: | ---: | ---: |
| Night | 28,108 B | 430,080 B | 36,003 B | 266,240 B |
| Day | 39,345 B | 430,080 B | 47,907 B | 266,240 B |

Automated coverage verifies the shared two-state world contract, local-only runtime imagery, file hashes and dimensions, alpha masters, hard hero budgets, keyboard Night/Day selection, reduced-motion behavior, accessibility, the complete 390 px journey, and integrated Realm art across Canvas, Actors, Glopper, chat, Productions, and metadata. Manual browser captures cover 320, 390, 430, and desktop widths.

## Evidence and acceptance gate

- Asset/source manifest: `evidence/phase13-visual-asset-manifest.json`
- Visual rubric and review status: `evidence/phase13-visual-acceptance.json`
- Before/after and product-surface captures: `artifacts/evidence/phase13-*.png`
- Runtime manifest: `public/brand/gummy/realm/manifest.json`
- Generator: `scripts/generate-realm-assets.mjs`
- Automated asset gate: `scripts/check-realm-assets.mjs`

The implementation may be reviewed and previewed, but it must not merge until the founder gives one explicit accept/reject decision on the Realm environment and selected Glopper identity.
