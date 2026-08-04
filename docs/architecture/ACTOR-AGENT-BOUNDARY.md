# Actor–Agent Boundary

**Status:** Architecture primer matching shipped Gummy OS behavior  
**Law:** Actor and Agent never collapse. Human authority remains above both.

## Two sides

```text
GUMMY OS / WEB                         EXECUTION
Actor                                  Agent
addressable, openable, persistent      executable, replaceable, leased
@address + state + Gummies             tools, models, devices, runtimes
```

Master Control decides placement, synchronization, permission, approval, and revocation.

## Actor

A persistent addressable entity: person, specialist, service, organization, or other presence.

Examples in the Demo Production cast:

- `@Hayden` — Human sponsor (human-live)
- `@Bob` — AI-represented contributor (Agent may operate only under Mold/Grant)
- `@ImageHoss`, `@VideoBoss`, `@Meshmallow` — specialist Actors
- Glopper companion identity — gold-dominant action companion; not the same object as Gummy (purple guide)

Actors may be opened from Actor Home. Opening an Actor does not start a Job.

## Agent

An executable process that may operate an Actor only with active Mold, Task Lease, Capability Grant, and Human approval where required.

Examples:

- Glopper web Agent — local guidance; cloud execution only when configured
- Representative Agent for an AI-represented Actor (bounded by Mold/Grant)
- **Demo Worker** — labeled deterministic demonstration executor for the stranger Demo Production (`worker:demo`). Not a live provider.

## Presence is not authority

Actor presence states (human-live, ai-represented, static, offline) describe availability. They do not grant spend, publish, or execution rights.

## Production rule

```text
Open / configure specialist Actor  →  no creative Job
Make Production                    →  bind eligible Agents / Demo Worker under authority
Human Accept                       →  canonical result advancement
```

Production-specific choices do not silently become Actor memory.

## Related

- `docs/ACTOR_AGENT_MASTER_CONTROL.md`
- `docs/ACTOR_HOME_PRODUCTION_UNDERGROUND_CENTER.md`
- `docs/architecture/ACTOR_IDENTITY_VS_RUNTIME_IDENTITY_2026-07-29.md`
