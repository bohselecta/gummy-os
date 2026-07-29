# Gummy OS Shared Vision → Production Formation Model

**Status:** Founder architecture design  
**Date:** 2026-07-28  
**Scope:** Emergent usage model for transforming social conversation into a governed collaborative Production, including shared compute, contribution agreements, attribution, and provenance.  
**Precedence:** Extends `docs/SOCIAL_LAYER.md`, `docs/ACTOR_FIRST_PRODUCTION_MODEL.md`, and `docs/PRODUCTION_ACTOR_RUNTIME.md`. It does not replace Actor, Agent, Bowl, Production, Work Order, Master Control, Return, or Receipt semantics.

## 1. Core realization

The architecture already exists. This document describes how Humans naturally use it.

A social conversation is not merely a stream of messages. Inside an Actor-based operating environment, a group of Actors discussing a shared idea can become the origin of a Production.

```text
Conversation / Session
        ↓
Shared Vision
        ↓
Production Proposal
        ↓
Production Agreement
        ↓
Production Formation Event
        ↓
Work Orders + Production Pool
        ↓
Production Run
        ↓
Shared Results + Returns + Receipts
        ↓
Approved Distribution
```

Canonical rule:

> **A Shared Vision recognizes collective intent. It does not create authority, spend money, assign ownership, or execute work.**

## 2. Conversation as provenance

A Room, Bowl, or Social Instance already knows:

- which Actors were present;
- which messages, Gummies, links, files, and windows were in scope;
- when the idea appeared;
- who proposed, revised, accepted, rejected, or volunteered something;
- which resources or capabilities were offered;
- which decisions were explicit and which remain inferred.

The originating conversation becomes a provenance source, not the Production itself.

Example:

```text
Session: Friday Night Video Idea
Actors: @Hayden, @Bob, @Sarah
Origin records: messages 118–163, reference board v2
Emerging intent: “Let’s make a cyberpunk music video.”
Proposed Production: Cyberpunk Short Film
```

The system may cite the source records, but it must not silently transform private conversation into public Production material.

## 3. Shared Vision

A **Shared Vision** is a group-generated, non-executing intent state.

Recommended protocol:

```text
gummy.shared-vision/v1
```

It contains:

- stable ID and revision;
- originating Bowl, Session, or Social Instance;
- participating Actor IDs;
- selected origin record references and hashes;
- a Human-readable intent statement;
- proposed goal and possible outputs;
- unresolved questions;
- volunteered capabilities, Assets, labor, distribution, or compute;
- privacy and audience;
- formation readiness;
- explicit Human acknowledgements;
- provenance and timestamps.

Recommended states:

```text
observed
proposed
acknowledged
estimating
ready-to-form
formed
paused
rejected
expired
```

A Shared Vision may remain valuable forever without becoming a Production.

## 4. Assisted recognition, never automatic formation

Gummy may recognize collaborative momentum in an active, permissioned Session and offer:

```text
This looks like a Shared Vision.

Continue conversation
Save as idea
Create Shared Vision
Estimate a Production
Invite contributors
```

Recognition may use:

- explicit phrases such as “we should make this”;
- multiple Actors volunteering roles or resources;
- repeated reference to one intended result;
- explicit requests to estimate, organize, or begin.

The detector must:

- operate only on the currently permitted Session context;
- explain why the suggestion appeared;
- create no Production, charge, ownership claim, invitation, or publication;
- allow dismissal without penalty;
- avoid behavioral advertising or hidden social profiling.

## 5. Production Proposal

A **Production Proposal** converts the Shared Vision into a reviewable undertaking proposal.

It should include:

- proposed title and goal;
- source Shared Vision revision;
- proposed owner and governance mode;
- candidate participants and roles;
- proposed deliverables;
- required Studios, Places, Agents, and runtimes;
- source and rights requirements;
- estimated cost range;
- proposed schedule or milestones;
- privacy and audience;
- contribution model;
- acceptance checks;
- unresolved blockers.

A proposal is not a Production Run and does not authorize spending.

## 6. Production Agreement

Before collective resources are used, participating Actors approve a versioned **Production Agreement**.

