# Gummy OS Platform, Playground, and Security Thesis

**Status:** Founder architecture ruling  
**Date:** 2026-07-25  
**Scope:** Product identity, native/WebOS relationship, Z experience, composability, recursion, security posture, and Ubuntu integration order

## The platform thesis

Gummy OS is not one prescribed workflow and it is not a replacement desktop metaphor imposed on everyone.

It is a new general-purpose creative and computational medium:

> A secure, playful WebOS canvas where Humans open persistent Actors, connect them to Agents through Molds, create and operate Gummies, discover other Actors, compose new environments, and decide through Master Control exactly what may cross into native compute.

The system should feel like a powerful toy before it feels like enterprise infrastructure. Play is the onboarding. Exploration reveals capability.

## Existing native foundation

The AI-native Linux distribution is **not a future hypothetical and must not be rebuilt in this repository**.

Hayden already has a substantial local implementation of the native distribution. It is an ordinary usable Linux distribution with an optional AI system-control layer and a native chat/control surface. It has also been built in a live-USB form.

That existing local implementation is an integration input. The first Ubuntu session must inspect its real code, processes, launch paths, capability surfaces, and current Agent behavior before proposing replacement architecture.

This repository owns Gummy OS and the protocol boundary. It does not claim ownership of, or duplicate, the full native distribution implementation.

## The two computers

```text
Physical computer or phone
│
├── Host / native OS security, identity, networking, hardware
│
├── Native AI layer when available
│   ├── AI-native Linux distribution / Glyphd OS
│   ├── native Agent such as Zeke
│   └── native Z chat and control surface
│
└── Gummy OS
    ├── browser-delivered WebOS
    ├── Actors and @addresses
    ├── Gummies, Bowls, Links, and Grabs
    ├── applications and mini-apps
    ├── Z bar and expandable Z panel
    └── Master Control view of every bridge to native authority
```

Gummy OS can run:

1. inside the existing AI-native Linux distribution;
2. in a normal browser on Windows, macOS, Linux, Android, or iOS;
3. as an installable PWA;
4. inside a native shell or governed WebView;
5. from a portable live-USB environment where the native distribution is available.

A person does not need the AI-native Linux distribution to use Gummy OS. The native distribution adds local Agent power, device control, private compute, and stronger local orchestration.

## The Z experience

Z has three distinct meanings that must not be collapsed:

- **Z Agent** — executable intelligence;
- **Z surface inside Gummy OS** — the persistent conversational and command interface;
- **native Z app/panel** — the external chat, voice, approval, notification, and device-control interface.

### Inside Gummy OS

Gummy OS is the canvas. Z is always available but does not consume the canvas unless expanded.

```text
┌───────────────────────────────────────────────┐
│                                               │
│   ACTORS · WINDOWS · GUMMIES · APPLICATIONS   │
│                THE CANVAS                     │
│                                               │
├───────────────────────────────────────────────┤
│ Z: ask, speak, attach, direct, approve…    ↑  │
└───────────────────────────────────────────────┘
```

The collapsed Z bar provides invocation, context, voice, attachment, and current-state indication.

The expanded Z panel provides conversation, current task, Actor, Agent, Mold, Master Control, requested Grants, results, and Receipts.

Z is globally available across the WebOS rather than trapped as an ordinary dock application. Consequential action still requires the correct authority.

```text
automatic availability != automatic authority
```

### Outside Gummy OS

The native Z app or native distribution panel can continue conversation, show approvals, manage devices, monitor local work, and open the relevant Actor or Gummy in Gummy OS.

Only Master Control-approved state synchronizes between the native Z surface and Gummy OS.

## Open-ended toolkit, not a forced interface

Gummy OS should not prescribe one correct way to work.

It provides primitives:

- canvas;
- windows;
- Actors;
- Agents;
- Molds;
- Master Control;
- Gummies;
- Bowls;
- Links;
- Grabs;
- applications;
- protocols;
- runtimes;
- Receipts.

People, communities, developers, and Agents may arrange those primitives into tools that the core team did not predict.

The earlier hexagonal interface remains valuable as a **mini-app or optional surface inside Gummy OS**. It is not the required shell for every user.

Other interfaces—linear, spatial, game-like, cinematic, professional, accessible, child-friendly, enterprise, or world-specific—may coexist as applications or Actor surfaces.

## Recursive creation is allowed

The future becomes powerful when composition is recursive:

- Humans create Actors;
- Agents help create Actors;
- Actors commission or bind Agents;
- Agents create Gummies for Actors;
- Actors create or host tools that create new Agents or Actors;
- multiple Actors discover one another and compose a new shared surface;
- a composed surface may later become a new Actor, Mold, Bowl, application, or Gummy.

This recursion is intentional.

The invariant is:

> Creation never implies inherited authority.

Every newly created Actor or Agent receives its own stable identity, provenance, capability ceiling, Mold, Master Control relationship, disclosure, and revocation path.

An Agent that creates another Agent does not automatically transfer its Grants. An Actor that creates another Actor does not automatically control it forever. A composed page does not silently merge private state.

## Actor discovery and composition

Gummy OS should eventually work like an explorable internet of addressable Actors.

An Actor surface may:

- discover another Actor by `@address`;
- request a Link;
- open public or authorized Gummies;
- invite an Actor into a Bowl;
- propose a composition;
- create a new shared canvas;
- preserve every source and relationship.

The final semantics of “two pages merge into a new page” are deliberately not locked yet. Depending on the prototype, the result may be:

- a new Bowl;
- a composed Gummy;
- a new Mold;
- a new Actor;
- a temporary shared canvas;
- an application generated from the participating Actors.

