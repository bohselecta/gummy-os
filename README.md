# Gummy

> **A computer you can open.**

Gummy is a provider-neutral personal AI computer, a consent-first social protocol, and a governed enterprise software habitat delivered through the browser.

It keeps the interface people already understand—desktop, windows, folders, files, applications, a dock, drag-and-drop, and a browser inside the browser—while adding the boundaries an AI-operated computer requires: portable identity, scoped capabilities, isolated runtimes, vendor Application Packs, organization policy, and Action Receipts.

The canonical home is **mygum.my**. Personal Gummy is intended to remain free to consumers. Commercial value lives in verified integrations, enterprise deployment, policy and audit infrastructure, certification, support, and OEM editions.

## Run the scaffold

Requirements: Node.js 22 or newer.

```bash
npm run dev
```

Open `http://localhost:4173`.

No package installation is required. The scaffold uses browser-native JavaScript and Node's standard library so the operating surface stays fast, inspectable, and easy to fork.

```bash
npm run check
npm test
npm run build
npm run verify
```

## What works now

- Fast web-native desktop with draggable, resizable, minimizable, and maximizable windows.
- Gummy Browser with `gummy://home`, `gummy://chat`, `gummy://protocol`, sandboxed external frames, and external-tab fallback.
- My Files with drag-to-companion delegation.
- Provider-neutral demo chat and scoped capability requests.
- Snack Bar for portable shape, color, flavor, handle, visibility, and companion identity.
- Snack Graph with Snacks, Bowls, Drops, links, follows, publishing, and non-destructive forking.
- Enterprise Habitat with organization overview, policies, Application Pack registry, runtime pools, and audit-oriented receipts.
- Persistent local state through `localStorage`.
- Protocol schemas for Snacks, graph objects, Application Packs, grants, receipts, organizations, and policy packs.
- Zero-dependency validation, tests, build, and GitHub CI.

The scaffold is honest about its boundaries. It does not yet ship a real model broker, authentication, encrypted sync, cryptographic signing, multi-tenant backend, BrowserPod, CheerpX, or a production policy engine.

## Product map

```text
Gummy
├── Shell          desktop, windows, dock, browser, files, companion
├── Snack          portable person or agent identity
├── Object Space   files, projects, conversations, applications, Drops
├── Graph          relationships, Bowls, sharing, following, forks
├── Pack           vendor-authored application knowledge and authority contract
├── Broker         model, connector, and task-scoped capability routing
├── Capsule        web, Wasm, Linux, or governed cloud execution
├── Receipt        evidence of request, authority, changes, and outcome
├── Organization   enterprise identity, roles, policies, registries, and runtime pools
└── Federation     portable protocol objects and fork-compatible Gummy editions
```

## The central product insight

Traditional AI integration asks: **How do we connect this model to this application?**

Gummy asks: **How do we place the application inside a governed computer the agent already knows how to use?**

A software vendor can ship an Application Pack containing typed capabilities, agent-oriented documentation, semantic interface maps, workflow recipes, policy rules, verification tests, and recovery instructions. Gummy supplies the secure habitat in which an authorized model may operate it.

## The social insight

The user's digital life should not become another advertising graph. Gummy's social layer is made from portable objects:

- **Snack** — a person or agent identity.
- **Bowl** — a shared space with explicit membership and visibility.
- **Drop** — a shared object, artifact, note, project, application, or invitation.
- **Link** — a scoped relationship such as follows, member-of, collaborates-with, delegates-to, or trusts-for.
- **Fork** — a new independent edition that preserves provenance without altering the original.

Visual shape and color make Snacks recognizable, but never constitute authentication. Production identity is bound separately through passkeys, organizational identity, or cryptographic proofs.

## Architecture planes

```text
Experience Plane   desktop, browser, files, companion, Snack surfaces
Object & Graph     private objects, Bowls, Drops, links, provenance
Agent Plane        provider-neutral models, planning, memory, orchestration
Capability Plane   policy, approvals, connector mediation, revocation
Runtime Plane      web-native, Wasm, Linux compatibility, governed cloud
Enterprise Plane   organizations, roles, Pack registry, audit, deployment
Federation Plane   portable objects, discovery, signatures, fork compatibility
```

Read `docs/` for the vision, architecture, Snack Graph, enterprise framework, protocol, security model, product specification, roadmap, business model, licensing strategy, and build runbook.

## Founding rules

1. The shell is web-native.
2. The visible grammar stays familiar.
3. The agent is provider-neutral.
4. No ambient authority.
5. Consequential work leaves evidence.
6. The host remains outside.
7. Social is consent-first.
8. Visual identity is not security identity.
9. Compatibility is routed.
10. Personal utility remains free.
11. Forks are part of the design.
12. Delight is functional.

## Status

This is **Gummy 0.1 / Protocol Zero expansion**. It is a runnable product and architecture scaffold, not yet a security-reviewed operating environment.

> Open Gummy. Your computer is already there.