Recommended protocol:

```text
gummy.production-agreement/v1
```

The agreement governs:

- Production owner or collective governance mode;
- participant roles;
- decision rights and approval thresholds;
- contribution categories and valuation policy;
- budget and cost allocation mode;
- credit and attribution;
- intellectual-property and license terms;
- revenue or benefit-sharing terms, when applicable;
- access, privacy, confidentiality, and publication;
- withdrawal and replacement;
- disputes and amendment;
- termination and archival handling.

Canonical rule:

> **Contribution, credit, ownership, control, and revenue participation are separate dimensions. None is inferred from another.**

Paying for compute does not automatically create authorship or ownership. Creating the storyboard does not automatically authorize publication. Membership does not automatically permit spending.

Every accepted agreement revision is immutable. Amendments create a new revision and invalidate stale approvals where affected.

## 7. Production Pool

A **Production Pool** coordinates resources for one Production or Run.

Recommended protocol:

```text
gummy.production-pool/v1
```

It may coordinate:

- compute budget;
- provider charges;
- local-runtime capacity;
- subscription or service allocations;
- donated credits;
- equipment or storage;
- labor commitments;
- distribution commitments.

The Pool is not necessarily a stored-value account. Initial implementation should avoid holding user funds or inventing an internal currency.

### 7.1 Cost lifecycle

```text
Estimate
→ allocation proposal
→ individual contribution authorizations
→ Run approval
→ provider reservation or charge
→ actual usage
→ reconciliation
→ Receipt
```

Required distinctions:

- **estimate** — expected cost range;
- **commitment** — contributor states willingness up to a maximum;
- **authorization** — contributor approves a specific amount and route;
- **capture/charge** — external provider payment event;
- **actual usage** — measured compute or service consumption;
- **reconciliation** — difference between authorization and actual cost;
- **refund/release** — unused authorization or failed execution handling.

No contributor’s maximum may increase automatically.

### 7.2 Allocation modes

Supported design modes:

```text
equal
fixed-amount
fixed-percentage
capped-equal
sponsor
resource-weighted
custom
mixed
```

New contributors may reduce future uncommitted shares, but the system must not:

- rewrite completed charges;
- retroactively alter ownership or credit;
- increase another contributor’s maximum;
- silently change an already approved Run;
- represent an estimate as a final charge.

Every recalculation is a proposal with a visible before/after comparison.

Example:

```text
Estimated compute: $10.00
Hayden authorized: $4.00 maximum
Bob authorized: $3.00 maximum
Sarah authorized: $3.00 maximum

New contributor joins before Run approval:
Proposed future allocation: $2.50 each
Existing authorizations remain unchanged until each contributor approves the revision.
```

### 7.3 Failure and cancellation

If a Run fails, is denied, or is cancelled:

- provider-side charges remain factual and are not hidden;
- unused authorizations are released where supported;
- refunds are recorded as separate payment events;
- partial outputs are not accepted automatically;
- the Pool reconciles actual cost against the failed Run Receipt;
- retrying creates a new Run allocation proposal.

## 8. Contribution Ledger

A **Contribution Ledger** records what each Actor brought to the Production becoming real.

Recommended protocol:

```text
gummy.contribution-ledger/v1
```

Contribution categories:

```text
financial / compute
creative direction
writing / story
design / visual work
technical work
labor / coordination
Assets / references / recordings
expertise / review
rights / licenses
storage / infrastructure
distribution / audience / promotion
other declared contribution
```

Each entry should include:

- contributor Actor;
- category and description;
- quantity, unit, duration, or optional declared value;
- linked Gummy, Work Order, Return, Receipt, or payment event;
- source and evidence;
- proposed, accepted, disputed, withdrawn, or superseded status;
- acknowledgement by affected Actors;
- credit effect;
- ownership effect, if explicitly agreed;
- compensation or reimbursement effect, if explicitly agreed;
- revision and timestamp.

The ledger is append-only. Corrections supersede earlier entries rather than deleting history.

Canonical rule:

> **The ledger records contribution evidence. The Production Agreement determines what that contribution means.**

