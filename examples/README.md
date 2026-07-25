# Gummy OS Protocol Examples

## Corrected architecture examples

- `hayden.actor.json` — persistent web-openable Actor at `@hayden`
- `personal-broker.agent.json` — distinct executable Agent
- `hayden.mold.json` — permissioned operating contract connecting Human, Actor, and Agent
- `hayden.master-control.json` — local placement, sync, approval, and revocation authority
- `welcome.gummy.json` — source Gummy owned by the Actor
- `builders.bowl.json` — shared Bowl
- `welcome-created-by.link.json` — explicit relationship
- `welcome.grab.json` — Grab record
- `welcome-copy.gummy.json` — independent result Gummy
- `welcome-copy-grab-of.link.json` — provenance Link

The central separation is:

```text
Human authority
→ Master Control
→ Actor in Gummy OS
↔ Agent in a governed runtime
through a Mold, Grant, and protocol route
```

The Grab example is a separate lineage set:

```text
source Gummy
→ Grab record
→ result Gummy
→ grab-of Link
```

The source remains unchanged.

## Legacy Protocol 0.1 examples

Files such as `hayden.snack.json` remain migration inputs. They are not current architecture examples.

Cursor must migrate them deterministically without deleting legacy evidence before parity is verified.
