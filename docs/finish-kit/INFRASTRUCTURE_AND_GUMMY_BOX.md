# Infrastructure, Gummy Box, Deployment, and Recovery Plan

## Product ruling

A new user does not configure infrastructure before using Gummy OS.

```text
Open Gummy OS
→ Local Gummy Box already exists
→ create and use Productions
→ export a backup whenever desired
→ connect another location only by explicit choice
```

GitHub, Google Drive, managed storage, deployment projects, environment variables, buckets, repositories, App installations, private keys, and provider credentials are implementation details or optional connections—not the product doorway.

## Authority model

A Gummy Box is a Human-owned durable location with an explicit authority role.

Supported roles:

- **authoritative** — the selected source of truth for the scoped Box;
- **mirror** — receives synchronized copies but does not silently decide conflicts;
- **export** — one-time portable package;
- **import source** — inspected input that never overwrites current state without review.

Default:

```text
Local Box = authoritative
external locations = disconnected
```

Changing authority requires a Human-reviewed migration plan and Receipt. Merely connecting a provider does not make it authoritative.

## Release-required Local Box

The founder-ready release must provide a complete local-first system without an account.

### Storage responsibilities

- IndexedDB: protocol records, indexes, configuration, Runs, Work Orders, Leases, Grants, Returns, Receipts, links, capability snapshots, and migration state;
- OPFS or current byte store: source Gummies, imported files, accepted specialist originals/proxies, generated artifacts, evidence packages, and backups-in-progress;
- local preferences only: theme, window layout, dismissed guidance, and other non-authoritative UI settings;
- no authoritative Production or protocol object lives only in `localStorage`.

### Required guarantees

- stable IDs and revisions;
- SHA-256 or accepted content hash for durable bytes;
- atomic or recoverable writes;
- source immutability;
- idempotent imports and migrations;
- no silent overwrite on ID/hash conflict;
- browser restart and application upgrade recovery;
- exact storage failure and quota reporting;
- index rebuild from durable records where feasible;
- accepted results and evidence survive disposable workspace reset;
- deletion/reset produces an explicit preview and Receipt.

## Local Box first-run behavior

On first open:

1. create the Box schema and metadata;
2. run deterministic migration from any known legacy state;
3. verify read/write capability;
4. create a minimal recovery marker;
5. show a plain-language success or exact blocked state;
6. do not ask the user for a folder, repository, account, or secret.

Suggested visible status:

```text
Local Gummy Box
Ready on this device
Productions, Gummies, Returns, and Receipts are stored in this browser.
```

Technical detail may disclose IndexedDB/OPFS and origin scope behind an expander.

## Portable backup package

Implement a versioned, inspect-first package such as:

```text
gummy-box-backup/v1
```

Suggested extension: `.gummybox` or a documented ZIP MIME type.

Minimum manifest:

- package schema/version;
- created timestamp;
- source Gummy OS version and commit where available;
- Box ID and authority role;
- included Production/Actor/Gummy/Return/Receipt IDs;
- record revisions and hashes;
- byte entry path, media type, length, and hash;
- relationships and provenance;
- known external references not embedded;
- encryption status;
- limitations;
- package hash or signed digest when implemented.

### Export requirements

- deterministic inventory before writing;
- no provider secrets, session tokens, private keys, or unapproved ephemeral runtime data;
- progress and cancellation;
- quota/disk failure handling;
- final package hash;
- downloadable human-readable summary;
- export Receipt.

### Import requirements

- inspect before apply;
- validate archive structure, paths, sizes, hashes, schemas, rights, and references;
- reject traversal, active-content surprises, unsupported compression, duplicate IDs, and tampering;
- show exact added/unchanged/conflicting/missing items;
- import into a staging transaction;
- preserve both versions on unresolved conflict;
- apply atomically or roll back;
- create import/migration Receipt;
- never mutate the source backup.

## Recovery and reset

### Application recovery

At boot, detect and handle:

- interrupted migration;
- interrupted byte write;
- orphaned index record;
- byte without index record;
- stale Task Lease;
- Run marked active with no recoverable Job;
- provider Job needing recovery;
- corrupted preference state;
- unsupported future schema.

The product should explain what was recovered, quarantined, or left untouched.

### Reset levels

Provide separate actions:

1. **Reset layout and preferences** — no Production data removed;
2. **Clear disposable workspace** — accepted sources/results/evidence remain;
3. **Remove one Production** — preview dependent objects and export option;
4. **Erase Local Gummy Box** — typed confirmation, backup offer, exact scope, final Receipt where possible.

Never present one vague `Reset everything` button.

## Optional GitHub connector

GitHub remains useful for code, text, diffs, branches, and PR workflows. It is not normal consumer onboarding.

### User experience

Normal copy:

```text
Connect GitHub
Use a selected private repository as a mirror or project handoff location.
Gummy OS will request access only to the repository you choose.
```

Do not ask normal users to create:

- a GitHub App;
- a PEM key;
- an installation ID;
- a test repository;
- Vercel environment variables;
- a branch manually.

### Platform implementation

A production connector should use a platform-owned OAuth/GitHub App flow or equivalent managed authorization. Scope it to selected repositories and the exact operations required.

Required behavior:

- explicit repository selection;
- visible authority role: mirror or authoritative only after migration approval;
- expected-head reconciliation;
- one coherent commit per multi-file operation;
- branch namespace owned by the connector;
- conflict detection before write;
- no force push by default;
- disconnect and token revocation;
- offline queue with idempotency;
- provider request and commit references in Receipts;
- no ambient access to all repositories.

The current private GitHub proof may remain an engineering adapter while the user-facing managed connection is built. Do not expose proof-era credential setup as final onboarding.