Cursor must not prematurely choose one universal interpretation. Build the protocol boundaries first, then prototype composition through real use.

## Security posture

Gummy OS does not replace enterprise endpoint security, identity providers, network controls, secure boot, disk encryption, kernel protections, EDR, MDM, passkeys, biometrics, or hardware-backed credentials.

Those controls remain where they are strongest: at the host, OS, network, identity, and organization layers.

Gummy OS adds a new containment and authority layer above them.

### Security separation

```text
Host / enterprise security
protects device, kernel, identity, connection, and native resources

Native Agent boundary
mediates explicit local capabilities and monitors approved signals

Gummy OS boundary
contains most everyday creative, social, and agent-operated activity

Actor / Mold / Master Control
defines who may do what, where, with which data

Receipt boundary
records consequential actions and movement across layers
```

### WebOS containment

When most ordinary activity occurs inside Gummy OS:

- web content remains inside browser-origin or capsule boundaries;
- downloaded content can first land as a quarantined Gummy rather than a native executable file;
- suspicious sessions or capsules can be closed, reset, or burned;
- native access requires an explicit bridge, Mold, Grant, and Master Control approval;
- the native Agent can observe approved telemetry and security events without granting the WebOS ambient host access.

A file existing inside Gummy OS does not automatically mean it can execute on the native OS.

### Promotion gateway

Moving content from Gummy OS into native authority is a distinct consequential action:

```text
quarantined Gummy
→ inspect / scan / classify
→ Human approval or policy
→ bounded export Grant
→ native destination
→ Action Receipt
```

The inverse direction is also explicit: native files are imported into Gummy OS through a bounded interface rather than exposing the entire host filesystem.

### Disposable environments

A Gummy OS workspace, Actor session, or execution capsule may be designed to be disposable:

- snapshot before risky work;
- isolate network and filesystem access;
- retain approved results and Receipts;
- burn the environment after completion or suspicion;
- recreate from trusted state.

“Burnable” is an architectural capability, not a claim that every current browser window is already hardened against every threat.

### Native security Agent

A native Agent inside the AI-native Linux distribution may watch Gummy OS for approved security signals such as:

- unexpected network destinations;
- prohibited capability requests;
- suspicious download metadata;
- integrity failures;
- repeated denied actions;
- anomalous resource use;
- attempts to cross the native bridge.

Monitoring must be transparent, scoped, and receiptable. The monitoring Agent does not silently read all private Actor state merely because it is defensive.

### Security research and authorized testing

Actors and Agents can become a powerful defensive-security design environment:

- isolated test Actors;
- disposable target environments;
- specialized analysis Agents;
- explicit scopes and authorized targets;
- separate reconnaissance, detection, remediation, and verification roles;
- complete Receipts and replayable evidence;
- immediate revocation and destruction.

The platform supplies composition, isolation, authority, and evidence. It does not automatically grant offensive capability or authorization against third-party systems.

## Biometric and portable deployment

Authentication may occur at any terminal through passkeys, biometrics, organization identity, hardware keys, or other verified methods while the Actor remains portable.

A live-USB distribution can provide a portable native life:

- boot trusted native environment;
- authenticate the Human;
- start the native Agent;
- open Gummy OS;
- resolve the Actor;
- restore only authorized state;
- use the host primarily for hardware, display, input, networking, and compute;
- leave without persisting unapproved local state.

This is a supported future deployment mode and should be evaluated against the existing live-USB implementation rather than rebuilt from speculation.

## Honest security claim

The architecture has a strong security posture, but Gummy OS must not advertise itself as automatically secure merely because it runs in a browser or inside Linux.

Security claims require evidence for:

- origin and capsule isolation;
- bridge restrictions;
- Agent confinement;
- storage encryption;
- authentication;
- sync correctness;
- revocation;
- quarantine and promotion behavior;
- Receipt integrity;
- recovery and burn behavior.

The product promise is **explicit boundaries and smaller blast radius**, verified progressively.

## Immediate Ubuntu integration order

The next coding session begins on Ubuntu with the existing native distribution and the current `bohselecta/gummy-os` repository.

1. **Inspect, do not rebuild, the native distribution.** Record local path, launch command, current native chat/control process, capability interface, browser/WebView availability, and existing live-USB assets.
2. **Run Gummy OS inside the distribution.** Start with an ordinary browser or existing WebView; do not add privileged bridges yet.
3. **Implement the Z hybrid surface.** Persistent collapsed Z bar plus expandable panel inside Gummy OS.
4. **Expose the local Actor and Master Control.** Show `@address`, current Agent, Mold, authoritative location, sync mode, and revocation.
5. **Add one explicit localhost/native bridge.** The bridge begins deny-by-default and supports only the exact bounded task required by the active work order.
6. **Complete the real source-Gummy to result-Gummy journey.** Preserve source bytes and produce a complete Receipt.
7. **Prove revocation.** Remove the Agent or Mold and show future execution is blocked.
8. **Prove containment.** Import a harmless test file into a quarantined Gummy, show it lacks native execution authority, and burn/reset the test workspace while preserving approved evidence.
9. **Only then evaluate native Zeke binding, device control, sync, and live-USB packaging.**

## Product principle

Gummy OS is serious infrastructure that should feel like an astonishing creative toy.

The security model makes experimentation safe enough to invite exploration. The playful canvas makes the security architecture desirable enough that people voluntarily use it.

> The future should not arrive as a rigid workflow. It should arrive as a playground with understandable power, visible boundaries, and a Human still in control.
