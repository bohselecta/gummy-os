# Phase 17B External-Influence Resilience Threat Model — 2026-07-30

**Scope:** Memory Admission Boundary, endpoint authority, independent
observation, worker replacement and Return reconciliation
**Execution:** deterministic only
**Live provider execution:** NOT CLAIMED

## Protected assets

- Human authority and Actor-owned canonical state;
- Work Orders, Runtime Bindings, Authority Leases, Molds and Grants;
- admitted operational memory and its provenance;
- suspected-compromise recovery point;
- source, checkpoint, artifact and after-state hashes;
- Observer identity and evidence;
- Returns, Receipts and Human acceptance;
- provider credentials and runtime principals.

## Trust boundaries

| Boundary | Untrusted input | Required control |
| --- | --- | --- |
| Worker to runtime note | generated text | ephemeral only; no durable effect |
| Worker to Memory Candidate | future operational claim | exact Actor/Production/Work Order/Lease/binding, provenance, digest, scope, risk and attestation |
| Candidate to admitted memory | proposed durable context | explicit Human-governed Actor decision; exact candidate digest |
| Tool endpoint to capability | callable operation | endpoint capability set must be a subset of active Lease and Grant |
| Compromised runtime to recovery | later notes and provider cache | reconstruct from Gummy evidence and exclude all writes after the compromise point |
| Worker to progress report | self-narrated status | claim only |
| Observer to evidence | screenshots, filesystem, application and artifact observations | independent Agent/runtime/Lease; ordered hashes; no acceptance authority |
| Return to canonical state | completed worker claim | Work Order and canonical-version reconciliation, then separate Human acceptance |

## Threat catalogue

| Threat | Detection | Fail-closed result |
| --- | --- | --- |
| worker writes durable memory directly | endpoint exposes `memory.admit` or candidate claims durable write | deny endpoint/candidate |
| poisoned operational rule | critical external-influence claim from runtime-only evidence | Candidate remains proposed; explicit rejection/quarantine; no admitted memory |
| valid-looking poisoned provenance | exact hashes exist but source is compromised worker | risk remains visible; Human-governed decision still required |
| cross-Actor or cross-Production memory | candidate or proposed scope differs from binding | deny candidate |
| replayed runtime attestation | binding revision, principal or fingerprint differs | deny candidate |
| orchestration checks bypassed by endpoint | endpoint capability absent from Lease or Grant | deny endpoint |
| compromise discovered late | memory was accepted after compromise | reconstruction excludes it by write time |
| provider cache survives revocation | provider still returns later memory | Gummy reconstruction ignores non-admitted/after-cutoff memory |
| worker replacement changes objective | Actor, Work Order, Return anchor or canonical version differs | deny replacement |
| replacement reuses compromised Lease | binding/endpoint Lease mismatch or revoked Lease | deny dispatch |
| observer is the worker | Agent or Runtime Binding overlaps | reject observation |
| observer silently accepts result | acceptance status or authority flag changes | reject observation |
| worker claims completion without evidence | after-state digest or completion evidence missing | reconciliation required |
| worker claim differs from observed state | worker and Observer digests differ | reconciliation required |
| canonical state changes during execution | commissioned, observed and current versions differ | reconciliation required |
| memory mutation omitted from Receipt | Candidate has no listed decision/evidence | reconciliation required; Receipt incomplete |

## Incident response

1. stop new dispatch and memory admission;
2. record the suspected compromise point;
3. revoke the worker Runtime Binding, Lease and Grant;
4. preserve runtime notes and Memory Candidates as evidence;
5. reject or quarantine suspect Candidates;
6. reconstruct admitted operational memory from the last trusted point;
7. issue a new Lease, Grant and Runtime Binding for a replacement worker;
8. keep the Observer independently leased and active;
9. reconcile the replacement Return against the original Work Order and current
   canonical version;
10. create a Receipt listing every memory mutation and exclusion;
11. leave Human acceptance pending;
12. rotate/delete live credentials and provider projections when applicable.

## Invariants

- Agents may write runtime notes freely. They may only propose durable operational memory.
- No tool endpoint may possess more authority than the Lease enforced beneath it.
- The worker’s report is a claim. The Observer supplies evidence.
- Admitted operational memory is still non-authoritative.
- Observer evidence is not acceptance.
- Return reconciliation is not canonical mutation.
- A suspected compromise point can exclude every later memory write.
- A replacement worker does not replace the Human-owned Actor or objective.

## Limits

The deterministic proof does not establish actual provider credential rotation,
container hardening, network isolation, log completeness, video understanding
quality or real runtime termination. Those remain NOT CLAIMED.
