# Phase 17B External-Influence Rollback — 2026-07-30

**Applies to:** Memory Admission Boundary and Observer Plane deterministic pass
**Storage migration:** none
**Provider resources:** none
**Credentials:** none
**Live adapter:** none

## Rollback unit

This pass is additive. A normal revert removes:

- five Phase 17B JSON Schemas;
- `src/core/external-influence-resilience.js`;
- the Phase 17B deterministic fixture, domain test and browser observer
  benchmark;
- the dated plan, architecture, threat and evidence records;
- Phase 17B entries in repository validation and architecture doctrine.

Do not rewrite shared history. Do not delete Phase 17A records, existing Runtime
Bindings, operational-memory v1 records, Returns, Receipts or v1 release
evidence.

## Data disposition

No Local Gummy Box schema version or stored object was changed. There is no user
data to migrate backward.

If these contracts are later persisted:

| Record | Rollback handling |
| --- | --- |
| Runtime note | retain or delete under ephemeral runtime policy |
| Memory Candidate | retain as evidence; never promote during rollback |
| Admission Decision | retain as Human-governed evidence |
| Admitted Operational Memory | revoke/invalidate; preserve Candidate and decision linkage |
| Execution Observation | retain hashes and references as Receipt evidence |
| Return Reconciliation | retain; do not rewrite its historical state |
| Receipt | retain; issue a corrective Receipt if later evidence changes |
| provider projection | revoke/delete only after Gummy evidence is preserved |

## Incident rollback

1. disable new memory admission;
2. freeze the suspected compromise timestamp;
3. revoke affected worker Runtime Bindings, Leases and Grants;
4. disable affected endpoints;
5. preserve Candidate, decision and observation evidence;
6. reconstruct only pre-compromise admitted operational memory;
7. keep suspect result candidates unaccepted;
8. require a new worker Lease/Grant/binding before recovery;
9. keep Observer authority separate;
10. reconcile against the original Work Order and current canonical version;
11. rotate provider credentials and delete projections when live resources
    exist;
12. verify no endpoint or provider cache can restore revoked authority.

## Rollback verification

Rollback passes when:

- existing v1 and Phase 17A suites still pass;
- no new schema is required to open existing local data;
- no provider dispatch, credential or network endpoint exists;
- canonical state is unchanged;
- rejected Memory Candidates never become operational or canonical memory;
- historical Returns and Receipts remain truthful.

This repository-only pass can be fully reverted without data loss. Real
provider credential revocation, projection deletion and process termination
remain NOT CLAIMED because no such resources were created.
