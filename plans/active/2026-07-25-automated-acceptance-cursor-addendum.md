# Automated Acceptance — Cursor / Codex Addendum

**Date:** 2026-07-25  
**Applies to:** all active Gummy OS implementation work  
**Authority:** Hayden's founder-testing automation directive

## Mission

Build Gummy OS so Hayden can begin using it without first becoming the manual regression tester.

The builder must automate routine testing from the beginning of implementation, not after the UI is complete.

Read:

1. `docs/AUTOMATED_ACCEPTANCE.md`
2. `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`
3. `plans/active/2026-07-25-gummy-box-cursor-addendum.md`
4. `plans/active/2026-07-25-brand-system-cursor-addendum.md`
5. current source and tests

## Controlling rule

```text
No PASS without executable evidence.
No founder testing where automation can perform the same verification.
```

## Immediate architecture task

The existing plain-browser scaffold does not yet have the infrastructure required for this mandate.

Before broad feature implementation, establish a sustainable browser application and test environment.

Preferred default when no blocker exists:

```text
Vite
TypeScript
Vitest
Playwright
axe-core
fake-indexeddb or equivalent test utility
GitHub Actions
preview deployment
```

An equivalent stack is acceptable with a written rationale.

Do not retain zero-dependency architecture merely to avoid migration when it prevents runtime schema validation, durable storage testing, browser automation, accessible components, or production integration.

## Required repository commands

Create stable commands equivalent to:

```bash
npm run dev
npm run check
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run test:acceptance
npm run build
npm run verify
```

Commands must work locally and in CI without interactive prompts.

## Implementation order

### A. Testable application foundation

- choose and document application/build architecture;
- migrate incrementally from current plain modules;
- preserve the existing visible shell while replacing internals;
- add TypeScript/runtime schema boundaries;
- establish test directories, fixtures, and scripts;
- make timestamps, IDs, animation, and random behavior controllable in tests.

### B. Gummy Acceptance Pack

Create deterministic fixtures for:

- Human;
- Actor and `@address`;
- Glopper Web Agent;
- Mold;
- Master Control;
- Night/Day preference;
- Local Gummy Box;
- source and result Gummies;
- valid, invalid, expired, conflicting, and local-required Work Orders;
- Task Leases;
- Grants;
- Returns;
- Receipts;
- three realistic sample projects.

Fixtures must not use Hayden's private project data.

### C. Unit and contract layer

Before wiring full UI, automate:

- protocol schemas;
- object constructors;
- migration logic;
- Work Order validation;
- Task Lease conflicts;
- permission evaluation;
- brand token maps;
- source/result hashing;
- Receipt completeness;
- quarantine transitions.

### D. Durable-storage integration layer

Automate IndexedDB and OPFS-equivalent behavior:

- write/read bytes;
- metadata indexes;
- source immutability;
- result creation;
- interrupted write behavior;
- reload recovery;
- migration from current `localStorage`;
- migration idempotence;
- malformed state handling;
- queue persistence.

### E. Browser harness

Add Playwright or equivalent with:

- controlled fixture seeding;
- browser console failure capture;
- network/request capture with secrets sanitized;
- trace/video/screenshot on failure;
- deterministic clock and animation controls;
- persistent browser-context tests;
- mobile/tablet/desktop projects;
- Chromium required on PRs;
- Firefox/WebKit smoke or scheduled coverage.

### F. Critical automated journeys

Implement the journeys in `docs/AUTOMATED_ACCEPTANCE.md`:

- first run;
- direct source-to-result;
- Work Order/Glopper Inbox;
- revocation;
- quarantine and burn;
- Night/Day and Gummy/Glopper identity;
- realistic starter-project import and return continuity.

Do not mark a major feature complete until its critical journey is automated.

### G. Accessibility and visual regression

- integrate axe or equivalent;
- automate keyboard-only flows;
- test visible focus;
- capture Night/Day screenshots across required viewports;
- include empty/loading/error/denied/revoked/offline states;
- store or upload baseline evidence;
- require explicit reason for baseline updates.

### H. CI and preview

Create GitHub Actions workflows for:

#### Pull request

- install/cache;
- check;
- unit;
- integration;
- build;
- Chromium critical E2E;
- accessibility;
- selected visual tests;
- artifact upload on failure.

#### Main/preview

- production-like build/deploy;
- acceptance smoke against exact commit;
- retain summary and artifacts.

#### Scheduled deep suite

- Firefox/WebKit;
- full viewport matrix;
- offline/reconnect/chaos;
- expanded visual regression;
- optional live-provider smoke behind secrets;
- security/dependency scan.

### I. Live-provider boundary

Deterministic tests use mocks.

A separate live smoke test may verify one configured provider route when credentials exist. It must:

- run behind repository/environment secrets;
- use bounded non-sensitive fixture content;
- cap cost;
- identify provider/model/locality;
- never block ordinary deterministic development due to provider flakiness;
- never expose credentials in browser code, logs, screenshots, or artifacts.

### J. Automated bug loop

Every bug found during implementation gets:

1. failing regression test;
2. fix;
3. passing regression test;
4. evidence attached to PR/Return.

Do not return routine manual test instructions to Hayden.

## Founder-free release gate

Before saying “ready for Hayden,” prove:

- application builds from clean checkout;
- critical acceptance suite passes;
- production-like preview exists;
- no uncaught browser-console errors in critical journeys;
- Night and Day screenshots exist;
- accessibility report has no unapproved critical/serious issues;
- source/result hashes prove immutability;
- Work Order/lease/Grant/Return/Receipt example is retained;
- revocation blocks execution;
- persistence survives reload and browser-context restart;
- current limitations are shown in-product and in Return;
- exact commit and preview URL are supplied.

Hayden should receive:

```text
Open this URL.
Import or connect your first real project.
Begin using Gummy OS.
```

Not:

```text
Please click these 47 things and tell us what broke.
```

## Progress behavior

Continue through implementation and automated verification without stopping for ordinary testing questions.

Stop only for:

- credentials or provider choice that cannot be safely inferred;
- irreversible architecture decision with materially different product outcomes;
- founder-controlled visual asset decision;
- security boundary that cannot be implemented honestly;
- external service/account permission requiring Human action;
- evidence that the accepted specification is internally contradictory.

When blocked, return one exact decision or action—not a general request to test the product.

## Required Return additions

```text
Test architecture
Commands added
CI workflows
Preview/deployment
Acceptance Pack
Unit results
Integration results
E2E results
Accessibility results
Visual results
Security-boundary results
Browser/viewport matrix
Failure artifacts
Live-provider tests run/not run
Exact commit tested
Exact preview tested
Known limitations
Founder action required, if any
Founder-ready: YES/NO
```

## Definition of done

The automation mandate passes when Gummy OS is delivered with enough executable evidence that Hayden can start using it with real projects without first performing routine regression testing.

> **The computer tests the computer. Hayden builds the world.**
