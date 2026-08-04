# Project Return Protocol

**Status:** Architecture primer matching shipped Gummy OS behavior  
**Product promise:** No orphaned work — work must not disappear into AI chats.

## Loop

```text
IDENTIFY → INTEND → MAKE → RETURN → ACCEPT → RESUME
```

| Step | What happens in software |
| --- | --- |
| **Identify** | Human creates a personal Actor and Local Gummy Box. People and specialists appear as Actors with stable `@addresses`. |
| **Intend** | Conversation or selection becomes a **Shared Vision** (non-executing). A Production holds the undertaking. |
| **Make** | **Make Production** freezes configuration, creates Work Orders / Run under Mold, Lease, Grant, and Human approval. Demo Production uses the labeled **Demo Worker**. |
| **Return** | Executors report structured **Returns** and create **Receipts**. Results appear as Gummies — not chat ephemera. |
| **Accept** | Human acceptance updates canonical Production state **once** for that result. Acceptance is not publication. |
| **Resume** | Saved Social Instance / group continues; Command Center and Local Box retain history after reload. |

## Why this exists

Frontier chats orphan decisions, files, and authority. Gummy binds intent, authority, artifacts, and evidence to a Production so a stranger (or the same Human tomorrow) can pick up the thread.

## Boundaries

- Configuring specialists is not Make.
- A completed Job is not automatic acceptance.
- A Return is evidence of an attempt; Human Accept decides canonical advancement.
- Accept never publishes. Distribution plans are separate.
- Command Center shows attention; it does not authorize work.
- Simulated / Demo Worker results stay labeled and distinct from live providers.

## Seeded stranger path

The v1.0.1 Demo Production walks this loop for:

> Create a collaborative 30-second AI video with @Hayden, @Bob, specialists, and Demo Worker.

Implementation lives primarily in `src/core/living-collaboration.js`, Command Center UI in `src/apps/collaboration.js`, and the guide doorway in `src/app.js`.

## Related

- `docs/architecture/SHARED-VISION-AND-PRODUCTION.md`
- `docs/architecture/GUMMYBOX.md`
- `docs/architecture/ACTOR-AGENT-BOUNDARY.md`
- `docs/GUMMY_SHARED_VISION_PRODUCTION_MODEL.md` (full formation model)
