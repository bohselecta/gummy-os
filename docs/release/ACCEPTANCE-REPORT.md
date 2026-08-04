# Acceptance Report — Gummy OS v1.0.1

**Date:** 2026-08-04  
**Branch:** `release/v1.0.1-stranger-loop`  
**Release commit:** `39b65261dc9483eb09df475876eb2d3994fb5ca8`  
**Release tag:** `v1.0.1`  
**Immutable prior release:** `v1.0.0` → `7dace7c5fa472eec441e763e65e0b668f78286ca`  
**Canonical URL:** https://www.mygum.my/  
**Production deployment:** `dpl_85oqLRngo73edeafoTgJsbiuyvif`  
**Deployment URL:** https://gummy-6tgirlnkj-mygummy.vercel.app  
**PR:** https://github.com/bohselecta/gummy-os/pull/53  

## Commands and results

| Gate | Command | Result |
| --- | --- | --- |
| Fresh install | `rm -rf node_modules && npm ci` | PASS |
| Lint / validate / preservation / copy / brand | `npm run check` | PASS |
| Unit | `node --test tests/*.test.mjs` | PASS — 217/217 |
| Stranger-loop unit | `node --test tests/v1-stranger-loop.test.mjs` | PASS — 3/3 |
| Prod build | `npm run build` | PASS |
| Playwright stranger + phase16 + commercial + onboarding | `npx playwright test tests/e2e/v1-stranger-loop.spec.mjs tests/e2e/phase16.spec.mjs tests/e2e/commercial-workspace.spec.mjs tests/e2e/onboarding.spec.mjs` | PASS — 10/10 |
| Production deploy | `vercel deploy --prod` | PASS — aliased to www.mygum.my |
| Production version claim | `curl https://www.mygum.my/software-application.jsonld` | PASS — `softwareVersion: 1.0.1` |

## Truthfulness

| Claim | Status |
| --- | --- |
| Demo Worker visibly labeled | PASS |
| Live Google / MCP / specialist providers | NOT CLAIMED |
| No silent fake live fallback | PASS |
| Acceptance advances once | PASS |
| Persistence across reload | PASS |

## Manual smoke

| Surface | Result |
| --- | --- |
| Desktop production HTML 200 + new asset hash | PASS (`assets/index-D8b0WAua.js`, last-modified 2026-08-04) |
| Apex redirect mygum.my → www | PASS |
| Mobile viewport covered by Playwright 320px commercial case | PASS |

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

## Development cycle

**Closed for this mission.** Further work is versioned iteration beyond `v1.0.1`. Immutable `v1.0.0` remains recoverable.
