# The Gummy OS Social Layer

## Purpose

Your digital life is not an advertising graph.

Gummy OS builds social computing from portable, user-owned, addressable Actors and explicit objects with visible ownership, audience, authority, provenance, and history.

The Social Layer is optional. A private, local-only Personal Gummy OS remains complete.

## Canonical model

```text
Human = ultimate personal authority
Actor = persistent addressable entity in the web/world
Agent = executable intelligence that may operate an Actor
Mold = permissioned embodiment and operating contract
Master Control = placement, sync, permission, and revocation authority
Gummy = what an Actor creates, owns, receives, or operates
Bowl = where Actors and Gummies gather
Link = how they relate
Grab = independent derivation preserving the source
```

## Actor

An Actor is the persistent web-openable presence others can visit, follow, invite, collaborate with, or address.

An Actor may embody:

- a person;
- a public figure or celebrity;
- a licensed character;
- an organization;
- a project role;
- a service;
- a world;
- another persistent computational presence.

Every Actor has a stable `@address`. Opening an Actor does not grant control over it.

## Agent

An Agent is separate executable intelligence that may operate an Actor under a Mold, Master Control policy, and Grant.

Agents are not listed as Actor classes. When an Agent needs a public social presence, it may operate or be represented by an Actor, but the Agent identity remains separately visible in Receipts and disclosures.

## Mold

A Mold is the permissioned embodiment and operating contract through which a Human or Agent may open, represent, perform, or operate an Actor.

A Mold can define:

- authorized Human and Agent operators;
- public representation;
- role and context;
- permitted capabilities;
- data access;
- publication and synchronization policy;
- runtime/locality limits;
- proof, license, and disclosure requirements;
- expiry and revocation.

A Mold is what makes official celebrity, performer, character, organization, guest, and delegated-Agent operation possible without confusing appearance with authority.

## Gummy

A Gummy is anything an Actor creates, owns, keeps, receives, shares, or operates: note, file, image, video, project, application, conversation, workflow, invitation, result, or verified artifact.

Every shared Gummy identifies its owner Actor, creator Actor, operating Agent where applicable, Mold, audience, provenance, rights, dependencies, revision, and Grab policy.

## Bowl

A Bowl is a shared environment with explicit Actors, allowed Molds, Gummies, membership, roles, visibility, and rules.

Examples include family, project, classroom, creator, enterprise, and event Bowls.

## Link

A Link is a typed, inspectable relationship.

Examples:

- follows;
- member-of;
- belongs-to;
- controlled-by-human;
- represented-by;
- operated-by-agent;
- created-by;
- deployed-to;
- synchronized-with;
- collaborates-with;
- delegates-to;
- trusts-for;
- shared-with;
- derived-from;
- grab-of;
- approved-by.

Links are explicit protocol objects, not invisible platform inference.

## Grab

A Grab creates a new independent Gummy while preserving source ID, revision, hash, rights, attribution, and a `grab-of` Link. The source is never changed.

## Product surfaces

- **Actors** — deliberate discovery and opening through stable `@addresses`.
- **Actor Home** — the Actor's public or private web-openable environment.
- **Molds** — permitted ways Humans or Agents may represent or operate an Actor.
- **Master Control** — private authority over placement, Agent assignment, sync, and revocation.
- **Agents** — separate execution identities and disclosures.
- **Bowls** — shared environments.
- **Gummies** — shared objects.
- **Grab** — provenance-preserving independent copy.
- **Link Inspector** — ownership, representation, operation, delegation, sync, audience, and provenance.

## Privacy model

- Private by default.
- Opening is distinct from controlling.
- Saving is distinct from publishing.
- Every shared Gummy shows its audience.
- Public Actor state is separate from private Human and Master Control state.
- Molds expose only the representation and permissions required for their purpose.
- Agent operation is disclosed.
- Blocking cuts discovery and delivery Links where possible.
- Revocation blocks future operation and synchronization.
- No advertising profile is required.

## Agent participation

An Agent may:

- operate an Actor under an active Mold;
- create Gummies for that Actor under a Grant;
- participate in a Bowl only when the Actor, Mold, and Bowl policy permit it;
- create Links or Grabs only under explicit authority.

The system must disclose which Agent acted, which Actor it acted through, which Mold allowed it, and which Human or organization sponsored it.

## Celebrities, performers, and characters

This is where the Actor/Mold/Agent architecture becomes especially powerful:

- a celebrity can have one official persistent Actor at a verified `@address`;
- the celebrity may control it directly;
- an authorized team or Agent may operate it through limited official Molds;
- a performer may authorize a character Mold;
- a fictional character may have a licensed Actor;
- multiple Agents may perform bounded functions without becoming the celebrity or character;
- fan Actors and fan Gummies remain distinct from official ones;
- Receipts preserve who actually operated the Actor;
- Master Control allows immediate revocation or change of operator.

The protocol defines the identity and authority bridge. It does not yet commit Gummy OS to a celebrity marketplace.

## Federation direction

Future compatible Gummy OS instances may exchange signed Actor, Mold, Gummy, Bowl, Link, Grab, and revocation objects while Agents remain independently hosted and disclosed.

An Actor's stable address survives changes in Agent, device, runtime, and provider.

## Initial Social Layer proof

Only after Personal Gummy OS works:

1. Open two distinct Actors by `@address`.
2. Verify each has separate Human authority, Agent binding, and Mold state.
3. Create a private Bowl.
4. Share a Gummy with an explicit audience.
5. Establish a Link.
6. Grab an allowed Gummy.
7. Inspect Actor, Human sponsor, Agent, Mold, rights, source, and provenance.
8. Revoke an Agent or Mold and prove future operation is blocked.
9. Persist and resume the state.

## Legacy compatibility

Snack, Snack Graph, Drop, and Fork remain Protocol 0.1 migration inputs. Agent-as-Actor assumptions from the earlier Protocol 0.2 draft are also superseded.
