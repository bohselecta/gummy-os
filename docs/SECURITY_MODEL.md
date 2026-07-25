# Gummy OS Security Model

## Security thesis

An AI-operated computer cannot rely on a system prompt saying the model should be careful. Gummy OS separates reasoning, representation, and authority:

- **Actor** is who acts;
- **Mold** is how that Actor is represented and verified;
- **Capability Grants** determine what the Actor may do;
- **Action Receipts** record what happened.

Browser isolation, task capabilities, policy, runtime boundaries, provenance, and Receipts are overlapping controls.

## Protected assets

Personal Gummies and history, connector credentials, private conversations and memory, Actor identity keys, Mold proofs, Bowl membership, private Gummies, organization policy and audit data, vendor software and Application Packs, model prompts and outputs, runtime images, and generated artifacts.

## Threats

Prompt injection, malicious Packs, over-broad connectors, provider leakage, cross-tenant access, browser-origin escape attempts, capsule persistence, Mold impersonation, hidden agent identity, social abuse, forged Receipts, provenance stripping, hostile Grabs, policy downgrade, and supply-chain compromise.

## Core controls

### Browser boundary

The host computer remains outside Gummy OS. The browser sandbox is not bypassed. External sites are framed only under their own policy and receive a restrictive iframe sandbox.

### Actor authority

Capability, ownership, delegation, and Receipt semantics bind to an Actor ID.

An Actor class must be disclosed when it changes how a person interprets the action. Agent, service, application, organization, and character Actors must not impersonate human Actors.

### Mold boundary

A Mold presents and verifies an Actor. A Mold may contain handles, appearance, public fields, proofs, and keys, but it cannot independently receive authority.

Visual shape, color, celebrity likeness, character styling, or a familiar handle is never sufficient authentication. Official status requires a validated identity, organization, or licensing proof bound to the Actor.

### Capability broker

Actors, models, applications, connectors, and relationship actions receive no ambient universal authority. Medium, high, and critical actions require policy or explicit human approval according to risk.

A grant is Actor-bound, action-bound, resource-bound, time-bound, revocable, and attributable.

### Credential mediation

Long-lived connector and provider secrets remain in trusted brokers. The model receives results or action handles, not raw credentials.

### Runtime isolation

Every capsule declares network, filesystem, process, memory, CPU, lifetime, and mount policy. Source and result Gummies cross explicit import/export boundaries.

### Application Pack verification

Application Packs are versioned, signed, scanned, tested, reviewed, and revocable. The runtime checks the approved hash or signature before execution.

### Social consent

Every shared Gummy declares audience. Bowl invitations, follows, agent joins, delegation Links, and Grabs are visible and reversible where possible.

A Grab must preserve source provenance, rights, attribution, source revision, and a `grab-of` Link. It cannot mutate or impersonate the source.

### Identity separation

Actor, Mold, provider, model, application, and organization are separate identities.

Examples:

- an agent Actor may use a Zeke Mold;
- a human Actor may use a public professional Mold and a private family Mold;
- a licensed character Actor may be operated by an authorized service Actor;
- the service Actor must still appear in the Receipt where it performed the actual action.

### Receipts

Consequential actions record:

- acting Actor;
- sponsoring Actor where applicable;
- Mold used;
- application and Pack version;
- model/provider class;
- Grants;
- source and result Gummies;
- Links or Grabs created;
- locality and network boundary;
- outcome;
- rollback reference;
- evidence hashes.

Enterprise deployments sign and retain Receipts according to policy.

## Risk classes

- **Low** — read-only local navigation, opening a known Gummy, non-networked computation.
- **Medium** — reading private data for transformation, creating Links, creating a result Gummy, changing reversible settings.
- **High** — sending data externally, publishing to a Bowl or public audience, deleting, installing software, modifying enterprise records, creating a licensed-character Mold.
- **Critical** — purchasing, legal submission, privileged administration, credential changes, regulated or safety-critical execution.

Risk affects Actor eligibility, model eligibility, runtime, approvals, verification, and Receipt detail.

## Prompt injection posture

Untrusted content is labeled and cannot grant itself authority. Instructions found in Gummies, files, websites, or Bowls are data unless the user or policy explicitly elevates them into a task plan.

Capabilities derive from the Actor's request and policy, never from content alone.

## Protocol 0.1 migration security

Migration from Snack/Drop/Fork terminology must not weaken identity or provenance:

- a Snack becomes an Actor and one or more Molds;
- authority references move to the Actor;
- visual and profile fields move to the Mold;
- Drop content and ownership move to a Gummy;
- Fork lineage becomes a Grab record and `grab-of` Link;
- legacy identifiers remain traceable;
- migration is idempotent and receiptable;
- old state is not deleted until parity is verified.

## Security non-goals of the current scaffold

The browser-only scaffold does not claim cryptographic Actor identity, encrypted sync, hardened multi-tenancy, trusted execution, secure credential custody, production sandboxing, tamper-evident Receipts, or verified third-party Packs.

The next Personal Gummy OS lane proves only one bounded real file-to-agent-to-artifact path. It does not authorize broad autonomous control of the host computer.
