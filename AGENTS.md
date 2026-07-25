# Gummy OS Agent Instructions

## Canonical repository

The active WebOS implementation is:

```text
bohselecta/gummy-os
```

Older repositories that reused the Gummy name are not donors unless a work order names an exact file and reason.

The native AI Linux distribution is a separate **existing local implementation**. It must be inspected in Hayden's Ubuntu environment and must not be recreated from assumptions in this repository.

## Read order

1. `README.md`
2. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
3. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
4. `docs/VOCABULARY.md`
5. `docs/PRODUCT_SPEC.md`
6. `docs/ARCHITECTURE.md`
7. `docs/PROTOCOL.md`
8. `docs/SECURITY_MODEL.md`
9. `docs/SOCIAL_LAYER.md`
10. `docs/ROADMAP.md`
11. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
12. `docs/BUILD_RUNBOOK.md`

## Platform model

```text
Human = ultimate personal authority
Actor = persistent addressable WebOS entity
Agent = executable intelligence, often native
Mold = permissioned embodiment and operating contract
Master Control = placement, sync, permission, approval, revocation
Gummy OS = playful browser-delivered WebOS canvas
Native AI Linux / Glyphd OS = existing device-sovereignty and Agent layer
Z surface = persistent bar + expandable panel inside Gummy OS
Native Z surface = external chat, voice, approval, and device control
```

## Existing native implementation rule

At the beginning of the Ubuntu lane:

- locate the real native distribution source and runtime;
- record its local path, launch procedure, services, Agent/chat surface, capability interfaces, WebView/browser availability, live-USB assets, and current test state;
- preserve working code;
- integrate through the narrowest possible bridge;
- stop rather than replacing a working native component with a speculative rewrite.

## Open-ended platform rule

Gummy OS is a toolkit and playground, not one imposed workflow.

Optional interfaces—including the hexagonal system—belong as mini-apps, Actor surfaces, or applications inside Gummy OS unless evidence proves they should become shell primitives.

Recursive composition is allowed:

- Agents may help create Actors;
- Actors may commission Agents;
- Actors and Agents may create Gummies, tools, and shared surfaces;
- Actors may discover and compose with other Actors.

**Creation never transfers authority automatically.** Every child Actor or Agent needs independent identity, provenance, capability ceilings, Mold/Master Control relationships, disclosure, and revocation.

Do not lock “two Actor pages compose” into one universal output type before prototyping. It may yield a Bowl, Gummy, Mold, Actor, application, or temporary canvas.

## Z experience rule

Inside Gummy OS, Z is always available through a collapsed bar and expandable panel. It is not merely an ordinary dock app.

The Z surface may understand selected canvas context automatically. It may not perform consequential work automatically.

```text
automatic availability != automatic authority
```

The native Z surface and the WebOS Z surface synchronize only Master Control-approved state.

## Security boundaries

- Preserve host, enterprise, kernel, identity, network, EDR, MDM, biometric, passkey, and hardware-key controls rather than duplicating them.
- Keep Gummy OS inside browser-origin or explicit capsule boundaries.
- Treat downloads as quarantined Gummies before native promotion.
- Native export/import requires an explicit bridge, Mold, Grant, approval, and Receipt.
- A native security Agent may inspect approved telemetry, not ambient private Actor state.
- Disposable workspaces may be burned while preserving approved results and evidence.
- The platform may support authorized defensive-security research, but it never invents target authorization or grants offensive access automatically.
- Do not claim browser execution or Linux hosting alone makes the product secure; prove each boundary.

## Active mission

Use the existing Ubuntu/native foundation and prove:

```text
Gummy OS runs inside the existing distribution
→ Z hybrid surface works
→ Human opens personal Actor
→ one distinct Agent is assigned through a Mold
→ Master Control shows location and data flow
→ a real source Gummy becomes a result Gummy
→ source remains unchanged
→ Receipt records every boundary
→ Agent/Mold revocation blocks future work
→ quarantined test content lacks native execution authority
→ state survives return
```

## Non-negotiable constraints

- Actor and Agent remain distinct.
- Human authority remains above both.
- Master Control owns placement and synchronization decisions.
- Mold is an operating contract, not an avatar.
- Provider, model, runtime, and Agent remain replaceable.
- No ambient authority or ambient synchronization.
- No arbitrary host filesystem, shell, or native execution bridge.
- Do not overwrite source Gummies.
- Do not rebuild the existing native distribution.
- Do not expand broad social, enterprise, public-figure, character, federation, or multi-runtime scope before the local proof passes.
- Do not make Glyphd Desktop or `glyphd.com` a dependency.
- Migration is deterministic, idempotent, traceable, and non-destructive.

## Completion standard

A lane is complete only when the visible journey works, authority and storage boundaries are typed, tests cover deterministic logic, denial and failure are truthful, security claims match evidence, documentation matches code, state survives return, `npm run verify` passes, and the builder returns exact artifacts and limitations.

The builder does not accept its own Return.
