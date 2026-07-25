# Gummy OS Brand System v1.0

**Status:** Founder-approved and locked  
**Date:** 2026-07-25  
**Scope:** Color, theme modes, assistant emphasis, mascots, logos, interface behavior, accessibility, and implementation tokens

## Brand thesis

In an AI workspace filled with visually similar windows, color is a cognitive label.

A person should recognize Gummy OS from purple and gold before reading a wordmark. The palette is functional product architecture—not decoration.

The product has one visual universe with exactly two canonical expressions:

```text
Night Gummy
Day Gummy
```

Users do not customize Gummy OS. They choose day or night inside the same locked world.

There is no generic theme marketplace, color picker, community skin system, teal Gummy, red Glopper, or user-authored palette.

## Core brand rule

> **Purple tells you where you are. Gold tells you what you can do.**

### Purple owns

- environment and atmosphere;
- Gummy Canvas and window context;
- identity and Actor presence;
- navigation and location;
- conversation space;
- passive/system state;
- information hierarchy;
- the Gummy personality emphasis.

### Gold owns

- actions and executable choices;
- focus and current selection;
- active controls;
- approval and confirmation moments;
- notifications requiring attention;
- progress moments and responses;
- the Glopper personality emphasis.

Color never grants authority. Gold indicates an available or active action; Master Control, Molds, Task Leases, and Capability Grants still determine whether it may execute.

## Locked core palette

| Token | Hex | Purpose |
| --- | --- | --- |
| Deep Indigo | `#4B187A` | structural purple, navigation, strong text, major panels |
| Gummy Violet | `#7C2FD0` | energy, conversation, active identity, expressive purple |
| Honey Gold | `#F2B544` | action, focus, selected state, response, Glopper emphasis |
| Warm Cream | `#FFF1C7` | light-mode canvas, warm text, calm neutral surface |
| Aubergine Black | `#100817` | night-mode canvas, maximum-depth surface, dark text |

These five values are the only brand hue anchors.

Derived surfaces may use opacity, tint, shade, and interpolation **only between these locked colors**. Do not introduce additional branded hues.

## Canonical expressions

### Night Gummy

A focused, deep, electric expression.

```text
Canvas/background       Aubergine Black
Primary structure       Deep Indigo mixed into Aubergine Black
Energy/conversation     Gummy Violet
Actions/focus           Honey Gold
Primary light text      Warm Cream
```

Night Gummy uses:

- near-black aubergine Canvas;
- deep indigo panels and navigation;
- brighter violet energy and conversational surfaces;
- warm gold actions, focus rings, selections, and approvals;
- warm cream text;
- restrained glow rather than constant neon noise.

### Day Gummy

A warm, bright, energetic expression.

```text
Canvas/background       Warm Cream
Primary structure       Warm Cream mixed with Honey Gold
Typography/navigation   Deep Indigo
Energy/conversation     Gummy Violet
Actions/focus           Honey Gold with Aubergine/Indigo text
```

Day Gummy uses:

- warm cream Canvas;
- honey-tinted surfaces;
- deep purple typography and navigation;
- restrained violet shading and conversational surfaces;
- gold action areas with dark text;
- aubergine only where strong depth or contrast is needed.

Day Gummy is not a white corporate theme. Night Gummy is not a generic black dark mode. Both must feel unmistakably Gummy.

## Theme-selector behavior

The only choices are:

```text
Night Gummy
Day Gummy
```

Implementation may offer:

- explicit Night/Day selection;
- “follow device appearance,” provided it resolves only to Night or Day Gummy;
- onboarding selection;
- later change in settings.

Implementation must not offer:

- arbitrary palette editing;
- accent-color selection;
- mascot recoloring;
- downloadable themes;
- per-window hue customization;
- third-party visual skins presented as Gummy OS themes.

The selected expression persists locally. Synchronization of the preference follows Master Control and Gummy Box/profile policy.

## Assistant identity grammar

Gummy and Glopper belong to the same universe but reverse color emphasis.

### Gummy

```text
Purple-dominant
Gold accent
```

Gummy represents orientation, identity, environment, focus, depth, continuity, and “where am I?”

Use:

- violet/indigo primary surfaces;
- gold actions and active moments;
- purple-dominant halo or frame;
- Gummy name/avatar always visible when speaking.

### Glopper

```text
Gold-dominant
Purple accent
```

Glopper represents action, energy, execution, play, Work Orders, approvals, and “what are we doing?”

Use:

- honey-gold primary response/action surfaces;
- purple text, outlines, secondary controls, or energy accents;
- gold-dominant halo or frame;
- Glopper name/avatar always visible when speaking.

The distinction is not color-only. Every message, panel, notification, and action must also carry the assistant name, avatar, iconography, or accessible label.

The underlying Agent executor remains explicit in Master Control, Task Leases, Grants, Returns, and Receipts. A mascot or assistant treatment never hides the actual executor.

## Mascot lock

### Gummy mascot

The Gummy mascot is the confident monkey wearing futuristic VR goggles and a dark hoodie.

Lock:

- monkey silhouette and facial proportions;
- oversized visor/goggle concept;
- dark hoodie;
- purple visor/energy emphasis;
- gold trim and hardware;
- confident, focused demeanor;
- premium neon-tech illustration style.

### Glopper mascot

Glopper is the playful purple creature with large expressive eyes, small fangs, pointed ears, paws/claws, and mischievous friendly energy.

Lock:

- purple body/fur identity;
- large expressive eyes;
- recognizable ears, forehead tuft, paws, and fangs;
- friendly mischievous emotional range;
- rounded gummy-candy energy;
- premium polished illustration style.

Glopper's **interface emphasis** is gold-dominant, but the mascot itself remains purple. Do not recolor the mascot gold, red, teal, or by theme.

