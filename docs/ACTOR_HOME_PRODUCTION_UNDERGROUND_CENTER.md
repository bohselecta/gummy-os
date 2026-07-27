# Actor Home, Production, and Underground Architectural Center

**Status:** Founder-approved architectural center, reconciled for the canonical Gummy OS implementation  
**Date:** 2026-07-27  
**Canonical implementation repository:** `bohselecta/gummy-os`

## Provenance

This ruling carries forward the accepted **Gummy OS Actor + Underground Doctrine** recorded in `bohselecta/gummy` at commit `22d12dae4e124f76aaf46b8fc3fa340c51b12240`.

That source established two important product truths:

1. the evolving Human-owned Actor is the center of the experience;
2. the Underground is the environment for discovery, creation, and collaboration.

`bohselecta/gummy-os` remains the canonical implementation repository. This document reconciles that doctrine with the already-canonical Actor/Agent/Mold/Master Control, Production, Gummy, Bowl, storage, security, and first-party application architecture.

## Architectural center

The center of Gummy OS is not the app launcher, file tree, chat transcript, Agent graph, or storage provider.

> **The center is the Human-owned living Actor.**

The primary personal surface is the Actor's **Living Self Page**: a persistent, automatically evolving view of the Human's work, demonstrated abilities, patterns, relationships, Productions, Gummies, and emerging interests.

The Human and Actor do not collapse:

```text
Human
ultimate authority, consent, ownership, approval, revocation

Actor
persistent addressable computational representation and continuity object

Living Self Page
openable Gummy OS surface through which the Human sees and works with the Actor
```

The Living Self Page is not a social profile, résumé, avatar page, or chatbot biography. It is an evidence-aware representation of who the Human is becoming.

## Complete center-to-runtime model

```text
Human authority
        │
        ▼
Personal Actor / Living Self Page
identity · continuity · memory · capabilities · creative patterns
        │
        ├──────── starts / joins / discovers ────────┐
        ▼                                             ▼
Production                                      Actor Network
persistent undertaking                          discovery and collaboration
        │                                             │
        ├── personal Actors                           ├── people
        ├── service Actors                            ├── Productions
        ├── collective Actors                         ├── Gummies
        ├── Production configurations                 └── communities
        ├── Bowls
        ├── Actor Plans
        └── Gummies
                │
                ▼
        Agent execution layer
web · cloud · native · phone · specialist runtimes
                │
                ▼
      Returns · Receipts · evidence
                │
                ▼
ActorUpdateProposal / Production state / durable Gummies
```

Master Control governs authority, placement, data flow, synchronization, Agent assignment, approval, and revocation across the entire structure.

## Actor is a protocol class; the living Actor is the personal center

Gummy OS already supports several persistent Actor kinds:

- personal Actors;
- service Actors;
- Production or project Actors;
- organization Actors;
- collective Actors;
- other addressable computational presences.

The accepted Living Actor doctrine applies most strongly to a **personal Actor**.

A service Actor such as `@ImageHoss` is persistent and addressable, but it is not a simulated person and does not receive a Human-style Living Self Page. Its Actor surface presents capabilities, Molds, Production contexts, actual Agents, outputs, history, and evidence.

A Production may expose a Production Actor for messaging, discovery, or collaboration, but the underlying Production remains the governed undertaking.

This distinction preserves the usefulness of one Actor grammar without pretending every service, project, or organization is a person.

## The Living Self Page

The Living Self Page should answer, with provenance and confidence where appropriate:

- What am I making now?
- Which Productions are active, waiting, or complete?
- What have I learned?
- Which abilities have I demonstrated?
- What work was primarily Human-created, AI-assisted, or Agent-executed?
- Which creative patterns recur?
- Which ideas remain unfinished?
- Which people, Actors, Productions, or communities should I discover?
- What changed recently?
- What requires my approval?

A useful initial structure is:

