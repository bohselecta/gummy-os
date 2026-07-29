# Google Agent Platform Provider Profile — 2026-07-29

**Contract:** `gummy.provider-profile.google-agent-platform/v1`
**Architecture position:** provider profile beneath Gummy Runtime Binding
**Credentials:** not provisioned
**Live execution:** disabled
**First future proof:** read-only Repository Steward, after Issue #43 acceptance

## Provider-neutral position

Google Agent Platform is one possible execution, identity, memory, gateway,
registry and observability provider. It does not replace:

- the Human or Actor;
- a Gummy Agent, Mold, Work Order, Lease or Grant;
- Production or Production Pool authority;
- Gummy Box canonical state;
- Return, Receipt or Human acceptance;
- Place Registry or Gummy’s provider-neutral runtime registry.

The machine-readable profile is
`fixtures/runtime-conformance/google-agent-platform-profile-2026-07-29.json`.
Its schema is
`schemas/provider-profile-google-agent-platform.schema.json`.

## Source chronology

The controlling issue records a **reported July 29, 2026 platform
consolidation date**. That report is preserved as chronology, not treated as a
claim that every component launched or became GA on July 29.

The official Google release notes checked on 2026-07-29 show staggered dates:

| Date | Official record | Gummy interpretation |
| --- | --- | --- |
| 2026-04-22 | Initial Gemini Enterprise Agent Platform transition/release section; Agent Runtime naming, operations up to seven days, custom containers, Memory Bank event streaming/revisions and Agent Identity for Agent Runtime GA are listed | establishes provider capabilities; creates no Gummy authority |
| 2026-06-02 | Abuse-monitoring and zero-data-retention documentation update | not the official initial platform release in the current release notes |
| 2026-06-17 | Memory Bank and Sessions global/multi-regional endpoints GA; CMEK constraint for global endpoint recorded | locality and encryption must be checked together |
| 2026-06-18 | Agent Gateway, Agent Observability and Agent Registry GA; the new `v1beta1` Agent Identity API is separately listed as Preview during migration | API maturity does not demote Agent Identity for Agent Runtime from GA |
| 2026-07-08 | Memory Bank `IngestEvents` GA, including revision configuration | ingestion remains disabled for the foundation |
| 2026-07-15 | Memory Profiles GA | structured profiles remain derived operational memory |
| 2026-07-29 | Official release-note entry is Feedback service Preview | the reported wider consolidation date is preserved separately; no single official platform-wide GA claim is inferred |

The date correction matters: the current official release note labels the
initial platform release **April 22**, while Issue #44’s background names June
2. This record preserves the issue’s reported July 29 consolidation chronology
and uses the official component dates for provider gating.

No evidence of copying, plagiarism or influence is asserted.

## Deployment profile

The documented managed SDK and local/source-object flow is Python. Google’s
custom-container runtime contract is HTTP-based and can be implemented by
another language. The profile therefore records the current limitation
precisely:

- managed Agent Platform SDK: Python;
- source/local-object agent deployment path: Python;
- custom container: language-neutral when the container implements the
  documented HTTP runtime contract;
- first Gummy proof: no provider deployment on this branch.

The profile permits source, local object, Dockerfile, container image and
connected-repository methods as provider facts, but `not-provisioned` is the
only state used by the foundation fixture.

## Identity mapping

Google Agent Identity is a provider runtime principal. It is recorded in the
Gummy binding with:

- principal string and principal type;
- Agent Identity for Agent Runtime feature support and GA product availability;
- separate Agent Identity API maturity and version;
- attestation issuer, subject, fingerprint and observation time;
- runtime resource and deployment revision;
- provider policy references;
- revocation evidence.

The provider documentation ties an Agent Identity to a runtime agent resource.
Gummy still binds that principal to its own Agent and Actor. Rotation,
redeployment or deletion of the provider principal does not change the Actor.

The foundation records Agent Identity for Agent Runtime as `supported` and
`ga`. Separately, it records the Agent Identity API as `preview` at `v1beta1`.
The principal remains `not-provisioned`; no service account, token or cloud role
exists in this branch.

## Memory Bank mapping

The profile records:

- provider resource and Gummy scope key;
- Actor/Production region;
- TTL;
- revisions enabled;
- ingestion mode;
- `providerIsCanonical: false`.

