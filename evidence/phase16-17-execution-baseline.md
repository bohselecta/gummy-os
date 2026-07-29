# Phase 16/17 Execution Baseline

Captured on 2026-07-28 before runtime integration.

| Item | Recorded value |
| --- | --- |
| Initial `main` | `f9bccc2894e301c6cbf0f73bcf2fd387206cd73f` |
| Phase 16 PR | #34, `codex/phase16-living-collaboration-design` |
| Phase 16 accepted head | `9cb1d82e79ee75a7824a5ddcbe7acaab2972726c` |
| Phase 16 merge commit | `2d4c96cc78d35bc374af4b3d4fce12f5d9c8745a` |
| Fast-lane PR | #39, `codex/spark-phase16-17-fast-lane` |
| Coordination issue | #38 |
| Phase 17 issue | #36 |
| Latest discovered production deployment | `5649699169` |
| Deployed SHA | `f9bccc2894e301c6cbf0f73bcf2fd387206cd73f` |
| Deployment URL | `https://gummy-1hqhhlj0d-mygummy.vercel.app` |
| Historical rollback anchor | `4369d7181868cfd173f88698816b9190f9c0ad11` |
| Historical rollback deployment | `dpl_EzAjF9HeksPnNWg8tYDnzhLNhVQa` |

## Phase 16 ownership

PR #34 owned only its five design/demonstration documents, nine Phase 16 schemas,
and `tests/phase16-design-contracts.test.mjs`. It did not modify production
runtime source. Its repository verification passed; the initial Vercel failure
was a project build-rate limit, and the later preview reported Ready.

Founder acceptance was recorded and PR #34 was merged before this stack was
rebased.

## Branch overlap

After the Phase 16 merge, the only unmerged remote branch found touching the same
runtime areas was the historical `codex/phase10-live-activation` branch. It
touches `server/api.mjs`, `src/app.js`, `src/apps/production.js`,
`src/core/production-runtime.js`, specialist integration files, and related
tests. No changes from that stale branch are imported by this stack.

PR #39 was rebased so its first parent is the exact Phase 16 merge commit.
