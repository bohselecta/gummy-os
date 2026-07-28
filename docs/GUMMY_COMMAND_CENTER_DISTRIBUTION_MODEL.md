# Gummy OS Command Center + Distribution Model

**Status:** Founder architecture design  
**Date:** 2026-07-28  
**Scope:** Cross-system visibility, decision routing, cost and Receipt accountability, Zeke coordinator presence, creative distribution, Radio/Channels continuation, and the interface translation layer.  
**Precedence:** Extends `docs/ACTOR_AGENT_MASTER_CONTROL.md`, `docs/PRODUCTION_ACTOR_RUNTIME.md`, `docs/GUMMY_SHARED_VISION_PRODUCTION_MODEL.md`, and `docs/GUMMY_ACTOR_PRESENCE_SOCIAL_INSTANCE_MODEL.md`.

## 1. The complete creative operating loop

The public demonstration established a coherent operating loop rather than a collection of AI applications:

```text
Actor
  ↓
Intent / Shared Vision
  ↓
Command Center
  ↓
Production
  ↓
Studios / Agents
  ↓
Artifacts / Gummies
  ↓
Returns / Receipts
  ↓
Distribution
  ↓
Persistent Actor body of work and presence
```

The system’s unusual value is not merely that Agents can do work. It is that Humans can understand, govern, inspect, resume, and distribute that work inside one persistent world.

## 2. Command Center and Master Control are different

### Master Control

Master Control is the authority surface.

It decides or exposes:

- authoritative state location;
- active Mold;
- assigned Agent;
- Task Lease;
- Capability Grant;
- allowed data classes;
- synchronization;
- approval;
- revocation;
- evidence retention;
- exact Run authorization.

Master Control is scoped to an Actor, Production, Run, relationship, or other governed object.

### Command Center

Command Center is the cross-system awareness and triage surface.

It gathers:

- current Productions;
- active and recently active Agents;
- Shared Visions and formation proposals;
- pending Work Orders;
- running and recoverable Jobs;
- Returns;
- Receipts;
- costs, authorizations, actual usage, and Pool reconciliation;
- pending Human decisions;
- blocked items;
- failed or degraded capabilities;
- social invitations and presence changes;
- distribution drafts and releases;
- items requiring acceptance, revocation, or continuation.

Canonical rule:

> **Command Center shows what needs attention. Master Control decides what is allowed.**

Command Center must never create hidden authority merely because it aggregates information.

## 3. Zeke in Command Center

Glopper remains the first-party companion identity.

Zeke is not a renamed Glopper, not a replacement companion, and not ultimate authority.

Within this model, **Zeke is the visible coordination and explanation intelligence of Command Center**.

Zeke may:

- summarize current operational state;
- explain why something is blocked;
- group related Receipts and Returns;
- identify stale approvals or expiring Grants;
- surface cost movement;
- propose the next Human decision;
- explain the relationship between Actors, Agents, Productions, and Places;
- prepare a Work Order or Shared Vision proposal;
- route the Human to the correct object or Master Control surface.

Zeke may not:

- approve a Production Agreement;
- spend money;
- authorize a Run;
- grant representation rights;
- publish;
- alter contribution ownership meaning;
- revoke a Human decision;
- collapse Actor and Agent identity;
- claim that a proposal, plan, or estimate is completed work.

All Zeke summaries must link back to the underlying objects and evidence.

## 4. Command Center object model

Recommended view model:

```text
gummy.command-center-view/v1
```

This is a generated projection, not a new source of truth.

It may contain:

- `attentionItems`;
- `activeProductions`;
- `sharedVisions`;
- `activeAgents`;
- `pendingWorkOrders`;
- `runningJobs`;
- `returnsAwaitingReview`;
- `recentReceipts`;
- `costPosition`;
- `productionPools`;
- `blockedItems`;
- `presenceChanges`;
- `distributionQueue`;
- `resumeSuggestions`;
- source object IDs and revisions;
- generated-at timestamp.

