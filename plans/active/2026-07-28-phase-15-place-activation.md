# Phase 15 — Place Activation

## Status

**COMPLETE / RELEASED / PRODUCTION VERIFIED**

Runtime release:

- Gummy OS merge: `aa1530284b4653153c7868a1966ca55b983425a7`
- Gummy OS PR: `#35`
- Production deployment: `dpl_HP62fzjPhStVq5KkFwoXHQTtyffK`
- Canonical production: `https://www.mygum.my`
- Release evidence: `evidence/phase15-release-evidence.json`
- Rollback: Gummy OS `4c2cb092cc0ccab93df31a3479ddba460099363d` / deployment `dpl_GMb1VobkGE5uV2M3PdBQAYW9yncR`

The founder authorized the designed Phase 15 build, PR/merge operations, browser verification, and production deployment on 2026-07-28. Automated and production acceptance passed before closure.

The useful local cores and exact standalone bindings are complete. Production Channels publication/signing/Firebase, verified Table address release, final Radio voice/publication, remote Rooms/media, and authenticated Meshmallow construction remain capability-specific external gates. Their unavailable state is the required release truth, not unfinished simulated functionality.

Phase 14 is accepted, merged, promoted, production-verified, and closed at Gummy OS commit `39f23fc37241c5648bb828a24f258682dd758dfb`.

Phase 15 starts from current `main` and turns Gummy Places from fixture-backed previews into useful, persistent products. It also completes or materially advances first-party products that are already present in the Place registry but remain unavailable or under-polished.

This is not a label-change pass. Never set a Place or capability to available merely because a card opens.

---

# 1. Product outcome

After Phase 15, opening **Places** should reveal a real personal software suite:

- **Channels** can maintain a channel guide, watch groups, Family Room notes, favorites, and premiere drafts.
- **Wardrobe** can capture and maintain owned items, compile and save outfits, replace unavailable pieces, and export a selected outfit package.
- **House** opens or connects to the real Home Graph workbench and can create observations, pass an Intent Gate, commit two notes, and preserve project state.
- **Worlds** can create, validate, estimate, save, duplicate, inspect, and package real World Plans; only native scene construction remains runtime-dependent.
- **Table** can create an invite-only Table, issue scoped invitations, collect RSVPs, acknowledge Table Rules, coordinate dishes and Pantry gifts, and preserve the event without exposing the address.
- **Radio** opens or connects to the real AfterCast Studio and can import scoped sources, shape a revisioned script, preview speech, approve, and export a private episode package.
- **Rooms** becomes a useful local/private multi-window or multi-tab collaboration Place rather than a preserved unavailable lineage card.

The person should be able to create data, close the window, reload, reopen the same Place, inspect what changed, and export or hand off a typed result.

---

# 2. Correct the activation model

Phase 14 made a whole Place inherit the state of its hardest dependency. That was too coarse.

A Place may be useful now while a particular advanced capability still requires another service.

Examples:

- Wardrobe is available even though mobile camera capture is companion-required.
- Worlds is available even though `make_world` requires Meshmallow.
- Radio is available even though final generated voices and public publication are service-required.
- Channels is available even though remote creator publication requires its channel service.
- Table is available even though remote phone verification and exact-address grants require the civic service.
- House is available even when a connected cloud Home Graph is absent because the current HomeWright local store is functional.

## 2.1 Place Descriptor v2

Introduce a backward-compatible descriptor and registry migration:

```text
gummy.place-descriptor/v2
gummy.place-registry/v2
```

The v2 descriptor preserves the v1 fields and adds:

```text
coreAvailability
coreCapabilities
capabilityStates
connectionRoutes
lastVerifiedAt
migration
```

`coreAvailability`:

```text
available
needs-setup
blocked
```

Each `capabilityStates` item contains:

```text
id
label
availability
locality
requires
startsExecution
costModel
releaseTruth
```

Capability availability:

```text
available
local-runtime-required
remote-service-required
mobile-companion-required
approval-required
blocked
```

