# Gummy OS Agent Instructions

## Canonical repository

The active implementation is:

```text
bohselecta/gummy-os
```

Do not import code or architecture from older repositories that reused the Gummy name unless a work order names an exact source file and reason.

## Read order

1. `README.md`
2. `docs/BRAND_SYSTEM.md`
3. `docs/GLOPPER_NAMING.md`
4. `docs/ACTOR_AGENT_MASTER_CONTROL.md`
5. `docs/PLATFORM_PLAYGROUND_SECURITY.md`
6. `docs/GUMMY_BOX_WORK_ORDERS.md`
7. `docs/AUTOMATED_ACCEPTANCE.md`
8. `docs/VOCABULARY.md`
9. `docs/PRODUCT_SPEC.md`
10. `docs/ARCHITECTURE.md`
11. `docs/PROTOCOL.md`
12. `docs/SECURITY_MODEL.md`
13. `docs/SOCIAL_LAYER.md`
14. `docs/ROADMAP.md`
15. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
16. `plans/active/2026-07-25-gummy-box-cursor-addendum.md`
17. `plans/active/2026-07-25-brand-system-cursor-addendum.md`
18. `plans/active/2026-07-25-automated-acceptance-cursor-addendum.md`
19. `docs/BUILD_RUNBOOK.md`

## Founder rule

```text
Hayden is not the test harness.
The computer tests the computer.
```

Routine validation must be automated through unit, integration, browser E2E, accessibility, visual-regression, persistence, migration, security-boundary, and failure-path testing.

Do not return ordinary manual regression instructions to Hayden when browser automation can perform the same work.

Manual founder review is reserved for strategic product judgment, delight, personality, visual approval, and irreversible decisions—not discovering broken buttons.

## Locked naming

```text
Gummy OS       = platform
Gummy Canvas   = working surface
Gummy Bar      = persistent candy-store system bar
Gummy          = purple-dominant platform guide/personality
Glopper        = gold-dominant action companion and first-party Agent identity
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

## Locked brand system

Exactly two canonical expressions exist:

```text
Night Gummy
Day Gummy
```

Exactly five brand hue anchors exist:

```text
#4B187A  Deep Indigo
#7C2FD0  Gummy Violet
#F2B544  Honey Gold
#FFF1C7  Warm Cream
#100817  Aubergine Black
```

Core grammar:

```text
Purple tells you where you are.
Gold tells you what you can do.
Gummy = purple-dominant, gold accent.
Glopper = gold-dominant, purple accent.
```

Do not add arbitrary accents, theme marketplaces, third-party Gummy OS skins, mascot recolors, or new branded hues.

Derived colors may use opacity or mixes only between the five locked anchors.

Meaning must never rely on color alone. Use labels, icons, shapes, patterns, position, and accessible names.

Mascot silhouettes, proportions, identity colors, logos, and personality are locked. Developer placeholders remain visibly temporary until Hayden supplies production assets.

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
Gummy = orientation and continuity personality
Glopper = action and execution personality
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
→ selects Night or Day Gummy
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
→ automated acceptance suite passes
```

Local Gummy Box must work without an external account. Complete exactly one external adapter cleanly before broadening provider scope.

Inspect the already-built native AI Linux distribution only after the standalone proof passes and the native bridge is the remaining step.

## Automated acceptance requirements

Establish a sustainable test architecture early. Preferred default when no blocker exists:

```text
Vite + TypeScript
Vitest
Playwright
axe-core
fake-indexeddb or equivalent
GitHub Actions
production-like preview deployment
```

Equivalent tools require a written rationale.

The repository must expose stable non-interactive commands for static checks, unit tests, integration tests, E2E, accessibility, visual regression, acceptance, build, and verify.

Critical PR journeys must be browser-automated. CI must retain screenshots/traces/video/logs on failure.

A feature is not complete until its critical user journey is automated.

Before saying `founder-ready`, prove:

- clean checkout builds;
- critical acceptance passes against an exact production-like build;
- no uncaught console errors in critical journeys;
- Night and Day visual evidence exists;
- accessibility gate passes or exceptions are explicitly approved;
- source/result immutability is proven;
- Work Order, Task Lease, Grant, Return, and Receipt evidence exists;
- revocation blocks execution;
- reload and browser-context restart preserve state;
- known limitations are visible;
- exact commit and preview URL are supplied.

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
- Implement brand colors through source and semantic tokens, not scattered literals.
- Night and Day must feel like one universe.
- Purple remains the primary location/navigation/context signal.
- Gold remains the primary action/focus/selection/attention signal.
- Gummy and Glopper remain identifiable without color alone.
- Honey Gold controls use dark text.
- Do not recolor mascots or approximate final wordmarks.
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
- Do not expand broad social, enterprise, federation, public-figure, character, multi-runtime, or theme-marketplace scope before proof passes.
- Migration is deterministic, idempotent, traceable, and non-destructive.
- Do not ask Hayden to perform routine testing that automation can perform.
- Do not update visual baselines without explaining why the visual change is correct.
- Do not mark tests skipped merely to obtain a green build without documenting the unproven boundary.

## Completion standard

A lane is complete only when:

- the visible journey works;
- brand, authority, storage, and provider boundaries are typed;
- deterministic behavior has unit/integration tests;
- critical journeys have browser E2E tests;
- denial, failure, revocation, offline, and persistence paths are truthful;
- accessibility and visual regression are verified;
- documentation matches code;
- state survives return;
- `npm run verify` passes;
- `npm run test:acceptance` passes against a production-like build;
- CI artifacts identify the exact commit/browser/viewport;
- the builder returns exact evidence and limitations.

The builder does not accept its own Return.

> **The computer tests the computer. Hayden builds the world.**
