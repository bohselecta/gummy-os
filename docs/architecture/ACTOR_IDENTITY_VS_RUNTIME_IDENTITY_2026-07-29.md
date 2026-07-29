# Actor Identity vs Runtime Identity — 2026-07-29

**Status:** Phase 17A additive foundation
**Controlling issue:** GitHub Issue #44
**Foundation base:** `a6ab3451720a279cc3b1281ad994058629355de0`
**Live execution:** disabled
**Runtime/UI integration:** blocked until the exact founder-accepted Issue #43 merge commit exists

## Doctrine

> **Agent Identity identifies the executing worker. Actor Identity identifies the enduring Human-owned social and creative principal.**

The Human remains the highest authority. An Actor is the enduring Human-owned
principal through which social identity, creative identity, Production
participation, contribution and public presence are expressed. An Agent is a
replaceable worker. A Runtime Binding is a bounded technical attachment. A
provider runtime principal is a revocable credential-bearing identity beneath
that binding.

No runtime, model, provider registry, workload identity or provider session may
present itself as the Human or Actor.

## Identity hierarchy

```text
Human
└── owns / sponsors
    Actor
    └── authorizes under a Production context
        Agent
        └── receives a bounded Work Order, Lease, Mold and Grant
            Runtime Binding
            └── attaches to
                Provider Runtime Principal
                └── authenticates a tool or service action
```

| Identity | Meaning | Stable across | May authorize |
| --- | --- | --- | --- |
| Human | natural person and ultimate authority | all system and provider changes | Actor representation, Master Control decisions, acceptance and publication |
| Actor | enduring Human-owned social and creative principal | model, framework, Agent, runtime, credential and provider replacement | an Agent within explicit Human-governed agreements |
| Agent | replaceable bounded worker for an Actor | runtime restart and principal rotation when the binding remains valid | only what its Work Order, Lease, Mold and Grant permit |
| Runtime Binding | one revisioned deployment/continuation attachment | provider telemetry and client disconnect | nothing beyond the authority already referenced |
| Provider Runtime Principal | provider-specific workload identity | no promised stability; it is expected to rotate | only provider permissions that are also inside the active Gummy authority boundary |

## Additive binding contract

`schemas/actor-agent-runtime-binding.schema.json` defines
`gummy.actor-agent-runtime-binding/v1`. It is an extension of
`gummy.runtime-binding/v1`, not a competing runtime architecture.

The extension binds:

- Human owner, Actor, Agent and Production;
- Work Order, Authority Lease, Mold and Grant;
- revisioned Runtime Binding and provider resource;
- provider runtime principal and attestation;
- provider policy references and operation classifications;
- exact operational-memory scope;
- Gummy Box Return anchor and observed canonical-state version;
- Receipt evidence policy and required Human acceptance;
- locality, region, protocol versions and provider feature truth;
- creation, expiry and revocation.

The `receiptPolicy` requires provider evidence and exact memory revisions while
stating that Gummy compiles the Receipt. `acceptanceRequired` is always true.
The provider principal is separately visible and revocable.

## Delegation and attribution

Every execution event must support this trace:

```text
Human delegator
→ Actor
→ Agent
→ Work Order
→ Lease / Grant
→ Runtime Binding revision
→ Provider Runtime Principal
→ tool / service action
```

An event that cannot support the complete trace fails closed. Provider logs may
be part of the trace evidence, but cannot fill in a missing Gummy delegation.

Logs and Human-facing evidence must label the identities independently:

- “Owned by” refers to the Human;
- “Actor” refers to the enduring principal;
- “Worker” or “Agent” refers to the executing Gummy Agent;
- “Runtime identity” refers to the provider principal;
- “Connection” or “runtime” refers to infrastructure, never a person.

## Lifecycle rules

### Principal rotation

A runtime principal may rotate while the Actor, Agent, Work Order, Production
and Return anchor remain unchanged. The next binding revision names the
superseded binding. The prior binding is revoked and both attestations remain
available as evidence.

### Provider failover

A provider outage may lead to a new provider-neutral binding revision only from
a valid Gummy-owned checkpoint. The Work Order and Return anchor remain
unchanged. Failover does not renew a Lease, Grant or budget.

### Agent replacement

An Agent may be replaced under an explicit binding revision without changing
the Actor or Human owner. The replacement Agent remains bounded by the same or a
newly approved Work Order, Lease, Mold and Grant. Provider registration alone
cannot create the replacement.

### Revocation and expiry

The earliest of Lease expiry, Grant expiry, Runtime Binding expiry, explicit
revocation or budget stop ends continuation authority. A provider’s ability to
keep a process alive for seven days does not create seven days of ambient
Gummy authority.

### Return and acceptance

Runtime continuation is not Return. Provider completion creates a result
candidate. It does not create a Gummy Return, Receipt, Human acceptance,
canonical-state mutation or publication decision.

## Deterministic proof

`fixtures/runtime-conformance/phase17a-runtime-identity-memory-foundation.json`
contains four successive bindings:

1. the initial Google-profiled, live-disabled binding;
2. a rotated provider principal for the same Agent;
3. deterministic provider failover preserving the Work Order and Return anchor;
4. a replacement Agent preserving the Human-owned Actor.

`tests/phase17a-foundation.test.mjs` proves the delegation chain and every
succession rule without provider credentials or network execution.

## Non-goals for this branch

- no live Google or MCP adapter;
- no credentials, cloud resource or provider-memory provisioning;
- no Composer, Connections & runtimes, Command Center or Master Control edits;
- no execution button in Composer;
- no replacement of existing Runtime Binding implementation;
- no claim that Issue #36 or Phase 17 is complete.

The later live Repository Steward proof must be recreated or rebased from the
exact founder-accepted Issue #43 merge commit.