The Place directory card reflects `coreAvailability`, not the hardest capability.

The Place surface presents a capability matrix that truthfully distinguishes what works now from what needs setup.

The old v1 registry remains readable through migration fixtures. Existing Phase 14 records and window IDs must survive.

---

# 3. Shared local Place runtime

Create one reusable browser runtime rather than six unrelated localStorage implementations.

Recommended files:

```text
src/places/local-place-store.js
src/places/place-runtime-registry.js
schemas/place-local-record.schema.json
schemas/place-operation-receipt.schema.json
```

## 3.1 Record model

Use IndexedDB through the existing `RecordRepository`, stored under the generic `workspaces` store until or unless a dedicated store migration is justified.

```text
gummy.place-local-record/v1
```

Required fields:

```text
id
placeId
ownerActorId
contextType
contextId
recordType
recordId
revision
value
createdAt
updatedAt
```

Record IDs include Place and context so personal, Production, and Session state never collapses.

## 3.2 Operations

Every meaningful mutation produces:

```text
gummy.place-operation-receipt/v1
```

Required concepts:

```text
placeId
context
operation
recordRefs
priorRevisions
resultRevisions
executedLocally
externalExecution
limitations
createdAt
```

Use the existing Gummy Receipt chain where a change crosses into a Production or another Place. Local domain edits may retain a Place receipt plus a linked Gummy Receipt when consequential.

## 3.3 Runtime contract

Each Place runtime implements:

```text
initialize(context)
list(recordType)
get(recordType, recordId)
put(recordType, value, expectedRevision?)
remove(recordType, recordId, expectedRevision?)
exportPackage(selection)
importPackage(package)
getCapabilityState()
```

Requirements:

- optimistic revision checks;
- no silent overwrite;
- exact context isolation;
- no secret-bearing fields;
- structured export;
- full reset only for the selected Place/context;
- durable state after reload;
- BroadcastChannel refresh where supported;
- no remote call from local mutation paths.

---

# 4. Gummy Channels activation

## Existing source

Canonical source remains the Android creator-channel project currently located at `bohselecta/vidfamtv`. The existing Android package/namespace uses retired identity and must be migrated deliberately rather than leaked into the Gummy product.

## 4.1 Identity migration

Public product:

```text
Gummy Channels
Channels
@channels
app:gummy-channels
```

Migrate Android display name and customer-facing copy. Replace public package/namespace identity with a Gummy-owned identity through an explicit application-ID migration plan. Do not silently break an installed build or Firebase project. Preserve a compatibility record for old package IDs.

No retired naming appears in UI, policy pages, screenshots, metadata, notifications, or generated copy.

## 4.2 Useful local/web core

Implement in the Gummy Place and preferably share domain types with Android:

- creator channels;
- episodes/drops as link-first records;
- favorites;
- watchlist;
- Human-defined watch groups;
- Tonight / What’s On guide;
- premiere draft;
- Family Room bulletin notes;
- hide/block/report local state;
- exported channel-guide package.

No infinite feed.

A creator channel is not automatically a Gummy Actor.

## 4.3 Android completion

Audit and complete the existing Android source:

- onboarding;
- channel and episode detail separation;
- watch groups;
- Family Room board;
- invite redemption;
- Admin/Moderation Queue;
- creator/viewer/admin/mod role separation;
- link playback rules;
- block/hide/report/quarantine;
- account deletion;
- privacy, terms, community guidelines, and Data Safety alignment;
- production Firebase and release signing remain fail-closed.

The Gummy Place may deep-link to Android when installed and show a truthful fallback when not.

## 4.4 Availability truth

Core Place: **available** after local guide persistence and export pass.

Remote publication: **remote-service-required** until authenticated Channels service and moderation gates pass.

---

# 5. Gummy Wardrobe activation

Wardrobe is the only true greenfield Place core in Phase 15. Build it as a real local-first product, not another richer fixture.

## 5.1 Domain records

