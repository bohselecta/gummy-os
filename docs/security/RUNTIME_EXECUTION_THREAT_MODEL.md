# Runtime Execution Threat Model

## Protected assets

- Human and Actor identity;
- Agent representation boundaries;
- Production Agreements and contribution meaning;
- Production Pool authorizations and hard ceilings;
- Leases, Molds, Grants, and Master Control decisions;
- canonical Gummy Box state;
- Returns, Receipts, acceptance, and Distribution Plans;
- provider credentials and continuation handles.

## Trust boundaries

| Boundary | Threat | Required control |
| --- | --- | --- |
| Gummy to adapter | forged authority | validate the complete Runtime Binding and fail closed |
| Adapter to MCP server | confused deputy | bind every call to Work Order, Lease, Grant, and idempotency key |
| MCP task handle | enumeration or theft | high-entropy handles, caller scoping, no task listing assumption |
| MCP input request | prompt or consent spoofing | route only through an active operation and Master Control |
| Managed provider | provider becomes canonical | persist provider-neutral checkpoints in Gummy Box |
| Provider telemetry | false Receipt inference | classify telemetry as advisory until a Gummy Receipt exists |
| Budget reporting | delayed or underreported cost | local hard stop before provider continuation |
| Retry and webhook | duplicate side effects | idempotency keys and monotonic event application |
| App surface | UI authority escalation | sandbox surface and route consent through Gummy |
| Publication | completion auto-releases work | separate acceptance and explicit release decisions |

## Deterministic fault catalogue

The conformance harness must cover:

- budget ceiling reached before completion;
- Human input requested without prior authority;
- duplicate completion delivery;
- out-of-order provider events;
- provider timeout and loss;
- stale or mismatched continuation handle;
- cancellation race;
- telemetry claiming success without Return or Receipt;
- recovery from the latest Gummy-owned checkpoint;
- release attempted before acceptance or Distribution Plan approval.

## Incident behavior

On uncertainty the runtime stops, checkpoints what is safe, and projects the
decision into Command Center. Only Master Control may authorize changed scope,
budget, continuation, acceptance, or release. Recovery never promotes provider
state over the latest accepted Gummy revision.
