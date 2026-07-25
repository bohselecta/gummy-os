# Gummy OS Product Specification

## Product statement

Gummy OS is a browser-delivered WebOS and creative playground where persistent, addressable Actors can be opened from compatible devices and connected to executable Agents under explicit Human-controlled Master Control.

It runs independently in a normal browser and can run inside Hayden's existing AI-native Linux distribution. That native distribution provides the optional local Agent and device-sovereignty layer; it is not rebuilt by this repository.

The familiar desktop is the access surface. The deeper product is the combination of:

- Human authority;
- Actor/Agent separation;
- Molds;
- Master Control;
- Z hybrid interface;
- Gummies, Bowls, Links, and Grabs;
- quarantine and explicit native promotion;
- recursive composition without inherited authority;
- Grants and Receipts.

## Canonical architecture

```text
Human = ultimate personal authority
Actor = persistent addressable entity in Gummy OS / the web
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, approval, and revocation
Gummy OS = playful WebOS canvas
Native AI Linux / Glyphd OS = existing Agent and device-sovereignty layer
Z surface = persistent WebOS bar + expandable panel
Native Z surface = external chat, voice, approval, and device control
@address = stable identity and route for an Actor
```

See:

- `docs/ACTOR_AGENT_MASTER_CONTROL.md`
- `docs/PLATFORM_PLAYGROUND_SECURITY.md`
- `docs/VOCABULARY.md`

## Product principles

1. **The canvas comes first.** Gummy OS is where people make, arrange, open, combine, and explore.
2. **Z is always available.** It is not an ordinary dock app.
3. **Availability is not authority.** Context may be automatic; consequential action is not.
4. **The platform is open-ended.** It provides primitives, not one imposed workflow.
5. **Play is onboarding.** The product should feel like a powerful creative toy.
6. **Recursive creation is allowed.** Child Actors and Agents never inherit authority automatically.
7. **Existing security remains in place.** Gummy OS adds containment and explicit bridges rather than replacing native or enterprise controls.
8. **The native distro is real.** Inspect and integrate it; do not rebuild it from assumptions.
9. **Every important boundary is visible.** Human, Actor, Agent, Mold, Master Control, location, data flow, cost, and result appear in the experience and Receipt.

## Product participants

- **Human** — opens Actors, controls Master Control, authorizes Agents, selects Molds, approves consequential work, and revokes access.
- **Actor** — persistent WebOS entity with state, `@address`, Gummies, Links, Molds, Agent bindings, and deployment state.
- **Agent** — executable intelligence operating locally or remotely under explicit capability and Mold constraints.
- **Mold** — permissioned embodiment and operating contract defining who may operate an Actor, how, where, for how long, and with what data and capabilities.
- **Auditor or security operator** — inspects Human sponsor, Actor, Agent, Mold, Grant, route, synchronization, quarantine, promotion, burn/reset, Gummies, and Receipts.
- **Software vendor** — later provides an Application Pack for controlled operation by an authorized Agent.

## Core product loops

### Personal creation

```text
Human opens Actor
→ uses Z anywhere on the canvas
→ attaches source Gummy
→ Master Control displays Agent, Mold, scope, locality, and data flow
→ Human approves
→ Agent performs bounded task
→ result Gummy + Receipt
→ state survives return
```

### Native integration

```text
Existing AI-native Linux distribution
→ opens Gummy OS in browser/WebView
→ native Z surface and WebOS Z surface share only approved state
→ deny-by-default bridge exposes one bounded capability
→ every crossing is receipted
```

### Containment

```text
untrusted content
→ quarantined Gummy
→ no native execution authority
→ inspect / scan / classify
→ approve or deny promotion
→ bounded native destination + Receipt
→ disposable workspace may be burned
```

### Playground composition

```text
Actor discovers Actor
→ explicit Link
→ selected public/test Gummies
→ temporary shared canvas or Bowl
→ sources and provenance remain distinct
→ output type is chosen by use, not forced globally
```

### Social, later

```text
Actor enters Bowl
→ shares Gummy
→ creates Link
→ another Actor Grabs if allowed
→ Human, Agent, Mold, audience, rights, and provenance remain visible
```

## Core surfaces

### Gummy OS canvas

Browser-native desktop, windows, applications, Actor surfaces, files, Gummies, Bowls, Links, Grabs, mini-apps, and Receipts.

### Z bar

Persistent compact surface containing:

- text input;
- voice affordance;
- attach/drag target;
- current Actor;
- current Agent;
- current task/status;
- pending approval signal;
- expand control.

### Expanded Z panel

Contains:

- conversation;
- selected canvas context;
- current Actor and `@address`;
- assigned Agent;
- active Mold;
- Master Control summary;
- requested Grants;
- task progress;
- results;
- Receipts.