```text
gummy.wardrobe-item/v1
gummy.wardrobe-collection/v1
gummy.outfit/v1
gummy.wardrobe-availability/v1
gummy.shopping-radar/v1
```

Item fields include:

- category and slot;
- user-confirmed name;
- optional image reference;
- colors/material/season/formality;
- owned confirmation;
- availability state;
- notes;
- created/updated timestamps.

AI-derived attributes remain proposed until confirmed.

## 5.2 Working flows

- add an item manually;
- import an item image through the existing bounded browser file path;
- organize Clothes, Shoes, Accessories;
- create collections;
- compile one complete owned-item-first outfit;
- show a figure or slot stack with explicit item labels;
- `Wear This`;
- mark one item unavailable/dirty and replace only that item;
- swap one slot;
- `All unavailable — reshuffle`;
- save outfit history;
- show why an owned replacement was chosen;
- create a shopping radar only after a real wardrobe gap is established;
- export one selected outfit to a Production.

“Dirty” is temporary availability, never dislike.

No checkout or autonomous purchase.

## 5.3 Mobile path

Create an installable PWA capture path first. Preserve a clean boundary for later Compose Multiplatform/native apps.

Mobile capture is a capability, not a reason to stage the entire Wardrobe.

## 5.4 Availability truth

Core Place: **available** after item/outfit persistence, replacement semantics, and export pass.

Camera-aware auto-classification: **mobile-companion-required** or **approval-required** until implemented truthfully.

---

# 6. Gummy House activation

## Existing source

`bohselecta/homewright` already contains a real Next.js workbench, local canonical Home Graph store, capture/observation pipeline, 3-beat Intent interview, First Insight, Plan Loop, project steps, materials, and receipts.

Do not rebuild a second House product inside Gummy.

## 6.1 Standalone product completion

Audit the HomeWright repository against the canonical House doctrine and harden:

- first run and home creation;
- Home Graph persistence and migrations;
- spaces/systems/assets;
- observation capture and confirmation;
- Intent Gate;
- two-note commit;
- plan as a function of graph state;
- Scope Wall;
- subtractive taste memory;
- project steps and receipts;
- export and deletion;
- responsive mobile capture and desktop workbench;
- remove generic scaffold README and stale implementation claims;
- deploy and bind an exact verified route if not already deployed.

## 6.2 Gummy integration

The House Place should:

- open a local projection summary quickly;
- open the full HomeWright workbench through an allowlisted route or installed PWA;
- receive explicit observation/project projections;
- export a scoped House project package;
- deep-link back to the exact House object;
- never mirror the entire Home Graph into Gummy;
- keep address and photos withheld unless specifically selected.

Use `postMessage` only through an origin-allowlisted, versioned contract. No ambient iframe access.

## 6.3 Availability truth

Core Place: **available** after the standalone route and local projection handshake are production-verified.

External model or shopping routes remain individually disclosed.

---

# 7. Gummy Worlds activation

## Existing source

`bohselecta/videoworlds3` contains a Next.js implementation/spec lineage with a pure engine, typed contracts, mock adapters, House Lights design, a deep Lowwater world, rooms, and authored state rules.

The older product identity remains a migration alias only.

## 7.1 Separate two products correctly

Gummy Worlds has two useful lanes:

### Experience lane

- browse authored worlds;
- enter Sit experiences;
- preserve scene state and choices;
- rooms and simulated participants where truthful;
- duplicate/fork a world.

### Creation lane

- create/edit `gummy.world-plan/v1`;
- validate sources and rights;
- estimate;
- inspect;
- package;
- duplicate;
- send a bounded plan to Meshmallow.

Do not collapse the narrative-world engine and 3D build orchestration into one fake button.

## 7.2 Working local core

Implement persistent World Plans with:

- starters;
- scene/world intent;
- sources and rights;
- typed operations;
- Sit anchors/camera/UI configuration;
- validation;
- estimate;
- duplication;
- JSON/package export;
- status and receipt history.

The following work without Meshmallow:

```text
validate_world
check_sources
estimate_world
world_status
inspect_world
package_world
duplicate_world
list_starters
```