## 9. Production Formation Event

The transition from Shared Vision to Production is recorded as an immutable **Production Formation Event**.

Recommended protocol:

```text
gummy.production-formation/v1
```

It records:

- source Shared Vision ID and revision;
- source Session/Bowl/Social Instance;
- created Production ID;
- approved Production Agreement revision;
- initial Actor roster and roles;
- initial source Gummies;
- initial Production Pool;
- initial contribution commitments;
- formation method;
- Human approvals;
- unresolved limitations;
- timestamp and Receipt.

This event provides the historical chain:

```text
Conversation
→ Shared Vision
→ Agreement
→ Production
→ Runs
→ Results
→ Distribution
```

## 10. Work Orders and Make Production

Formation does not weaken existing execution law.

```text
Production formed
→ Actors configure their roles
→ Actor Plan compiled
→ Production Pool authorizations reviewed
→ Master Control approves exact Run
→ Make Production
→ immutable Run + Work Orders + Leases + Grants
→ bounded execution
→ Returns + Receipts
```

Shared compute does not create a second execution path. **Make Production remains the sole Production-wide execution transition.**

## 11. Attribution, ownership, and public credit

A result may display:

- originating Shared Vision;
- Production;
- participating Actors;
- accepted contribution credits;
- operating Agents and Studios;
- source and rights provenance;
- funding or compute support;
- distribution channel;
- Receipts.

Public credit is generated from the accepted Agreement and Ledger—not from message volume, payment size, or model inference.

Sensitive financial amounts may remain private while public support categories remain visible.

## 12. Privacy and consent

- Private conversation remains private by default.
- Only selected origin records enter a Shared Vision source package.
- Every participant can inspect what is quoted or referenced.
- AI representation cannot approve financial, ownership, likeness, voice, or publication terms unless an explicit Mold and Grant permit the exact action.
- Withdrawal prevents future use where possible but does not erase immutable historical Receipts.
- Exact personal payment details remain with the payment provider; Gummy stores bounded references and Receipts.
- Production Pools cannot expose other contributors’ private payment instruments.

## 13. User-facing formation flow

The Human-facing flow should use verbs while preserving canonical objects underneath:

```text
Save this idea
See who is involved
Estimate what it needs
Agree how we will make it
Choose what you will contribute
Review the plan
Make Production
Review the result
Publish or keep private
```

The LLM and protocol continue to see:

```text
Shared Vision
Production Proposal
Production Agreement
Production Pool
Contribution Ledger
Formation Event
Work Orders
Run
Returns
Receipts
Distribution Plan
```

## 14. Non-goals for the first implementation

- no internal cryptocurrency or speculative token;
- no automatic equity or copyright allocation;
- no custody of pooled funds without a separately accepted regulated design;
- no hidden social scoring;
- no automatic conversion of chats into Productions;
- no retroactive billing changes;
- no public crowdfunding marketplace in the first proof;
- no AI acceptance of financial, ownership, likeness, voice, or publication terms on behalf of a Human without explicit narrow authority.

## 15. First proof

The first complete proof should demonstrate:

1. Three local Actors in a saved Social Instance discuss a shared result.
2. Gummy proposes a Shared Vision and cites the exact selected origin records.
3. The Human creates a Production Proposal.
4. Participants approve a simple equal or custom Production Agreement.
5. A $10.00 compute estimate is allocated without charging anyone.
6. A new contributor joins and a lower future allocation is proposed without changing prior authorizations.
7. Each contributor explicitly authorizes their maximum.
8. Master Control shows cost, permissions, sources, and decision rules.
9. Make Production creates the immutable Run and Work Orders.
10. A deterministic or low-cost bounded execution completes.
11. Returns, Receipts, actual cost, contribution entries, and accepted results persist.
12. Distribution remains a separate explicit approval.

## 16. Founding thesis

> **A Shared Vision is the moment a latent object becomes socially recognized. A Production is the governed structure through which people accept responsibility for bringing it into existence.**

The unit of computing becomes:

```text
people
→ shared intent
→ agreement
→ coordinated resources
→ evolving object
→ inspectable result
```
