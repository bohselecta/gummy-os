# Gummy Box and Work Orders

**Status:** Founder architecture ruling  
**Date:** 2026-07-25

## The idea

During onboarding, Gummy OS creates or connects a **user-owned Gummy Box**.

A Gummy Box is the durable asynchronous handoff space between frontier models, Gummy OS, Glopper executors, and the Human.

It may be backed by:

- a private GitHub repository;
- a Google Drive folder;
- local-only Gummy OS storage;
- another compatible provider added later.

The product metaphor is similar to a personal Dropbox, but the canonical name is **Gummy Box**.

## Why it matters

Frontier models do not need direct access to the Human's Linux machine, local folders, IDE, or native Agent.

They can write a structured **Work Order** into the Gummy Box.

Glopper can then:

1. discover the Work Order;
2. validate it;
3. show it to the Human or apply approved policy;
4. choose the correct executor;
5. claim it through a Task Lease;
6. execute only the authorized scope;
7. return artifacts, reports, and Receipts to the Box.

```text
Frontier model
→ writes Work Order
→ Gummy Box
→ Glopper Inbox
→ Human / Master Control review
→ Task Lease + Grant
→ Web, Cloud, Native, or Phone Glopper executor
→ Return + artifacts + Receipt
→ Gummy Box
```

The Gummy Box allows the systems to cooperate even when they are distant in time, device, location, or connectivity.

## Canonical terms

```text
Gummy Box       user-owned durable handoff space
Glopper Inbox   Gummy OS view of pending Work Orders
Work Order      structured request for bounded work
Task Lease      ownership of one Work Order by one executor
Return          structured account of attempted/completed work
Artifact        file, patch, Gummy, report, or other result
Receipt         evidence of authority, route, changes, and outcome
```

## Onboarding

Gummy OS onboarding offers:

### Local only

Creates the Box inside Gummy OS local storage. No external account is required.

### Private GitHub

Creates or connects a private repository. Best for:

- code projects;
- versioned text;
- branches, commits, and pull requests;
- machine-readable history;
- exact diffs and review.

### Google Drive

Creates or connects a folder. Best for:

- general users;
- documents;
- images and media;
- mixed project files;
- collaboration outside software development.

The provider is an adapter. Gummy Box identity and Work Order semantics remain provider-neutral.

The Human may add a second provider later, but Master Control declares which location is authoritative and what may mirror or synchronize.

## Recommended structure

A provider may represent this structure as folders, files, repository paths, labels, or provider-native metadata:

```text
gummy-box/
├── box.json
├── inbox/
├── claimed/
├── running/
├── returns/
├── artifacts/
├── receipts/
├── archive/
└── profile/
```

### `box.json`

Identifies:

- Gummy Box ID;
- owner Human and Actor;
- provider adapter;
- authoritative location;
- allowed writers/readers;
- sync policy;
- schema/protocol version;
- creation/update times.

### `inbox/`

New Work Orders not yet claimed.

### `claimed/`

Validated Work Orders with an active or proposed Task Lease.

### `running/`

Work Orders currently executing.

### `returns/`

Structured Returns from Glopper or another authorized Agent.

### `artifacts/`

Generated files, patches, documents, Gummies, screenshots, reports, and other results.

### `receipts/`

Action Receipts, Grant evidence, hashes, and execution summaries.

### `archive/`

Completed, rejected, expired, cancelled, and superseded Work Orders.

### `profile/`

Human-approved portable preferences only. Raw private local adaptation memory does not belong here unless the Human explicitly exports it.

## Work Orders are Gummies

A Work Order is a Gummy with a specialized schema and behavior.

It includes:

- stable Work Order ID;
- issuer identity and disclosure;
- Human/Actor target;
- requested Glopper/Agent family or executor constraints;
- goal;
- source references;
- exact scope;
- required capabilities;
- privacy and locality constraints;
- preferred inference route;
- acceptance tests;
- expected Return;
- expiry;
- approval requirement;
- signatures/hashes where available.

A frontier model may author a Work Order, but authorship does not grant execution authority.

> **A Work Order is a proposal, not a Grant.**

## Glopper Inbox

The Glopper Inbox is a Gummy OS surface, likely opened through Glopper Panel or a candy icon in the Gummy Bar.

It shows:

- pending Work Orders;
- issuer/model disclosure;
- target Actor;
- requested executor;
- requested resources/capabilities;
- privacy/locality;
- risk;
- expiration;
- acceptance criteria;
- conflicts with active Task Leases;
- Human actions: approve, revise, reject, hold.

Glopper validates structure before presenting the Work Order as runnable.

## Executor routing

After approval, Glopper selects an executor:

```text
agent:glopper-web
agent:glopper-cloud
agent:glopper-native
agent:glopper-phone
```

Routing considers:

- authoritative location of source material;
- required capabilities;
- whether files are local, GitHub, Drive, or Gummy OS objects;
- privacy and locality;
- provider availability;
- cost and latency;
- active Task Leases;
- Human preference;
- Mold and Master Control policy.

A GitHub-backed code task may be handled entirely by Web or Cloud Glopper against a clean remote branch.

A task involving uncommitted local files, Cursor, local models, devices, or private directories waits for Native Glopper.

## Disconnected operation

### Web available, Native unavailable

- Work Orders remain in the Box;
- Web/Cloud Glopper may perform web-safe tasks;
- native-only Work Orders remain queued;
- the Human sees why they are waiting.

### Native available, internet unavailable

- Native Glopper may execute already-synchronized/local Work Orders;
- Returns and Receipts queue locally;
- provider synchronization resumes later.

### Both available

- one executor claims the Work Order through an exclusive Task Lease;
- parallel work requires explicit separate scopes and leases;
- every Return identifies the actual executor.

## GitHub adapter

The GitHub adapter may use:

- private repository paths for Box objects;
- commits as append-only changes;
- branches/worktrees for code execution;
- pull requests for Human review;
- commit/blob hashes for evidence;
- issues/discussions only where deliberately useful.

A Work Order committed to GitHub does not authorize Glopper to write to every repository in the account.

## Google Drive adapter

The Drive adapter may use:

- one Human-selected folder;
- provider-native file IDs;
- explicit subfolders/metadata;
- version history where available;
- scoped Drive permission;
- file hashes stored in Gummy metadata and Receipts.

Connecting Drive does not authorize Glopper to read the Human's entire Drive.

## Frontier model role

A frontier model can:

- reason about the task;
- produce a Work Order;
- attach source references or generated planning artifacts;
- propose capabilities and acceptance tests;
- revise a rejected Work Order;
- inspect a Return when shared back.

It does not automatically:

- receive local filesystem access;
- assign itself an Agent identity;
- issue a Capability Grant;
- claim a Task Lease;
- choose final authority;
- bypass Master Control.

## Return contract

Every attempted Work Order produces a Return containing:

- Work Order ID;
- Task Lease ID;
- actual Agent executor;
- base/source state;
- files/Gummies changed;
- commands/actions performed;
- tests and acceptance checks;
- artifacts;
- Receipt IDs;
- known limitations;
- proven and unproven claims;
- recommended next action.

Rejected, denied, expired, failed, and cancelled Work Orders also produce a terminal Return or Receipt.

## Security rules

- Provider connection is scoped to the selected Box.
- Work Order content is untrusted data until validated.
- A Work Order cannot grant itself capabilities.
- Source references are resolved under current Human/Master Control authority.
- Task Lease prevents silent duplicate execution.
- Provider files never become native executables automatically.
- Local-only data stays local unless explicitly attached/exported.
- Returns and Receipts identify the actual model/provider/runtime/locality.
- The Human can disconnect or rotate a Box provider without losing canonical Box identity.

## Initial implementation boundary

The first Cursor implementation should support:

1. local Gummy Box in IndexedDB/OPFS;
2. a provider-neutral adapter interface;
3. one GitHub-backed or Google Drive-backed proof adapter, whichever can be completed cleanly first;
4. Work Order import/validation;
5. Glopper Inbox;
6. approve/reject/hold;
7. Task Lease claim;
8. one real Work Order executed by `agent:glopper-web`;
9. Return, artifact, and Receipt written back;
10. offline queue and reconnect behavior at a minimal honest level.

Do not block standalone Gummy OS on production-grade two-provider synchronization. Prove one adapter and preserve the interface for the second.

## Invariant

> **Frontier models write the instructions. Glopper owns the execution contract. The Human owns the Box and the authority.**
