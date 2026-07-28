# Gummy OS Actor Presence + Social Instance Model

**Status:** Founder architecture design  
**Date:** 2026-07-28  
**Scope:** Persistent social presence, Human/AI occupancy, windowed relationships, saved social configurations, resumable group activity, and the bridge from social activity to Shared Vision.  
**Precedence:** Extends `docs/SOCIAL_LAYER.md`, `docs/ACTOR_AGENT_MASTER_CONTROL.md`, and `docs/GUMMY_SHARED_VISION_PRODUCTION_MODEL.md`. Actor, Agent, Mold, Bowl, Link, Gummy, Production, and Master Control remain distinct.

## 1. Core realization

An Actor is not only persistent identity and capability. It is a **persistent point of social presence**.

That presence may currently be occupied by:

- the Human owner;
- an explicitly authorized AI representative;
- a static profile and body of work;
- nobody, while the Actor remains durable and addressable.

Canonical rule:

> **The AI is never “the user.” It is an identified Agent representing or operating an Actor under an explicit Mold, scope, disclosure, and revocation path.**

## 2. Identity, presence, and operator are separate

```text
Actor
persistent identity, address, relationships, state, and provenance

Actor Presence
current social availability and occupancy state

Operator
Human or Agent currently controlling or representing the Actor

Mold
permissioned representation/operation contract

Grant
bounded authority for a specific action or period
```

An Actor can remain online as a static presence while neither Human nor Agent is actively operating it.

Opening an Actor never grants control.

## 3. Actor Presence

Recommended protocol:

```text
gummy.actor-presence/v1
```

Presence states:

```text
human-live
human-available
human-away
ai-represented
static
busy
offline
dormant
revoked
```

### 3.1 Human live

The Human is currently occupying the Actor through one or more approved media channels:

- text chat;
- voice;
- camera/video;
- screen or window sharing;
- spatial presence in a future world.

The presence record identifies the Human-controlled session and does not imply public availability.

### 3.2 Human available

The Human is not necessarily streaming but is willing to receive an invitation or request under declared rules.

Examples:

- available for chat;
- available for collaboration;
- available for a specific topic;
- available to join a named Bowl or Production.

### 3.3 AI represented

An authorized Agent is representing the Actor.

The surface must disclose:

- Actor identity;
- operating Agent identity;
- active Mold;
- Human sponsor;
- allowed topics and actions;
- excluded topics and actions;
- whether the Agent may speak, schedule, quote, create, or only collect messages;
- expiry;
- revocation;
- whether the Human is expected to review before anything leaves the session.

An AI-represented presence cannot silently:

- accept contracts or payments;
- grant likeness or voice rights;
- publish private material;
- approve Production Agreements;
- reveal location or sensitive personal state;
- impersonate Human-live presence.

### 3.4 Static

The Actor remains openable through:

- profile and identity;
- approved public or shared Gummies;
- current work or Places;
- availability rules;
- invitations or contact paths;
- body of work and distribution channels.

### 3.5 Offline and dormant

Offline means no current operator or interactive route is available.

Dormant means the Actor is intentionally inactive but remains durable, inspectable, and resumable under its retention policy.

## 4. Presence record

An Actor Presence record should contain:

- Actor ID;
- state;
- operator type and operator ID, when applicable;
- active Mold and Grant references;
- visibility and audience;
- allowed contact modes;
- declared availability topics or purposes;
- media capabilities;
- current Social Instance, Bowl, Session, Production, or Place references;
- status detail;
- started, updated, expires, and last-verified timestamps;
- stale/expired state;
- disclosure and Receipt references.

Presence is ephemeral or short-lived state. It must not silently become permanent Actor memory.

## 5. The windowed social environment

Gummy Canvas can show many living relationships at once:

```text
┌ Hayden — human live ┐  ┌ Bob — available ┐
└─────────────────────┘  └─────────────────┘

┌ Music Group session ┐  ┌ Design Team session ┐
└─────────────────────┘  └─────────────────────┘
```

These are not merely video tiles.

Each Actor or group window may include:

- identity and presence;
- current operator disclosure;
- text, voice, video, or static state;
- shared Gummies;
- linked Productions;
- invitations and pending decisions;
- minimized state;
- unread or changed state;
- return continuity.

Minimizing a window preserves the relationship and state. Closing the view does not delete the Actor, Bowl, Session, or Social Instance.

## 6. Bowl, Session, and Social Instance

These objects must not collapse.

### Bowl

A Bowl is the durable shared environment and policy container.

It owns or references:

- membership and roles;
- permitted Molds and Agent participation;
- visibility;
- shared Gummies;
- invitation and publication policy;
- durable purpose and rules.

### Session

A Session is a bounded episode of interaction inside a Bowl or among selected Actors.

It may contain:

- participants present during that episode;
- messages and media events;
- threads;
- active window state;
- selected shared Gummies;
- temporary permissions;
- start, pause, resume, and terminal state;
- origin records for a Shared Vision.

### Social Instance

A **Social Instance** is a saved, restorable social topology.

Recommended protocol:

```text
gummy.social-instance/v1
```

It preserves the reusable configuration through which a relationship or group can resume.

Example:

```text
Friday Brainstorm Crew

Members:
@Hayden
@Bob
@Sarah
@VideoBoss

Purpose:
Recurring creative ideation and Production formation

Saved state:
window layout
presence rules
shared threads
selected Gummies
linked Productions
permissions
resume instructions
```

