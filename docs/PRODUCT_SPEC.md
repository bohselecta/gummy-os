# Gummy OS Product Specification

## Product statement

Gummy OS is a browser-delivered WebOS and creative playground where persistent, addressable Actors can be opened from compatible devices and connected to executable Agents under explicit Human-controlled Master Control.

The platform runs independently in an ordinary browser. A later native bridge may connect it to the already-existing AI-native Linux distribution.

## Final product names

```text
Gummy OS       = platform
Gummy Canvas   = open working and creation surface
Gummy Bar      = persistent candy-store system bar
Gummy          = purple-dominant platform guide/personality
Glopper        = gold-dominant action companion and first-party Agent identity
Glopper Panel  = expanded conversation and control surface
Glopper App    = standalone native/mobile interface
Gummy Box      = user-owned durable handoff space
Glopper Inbox  = pending Work Orders
```

There is no separate public Gummy Desktop or Gummy Web product.

## Locked brand system

Read `docs/BRAND_SYSTEM.md` before implementing any product surface.

### Core palette

```text
Deep Indigo      #4B187A
Gummy Violet     #7C2FD0
Honey Gold       #F2B544
Warm Cream       #FFF1C7
Aubergine Black  #100817
```

### Behavioral grammar

> **Purple tells you where you are. Gold tells you what you can do.**

Purple owns environment, identity, navigation, conversation space, atmosphere, and location.

Gold owns action, focus, selection, approval, active controls, attention, and response.

### Canonical expressions

Exactly two expressions exist:

```text
Night Gummy
Day Gummy
```

Night Gummy uses aubergine Canvas, indigo structure, violet energy, gold controls, and cream text.

Day Gummy uses cream/honey surfaces, deep purple typography/navigation, restrained violet energy, and gold action areas with dark text.

Users choose between two expressions of one universe. Gummy OS does not expose arbitrary themes, accent colors, mascot recoloring, third-party skins, or a theme marketplace.

### Assistant emphasis

```text
Gummy    purple-dominant, gold accent
Glopper  gold-dominant, purple accent
```

Gummy emphasizes orientation, environment, continuity, and focus.

Glopper emphasizes action, execution, Work Orders, approval, energy, and play.

Every assistant surface also carries name, avatar, icon, or accessible label. Color alone never identifies a speaker or authority principal.

The actual Agent executor remains explicit in Master Control, Task Leases, Grants, Returns, and Receipts.

### Mascot and logo lock

- Gummy is the confident monkey with VR goggles, dark hoodie, purple energy, and gold trim.
- Glopper is the playful purple creature with large eyes, ears, tuft, paws, and fangs.
- Mascot silhouettes, proportions, identity colors, logos, and personality are locked.
- Night and Day change surrounding surfaces and lighting—not mascot colors.
- Wordmarks are approved graphic assets, not approximate re-typeset text.
- Placeholder art must remain replaceable until Hayden supplies production masters.

## Product principles

1. **The Gummy Canvas comes first.** It is where people make, arrange, open, combine, and explore.
2. **The Gummy Bar is the candy store.** Candy icons launch or represent real underlying objects.
3. **Color is functional branding.** Purple establishes location; gold establishes action.
4. **Night and Day are one universe.** No theme marketplace or visual chaos.
5. **Gummy and Glopper reverse emphasis.** They remain distinct while belonging to one system.
6. **Glopper is always available.** Glopper is a special companion candy, not the name of the Bar.
7. **Availability is not authority.** Context can be automatic; consequential action cannot.
8. **The platform is open-ended.** It supplies primitives rather than one imposed workflow.
9. **Play is onboarding.** The system should feel like a powerful creative toy.
10. **Recursive creation is allowed.** Child Actors and Agents never inherit authority automatically.
11. **Existing security stays in place.** Gummy OS adds containment and explicit bridges.
12. **Native integration comes last.** Standalone Gummy OS is proven first.
13. **Every important boundary is visible.** Human, Actor, Agent, Mold, Master Control, locality, data flow, cost, and result appear in the experience and Receipt.

## Participants

- **Human** — opens Actors, controls Master Control, authorizes Agents, selects Molds, approves work, and revokes access.
- **Actor** — persistent WebOS entity with state, `@address`, Gummies, Links, Molds, Agent bindings, and deployment state.
- **Agent** — executable intelligence operating under explicit capability, Mold, Task Lease, and Master Control constraints.
- **Gummy** — platform guide/personality emphasizing environment and continuity.
- **Glopper** — action companion character and first-party Agent family.
- **Mold** — permissioned embodiment and operating contract defining who may operate an Actor, how, where, and with what data and capabilities.
- **Auditor/security operator** — inspects sponsorship, identity, authority, route, quarantine, movement, results, and Receipts.

