# Gummy OS Enterprise Framework

## Product definition

Gummy OS Enterprise is a governed software habitat where organizations can permit approved Actors and models to operate Gummies, connected systems, and third-party applications under enforceable policy.

It is not a separate desktop. It is the same Gummy OS protocol with organization identity, Actor roles, policy overlays, registries, runtime pools, and audit infrastructure.

## Object model

Enterprise uses the same canonical language as Personal Gummy OS:

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

Organizations do not replace these objects. They add policy, verified identity, role, deployment, retention, and audit constraints.

## Commercial wedge

A software vendor and an AI provider often face the same integration problem: the vendor has complicated software and domain knowledge; the model can reason but lacks reliable authority, operating instructions, and a safe execution environment.

Gummy OS provides the meeting layer:

1. The vendor packages the application and its agent-operating contract.
2. The organization approves Application Pack versions, Actor classes, capabilities, models, and runtime classes.
3. A user Actor requests work through the familiar Gummy OS environment.
4. The capability broker issues task-scoped authority to an acting Actor.
5. The Actor operates the application through the highest-reliability interface available.
6. The system verifies the result Gummy, returns artifacts, and records Action Receipts.

## Enterprise components

### Organization Control Plane

Tenant identity, verified domains, human and non-human Actors, roles and groups, passkey and OIDC/SAML federation, service Actors, delegated agent Actors, approved Molds, data regions, retention, legal hold, and organization-wide policy packs.

### Actor and Mold Registry

The organization may require:

- verified Actor class;
- sponsoring human or organization Actor;
- approved Mold and disclosure;
- identity proof;
- role and capability ceiling;
- key rotation;
- license or character-rights proof where relevant;
- revocation status.

A Mold is never sufficient authority by itself.

### Model Broker

Routes tasks based on approved providers, Actor class, task risk, data classification, region, context size, cost ceiling, latency target, local/private model availability, and contractual restrictions.

Provider credentials never enter browser bundles or ordinary model context.

### Connector Broker

Owns long-lived external credentials and offers typed bounded actions. It performs OAuth and credential custody, token rotation, resource scoping, field filtering, outbound data policy, rate limiting, just-in-time Grants, revocation, and connector Receipts.

### Application Pack Registry

Stores approved and signed Application Packs by vendor, application, version, runtime, trust status, and compatible protocol version.

Registry states:

- submitted;
- scanned;
- tested;
- organization-reviewed;
- verified;
- deprecated;
- revoked.

A Pack version cannot silently change after approval.

### Policy Engine

Evaluates a proposed action against:

- acting Actor;
- sponsoring Actor;
- Mold used;
- organization role;
- model/provider;
- application and Pack version;
- capability;
- source and destination Gummies;
- Bowl and audience;
- data classification;
- runtime;
- geography;
- session;
- risk;
- prior approvals;
- cost.

Effects include allow, deny, require human approval, require second approver, redact, route to private model, constrain runtime, prevent Grab, limit Bowl publication, and require enhanced Receipt detail.

### Runtime Pool Manager

Organizations define approved browser-origin applications, Wasm process capsules, Linux compatibility capsules, cloud containers or VMs, GPU pools, and air-gapped or sovereign environments.

Each pool declares network policy, image provenance, resource ceilings, snapshot behavior, storage mounts, and destruction guarantees.

### Audit and Receipt Ledger

Supports user-readable Receipts, cryptographic signing, append-only storage, organization retention, SIEM export, incident timelines, rollback references, redacted role views, and evidence bundles for vendor support.

A Receipt identifies which Actor acted, which Mold represented it, which Grants applied, which source Gummies were accessed, and which result Gummies or Links were produced.

## Roles

- **Owner** — organization and commercial control.
- **Administrator** — Actor identity, policy, registries, and deployment.
- **Operator** — runtime and connector operations.
- **Pack Reviewer** — application contract verification.
- **Auditor** — read-only evidence and policy visibility.
- **Member** — ordinary Gummy OS use under organization policy.
- **Agent Actor** — non-human Actor with explicit sponsor and capability ceiling.
- **Service Actor** — application or infrastructure Actor with bounded machine authority.

## Deployment modes

- **Hosted** — shared Gummy OS control plane with tenant isolation.
- **Dedicated Cloud** — dedicated data plane and optional brokers in the customer's cloud.
- **Self-hosted** — organization operates control and data planes with supported releases.
- **Sovereign** — offline or highly restricted deployment with private registries and models.

## Enterprise acceptance proof

1. Create an organization.
2. Bind human, agent, and service Actors to roles.
3. Verify the Molds those Actors may use.
4. Install a signed Application Pack.
5. Configure a model broker and runtime pool.
6. Apply a policy requiring approval for a high-risk capability.
7. Ask an agent Actor to perform a vendor workflow.
8. Approve the consequential step.
9. Verify the output Gummy.
10. Export an Action Receipt bundle.
11. Revoke the Pack, Actor, Mold, or Grant and prove future execution is blocked.

## Revenue surfaces

Commercial Application Pack SDK and tooling, vendor integration engagements, compatibility certification, enterprise subscriptions, dedicated and sovereign deployments, compliance and audit modules, support, OEM editions, and registry services where appropriate.

Personal Gummy OS does not need to become an application pyramid or advertising identity graph for this model to work.

## Current boundary

Enterprise remains a specified future lane. The active build is Personal Gummy OS: one real file-to-agent-to-artifact loop with durable local state and truthful Receipts.
