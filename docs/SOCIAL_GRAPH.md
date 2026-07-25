# The Gummy OS Social Layer

## Purpose

Your digital life is not an advertising graph.

Gummy OS builds social computing from portable, user-owned objects with visible ownership, audience, authority, provenance, and history. Social behavior is a natural extension of the personal computer rather than a separate feed-shaped website.

The Social Layer is optional. A private, local-only Personal Gummy OS remains complete.

## Canonical mental model

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

## Actor

An Actor is the accountable person, AI agent, organization, service, application, or licensed character that acts inside Gummy OS.

Actors create and operate Gummies, join Bowls, establish Links, request authority, and appear in Action Receipts.

A public figure is a human Actor whose official presence is established through a verified Mold. A fictional or licensed character may be a character Actor with explicit ownership, operator, and license Links.

## Mold

A Mold is the portable representation and verification profile through which an Actor appears.

A Mold may declare:

- handle and public name;
- Actor class;
- public description;
- shape, color, and visual form;
- operator disclosure for AI agents;
- identity proofs and keys;
- organization or licensing claims;
- discovery endpoints;
- supported protocol versions;
- public/private field separation.

Molds create recognition. They do not create authority through appearance alone.

## Gummy

A Gummy is anything an Actor creates, keeps, receives, shares, or operates:

- note;
- file;
- image;
- video;
- project;
- application;
- conversation;
- workflow;
- invitation;
- generated result;
- verified artifact.

Every shared Gummy identifies its owner Actor, creator Actor, audience, provenance, rights, dependencies, revision, and Grab policy.

## Bowl

A Bowl is a shared environment with explicit membership, roles, visibility, and rules.

Examples:

- family Bowl;
- private project Bowl;
- classroom Bowl;
- public creator Bowl;
- enterprise team Bowl;
- temporary event Bowl.

A Bowl contains Actors, allowed Molds, Gummies, conversations, projects, and Links. It is more than a group chat.

## Link

A Link is a typed, scoped, inspectable relationship.

Examples:

- follows;
- member-of;
- belongs-to;
- created-by;
- operated-by;
- represented-by;
- collaborates-with;
- delegates-to;
- trusts-for;
- shared-with;
- derived-from;
- grab-of;
- approved-by.

Links are explicit protocol objects, not invisible platform inference.

## Grab

A Grab creates a new independent Gummy from a source Gummy.

A Grab:

- creates a new Gummy identity;
- preserves the source ID, revision, and hash;
- creates a `grab-of` Link;
- preserves required attribution, license, and use restrictions;
- never changes the source;
- lets the new owner continue independently within the source policy.

The user-facing action is **Grab**. `Fork`, `Drop`, and `Clone` are not canonical Social Layer language.

## Product surfaces

- **My Actor** — acting identity, Actor class, delegation and authority overview.
- **Mold editor** — handle, appearance, public/private profile, proofs, keys, disclosure, and export.
- **Actors** — deliberate discovery of people, agents, services, organizations, applications, and characters.
- **Bowls** — shared environments with visible membership, roles, policy, and audience.
- **Gummies** — shared objects organized chronologically, by Bowl, or by project.
- **Grab** — source policy, obligations, provenance, and independent-copy action.
- **Link Inspector** — ownership, audience, provenance, dependencies, representation, delegation, and authority relationships.

The final navigation labels may be polished in implementation. The underlying object meanings are locked.

## Privacy model

- Private by default.
- Saving is distinct from publishing.
- Every shared Gummy shows its audience before publication.
- Bowls expose membership and role policy.
- Public Mold fields are separate from private Actor state.
- Blocking cuts discovery and delivery Links while preserving legally necessary audit evidence.
- Deleting a local copy does not falsely claim remote copies disappeared.
- Revocation updates future access and signals compliant peers.
- No inferred advertising profile is required for product operation.
- A Grab cannot erase source attribution or impersonate the source Actor.

## Agent participation

AI agents are Actor class `agent`.

An agent Actor must disclose:

- operator or owner;
- model/provider class where required;
- available capabilities;
- current Mold;
- last verification time;
- whether an action is autonomous, assisted, or human-approved.

An agent Actor cannot join a Bowl, create a Link, publish a Gummy, or perform a Grab without authority from its operator or organization policy.

## Public figures, performers, and characters

The Actor/Mold distinction supports future entertainment and public-identity use without confusing appearance with authority:

- a celebrity is a human Actor with an official verified Mold;
- a performer may authorize a service Actor to operate under bounded authority;
- a fictional character may be a licensed character Actor;
- a character Actor may have one or more official Molds;
- fan-created Gummies may preserve Links to an official source without impersonating it;
- Receipts preserve which Actor actually performed the action.

This section defines identity structure, not a celebrity marketplace or licensing business commitment.

## Federation direction

The Social Layer should support:

- Gummy-hosted personal accounts;
- self-hosted Gummy OS instances;
- enterprise instances;
- protocol-compatible independent editions;
- offline export/import;
- signed Actor and Mold documents;
- Bowl invitations;
- Gummy exchange;
- Link and Grab provenance.

Federation is not permission to ignore abuse controls. Trust domains may apply admission, rate, content, identity, and safety policy while preserving object portability.

## Initial acceptance proof

The Social Layer becomes active only after Personal Gummy OS is dependable.

Its first bounded proof is:

1. Create or import an Actor.
2. Create or edit that Actor's Mold.
3. Create a private or invite-only Bowl.
4. Place a Gummy into that Bowl with an explicit audience.
5. Establish a Link to another Actor.
6. Grab an allowed Gummy into an independent version.
7. Inspect owner, creator, Mold, audience, source, rights, and `grab-of` provenance.
8. Produce Receipts for publish, Link, invitation, and Grab actions.
9. Persist the Social Layer after refresh and return.

## Protocol 0.1 compatibility

The current implementation may still display Snack, Snack Graph, Drop, and Fork. Those are legacy Protocol 0.1 labels and must be migrated according to `docs/VOCABULARY.md` and the active Cursor work order.
