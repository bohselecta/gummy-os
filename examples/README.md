# Gummy OS Protocol Examples

## Current standalone examples

- `hayden.actor.json` — persistent WebOS Actor at `@hayden`
- `glopper-web.agent.json` — distinct first-party web Agent executor
- `hayden.mold.json` — permissioned operating contract connecting Human, Actor, and Glopper Web
- `hayden.master-control.json` — placement, approval, assignment, sync, and revocation authority
- `hayden.gummy-box.json` — user-owned provider-backed asynchronous handoff space
- `project-brief.work-order.json` — frontier-model-authored proposal for bounded work
- `project-brief.task-lease.json` — exclusive bounded ownership of one task by Glopper Web
- `project-brief.work-return.json` — structured terminal Return written back to the Box
- `welcome.gummy.json` — source Gummy owned by the Actor
- `builders.bowl.json` — shared Bowl
- `welcome-created-by.link.json` — explicit relationship
- `welcome.grab.json` — Grab record
- `welcome-copy.gummy.json` — independent result Gummy
- `welcome-copy-grab-of.link.json` — provenance Link

```text
frontier model
→ Work Order
→ Gummy Box
→ Glopper Inbox
→ Human approval
→ Task Lease + Grant
→ agent:glopper-web
→ Work Return + artifacts + Receipts
→ Gummy Box
```

A Work Order is a proposal, not authority.

The Task Lease prevents Web, Cloud, Native, or Phone Glopper executors from silently taking overlapping ownership of the same authoritative work.

The Grab set remains:

```text
source Gummy
→ Grab record
→ result Gummy
→ grab-of Link
```

The source remains unchanged.

## Visual naming

The Gummy Bar's candy icons are presentation only. These examples define underlying protocol objects, not a `candy` schema.

## Legacy inputs

Files such as `hayden.snack.json` remain migration inputs. Old personal-broker, Z, Zeke, Snack, Drop, Fork, and ad hoc handoff-folder identities must migrate only where the mapping is deterministic and traceable.