## Optional Google Drive connector

Drive is suited to documents, images, media, and collaboration.

Required behavior mirrors GitHub principles:

- user selects one folder/root;
- exact requested scopes are visible;
- provider files are untrusted until validated;
- IDs/revisions/hashes/provenance are retained;
- changes outside the selected root are impossible;
- sync conflict preserves both versions;
- disconnect blocks future access without falsifying prior Receipts;
- local operation remains useful while disconnected.

Drive is optional for the release unless an existing connected implementation can be completed without destabilizing the Local Box.

## Optional managed Gummy Box

A managed Box improves cross-device continuity and removes GitHub/Drive complexity, but it remains a subsystem lane.

Potential infrastructure may use Cloudflare Workers, D1, R2, Durable Objects, Queues, or an equivalent managed stack. The exact provider is an implementation choice; the product contract is not.

### Required managed responsibilities

- authenticated Human account and device/session handling;
- metadata/revision store;
- content-addressed or hash-verified byte storage;
- encrypted transport;
- scoped upload/download grants;
- conflict-safe synchronization;
- asynchronous jobs/notifications where required;
- retention and deletion;
- audit/Receipt references;
- provider outage and local-offline behavior;
- export and account deletion.

### Non-negotiable behavior

- managed signup is not required to start locally;
- the user knows which location is authoritative;
- provider outage does not destroy local work;
- no silent transfer of authority from Local to Managed;
- migration can be paused/retried safely;
- all IDs, hashes, rights, provenance, and Receipts survive migration;
- account deletion has an export path;
- infrastructure terminology remains out of the normal user experience.

## Synchronization model

Use explicit revisions and compare-and-swap or equivalent conflict detection.

Every synchronization operation should know:

- Box ID;
- object ID;
- local revision/hash;
- remote revision/hash;
- base/common revision where available;
- authority role;
- operation ID/idempotency key;
- Human/policy authorization;
- terminal outcome.

### Conflict policy

Never resolve a meaningful content conflict by `last write wins` without disclosure.

Preferred behavior:

```text
same ID + same hash → idempotent
same ID + descendant revision → advance
same ID + divergent revision → preserve both, mark conflict, ask or apply typed merge
unknown remote deletion → tombstone/review, not silent local deletion
```

## Provider and model secrets

- never embed secrets in browser bundles, static assets, source maps, logs, fixtures, backups, or Receipts;
- use server-side environment/secrets management or authenticated local companion storage;
- expose only connection status and sanitized capability facts;
- rotate/revoke without data loss;
- use least privilege;
- fail closed when cost or authority policy cannot be enforced;
- never log complete private prompts/assets by default;
- automated tests inspect built bundles for known secret markers.

## Web deployment

The production web deployment must:

- build from an exact commit;
- serve the PWA and assets with correct MIME/cache headers;
- preserve SPA routes;
- expose only intended API routes;
- use HTTPS and stable origin configuration;
- set a stable session secret where sessions exist;
- use restrictive CSP compatible with the product;
- protect state-changing server actions with authenticated session/CSRF or equivalent origin controls;
- return sanitized errors;
- identify deployed commit/build in an inspectable About or diagnostics surface;
- support rollback to the prior accepted deployment.

Preview and production aliases must not point to obsolete scaffolds. Acceptance checks the actual HTML, brand assets, API capability state, and build identifier—not merely deployment status.

## Native/local companion distribution

For ImageHoss and Meshmallow local capability:

- provide one documented start/install command or packaged companion per supported OS;
- bind only to loopback by default;
- authenticate every session;
- use explicit origin pairing;
- expose health and capability discovery;
- do not expose arbitrary filesystem or command execution;
- provide clear start/stop/revoke behavior;
- version the companion/contract;
- retain logs/evidence without private source leakage;
- publish a truthful compatibility matrix.

A local companion can be absent without making Gummy OS unusable.

## Observability

Collect only what is needed to diagnose product reliability.

Required local/CI evidence:

- build and commit;
- route/runtime version;
- sanitized terminal status;
- duration;
- cost where applicable;
- retry/recovery path;
- storage/migration outcome;
- test fixture identity;
- browser/viewport.

Do not send personal Actor memory, source Asset bytes, full prompts, likenesses, private file names, credentials, or Box contents to analytics by default.

## Migration strategy

For every schema/storage change:

1. define source and target versions;
2. create representative and adversarial fixtures;
3. implement deterministic transform;
4. preserve unknown data when safe or fail explicitly;
5. make migration idempotent;
6. stage byte writes before authority switch;
7. record per-object outcome;
8. support rollback or safe read-only mode;
9. automate clean, legacy, interrupted, malformed, and repeated migration tests;
10. retain a migration Receipt/report.

## Release priority

### Required for founder-ready release

- automatic Local Box;
- durable state and bytes;
- first-run verification;
- backup export/import;
- migration/recovery;
- reset scopes;
- capability-safe web deployment;
- local companion discovery paths;
- optional connector UI does not block local use.

### Complete when available but not release-blocking

- polished managed Box;
- production OAuth GitHub connector;
- Google Drive connector;
- cross-device sync;
- account billing/administration.

These may move into the release only when they meet the same evidence standard and do not delay or destabilize the local-first candidate.

## Infrastructure exit gate

A clean browser can:

```text
start locally
→ create Production data and artifact bytes
→ close/reopen
→ export a complete backup
→ inspect/import that backup into a clean context
→ recover identical IDs/hashes/relationships/evidence
→ disconnect any optional provider
→ continue locally
```

No release claim may require Hayden to understand or repair GitHub/Vercel/provider plumbing.