### Native Z surface

Existing or adapted native chat/control interface for conversation, voice, approvals, notifications, device control, native security signals, and “Open in Gummy OS.”

### Actor surface

Shows identity, `@address`, location, owned Gummies, active Molds, Agent bindings, state, Links, and available composition actions.

### Master Control

Shows and controls:

- authoritative state location;
- web/local/hybrid deployment;
- assigned Agent;
- active Mold;
- allowed data flow;
- synchronization mode and direction;
- approval rules;
- revocation and lock state.

### Agent surface

Shows Agent identity, runtime, provider/model disclosure, locality, status, capability ceiling, assigned Actors, and current authorization.

### Mold surface

Shows representation and operating contract: allowed Humans/Agents, role, capability scope, data scope, runtime, locality, synchronization policy, proofs, expiry, and revocation.

### My Gummies / Object Space

Stores files, projects, conversations, applications, workflows, quarantined content, and results with stable identity, bytes, hashes, provenance, ownership, and rights.

### Mini-app framework

Allows optional interfaces—including the hexagonal interface—to run inside Gummy OS without becoming mandatory shell behavior.

## Personal Gummy OS acceptance criteria

The first implementation is accepted only when:

1. The existing AI-native Linux distribution is located, launched, and documented rather than rebuilt.
2. Gummy OS runs inside it through a normal browser or existing WebView.
3. Gummy OS still runs independently in a normal browser.
4. Z appears as a persistent collapsed bar and expandable panel, not only a dock app.
5. Gummy OS remains usable without an Agent running.
6. A local Human authority record exists.
7. A persistent Actor exists with a provisional stable `@address`.
8. A separate Agent record exists.
9. A Mold explicitly allows the Human/Agent relationship and bounded capabilities.
10. Master Control shows location, Agent, Mold, data flow, synchronization policy, approval, and revocation.
11. A real text or Markdown file imports as a source Gummy with persisted bytes.
12. A real provider-neutral Agent route performs one bounded transformation.
13. Provider credentials never enter browser JavaScript.
14. Human approval is required for source read, result creation, and any native bridge crossing.
15. The source Gummy remains byte-identical.
16. The result is written as a new Gummy with stable identity, provenance, Links, and hash.
17. The Receipt identifies Human, Actor, `@address`, Agent, Mold, Master Control, Grant, route, source, result, locality, synchronization behavior, cost, outcome, and time.
18. Mold or Agent revocation blocks future execution.
19. A harmless test file can remain quarantined without native process, shell, package, device, or broad filesystem authority.
20. Unapproved native promotion fails; approved bounded promotion produces a Receipt.
21. A disposable test workspace can be reset/burned while accepted results and evidence remain.
22. Denial and failure produce truthful terminal evidence.
23. Reload and browser return preserve Actor, Z-selected continuity, Master Control, Gummies, Links, and Receipts.
24. One small two-Actor temporary composition preserves source identity and does not merge private state.
25. Gummy Browser and window behavior continue to work.
26. `npm run verify`, end-to-end WebOS tests, and applicable native integration tests pass.

## Recursive creation rules

- Humans, Actors, and Agents may create or commission new Actors, Agents, Gummies, tools, and compositions.
- Every child receives independent identity and provenance.
- Every child Agent receives a capability ceiling and operator disclosure.
- Every child Actor receives Human/organization authority, Molds, Master Control, and revocation.
- No Grant is copied automatically.
- No private state is silently merged.
- Composition may yield a Bowl, Gummy, Mold, Actor, application, or temporary canvas; the universal result is not locked before prototype evidence.

## Migration acceptance

- Legacy `snack:*` state becomes a local Human authority, Actor, and Mold where appropriate.
- Legacy model/companion proof becomes a separate provisional Agent.
- Legacy Drop/file state becomes Gummies.
- Fork lineage becomes Grab records and `grab-of` Links.
- Actor and Agent IDs/types never collapse.
- Mold becomes an operating contract, not only presentation.
- New Receipts distinguish Human, Actor, Agent, Mold, Master Control, and boundary crossings.
- Migration is deterministic, idempotent, traceable, and non-destructive.

## Out of scope for the active lane

- broad or arbitrary native OS control;
- production Zeke binding before the real native Agent interface is inspected;
- cross-device or cloud Actor synchronization beyond explicit selected proof state;
- production public `@address` discovery;
- public celebrity or licensed-character launch;
- remote social accounts and broad Bowls;
- enterprise identity and policy deployment;
- federation;
- broad Application Pack execution;
- multiple production model routes;
- billing and marketplace behavior;
- a universal permanent object type for Actor-page composition.

These remain preserved future layers. They must not delay the first correct local proof.
