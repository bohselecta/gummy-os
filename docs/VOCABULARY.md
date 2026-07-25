# Gummy OS Canonical Vocabulary

**Status:** Founder-locked specification  
**Date:** 2026-07-25  
**Implementation state:** Cursor migration pending

Read `GLOPPER_NAMING.md` and `ACTOR_AGENT_MASTER_CONTROL.md` first.

## Complete mental model

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that performs work
Mold = permissioned embodiment and operating contract for an Actor
Master Control = where authority, placement, and synchronization are decided
Gummy OS = universal WebOS platform
Gummy Canvas = open working and creation surface
Gummy Bar = persistent candy-store system bar
Glopper = gummy-candy companion and first-party Agent identity
Glopper Panel = expanded conversation and control surface
@address = stable protocol identity and route for an Actor
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how protocol objects relate
Grab = how a Gummy becomes independent without altering its source
```

## Human

A Human is the ultimate personal authority behind one or more Actors and Agents. A Human can open/control Actors, authorize Agents, choose Molds, approve work, decide synchronization, and revoke access.

A Human is not automatically identical to an Actor record.

## Actor

An Actor is a persistent addressable computational entity expressed through Gummy OS and the protocol.

It may embody a person, public figure, character, organization, project role, service, world, or other persistent presence.

An Actor has a stable `@address`, owns/operates Gummies, participates in Bowls/Links, and remains the same when device, location, or Agent changes.

## Agent

An Agent is separate executable intelligence or an operating process.

It plans and executes work, uses tools/applications, accesses only granted resources, may operate Actors, may synchronize approved state, owns task leases, and identifies itself/locality in Receipts.

An Agent never becomes the Actor it operates.

## Glopper

Glopper is the first-party companion character and Agent family.

- **Glopper character** — gummy-candy mascot/personality.
- **Glopper Panel** — expanded interface inside Gummy OS.
- **Glopper App** — standalone native/mobile interface.
- **Glopper Agent** — separately identified executor.

```text
agent:glopper-web
agent:glopper-cloud
agent:glopper-native
agent:glopper-phone
```

`bohselecta/glopper` is the existing local-first process-director application and Glopper's native lineage.

## Mold

A Mold is the permissioned embodiment and operating contract through which a Human or Agent may open, represent, instantiate, or operate an Actor.

It can specify operators, representation, role, capabilities, data scopes, runtime/locality, synchronization, proof/license/disclosure, duration, expiry, and revocation.

A Mold does not independently act.

## Master Control

Master Control decides authoritative state location, assigned Agent, active Mold, task lease, allowed data flow, synchronization, approval rules, and revocation/locks.

It prevents sign-in or connectivity from becoming ambient replication or authority.

## Gummy OS

Gummy OS is the platform name on every device and deployment mode.

Do not create separate public products named Gummy Desktop or Gummy Web.

## Gummy Canvas

The open working surface where Actors, Gummies, apps, windows, worlds, mini-apps, and compositions appear.

## Gummy Bar

The persistent candy-store system bar.

Candy icons may visually represent Glopper, applications, Actors, Gummies, Bowls, tasks, notifications, and controls.

A candy icon is presentation only—not a protocol object or authority principal.

## Glopper Panel

The expanded conversation/control surface opened from Glopper's candy in the Gummy Bar. It shows context, task, Actor, Agent, Mold, Master Control, Grants, progress, results, errors, and Receipts.

## @address

A stable human-facing protocol identity and route for an Actor. It supports resolution, opening, messaging, invitations, permissions, Agent binding, Bowl membership, Gummy provenance, synchronization routing, and revocation.

An address never grants control by itself.

## Gummy

Anything an Actor creates, owns, keeps, receives, shares, or operates: notes, files, images, videos, projects, conversations, applications, workflows, invitations, generated results, and verified artifacts.

A Gummy may carry owner/creator Actor, operating Agent, Mold, audience, provenance, revision, rights, capabilities, hashes, and Links.

## Bowl

A shared environment in which Actors and Gummies gather under explicit membership, roles, visibility, and rules.

## Link

An intentional inspectable relationship such as represented-by, operated-by-agent, controlled-by-human, deployed-to, synchronized-with, member-of, created-by, delegates-to, shared-with, derived-from, grab-of, and approved-by.

## Grab

Creates an independent Gummy while preserving source identity, provenance, rights, and a `grab-of` Link. It never changes the source.

## Natural language examples

Correct:

- “Open `@hayden`.”
- “Pin this Actor to the Gummy Bar.”
- “Open the Glopper Panel.”
- “Glopper Web is the Agent operating this Actor through the personal Mold.”
- “Which Agent performed the work?”
- “Which Mold authorized it?”
- “Grab this Gummy without changing the source.”

Incorrect:

- “The candy icon has permission.”
- “The Mold created this.”
- “The Agent and Actor are the same.”
- “Opening the Actor grants control.”
- “Sync everything because the Human signed in.”

## Migration consequences

Cursor must migrate:

```text
legacy Snack
→ Human + Actor + Mold

legacy companion / personal-broker / Z / Zeke
→ agent:glopper-web and Glopper presentation

legacy dock
→ Gummy Bar presentation

legacy Drop/file
→ Gummy

legacy Fork
→ Grab + grab-of Link
```

Migration is deterministic, idempotent, traceable, and non-destructive.
