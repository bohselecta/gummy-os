# Release Decisions — v1.0.1

Recorded: 2026-08-04  
Branch: `release/v1.0.1-stranger-loop`

## D1 — Immutable v1.0.0 preserved

**Decision:** Tag `v1.0.0` at `7dace7c…` (Calm Workspace) remains immutable.  
**Why:** Public attestation and rollback evidence must stay honest.  
**Consequence:** v1.0.1 is an additive stranger-loop release, not a rewrite of v1.0.0 history.

## D2 — Stranger loop is the v1.0.1 mission

**Decision:** Ship the plain-language Demo Production doorway, Demo Worker labeling, Command Center lanes, provenance, and release docs.  
**Why:** First-time visitors must complete Identify → Intend → Make → Return → Accept → Resume without orphaned chat work.  
**Consequence:** Broader architecture passes and optional live providers stay out of this release.

## D3 — Demo Worker is labeled demonstration

**Decision:** Local deterministic execution for the seeded Demo Production is named **Demo Worker** with an explicit disclosure.  
**Why:** Strangers must never confuse a fixture with a live provider.  
**Consequence:** UI, schema projection (`lanes.worker`), and copy always disclose deterministic / $0.00 / no remote publish.

## D4 — Live providers remain NOT CLAIMED

**Decision:** Live Google Agent Platform, live MCP, and live specialist providers are not claimed on the public product.  
**Why:** Credentials and bridges are optional; missing capability must stay visibly unavailable.  
**Consequence:** Release docs and product copy use **NOT CLAIMED** / unavailable — never silent fake success.

## D5 — Marketing promise locked to product truth

**Decision:** Lead with **NO ORPHANED WORK** / *Your work should not disappear into AI chats.*  
**Why:** Matches the public demonstration doctrine and Local Box + Production evidence model.  
**Consequence:** Doorway, guide, and first-user experience copy stay aligned; no orphaned-work claim without Returns/Receipts.

## D6 — Seeded demo cast

**Decision:** Seeded Demo Production intent is: collaborative 30-second AI video with @Hayden, @Bob, specialists (@ImageHoss, @VideoBoss, Glopper), and Demo Worker.  
**Why:** Matches Living Collaboration fixture and stranger E2E.  
**Consequence:** Doorway CTA and Command Center demo doorway share one story.

## D7 — Command Center is projection, not authority

**Decision:** Command Center lanes are a generated attention view; authority remains Master Control, Human approval, Mold, Lease, and Grant.  
**Why:** Attention surfaces must not self-authorize work.  
**Consequence:** Schema and UI keep `authoritySource` / non-executing semantics.

## D8 — Canonical hosting

**Decision:** Public product stays on Vercel project `gummy-os` (team `mygummy`), root `.`, build `npm run build`, output `build`, canonical host `www.mygum.my`.  
**Why:** Matches verified lineage.  
**Consequence:** Deploy runbook and acceptance report record exact deployment IDs; apex `mygum.my` permanently redirects to www.
