# Phase 16.5 Calm Workspace acceptance — 2026-07-29

## Scope

This pass simplifies the workspace without flattening the product model:

- desktop primary navigation is Gummy, Gummy Box, Composer, Productions, and
  Command Center;
- phone primary navigation is Gummy Box, Composer, Current, Gummy, and More;
- system and secondary destinations remain available through More;
- workspace groups save window arrangements without acquiring Social Instance
  semantics;
- one notification center owns coalescing, dismissal, persistence, and history;
- Gummy Box opens with Continue, Start or import, Recent result, and Needs
  attention;
- Composer is canvas-first with phone Goal, Arrange, Review, and System Details
  modes;
- Connections & runtimes reports state, capability, users, locality, data
  classes, cost/limits, and last verification;
- Command Center pin, snooze, and dismiss affect only its generated projection.

## Authority boundary

Local Gummy Box remains canonical. Phase 17 live MCP execution and Google live
execution remain disabled. No credential value is stored in browser state,
fixtures, evidence, or screenshots. No Calm Workspace control starts a Job,
publishes, spends, approves, or grants authority.

## Verified local result

- schema, fixture, finish-kit, copy, color, brand, utility-tile, and realm
  validation: pass;
- Node tests: 204 passed;
- production build: 65 modules transformed, PWA generated;
- security audit: 403 source files, zero source maps, zero server-only markers;
- Chromium acceptance: 67 passed, two explicit live-bridge cases skipped;
- cross-browser return suite: 6 passed across Chromium, Firefox, and WebKit;
- product-preservation suite-complete gate: pass;
- dependency audit: zero vulnerabilities;
- `npm run verify`: pass.

The hosted founder preview URL and its exact commit are recorded in the draft PR
after the branch is published.

## Founder acceptance and merge

> I accept the exact Phase 16.5 Calm Workspace candidate at
> `ac9c5f61d5979531df7c5f9559bddb131a620613` for merge and production
> release. The goal is to finish Gummy OS as a stable v1 product, not begin
> another expansion loop.

The candidate was merged without a product change through PR #46. The normal
merge commit is `1bdd08a2c983b154a577fcf4e21e01034033bb53`; its parents preserve
both the runtime-identity foundation at
`617d9356b92160f77cda84f19c4877292f8b6edb` and the exact accepted Calm
Workspace candidate.

Fresh clean-checkout verification of the merged commit passed:

- 204 of 204 Node tests;
- 67 of 69 Chromium browser tests, with only two explicitly configured
  live-bridge skips;
- 6 of 6 deep-return tests across Chromium, Firefox, and WebKit;
- accessibility across desktop, tablet, phone, Night, Day, and reduced motion;
- security scan of 403 source files with zero source maps and zero server-only
  markers in the browser bundle;
- zero dependency vulnerabilities;
- product-preservation suite-complete and `git diff --check`.

GitHub Actions candidate runs `30491169101` (cross-browser) and `30491169166`
(standalone) were green. Live Google Agent Platform and live MCP provider
execution remain disabled and are not claimed by this acceptance.