```text
Now
active Productions, pending approvals, current attention

My Work
Productions, Gummies, accepted deliverables, unfinished ideas

Capabilities
skills and abilities with evidence and confidence

Creative DNA
recurring aesthetic, thematic, and problem-solving patterns

Knowledge
validated understanding separated from claims and generated text

Connections
people, service Actors, collectives, Bowls, and relationship rules

Extensions
ImageHoss, VideoBoss, 3D-Bee, Gummy Rooms, and future Actor App Surfaces

History and Evidence
Returns, Receipts, provenance, meaningful changes, and rejected proposals
```

The page may be visually expressive, but it must remain inspectable, accessible, and useful rather than becoming a decorative personal website.

## Actor memory layers

The accepted doctrine identifies four useful personal-Actor memory layers.

### Experience

Raw or lightly processed activity:

- conversations;
- creations;
- uploads;
- observations;
- interactions;
- Production participation;
- accepted and rejected work.

Experience is not automatically truth, mastery, identity, or preference.

### Knowledge

Validated information associated with the Actor.

The system must distinguish:

- claimed knowledge;
- observed ability;
- AI-assisted output;
- independently demonstrated mastery;
- inferred information;
- disputed or superseded information.

### Capability

A living graph of abilities supported by evidence. Capability records should identify source evidence, recency, confidence, scope, and whether the ability was Human-performed, jointly performed, or Agent-executed.

### Creative DNA

Patterns inferred over time, including:

- aesthetic preferences;
- recurring themes;
- problem-solving style;
- interests;
- values;
- preferred tools and working rhythms.

Creative DNA is useful guidance, not a prison. The Actor must remain capable of surprise, contradiction, and deliberate change.

## Learning is proposal-driven

Meaningful activity may teach the Actor, but no app, Agent, Production, or inference may silently rewrite durable identity.

Canonical flow:

```text
Activity or result
→ evidence capture
→ extraction / pattern proposal
→ classification and confidence
→ ActorUpdateProposal
→ Human or explicit policy approval
→ durable Actor update
→ Receipt
```

An app may write Production state or create a Gummy without promoting the same information into Actor memory.

Examples:

- ImageHoss may save a Production-specific visual direction without declaring it a permanent personal preference.
- Repeated accepted visual decisions may produce a proposal that the Actor tends toward a certain composition style.
- A generated image does not prove the Human independently possesses the underlying illustration skill.
- A completed Production may provide evidence of project leadership without exposing private source context publicly.

## Apps extend the Actor

Applications are not the architectural center. They are instruments through which the Actor perceives, creates, acts, and develops.

The canonical relationship is:

```text
Personal Actor
→ opens or @mentions service Actor
→ Actor App Surface configures the relationship for a Production
→ Production Run binds an actual Agent and capability adapter
→ result Gummies, Returns, and Receipts come back
→ optional ActorUpdateProposals are reviewed
```

First-party specialist applications retain their own repositories, interfaces, identities, storage, and execution boundaries.

For example, ImageHoss does not become a generic form embedded in Gummy OS. It remains a specialist image-direction instrument represented in Gummy OS by:

```text
@ImageHoss service Actor
→ ImageHoss Actor App Surface
→ Production-specific ImageHoss context
→ ImageHoss capability adapter
→ actual ImageHoss Agent/runtime
→ accepted image Assets and .hoss evidence
→ result Gummies and Receipts
```

## Production remains the durable undertaking

The Living Actor is the personal center. A Production is what one or more Actors undertake together.

```text
Actor
who or what participates

Production
what the participants are making or accomplishing

Actor Plan
how one bounded piece of Production work is composed

Agent
how an execution node performs

Gummy
what carries sources, work, context, and results

Bowl
where shared work gathers
```

A Production may visually appear as a chamber in the Underground, but the chamber is a presentation of the Production—not a replacement protocol object.

The Actor learns across Productions only through explicit evidence and approved updates. Production-specific configuration remains isolated by default.

