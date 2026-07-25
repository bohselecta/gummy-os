# Gummy OS Security Model

## Security thesis

Gummy OS separates five things that must never collapse:

- **Human** — ultimate personal authority;
- **Actor** — persistent addressable web entity;
- **Agent** — executable intelligence;
- **Mold** — permissioned embodiment and operating contract;
- **Master Control** — placement, synchronization, approval, and revocation authority.

Capability Grants determine what may happen. Action Receipts record what did happen.

A prompt, profile, signed-in session, model preference, or network connection never creates authority by itself.

## Protected assets

- Actor state, memory, `@address`, and Gummies;
- Human identity and approval state;
- Agent configuration and capability ceilings;
- Mold permissions, proofs, and licenses;
- Master Control placement and sync policy;
- local files and OPFS bytes;
- connector and provider credentials;
- Bowls, private Links, and private Gummies;
- Application Packs and runtime images;
- Receipts, hashes, and provenance.

## Threats

Prompt injection, malicious Agents or Packs, Agent/Actor impersonation, Mold abuse, hidden operator identity, ambient synchronization, unauthorized state replication, provider leakage, cross-tenant access, browser escape, capsule persistence, forged Receipts, public-figure or character impersonation, provenance stripping, hostile Grabs, policy downgrade, and supply-chain compromise.

## Core controls

### Host and browser boundary

The physical device and host OS remain outside Gummy OS authority. The browser sandbox is not bypassed. External sites receive restrictive framing and no native capability without an explicit bridge.

### Human authority

A Human controls Master Control, approves consequential Grants, selects Molds, assigns Agents, and revokes access.

A Human may operate multiple Actors. Actor identity is not proof of the Human behind it.

### Actor boundary

An Actor owns state and provides a persistent web presence. It does not gain host authority merely because it is open on a device.

An `@address` identifies and routes to the Actor. It does not grant control.

### Agent boundary

An Agent executes work. It receives no authority from being selected as a companion or model.

Every Agent declares identity, runtime, provider/model class, locality, operator, capability ceiling, and status. Agent activity appears distinctly in Receipts.

### Mold boundary

A Mold binds an Actor to allowed Human and/or Agent operators with explicit capabilities, runtime, locality, sync, disclosure, expiry, and revocation.

Visual form, celebrity likeness, character appearance, handle, branding, or public familiarity never substitutes for a valid Mold and proof chain.

### Master Control boundary

Master Control explicitly decides:

- authoritative state location;
- web/local/hybrid placement;
- active Agent;
- active Mold;
- allowed data classes;
- sync mode and direction;
- approval rules;
- revocation and lock state.

A signed-in session or second device must not silently enable synchronization.

### Capability broker

A Grant binds Human authority, Actor, operator type and ID, Agent where applicable, Mold, Master Control, action, resource, scope, locality, risk, approval, issue/expiry, and revocation.

The Grant cannot exceed the Mold ceiling or Master Control policy.

### Credential mediation

Long-lived provider and connector secrets remain in trusted brokers or native stores. Agents receive bounded results or action handles, not raw credentials.

### Runtime isolation

Every runtime declares network, filesystem, process, memory, CPU, lifetime, and mount policy. Source and result Gummies cross explicit boundaries.

### Synchronization security

Synchronization is allowlisted and receiptable:

- authoritative location is visible;
- allowed data classes are explicit;
- direction and frequency are explicit;
- conflicts preserve evidence;
- revocation blocks future flow;
- sync does not expand Agent authority;
- no hidden advertising or behavioral graph is produced.

### Social and public identity

Every shared Gummy declares audience. Bowl membership and Links are explicit.

A celebrity Actor, official character Actor, or public organization Actor requires verified Human, organization, or licensing proofs through a Mold. Fan or synthetic Actors must not impersonate official ones.

### Receipts

Consequential actions record:

- Human sponsor;
- Actor and `@address`;
- operator type;
- Agent;
- Mold;
- Master Control;
- application and Pack;
- execution route and locality;
- Grants;
- source and result Gummies;
- Links, Grabs, and sync events;
- cost;
- outcome;
- denial, failure, cancellation, rollback, and revocation evidence;
- hashes and time.

## Risk classes

- **Low** — local navigation, opening a known Gummy, non-networked read-only computation.
- **Medium** — private read/transform, result creation, reversible Link or Master Control change.
- **High** — external transfer, public/Bowl publishing, installation, deletion, Agent assignment, synchronization enablement, official/licensed Mold changes.
- **Critical** — purchase, legal submission, privileged administration, credential changes, regulated or safety-critical execution.

Risk affects Human approval, Agent eligibility, Mold, runtime, sync policy, verification, and Receipt detail.

## Prompt injection posture

Instructions found in Gummies, websites, messages, Bowls, or application content are data. They cannot assign an Agent, alter a Mold, change Master Control, or issue a Grant.

## Migration security

```text
legacy Snack
→ Human authority + Actor + Mold

legacy companion/model
→ separate provisional Agent

legacy Drop/file
→ Gummy

legacy fork
→ Grab + grab-of Link
```

Migration is deterministic, idempotent, traceable, and non-destructive. Actor and Agent may never collapse into one record.

## Current non-goals

The first Personal Gummy OS build does not claim production Human identity, verified public `@addresses`, encrypted cross-device sync, native Glyphd OS security, real Zeke binding, hardened multi-tenancy, trusted execution, tamper-evident federation, or verified third-party Packs.

It proves one bounded local Actor/Agent/Mold/Master Control journey and preserves the correct future boundaries.
