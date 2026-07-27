# Production Runtime Reconciliation and Gummy Utility Tiles — Codex Work Order

**Date:** 2026-07-27  
**Repository:** `bohselecta/gummy-os`  
**Status:** Active reconciliation gate before merging Production runtime or attaching real specialist applications

## Mission

Consolidate the verified Actor-first Production runtime from PR #14 into the full branded Gummy OS product baseline without losing any protected product pillar, production brand asset, application registry contract, storage/security boundary, or automated acceptance proof.

Then integrate the founder-supplied Gummy utility tiles according to `docs/GUMMY_UTILITY_TILE_SYSTEM.md`.

This is not a new visual rewrite and not permission to choose one existing branch while discarding the others.

## Audit finding

PR #14 proves valuable Production-domain behavior and has green automated evidence, but it is not merge-ready as the canonical product branch.

It was built from `main` at `41b34ada92a65139207895b6878668fce446677d`, while the fuller standalone browser runtime, production Gummy branding, PWA/storage/security work, protected product map, and first-party application registry remain on PR #11 and PR #13.

PR #14 currently retains pre-migration scaffold concepts and visual code, including legacy `Snack`, `Zeke`, arbitrary pink/green/blue hues, localStorage-first state, and temporary Gummy/Glopper treatments. Its Production runtime must be preserved and transplanted, not merged over the full product.

## Canonical inputs

Read and reconcile all of the following:

```text
main
  current founder specs, including Actor-first Production docs

PR #11 / agent/standalone-personal-gummy-os
  branded standalone Gummy OS runtime
  production Gummy assets
  Night/Day implementation
  IndexedDB/OPFS and Gummy Box proof
  Glopper, Work Orders, Returns, Receipts
  PWA and security/acceptance infrastructure

PR #13 / agent/full-gummy-os-integration
  full-product preservation directive
  protected product map
  first-party application registry
  truthful available/unavailable native capability states

PR #14 / agent/actor-first-production-runtime
  Production schemas and runtime
  Actor App Surfaces
  Production-scoped configuration
  Actor Plan
  Make Production
  deterministic reference Agents
  drag/drop intents
  Production Master Control
  Production acceptance evidence

chatgpt/gummy-utility-tile-system
  founder-supplied tile manifest
  semantic, brand, and drag/drop ruling
```

## Required branch strategy

1. Do not merge PR #14 directly to `main`.
2. Create one new consolidation branch from the newest full-product branch that contains PR #11 plus PR #13 preservation work.
3. Merge or rebase current `main` founder documents into that branch.
4. Port PR #14 Production behavior by feature and tests, resolving conflicts intentionally.
5. Import the Gummy utility tile ruling and source masters from Hayden's supplied archive.
6. Produce one replacement PR targeting `main` only after the consolidated branch is independently green.
7. Close PRs #11, #13, and #14 only after the replacement PR contains their preserved accepted work and records exact supersession evidence.

Do not keep multiple “canonical” preview URLs after consolidation.

## Non-negotiable preservation table

| Pillar | Required source |
| --- | --- |
| Gummy Canvas/window shell | PR #11/full-product baseline |
| Gummy Bar and Glopper separation | PR #11 and canonical docs |
| Production Gummy logo/mascot assets | PR #11 exact masters and hashes |
| Night/Day locked palette | merged brand system and PR #11 implementation |
| Human/Actor/Agent/Mold/Master Control | existing protocol plus PR #14 extensions |
| Local Gummy Box, Work Orders, Grants, Leases, Returns, Receipts | PR #11 |
| IndexedDB/OPFS and migrations | PR #11; never regress to localStorage as authoritative persistence |
| Applications and first-party registry | PR #13 |
| ImageHoss, 3D-Bee, VideoBoss, Gummy Rooms contracts | PR #13 |
| Actor-first Production runtime | PR #14 |
| Production Actor Configuration isolation | PR #14 |
| Actor Plan and Make Production | PR #14 |
| typed drag/drop and accessible alternatives | PR #14, refined by tile ruling |
| utility tile source manifest and registry | `chatgpt/gummy-utility-tile-system` |
| automated founder-free acceptance | PR #11/#13/#14 combined |

