# MCP 2026-07-28 Compatibility Record

Verified on 2026-07-28 against the official Model Context Protocol sources.

## Verification result

The `2026-07-28` protocol is safe to target through deterministic conformance
adapters, but a live adapter is not a release capability yet.

At verification time:

- the official announcement still described `2026-07-28` as a locked release
  candidate whose final specification would publish on 2026-07-28;
- the official Tasks extension page was still marked `draft`;
- Tasks used the extension identifier `io.modelcontextprotocol/tasks`;
- Tasks were server-directed and exposed `tasks/get`, `tasks/update`, and
  `tasks/cancel`;
- protocol state was explicit and stateless, with application continuity carried
  through ordinary handles;
- MCP Apps were sandboxed server-rendered views, not authority owners;
- task identifiers could act as bearer handles and therefore required
  unguessability and caller scoping.

Official sources:

- https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/
- https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks
- https://apps.extensions.modelcontextprotocol.io/

## Gummy mapping

| MCP concept | Gummy interpretation |
| --- | --- |
| `tools/call` | Execution dispatch under an existing Work Order |
| task handle | External execution handle attached to a Runtime Binding |
| `working` | Execution active |
| `input_required` | Master Control decision required |
| `completed` | Return candidate available |
| MCP App | Bounded Actor App Surface |
| trace metadata | Advisory execution telemetry |

The following inequalities are release laws:

```text
MCP task != Production
MCP completion != Return
MCP telemetry != Receipt
MCP App consent != Gummy authority
MCP state != canonical Project state
```

## Supported deterministic profile

The release path supports:

- protocol version label `2026-07-28`;
- per-request capability declaration;
- `io.modelcontextprotocol/tasks`;
- explicit task and application state handles;
- `working`, `input_required`, `completed`, `failed`, and `cancelled`;
- deterministic polling, input, checkpoint, cancellation, and recovery;
- bounded MCP App descriptors with Gummy-owned consent routing.

## Live-adapter gate

A live MCP adapter remains disabled until all of the following are re-verified
against final official artifacts:

- final specification publication and changelog;
- Tier 1 SDK support for the final protocol and Tasks extension;
- host and server interoperability;
- credential storage and issuer validation;
- task recovery and cancellation guarantees;
- cost, privacy, retention, and data-location guarantees;
- rollback to the deterministic adapter without canonical state loss.

No live host, server, SDK, or credential is claimed by this checkpoint.
