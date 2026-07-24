# Gummy Enterprise Framework

## Product definition

Gummy Enterprise is a governed software habitat where organizations can permit approved models to operate files, connected systems, and third-party applications under enforceable policy.

It is not a separate desktop. It is the same Gummy protocol with organization identity, policy overlays, registries, runtime pools, and audit infrastructure.

## Commercial wedge

A software vendor and an AI provider often face the same integration problem: the vendor has complicated software and domain knowledge; the model can reason but lacks reliable authority, operating instructions, and a safe execution environment.

Gummy provides the meeting layer:

1. The vendor packages the application and its agent-operating contract.
2. The organization approves versions, capabilities, models, and runtime classes.
3. The user requests work through the familiar Gummy environment.
4. The capability broker issues task-scoped authority.
5. The agent operates the software through the highest-reliability interface available.
6. The system verifies the result, returns artifacts, and records Action Receipts.

## Enterprise components

### Organization Control Plane

Tenant identity, verified domains, roles and groups, passkey and OIDC/SAML federation, service identities, delegated agent identities, data regions, retention, legal hold, and organization-wide policy packs.

### Model Broker

Routes tasks based on approved providers, task risk, data classification, region, context size, cost ceiling, latency target, local/private model availability, and contractual restrictions.

Provider credentials never enter browser bundles or ordinary model context.

### Connector Broker

Owns long-lived external credentials and offers typed bounded actions. It performs OAuth and credential custody, token rotation, resource scoping, field filtering, outbound data policy, rate limiting, just-in-time grants, revocation, and connector receipts.

### Application Pack Registry

Stores approved and signed Application Packs by vendor, application, version, runtime, and trust status.

Registry states: submitted, scanned, tested, organization-reviewed, verified, deprecated, revoked.

A Pack version cannot silently change after approval.

### Policy Engine

Evaluates a proposed action against actor, human sponsor, organization role, model/provider, application and Pack version, capability, resource classification, audience, runtime, geography, session, risk, prior approvals, and cost.

Effects include allow, deny, require human approval, require second approver, redact, route to private model, constrain runtime, and require enhanced receipt detail.

### Runtime Pool Manager

Organizations define approved browser-origin applications, Wasm process capsules, Linux compatibility capsules, cloud containers or VMs, GPU pools, and air-gapped or sovereign environments.

Each pool declares network policy, image provenance, resource ceilings, snapshot behavior, storage mounts, and destruction guarantees.

### Audit and Receipt Ledger

Supports user-readable receipts, cryptographic signing, append-only storage, organization retention, SIEM export, incident timelines, rollback references, redacted role views, and evidence bundles for vendor support.

## Roles

- **Owner** — organization and commercial control.
- **Administrator** — identity, policy, registries, and deployment.
- **Operator** — runtime and connector operations.
- **Pack Reviewer** — application contract verification.
- **Auditor** — read-only evidence and policy visibility.
- **Member** — ordinary Gummy use under organization policy.
- **Agent Service Identity** — non-human actor with explicit sponsor and capability ceiling.

## Deployment modes

- **Hosted** — shared Gummy control plane with tenant isolation.
- **Dedicated Cloud** — dedicated data plane and optional brokers in the customer's cloud.
- **Self-hosted** — organization operates control and data planes with supported releases.
- **Sovereign** — offline or highly restricted deployment with private registries and models.

## Enterprise acceptance proof

1. Create an organization.
2. Bind identity and roles.
3. Install a signed Application Pack.
4. Configure a model broker and runtime pool.
5. Apply a policy requiring approval for a high-risk capability.
6. Ask an agent to perform a vendor workflow.
7. Approve the consequential step.
8. Verify the output.
9. Export an Action Receipt bundle.
10. Revoke the Pack or grant and prove future execution is blocked.

## Revenue surfaces

Commercial Application Pack SDK and tooling, vendor integration engagements, compatibility certification, enterprise subscriptions, dedicated and sovereign deployments, compliance and audit modules, support, OEM editions, and registry transaction services where appropriate.

Personal Gummy does not need to become an application pyramid or advertising network for this model to work.
