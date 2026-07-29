# Phase 16 — Living Collaboration

## Shared Vision · Actor Presence · Social Instances · Production Pools · Command Center · Distribution

**Status:** IMPLEMENTATION COMPLETE / FOUNDER PREVIEW HOLD / DO NOT MERGE OR PROMOTE
**Designed:** 2026-07-28
**Implemented:** 2026-07-28 from latest `main` at `160b3c44932c6dd1ccd9ea439f9fe60fc4f11808`
**Dependency:** Satisfied. Phase 15 is accepted, merged, deployed, production-verified, and closed.

## Implementation checkpoint

The accepted design packet was first replayed onto a fresh branch from the production-verified Phase 15 head. When PR #34, the deterministic runtime-conformance checkpoint in PR #39, and the governed Runtime Binding checkpoint in PR #40 subsequently reached `main`, the implementation commit was transplanted onto that newer exact head. The final branch therefore contains the canonical merged design history once, preserves the additive non-live forward-compatibility contracts, and adds only the Phase 16 implementation.

The founder-preview candidate now includes:

- all nine validated Phase 16 contracts and migration-safe IndexedDB stores;
- truthful Human-live, AI-represented, static, offline, expired, and revoked presence behavior;
- a durable five-window Social Instance with preserved minimized state and new Session revisions on resume;
- exact selected-message hashes and explicit exclusions for Shared Vision provenance;
- exact-revision Agreement approval and stale-approval invalidation;
- the $10.00 `$4 / $3 / $3` authorization proof and a separate `$2.50 × 4` future proposal;
- append-only Contribution Ledger evidence with no automatic ownership;
- an immutable Formation Event and Receipt;
- the existing governed Make Production path through a deterministic local route;
- separate Human result acceptance and three versioned Distribution Plans;
- one explicit private local release while Radio and Channels remain unpublished;
- a generated, non-executing Command Center projection with Master Control preserved as authority;
- desktop, phone, accessibility, migration, reload, security, bundle, and preservation automation.

Capability truth remains explicit: authenticated remote multi-Human presence, verified remote identity, live audio/video, real payment processing, final Radio voice, remote Channels publication, and Phase 17 MCP execution are not connected or claimed.

The release boundary remains closed until Hayden accepts the exact hosted preview head. Issue #36 remains open and review-held.

## 1. Purpose

Phase 15A made Places useful and persistent. Phase 15B finishes the real product/runtime connections.

Phase 16 implements the behavioral consequence of the Actor architecture:

> Humans and authorized AI representations can occupy persistent Actors, gather in resumable social configurations, recognize shared intent, form governed Productions, coordinate compute and other contributions, understand activity through Command Center, and distribute accepted work through continuing Actor presence.

This is not a generic social-network phase, a dashboard redesign, or an automatic crowdfunding marketplace.

## 2. Governing operating loop

```text
Actor Presence
→ Social Instance / Session
→ Shared Vision
→ Production Proposal
→ Production Agreement
→ Production Formation Event
→ Production Pool + Contribution Ledger
→ Master Control + Make Production
→ Studios / Agents
→ Artifacts / Gummies
→ Returns / Receipts
→ Distribution Plan / Release
→ Actor body of work and resumable presence
```

## 3. Canonical additions

Phase 16 introduces these typed objects:

```text
gummy.actor-presence/v1
gummy.social-instance/v1
gummy.shared-vision/v1
gummy.production-agreement/v1
gummy.production-pool/v1
gummy.contribution-ledger/v1
gummy.production-formation/v1
gummy.distribution-plan/v1
gummy.command-center-view/v1   generated projection only
```

Existing canonical objects remain:

```text
Human
Actor
Agent
Mold
Master Control
Bowl
Session
Link
Gummy
Production
Actor Plan
Run
Work Order
Task Lease
Grant
Return
Receipt
```

No new object silently replaces an existing one.

## 4. Load-bearing distinctions

### Identity versus occupancy

Actor identity persists. Actor Presence says who or what currently occupies or represents it.

