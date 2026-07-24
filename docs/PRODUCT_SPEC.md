# Gummy Product Specification

## Product statement

Gummy is a browser-delivered personal AI computer where familiar desktop objects, social relationships, and enterprise software all participate in one provider-neutral capability protocol.

## Personas

- **Personal user** — one understandable place for files, chats, projects, apps, services, people, and agents.
- **Creator or developer** — forkable environment, portable identity, shareable artifacts, model/runtime choice.
- **Software vendor** — complicated application safely operable by authorized agents.
- **Enterprise administrator** — identity, policy, model control, credential custody, runtime governance, audit.
- **Auditor** — evidence of what was requested, authorized, accessed, changed, and verified.

## Core loops

```text
Personal:   open Gummy → find object → ask companion → approve scope → result → receipt
Social:     create Snack → enter Bowl → publish Drop → fork/respond → inspect lineage
Vendor:     package app → declare capabilities → verify workflows → publish signed Pack
Enterprise: approve Pack/model/runtime → request workflow → policy gate → result + audit
```

## Applications

### Gummy Browser

Internal `gummy://` routes, native chat, safe external frame mode, external-tab fallback, and governed browser capsules later.

### My Files / Object Space

Local and synchronized objects, project membership, provenance, versions, drag-to-agent, audience controls, and OPFS persistence in production.

### Snack Bar

Person or agent identity, shape, colors, flavor, public/private field separation, keys, identity proofs, export/import, and compatibility profile.

### Snack Graph

People and agents, follows and trust links, Bowls, Drops, invitations, forks, graph inspection, abuse controls, and federation later.

### Enterprise Habitat

Organization overview, roles, policy packs, Application Pack registry, brokers, runtime pools, receipt ledger, deployment, and regions.

## Acceptance criteria for 0.1 scaffold

- Opens with `npm run dev` and no dependency installation.
- Desktop remains responsive without a model or runtime.
- Browser opens native pages and constructs a sandboxed external frame.
- Files drag to the companion.
- Medium-risk delegation requests confirmation.
- Demo chat is transparent and non-networked.
- Snack appearance persists locally.
- User can create a Bowl, publish a Drop, follow a Snack, and fork a Drop.
- Enterprise policy changes and Pack verification create receipts.
- `npm run verify` passes.

## Out of scope for 0.1

Production authentication, remote multi-user delivery, encrypted sync, inference billing, production connectors, executable capsules, cryptographic signing, moderation operations, billing, and marketplace transactions.
