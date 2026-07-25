# Gummy OS Brand System — Cursor Addendum

**Date:** 2026-07-25  
**Applies to:** `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`  
**Authority:** Hayden's final Night/Day, purple/gold, Gummy/Glopper brand ruling

## Mission

Implement the locked brand system without delaying or weakening the standalone product proof.

```text
One universe
Two expressions
Five locked colors
Purple = place
Gold = action
Gummy = purple-dominant
Glopper = gold-dominant
```

Read `docs/BRAND_SYSTEM.md` before changing UI structure, color, mascots, icons, or themes.

## Absolute exclusions

Do not:

- add a third canonical theme;
- expose arbitrary accent selection;
- add a theme marketplace;
- create per-window custom themes;
- introduce new branded hues;
- recolor Gummy or Glopper;
- approximate or re-typeset production wordmarks;
- use gold so broadly that action loses meaning;
- use purple/gold as the only state indicator;
- ship developer placeholder mascots as final assets;
- turn Day Gummy into a generic white theme;
- turn Night Gummy into a generic black theme;
- make Gummy and Glopper visually indistinguishable;
- hide actual Agent executor identity behind mascot branding.

## Work package 1 — source tokens

Create one authoritative token module containing:

```css
--gummy-deep-indigo: #4B187A;
--gummy-violet: #7C2FD0;
--gummy-honey-gold: #F2B544;
--gummy-warm-cream: #FFF1C7;
--gummy-aubergine-black: #100817;
```

All brand semantic colors resolve from those values and alpha/mixes between them.

Do not scatter literal color values through components.

## Work package 2 — semantic tokens

Implement at minimum:

```text
--gummy-canvas
--gummy-surface-1
--gummy-surface-2
--gummy-text-primary
--gummy-text-secondary
--gummy-location
--gummy-energy
--gummy-action
--gummy-action-text
--gummy-focus-ring
--gummy-border
--gummy-shadow
```

### Night Gummy mapping

- Canvas: Aubergine Black.
- Structural surfaces: Aubergine/Deep Indigo derivatives.
- Location/navigation: Deep Indigo and Gummy Violet.
- Action/focus: Honey Gold.
- Primary text: Warm Cream.

### Day Gummy mapping

- Canvas: Warm Cream.
- Structural surfaces: Warm Cream/Honey Gold derivatives.
- Typography/navigation: Deep Indigo.
- Conversation energy: Gummy Violet.
- Action/focus: Honey Gold with Aubergine/Indigo text.

## Work package 3 — theme selector

Implement exactly:

```text
Night Gummy
Day Gummy
```

Optional “follow device appearance” may resolve only to one of those values.

Persist the choice locally. Later synchronization follows Master Control and approved profile policy.

Test:

- initial selection;
- manual switch;
- reload persistence;
- device-follow mapping if implemented;
- no arbitrary custom value accepted;
- invalid stored values fall back safely.

## Work package 4 — assistant emphasis

### Gummy

- purple-dominant surface;
- gold action affordances;
- name/avatar/accessibility label;
- orientation, environment, identity, and continuity voice.

### Glopper

- gold-dominant response/action surface;
- purple text, outline, secondary controls, or energy accent;
- name/avatar/accessibility label;
- Work Orders, execution, approvals, energy, and play voice.

Never recolor the mascots to achieve emphasis. Change surrounding frames, halos, panels, bubbles, and controls.

Receipt and Master Control views show the actual Agent executor separately from the assistant identity.

## Work package 5 — Gummy Bar grammar

- Purple establishes Bar location/grouping.
- Gold marks selection, active task, approval, or response.
- Candy icons remain within approved assets and locked palette.
- No rainbow launcher.
- State includes icon/shape/label/badge/motion in addition to color.
- Implement pinned, open, selected, active-task, awaiting-approval, attention, offline, error, and task-running states.

## Work package 6 — component rules

### Primary action

Honey Gold background with Aubergine Black or Deep Indigo text.

### Navigation

Purple structure with gold selection/focus marker.

### Focus

Visible dual treatment: gold outer ring plus purple/indigo inner structure. Do not rely on glow alone.

### Conversation

- Gummy: purple-dominant bubble/frame.
- Glopper: gold-dominant bubble/frame with dark purple text.
- Human: quieter expression-aware surface.
- System/security: explicit icon and plain-language label.

### Warning/error/destructive

Use explicit icon, language, border/pattern, confirmation, and placement. Do not introduce red as a Gummy OS brand accent.

## Work package 7 — mascot and logo integration

Hayden will supply production assets.

Before those arrive:

- create replaceable asset slots;
- use neutral developer placeholders clearly labeled as temporary;
- avoid embedding generated raster art into layout assumptions;
- preserve expected aspect ratios and safe areas;
- do not trace or approximate the final wordmarks in CSS/HTML.

Asset roles to prepare:

```text
Gummy mascot hero
Gummy compact avatar
Gummy OS horizontal wordmark
Gummy OS stacked mark
Glopper mascot hero
Glopper compact avatar
Glopper horizontal lockup
Glopper icon/candy
```

## Work package 8 — accessibility

Test both modes for:

- text contrast;
- action-control contrast;
- keyboard focus visibility;
- screen-reader assistant identification;
- state meaning without color;
- reduced motion;
- zoom and text scaling;
- touch targets;
- Glopper Panel and Gummy Bar keyboard flow.

Honey Gold buttons must use dark text. Day body text must be Deep Indigo/Aubergine. Night light text must use Warm Cream on sufficiently dark surfaces.

## Work package 9 — screenshots and evidence

Return screenshots for:

1. Night Gummy Canvas and Gummy Bar.
2. Day Gummy Canvas and Gummy Bar.
3. Gummy purple-dominant conversation.
4. Glopper gold-dominant conversation.
5. Theme selector.
6. Keyboard focus.
7. Awaiting-approval state.
8. Quarantined/blocked state without relying on red.
9. Responsive phone-width treatment.
10. Reduced-motion state if visually distinct.

## Required tests

- exact five source-token values;
- semantic-token mapping for Night and Day;
- no unsupported theme accepted;
- persisted theme choice;
- Gummy/Glopper emphasis classes/attributes;
- no color-only speaker identification;
- Gummy Bar state fallbacks;
- keyboard focus;
- reduced-motion behavior;
- contrast checks where automated tooling supports them;
- no unapproved literal brand hue in production styles.

## Required Return additions

```text
Brand token file
Night token map
Day token map
Theme persistence evidence
Unsupported-theme rejection
Gummy emphasis evidence
Glopper emphasis evidence
Gummy Bar state matrix
Accessibility checks
Literal-color audit
Placeholder/final asset inventory
Screenshots
Known visual limitations
```

## Brand stop rules

Stop rather than improvise when:

- the final mascot/wordmark asset is required but unavailable;
- accessible contrast cannot be achieved within the locked palette without changing component structure;
- a proposed state requires a new hue instead of icon/language/shape;
- Day and Night begin behaving like separate products;
- brand polish begins blocking the core functional acceptance path.

## Definition of done

The brand implementation is ready for founder review when Gummy OS is recognizable without mascots, Night and Day feel like one universe, purple reliably communicates place, gold reliably communicates action, Gummy and Glopper are distinguishable in peripheral vision, and the complete product remains usable without color alone.
