# Managed Runtime Compatibility Record

Verified on 2026-07-28 against official Google Cloud documentation for Vertex AI
Agent Engine and related quota documentation.

Official sources:

- https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview
- https://cloud.google.com/vertex-ai/generative-ai/docs/quotas
- https://cloud.google.com/vertex-ai/generative-ai/pricing

## Provider-neutral boundary

A managed environment may deploy, scale, observe, pause, and recover execution.
It does not become the authority for Gummy identity, Production meaning,
acceptance, publication, or canonical Project state.

```text
Gummy Work Order
  -> Runtime Binding
  -> Provider Adapter
  -> Managed execution resource
  -> Return candidate
  -> Gummy Return
  -> Gummy Receipt
  -> Human acceptance
```

The provider adapter must preserve:

- Gummy-issued Actor, Agent, Production, Work Order, Lease, Mold, and Grant IDs;
- explicit external resource and continuation handles;
- Gummy-owned hard budget ceilings;
- a Gummy Box checkpoint sufficient for provider-independent recovery;
- separation of provider telemetry from Receipt evidence;
- fail-closed behavior when authority, budget, identity, or canonical state is
  missing.

## Google provider profile

Official documentation verifies that Agent Engine provides managed runtime,
sessions, observability, IAM integration, and security controls whose availability
varies by feature and region. It also documents quotas and usage-based pricing.
Those capabilities make a future adapter plausible, not automatically releasable.

The deterministic Google profile is therefore:

| Gate | Status |
| --- | --- |
| Official managed runtime documentation | verified |
| Official quota documentation | verified |
| Provider-neutral contract | verified deterministically |
| Final SDK/API choice | not selected |
| Production credentials | not verified |
| Recovery under provider loss | deterministic proof only |
| Cost ceiling enforcement | Gummy-side deterministic proof only |
| Privacy and retention configuration | not verified for a live project |
| Live adapter | disabled |

Provider sessions and memory may assist execution continuity. They must never be
the only copy of accepted Project state.
