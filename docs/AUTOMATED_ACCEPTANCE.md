# Gummy OS Automated Acceptance Standard

**Status:** Founder-approved release requirement  
**Date:** 2026-07-25  
**Purpose:** Make routine product testing fully automated so Hayden uses Gummy OS as a founder and customer, not as the regression test department.

## Founder rule

> **Hayden is not the test harness.**

Routine validation, browser interaction, persistence checks, visual comparison, accessibility checks, security-boundary checks, provider-contract checks, and regression testing must be automated.

Hayden may supply:

- product decisions;
- visual assets;
- credentials or provider choices when required;
- founder acceptance of major experience changes;
- real-world use after the automated release gate passes.

Hayden is not required to:

- click through scripted test cases;
- reproduce bugs that automation can reproduce;
- inspect browser consoles;
- compare screenshots manually;
- repeatedly import files to check persistence;
- validate every viewport or browser;
- serve as the only proof that a release works.

A release is not founder-ready merely because a developer says it works locally.

## Acceptance principle

```text
No PASS without executable evidence.
No founder testing where browser automation can do it.
No merge when a critical user journey is untested.
```

Automated acceptance must produce durable artifacts that another engineer or Agent can inspect:

- test results;
- screenshots;
- videos or traces on failure;
- console and network errors;
- accessibility reports;
- storage/migration evidence;
- example Grants, Task Leases, Returns, and Receipts;
- build and deployment identifiers;
- known limitations and explicitly untested boundaries.

## Test architecture

The implementation must establish a maintainable automated test stack early in the build rather than adding it after the product is visually complete.

A reasonable default is:

```text
TypeScript application/build framework
Unit test runner
DOM/component tests
IndexedDB and storage test utilities
Playwright browser automation
Accessibility automation such as axe-core
Visual screenshot comparison
GitHub Actions PR and scheduled workflows
Preview deployment for browser tests
```

Vite + TypeScript + Vitest + Playwright + axe-core + fake-indexeddb is the preferred default when no architectural blocker exists. Equivalent tools are acceptable when the builder documents why they are better for this repository.

## Required scripts

The final repository should expose stable commands equivalent to:

```bash
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

`npm run verify` must remain the deterministic local/CI gate.

`npm run test:acceptance` must execute the complete critical product journey against a production-like build or preview.

## Test layers

### 1. Static and contract checks

Automate:

- TypeScript/type checking;
- linting and formatting where adopted;
- schema parsing and runtime validation;
- forbidden legacy terminology checks;
- forbidden literal brand-color checks;
- dependency and bundle checks;
- accidental secret detection;
- route and asset existence.

### 2. Unit tests

Cover deterministic logic including:

- ID generation;
- Actor/Agent/Mold separation;
- Master Control decisions;
- capability-risk rules;
- Task Lease conflict rules;
- Work Order validation;
- Return and Receipt construction;
- migration transforms;
- brand token resolution;
- Night/Day selection;
- Gummy/Glopper emphasis;
- quarantine state transitions;
- hash and provenance logic.

### 3. Storage and migration integration tests

Cover:

- IndexedDB metadata writes and reads;
- OPFS or selected byte-store behavior;
- source and result byte integrity;
- source immutability;
- reload and browser-context recovery;
- storage quota and failure paths;
- interrupted writes;
- localStorage Protocol 0.1 migration;
- migration idempotence;
- rollback or safe failure when migration is malformed;
- Gummy Box local queue persistence.

### 4. Broker and adapter contract tests

Use deterministic mock servers/adapters for normal PR validation.

Cover:

- successful model response;
- timeout;
- malformed response;
- denied request;
- cancellation;
- cost/locality disclosure;
- no provider secret in the browser bundle;
- GitHub/Drive adapter root scoping;
- provider disconnect/reconnect;
- offline write queue;
- duplicate Work Order claim prevention;
- actual executor identity in Return and Receipt.

A live provider smoke test may run separately behind repository secrets. Live external inference must not make deterministic PR validation flaky.

### 5. Browser end-to-end tests

Use real browser automation. Critical journeys must run in Chromium and at least smoke in Firefox and WebKit unless a documented platform limitation exists.

Required journeys:

#### Journey A — first run

```text
open Gummy OS
→ choose Night or Day Gummy
→ create local Human/Actor
→ initialize Local Gummy Box
→ enter Gummy Canvas
→ verify Gummy Bar and Glopper availability
→ reload
→ first-run state persists
```

#### Journey B — direct source-to-result

```text
import real Markdown fixture
→ verify source hash
→ open Glopper Panel
→ attach source
→ inspect Master Control proposal
→ approve bounded read/create
→ agent:glopper-web executes deterministic test route
→ result Gummy appears
→ source hash remains unchanged
→ Receipt is complete
→ reload
→ source, result, Grant, lease, and Receipt persist
```

#### Journey C — Work Order

```text
frontier-style Work Order enters Local Gummy Box
→ Glopper Inbox validates it
→ Human approves
→ exclusive Task Lease is created
→ conflicting claim is denied
→ work executes
→ Return, artifact, and Receipt are written back
→ terminal state persists after reload
```

#### Journey D — revocation

```text
revoke Mold or Agent assignment
→ attempt new work
→ execution is blocked
→ denial Receipt is created
→ restore authorized state
→ work may proceed again
```

#### Journey E — quarantine and burn

```text
import harmless untrusted fixture
→ fixture remains quarantined
→ native-style promotion is denied by default
→ disposable workspace is created
→ workspace is burned/reset
→ unapproved state disappears
→ accepted artifact and Receipt survive
```

#### Journey F — visual identity

```text
switch Night ↔ Day
→ only canonical token maps change
→ Gummy remains purple-dominant
→ Glopper remains gold-dominant at interface level
→ mascot identity remains unchanged
→ setting persists
```

#### Journey G — starter project

```text
import a realistic sample project package
→ project appears on Canvas
→ Gummies and Work Orders are discoverable
→ Glopper can summarize project state
→ generated result is added without corrupting imported sources
→ return visit restores the project
```

### 6. Accessibility automation

Automate:

- axe or equivalent checks;
- complete keyboard navigation;
- visible focus without glow alone;
- accessible labels for candy icons;
- name/avatar/label distinction between Gummy and Glopper;
- contrast for Night and Day Gummy;
- reduced-motion behavior;
- screen-reader-readable approval and Receipt summaries;
- no state communicated by color alone.

No critical or serious accessibility violation may pass the release gate without a documented founder-approved exception.

### 7. Visual regression

Capture deterministic screenshots for:

- Night Gummy desktop;
- Day Gummy desktop;
- Gummy Bar states;
- collapsed and expanded Glopper Panel;
- Glopper Inbox;
- Master Control approval;
- source/result view;
- quarantine state;
- Gummy Box onboarding;
- empty, loading, error, denied, revoked, and offline states.

Minimum viewports:

```text
1440 × 900 desktop
1280 × 800 laptop
768 × 1024 tablet
390 × 844 phone
```

Visual tests should use stable fixture data, disabled nondeterministic animation, and controlled timestamps.

A screenshot difference is not automatically accepted because the test was updated. Baseline updates require a clear reason and PR evidence.

### 8. Security-boundary regression

Automate proofs that:

- Work Orders cannot grant themselves authority;
- candy icons cannot grant authority;
- opening an Actor does not grant control;
- Agent and Actor identities cannot collapse;
- a revoked Mold/Agent/lease blocks execution;
- Gummy Box provider scope cannot escape the selected root;
- source Gummies are not overwritten;
- quarantined content cannot become native execution implicitly;
- browser bundles contain no configured provider secrets;
- external-frame restrictions remain intact;
- private local adaptation is not included in the portable profile without approval.

### 9. Reliability and chaos checks

Automate selected failure cases:

- browser refresh during execution;
- tab close/reopen;
- broker timeout;
- offline transition;
- provider reconnect;
- interrupted persistence;
- duplicate event delivery;
- stale Task Lease;
- malformed Work Order;
- low storage/quota simulation;
- failed artifact write.

The user must receive a truthful terminal state rather than a spinner that never resolves.

## Seeded acceptance environment

Create a deterministic **Gummy Acceptance Pack** containing realistic but non-sensitive fixtures:

```text
Human: human:hayden-test
Actor: @hayden-test
Agent: agent:glopper-web-test
Mold: personal test Mold
Master Control: local/browser authority
Gummy Box: Local
Projects: three realistic sample projects
Work Orders: valid, invalid, expired, local-required, conflicting
Files: Markdown, JSON, image metadata, medium-size text fixture
Receipts: success, denied, failed, revoked
```

This pack powers unit, integration, E2E, visual, and demonstration environments. It prevents tests from depending on Hayden's real private projects.

## CI requirements

### Pull request gate

Every implementation PR must automatically run:

- static checks;
- unit tests;
- integration tests;
- build;
- critical Chromium E2E;
- accessibility checks;
- selected visual regression;
- security-boundary tests.

Critical failure blocks merge.

### Main-branch gate

After merge:

- deploy or build a production-like preview;
- rerun the critical acceptance journey;
- retain artifacts;
- report exact commit/deployment tested.

### Scheduled deep suite

Run a nightly or otherwise regular suite containing:

- Firefox and WebKit coverage;
- full viewport matrix;
- offline/reconnect and chaos cases;
- expanded visual regression;
- optional live-provider smoke tests;
- dependency/security scans;
- longer persistence and migration tests.

Do not notify Hayden for unchanged green runs. Surface only meaningful blockers, regressions, founder decisions, or milestone completion.

## Artifact requirements

On failure, CI should retain where supported:

- Playwright trace;
- screenshot;
- video;
- console log;
- network log or sanitized request summary;
- test fixture identity;
- build/commit SHA;
- browser and viewport;
- failed expectation;
- reproduction command.

On a founder-ready candidate, retain:

- acceptance summary;
- critical journey video or screenshots;
- Night/Day screenshots;
- example source/result hashes;
- example Work Order, Task Lease, Grant, Return, and Receipt;
- accessibility report;
- known limitations;
- exact preview URL and commit SHA.

## Release levels

### Code complete

Implementation exists. Tests may still be incomplete. Not ready for Hayden.

### CI green

Automated checks pass for the current scope. Still not automatically founder-ready if critical product journeys or preview deployment are missing.

### Acceptance ready

All critical journeys pass against a production-like build with retained evidence.

### Founder ready

The product can accept a real project without Hayden performing regression testing first.

Founder-ready means:

- automated acceptance passes;
- no critical known data-loss or authority bug;
- the current limitations are visible inside the product;
- setup and onboarding are automated;
- a clean preview or deployment exists;
- rollback/recovery is documented;
- Hayden can begin using it rather than testing it.

## Bug handling

When automation finds a bug:

1. capture evidence;
2. classify severity;
3. create or update a tracked work item;
4. implement a regression test that fails before the fix;
5. fix the bug;
6. prove the regression test passes;
7. retain the evidence in the PR or Return.

Do not ask Hayden to manually confirm routine bug fixes that the regression test can prove.

## Manual testing exception

Manual founder review is reserved for questions automation cannot answer well:

- Does this feel delightful?
- Is Glopper's personality right?
- Is the composition understandable?
- Is a major workflow strategically correct?
- Is a visual change brand-appropriate?

Even then, the product must arrive with automated functional evidence so Hayden is evaluating experience—not discovering broken buttons.

## Final invariant

> **The computer tests the computer. Hayden builds the world.**