Only `make_world` requires Meshmallow.

## 7.3 Meshmallow connection

Use the existing authenticated supervisor contract. Never send arbitrary Python, shell, or raw Blender commands.

A real submission freezes the exact World Plan and returns owned job IDs, checkpoints, artifacts, and Receipts.

## 7.4 Availability truth

Core Place: **available** after planning, Sit experience, persistence, package, and duplication pass.

`make_world`: **local-runtime-required**.

Walk: **approval-required** until its separate performance, navigation, collision, accessibility, and safety gate passes.

---

# 8. Gummy Table activation

Table must become useful without weakening its civic doctrine.

## 8.1 Domain records

```text
gummy.table-block/v1
gummy.table-invite/v1
gummy.table-gathering/v1
gummy.table-rsvp/v1
gummy.table-rules-ack/v1
gummy.table-dish/v1
gummy.pantry-gift/v1
gummy.table-address-grant/v1
```

## 8.2 Working private core

- create an invite-only block/circle;
- create a Table;
- issue scoped invitation codes/links;
- RSVP yes/no/maybe;
- host approval queue;
- acknowledge Table Rules;
- coordinate dishes;
- Pantry offer/ask/gift records;
- day-of checklist;
- cancellation and address-revocation state;
- post-Table reflection;
- export a private Table package;
- no public map, discovery, feed, ratings, open DMs, balance, token, score, or debt.

## 8.3 Remote service

Use the canonical phone-first and server-written address-access rules for live multiuser service.

Exact address release requires:

- invited membership;
- host approval;
- verified phone;
- gathering-specific server/function grant;
- current non-cancelled event;
- revocation on cancellation or removal.

No generic Gummy Grant substitutes for this civic service check.

Build the local/place core first, then connect the remote path only when security rules and abuse handling pass.

## 8.4 Availability truth

Core Place: **available** after local private planning, invitations, RSVP, rules, dishes, Pantry, persistence, and export pass.

Remote multiuser/address grant: **remote-service-required** until independently verified.

---

# 9. Gummy Radio activation

## Existing source

`bohselecta/talkprint-studio` is a substantial working AfterCast beta with local parsing, privacy scrub, episode discovery, per-collaborator source boundaries, revision-bound approvals, browser speech, private show pages, clips, and an opt-in private cloud project core.

Do not rebuild Radio as a textarea demo.

## 9.1 Gummy adapter

Radio should connect to the real AfterCast Studio through one or both of:

- allowlisted routed web/PWA launch with a versioned handoff package;
- shared import/export contract using `gummy.source-package/v1` and `gummy.radio-export/v1`.

The source package may include selected chats, Sessions, Production notes, decisions, milestones, and Receipts.

The adapter must preserve:

- exact source revisions;
- explicit exclusions;
- stage names;
- per-person source control;
- script revision;
- both approvals where two people are represented;
- voice/likeness permissions;
- privacy;
- retention;
- synthetic-audio disclosure.

## 9.2 Standalone completion

- replace remaining retired customer-facing terminology;
- verify production domain route;
- verify local-only fallback;
- verify private Host A/B project path;
- verify reset, expiry, permanent delete, and stale-revision handling;
- preserve browser speech as demonstration-only;
- export a complete private episode package;
- no public publishing claim until it exists.

## 9.3 Availability truth

Core Place: **available** after verified launch/import/export handshake with AfterCast.

Final generated voice: **remote-service-required**.

Public publishing: **blocked** until an independently accepted publication system exists.

---

# 10. Gummy Rooms activation

Rooms is already a preserved first-party product and should no longer remain only an unavailable lineage card.

## 10.1 Local private room

Build from existing Actor chat, Bowl, BroadcastChannel, and Session foundations:

- create private room;
- join from a second tab/profile fixture;
- participant list and presence;
- fair round-robin queue;
- isolated threads;
- shared selected Gummies;
- live mirror of accepted room events;
- save room as a reusable Session configuration;
- title and resume;
- bridge selected room output into a Production;
- room Return and queue Receipt;
- no remote media or public room claim.