## Actor branches and specialized perspectives

A personal Actor may create specialized branches such as:

- Founder Actor;
- Engineering Actor;
- Creative Director Actor;
- Research Actor.

These are perspectives or scoped child Actors, not replacement identities.

The phrase "inherit knowledge" means **explicitly selected knowledge references under a declared Mold and policy**. It never means automatic inheritance of:

- Human authority;
- private memory;
- credentials;
- Grants;
- Task Leases;
- publishing rights;
- external account access;
- unrelated Production context.

Every branch receives its own identity, purpose, provenance, capability ceiling, memory boundary, synchronization policy, and revocation path.

## The Actor Network

The social loop is:

```text
Actor
→ Discovery
→ Collaboration
→ Production
→ meaningful evidence
→ Actor growth
→ new Discovery
```

The objective is not engagement farming, follower counts, or an infinite feed. It is helping Humans find interesting people, ideas, capabilities, artifacts, communities, and Productions.

Discovery may use public Actor evidence and intentionally shared Gummies while keeping private memory and Production context bounded.

## The Underground

The Underground is the experiential, spatial, and social environment surrounding the Actor-first system.

It gives the product a memorable world model:

- Productions may appear as chambers;
- Bowls may appear as shared rooms or gathering caverns;
- Gummies may appear as artifacts, instruments, or carried objects;
- communities may appear as settlements;
- discoveries may open passages;
- Glopper may guide the Human through the environment;
- service Actors and actual Agents may be represented as inhabitants or equipment while remaining technically distinct.

This is a metaphor and interaction language, not an authority model.

The exact cave geography, crystals, materials, wallpaper library, and requirement for continuous 3D navigation are **not yet locked brand canon**. Gummy OS may use curated subterranean art, transitions, maps, wallpapers, empty states, and landmarks while retaining fast conventional windows and accessible navigation.

> **The realm surrounds the interface; it must not obstruct the work.**

## Gummy's role

Gummy is the platform guide and orientation personality: the lantern that helps the Human understand where they are, what connects, and what has changed.

Glopper remains the action companion: the visible guide to Work Orders, execution, approvals, progress, and results.

Mascot presentation never hides actual Actor, Agent, Mold, Lease, Grant, runtime, locality, or Receipt identity.

## Implementation order after the consolidated Production runtime

The consolidated runtime proves Production composition, Actor App Surfaces, Production-specific configuration, Make Production, bounded reference Agents, typed drag proposals, persistence, and evidence.

The next architectural sequence is:

1. define the ImageHoss Production Prompt Contract with founder input;
2. attach the first real ImageHoss capability adapter without changing Actor or Production identity;
3. prove accepted ImageHoss Assets return as Gummies with lineage and Receipts;
4. add the first bounded meaningful-activity-to-ActorUpdateProposal path;
5. build the initial Living Self Page from existing evidence rather than invented claims;
6. connect Productions, capabilities, creative patterns, and discovery into that page;
7. expand the Underground experience only after the underlying Actor evidence is real.

## Locked invariants

- Human authority remains above the personal Actor.
- Actor and Agent never collapse.
- The Living Self Page is a surface, not an authority principal.
- Apps extend Actors through explicit capabilities and evidence.
- Production-specific state does not silently become Actor-global memory.
- Actor learning is evidence-aware and proposal-driven.
- AI-assisted work is never misrepresented as independent Human mastery.
- Actor branches never inherit ambient authority or private memory.
- Discovery never requires an engagement-farming feed.
- Underground presentation never replaces protocol, storage, accessibility, or Master Control.
- The exact subterranean visual canon remains open until founder approval.

## Canonical statement

> **The Human owns the authority. The Actor is the living continuity. Productions are what Actors make together. Apps extend the Actor. Agents perform bounded work. Gummies carry the evidence. The Underground is where discovery, creation, and collaboration become a world.**
