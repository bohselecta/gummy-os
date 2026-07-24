# Security Policy

Gummy is currently an architectural prototype and has not received a production security audit. Do not use this scaffold to process secrets, financial transactions, regulated data, or untrusted executable workloads.

## Reporting a vulnerability

Report suspected vulnerabilities privately to the repository owner rather than opening a public issue. Include:

- affected commit or version;
- reproduction steps;
- the expected and observed security boundary;
- likely impact;
- any proposed mitigation.

## High-risk areas

Changes in these areas require explicit security review:

- iframe sandbox flags and cross-origin messaging;
- model adapters and prompt/context assembly;
- connectors, OAuth tokens, and account authorization;
- file byte persistence, OPFS, IndexedDB, or host file handles;
- runtime capsules, Wasm imports, Linux compatibility, and networking;
- capability grants, approval policy, and receipt integrity;
- application-pack signing and update channels;
- service workers, offline caches, and origin isolation headers.

See [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) for the intended trust boundaries.
