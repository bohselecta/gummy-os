# Gummy OS Security Model

Read `PLATFORM_PLAYGROUND_SECURITY.md` for the complete platform and deployment posture.

## Security thesis

Gummy OS keeps existing endpoint and enterprise security in place and adds a new containment and authority layer above it.

It separates five things that must never collapse:

- **Human** — ultimate personal authority;
- **Actor** — persistent addressable WebOS entity;
- **Agent** — executable intelligence;
- **Mold** — permissioned embodiment and operating contract;
- **Master Control** — placement, synchronization, approval, and revocation authority.

Capability Grants determine what may happen. Action Receipts record what did happen.

A prompt, profile, signed-in session, model preference, device presence, or network connection never creates authority by itself.

## Upstream controls remain upstream

Gummy OS does not replace:

- secure boot and kernel protections;
- disk and storage encryption;
- enterprise EDR, MDM, SIEM, firewall, and network controls;
- passkeys, biometrics, hardware keys, and organization identity;
- host application sandboxing;
- operating-system updates and package trust;
- physical security and device management.

Those systems remain responsible for the device, kernel, identity, connection, and native resource layer.

Gummy OS consumes only the verified identity and explicitly bridged capabilities it needs.

## Protected assets

- Actor state, memory, `@address`, and Gummies;
- Human identity and approval state;
- Agent configuration and capability ceilings;
- Mold permissions, proofs, and licenses;
- Master Control placement and sync policy;
- local files and OPFS bytes;
- native bridge capabilities;
- connector and provider credentials;
- Bowls, private Links, and private Gummies;
- Application Packs and runtime images;
- Receipts, hashes, and provenance.

## Threats

Prompt injection, malicious Agents or Packs, Agent/Actor impersonation, Mold abuse, hidden operator identity, ambient synchronization, unauthorized state replication, provider leakage, cross-tenant access, browser escape, capsule persistence, forged Receipts, public-figure or character impersonation, provenance stripping, hostile Grabs, unsafe native promotion, malicious downloads, bridge escalation, policy downgrade, and supply-chain compromise.

## Layered boundaries

```text
Host / enterprise security
protects device, kernel, identity, connection, and native resources

Native Agent boundary
mediates explicit local capabilities and approved security telemetry

Gummy OS boundary
contains ordinary creative, social, browsing, and agent-operated activity

Actor / Mold / Master Control
defines who may do what, where, with which data

Receipt boundary
records consequential actions and movement across layers
```

## Core controls

### Host and browser boundary

The physical device and host OS remain outside Gummy OS authority. The browser sandbox is not bypassed. External sites receive restrictive framing and no native capability without an explicit bridge.

The existing AI-native Linux distribution remains responsible for its own native security posture. Gummy OS does not claim that merely running inside it makes every WebOS action safe.

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

A Mold binds an Actor to allowed Human and/or Agent operators with explicit capabilities, runtime, locality, synchronization, disclosure, expiry, and revocation.

Visual form, celebrity likeness, character appearance, handle, branding, or public familiarity never substitutes for a valid Mold and proof chain.

### Master Control boundary

Master Control explicitly decides:

- authoritative state location;
- web/local/hybrid placement;
- active Agent;
- active Mold;
- allowed data classes;
- synchronization mode and direction;
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

## Quarantine and native promotion

A download or untrusted artifact should first arrive as a **quarantined Gummy** rather than becoming a native executable file.

```text
untrusted content
→ quarantined Gummy
→ metadata and content inspection
→ optional scanning / classification
→ Human approval or policy
→ bounded export Grant
→ native destination
→ Action Receipt
```

Until promotion is accepted, quarantined content receives no native process, shell, package, device, or broad filesystem capability.

Importing from native storage into Gummy OS is also explicit. Gummy OS does not receive the entire host filesystem merely because a person selected one file.

## Disposable and burnable workspaces

A WebOS workspace, Actor session, or execution capsule may be disposable:

