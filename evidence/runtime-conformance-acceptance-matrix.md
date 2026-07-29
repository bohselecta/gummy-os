# Runtime Conformance Acceptance Matrix

| Gate | Deterministic evidence | Release status |
| --- | --- | --- |
| Canonical objects remain distinct | schema contracts and replay assertions | pass |
| Runtime Binding preserves authority chain | `runtime-binding.schema.json` | pass |
| MCP task is transport only | MCP schema and completion replay | pass |
| Human input routes through Master Control | vertical fixture | pass |
| Budget stops before unauthorized spend | budget fault fixture | pass |
| Continuation requires explicit approval | replay harness | pass |
| Provider state is not canonical | managed-runtime recovery fixture | pass |
| Telemetry is not Receipt | replay assertions | pass |
| Completion is not Return or acceptance | replay assertions | pass |
| Acceptance is not publication | explicit release assertion | pass |
| Command Center remains projection | adapter contract and fixture | pass |
| Reload restores complete Gummy state | vertical fixture | pass |
| MCP final specification | official source still identified RC/draft | hold |
| Live MCP SDK/host/server | not verified | hold |
| Google credentials and live recovery | not verified | hold |
| Google cost/privacy/provider guarantees | not verified for a live project | hold |

The deterministic adapters are the required release path. All live-provider rows
must pass independently before a live adapter can be enabled.
