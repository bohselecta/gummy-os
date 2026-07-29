# Phase 17A Runtime Identity and Memory Rollback — 2026-07-29

**Applies to:** Issue #44 additive foundation and later bounded integration
**Current provider resources:** none
**Current credentials:** none
**Current live adapter:** disabled

## Foundation rollback

The foundation has no data migration and no runtime or UI integration. Its
rollback unit is the additive docs/contracts commit:

- remove the seven new schemas;
- remove the two deterministic fixtures;
- remove the Phase 17A support/test module;
- remove the dated docs and evidence records;
- remove their additive entries from repository validation.

Existing `gummy.runtime-binding/v1`, MCP/managed-runtime fixtures, runtime
implementation, local data and Issue #43 files remain untouched.

Rollback must use a normal revert commit after publication. Do not rewrite
shared history.

## Future integration kill switches

Before any live proof, the integration must provide independent controls:

1. live provider adapter disabled by default;
2. provider profile disconnected;
3. Runtime Binding revision revoked;
4. Authority Lease revoked/expired;
5. Grant revoked/expired;
6. memory projection ingestion disabled;
7. Human-input continuation denied;
8. local budget hard stop set to zero;
9. cooperative cancellation requested;
10. provider terminal state confirmed separately.

No single provider API response is sufficient to declare rollback complete.

## Ordered live rollback

If a future Repository Steward proof must stop:

1. stop new Gummy dispatch and continuation;
2. freeze the Work Order in a Human-visible non-accepting state;
3. write a final safe Gummy Box checkpoint;
4. revoke Runtime Binding, Lease and Grant;
5. set the local budget ceiling to consumed cost;
6. request provider cancellation;
7. keep status `cancellation-requested` or
   `cancellation-acknowledged` until terminal state is observed;
8. revoke the provider principal and provider policies;
9. delete/disable the runtime resource;
10. disable memory ingestion and delete provider scope projections;
11. retain Gummy derivation/source hashes and provider evidence required for
    incident review;
12. mark result candidates non-accepting;
13. restore only from the latest valid Gummy Box checkpoint;
14. run product and security verification.

## Data disposition

| Data | Rollback handling |
| --- | --- |
| existing Gummy Runtime Binding | preserve |
| additive binding extension | revoke and retain as evidence, or remove only if never dispatched |
| canonical Gummy Box state | preserve |
| operational-memory provenance | retain under Gummy policy |
| provider memory projection | delete after evidence/retention gate |
| provider sessions/checkpoints | delete after Gummy checkpoint verification |
| provider logs/traces | retain hashes/references required for evidence; then apply retention policy |
| result candidate | retain as rejected/aborted evidence or delete under Human policy; never auto-accept |
| Return/Receipt | never silently delete; corrective Receipt/reversal record if needed |
| provider credentials | revoke and confirm unusable |

## Rollback verification

Rollback passes only when:

- no live provider dispatch is possible;
- the provider principal can no longer authenticate;
- Lease and Grant checks deny continuation;
- provider memory cannot be retrieved through the revoked scope;
- no provider process is reported running;
- cancellation acknowledgement is not mistaken for termination;
- canonical state equals the latest accepted Gummy version;
- existing local records, backups, imports and quarantine behavior still pass;
- provider telemetry did not create Return, Receipt or acceptance;
- complete incident and cost evidence is retained.

## Recovery

Recovery requires a new Runtime Binding revision, a valid Lease and Grant,
reviewed budget, exact Return anchor, current canonical version and explicit
Human decision. A stale provider handle, prior credential or surviving memory
projection cannot reactivate authority.

If provider-neutral recovery is possible, use the latest Gummy-owned checkpoint.
Otherwise leave the Work Order stopped and ask the Human how to proceed.

## Current rollback proof

The deterministic tests prove revocation, expiry, checkpoint requirements,
cancellation separation, failover, budget stop and non-accepting completion.
Real Google principal revocation, resource deletion, regional data deletion and
billing closure remain `NOT CLAIMED` because no live resources were provisioned.