Canonical rule:

> **A chat room is where messages go. A Social Instance is a durable thing with identity, members, state, history, permissions, purpose, and a future.**

## 7. Social Instance contents

A Social Instance should record:

- stable ID, name, revision, and owner Actor;
- source Bowl and optionally originating Session;
- member Actor IDs, roles, and membership state;
- allowed Human and Agent operators;
- purpose and recurring rhythm;
- visual layout and minimized/open window arrangement;
- default threads and selected active thread;
- shared Gummy references;
- linked Production and Shared Vision references;
- presence and invitation rules;
- communication modes;
- retention and privacy;
- notification policy;
- resume state and last activity;
- Links and provenance;
- archived Session references.

It should not persist raw live video buffers as durable social identity. Recorded media requires explicit consent and a separate Gummy.

## 8. Social graph instance

The Human’s “web” is not only a list of Person → Person Links.

It includes reusable topologies:

```text
Actor
 ├ Relationships / Links
 ├ Bowls
 ├ Social Instances
 ├ Sessions
 ├ Shared Visions
 ├ Productions
 ├ Communities
 └ Saved configurations
```

A Social Instance can therefore be understood as a **named subgraph with state and policy**.

It may be reopened, duplicated, shared, or used as the starting configuration for another Session, subject to membership and privacy rules.

## 9. Opening and resuming

Opening a saved Social Instance should:

1. resolve the current state of every Actor;
2. show Human-live, AI-represented, static, or offline disclosure;
3. restore the approved visual layout;
4. restore shared threads and selected Gummies;
5. identify changed permissions or unavailable services;
6. show linked Productions and unfinished decisions;
7. begin a new Session revision only after the Human chooses to resume interaction.

It must not pretend old participants are currently present.

## 10. Multiple simultaneous instances

The Human may keep several Social Instances open or minimized:

- family;
- collaborators;
- music group;
- design team;
- client review;
- community planning;
- private Actor-to-Actor chat.

Each has isolated:

- membership;
- permissions;
- history;
- threads;
- shared Gummies;
- Production context;
- window identity;
- Agent access.

A message, Gummy, or permission does not cross instances without an explicit handoff or share action.

## 11. Shared Vision bridge

A Session within a Social Instance may produce a Shared Vision proposal.

```text
Social Instance
→ active Session
→ selected origin records
→ Shared Vision proposal
→ participant acknowledgement
→ Production formation
```

The source Social Instance remains intact. Formation creates Links and provenance rather than converting or deleting the social object.

## 12. Invitations and availability

An Actor may advertise bounded availability such as:

- chat now;
- ask a question;
- invite to a named Bowl;
- propose collaboration;
- submit a Production request;
- leave a message for Human review;
- interact with an authorized AI representative.

Availability never grants:

- friendship;
- membership;
- data access;
- publishing rights;
- representation rights;
- payment authority;
- Production ownership.

## 13. Media and recording consent

Live voice, video, and screen presence require separate controls for:

- participation;
- recording;
- transcription;
- model processing;
- source-package reuse;
- clips;
- public distribution.

No-recording is the default unless the active Social Instance or Session contains explicit participant consent.

A transcript or recording becomes a Gummy with audience, rights, retention, and provenance.

## 14. AI representation policy

An AI representative must use an explicit representation Mold.

Recommended minimum boundaries:

```text
may answer factual profile questions
may collect messages
may surface approved public work
may propose scheduling
may identify unavailable Human review

may not claim Human-live presence
may not approve Productions, payments, contracts, likeness, voice, or publication
may not expose private memory outside the permitted source package
may not create durable Actor memory without a reviewed proposal
```

A Human may create narrower or broader Molds, but every consequential action remains Receipt-backed and revocable.

## 15. User-facing verbs

The interface may use:

```text
Open this group
See who is here
Join live
Leave a message
Ask the authorized AI
Save this group
Resume where we left off
Share this object
Start a project together
```

The protocol continues to use Actor Presence, Bowl, Session, Social Instance, Link, Gummy, Shared Vision, and Production.

## 16. First proof

The first complete proof should demonstrate:

1. Three distinct Actors with separate authority.
2. Human-live, AI-represented, static, and offline presence disclosures.
3. Several simultaneous Actor and group windows.
4. Minimize and restore without losing state.
5. Create a private Bowl.
6. Start a Session with isolated threads and selected Gummies.
7. Save it as a Social Instance with purpose and window layout.
8. Reload the OS and restore the Social Instance.
9. Show that offline Actors are not falsely shown as present.
10. Resume a new Session revision.
11. Propose a Shared Vision from selected origin records.
12. Revoke an AI representation Mold and prove future representation is blocked.

## 17. Non-goals for the first implementation

- no public social feed;
- no advertising graph;
- no inferred friendship or trust score;
- no automatic AI impersonation;
- no recording without consent;
- no global merge of all group histories;
- no default public rooms;
- no assumption that availability means permission;
- no replacement of Bowl with a generic chat channel;
- no claim of scalable multi-user live media until the authenticated service exists.

## 18. Founding thesis

> **Your digital presence is a living place where Humans and explicitly authorized AI representatives can meet, create, collaborate, and resume relationships over time.**

The participant is not a disposable account row. The group is not a message bucket. The saved instance is a durable social object.