Every row should identify:

- what object it describes;
- what changed;
- who or what acted;
- whether anything actually executed;
- cost or risk;
- authority required;
- next available Human verb;
- linked Receipt or reason no Receipt exists yet.

## 5. Attention states

Recommended attention classes:

```text
needs-decision
needs-approval
needs-input
needs-connection
running
recovering
ready-for-review
ready-to-accept
blocked
failed
cost-changed
permission-expiring
presence-changed
ready-to-publish
completed
```

Command Center may rank by urgency, but it must show the reason and avoid opaque behavioral scoring.

## 6. Cost accountability

Command Center should reconcile:

```text
estimate
committed maximum
provider authorization
actual usage
refund or release
remaining Pool
variance
```

For each Production or Run, the Human should be able to see:

- who agreed to contribute;
- what each contribution authorizes;
- whether the amount is private or shareable;
- whether a provider charge occurred;
- actual cost;
- unresolved overage;
- failed or cancelled cost;
- linked Production Pool and payment Receipts.

A percentage without an amount or basis is insufficient. A charge without a Run and Receipt is invalid.

## 7. Receipts as the visible accountability spine

Receipts convert an Agent from a magic box into an inspectable participant.

Command Center should allow the Human to traverse:

```text
Human decision
→ Master Control approval
→ Mold
→ Task Lease
→ Grant
→ Agent/runtime
→ Work Order
→ action or denial
→ Return
→ Receipt
→ result acceptance
→ distribution
```

Receipt views should answer:

- What happened?
- What did not happen?
- Which Actor was represented?
- Which Agent acted?
- Which source revisions were used?
- What authority existed?
- What route and locality were used?
- What did it cost?
- What result was produced?
- Who accepted or rejected it?
- What can be revoked or retried?

## 8. Distribution closes the creative loop

Creation without distribution leaves the Actor’s public or shared presence incomplete.

Gummy distribution may route accepted artifacts through Places and specialist products such as:

```text
Create
 ├ ImageHoss
 ├ VideoBoss
 ├ Worlds / Meshmallow
 └ Radio
       ├ podcast episode
       ├ private audio Receipt
       ├ serialized program
       └ future Radio channel

Accepted media
 └ Channels
       ├ creator channel
       ├ episode / drop
       ├ premiere
       ├ watch group
       └ Family Room
```

Distribution is never an automatic consequence of creation or acceptance.

## 9. Distribution Plan

Recommended protocol:

```text
gummy.distribution-plan/v1
```

A Distribution Plan should include:

- source Production and accepted artifact revisions;
- distributing Actor;
- destination Place, service, channel, or external route;
- title, description, episode metadata, and cover Assets;
- audience;
- publication date or premiere rules;
- rights and licenses;
- contributor credits from the accepted Agreement and Ledger;
- synthetic-media disclosure;
- likeness and voice permissions;
- privacy exclusions;
- retention and deletion policy;
- monetization or no-monetization state;
- moderation state;
- required approvals;
- status and Receipt references.

Recommended states:

```text
draft
needs-rights
needs-credit-approval
needs-likeness-approval
needs-voice-approval
ready-for-publication
scheduled
published
blocked
failed
withdrawn
archived
```

## 10. Distribution Release

A publication event creates a separate immutable release record and Receipt.

It should record:

- exact Distribution Plan revision;
- exact accepted artifact revisions;
- destination and external identifiers;
- publishing Actor;
- operating Agent or Human;
- audience and visibility;
- rights and disclosures;
- publication timestamp;
- cost;
- provider response;
- failure, takedown, withdrawal, or correction history.

Changing a title or replacing media after publication creates a new release revision or correction event. It does not rewrite the original claim.

## 11. Radio as ongoing Actor presence

Radio expands Gummy from creation into broadcast and continuing presence.

An Actor may:

