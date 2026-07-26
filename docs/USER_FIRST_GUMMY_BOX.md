# User-First Gummy Box

**Status:** Founder architecture ruling  
**Date:** 2026-07-26

## Why this ruling exists

The current private-GitHub proof required Hayden to create a repository, register a GitHub App, generate a private key, install the App, locate several identifiers, copy five environment variables into Vercel, redeploy the correct branch, and debug installation lookup.

That work is useful engineering proof. It is **not acceptable product onboarding**.

If the founder—who understands the project, owns the repositories, and has direct help from advanced coding Agents—finds the setup confusing and stressful, the consumer flow has failed.

## Product law

> **A Gummy Box exists when Gummy OS opens. GitHub and Google Drive are optional connections, never prerequisites.**

The user should experience:

```text
Open Gummy
→ add or describe a project
→ Gummy keeps it safe automatically
→ Glopper helps
→ connect GitHub or Drive only when useful
```

No ordinary user should ever:

- create a GitHub App;
- generate or paste a PEM private key;
- find an installation ID;
- create Vercel environment variables;
- understand branches, OAuth clients, buckets, D1, R2, Durable Objects, or sync cursors;
- choose an infrastructure provider before using Gummy OS.

## Five-second / ten-second requirement

Within five seconds, a first-time user should understand:

> **Gummy is a place to bring a project and get help finishing it.**

Within ten seconds, the user should know the next action:

```text
Add a project
or
Talk to Gummy
```

The default surface opens to one waiting assistant presence, not an architecture dashboard.

## Human language by default

The protocol remains exact underneath. The visible product uses ordinary language.

| Protocol term | Default user-facing language |
|---|---|
| Gummy Box | Your projects / Storage & sync |
| Work Order | What Glopper will do |
| Capability Grant | Permission needed |
| Task Lease | Working on it / claimed task |
| Return | Your result |
| Receipt | What happened / Activity |
| Master Control | Access & control |
| Actor | Profile / workspace identity where needed |
| Agent executor | Who is doing the work |

Technical terms remain available inside **Details**, developer mode, diagnostics, evidence exports, and protocol documentation.

## Storage architecture

### 1. Local always works

The existing browser-first Local Gummy Box remains:

- IndexedDB for protocol records and metadata;
- OPFS for project bytes and artifacts;
- offline-capable;
- immediately created during onboarding;
- useful without an account or external provider.

### 2. Managed Gummy Box is the default sync service

A first-party Gummy service provides optional backup, multi-device continuity, asynchronous handoff, and connector orchestration.

Recommended Cloudflare implementation:

```text
Browser / Gummy OS
        │
        ▼
Cloudflare Worker API
        │
        ├── D1
        │   users, boxes, object metadata, versions,
        │   activity, connector bindings, sync cursors
        │
        ├── R2
        │   project files, Gummies, artifacts, exports,
        │   encrypted or opaque object payloads
        │
        ├── Durable Object per Gummy Box
        │   serialized task ownership, receipt-chain ordering,
        │   conflict coordination, live state
        │
        └── Queues
            connector sync, retries, model jobs,
            indexing, deferred returns
```

The browser receives short-lived, object-specific upload/download authority. It never receives permanent R2 credentials.

### 3. Provider-neutral adapter contract remains

The canonical Box identity does not equal a provider.

```text
box:hayden
├── local adapter       automatic
├── managed adapter     automatic when sync is enabled
├── github adapter      optional
└── drive adapter       optional
```

A connector may be:

- an import source;
- an export target;
- a mirror;
- an authoritative location chosen by the Human for a specific project.

It is not automatically the identity of the Box.

## GitHub experience

Production Gummy OS owns one multi-tenant GitHub App.

The user flow is:

```text
Connect GitHub
→ GitHub consent screen
→ choose account/repository
→ return to Gummy
```

The platform owns and protects the GitHub App ID and private key. Users install the App on selected repositories. They never create their own App or paste secrets.

GitHub is best presented inside a project's **Connections** area, primarily for code, commits, branches, diffs, and pull requests.

Gummy OS must remain fully useful without GitHub.

## Google Drive experience

Production Gummy OS owns one Google OAuth application.

The user flow is:

```text
Connect Google Drive
→ Google consent
→ choose files/folder through Picker
→ return to Gummy
```

Use the narrowest practical scope, favoring per-file access. Users never create OAuth credentials.

Drive is best presented for documents, images, media, and collaboration—not as a mandatory setup step.

## First-run experience

### Screen 1

Production Gummy identity and one sentence:

> Bring Gummy a project. It keeps everything together and helps you move it forward.

Primary actions:

```text
Add a project
Talk to Gummy
```

Secondary, quiet action:

```text
Open an existing project
```

### First project

- accept a file, folder, text description, voice note, image, or repository link;
- create local durable state automatically;
- show the project, not the storage machinery;
- let Gummy ask one short clarifying question when necessary;
- let Glopper propose a bounded action in plain language;
- show technical scope only under Details.

### First consequential action

```text
Glopper will:
• read Project Brief.md
• create a cleaned project plan
• save the original unchanged

[Not now] [Do it]
```

After completion:

```text
Your plan is ready.
Original unchanged · saved automatically

[Open result] [See what happened]
```

## Security and authority

- Local-only mode requires no cloud account.
- Managed sync is opt-in and reversible.
- Each user's objects are namespaced by tenant, Box, and object ID.
- Provider tokens and GitHub App credentials remain server-side and encrypted.
- Direct file transfer uses short-lived scoped authority.
- Connectors can be revoked independently without destroying the canonical Box.
- External provider content is untrusted until validated.
- Work proposals never authorize themselves.
- Exact executor, provider, cost, locality, and evidence remain available in Details.

## Migration from the current proof

The private-GitHub implementation remains valuable as an adapter proof and test fixture.

It changes role:

```text
CURRENT PROOF
GitHub repository = required external Gummy Box

TARGET PRODUCT
Managed/local Gummy Box = default
GitHub repository = optional project connection
```

Do not delete the current adapter. Move it behind the provider-neutral connection layer and remove it from first-run acceptance requirements.

## Release acceptance

The user-first lane is not complete until automation proves:

1. A new user reaches the first project action in ten seconds without documentation.
2. Local project creation works with no account, GitHub, Drive, or Cloudflare dashboard interaction.
3. Managed sync can be enabled without exposing infrastructure vocabulary.
4. GitHub connection requires one provider consent flow and repository selection—no secret handling.
5. Drive connection requires one consent flow and Picker selection—no credential setup.
6. Default UI contains none of: Task Lease, Capability Grant, Work Return, protocol schema IDs, installation ID, App ID, private key, environment variable.
7. Technical details and evidence remain accessible without cluttering the main flow.
8. Local/offline use remains truthful when managed sync or connectors are unavailable.
9. Disconnecting GitHub or Drive does not destroy the canonical project.
10. Browser automation verifies onboarding, project import, action approval, result, reopen continuity, connector attach/detach, failure recovery, and accessibility.

## Invariant

> **The intelligence absorbs the complexity. The Human receives the result, the choice, and the truth.**