Google’s documented per-scope isolation, TTL and immutable revisions are useful
provider mechanisms. Gummy independently stores derivation, source hashes,
scope policy and exact revision evidence. Provider memory cannot authorize,
accept or publish.

Live `IngestEvents` is fail-closed until scoped credentials, event data classes,
regional processing, deletion, revocation and cost behavior are verified.

## Gateway, Registry and Observability

| Provider component | Gummy mapping | Boundary |
| --- | --- | --- |
| Agent Gateway | provider policy reference under Connections & runtimes and Master Control evidence | supplements; never replaces a Lease, Grant or Human decision |
| Agent Registry | discoverable provider projection | never creates a Gummy Actor or Agent automatically |
| Agent Observability | traces, DAGs, logs and resource evidence | Receipt input; never the Receipt or acceptance |

Operation classes remain Gummy-visible: `read-only`, `destructive`,
`idempotent`, `open-world`, `financial`, `publication`,
`identity-sensitive` and `privacy-sensitive`. Any mismatch fails closed.

## Long-running work

The provider maximum is recorded as `604800` seconds. Gummy’s Work Order policy
may be shorter. The earliest Lease, Grant, Runtime Binding, budget, cancellation
or Gummy wall-time boundary wins.

Seven-day provider support never creates ambient authority. A paused runtime
does not renew authority. Checkpoints are continuation state, not Returns.
Cancellation acknowledgement is not termination. Provider completion creates a
result candidate.

## Feature-state gates

| Feature | Foundation state | First-proof use |
| --- | --- | --- |
| long-running operations | supported contract, deterministic only | allowed after live gates |
| memory revisions | supported contract, deterministic only | exact revisions required |
| `IngestEvents` | supported, live-disabled | blocked pending memory/privacy gates |
| Agent Gateway | not independently connected | not required |
| Agent Registry | not independently connected | not required |
| Agent Observability | not independently connected | required before live acceptance |
| A2A | Preview/fail-closed | excluded |
| LlamaIndex integration | Preview/not independently verified | excluded |
| customized runtime-resource controls | Preview/not independently verified | excluded |

No provider feature is treated as stable merely because the umbrella platform
is described as GA.

## Data, cost and encryption gates

The foundation profile selects `us-central1` and rejects the global endpoint.
A future live proof must verify:

- source-data classification and allowed region;
- Memory Bank generation processing region;
- Sessions and Memory Bank locality;
- CMEK requirements and the documented global-endpoint constraint;
- provider log payload and retention;
- Agent Runtime, Agent Compute, Agent Memory, Agent Storage, Agent Gateway and
  Memory Bank infrastructure pricing from the official Gemini Enterprise Agent
  Platform pricing source;
- separate model/token pricing and billing/usage evidence when a generative
  model is used;
- a local Gummy hard stop before provider continuation;
- complete provider deletion and revocation behavior.

The deterministic fixture records zero credentials and live execution disabled.

## Revocation and deletion

Future shutdown order:

1. revoke the Gummy Runtime Binding, Lease and Grant;
2. stop continuation and request cooperative cancellation;
3. confirm provider terminal state;
4. revoke/delete the provider principal and runtime resource;
5. delete provider sessions and scoped memory projections after evidence
   retention requirements are met;
6. preserve Gummy-owned hashes, scope provenance, Return and Receipt records;
7. confirm no provider process retains authority.

Provider deletion does not erase accepted Gummy Box state.

## First future live proof

The Repository Steward proof is read-only and non-destructive. It may inspect a
bounded repository source package and return an audit candidate. It may not
write to GitHub, publish, move money, alter ownership or accept its own result.

It must stack on the exact founder-accepted Issue #43 merge commit and pass the
migration, threat, cost, locality, credential and rollback gates before any
provider resource is provisioned.

## Official sources

- [Gemini Enterprise Agent Platform release notes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes)
- [Agent Runtime](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime)
- [Agent Platform runtime contract](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/runtime-contract)
- [Use Agent Identity with Agent Runtime](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/agent-identity)
- [Agent Platform Memory Bank](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/memory-bank)
- [Memory revisions](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/memory-bank/revisions)
- [Gemini Enterprise Agent Platform pricing](https://cloud.google.com/products/gemini-enterprise-agent-platform/pricing)
- [Optional generative-model pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
