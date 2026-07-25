# Gummy OS Roadmap

## Controlling sequence

Gummy OS advances from the browser outward.

1. Prove the locked brand and standalone Gummy OS platform.
2. Prove Glopper as the web companion and Agent family.
3. Prove Gummy Box Work Orders, containment, revocation, and return continuity.
4. Prototype composition and social primitives.
5. Inspect and integrate the already-built native distro only when the native bridge is the next dependency.

## Phase 0 — Foundation, naming, and brand lock

Delivered as specification:

- runnable browser-native scaffold;
- window manager and Gummy Browser;
- demo capability/Receipt loop;
- Actor/Agent separation;
- Mold and Master Control specifications;
- playground and security thesis;
- Gummy Box and Work Order protocol;
- final naming;
- locked brand system.

```text
Gummy OS
Gummy Canvas
Gummy Bar
Gummy
Glopper
Glopper Panel
Glopper App
Gummy Box
Glopper Inbox
```

```text
Night Gummy
Day Gummy

Deep Indigo      #4B187A
Gummy Violet     #7C2FD0
Honey Gold       #F2B544
Warm Cream       #FFF1C7
Aubergine Black  #100817
```

```text
Purple tells you where you are.
Gold tells you what you can do.
Gummy = purple-dominant.
Glopper = gold-dominant.
```

## Phase 1 — Standalone Personal Gummy OS

**Goal:** make Gummy OS useful, unmistakable, playful, and dependable for one Human and one Actor in a normal Ubuntu browser.

### 1A. Brand tokens and canonical expressions

- exact five source tokens;
- semantic tokens for Canvas, surfaces, text, location, energy, action, focus, border, and shadow;
- Night Gummy and Day Gummy only;
- local persistence and safe fallback;
- optional device-follow mapped only to Night/Day;
- no arbitrary theme or accent selection;
- automated literal-color and contrast review.

### 1B. Gummy Canvas and Gummy Bar

- name and preserve the open working Canvas;
- replace dock presentation with candy-store Gummy Bar;
- candy icons for Glopper, apps, Actors, Gummies, Bowls, Work Orders, tasks, and controls;
- purple location/grouping grammar;
- gold action/selection/attention grammar;
- keyboard, touch, responsive, reduced-motion, and accessibility behavior;
- placeholder candy art until Hayden supplies production assets.

### 1C. Gummy and Glopper identities

- Gummy purple-dominant guide surfaces;
- Glopper gold-dominant action surfaces;
- names/avatars/accessibility labels in addition to color;
- locked mascot proportions and identity colors;
- wordmark asset slots without approximation;
- actual Agent executor always explicit.

### 1D. Glopper Web experience

- Glopper candy in Gummy Bar;
- collapsed status/invocation state;
- expanded Glopper Panel;
- selected Canvas context;
- Actor, Agent, Mold, Master Control, Task Lease, approval, result, Return, and Receipt visibility;
- first executor `agent:glopper-web`;
- automatic context without automatic authority.

### 1E. Correct objects and migration

- local Human authority;
- persistent Actor with provisional `@address`;
- separate Glopper Agent;
- permissioned Mold;
- local Master Control;
- Gummies, Bowls, Links, and Grabs;
- Gummy Box, Work Order, Task Lease, Return;
- deterministic migration from Snack/Drop/Fork/demo companion/Z/theme terminology;
- no Actor/Agent collapse or unsupported theme values.

### 1F. Durable local system and Gummy Box

- IndexedDB metadata;
- OPFS bytes;
- stable IDs and hashes;
- Actor-owned projects/folders;
- Local Gummy Box;
- import/export;
- searchable Receipts;
- PWA;
- return continuity;
- explicit quarantine.

### 1G. Glopper Inbox and one real route

- Work Order validation as untrusted data;
- approve/revise/reject/hold;
- exclusive Task Lease and conflict denial;
- provider-neutral broker;
- no browser secrets;
- one bounded read/transform/create task;
- Human → Actor → Agent → Mold → Master Control → Task Lease → Grant contract;
- Return/artifact/Receipt writeback;
- denial/failure/success/revocation evidence.

### 1H. Quarantine and burn proof

- harmless content enters as quarantined Gummy;
- no native execution authority;
- deny unapproved promotion;
- bounded approved promotion or simulation with Receipt;
- disposable workspace reset/burn;
- accepted results/evidence survive.

### 1I. One external Gummy Box adapter

- implement private GitHub or Google Drive after Local Box passes;
- provider-scoped permissions only;
- preserve provider-neutral adapter contract;
- disconnected queue/retry;
- do not require both providers for acceptance.

### 1J. Small composition proof

- two local test Actors;
- explicit Link;
- selected Gummies;
- temporary shared Canvas or Bowl;
- source identity and private state remain distinct;
- record which output type feels natural.