## 10.2 Remote seam

Keep the transport interface compatible with a future authenticated room service. Do not mix local BroadcastChannel membership with remote verified identity.

## 10.3 Availability truth

Local/private Rooms Place: **available**.

Remote rooms/live media: **remote-service-required**.

---

# 11. Existing specialist apps

Phase 15 should polish rather than hide the existing first-party studios.

## VideoBoss

- connect the existing routed web surface;
- expose current Production context handoff;
- retain planning/export availability;
- show provider render status separately;
- no simulated render presented as live.

## ImageHoss

- add clear local bridge diagnostics and pairing;
- retain configuration and package preparation when bridge is absent;
- open the real local application when paired;
- preserve accepted image and provenance handoff.

## Meshmallow

- add supervisor discovery and exact capability status;
- accept typed World Plans;
- preserve job ownership/recovery;
- expose preview/checkpoint/package results;
- never offer unrestricted Blender access.

## Browser

Polish the internal browser into a real useful Place-capable surface:

- saved allowlisted links;
- isolated browsing history owned by the Human;
- attach selected text/link as a Gummy;
- never grant same-origin access to embedded pages;
- no ambient scraping.

---

# 12. Place directory redesign

The current cards emphasize staged status. Replace them with useful product status.

Each card shows:

- Place name and doctrine;
- `Available`, `Needs setup`, or `Blocked` core state;
- number of working local capabilities;
- advanced capability/setup chips;
- recent object or empty-state action;
- Open;
- Pin;
- Connect/setup when applicable.

Inside a Place, show:

- current context;
- data location;
- local/connected state;
- recent records;
- primary useful action;
- capability matrix;
- export/reset;
- exact boundaries.

Do not overwhelm the Gummy Bar. New Places remain unpinned until the Human pins them.

---

# 13. Cross-Place journeys become executable local workflows

Phase 14 journeys stopped at previews. Phase 15 should complete bounded local handoffs.

## Creator premiere

```text
VideoBoss accepted delivery
→ Channels premiere draft
→ Human approves guide placement
→ local Channels guide updated
→ linked Return and Receipt
```

Remote publishing remains separate.

## Home project

```text
House project projection
→ Worlds plan or ImageHoss package
→ local receiving object created
→ source/withheld fields retained
→ linked Receipts
```

## Real-world gathering

```text
Table event
→ selected Wardrobe event outfit
→ optional private Room Session
→ no address crosses
```

## World premiere

```text
Worlds package
→ VideoBoss trailer plan
→ Channels premiere draft
→ optional Radio source package
```

Every handoff has an approval, owned result, Return, and Receipt. No ambient data sharing.

---

# 14. Cross-repository execution order

## 15.0 — Freeze and source audit

- record exact Gummy production commit/deployment and rollback;
- update source-resolution evidence for every Place and first-party app;
- inspect working routes/deployments;
- record gaps and truth;
- create repository/branch map;
- do not rename repositories destructively.

## 15.1 — Activation model and local runtime

- Place Registry/Descriptor v2;
- capability-level states;
- local Place store;
- operation receipts;
- migration from Phase 14 fixtures to seeded records without resetting user state;
- Place directory redesign.

## 15.2 — Radio and House

These already have the strongest standalone implementations. Connect, harden, deploy, and verify them first.

## 15.3 — Wardrobe

Build the complete local-first core and installable capture path.

## 15.4 — Worlds

Activate planning, experience, package, and duplication; connect bounded Meshmallow submission.

## 15.5 — Channels

Complete Android gaps, identity migration, local guide, deep link, and publication draft handoff.

## 15.6 — Table

Build local private core, then independently gate live identity/address service.

## 15.7 — Rooms and specialist polish

Activate local Rooms and improve VideoBoss/ImageHoss/Meshmallow/Browser connection surfaces.

## 15.8 — Executable journeys, evidence, and release

