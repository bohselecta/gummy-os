# Acceptance Report — Gummy OS v1.0.1

**Date:** 2026-08-04  
**Branch:** `release/v1.0.1-stranger-loop`  
**Immutable prior release:** `v1.0.0` → `7dace7c5fa472eec441e763e65e0b668f78286ca`  
**Canonical URL:** https://www.mygum.my/

## Commands and results

| Gate | Command | Result |
| --- | --- | --- |
| Fresh install | `rm -rf node_modules && npm ci` | PASS |
| Lint / validate / preservation / copy / brand | `npm run check` | PASS |
| Unit | `node --test tests/*.test.mjs` | PASS — 217/217 |
| Stranger-loop unit | `node --test tests/v1-stranger-loop.test.mjs` | PASS — 3/3 |
| Prod build | `npm run build` | PASS |
| Playwright stranger + phase16 + commercial + onboarding | `npx playwright test tests/e2e/v1-stranger-loop.spec.mjs tests/e2e/phase16.spec.mjs tests/e2e/commercial-workspace.spec.mjs tests/e2e/onboarding.spec.mjs` | PASS — 10/10 |

## Truthfulness

| Claim | Status |
| --- | --- |
| Demo Worker visibly labeled | PASS |
| Live Google / MCP / specialist providers | NOT CLAIMED |
| No silent fake live fallback | PASS |
| Acceptance advances once | PASS |
| Persistence across reload | PASS |

## Manual smoke

Pending automated production deploy verification in this report’s deployment section after alias promotion.

## Three-minute demonstration path

1. Open https://www.mygum.my/
2. Enter Night Gummy → create Local Gummy Box
3. Guide → **Open the Demo Production** (or Actor Home → same CTA)
4. Command Center → review cast (@Hayden, @Bob, specialists, Demo Worker)
5. **Open the Demo Production** → Demo Worker runs ($0.00)
6. Inspect Cost Review, Return, Receipts, lanes (Now/Next/Delegated/Review/Blocked/Done)
7. Accept once → next-action card → Continue

## Known limitations

See `docs/release/KNOWN-LIMITATIONS.md`.