## Core loops

### Personal creation

```text
Human opens Actor
→ works on Gummy Canvas
→ invokes Glopper from Gummy Bar
→ attaches source Gummy
→ Master Control displays Agent, Mold, scope, locality, and data flow
→ Human approves
→ agent:glopper-web performs bounded task
→ result Gummy + Receipt
→ state survives return
```

### Asynchronous Work Orders

```text
frontier model writes Work Order
→ Human-owned Gummy Box
→ Glopper Inbox validates it
→ Human approves/revises/rejects/holds
→ Glopper claims Task Lease
→ bounded Agent executes
→ Return + artifacts + Receipt written to Box
```

A Work Order is a proposal, not authority.

### Containment

```text
untrusted content
→ quarantined Gummy
→ no native execution authority
→ inspect / scan / classify
→ deny or approve bounded promotion
→ Receipt
→ disposable workspace may be burned
```

### Composition

```text
Actor discovers Actor
→ explicit Link
→ selected public/test Gummies
→ temporary shared Canvas or Bowl
→ provenance remains distinct
→ output type chosen by use rather than forced globally
```

### Native integration, later

```text
standalone proof passes
→ inspect existing native distro
→ bind agent:glopper-native through deny-by-default bridge
→ synchronize only Master Control-approved state
→ receipt every crossing
```

## Core surfaces

### Gummy Canvas

Open device-neutral workspace for windows, Actor surfaces, Gummies, applications, mini-apps, worlds, generated surfaces, and compositions.

Canvas chrome follows the selected Night/Day expression. Purple remains the dominant location/context signal in both.

### Gummy Bar

Persistent candy-store system bar containing candy icons for:

- Glopper;
- applications and mini-apps;
- pinned or open Actors;
- active Gummies;
- Bowls;
- Work Orders;
- tasks;
- notifications;
- controls.

Candy is visual presentation only; no `candy` protocol object is created.

Purple establishes grouping and position. Gold marks selection, active task, approval request, action, or response.

Required states include pinned, open, active, selected, awaiting approval, attention, offline, error, and task-running. Every state uses shape, icon, label, motion, or badge in addition to color.

### Gummy guide surfaces

Gummy guide/personality surfaces are purple-dominant with gold action affordances. They support orientation, navigation, environment explanation, identity, and continuity.

### Glopper Panel

Expanded from Glopper's candy icon. It contains:

- conversation and voice affordance;
- selected Canvas context;
- Human, Actor, `@address`, Agent, and Mold;
- Glopper Inbox and Work Orders;
- Master Control summary;
- Task Lease and executor locality;
- requested Grants;
- progress;
- result Gummies and Returns;
- Receipts, denial, errors, and revocation.

Glopper surfaces are gold-dominant with purple text, controls, outline, or energy accents.

### Glopper App

Future native/mobile interface for conversation, approvals, notifications, local capabilities, and opening the relevant Actor/Gummy in Gummy OS.

### Theme selector

Offers only Night Gummy and Day Gummy. It may follow the device appearance only by resolving to one of those two expressions.

No color picker, downloadable theme, per-window accent selection, mascot recoloring, or third-party Gummy OS skin is permitted.

### Actor surface

Shows Actor identity, `@address`, location, Gummies, Molds, Agent bindings, Links, and available composition actions.

### Master Control

Shows and controls authoritative location, assigned Agent, active Mold, data flow, sync mode, approval rules, Task Leases, revocation, and locks.

### Agent surface

Shows Agent identity, runtime, provider/model disclosure, locality, status, capability ceiling, Task Lease, assigned Actors, and current authorization.

### My Gummies

Stores files, projects, conversations, applications, workflows, quarantined content, and results with stable identity, bytes, hashes, provenance, ownership, and rights.

### Gummy Box and Glopper Inbox

Gummy Box is Local, private GitHub, or Google Drive-backed user-owned handoff storage. Local mode is always available. External provider permission is scoped to the selected Box root.

Glopper Inbox shows issuer/model disclosure, target, goal, sources, requested capabilities, privacy/locality, cost ceiling, risk, expiry, acceptance checks, Task Lease conflicts, and status.

### Mini-app framework

Supports optional interfaces—including the hexagonal interface—without making them mandatory shell behavior.

## Accessibility requirements