- complete the four journeys;
- unit/integration/browser tests;
- standalone repo tests;
- Android tests/build where applicable;
- desktop and phone screenshots;
- exact preview deployments;
- founder acceptance;
- merge cross-repository prerequisite PRs;
- merge Gummy integration PR;
- exact-commit production promotion;
- production verification;
- rollback record;
- close Phase 15.

---

# 15. Non-negotiable truth rules

- Do not replace `staged` with `available` without persistent user-created state and evidence.
- Do not let one missing advanced capability stage an otherwise useful Place.
- Do not claim remote service based on fixtures, localhost, mock providers, or browser speech.
- Do not duplicate authoritative domain stores in Gummy.
- Do not leak retired product names into customer-facing surfaces.
- Do not restore retired Glyph/Glyphd terminology.
- Do not make every product purple/gold internally; Gummy chrome contains distinct Place identities.
- Do not auto-pin new Places.
- Do not auto-publish, auto-purchase, reveal addresses, clone voices, or run Blender.
- Do not silently create new accounts, Firebase projects, provider credentials, or paid resources.
- Do not use generic “AI magic” copy in place of capability truth.

---

# 16. Required tests

## Activation

- available core can create/save/reload/edit/export a record;
- advanced unavailable capability remains separately labeled;
- core status cannot be available with zero working capability states;
- Place data survives reload and remains context-isolated;
- optimistic revision conflict blocks overwrite;
- Place reset affects only selected Place/context;
- no secrets in records or browser bundles.

## Channels

- no infinite feed path;
- no auto-publish;
- watch groups are Human-defined;
- Family Room is bulletin-only;
- report/block/hide state persists;
- creator identity never becomes Actor automatically.

## Wardrobe

- only owned items selected;
- temporary unavailable is not dislike;
- replace one slot preserves other slots;
- no checkout;
- export contains selected outfit only.

## House

- Scope Wall excludes address/photos by default;
- Intent Gate required;
- two-note commit required;
- route origin allowlisted;
- Home Graph remains authoritative outside Gummy projection.

## Worlds

- exact nine-tool surface;
- eight non-build tools work without Meshmallow;
- `make_world` requires authenticated runtime and approval;
- no arbitrary code;
- Walk remains separately gated.

## Table

- invite-only;
- no discovery/feed/open DMs/ratings/balance;
- address absent before service-approved grant;
- cancellation revokes address access;
- Pantry remains gift-only.

## Radio

- exact source package required;
- source/script changes invalidate approvals;
- private sources reject public export;
- browser speech is not final audio;
- voice and publish approvals separate.

## Rooms

- two-tab local room works;
- queue fairness deterministic;
- thread isolation;
- shared Gummies explicit;
- no remote identity or live media claim.

## Preservation

- Human authority;
- Actor/Agent separation;
- Productions;
- Gummies;
- Returns;
- Receipts;
- Master Control;
- Make Production boundary;
- Gummy Realm graphics/performance;
- Phase 14 Place IDs and migration aliases;
- all prior production recovery behavior.

---

# 17. Completion definition

Phase 15 is complete when:

- all six Gummy Places have useful available local cores;
- their advanced service/runtime requirements are capability-specific;
- user-created Place state is durable and context-isolated;
- Radio uses the real AfterCast implementation;
- House uses the real HomeWright implementation;
- Worlds has a real planning/package/experience path and bounded Meshmallow connection;
- Channels has a polished local guide and a materially completed Android application;
- Wardrobe is a working local-first product rather than a fixture;
- Table is a working private coordination product rather than a fixture;
- Rooms works locally across tabs/windows;
- VideoBoss, ImageHoss, Meshmallow, and Browser have polished truthful launch/setup surfaces;
- the four cross-Place journeys create real local destination objects with Returns and Receipts;
- no false external capability claim is introduced;
- all repository, browser, Android, security, privacy, accessibility, performance, preview, production, and rollback gates pass.

Do not stop at an issue, plan, registry edit, screenshot, or richer fixture. Execute through hosted previews and founder-gated release.
