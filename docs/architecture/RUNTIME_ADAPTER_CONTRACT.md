# Runtime Adapter Contract

Runtime adapters translate a Gummy-owned Runtime Binding into execution. They do
not translate provider state into authority.

## Required interface

Every adapter must implement deterministic equivalents of:

```text
describe()       -> capabilities and provider profile
dispatch()       -> external execution handle
poll()           -> advisory execution state
provideInput()   -> response to an active, approved input request
checkpoint()     -> provider-neutral continuation material
restore()        -> execution from a Gummy-owned checkpoint
cancel()         -> requested stop result
```

Each operation receives the Runtime Binding and an idempotency key. Side effects
must be attributable to the Actor, Agent, Production, Work Order, Lease, Mold,
Grant, and approved budget in that binding.

## Fail-closed preconditions

An adapter must reject dispatch or continuation when any of these are absent or
invalid:

- Human-to-Actor representation chain;
- Actor-to-Agent assignment;
- active Work Order;
- active Authority Lease;
- compatible Mold and Grant;
- approved Production Pool authorization;
- hard cost ceiling;
- Return anchor and acceptance policy;
- canonical Gummy Box checkpoint location.

Provider credentials, hooks, sessions, or task handles cannot satisfy these
preconditions by themselves.

## Output classification

Adapter outputs are classified as:

- `telemetry`: provider observations, cost estimates, traces, and status;
- `checkpoint`: provider-neutral continuation material;
- `return-candidate`: completed execution output awaiting Gummy Return creation;
- `fault`: timeout, provider loss, invalid state, budget stop, or cancellation.

No adapter may emit a Gummy Receipt, Human acceptance, or publication decision.

## Phase 17A additive identity and memory extension

`gummy.actor-agent-runtime-binding/v1` extends this contract without replacing
`gummy.runtime-binding/v1`. Before dispatch and every continuation, an adapter
must also verify:

- the Human owner, enduring Actor, replaceable Agent and provider runtime
  principal remain distinct;
- the principal attestation belongs to the exact Agent and binding revision;
- the Lease, Grant, Runtime Binding, Gummy wall time and budget remain valid;
- any operational memory is selected by exact ID and revision inside the bound
  Actor/Production scope;
- the provider region matches binding and memory policy;
- a provider checkpoint resolves to a Gummy Box checkpoint;
- the Return anchor and canonical-state version still match.

Long-running provider capacity never renews Gummy authority. Runtime principal
rotation, provider failover or Agent replacement creates a new binding revision.
Provider completion remains `return-candidate`; canonical drift changes that
state to `stale-return-anchor` or `reconciliation-required`.

Provider telemetry is packaged as
`gummy.provider-evidence-bundle/v1`. The bundle is Receipt input. Gummy combines
it with the Work Order, Lease, Grant, Production Pool authorization, Return and
Human decisions; the adapter cannot compile the Receipt.

## Determinism

The required release adapter consumes checked-in fixtures and produces the same
ordered state transitions for the same fixture. Live adapters are optional
capabilities behind separate verification and cannot replace this release path.
