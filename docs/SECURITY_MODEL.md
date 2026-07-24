# Gummy Security Model

## Security thesis

An AI-operated computer cannot rely on a system prompt saying the model should be careful. Gummy separates reasoning from authority and uses browser isolation, task capabilities, policy, runtime boundaries, and receipts as overlapping controls.

## Protected assets

Personal files and history, connector credentials, private conversations and memory, Snack identity keys, Bowl membership and private Drops, organization policy and audit data, vendor software and Application Packs, model prompts and outputs, runtime images, and generated artifacts.

## Threats

Prompt injection, malicious Packs, over-broad connectors, provider leakage, cross-tenant access, browser-origin escape attempts, capsule persistence, visual identity impersonation, social abuse, forged receipts, policy downgrade, and supply-chain compromise.

## Core controls

### Browser boundary

The host computer remains outside Gummy. The browser sandbox is not bypassed. External sites are framed only under their own policy and receive a restrictive iframe sandbox.

### Capability broker

Models, applications, connectors, and graph actions receive no ambient universal authority. High-risk actions require human or organization approval.

### Credential mediation

Long-lived connector and provider secrets remain in trusted brokers. The model receives results or action handles, not raw credentials.

### Runtime isolation

Every capsule declares network, filesystem, process, memory, CPU, lifetime, and mount policy. Task artifacts cross explicit import/export boundaries.

### Pack verification

Application Packs are versioned, signed, scanned, tested, reviewed, and revocable. The runtime checks the approved hash or signature before execution.

### Social consent

Every shared object declares audience. Invitations, follows, agent joins, and delegation edges are reversible. Public discovery cannot expose private profile state.

### Identity separation

Snack visual design is never authentication. Verified identity uses passkeys, organization identity, or cryptographic signatures. Agent Snacks disclose non-human status and operator.

### Receipts

Consequential actions record actor, sponsor, application, Pack version, model/provider class, grants, resources, outcome, and rollback reference. Enterprise deployments sign and retain receipts according to policy.

## Risk classes

- **Low** — read-only local navigation, opening a known object, non-networked computation.
- **Medium** — reading private data for transformation, creating graph links, changing reversible settings.
- **High** — sending data externally, publishing, deleting, installing software, modifying enterprise records.
- **Critical** — purchasing, legal submission, privileged administration, credential changes, regulated or safety-critical execution.

Risk affects model eligibility, runtime, approvals, verification, and receipt detail.

## Prompt injection posture

Untrusted content is labeled and cannot grant itself authority. Instructions found in files or websites are data unless the user or policy explicitly elevates them into a task plan. Capabilities derive from the user's request and policy, never content alone.

## Security non-goals of the current scaffold

The browser-only demo does not claim cryptographic identity, encrypted sync, hardened multi-tenancy, trusted execution, secure credential custody, production sandboxing, tamper-evident receipts, or verified third-party Packs.
