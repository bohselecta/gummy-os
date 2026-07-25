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
5. `docs/GUMMY_BOX_WORK_ORDERS.md`
6. `docs/VOCABULARY.md`
7. `docs/PRODUCT_SPEC.md`
8. `docs/ARCHITECTURE.md`
9. `docs/PROTOCOL.md`
10. `docs/SECURITY_MODEL.md`
11. `docs/SOCIAL_LAYER.md`
12. `docs/ROADMAP.md`
13. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
14. `plans/active/2026-07-25-gummy-box-cursor-addendum.md`
15. `docs/BUILD_RUNBOOK.md`

## Locked naming

```text
Gummy OS       = platform
Gummy Canvas   = working surface
Gummy Bar      = persistent candy-store system bar
Glopper        = companion character and first-party Agent identity
Glopper Panel  = expanded in-OS conversation/control surface
Glopper App    = standalone native/mobile interface
Gummy Box      = user-owned durable handoff space
Glopper Inbox  = view of pending Work Orders
Work Order     = structured proposal for bounded work
Return         = structured report from attempted/completed execution
```

The Gummy Bar is not the Glopper Bar. Glopper is one special candy inside it.

Do not create current product names `Gummy Desktop`, `Gummy Web`, `Z`, `Z bar`, `Z panel`, `native Z app`, or `Zeke` for the Gummy OS companion.

A candy icon is presentation, not a protocol object type.

## Gummy Box rule

During onboarding, Gummy OS may create or connect a Local, private GitHub, or Google Drive-backed Gummy Box.

The Box belongs to the Human. Provider access is scoped to the selected repository/folder, not the whole account.

Frontier models may write Work Orders into the Box. They do not gain execution authority by doing so.

```text
Work Order = proposal
Task Lease = executor ownership
Capability Grant = authority
Return = result report
Receipt = evidence
```

Glopper validates Work Orders, presents them in Glopper Inbox, obtains Human/policy approval, claims a Task Lease, executes under Grants, and writes Returns/artifacts/Receipts back.

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
Gummy Box = provider-neutral async connective tissue
```

## One companion, multiple executors

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They share character and only approved portable preferences. They do not share ambient authority, Task Leases, private local memory, or filesystem access.

## Active mission

Build the standalone browser-first proof on Ubuntu:

```text
Human opens Actor
→ uses Gummy Canvas and Gummy Bar
→ opens Glopper Panel
→ initializes Gummy Box
→ sees frontier-authored Work Order in Glopper Inbox
→ approves bounded execution
→ agent:glopper-web claims Task Lease
→ creates result Gummy without changing source
→ writes Return + artifact + Receipt to Gummy Box
→ revoke and prove blocked
→ quarantine and burn/reset proof
→ return continuity
```

Local Gummy Box must work without an external account. Complete exactly one external adapter cleanly before broadening provider scope.

Inspect the already-built native AI Linux distribution only after the standalone proof passes and the native bridge is the remaining step.

## Open-ended platform rule

Gummy OS is a toolkit and playground, not one imposed workflow.

Optional interfaces—including the hexagonal system—belong as mini-apps, Actor surfaces, or applications unless evidence proves they should become shell primitives.

Recursive composition is allowed. **Creation never transfers authority automatically.**

## Security boundaries

- Preserve host, enterprise, kernel, identity, network, EDR, MDM, biometric, passkey, and hardware-key controls.
- Keep Gummy OS inside browser-origin or explicit capsule boundaries.
- Treat downloads as quarantined Gummies before native promotion.
- Treat Work Orders as untrusted data until validated and approved.
- GitHub/Drive access is scoped to the selected Gummy Box.
- Native export/import requires a Bridge, Mold, Grant, approval, and Receipt.
- Task Lease prevents duplicate executor ownership.
- A native security Agent may inspect approved telemetry, not ambient private Actor state.
- Disposable workspaces may be burned while preserving approved results and evidence.
- Do not claim browser execution or Linux hosting alone makes the product secure; prove each boundary.

## Non-negotiable constraints

- Preserve provider neutrality.
- Keep Canvas and Bar playful, accessible, responsive, and fast.
- Actor and Agent remain distinct.
- Human authority remains above both.
- Mold is an operating contract, not an avatar.
- Master Control owns placement and synchronization decisions.
- A Work Order never grants itself authority.
- External Gummy Box providers are optional.
- Do not grant Actors, Agents, models, applications, candy icons, or provider files ambient authority.
- Do not hide network, model, runtime, locality, sync, cost, task ownership, issuer, or provider identity.
- Do not overwrite source Gummies.
- Downloads begin quarantined.
- Native promotion is explicit and receiptable.
- Do not inspect native distro before standalone proof requires it.
- Do not expand broad social, enterprise, federation, public-figure, character, or multi-runtime scope before proof passes.
- Migration is deterministic, idempotent, traceable, and non-destructive.

## Completion standard

A lane is complete only when the visible journey works, authority/storage/provider boundaries are typed, deterministic behavior has tests, denial/failure/revocation are truthful, documentation matches code, state survives return, `npm run verify` passes, and the builder returns exact artifacts and limitations.

The builder does not accept its own Return.
