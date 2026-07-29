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
after the branch is published. Phase 16.5 remains unmerged pending founder
acceptance.
