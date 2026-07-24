# Gummy Protocol 0.1

## Objective

Protocol Zero defines portable objects for identity, sharing, software operation, authority, enterprise policy, and evidence. It is intentionally provider-neutral and runtime-neutral.

## Artifact families

| Schema | Purpose |
| --- | --- |
| `gummy.snack/v0` | Portable person or agent identity and visual presence. |
| `gummy.graph-object/v0` | Bowl, Drop, Link, project, artifact, conversation, or application object. |
| `gummy.app-pack/v0` | Vendor application contract for agent operation. |
| `gummy.capability-grant/v0` | Temporary authority for one bounded action and resource. |
| `gummy.action-receipt/v0` | Evidence of request, authority, resources, and outcome. |
| `gummy.organization/v0` | Enterprise identity, deployment, brokers, registries, and runtime pools. |
| `gummy.policy-pack/v0` | Versioned organization or domain policy rules. |

Schemas live in `schemas/`. Examples live in `examples/`.

## Stable identifiers

```text
snack:hayden
bowl:gummy-builders
drop:01J...
pack:publishing-workbench:1.2.0
grant:01J...
receipt:01J...
org:gummy-labs
policy-pack:baseline-enterprise:0.1
```

Production deployments may use UUID, DID, content-addressed, or organization-scoped strategies as long as identity remains stable and collision-resistant.

## Snack contract

A Snack document separates visual identity, profile metadata, discovery endpoints, cryptographic or organizational identity proofs, companion/model preferences, and supported protocol versions.

Visual fields are unsigned presentation unless covered by a verified identity proof.

## Graph object contract

Every shared graph object declares stable identity, kind, owner, audience/visibility, times, provenance, fork lineage, license or usage terms, required capabilities, and signatures when transported across trust domains.

## Application Pack contract

A Pack defines vendor and application identity, compatible versions, runtime requirements, typed capabilities, side effects and risk, workflow recipes, semantic interface map, operating documentation, policy defaults, verification suite, recovery, rollback, signatures, and revocation status.

A Pack is broader than a tool API. It is the authorized operating relationship between an application and an agent.

## Capability semantics

A grant is explicit, resource-bound, action-bound, time-bound, revocable, attributable, and auditable.

The broker may derive a grant from personal policy, direct human approval, organization policy, or a combination. A grant cannot exceed the issuing authority's own permission.

## Receipt semantics

Receipts are append-only evidence records. A receipt may reference additional encrypted or access-controlled trace material, but the user-readable summary must stand on its own.

Receipts can record denied and failed actions, not only success.

## Versioning

- Schema versions are explicit in `schema` values.
- Additive fields are allowed when readers ignore unknown fields.
- Breaking semantic changes require a new protocol version.
- Application Packs declare application and protocol compatibility ranges.
- Federation peers publish supported versions and downgrade policy.

## Transport

Protocol Zero does not mandate one transport. Objects may move through local import/export, HTTPS APIs, WebSocket or event streams, content-addressed storage, enterprise message buses, signed static documents, or future federated Gummy endpoints.

Transport does not change authority. A received object is data until local policy accepts its requested capabilities or relationships.
