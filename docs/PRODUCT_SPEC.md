# Gummy OS Product Specification

## Product statement

Gummy OS is a browser-delivered personal AI computer where familiar desktop objects, replaceable intelligence, social relationships, and enterprise software participate in one provider-neutral capability protocol.

The active product priority is **Personal Gummy OS**: make one real file-to-agent-to-artifact task survive return visits before expanding the social, enterprise, federation, or runtime matrix.

## Canonical object language

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

See `docs/VOCABULARY.md` for normative definitions and Protocol 0.1 migration rules.

## Personas

- **Personal user** — one understandable place for files, conversations, projects, applications, services, people, agents, and results.
- **Creator or developer** — portable identity, user-owned Gummies, shareable artifacts, model/runtime choice, and independent compatible editions.
- **Software vendor** — complicated application safely operable by authorized Actors through an Application Pack.
- **Enterprise administrator** — Actor identity, policy, model control, credential custody, runtime governance, and audit.
- **Auditor** — evidence of which Actor requested, authorized, accessed, changed, produced, or verified something.

## Core loops

```text
Personal:   open Gummy OS → find/import Gummy → ask companion Actor → approve scope → result Gummy → Receipt
Social:     establish Actor + Mold → enter Bowl → share Gummy → create Link → Grab if allowed → inspect lineage
Vendor:     package app → declare capabilities → verify workflows → publish signed Pack
Enterprise: approve Actor/Pack/model/runtime → request workflow → policy gate → result Gummy + audit
```

## Applications and surfaces

### Gummy Browser

Internal `gummy://` routes, native chat, safe external-frame mode, external-tab fallback, and governed browser capsules later.

### My Files / Object Space

Local Gummies, project membership, provenance, versions, drag-to-agent, audience controls, and OPFS persistence in production.

### Mold editor

Presentation and verification for the current Actor: handle, public/private fields, shape and color, disclosure, proofs, keys, compatibility, export, and import. The final customer-facing label for this editor may be selected during implementation without changing the Mold object.

### Gummy OS Social Layer

Actors and Molds, Bowls, Gummies, Links, Grabs, invitations, provenance, audience, moderation, and federation later.

### Enterprise Habitat

Organization overview, Actor roles, policy packs, Application Pack registry, brokers, runtime pools, Receipt ledger, deployment, and regions.

## Personal Gummy OS acceptance criteria

The next implementation is accepted only when all of the following are proven:

1. Gummy OS opens as a usable browser-native desktop without a model running.
2. A person can import a real text or Markdown file as a Gummy.
3. The actual file bytes persist locally through IndexedDB/OPFS or an equally explicit local-first boundary.
4. The user can drag the source Gummy to the companion.
5. A real provider-neutral broker route performs one bounded transformation.
6. Provider credentials never enter browser JavaScript.
7. A medium-risk request asks for explicit read and create authority.
8. The source Gummy remains unchanged.
9. The result is written as a new Gummy with stable identity, provenance, and hash.
10. The Action Receipt identifies Actor, Mold, model route, Grant, source Gummy, result Gummy, locality, cost, outcome, and time.
11. Denial and failure also produce understandable terminal evidence.
12. Reload and browser return preserve the source, result, project state, and Receipt.
13. Gummy Browser can still open native routes and compatible external sites.
14. `npm run verify` passes.

## Protocol 0.2 vocabulary migration acceptance

- `snack:*` state deterministically becomes one `actor:*` plus at least one `mold:*`.
- `drop:*` state becomes `gummy:*` without losing owner, audience, content, or provenance.
- `fork-of` state becomes `grab-of` lineage.
- Legacy Protocol 0.1 state remains readable during migration.
- New writes use Actor, Mold, Gummy, Bowl, Link, and Grab.
- UI copy no longer teaches Snack, Drop, or Fork as the current product language.
- Receipts reference Actors as principals and may reference the Mold used for presentation or verification.

## Out of scope for the active Personal Gummy OS lane

Production multi-user delivery, encrypted sync, federation, marketplace transactions, broad Application Pack execution, enterprise identity, billing, public social discovery, moderation operations, BrowserPod, CheerpX, Linux compatibility, cloud runtime pools, and multiple production model providers.

These remain specified future phases. They must not delay the first dependable personal-computer loop.
