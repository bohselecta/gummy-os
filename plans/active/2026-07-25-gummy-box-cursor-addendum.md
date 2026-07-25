# Gummy Box and Work Orders — Cursor Addendum

**Date:** 2026-07-25  
**Applies to:** `plans/active/2026-07-25-personal-gummy-cursor-work-order.md`  
**Authority:** Hayden's Gummy Box / frontier-model Work Order ruling

## Purpose

Add the asynchronous handoff system without changing the controlling standalone Gummy OS exit.

```text
Frontier model writes Work Order
→ user-owned Gummy Box
→ Glopper Inbox
→ Human approval / Master Control
→ Task Lease + Grant
→ Glopper executor
→ Return + artifact + Receipt
→ Gummy Box
```

A Work Order is a proposal. It is never self-authorizing.

## Read first

- `docs/GUMMY_BOX_WORK_ORDERS.md`
- `schemas/gummy-box.schema.json`
- `schemas/work-order.schema.json`
- `schemas/work-return.schema.json`
- `examples/hayden.gummy-box.json`
- `examples/project-brief.work-order.json`
- `examples/project-brief.task-lease.json`
- `examples/project-brief.work-return.json`

## Onboarding requirement

Add a Gummy Box onboarding step with three choices:

1. **Local only** — IndexedDB/OPFS-backed Box, no external account.
2. **Private GitHub** — connect/create a private repository-scoped Box.
3. **Google Drive** — connect/create one folder-scoped Box.

For the first implementation, complete Local plus exactly one external adapter. Preserve a provider-neutral interface for the other.

Do not require GitHub or Google Drive for basic Gummy OS use.

## Gummy Box adapter contract

Every adapter supports:

- connect/disconnect;
- initialize Box manifest and paths;
- list pending Work Orders;
- read one Work Order;
- atomically claim/update status where provider permits;
- write Return;
- write artifact;
- write Receipt reference/content;
- archive terminal Work Order;
- queue/retry disconnected writes;
- expose provider revision/file IDs and hashes.

Provider credentials remain outside model context and are scoped to the selected Box.

## Glopper Inbox

Implement a Glopper Inbox view accessible from:

- Glopper Panel;
- an optional Work Orders candy in the Gummy Bar.

Show:

- issuer/model/provider disclosure;
- target Actor;
- goal;
- source refs;
- requested capabilities;
- required locality/native status;
- privacy classification;
- cost ceiling;
- risk and expiry;
- acceptance checks;
- Task Lease conflict;
- status.

Human actions:

```text
APPROVE
REVISE
REJECT
HOLD
```

## Validation flow

Before approval:

1. validate JSON/schema;
2. verify Box and target identity;
3. label all source refs as resolved, unavailable, or local-required;
4. detect expired orders;
5. detect active conflicting Task Leases;
6. calculate requested risk/locality boundary;
7. show unsupported capabilities honestly;
8. keep Work Order as untrusted data.

## Approval and execution

On approval:

1. choose eligible Glopper executor;
2. create exclusive Task Lease unless parallel scopes are explicit;
3. create bounded Capability Grants;
4. move/update Work Order to claimed/running;
5. execute;
6. write terminal Return;
7. write artifacts and Receipts;
8. release/complete lease;
9. archive or await Human acceptance.

## Disconnected behavior

- Web-only work may continue when Native Glopper is unavailable.
- Native-required work remains queued with a clear reason.
- Native Glopper may execute locally cached orders offline.
- Returns queue until provider reconnection.
- No executor takeover occurs without lease expiry or Human approval.

## First proof

Use `examples/project-brief.work-order.json` as the initial shape.

Acceptance journey:

1. Onboarding creates Local Gummy Box.
2. Import or simulate a frontier-authored Work Order into `inbox/`.
3. Glopper Inbox validates and displays it.
4. Human approves.
5. `agent:glopper-web` claims an exclusive Task Lease.
6. Existing source-to-result flow executes.
7. Work Return, result artifact, and Receipt appear in the Box.
8. Reload preserves the complete state.
9. Disconnect/reconnect queue behavior is demonstrated honestly.
10. A second conflicting executor cannot claim the same scope.

Then prove one external adapter—GitHub or Google Drive—without blocking the local acceptance journey.

## Required tests

- Box initialization;
- provider scoping;
- schema-valid Work Order;
- invalid/untrusted Work Order rejection;
- expired Work Order;
- unsupported/local-required Work Order;
- approve/revise/reject/hold;
- exclusive Task Lease claim;
- conflicting claim denial;
- Return/artifact/Receipt writeback;
- archive behavior;
- disconnected queue/retry;
- provider disconnect;
- no whole-account GitHub/Drive access;
- local Box works without external provider.

## Required Return additions

```text
Gummy Box ID
Provider type
Provider scope
Authoritative location
Adapter implemented
Glopper Inbox evidence
Example Work Order
Validation result
Approval decision
Task Lease
Work Return
Artifact refs
Receipt refs
Disconnected behavior
Unsupported/provider limitations
```

## Stop rules

Stop rather than improvise if:

- an adapter requires whole-account access;
- a frontier model's Work Order would become authority automatically;
- provider IDs/revisions cannot be preserved reliably;
- two executors could silently claim overlapping work;
- local-only Gummy OS would become dependent on an external provider;
- the adapter effort begins delaying the core standalone source-to-result proof.
