# Deployment Runbook — Gummy OS

**Canonical repository:** `bohselecta/gummy-os`  
**Canonical local folder:** `/Users/hayden/Desktop/gummy-updates/gummy-os`  
**Canonical URL:** https://www.mygum.my/  
**Apex:** https://mygum.my/ → permanent redirect to www (path-preserving)

## Vercel project

| Field | Value |
| --- | --- |
| Team | `mygummy` |
| Project | `gummy-os` |
| Root directory | `.` (repository root) |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `build` |
| Node | `>=22` (match `package.json` engines) |

## Production snapshot (pre–v1.0.1 promotion)

At lineage inspection (2026-08-04), production served:

| Field | Value |
| --- | --- |
| Deployment ID | `dpl_4pkiVBNwjG16VaBmN6xu2Dkj2hC7` |
| Canonical domain | `https://www.mygum.my/` |

Do not assume this ID equals the eventual `v1.0.1` promotion until the exact branch head is redeployed and recorded.

## Pre-deploy checklist

1. Confirm branch: `release/v1.0.1-stranger-loop` (or merged main after review).
2. Confirm `v1.0.0` tag still points at `7dace7c…` — do not move it.
3. Run locally:

```bash
npm run check
npm test
npm run build
npm run test:e2e
```

4. Fill `docs/release/ACCEPTANCE-REPORT.md` with exact counts and FAIL/BLOCKED/NOT CLAIMED notes.
5. Confirm no provider secrets in client bundles, fixtures, or Receipts.
6. Confirm product copy still labels Demo Worker and does not claim live Google/MCP.

## Deploy

Preferred: push the release branch / merge and let Vercel build from the exact commit SHA.

Record after READY:

```text
Deployment ID:
Deployment URL:
Commit SHA:
Ready time (UTC):
Canonical alias time (UTC):
```

Update:

- `docs/provenance/RELEASE-LINEAGE.md`
- `docs/release/BUILD-STATUS.md`
- `docs/release/ACCEPTANCE-REPORT.md`

## Post-deploy smoke (manual founder judgment only for delight)

Automated stranger-loop E2E is the primary gate. After promote:

1. Open https://www.mygum.my/ in a clean profile.
2. Complete onboarding → Local Box.
3. Open Demo Production from the guide doorway.
4. Confirm Demo Worker label and Command Center lanes.
5. Confirm About / Limits (or equivalent) shows the expected commit binding when available.

## Rollback

- Promote the previous known-good Vercel deployment (for Calm Workspace lineage, see `evidence/final-release-manifest.json` and GitHub Release `v1.0.0`).
- Rollback never deletes or rewrites Local Gummy Box data, accepted results, Returns, or Receipts in user browsers.
- Do not force-move git tags to “fix” production.

## Environment variable names only

Names may appear in Vercel / `.env.example`. Never commit values.

```text
GUMMY_FEEDBACK_GITHUB_TOKEN
GUMMY_SESSION_SECRET
GUMMY_FEEDBACK_REPOSITORY
GUMMY_PUBLIC_ORIGIN
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_APP_SLUG
GITHUB_TEST_REPOSITORY
GUMMY_MODEL_BROKER_URL
GUMMY_MODEL_PROVIDER
GUMMY_DEPLOYMENT_MODE
OPENAI_API_KEY
OPENAI_INPUT_USD_PER_MILLION
OPENAI_OUTPUT_USD_PER_MILLION
```

Presence of a variable name does not imply the public product claims that live capability.
