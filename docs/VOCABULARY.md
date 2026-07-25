# Gummy OS Canonical Vocabulary

**Status:** Accepted specification target for Protocol 0.2  
**Date:** 2026-07-25  
**Implementation state:** Migration pending in the current Protocol 0.1 scaffold

## The complete mental model

```text
Actor = who acts
Mold = how that Actor is represented and verified
Gummy = what the Actor creates or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = how a Gummy becomes yours without altering the source
```

This vocabulary is the human-facing and protocol-facing foundation of the Gummy OS social layer.

## Actor

An **Actor** is the accountable principal that performs an action or is credited with one.

Actor classes may include:

- human;
- AI agent;
- organization;
- service;
- application;
- licensed character.

A celebrity or public figure remains a human Actor. Their official status is established through a verified Mold, not through a special celebrity protocol class.

An Actor:

- receives or sponsors capability grants;
- owns or operates Gummies;
- joins Bowls;
- creates Links;
- appears in Action Receipts;
- may authorize an agent Actor to act on its behalf.

**Invariant:** authority belongs to the Actor. A Mold does not independently act.

## Mold

A **Mold** is the portable representation and verification profile through which an Actor appears inside Gummy OS.

A Mold may contain:

- a handle;
- name and public description;
- visual form, shape, color, and presentation;
- Actor class disclosure;
- operator disclosure for AI agents;
- identity proofs;
- public keys and key-rotation history;
- organization or licensing assertions;
- compatibility and protocol versions;
- public and private field separation.

One Actor may use more than one Mold when different roles or contexts require distinct presentation. Every Mold must point to one Actor. A Mold cannot create independent authority, hide that an Actor is non-human, or prove identity through appearance alone.

**Invariant:** a Mold is how an Actor is represented and verified—not who acts.

## Gummy

A **Gummy** is anything an Actor creates, keeps, receives, shares, or operates inside Gummy OS.

Examples include:

- note;
- file;
- image;
- video;
- project;
- conversation;
- application;
- workflow;
- invitation;
- generated result;
- verified artifact.

A Gummy can carry:

- stable identity;
- owner Actor;
- creator Actor;
- current operator Actor;
- audience and visibility;
- provenance;
- revision history;
- rights and usage terms;
- required capabilities;
- source and dependency Links;
- cryptographic hashes or signatures.

**Invariant:** a Gummy is the thing. It is not the Actor and it is not the shared environment.

## Bowl

A **Bowl** is a shared environment in which Actors and Gummies gather under explicit rules.

A Bowl may be:

- private;
- invitation-only;
- family;
- project-specific;
- classroom;
- organization-controlled;
- public.

A Bowl defines:

- member Actors;
- allowed Molds;
- roles;
- visibility;
- contribution and moderation policy;
- Gummy audience defaults;
- agent participation rules;
- revocation and exit behavior.

A Bowl can contain conversations, projects, files, applications, and other Gummies. It is more than a chat room or feed.

## Link

A **Link** is an intentional, inspectable relationship between protocol objects.

Examples include:

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

Links are typed, scoped, attributable, and reversible where the relationship permits it. Gummy OS must not silently replace explicit Links with inferred advertising or engagement relationships.

## Grab

A **Grab** is the action that creates an independent Gummy from an existing Gummy while preserving provenance.

A successful Grab:

1. creates a new Gummy identity;
2. preserves a cryptographic or otherwise verifiable reference to the source;
3. records a `grab-of` Link;
4. carries forward applicable attribution, license, and usage obligations;
5. never modifies the source Gummy;
6. allows the new owner to continue independently within the source's policy.

The user-facing verb is **Grab**. `Fork`, `Drop`, and `Clone` are not canonical social-layer language. `Fork` may still appear in source-control documentation when referring literally to software-repository operations.

## Natural language examples

Correct:

- “Which Actor created this Gummy?”
- “Open Hayden's Mold.”
- “Put this Gummy in the project Bowl.”
- “This Link shows that the agent Actor operated the application for Hayden.”
- “Grab this Gummy to make an independent version.”
- “The Receipt identifies the Actor, Mold, Grant, source Gummy, and result Gummy.”

Incorrect:

- “Which Mold created this?”
- “The Mold has permission.”
- “The visual shape proves this is the official Actor.”
- “Grabbing changed the original.”

## Protocol 0.1 migration

| Legacy term | Canonical target | Migration rule |
| --- | --- | --- |
| Snack | Actor + Mold | Split acting identity from representation and verification. |
| Snack Bar | Mold editor | Final UI label may be selected during implementation without changing the object model. |
| Snack Graph | Gummy OS Social Layer | Preserve graph mechanics; replace user-facing identity. |
| Drop | Gummy | Preserve stable identity, owner, audience, provenance, and content. |
| Graph object | Actor, Mold, Gummy, Bowl, or Link | Convert by object kind. |
| Fork | Grab | Create a new Gummy and a `grab-of` Link. |
| fork-of | grab-of | Preserve source lineage. |

Deterministic example:

```text
snack:hayden
→ actor:hayden
→ mold:hayden:default

drop:welcome
→ gummy:welcome

fork-of drop:welcome
→ grab record + grab-of Link to gummy:welcome
```

Legacy Protocol 0.1 inputs remain readable during migration. New Protocol 0.2 writes must use the canonical model after the Cursor migration is accepted.
