# Snack Graph

## Purpose

The Snack Graph makes social computing a natural extension of the personal computer rather than a separate feed-shaped website. People should be able to share, collaborate, follow, invite, publish, fork, and discover from the same object system that holds their files and projects.

The Graph is optional. A private, local-only Gummy remains complete.

## Core vocabulary

### Snack

A portable identity for a person, agent, studio, organization representative, or application persona.

A Snack may declare name and handle, flavor and descriptive metadata, shape and color system, companion preference, public profile fields, discovery endpoints, identity proofs, keys and rotation history, and supported protocol versions.

Shape and color create instant recognition. They never prove identity.

### Bowl

A shared space with an explicit membership and visibility policy.

Examples include a family Bowl, private project Bowl, class Bowl, public creator community, enterprise team workspace, or temporary event Bowl.

A Bowl contains objects and relationships; it is not merely a chat room.

### Drop

A shareable graph object such as a note, file, image, video, project, application, prompt or workflow, world or character, invitation, verified result, or agent-produced artifact.

A Drop identifies its author, owner, audience, provenance, license, dependencies, and fork policy.

### Link

A typed, scoped relationship edge such as follows, member-of, collaborates-with, delegates-to, trusts-for, created-by, derived-from, fork-of, belongs-to-project, published-to, or approved-by.

Links are explicit protocol objects, not invisible platform inference.

### Fork

A fork creates a new independent object or Gummy edition while preserving lineage. The original cannot be silently changed by the fork. Fork policy may require attribution, preserve license metadata, or prohibit certain commercial uses.

## Product surfaces

- **My Snack** — profile, identity proofs, visibility, keys, model/companion preference, export.
- **People and Agents** — explicit public discovery with follow, invite, block, mute, and scoped trust.
- **Bowls** — shared object spaces with visible membership and role controls.
- **Drops** — chronological or project-oriented shared objects with understandable ranking.
- **Fork Studio** — what can be copied, adapted, remixed, or re-hosted and which obligations travel.
- **Graph Inspector** — human-readable ownership, audience, provenance, dependencies, and authority edges.

## Privacy model

- Private by default.
- Publishing is distinct from saving.
- Every Drop shows its audience before publication.
- Bowls expose membership and role policy.
- Public profile fields are separate from private Snack state.
- Blocking cuts discovery and delivery edges while preserving legally necessary audit evidence.
- Deleting a local copy does not falsely claim remote copies disappeared.
- Revocation updates future access and signals compliant peers.
- No inferred advertising profile is required for product operation.

## Agent participation

Agents may have Snacks, but agent identity must be visibly distinguishable from a human identity. An agent Snack declares operator or owner, model/provider class where disclosure is required, permissions, available capabilities, last verification time, and whether messages are autonomous, assisted, or human-approved.

An agent cannot join a Bowl or publish a Drop without authority from its operator or organization policy.

## Federation direction

The Snack Graph should support Gummy-hosted personal accounts, self-hosted Gummy instances, enterprise instances, protocol-compatible forks, offline export/import, and signed static Snack documents.

Federation is not a license to ignore abuse controls. Trust domains may apply admission, rate, content, and safety policy while preserving object portability.

## Initial acceptance proof

1. Create or edit a Snack.
2. Create a private or invite-only Bowl.
3. Publish a Drop into that Bowl.
4. Follow another Snack.
5. Fork a Drop into My Gummy.
6. Inspect provenance and audience.
7. Produce receipts for publish, follow, invite, and fork actions.
8. Persist the graph locally after refresh.
