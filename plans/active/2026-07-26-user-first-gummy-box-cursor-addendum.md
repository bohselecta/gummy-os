# Cursor Addendum — User-First Gummy Box

**Date:** 2026-07-26  
**Controlling architecture:** `docs/USER_FIRST_GUMMY_BOX.md`

## Mission

Preserve the current standalone proof, then make Gummy OS useful without asking users to configure GitHub Apps, PEM keys, environment variables, repositories, buckets, or OAuth clients.

This is the next product lane. Do not destabilize PR #11 acceptance work while it is still being completed.

## Founder evidence

The founder completed the current GitHub App path and found it unacceptably complex and stressful. Treat that as decisive usability evidence, not an education problem.

```text
No consumer flow may depend on a user repeating that setup.
```

## Product target

```text
Open Gummy
→ Add a project or Talk to Gummy
→ Local Gummy Box exists automatically
→ optional managed sync
→ optional one-click GitHub / Drive connections
```

## Work package A — adapter roles

Refactor provider roles without deleting current proof code.

Define or preserve a typed interface supporting:

```text
local
managed
GitHub
Google Drive
```

Each adapter declares:

- provider type;
- authoritative / mirror / import / export role;
- locality;
- online/offline state;
- read/write capabilities;
- current revision and sync cursor;
- revocation state;
- truthful limitations.

Canonical Box identity must remain provider-neutral.

## Work package B — first-party managed Box service

Create a bounded Cloudflare service prototype using:

- Worker API for authenticated requests and policy;
- D1 for records, metadata, indexes, connector bindings, and sync state;
- R2 for project bytes and artifacts;
- one Durable Object per Gummy Box for serialized coordination, exclusive task ownership, and receipt-chain ordering;
- Queues only for asynchronous tasks that benefit from retries or deferred delivery.

Do not move deterministic local storage out of IndexedDB/OPFS.

## Work package C — upload/download authority

Implement short-lived object-specific upload and download authority.

Requirements:

- permanent R2 credentials never enter browser code;
- object key is restricted to the current Human/Box/object path;
- operation and expiry are explicit;
- content type and maximum size are validated;
- failed or expired authority is visible and retryable;
- hashes are verified after transfer;
- offline/local behavior remains available.

## Work package D — identity and sessions

Create a minimal Gummy account/sync session boundary without making account creation the first action.

Required behavior:

- local mode works before sign-in;
- sync sign-in appears only when the user enables backup, multi-device continuity, or a provider connector;
- one simple user-facing authentication flow;
- server-side secrets and connector tokens are never exposed;
- account disconnect does not erase local projects;
- migration from local-only to managed sync is deterministic and non-destructive.

Do not lock a third-party auth vendor into protocol schemas.

## Work package E — GitHub connector

Production architecture owns one Gummy GitHub App.

User experience:

```text
Connect GitHub
→ consent / install
→ select repository
→ return connected
```

The user never creates an App, generates a PEM key, finds IDs, or edits Vercel variables.

Preserve repository selection, expected-head conflict detection, no force push, disconnect semantics, and explicit authority role.

The existing founder-owned App remains a test fixture until the platform-owned App exists.

## Work package F — Google Drive connector

Production architecture owns one Google OAuth application.

Use a narrow per-file authorization strategy and Picker-based selection.

User experience:

```text
Connect Drive
→ consent
→ choose file/folder
→ return connected
```

Do not request entire-Drive access unless a documented product requirement makes the narrow scope insufficient.

## Work package G — plain-language shell

Keep protocol terminology in code, schemas, evidence, diagnostics, and developer mode.

Default UI mapping:

```text
Work Order       → What Glopper will do
Capability Grant → Permission needed
Task Lease       → Working on it
Return           → Your result
Receipt          → What happened / Activity
Gummy Box        → Your projects / Storage & sync
Master Control   → Access & control
```

First-run primary actions:

```text
Add a project
Talk to Gummy
```

Do not expose architecture navigation before the user has a project.

## Work package H — conversation-first entry

The primary product surface is one waiting assistant presence.

Support:

- text immediately;
- microphone where available;
- image/file attachment;
- graceful text fallback;
- one short clarifying question before costly or consequential work;
- lightweight working memory without a complex settings panel.

## Work package I — automation

Automate all routine testing.

Required suites:

- five-second comprehension content audit;
- ten-second first-action browser test;
- local-only onboarding with network/provider calls blocked;
- local → managed migration;
- direct upload/download with expiry and hash verification;
- managed sync conflict and reconnect;
- GitHub one-click install callback and selected-repository scope;
- Drive OAuth/Picker mocked contract tests;
- connector disconnect without canonical project loss;
- plain-language default UI vocabulary audit;
- technical Details disclosure audit;
- accessibility, phone, desktop, offline, and visual regression.

No founder regression checklist.

## Work package J — rollout

Feature flags:

```text
managedBox
plainLanguageShell
platformGitHubConnector
platformDriveConnector
```

Sequence:

1. Finish current PR #11 proof honestly.
2. Land adapter role separation.
3. Add managed Box backend and local migration.
4. Replace first-run architecture dashboard with project/conversation entry.
5. Add platform-owned GitHub connector.
6. Add Drive connector.
7. Make external providers optional in acceptance.

## Non-goals for this lane

- social network expansion;
- enterprise administration;
- billing sophistication;
- public Actor discovery;
- native bridge expansion;
- theme marketplace;
- replacing GitHub as a code host;
- replacing Google Drive as a collaboration suite.

## Return contract

Return:

- exact commits and deployed environments;
- architecture and schema changes;
- Cloudflare resources created;
- local-only and managed-sync test evidence;
- connector consent screenshots generated by automation where permitted;
- evidence that no secrets appear client-side or in logs;
- known costs, limits, and vendor dependencies;
- explicit unproven claims.

## Completion law

```text
A first-time user can add a project and get useful help
without knowing or configuring any infrastructure provider.
```