- Meaning is never conveyed by purple/gold alone.
- Every state has text, icon, shape, pattern, position, or accessible label.
- Honey Gold controls use Aubergine Black or Deep Indigo text.
- Day Gummy body text uses Deep Indigo or Aubergine Black.
- Night Gummy light text uses Warm Cream only on sufficiently dark surfaces.
- Keyboard focus uses visible gold plus purple/indigo structure—not glow alone.
- Contrast receives automated and manual review.
- Touch targets support phone/tablet use.
- Reduced motion suppresses ambient mascot and glow animation.

## Standalone acceptance criteria

The implementation is accepted when:

1. Gummy OS runs independently in an Ubuntu browser.
2. Gummy Canvas is named and usable.
3. Gummy Bar replaces the ordinary dock presentation and contains candy icons.
4. Night Gummy and Day Gummy are the only theme expressions.
5. The five locked palette values are implemented as source tokens.
6. Semantic tokens resolve only from the locked palette and derived mixes/opacity.
7. Purple consistently identifies environment/navigation/context.
8. Gold consistently identifies action/focus/selection/attention.
9. Gummy guide surfaces are purple-dominant with gold accents.
10. Glopper surfaces are gold-dominant with purple accents.
11. Gummy and Glopper remain identifiable without color alone.
12. Mascots and wordmarks are not recolored, distorted, or re-typeset.
13. Gummy Bar and theme selector pass keyboard, touch, responsive, reduced-motion, and contrast review.
14. Glopper appears as a special candy in the Gummy Bar.
15. Glopper Panel expands/collapses without replacing Canvas state.
16. Gummy OS remains usable without an Agent running.
17. Local Human, Actor, Agent, Mold, and Master Control records exist distinctly.
18. The Actor has a stable provisional `@address`.
19. The first real Agent is `agent:glopper-web` and is honestly disclosed.
20. Local Gummy Box initializes without an external account.
21. A frontier-authored Work Order validates and appears in Glopper Inbox.
22. Human approval is required before Work Order execution.
23. A real text/Markdown file imports as a source Gummy with persisted bytes.
24. A provider-neutral route performs one bounded transformation.
25. Provider credentials never enter browser JavaScript.
26. Source bytes remain unchanged.
27. Result Gummy has stable identity, provenance, Links, and hash.
28. Return and Receipt identify Human, Actor, `@address`, Agent, Mold, Master Control, Task Lease, Grant, route, source, result, locality, cost, outcome, and time.
29. Mold or Agent revocation blocks future execution.
30. A harmless test file remains quarantined without native execution authority.
31. Unapproved promotion fails; bounded approved promotion/simulation leaves a Receipt.
32. Disposable state can be burned/reset while approved results/evidence remain.
33. Denial and failure produce truthful terminal evidence.
34. Reload and browser return preserve relevant state.
35. A small two-Actor composition preserves identity and does not merge private state.
36. Window, Browser, keyboard, touch, and responsive behavior continue to work.
37. `npm run verify` and end-to-end browser tests pass.

## Multiple Glopper executors

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They may share character and an approved portable preference profile. They remain separate identities with separate locality, capability, Task Lease, private-memory boundary, and Receipts.

## Local adaptation model

```text
private local memory
approved portable profile
current task context
```

Private memory does not synchronize automatically. The Human approves portable adaptations. Ollama, llama.cpp, embeddings, classifiers, and structured memory may support later local implementations.

## Recursive creation rules

- Humans, Actors, and Agents may create or commission new Actors, Agents, Gummies, tools, Work Orders, and compositions.
- Every child receives independent identity and provenance.
- Every child Agent receives a capability ceiling and disclosure.
- Every child Actor receives authority, Molds, Master Control, and revocation.
- No Grant is copied automatically.
- No private state is silently merged.
- Composition may yield a Bowl, Gummy, Mold, Actor, application, or temporary Canvas; the result is not universally predetermined.

## Existing Glopper product

`bohselecta/glopper` remains the real local-first process-director application. It is Glopper's native lineage and donor system, not code to flatten into Gummy OS and not proof that the full future companion is already implemented.

## Out of scope for standalone phase

- inspection or integration of the native distro;
- real `agent:glopper-native`;
- broad native OS control;
- cross-device/cloud Actor sync;
- production public `@address` discovery;
- public celebrity/character launch;
- broad remote social systems;
- enterprise deployment;
- federation;
- broad Application Pack execution;
- multiple production providers;
- billing/marketplace;
- generic theme marketplace or third-party Gummy OS skins;
- a universal permanent type for Actor composition.
