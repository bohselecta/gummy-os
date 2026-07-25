# Gummy OS Security Model

Read `PLATFORM_PLAYGROUND_SECURITY.md` for the broader posture.

## Thesis

Gummy OS preserves existing host/enterprise protections and adds containment, explicit authority, executor ownership, revocation, and evidence.

It separates:

- Human authority;
- persistent Actor;
- executable Agent;
- Mold operating contract;
- Master Control;
- Task Lease;
- Capability Grant;
- Action Receipt.

No prompt, candy icon, character, sign-in, model preference, device presence, or network connection creates authority.

## Upstream controls remain upstream

Gummy OS does not replace secure boot, kernel protections, disk encryption, EDR, MDM, SIEM, firewalls, identity providers, passkeys, biometrics, hardware keys, sandboxing, package trust, updates, or physical security.

## Protected assets

- Human approval and identity state;
- Actor state, memory, `@address`, and Gummies;
- Agent configuration, capability ceilings, leases, and private memory;
- Mold permissions/proofs/licenses;
- Master Control policy;
- IndexedDB/OPFS state;
- quarantined content;
- provider/connector credentials;
- Bridges and native destinations;
- Receipts, hashes, and provenance.

## Threats

Prompt injection, malicious Agent/Pack, Agent/Actor impersonation, Glopper-character spoofing, Mold abuse, hidden operator identity, concurrent executor collision, stale lease takeover, ambient sync, unauthorized replication, provider leakage, browser escape, unsafe native promotion, malicious downloads, forged Receipts, provenance stripping, policy downgrade, and supply-chain compromise.

## Boundaries

### Human

Controls Master Control, Agent assignment, Molds, Task Leases, approvals, and revocation.

### Actor

Owns persistent WebOS state but gains no host authority merely by being open.

### Agent

Executes work only under Agent identity, capability ceiling, Task Lease, Mold, Master Control, and Grants.

Shared Glopper character does not merge Web/Cloud/Native/Phone executor identities.

### Gummy Bar

Candy icons are presentation. Clicking, pinning, dragging, or visually selecting candy creates no authority by itself.

### Mold

Binds Actor to allowed Human/Agent operators, capabilities, data scopes, runtime/locality, sync, disclosure, expiry, and revocation.

Appearance, handle, mascot, celebrity likeness, or character styling is never sufficient proof.

### Master Control

Decides authoritative location, Agent, Mold, active Task Lease, data flow, sync, approval, native promotion, portable-profile updates, revocation, and locks.

### Task Lease

Prevents multiple executors from silently taking overlapping ownership of authoritative work.

A Task Lease specifies Agent, Actor, scope, authoritative location, mode, base state, capabilities, expected Return, issue/expiry, and status.

Takeover or parallel work requires explicit policy/Human approval.

### Capability Grant

Binds Human, Actor, Agent/operator, Mold, Master Control, Task Lease, action, resource, scope, locality, risk, approval, issue/expiry, and revocation.

### Credential mediation

Long-lived credentials remain in trusted brokers/native stores. Agents receive bounded handles/results.

## Quarantine and promotion

Untrusted content begins as a quarantined Gummy.

```text
quarantined Gummy
→ inspect / scan / classify
→ Human or policy decision
→ bounded Grant + explicit destination
→ Bridge
→ Receipt
```

Before promotion, it has no native process, shell, package, device, or broad filesystem authority.

## Disposable environments

A workspace/session/capsule may start from trusted state, isolate storage/network, retain only accepted Gummies/Receipts, and burn/reset after use.

Evidence must prove what was removed and preserved.

## Synchronization

- authoritative location visible;
- data classes allowlisted;
- direction/frequency explicit;
- private local memory separate from approved portable profile;
- conflicts preserve evidence;
- revocation stops future flow;
- sync never expands Agent authority.

## Adaptation privacy

```text
private local memory
approved portable profile
current task context
```

Private adaptation does not synchronize automatically. Glopper proposes portable changes; Human approves them.

## Recursive creation

Every child Actor/Agent receives independent identity, provenance, authority relationship, capability ceiling, Mold/Master Control binding, Task Lease behavior, disclosure, and revocation.

No Agent clones its Grants into a child. No composition silently merges private state.

## Native bridge

Native integration begins only after standalone proof.

The Bridge is deny-by-default and capability-specific. It never exposes a generic shell/filesystem/device endpoint merely for convenience.

A future `agent:glopper-native` may operate scoped local directories, IDEs, processes, local models, or devices only under accepted work orders, leases, Grants, and Receipts.

## Security research

The platform may support authorized defensive testing through isolated Actors/Agents, explicit target scope, disposable environments, separate analysis/remediation/verification roles, and replayable evidence.

It never invents third-party authorization.

## Receipts

Consequential actions record Human, Actor/`@address`, actual Agent executor, Glopper character family where relevant, Mold, Master Control, Task Lease, runtime/locality, Grants, source/result Gummies, Links/Grabs, cost, outcome, denial/failure/revocation, boundary crossings, and hashes.

## Risk classes

- **Low:** local navigation and read-only contained operations.
- **Medium:** private transform/result creation and reversible settings.
- **High:** external transfer, publish, delete/install, Agent assignment/takeover, sync enablement, native promotion, official/licensed Mold changes.
- **Critical:** purchase, legal submission, privileged administration, credentials, regulated/safety-critical execution.

## Current non-goals

The first build does not claim production Human identity, public verified `@addresses`, encrypted cross-device sync, hardened native containment, real native Glopper, trusted execution, verified third-party Packs, or perfect browser security.

It proves explicit boundaries, smaller blast radius, standalone Glopper Web execution, Task Lease ownership, quarantine, revocation, burn/reset, and truthful evidence.
