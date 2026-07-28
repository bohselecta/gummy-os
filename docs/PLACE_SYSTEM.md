# Gummy Place System

Phase 14 evolves the first-party product doorway from Applications to Places without flattening the products behind it.

The controlling contracts are:

- `gummy.place-registry/v1` and `gummy.place-descriptor/v1`
- `gummy.place-binding/v1`
- `gummy.source-package/v1`
- `gummy.place-handoff/v1`
- `gummy.world-plan/v1`

The existing `gummy.application-registry/v1` and `gummy.app-handoff/v1` remain readable. Their four protected product IDs are present unchanged in the Place registry. New work writes the Place contracts.

## Place authority

A Place is a private place, studio, or connected place with its own Actor identity, authoritative data location, privacy boundary, and execution boundary. It is not a skin over global Gummy memory.

Every open Place window has an explicit personal, Production, or session context. Its stable ID includes the Place and context. Closing a window removes layout metadata only; it does not delete Place data, a binding, configuration, or an external domain record.

Only Human-pinned Places appear in the Gummy Bar. No Phase 14 Place is pinned by default.

## Package and approval boundary

A scoped source package is immutable. It identifies exact source revisions and hashes, included fields, explicit exclusions, rights, provenance, privacy, audience, retention, cost ceiling, limitations, and Human approval.

A Place handoff begins in `preview`. Preview is non-executing. Approval produces a separate immutable transition. Submission is permitted only when the target descriptor is available and its runtime or service is connected. Disconnected, staged, or companion-required Places never simulate success.

Remote routes must use HTTPS and an explicit origin allowlist. Secret-bearing fields are rejected before persistence or handoff.

## Phase 14 Places

- Gummy Channels (`@channels`) is a channel guide, not an infinite feed. Family Room is a bulletin board. Publishing is separate and currently staged.
- Wardrobe (`@wardrobe`) is private and owner-controlled. It makes one outfit from owned items. Temporary unavailability is not dislike. There is no checkout.
- House (`@house`) keeps its Home Graph authoritative. The Scope Wall withholds unrelated nodes; the Intent Gate previews work; local change requires intent and consequence notes.
- Worlds (`@worlds`) creates a high-level World Plan for Meshmallow. Its exact tool allowlist is `validate_world`, `check_sources`, `estimate_world`, `make_world`, `world_status`, `inspect_world`, `package_world`, `duplicate_world`, and `list_starters`. Code, shell, filesystem, Python, and Blender scripting are forbidden. Sit is accepted first; Walk remains gated.
- Table (`@table`) is invite-only. It has no feed, discovery, open direct messages, ratings, or balances. An exact address crosses only with person-and-service approval for the gathering. A Pantry gift is not an economy.
- Radio (`@radio`) reads an exact source-boundary package. Outline, script revision, voice or likeness, export, and publication are distinct approvals. Browser speech is a demonstration, never final audio.

## Source resolution

Exact source evidence is recorded in `evidence/phase14-source-resolution.json`. Wardrobe is the only focused scaffold: workspace, accepted-archive, connected-Drive, and owner-repository searches found no recoverable source or specification.

Historical product names are isolated to compatibility and provenance fields. New surfaces use only the Phase 14 names.