### Shared mascot rules

- No generative recoloring.
- No silhouette changes without founder approval.
- No seasonal costume that obscures identity.
- No alternate species versions.
- No stretched, squashed, cropped-face, or proportion-breaking variants.
- No theme-specific mascot palettes.
- Night and Day may change only the surrounding surface, halo, frame, shadow, or lighting treatment.
- Temporary developer art must be clearly replaceable.

Hayden controls final mascot masters, wordmarks, logo files, motion references, and approved derivative poses.

## Logo lock

- `GUMMY` / `GUMMY OS` uses the polished beveled futuristic purple wordmark with restrained gold cohesion.
- `Glopper` uses the rounded purple wordmark and mascot lockup approved for the companion.
- Wordmarks are graphic assets, not ordinary text rendered in an approximate font.
- Do not recreate, stretch, outline, recolor, bevel, or re-typeset the wordmarks in product code.
- Provide horizontal, stacked, icon-only, monochrome-production, and small-size variants from approved masters later.

## Gummy Bar color behavior

The Gummy Bar is the candy store.

- Its base belongs to the current Night/Day expression.
- Candy icons stay within the locked palette and approved mascot/application assets.
- Purple establishes location and grouping.
- Gold marks selected candy, active task, approval request, response, or attention.
- Pinned/open/active/awaiting-approval/error states must use shape, icon, label, badge, or motion in addition to color.
- Do not turn the Bar into a rainbow launcher.

## Component grammar

### Navigation

Purple-dominant in both expressions.

- current location: purple structure plus gold position/selection marker;
- hover: derived violet surface;
- selected: gold focus/edge plus explicit selected state;
- inactive: reduced-opacity purple/cream treatment.

### Actions

Gold-dominant.

- primary button: Honey Gold background with Aubergine Black or Deep Indigo text;
- secondary button: purple structure with gold edge/icon where actionable;
- disabled: reduced contrast plus disabled icon/text—not color alone;
- destructive: explicit warning icon, verb, confirmation, and strong outline; do not introduce a red brand accent.

### Focus

Use a dual recognizable focus treatment:

- Honey Gold outer ring;
- Deep Indigo or Gummy Violet inner edge according to expression;
- sufficient thickness and offset;
- never glow alone.

### Conversation

- Gummy messages: purple-dominant bubble or frame, gold action affordances.
- Glopper messages: gold-dominant bubble or frame, purple text/controls.
- Human messages: quieter expression-aware surface with explicit sender identity.
- System/security messages: structural palette plus icon and plain-language label.

### Notifications

- gold indicates attention or response;
- purple identifies source/location;
- badges include icon or count;
- persistent security/authority states include text labels;
- no pulsing indefinitely.

### Status and safety

The brand palette remains locked even for status states.

Use icon, shape, language, border pattern, and placement—not new hue families—to distinguish:

- success;
- warning;
- error;
- blocked;
- offline;
- revoked;
- quarantined.

Browser/OS-native security dialogs may retain platform-native colors when they are outside Gummy OS control.

## CSS design-token contract

Core tokens:

```css
:root {
  --gummy-deep-indigo: #4B187A;
  --gummy-violet: #7C2FD0;
  --gummy-honey-gold: #F2B544;
  --gummy-warm-cream: #FFF1C7;
  --gummy-aubergine-black: #100817;
}
```

Mode selection:

```html
<html data-gummy-mode="night">
<html data-gummy-mode="day">
```

Assistant emphasis:

```html
<section data-gummy-assistant="gummy">
<section data-gummy-assistant="glopper">
```

Recommended semantic tokens:

```css
--gummy-canvas;
--gummy-surface-1;
--gummy-surface-2;
--gummy-text-primary;
--gummy-text-secondary;
--gummy-location;
--gummy-energy;
--gummy-action;
--gummy-action-text;
--gummy-focus-ring;
--gummy-border;
--gummy-shadow;
```

Semantic tokens must resolve only from the five locked hue anchors and their alpha/mixed derivatives.

## Accessibility and usability

- Never communicate meaning by purple/gold alone.
- Text and controls must pass automated and manual contrast review.
- Honey Gold buttons use dark text.
- Warm Cream text is reserved for sufficiently dark purple/aubergine surfaces.
- Day Gummy body text uses Deep Indigo or Aubergine Black—not Honey Gold.
- Keyboard focus is always visible.
- Touch targets remain usable on phones and tablets.
- Reduced-motion settings suppress ambient mascot motion, glow travel, and celebratory animation.
- Glopper and Gummy remain identifiable by names and accessible labels when avatars are hidden.

## Motion and energy

- Gummy motion is measured, focused, and spatially grounding.
- Glopper motion is faster, bouncier, and action-oriented.
- Motion never changes the locked mascot proportions.
- Ambient glow is restrained.
- Approval, completion, and new-Work-Order moments may use brief gold response energy.
- Do not run constant attention-seeking loops.

## Brand acceptance criteria

A build fails brand acceptance when any of the following is true:

- a third canonical theme appears;
- arbitrary accent selection is exposed;
- a new branded hue is introduced;
- Gummy or Glopper is recolored;
- gold is used as passive environmental chrome so broadly that action loses meaning;
- purple no longer anchors location/navigation/context;
- Gummy and Glopper cannot be distinguished without reading full conversation content;
- a state is communicated by color alone;
- wordmarks are re-typeset or approximated;
- Night and Day feel like unrelated products;
- placeholder mascots ship as final assets.

## Canonical summary

```text
One universe.
Two expressions: Night Gummy and Day Gummy.
Five locked colors.
Purple = place.
Gold = action.
Gummy = purple-dominant.
Glopper = gold-dominant.
Mascots and logos stay locked.
No theme marketplace.
```