**Exit:** standalone Gummy OS is recognizable without mascots; Night and Day feel like one universe; purple communicates place; gold communicates action; Gummy and Glopper are peripherally distinct; Local Gummy Box and one real Work Order complete; a source Gummy becomes a result through `agent:glopper-web`; source remains unchanged; revocation, quarantine, burn/reset, composition, and return continuity are proven.

## Phase 2 — Glopper companion system

**Goal:** make Glopper one coherent companion across separately governed executors.

- `agent:glopper-web`;
- `agent:glopper-cloud` when useful;
- task router and executor leases;
- private local memory / approved portable profile / current task context;
- structured preference adaptation;
- optional Ollama/llama.cpp local harness;
- conflict and takeover rules;
- consistent character, brand emphasis, and disclosure;
- standalone Glopper App shell without broad native authority.

**Exit:** Glopper routes web/cloud tasks correctly, preserves executor identity, carries only Human-approved preferences, and remains gold-dominant without recoloring the mascot.

## Phase 3 — Native distro inspection and bridge

**Goal:** connect Gummy OS to the real existing AI-native Linux system without rebuilding or widening it speculatively.

- locate and launch existing distribution;
- document local path, services, chat/Agent process, capabilities, browser/WebView, security, and live-USB assets;
- evaluate existing `bohselecta/glopper` app/process director as native companion foundation;
- add `agent:glopper-native` identity;
- one deny-by-default task bridge;
- explicit directory, IDE, shell, model, device, and process capabilities;
- local Ollama/llama.cpp routing where appropriate;
- selective task/result/approval/Receipt synchronization;
- revocation and bridge shutdown;
- no generic host-control API.

**Exit:** native Glopper completes one bounded local task for a Gummy OS Actor, every crossing is visible and receipted, and revocation stops future access.

## Phase 4 — Playground and Actor composition

**Goal:** establish Gummy OS as a creative medium rather than a single workflow.

- mini-app framework;
- hexagonal interface as one optional mini-app;
- multiple Actor surfaces;
- discovery by `@address`;
- explicit Links and invitations;
- temporary shared Canvases;
- recursive creation of Actors, Agents, Gummies, tools, Work Orders, and surfaces;
- independent authority and provenance for every child;
- prototype when composition naturally yields Bowl, Gummy, Mold, Actor, application, or temporary Canvas.

**Exit:** useful compositions form without private-state merge or inherited authority.

## Phase 5 — Gummy OS Social Layer

**Goal:** consent-first social computing around addressable Actors and Gummies.

- verified Humans and `@addresses`;
- public/private Actor state;
- official and delegated Molds;
- Bowls, Gummies, Links, and Grabs;
- encrypted selective synchronization;
- abuse controls;
- Gummy/Glopper/Agent disclosure;
- public-figure and licensed-character structures without automatic marketplace assumptions.

**Exit:** Actors share and Grab Gummies with clear authority, operation, audience, rights, provenance, and revocation.

## Phase 6 — Governed applications and security workbenches

- Application Pack SDK;
- typed capabilities;
- semantic/accessibility/GUI operation hierarchy;
- isolated runtimes;
- authorized defensive-security Actors and Agents;
- explicit target scope;
- replayable evidence;
- disposable environments;
- verified result Gummies.

## Phase 7 — Enterprise Habitat

- organization identity and roles;
- approved Actors, Glopper/other Agents, and Molds;
- OIDC/SAML/passkeys/biometrics/hardware keys;
- policy, brokers, registries, runtime pools;
- EDR/MDM/SIEM integration;
- signed Receipts, retention, administration, and audit;
- hosted, dedicated, self-hosted, sovereign modes.

## Phase 8 — Federation and portable life

- signed Actor discovery;
- federated Bowls/Gummies/Links/Grabs;
- independent editions;
- key rotation and revocation;
- self-hosting;
- live-USB portable deployment;
- selective Actor restoration;
- migration/export and compatibility certification.

## Phase 9 — Commercial network

Customers may pay for governance, verification, compatibility, enterprise deployment, security/compliance modules, OEM editions, managed brokers/runtimes, support, and certification while Personal Gummy OS remains useful and free.

## Stop rules

- Do not add a third canonical Gummy OS theme.
- Do not introduce a new branded hue or recolor mascots.
- Do not let gold lose its action meaning or purple lose its location meaning.
- Do not inspect or integrate the native distro before the standalone proof passes.
- Do not widen the native bridge to make a demo easier.
- Do not let recursive creation inherit authority.
- Do not lock composition into one output type prematurely.
- Do not claim security or accessibility without evidence.
- Do not advance broad social, enterprise, federation, commercial, provider, or theme scope ahead of the accepted standalone exit.
