# Gummy OS Agent Instructions

## Canonical repository

The active implementation is:

```text
bohselecta/gummy-os
```

Do not import code or architecture from older repositories that reused the Gummy name unless a work order names an exact source file and reason.

## Read order

1. `README.md`
2. `docs/GLOPPER_NAMING.md`
3. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
4. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
5. `docs/VOCABULARY.md`
6. `docs/PRODUCT_SPEC.md`
7. `docs/ARCHITECTURE.md`
8. `docs/PROTOCOL.md`
9. `docs/SECURITY_MODEL.md`
10. `docs/SOCIAL_LAYER.md`
11. `docs/ROADMAP.md`
12. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
13. `docs/BUILD_RUNBOOK.md`

## Locked naming

```text
Gummy OS       = platform
Gummy Canvas   = working surface
Gummy Bar      = persistent candy-store system bar
Glopper        = companion character and first-party Agent identity
Glopper Panel  = expanded in-OS conversation/control surface
Glopper App    = standalone native/mobile interface
```

The Gummy Bar is not the Glopper Bar. Glopper is one special candy inside it.

Do not create current product names `Gummy Desktop`, `Gummy Web`, `Z`, `Z bar`, `Z panel`, `native Z app`, or `Zeke` for the Gummy OS companion.

A candy icon is presentation, not a protocol object type.

## Existing Glopper lineage

`bohselecta/glopper` is an existing real local-first process director. Preserve it as Glopper's native application lineage and donor system. Do not copy its whole codebase into `gummy-os`, and do not pretend it already implements the complete cross-surface companion.

## Platform model

```text
Human = ultimate personal authority
Actor = persistent addressable WebOS entity
Agent = separate executable intelligence
Mold = permissioned embodiment and operating contract
Master Control = placement, sync, assignment, approval, revocation
Gummy OS = universal WebOS platform
Gummy Canvas = open working surface
Gummy Bar = candy-store system surface
Glopper = first-party companion and Agent identity
```

## One companion, multiple executors

Glopper may resolve to separate executors:

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They share character and only approved portable preferences. They do not share ambient authority, task ownership, private local memory, or filesystem access.

## Active mission

Build the standalone browser-first proof on Ubuntu:

```text
Human opens Actor
→ uses Gummy Canvas and Gummy Bar
→ opens Glopper Panel
→ imports real source Gummy
→ authorizes agent:glopper-web through bounded Mold
→ Master Control displays scope and locality
→ Glopper creates result Gummy without changing source
→ complete Receipt
→ revoke and prove blocked
→ quarantine and burn/reset proof
→ return continuity
```

Inspect the already-built native AI Linux distribution only after the standalone proof passes and the native bridge is the remaining step.

## Open-ended platform rule

Gummy OS is a toolkit and playground, not one imposed workflow.

Optional interfaces—including the hexagonal system—belong as mini-apps, Actor surfaces, or applications unless evidence proves they should become shell primitives.

Recursive composition is allowed. **Creation never transfers authority automatically.**

Do not lock Actor composition into one output type before prototyping; it may yield a Bowl, Gummy, Mold, Actor, application, or temporary Canvas.

## Security boundaries

- Preserve host, enterprise, kernel, identity, network, EDR, MDM, biometric, passkey, and hardware-key controls.
- Keep Gummy OS inside browser-origin or explicit capsule boundaries.
- Treat downloads as quarantined Gummies before native promotion.
- Native export/import requires a Bridge, Mold, Grant, approval, and Receipt.
- A native security Agent may inspect approved telemetry, not ambient private Actor state.
- Disposable workspaces may be burned while preserving approved results and evidence.
- Do not claim browser execution or Linux hosting alone makes the product secure; prove each boundary.

## Non-negotiable constraints

- Preserve provider neutrality.
- Keep the Canvas and Bar playful, accessible, responsive, and fast.
- Actor and Agent remain distinct.
- Human authority remains above both.
- Mold is an operating contract, not an avatar.
- Master Control owns placement and synchronization decisions.
- Do not grant Actors, Agents, models, applications, or candy icons ambient authority.
- Do not hide network, model, runtime, locality, sync, cost, or task ownership.
- Do not overwrite source Gummies.
- Downloads begin quarantined.
- Native promotion is explicit and receiptable.
- Do not rebuild or inspect the native distro before the standalone proof requires it.
- Do not expand broad social, enterprise, federation, public-figure, character, or multi-runtime scope before the proof passes.
- Migration is deterministic, idempotent, traceable, and non-destructive.

## Completion standard

A lane is complete only when the visible journey works, authority and storage boundaries are typed, deterministic behavior has tests, denial/failure/revocation are truthful, documentation matches code, state survives return, `npm run verify` passes, and the builder returns exact artifacts and limitations.

The builder does not accept its own Return.
