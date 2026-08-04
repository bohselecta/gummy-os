# Shared Vision and Production

**Status:** Architecture primer matching shipped Gummy OS behavior  
**Full model:** `docs/GUMMY_SHARED_VISION_PRODUCTION_MODEL.md`

## Core rule

> A Shared Vision recognizes collective intent. It does not create authority, spend money, assign ownership, or execute work.

## Formation path (as implemented)

```text
Session / Social Instance
→ Human-selected messages (exact refs + hashes)
→ Shared Vision (non-executing)
→ Production Agreement
→ Production Pool / contribution ledger
→ Production Formation Event
→ Production + specialist configuration
→ Make Production (execution)
→ Results + Returns + Receipts
→ Human Accept (once per advancement)
→ Distribution plans (optional, separate)
→ Resume Social Instance
```

Automatic conversion of private conversation into a Shared Vision is forbidden. Selection is explicit.

## Seeded Demo Production (v1 stranger loop)

| Field | Value in software |
| --- | --- |
| Intent | Create a collaborative 30-second AI video. |
| Title | Collaborative 30-second AI video |
| People | @Hayden, @Bob (and fixture cast including @Sarah, @Dana as applicable) |
| Specialists | @ImageHoss, @VideoBoss, Glopper (Meshmallow/`3d-bee` also on roster where configured) |
| Worker | Labeled **Demo Worker** — deterministic demonstration |
| Cost in demo | $0.00 charged; live providers unavailable unless separately connected |

Command Center projects attention into lanes: **Now / Next / Delegated / Review / Blocked / Done**. The projection is never an authority source.

## Make Production

Sole Production-wide execution transition. Freezes revision, creates immutable Run context, binds eligible executors, requires approval intersection. Configuration alone never executes.

## Accept and distribute

- Accept advances canonical Production state for the chosen result once.
- Accept does not publish.
- Radio, Channels, and private export remain separate versioned Distribution Plans with their own blocked/approved/released/published states.

## Related code

- `src/core/living-collaboration.js` — Shared Vision, formation, Demo Worker, Command Center projection, proof runner
- `src/core/production-runtime.js` — Production create / configure / Make / Accept
- `src/apps/collaboration.js` — Command Center UI and Demo Production doorway
- `schemas/command-center-view.schema.json` — generated view contract
