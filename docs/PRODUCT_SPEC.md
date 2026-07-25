# Gummy OS Product Specification

## Product statement

Gummy OS is a browser-delivered WebOS and creative playground where persistent, addressable Actors can be opened from compatible devices and connected to executable Agents under explicit Human-controlled Master Control.

The platform runs independently in an ordinary browser. A later native bridge may connect it to the already-existing AI-native Linux distribution.

## Final product names

```text
Gummy OS       = platform
Gummy Canvas   = open working and creation surface
Gummy Bar      = persistent candy-store system bar
Glopper        = gummy-candy companion and first-party Agent identity
Glopper Panel  = expanded conversation and control surface
Glopper App    = standalone native/mobile interface
```

There is no separate public Gummy Desktop or Gummy Web product.

## Product principles

1. **The Gummy Canvas comes first.** It is where people make, arrange, open, combine, and explore.
2. **The Gummy Bar is the candy store.** Candy icons launch or represent real underlying objects.
3. **Glopper is always available.** Glopper is a special companion candy, not the name of the Bar.
4. **Availability is not authority.** Context can be automatic; consequential action cannot.
5. **The platform is open-ended.** It supplies primitives rather than one imposed workflow.
6. **Play is onboarding.** The system should feel like a powerful creative toy.
7. **Recursive creation is allowed.** Child Actors and Agents never inherit authority automatically.
8. **Existing security stays in place.** Gummy OS adds containment and explicit bridges.
9. **Native integration comes last.** Standalone Gummy OS is proven first.
10. **Every important boundary is visible.** Human, Actor, Agent, Mold, Master Control, locality, data flow, cost, and result appear in the experience and Receipt.

## Participants

- **Human** — opens Actors, controls Master Control, authorizes Agents, selects Molds, approves work, and revokes access.
- **Actor** — persistent WebOS entity with state, `@address`, Gummies, Links, Molds, Agent bindings, and deployment state.
- **Agent** — executable intelligence operating under explicit capability, Mold, and Master Control constraints.
- **Glopper** — first-party companion character and Agent family.
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

### Gummy Bar

Persistent candy-store system bar containing candy icons for:

- Glopper;
- applications and mini-apps;
- pinned or open Actors;
- active Gummies;
- Bowls;
- tasks;
- notifications;
- controls.

Candy is visual presentation only; no `candy` protocol object is created.

Required states include pinned, open, active, selected, awaiting approval, attention, offline, error, and task-running.

### Glopper Panel

Expanded from Glopper's candy icon. It contains:

- conversation and voice affordance;
- selected Canvas context;
- Human, Actor, `@address`, Agent, and Mold;
- Master Control summary;
- task lease and executor locality;
- requested Grants;
- progress;
- result Gummies;
- Receipts, denial, errors, and revocation.

### Glopper App

Future native/mobile interface for conversation, approvals, notifications, local capabilities, and opening the relevant Actor/Gummy in Gummy OS.

### Actor surface

Shows Actor identity, `@address`, location, Gummies, Molds, Agent bindings, Links, and available composition actions.

### Master Control

Shows and controls authoritative location, assigned Agent, active Mold, data flow, sync mode, approval rules, task leases, revocation, and locks.

### Agent surface

Shows Agent identity, runtime, provider/model disclosure, locality, status, capability ceiling, task lease, assigned Actors, and current authorization.

### My Gummies

Stores files, projects, conversations, applications, workflows, quarantined content, and results with stable identity, bytes, hashes, provenance, ownership, and rights.

### Mini-app framework

Supports optional interfaces—including the hexagonal interface—without making them mandatory shell behavior.

## Standalone acceptance criteria

The implementation is accepted when:

1. Gummy OS runs independently in an Ubuntu browser.
2. Gummy Canvas is named and usable.
3. Gummy Bar replaces the ordinary dock presentation and contains candy icons.
4. Glopper appears as a special candy in the Gummy Bar.
5. Glopper Panel expands/collapses without replacing Canvas state.
6. Gummy OS remains usable without an Agent running.
7. Local Human, Actor, Agent, Mold, and Master Control records exist distinctly.
8. The Actor has a stable provisional `@address`.
9. The first real Agent is `agent:glopper-web` and is honestly disclosed.
10. A real text/Markdown file imports as a source Gummy with persisted bytes.
11. A provider-neutral route performs one bounded transformation.
12. Provider credentials never enter browser JavaScript.
13. Human approval is required for source read and result creation.
14. Source bytes remain unchanged.
15. Result Gummy has stable identity, provenance, Links, and hash.
16. Receipt identifies Human, Actor, `@address`, Agent, Mold, Master Control, Grant, route, source, result, locality, cost, outcome, and time.
17. Mold or Agent revocation blocks future execution.
18. A harmless test file remains quarantined without native execution authority.
19. Unapproved promotion fails; bounded approved promotion/simulation leaves a Receipt.
20. Disposable state can be burned/reset while approved results/evidence remain.
21. Denial and failure produce truthful terminal evidence.
22. Reload and browser return preserve relevant state.
23. A small two-Actor composition preserves identity and does not merge private state.
24. Window, Browser, keyboard, touch, and responsive behavior continue to work.
25. `npm run verify` and end-to-end browser tests pass.

## Multiple Glopper executors

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They may share character and an approved portable preference profile. They remain separate identities with separate locality, capability, task lease, private memory boundary, and Receipts.

## Local adaptation model

```text
private local memory
approved portable profile
current task context
```

Private memory does not synchronize automatically. The Human approves portable adaptations. Ollama, llama.cpp, embeddings, classifiers, and structured memory may support later local implementations.

## Recursive creation rules

- Humans, Actors, and Agents may create or commission new Actors, Agents, Gummies, tools, and compositions.
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
- a universal permanent type for Actor composition.