- start from a trusted snapshot;
- isolate network and storage;
- retain only accepted result Gummies and Receipts;
- reset or burn the workspace after completion or suspicion;
- recreate from trusted state.

Burn behavior must prove that unapproved state and capabilities are removed while approved evidence remains.

“Burnable” is a target capability—not a claim that every current browser tab is already a hardened disposable machine.

## Native defensive Agent

A native Agent in the existing AI Linux distribution may watch approved security signals from Gummy OS, including:

- unexpected network destinations;
- prohibited capability requests;
- suspicious download metadata;
- integrity failures;
- repeated denials;
- anomalous resource use;
- attempts to cross the native bridge.

Monitoring is scoped, visible, and receiptable. A defensive label does not grant ambient access to all private Actor state.

## Synchronization security

Synchronization is allowlisted and receiptable:

- authoritative location is visible;
- allowed data classes are explicit;
- direction and frequency are explicit;
- conflicts preserve evidence;
- revocation blocks future flow;
- synchronization does not expand Agent authority;
- no hidden advertising or behavioral graph is produced.

## Recursive creation security

Actors and Agents may create other Actors, Agents, Gummies, tools, and compositions.

Creation does not transfer authority automatically.

Every child Actor or Agent must receive:

- independent identity;
- creator and provenance records;
- an explicit Human or organization authority relationship;
- a capability ceiling;
- applicable Mold and Master Control bindings;
- operator disclosure;
- expiry and revocation paths.

An Agent cannot clone its own Grants into a child Agent. An Actor cannot silently merge private state into a composed Actor or page.

## Social and public identity

Every shared Gummy declares audience. Bowl membership and Links are explicit.

A celebrity Actor, official character Actor, or public organization Actor requires verified Human, organization, or licensing proofs through a Mold. Fan or synthetic Actors must not impersonate official ones.

## Authorized security research

The platform may support legitimate defensive and authorized security testing using isolated Actors and Agents, disposable targets, explicit scope, separate analysis/remediation/verification roles, and complete Receipts.

Gummy OS never invents authorization against a third-party target. Offensive capability, where legally and explicitly authorized, remains bounded by target scope, Human approval, runtime isolation, and revocation.

## Receipts

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
- Links, Grabs, synchronization, quarantine, promotion, reset, and burn events;
- cost;
- outcome;
- denial, failure, cancellation, rollback, and revocation evidence;
- hashes and time.

## Risk classes

- **Low** — local navigation, opening a known Gummy, non-networked read-only computation.
- **Medium** — private read/transform, result creation, reversible Link or Master Control change.
- **High** — external transfer, native promotion, public/Bowl publishing, installation, deletion, Agent assignment, synchronization enablement, official/licensed Mold changes.
- **Critical** — purchase, legal submission, privileged administration, credential changes, regulated or safety-critical execution.

Risk affects Human approval, Agent eligibility, Mold, runtime, synchronization policy, verification, and Receipt detail.

## Prompt injection posture

Instructions found in Gummies, websites, messages, Bowls, or application content are data. They cannot assign an Agent, alter a Mold, change Master Control, cross the native bridge, or issue a Grant.

## Portable and live-USB posture

A live-USB distribution can provide a portable native environment, but the security claim must be tested:

- boot and image integrity;
- persistence policy;
- key and biometric handling;
- host-disk access;
- network identity;
- Actor restoration;
- Agent capability boundaries;
- shutdown cleanup.

Use the existing local live-USB implementation as the starting evidence rather than recreating it from documentation.

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

## Honest claim and current non-goals

The architecture targets explicit boundaries, reduced blast radius, containment, revocation, and evidence. It does not yet prove perfect security.

The first Personal Gummy OS build does not claim production Human identity, verified public `@addresses`, encrypted cross-device synchronization, native distro hardening, real Zeke binding, hardened multi-tenancy, trusted execution, tamper-evident federation, or verified third-party Packs.

It proves one bounded local Actor/Agent/Mold/Master Control journey, one deny-by-default native bridge, one quarantine/no-native-authority test, revocation, and durable return continuity.