## Visual correction

The consolidated implementation must not carry forward PR #14’s pre-brand visual scaffold.

Fail acceptance if any of these remain in active product CSS or UI as branded hues or canonical identity values:

```text
#7c5cff
#ff7cc8
#75f0c8
#4bc5ff
#4464ff
#ff6fae
#ffd166
```

Exception: historical migration fixtures may retain literal legacy input values when clearly isolated and never rendered as the current brand.

The active UI must use the five locked source colors and approved production assets.

The multicolored Gummy utility tiles are a narrowly approved baked-art exception. Their internal pixels must not become CSS accents or status colors.

## Utility tile implementation

Preserve source masters under:

```text
design/source/gummy-utility-tiles-legacy/
```

Generate deterministic derivatives and a typed registry for:

```text
gummy.utility.attach
gummy.utility.agent
gummy.utility.bowl
gummy.utility.deliver
gummy.utility.setup
gummy.utility.vision
gummy.utility.progress
```

Use them first in:

- Production setup rail;
- Gummy shelf/category headers;
- Master Control utility rows;
- typed drag proxies and drop previews;
- Bowl, Agent Runtime, delivery, inspection, setup, attachment, and progress empty states.

Do not assign them as permanent people colors, Actor-kind colors, Glopper/Gummy replacements, or official specialist-app logos.

## Specialist application boundary

The next development stage will attach real `bohselecta/imagehoss`, `bohselecta/3d-bee`, and `bohselecta/videoboss` implementations.

The consolidated runtime must leave stable seams for that work:

```text
service Actor identity
→ Actor App Surface
→ Production Actor Configuration
→ published capability descriptor
→ frozen Context Envelope
→ explicit Agent identity
→ Mold + Task Lease + Grant
→ capability adapter
→ result Gummy + Return + Receipt
```

Do not copy entire specialist repositories into Gummy OS and do not replace their identities with generic deterministic prompts.

## Acceptance gates

Before the replacement PR may be considered merge-ready, automation must prove:

1. Every protected product pillar remains discoverable and reachable.
2. Production Gummy brand masters and hashes are unchanged.
3. Night and Day visual tests pass.
4. No pre-brand scaffold color appears in current product surfaces.
5. The Production runtime critical journey still passes.
6. Production-specific Actor configuration remains isolated.
7. Make Production creates a frozen Run and truthful evidence.
8. IndexedDB/OPFS persistence is authoritative; localStorage may be cache/preferences only.
9. Local Gummy Box and existing bounded transformation journey still pass.
10. Applications and Actor surfaces both remain first-class.
11. The first-party application registry remains intact.
12. Utility tile source hashes and derivative pipeline pass.
13. Tile colors never become CSS semantic colors.
14. Drag/drop remains typed, previewed, non-executing, keyboard-accessible, and touch-accessible.
15. Desktop and phone visual snapshots show the utility tiles without turning the shell into a rainbow launcher.
16. No uncaught errors occur in critical journeys.
17. One exact Vercel preview is tested against the exact head SHA.
18. CI, hosted acceptance, accessibility, visual regression, migration, and failure-path suites pass.

## Required Return

Return:

- consolidation branch;
- exact base and head SHAs;
- source PR/commit mapping for every preserved feature;
- files ported from PR #14;
- files preserved from PR #11/#13;
- utility tile source and derivative hashes;
- one canonical preview URL;
- CI and hosted-acceptance URLs;
- Night and Day screenshots;
- desktop and phone Production screenshots;
- Master Control screenshot;
- drag/drop proposal screenshot;
- protected-pillar machine-readable report;
- Production runtime evidence;
- known limitations;
- real specialist-adapter seams;
- PRs safe to close as superseded;
- exact next instruction for attaching ImageHoss first.

Do not call the branch founder-ready if the implementation merely combines files while visual, storage, identity, or protocol regressions remain.