### Bowl versus Session versus Social Instance

- Bowl is the durable shared policy environment.
- Session is one bounded interaction episode.
- Social Instance is the saved restorable topology, purpose, membership, layout, and resume state.

### Shared Vision versus Production

Shared Vision recognizes collective intent. Production creates the governed undertaking.

### Contribution versus rights

Contribution Ledger records evidence. Production Agreement defines credit, ownership, control, compensation, and publication meaning.

### Command Center versus Master Control

Command Center shows attention and evidence. Master Control grants or denies authority.

### Glopper versus Zeke

Glopper remains the companion. Zeke is the visible coordinator/explainer inside Command Center and has no hidden authority.

### Acceptance versus distribution

Accepting a result does not publish it. Distribution requires a separate versioned plan and approval.

## 5. Current implemented foundation

Phase 16 builds on existing production-proven elements:

- persistent Actors and separate Agents;
- Molds, Links, Bowls, Gummies, Productions, Work Orders, Leases, Grants, Returns, and Receipts;
- Gummy Canvas and concurrent windows;
- local/private Rooms and threads;
- Production-specific Actor surfaces and Actor Plans;
- Make Production execution boundary;
- local Place state and typed handoffs;
- Radio source/script/private-export core;
- Channels guide/watch-group/premiere-draft core;
- Master Control and Receipt inspection;
- capability truth and cost ceilings.

## 6. Missing capabilities this phase must make real

- presence occupancy states beyond a local availability flag;
- authorized AI representation with visible Mold/Agent disclosure;
- saved/restored Social Instances across sessions;
- authenticated multi-Human sync boundary;
- Shared Vision proposal and source selection;
- Production formation from a Shared Vision;
- versioned Production Agreement;
- append-only Contribution Ledger;
- shared compute allocation, per-contributor authorization, actual-cost reconciliation, and payment Receipts;
- cross-system Command Center;
- Zeke coordinator explanations;
- Distribution Plan and immutable release records;
- Actor body-of-work projection;
- dated public-demonstration evidence package.

## 7. Implementation program

### 16.0 — Freeze, observe, and preserve

- record exact Phase 15B production commit and rollback;
- attach exact TikTok and Instagram demonstration links;
- preserve source video, transcript, screenshots, and hash;
- inventory current Actor, Bowl, Room, Session, Production, Radio, Channels, Command Center-adjacent, cost, and Receipt behavior;
- establish migration fixtures for all existing social and Production records;
- do not rename existing canonical objects.

### 16.1 — Contracts and repositories

- add and validate the Phase 16 schemas;
- add migration-safe repositories and indexes;
- define versioned relationships among Bowl, Session, Social Instance, Shared Vision, Production, Agreement, Pool, Ledger, Formation Event, and Distribution Plan;
- add optimistic revisions and immutable event records;
- ensure every object carries Actor ownership, audience, privacy, provenance, and timestamps;
- add protocol documentation and examples.

### 16.2 — Actor Presence

Implement:

- Human-live;
- Human-available;
- Human-away;
- AI-represented;
- static;
- busy;
- offline;
- dormant;
- revoked.

Requirements:

- current operator is explicit;
- AI representation identifies Agent, Mold, Human sponsor, scope, expiry, and exclusions;
- stale presence expires visibly;
- presence never becomes permanent memory automatically;
- revocation blocks future AI representation;
- no AI claim of Human-live state.

### 16.3 — Social Instances

Implement:

- save an active Room/Bowl/Session as a Social Instance;
- retain members, roles, purpose, threads, selected Gummies, linked Productions, privacy, invitation policy, window layout, minimized state, and resume instructions;
- reload and restore without falsely showing offline Actors as present;
- begin a new Session revision on resume;
- support multiple simultaneous instances with isolated state;
- explicitly share or hand off Gummies between instances;
- preserve recording/transcription consent separately.

### 16.4 — Shared Vision and formation

Implement:

- permissioned momentum detector with explanation;
- dismiss, save idea, create Shared Vision, estimate, invite, or form actions;
- exact selected origin records and exclusions;
- participant acknowledgements;
- Production Proposal compiler;
- Production Agreement review;
- Production Formation Event;
- Links from source Session/Social Instance to Shared Vision and Production;
- no automatic Production creation or execution.

### 16.5 — Agreement, Pool, Ledger, and shared compute

Implement:

- Agreement modes for owner-led, equal collective, producer, and custom governance;
- decision thresholds and amendment workflow;
- append-only Contribution Ledger;
- categories for compute, finance, creative work, labor, Assets, expertise, rights, infrastructure, and distribution;
- separate credit, ownership, control, reimbursement, and revenue fields;
- cost estimate and allocation proposals;
- equal, fixed, percentage, capped-equal, sponsor, resource-weighted, custom, and mixed allocation;
- per-contributor maximum authorization;
- recalculation proposals when contributors join or leave;
- no automatic increase in a contributor maximum;
- external payment-provider adapter with no internal currency or pooled-fund custody in the first proof;
- actual usage, authorization release, refund, failure, cancellation, and retry reconciliation;
- payment events linked to exact Run Receipts.

### 16.6 — Command Center and Zeke

Implement a generated cross-system projection showing:

- current Productions;
- Shared Visions;
- active Agents and runtimes;
- Work Orders and Jobs;
- Returns and results awaiting acceptance;
- recent Receipts;
- cost estimates, commitments, actual usage, and Pool variance;
- pending decisions;
- blockers and failures;
- expiring or revoked permissions;
- presence changes;
- distribution drafts and releases;
- resume opportunities.

Zeke may explain and route attention but cannot approve, spend, execute, publish, or revoke.

Every Command Center action opens the authoritative object or Master Control surface.

### 16.7 — Distribution and Actor body of work

Implement:

- Distribution Plan;
- exact accepted artifact revisions;
- Radio and Channels destination adapters;
- rights, credit, likeness, voice, synthetic-media, audience, moderation, monetization, retention, and deletion review;
- separate publication approval;
- immutable release event and Receipt;
- correction, withdrawal, or takedown events;
- approved Actor body-of-work projection;
- no private-history scraping or automatic channel creation.

### 16.8 — Human verb translation layer

Observe real use before changing navigation.

Add contextual primary verbs such as:

```text
Save this idea
Open this group
Continue where we left off
See what is happening
Agree how we will make it
Choose your contribution
Approve this
Make Production
Review the result
Send this somewhere
Publish
```

Keep canonical terms visible in advanced views, Receipts, explanations, and LLM context.

Do not remove canonical objects merely to shorten labels.

### 16.9 — Evidence and release

- complete unit, schema, migration, repository, security, privacy, payment-boundary, concurrency, browser, accessibility, mobile, failure, revocation, and production tests;
- demonstrate the full local/deterministic proof before connecting paid providers;
- demonstrate authenticated multi-user presence separately;
- capture desktop, phone, multi-window, Command Center, Agreement, Pool, Ledger, Master Control, Receipt, and Distribution evidence;
- founder acceptance;
- merge exact commits;
- production promotion and verification;
- rollback record;
- close the phase only after production evidence exists.

## 8. Shared compute safety rules

- no charge without exact amount, contributor, Production, Run, route, and approval;
- no silent increase to a contributor maximum;
- no retroactive charge reallocation;
- no inference that payment creates ownership;
- no internal token or wallet in the first proof;
- no custody claim where an external provider processes payments;
- no provider charge represented as compute usage without provider evidence;
- no retry against the same authorization without explicit policy;
- no public exposure of private payment instruments or amounts;
- every payment event links to an immutable Receipt.

## 9. Social and representation safety rules

- AI-represented is visibly distinct from Human-live;
- no recording or transcription without explicit Session consent;
- no Social Instance membership inferred from message history;
- no friendship, trust, or contribution score;
- no ambient sharing across instances;
- no public feed;
- no advertising graph;
- no AI acceptance of financial, ownership, likeness, voice, or publication terms without an explicit narrow Mold and Grant;
- revocation blocks future operation without deleting historical evidence.

