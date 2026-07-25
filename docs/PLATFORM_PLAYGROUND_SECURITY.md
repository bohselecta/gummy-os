# Gummy OS Platform, Playground, and Security Thesis

**Status:** Founder architecture ruling  
**Date:** 2026-07-25  
**Scope:** Platform identity, Glopper experience, Gummy Bar, native/WebOS relationship, composability, recursion, security posture, and development order

## Platform thesis

Gummy OS is not one prescribed workflow and not a desktop metaphor imposed on everyone.

It is a general-purpose creative and computational medium:

> A secure, playful WebOS canvas where Humans open persistent Actors, connect them to Agents through Molds, create and operate Gummies, discover other Actors, compose new environments, and decide through Master Control exactly what may cross into native compute.

The system should feel like a powerful toy before it feels like enterprise infrastructure. Play is the onboarding. Exploration reveals capability.

## Final surface and companion identity

```text
Gummy OS       = universal platform and WebOS
Gummy Canvas   = open working and creation surface
Gummy Bar      = persistent candy-store system bar
Glopper        = gummy-candy companion and first-party Agent identity
Glopper Panel  = expanded conversation and control surface
Glopper App    = standalone native/mobile interface
```

Do not create separate product identities called Gummy Desktop or Gummy Web. The platform remains Gummy OS across device classes.

## Gummy Canvas and Gummy Bar

Gummy OS is the canvas. The Gummy Bar stays available along an edge of the Canvas without dominating it.

The Gummy Bar is visually a candy store: a persistent collection of candy icons representing Glopper, applications, mini-apps, Actors, Gummies, Bowls, tools, tasks, notifications, and controls.

A candy icon is presentation only. It does not create a new protocol object type.

```text
┌───────────────────────────────────────────────┐
│                                               │
│   ACTORS · WINDOWS · GUMMIES · APPLICATIONS   │
│                GUMMY CANVAS                   │
│                                               │
├───────────────────────────────────────────────┤
│ 🍬  🍭  ◉  ◇  [GLOPPER]  ✦  ▣  🍬           │
│                 GUMMY BAR                     │
└───────────────────────────────────────────────┘
```

## Glopper experience

Glopper has four related but distinct meanings:

- **Glopper character** — gummy-candy mascot, personality, voice, motion, and relationship with the Human;
- **Glopper Panel** — expanded conversational and command interface inside Gummy OS;
- **Glopper App** — standalone native or mobile interface;
- **Glopper Agent** — executable identity named in Grants and Receipts.

Glopper is a special persistent candy in the Gummy Bar. Selecting it expands the Glopper Panel while preserving the Canvas.

The Glopper Panel shows:

- conversation and voice;
- current Actor and Canvas context;
- current task and task lease;
- Agent identity and locality;
- active Mold;
- Master Control state;
- requested Grants;
- generated Gummies;
- Receipts and errors.

```text
automatic availability != automatic authority
```

Glopper may have separate executors:

```text
agent:glopper-web
agent:glopper-native
agent:glopper-cloud
agent:glopper-phone
```

They may share the character and an approved portable preference profile, but are separate execution identities.

## Existing Glopper lineage

`bohselecta/glopper` already implements a local-first deterministic process director for multi-agent AI build workflows.

That application remains a real independent product and becomes Glopper's first substantial native lineage. Its current strengths—run state, gates, project memory, handoffs, evidence parsing, and hash-chained advancement—can become native companion capabilities over time.

The existing app is not falsely declared to be the complete future Glopper platform.

## Existing native foundation

Hayden already has a substantial local AI-native Linux distribution, including optional AI system control, a native chat/control surface, and a live-USB build.

It is an integration input, not a prerequisite for the first Gummy OS build and not something to reconstruct from GitHub speculation.

Development proceeds in this order:

1. make Gummy OS and `agent:glopper-web` work independently in an ordinary Ubuntu browser;
2. prove the Gummy Canvas, Gummy Bar, Glopper Panel, Actor, Mold, Master Control, Gummies, quarantine, and Receipts;
3. only then inspect the existing native distribution;
4. connect `agent:glopper-native` through one deny-by-default bridge;
5. evaluate native device control, local model harnesses, live-USB behavior, and selective synchronization from real evidence.

## One companion, multiple executors

From the Human's perspective, Glopper is one companion available across Gummy OS, native systems, and future phones.

Underneath, the router chooses among distinct executors based on:

- where authoritative files live;
- required capability;
- privacy and data classification;
- availability;
- cost and latency;
- current task lease;
- Human preference;
- Mold and Master Control policy.

### Web Glopper can operate

- Gummy OS and local browser Gummies;
- web applications;
- GitHub and remote repositories;
- cloud development environments;
- Vercel and connected services;
- web research and SaaS tools;
- remote inference brokers;
- Actors, Bowls, Links, Grabs, and shared canvases.

### Native Glopper can operate

- explicitly granted local directories;
- uncommitted repositories;
- Cursor or another IDE;
- local coding CLIs;
- shells, processes, containers, VMs, databases, GPUs, and devices;
- Ollama, llama.cpp, and other local inference;
- private data that must stay local.

