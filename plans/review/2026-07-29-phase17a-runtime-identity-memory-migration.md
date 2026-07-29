# Phase 17A Runtime Identity and Memory Migration — 2026-07-29

**Status:** foundation ready for review; runtime/UI migration not started
**Foundation branch:** `codex/phase17a-runtime-identity-memory-foundation`
**Foundation base:** `a6ab3451720a279cc3b1281ad994058629355de0`
**Required integration base:** exact founder-accepted Issue #43 merge commit
**Live Google/MCP execution:** disabled

## Objective

Extend the existing provider-neutral Runtime Binding and deterministic
MCP/managed-runtime foundation with identity, operational-memory,
long-running-work and provider-evidence contracts. Preserve every existing
route, schema, local record, migration, backup, import, quarantine boundary,
authority object and release evidence.

This branch is additive and intentionally avoids active Calm Workspace UI and
runtime implementation files.

## Foundation inventory

The foundation adds:

- `gummy.actor-agent-runtime-binding/v1`;
- `gummy.operational-memory/v1`;
- `gummy.memory-derivation/v1`;
- `gummy.memory-scope-policy/v1`;
- `gummy.long-running-work-policy/v1`;
- `gummy.provider-evidence-bundle/v1`;
- `gummy.provider-profile.google-agent-platform/v1`;
- live-disabled provider and conformance fixtures;
- deterministic conformance support and tests;
- architecture, provider, threat, migration, rollback, chronology and
  acceptance records.

It does not change `src/core/runtime-binding.js`, application UI, storage,
database version or existing canonical records.

## Compatibility mapping

| Existing `gummy.runtime-binding/v1` field | Additive extension field | Migration rule |
| --- | --- | --- |
| `bindingId` | `runtimeBindingId` | copy exact ID; never synthesize a new identity silently |
| `actorId` | `actorId` | exact match required |
| `agentId` | `agentId` | exact match required |
| `productionId` | `productionId` | exact match required |
| `workOrderId` | `workOrderId` | exact match required |
| `authorityLeaseId` | `authorityLeaseId` | exact match required |
| `moldId` | `moldId` | exact match required |
| `grantId` | `grantId` | exact match required |
| `returnAnchor` | `returnAnchor` | exact match required |
| `provider` | `runtimeProvider` | normalize through adapter profile; preserve original |
| `status` | binding lifecycle dates/status projection | retain source status and add revision/expiry/revocation evidence |
| `canonicalProjectCopy` | Gummy Box Return anchor/provenance | Gummy Box remains canonical |
| `budget` | `longRunningWorkPolicy.budgetCeiling` | copy approved ceiling and consumed amount; never increase automatically |

New fields with no trustworthy existing source remain unresolved and block live
dispatch. They must not receive invented defaults for a real execution.

## Migration sequence

### Stage 0 — foundation review

1. Review doctrine and machine-readable schemas.
2. Run strict schema compilation and all deterministic proofs.
3. Confirm live flags and credentials remain false/absent.
4. Confirm the diff contains no Issue #43 UI/runtime file.
5. Keep the PR draft and do not merge or promote it as a live integration.

### Stage 1 — establish accepted Calm Workspace base

1. Hayden founder-accepts Issue #43.
2. Record the exact Issue #43 merge commit.
3. Create the runtime/UI integration branch from that exact commit.
4. Rebase or cherry-pick only this foundation’s additive commit(s).
5. Resolve conflicts in favor of accepted Issue #43 product behavior.
6. Rerun the complete product-preservation and browser suites before
   integration edits.

### Stage 2 — read-only data projection

1. Add schema-aware readers for existing Runtime Bindings.
2. Project extension readiness without modifying stored records.
3. Show unresolved identity, scope, locality, cost and revocation fields as
   blocked.
4. Preserve every unknown provider field in an extension envelope or original
   record.
5. Do not create provider resources.

### Stage 3 — explicit additive record creation

1. Create a new extension record only when the Human approves the Work Order
   through Master Control.
2. Bind exact Human, Actor, Agent, Production, Lease, Mold, Grant, Return anchor
   and canonical version.
3. Create memory scope before any memory projection.
4. Create the long-running policy before dispatch.
5. Persist both original Runtime Binding and new extension.
6. Write a migration Receipt identifying source and destination IDs.

### Stage 4 — provider profile and dry run

1. Select the Google profile beneath the provider-neutral adapter.
2. Verify region, encryption, credentials, cost source and deletion.
3. Validate provider feature stages at runtime; fail closed on Preview or
   unverified capabilities outside the proof.
4. Run a no-dispatch connection test.
5. Confirm revocation deletes provider access without deleting Gummy state.

### Stage 5 — bounded live Repository Steward

Only after every gate passes:

1. provision a dedicated least-privilege runtime principal;
2. permit repository reads only;
3. forbid destructive GitHub writes, publication, financial and ownership
   operations;
4. demonstrate disconnect, checkpoint, Human-input pause and cancellation;
5. demonstrate exact memory revision evidence;
6. advance canonical state and require reconciliation;
7. create result candidate, Return and Gummy Receipt separately;
8. let the Human accept, reject or request revision;
9. retain accepted output in Gummy Box;
10. revoke/delete the provider resources and verify cleanup.

## Local-record preservation

The migration is copy-on-write:

- never rewrite an existing Runtime Binding in place;
- never convert provider memory into canonical Actor/Production state;
- never delete a Work Order, Return, Receipt or release record;
- preserve unknown fields;
- quarantine invalid extensions rather than modifying their sources;
- include source IDs, schema versions and hashes in migration evidence;
- maintain import/export compatibility with records that know only
  `gummy.runtime-binding/v1`.

Older readers continue to use the existing binding. New readers may join the
extension by `runtimeBindingId`. Failure to resolve the extension returns to the
old provider-neutral deterministic path; it does not downgrade security.

## Migration tests

Before live dispatch, tests must prove:

- exact existing IDs survive projection;
- no canonical record count decreases;
- unknown fields round-trip;
- Actor stays stable when Agent/runtime changes;
- scope cannot cross Actor or Production;
- memory revision, TTL, invalidation and provenance survive reload;
- Lease, Grant, binding and budget expiry survive reload;
- Return anchor and canonical version survive provider failover;
- provider evidence remains Receipt input;
- duplicate Return/Receipt creation is idempotently denied;
- rollback removes only additive projections.

## Go/no-go gates

Go requires:

- exact Issue #43 accepted merge base;
- complete deterministic suite;
- complete product/browser/accessibility suite;
- reviewed threat model;
- scoped credentials;
- bounded cost and Production Pool authorization;
- region/data/encryption approval;
- provider deletion and revocation rehearsal;
- live-disabled-by-default feature control;
- Human approval for the one proof.

Any missing gate is `BLOCKED` or `NOT CLAIMED`, never “best effort.”

## Current migration result

No user data, schema version, local record, provider resource or live credential
was migrated on this branch. The additive contracts are ready for review. The
runtime/UI migration must start later from the exact founder-accepted Issue #43
merge commit.