- create a private audio Receipt;
- publish an approved project aftershow;
- maintain a serialized development diary;
- produce an educational briefing;
- create a recurring Radio program;
- connect accepted episodes to an Actor Home or Channels presence.

The Actor’s body of work may persist while the Human is offline, but an AI representative may only continue publication under an explicit representation and publication Mold.

The Radio source boundary remains exact. A Production history or Social Instance does not become a podcast merely because it exists.

## 12. Channels as media navigation, not a feed

Channels should distribute creator media through:

- creator channels;
- episodes and drops;
- premieres;
- Human-defined watch groups;
- Family Room bulletins;
- explicit moderation and report handling.

The distribution system should not introduce an infinite algorithmic feed or automatically turn every Actor into a channel.

A creator channel and a Gummy Actor remain distinct until explicitly linked.

## 13. Actor body of work

An Actor Home or profile may surface an approved body of work containing:

- Productions;
- accepted artifacts;
- Radio episodes;
- Channels releases;
- Worlds;
- credits;
- contribution acknowledgements;
- public Receipts or proof summaries;
- current presence and availability.

The body of work is assembled from explicit Links and Distribution Releases, not from scraping private history.

## 14. Laboratory mode and the interface translation layer

The current architectural complexity is valuable and should remain machine-readable.

This phase is laboratory mode:

> **Learn the organism before designing the consumer interface.**

The next usability pass should not delete canonical objects. It should add a translation layer.

### Canonical layer seen by the system and builders

```text
Actor
Agent
Mold
Bowl
Social Instance
Session
Shared Vision
Production
Production Agreement
Production Pool
Contribution Ledger
Work Order
Task Lease
Grant
Run
Return
Receipt
Distribution Plan
```

### Human verbs exposed contextually

```text
Make something
Invite someone
Save this group
Continue where we left off
See what is happening
Approve this
Contribute
Send this somewhere
Publish
Find my stuff
Review what changed
```

Canonical names remain available in explanation, receipts, advanced views, documentation, and LLM context. The primary action language can become obvious without flattening the architecture.

## 15. Founder observation loop

Before large interface simplification, Gummy should capture repeated real use.

For each founder/demo session, record:

- what was opened first;
- what was reopened repeatedly;
- where the Human hesitated;
- which objects felt like people, places, databases, commands, or tools;
- which terms required explanation;
- which expected actions appeared missing;
- which state was mistaken for current, sample, reference, or completed;
- what the Human naturally called the action;
- what the architecture called it;
- whether the issue belongs to copy, hierarchy, affordance, state truth, or missing capability.

Usability corrections should be applied to the translation and navigation layer unless the underlying object model is genuinely wrong.

## 16. First Command Center proof

The first complete proof should show:

1. At least two active Productions and one saved Shared Vision.
2. One local Agent, one remote-service-required capability, and one blocked Work Order.
3. One Production Pool with estimated, committed, and actual cost.
4. Returns awaiting review and accepted results.
5. Recent Receipts with complete authority and route chain.
6. A pending representation or publication decision.
7. An expired or revoked permission.
8. Zeke explaining one blocked item and routing the Human to the correct Master Control surface.
9. No action executing merely because Command Center displayed it.
10. An accepted artifact becoming a Distribution Plan.
11. Publication requiring a separate approval.
12. A resulting Radio or Channels release appearing on the Actor’s approved body of work.

## 17. Non-goals for the first implementation

- no omnipotent global Agent;
- no hidden Zeke authority;
- no replacement of Glopper;
- no automatic publishing;
- no unverified public analytics claims;
- no social engagement ranking;
- no irreversible action directly from a summary card without the correct approval surface;
- no conversion of private history into public content;
- no flattening of Master Control into a generic dashboard;
- no claim that Command Center itself is the source of truth.

## 18. Founding thesis

> **The differentiator is not that an Agent can use a browser or generate media. It is that intelligence can operate across persistent windows belonging to one shared project reality, while Humans can see, govern, verify, resume, and distribute what is becoming real.**
