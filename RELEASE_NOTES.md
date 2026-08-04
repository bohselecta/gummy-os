# Release Notes — Gummy OS v1.0.1

**Title:** Stranger-loop completion  
**Version:** 1.0.1  
**Branch:** `release/v1.0.1-stranger-loop`  
**Canonical product:** [https://www.mygum.my/](https://www.mygum.my/)  
**Prior immutable release:** `v1.0.0` Calm Workspace (`7dace7c…`) — this release does not rewrite that tag

## Why this release exists

v1.0.0 shipped a complete Calm Workspace. v1.0.1 finishes the **stranger walk**: a first-time visitor can understand the promise, open a seeded Demo Production, see who is working (including a labeled Demo Worker), run the deterministic loop, accept once, and resume — without orphaned chat work and without fake live-provider claims.

## What a stranger should notice

1. **Promise on the doorway** — Your work should not disappear into AI chats. No orphaned work.
2. **One clear Demo CTA** — Create a collaborative 30-second AI video with @Hayden, @Bob, specialists, and Demo Worker.
3. **Command Center lanes** — Now, Next, Delegated, Review, Blocked, Done.
4. **Honest worker label** — Demo Worker is deterministic, local, $0.00, and not a live provider.
5. **Durable close** — Return → Accept once → Resume the saved group; state survives reload.

## Truthful capability boundary

| Lane | What you get |
| --- | --- |
| Demo Worker | Deterministic demonstration inside this browser |
| Local Gummy Box | Private Productions, Gummies, Returns, Receipts on-device |
| Specialist Actors | Configure and plan; live generation/render/Blender only when separately connected and authorized |
| Live Google / MCP | **NOT CLAIMED** |

## Deploy note

Production at inspection served deployment `dpl_4pkiVBNwjG16VaBmN6xu2Dkj2hC7` on Vercel project `gummy-os` (team `mygummy`). Promotion of this branch to production is a separate verified step after tests — see `docs/release/BUILD-STATUS.md` and `docs/release/DEPLOYMENT-RUNBOOK.md`.

## Related docs

- `PRODUCT.md` — product promise and map
- `CHANGELOG.md` — version history
- `docs/release/V1-SCOPE.md` — in / out of scope
- `docs/release/KNOWN-LIMITATIONS.md` — honest limits
- `docs/provenance/RELEASE-LINEAGE.md` — binding lineage
