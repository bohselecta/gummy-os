# Gummy OS Agent Instructions

## Canonical repository

The active implementation is:

```text
bohselecta/gummy-os
```

Do not import architecture or code from older repositories that reused the Gummy name unless a work order names an exact source file and reason.

## Read order

1. `README.md`
2. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
3. `docs/VOCABULARY.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/ARCHITECTURE.md`
6. `docs/PROTOCOL.md`
7. `docs/SECURITY_MODEL.md`
8. `docs/SOCIAL_LAYER.md`
9. `docs/ROADMAP.md`
10. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
11. `docs/BUILD_RUNBOOK.md`

## Corrected architecture

```text
Human = ultimate personal authority
Actor = persistent addressable entity in Gummy OS / the web
Agent = executable intelligence, commonly native in Glyphd OS
Mold = permissioned embodiment and operating contract for an Actor
Master Control = placement, sync, permission, and revocation authority
@address = stable protocol identity and route for an Actor
```

The earlier draft made Actor too similar to an account and allowed Agent as an Actor class. Do not implement that narrower model.

## Absolute boundaries

- Actor and Agent are distinct objects.
- A Human may directly control an Actor or authorize an Agent to operate it.
- A Mold is not merely a profile; it is the scoped contract permitting a Human or Agent to instantiate, open, represent, or operate an Actor.
- Master Control decides where authoritative state lives and what synchronizes.
- Gummy OS is the Web OS plane.
- Glyphd OS is the native AI execution and device-sovereignty plane.
- Zeke is the primary first-party Agent example.
- Opening an Actor does not automatically grant control.
- Signing into more than one device does not authorize ambient synchronization.
- Receipts must distinguish Human sponsor, Actor, Agent, Mold, Grant, source, and result.

## Active mission

Prove one local Personal Gummy OS loop without attempting the complete distributed architecture:

```text
Human opens a personal Actor
→ imports a real source Gummy
→ authorizes one Agent through a bounded Mold
→ Agent creates a result Gummy without modifying the source
→ Receipt names every participant and boundary
→ Actor state survives return visits
```

The first build may use a browser/server Agent adapter. It must preserve the object boundaries needed for later connection to a native Glyphd OS Agent.

## Non-negotiable constraints

- Preserve provider neutrality.
- Keep the Web OS shell familiar and fast.
- Do not grant Actors, Agents, models, or applications ambient authority.
- Do not treat a Mold's appearance, handle, likeness, or branding as authentication.
- Do not hide network, model, runtime, locality, sync, or cost behavior.
- Do not overwrite the source Gummy.
- Do not build broad social, enterprise, federation, public-figure, character, or runtime systems before the local proof passes.
- Do not make Glyphd Desktop or `glyphd.com` a dependency.
- Protocol migration must be deterministic, idempotent, and non-destructive.
- Update authoritative documents whenever an object or trust boundary changes.

## Completion standard

A lane is complete only when the visible journey works, object boundaries are typed, tests cover deterministic behavior, denial and failure are truthful, documentation matches code, state survives return, `npm run verify` passes, and the builder returns exact evidence.

The builder does not accept its own Return.