## 10. Required end-to-end proof

The acceptance story is:

```text
Open Friday Brainstorm Crew
→ restore members, windows, purpose, threads, and shared Gummies
→ show Human-live, AI-represented, static, and offline Actors truthfully
→ discuss a shared result
→ Gummy proposes a Shared Vision and cites selected origin records
→ participants acknowledge
→ create Production Proposal
→ approve Production Agreement
→ estimate $10.00 compute
→ three contributors authorize $4.00 / $3.00 / $3.00 maximums
→ fourth contributor joins
→ system proposes a lower future allocation without changing authorizations
→ revised allocations are individually approved
→ Command Center shows pending decision, cost, sources, and blockers
→ Master Control approves exact Run
→ Make Production
→ Work Orders, Leases, Grants, Agents, and provider/local routes execute
→ Returns and Receipts reconcile actual cost and contributions
→ Human accepts a result
→ Radio aftershow and Channels premiere Distribution Plans are prepared
→ likeness, voice, credit, rights, and publication approvals remain separate
→ one approved release publishes
→ Actor body of work updates through explicit Links
→ Social Instance remains resumable
```

## 11. Automated tests

### Presence

- expired presence never appears live;
- AI representation always identifies Agent and Mold;
- revoked Mold blocks future representation;
- static and offline Actor windows remain openable;
- presence state does not grant membership or authority.

### Social Instance

- save/reload restores layout, members, threads, Gummies, and linked objects;
- resuming creates a new Session revision;
- cross-instance sharing requires explicit handoff;
- offline members are not shown present;
- raw live media is not persisted without consent.

### Shared Vision

- suggestion executes nothing;
- exact origin refs and exclusions persist;
- private omitted records stay omitted;
- participant acknowledgement is version-bound;
- Shared Vision can be rejected or expire without creating Production.

### Agreement and Pool

- stale Agreement approval is rejected;
- contribution does not automatically alter ownership;
- joining contributor cannot silently increase another maximum;
- completed charges never recalculate retroactively;
- failed/cancelled Run reconciles actual cost;
- payment events require provider evidence and Receipt.

### Command Center

- projection does not become authority;
- every attention item links to a source object revision;
- summary cannot mark proposal as execution;
- Zeke action routes to Master Control for consequential approval;
- blocked, failed, recovering, and cost-changed states remain distinct.

### Distribution

- acceptance does not publish;
- stale artifact revision blocks release;
- private source blocks public Distribution Plan;
- missing credit, rights, likeness, voice, or synthetic disclosure blocks publication where applicable;
- publication creates immutable release and Receipt;
- correction does not rewrite original release.

## 12. Non-goals

- no generic social feed;
- no Discord clone;
- no Zoom clone;
- no Kickstarter clone;
- no speculative token economy;
- no automatic legal ownership engine;
- no omnipotent coordinator Agent;
- no hidden payment pooling;
- no automatic conversion of chats into projects;
- no flattening of the existing architecture;
- no broad interface simplification before observed Human paths are documented.

## 13. Completion definition

Phase 16 is complete only when:

- Actor Presence and operator identity are distinct and production-verified;
- Social Instances restore real social topology and state;
- Shared Vision formation works from selected Session provenance;
- Production Agreements are versioned and Human-approved;
- shared compute allocation and external payment authorization reconcile to Runs and Receipts;
- Contribution Ledger records multi-category contribution without silently assigning rights;
- Command Center exposes the complete operating state while Master Control remains authority;
- Zeke explains and routes without executing or approving;
- Radio and Channels support explicit Distribution Plans and at least one verified release route;
- Actor body of work updates only through approved Links/releases;
- the July 28 demonstration record includes exact public links and evidence;
- canonical terminology remains available to LLMs and advanced Humans;
- primary Human verbs become clearer without deleting the underlying model;
- all privacy, security, authority, payment, accessibility, persistence, migration, failure, preview, production, and rollback gates pass.
