# Phase 11 — First User Experience Polish / Test User Readiness

**Directive:** Gummy OS PR #23 comment `5097570098`

**Baseline:** `30e3e7df4537a43191bab5a17a1319b2d86a3bc1`

**Release level:** ready for a controlled cohort of five trusted external test users

## Outcome

Gummy OS now gives a first user a short, direct path from “what is this?” to a
real Production without requiring an account, provider, repository, local
runtime, or knowledge of the internal protocol.

The polish preserves the complete product model:

- Human authority remains above Actor and Agent.
- Actors remain persistent entry points; Agents remain separate executors.
- Production, Gummy, Receipt, Return, Mold, and Master Control remain present.
- Opening or configuring never executes.
- Make Production remains the sole Production-wide execution transition.
- Demonstration, planning, connected, and unavailable states are not conflated.

## UX audit findings and disposition

| Finding | Severity | Disposition |
| --- | --- | --- |
| Onboarding defaulted to the founder’s name and address | Release blocker | Fixed. Identity begins blank, derives a private local address, and explains that nothing is published. |
| Onboarding spent a full step on infrastructure connections | Release requirement | Fixed. Connections are now optional secondary context, not a prerequisite or blocking step. |
| Both guide Production calls to action opened the same intermediate empty screen | Release blocker | Fixed. Each call to action creates or opens the named Production directly and persists it. |
| The sample opened without its specialist roster | Release requirement | Fixed. Night Gummy Launch opens with the safe Actor roster already present; no Run or Grant is created. |
| Actor UI exposed identity and protocol state but not truthful living presence | Release blocker | Fixed. Glopper, ImageHoss, VideoBoss, and Meshmallow cards show identity, availability, capability, current state, and the next interaction. |
| Production Actor cards led with addresses and executor IDs | Release requirement | Fixed. Cards lead with the Actor’s name, contribution, capability truth, and current state; executor IDs remain secondary. |
| Glopper conversation was a static founder-specific protocol example and disabled input | Release blocker | Fixed. Glopper summarizes current Productions, pending decisions, results, and Receipts, then offers bounded task-oriented actions. |
| Cost was visible in the final Run preview but not clear during early configuration | Release blocker | Fixed. Production shows `$0.00` before Make Production and the current reviewed ceiling; Run review shows every route and cost ceiling. |
| Run blockers used protocol identifiers as primary copy | Release requirement | Fixed. Required Actor, configuration, relationship, and recovery blockers now have plain-language recovery copy. |
| Empty Glopper results state did not explain why it was empty or what to do | Release requirement | Fixed. It explains when results appear, restates non-execution during configuration, and links to the sample. |
| Gummy help was represented by a disabled staged conversation | Release requirement | Fixed. Gummy now answers the four first-user orientation questions locally and routes to Actors or Glopper. |
| Guide cards exposed founder IDs, model IDs, and infrastructure before user value | Release requirement | Fixed. The guide leads with authority, durability, capability truth, and safe next actions; execution detail is progressive. |

No accepted product pillar was removed or flattened.

## Implemented first-user path

```text
Open Gummy OS
→ understand the product and execution boundary
→ choose Night or Day Gummy
→ name the private local space
→ see that the Local Gummy Box needs no account
→ choose blank or safe sample Production
→ enter the named Production directly
→ meet truthful specialist Actor cards
→ configure with $0 cost before Make Production
→ use Glopper to continue, review a decision, find results, or explain activity
→ inspect advanced authority and evidence only when needed
```

## Living presence truth

| Entry point | Visible state | Truth boundary |
| --- | --- | --- |
| Glopper | Ready to guide | Local guidance works. Cloud execution is disclosed as configured or unavailable and always remains approval-bound. |
| ImageHoss | Demonstration available | Direction and deterministic studies work. Real generation requires the authenticated local ImageHoss and ComfyUI runtime. |
| VideoBoss | Planning available | Planning, review, and deterministic takes work. Real rendering requires a connected server-side provider route. |
| Meshmallow | Planning available | Scene planning and mock operations work. Real 3D output requires the authenticated supervisor and supported Blender runtime. |

Presence is derived from current product/runtime facts. No card claims that an
unavailable live provider or native runtime is online.

## Test-user readiness

The controlled five-user cohort can:

- start in a fresh browser without an account;
- identify their private local Actor rather than inheriting the founder identity;
- create a blank Production or open the sample from the onboarding doorway;
- understand the difference between an Actor and its possible Agent executor;
- see permissions, locality, and maximum cost before execution;
- understand what an unavailable specialist still allows them to do;
- recover orientation through Gummy and next-action guidance through Glopper;
- return after reload to the same durable Production;
- inspect results, Returns, Receipts, and Master Control without needing them to complete onboarding.

Routine regression is automated. The external cohort is for comprehension,
delight, vocabulary, and trust feedback—not discovering broken controls.

## Automated evidence

- first-run Night and Day screenshots;
- first Production choice screenshots;
- Night Gummy Launch sample screenshot;
- truthful Actor presence screenshot;
- Glopper guidance screenshot;
- Day Gummy phone/reduced-motion screenshot;
- Playwright assertions for zero Runs and zero Grants during setup;
- reload persistence;
- serious/critical accessibility scan;
- full repository verification.

Screenshots:

- [`phase11-first-run-night.png`](../../artifacts/evidence/phase11-first-run-night.png)
- [`phase11-first-run-day.png`](../../artifacts/evidence/phase11-first-run-day.png)
- [`phase11-first-production-choice-night.png`](../../artifacts/evidence/phase11-first-production-choice-night.png)
- [`phase11-first-production-choice-day.png`](../../artifacts/evidence/phase11-first-production-choice-day.png)
- [`phase11-sample-production-night.png`](../../artifacts/evidence/phase11-sample-production-night.png)
- [`phase11-actor-presence-night.png`](../../artifacts/evidence/phase11-actor-presence-night.png)
- [`phase11-glopper-guidance-night.png`](../../artifacts/evidence/phase11-glopper-guidance-night.png)
- [`phase11-test-user-phone-day.png`](../../artifacts/evidence/phase11-test-user-phone-day.png)

## Remaining blockers and non-claims

- Results from five external Human sessions are not yet available. Cohort
  feedback is `NOT CLAIMED`; the product is ready to collect it.
- Real ImageHoss generation remains `NOT CLAIMED` when the authenticated local
  ImageHoss/ComfyUI runtime is absent.
- Real VideoBoss rendering remains `NOT CLAIMED` when no supported server-side
  render provider is connected.
- Real Meshmallow output remains `NOT CLAIMED` when the authenticated supervisor
  and supported Blender runtime are absent.
- Glopper cloud execution remains unavailable on any deployment without the
  server-side provider and cost policy. Local guidance still works.
- A general-purpose open-ended chat surface is intentionally not included.
  Glopper’s Phase 11 surface is bounded to Productions, decisions, tasks,
  results, and evidence.

These limitations are visible in product and do not block the deterministic,
local-first first-user journey.
