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

## Determinism

The required release adapter consumes checked-in fixtures and produces the same
ordered state transitions for the same fixture. Live adapters are optional
capabilities behind separate verification and cannot replace this release path.