Web Glopper delegates native work through a bounded task contract. It never receives ambient local-directory authority.

## Local adaptation harness

A small local harness may learn adaptations and interests without requiring the main Agent to be local.

```text
Private local memory
raw history, local files, detailed adaptations
never synchronizes automatically

Approved portable profile
selected preferences, corrections, terminology, routing choices
synchronizes only through Master Control

Current task context
temporary material supplied to the selected executor
```

Ollama, llama.cpp, embeddings, classifiers, and structured memory are sufficient initial components. The harness proposes portable updates; the Human approves them.

## Open-ended toolkit

Gummy OS provides primitives rather than one mandatory interface:

- Gummy Canvas;
- Gummy Bar;
- Actors;
- Agents;
- Molds;
- Master Control;
- Gummies;
- Bowls;
- Links;
- Grabs;
- applications and mini-apps;
- protocols;
- runtimes;
- Receipts.

The prior hexagonal interface remains an optional mini-app or Actor surface. Linear, spatial, game-like, cinematic, professional, accessible, child-friendly, enterprise, and world-specific interfaces can coexist.

## Recursive creation

Humans, Actors, and Agents may create and compose new Actors, Agents, Gummies, Molds, Bowls, tools, and surfaces.

> **Creation never implies inherited authority.**

A child Agent does not inherit its creator's Grants. An Actor-created Actor does not silently inherit control. A composition does not merge private state without explicit Links, Molds, Master Control decisions, and Receipts.

## Actor discovery and composition

Gummy OS may become an explorable internet of addressable Actors.

An Actor surface may discover another Actor by `@address`, request a Link, open public or authorized Gummies, enter a Bowl, or propose a composition.

A composition may experimentally become:

- a temporary shared Canvas;
- a Bowl;
- a composed Gummy;
- a Mold;
- an application;
- a new Actor.

The prototype determines which meaning is useful. Cursor must not force one universal interpretation prematurely.

## Security posture

Gummy OS does not replace enterprise endpoint security, identity providers, network controls, secure boot, disk encryption, kernel protections, EDR, MDM, passkeys, biometrics, or hardware-backed credentials.

Those controls remain at the host, OS, network, identity, and organization layers.

Gummy OS adds containment and explicit authority:

```text
Host / enterprise security
protects device, kernel, identity, connection, native resources

Native Agent boundary
mediates approved local capabilities

Gummy OS boundary
contains everyday creative, social, and Agent-operated work

Actor / Mold / Master Control
specifies who may do what, where, and with which data

Receipt boundary
records consequential actions and cross-boundary movement
```

### Quarantine and native promotion

A download enters as a quarantined Gummy.

```text
quarantined Gummy
→ inspect / scan / classify
→ Human approval or policy
→ bounded export Grant
→ native destination
→ Action Receipt
```

Existence inside Gummy OS never grants native execution.

### Disposable environments

A workspace, Actor session, or capsule may be snapshotted, isolated, burned, and recreated while approved results and Receipts survive.

### Native defensive Agent

A future native Glopper executor may monitor approved signals such as prohibited capability requests, suspicious download metadata, integrity failure, repeated denial, anomalous resource use, or native-bridge attempts.

Monitoring remains visible, scoped, and receiptable.

### Authorized security workbenches

Actors and Agents may create defensive-security laboratories with isolated target Actors, explicit authorized scope, specialized analysis/remediation/verification Agents, disposable environments, and replayable evidence.

The platform does not grant authorization against third-party systems.

## Portable deployment

Gummy OS can run in a browser, PWA, native shell, governed WebView, or the existing live-USB distribution.

A future portable flow may boot a trusted native environment, authenticate the Human, start `agent:glopper-native`, open Gummy OS, resolve the Actor, restore approved state, and leave without persisting unapproved data.

## Honest security claim

Security claims require evidence for origin and capsule isolation, bridge restrictions, Agent confinement, storage encryption, authentication, sync correctness, revocation, quarantine, promotion, Receipt integrity, and burn/recovery behavior.

The product promise is **understandable power, explicit boundaries, and smaller blast radius**.

## Immediate Ubuntu order

1. Pull and verify `bohselecta/gummy-os`.
2. Run the standalone browser scaffold.
3. Implement the Gummy Canvas and Gummy Bar.
4. Implement Glopper as a candy icon and expandable Glopper Panel.
5. Expose Human, Actor, Agent, Mold, Master Control, and task lease state.
6. Add durable IndexedDB/OPFS Gummies and quarantine.
7. Add one real `agent:glopper-web` inference route.
8. Complete the real source-Gummy to result-Gummy journey.
9. Prove denial, revocation, quarantine, promotion simulation, and burn/reset.
10. Run one small two-Actor composition experiment.
11. Inspect the existing native distro only after the standalone proof passes.

## Product principle

Gummy OS is serious infrastructure that should feel like an astonishing creative toy.

> **The Gummy Bar is the candy store. Glopper is the companion candy. The Gummy Canvas is where the future gets made.**
