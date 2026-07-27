# Product Readiness, Onboarding, and Copy Specification

## Release experience thesis

Gummy OS should feel like a computer the user can understand immediately and continue discovering over time.

```text
Simple doorway
+ complete house
+ visible authority
+ delightful creation
+ durable evidence
```

The first experience must not resemble an architecture demo, a schema browser, a generic chatbot, a developer dashboard, or an empty desktop that expects the user to know what to open.

## Five-second comprehension

The first useful screen should communicate:

> **Your creative computer, with you in control.**
>
> Start locally. Bring an idea, file, or project. Configure what you want. Nothing runs until you choose **Make Production**.

Required visible ideas:

- this is Gummy OS;
- it is for making and organizing real work with AI;
- the user retains control;
- local start requires no account;
- Make Production is the action boundary.

Do not show protocol jargon in the primary headline.

## Ten-second first action

Offer exactly two prominent paths:

1. **Start a blank Production**
2. **Open the Night Gummy Launch sample**

Secondary, less prominent paths:

- import a project or backup;
- open an existing Production;
- learn how Gummy OS works.

Do not make GitHub, Drive, model providers, local bridges, or account creation a prerequisite for either primary path.

## First-run sequence

### Screen 1 — Welcome

Suggested copy:

```text
Gummy OS
Your creative computer, with you in control.

Start locally. Connect more only when you choose.
```

Primary action: `Enter Gummy OS`  
Secondary detail: `What stays on this device?`

### Screen 2 — Your starting place

Suggested copy:

```text
Your Local Gummy Box is ready.
It keeps your Productions, Gummies, Returns, and Receipts in this browser.
You can export a backup or connect another location later.
```

Primary actions:

- `Start a blank Production`
- `Open the sample Production`

### Screen 3 — The execution rule

Suggested copy:

```text
Configure freely. Nothing runs yet.

Add Actors, assign references, choose routes, and preview the package.
Make Production is the only step that starts authorized work.
```

Primary action: `Got it — open my Canvas`

This explanation should not be repeated as a blocking tutorial after the first completion. Keep a concise reminder in Production and specialist configuration surfaces.

## Progressive disclosure

### Level 1 — plain product language

Use first:

- Production
- person or specialist
- source
- result
- connection
- approval
- activity
- evidence

### Level 2 — operational language

Reveal when relevant:

- Actor
- Agent
- route
- runtime
- permissions
- acceptance
- Return
- Receipt

### Level 3 — inspectable protocol detail

Expose in Master Control, technical details, downloadable evidence, and developer views:

- Mold
- Task Lease
- Capability Grant
- Context Envelope
- hashes
- schema versions
- exact executor ID
- provider request IDs
- receipt linkage

Never hide Level 3. Never require Level 3 to complete a normal first Production.

## Gummy and Glopper voice separation

### Gummy

Gummy orients, explains, remembers location, and helps the user understand relationships.

Voice qualities:

- clear;
- calm;
- compact;
- reassuring without being childish;
- specific about state.

Examples:

```text
Your Local Gummy Box is ready.
This configuration belongs only to Night Gummy Launch.
Two references still need roles before this package is ready.
```

### Glopper

Glopper is energetic around action, approvals, execution, and results.

Voice qualities:

- direct;
- lively;
- competent;
- never reckless;
- transparent about the actual Agent and route.

Examples:

```text
Everything is configured. Review the Run, then Make Production.
ImageHoss is connected locally. This route uses no cloud provider.
VideoBoss is ready to plan, but no real render provider is connected yet.
```

Do not let either personality obscure the actual executor, provider, locality, cost, or authority.

## Production UX

### Empty state

Replace a single fixture-specific action with:

```text
Start a Production
A Production keeps the people, specialists, sources, decisions, Runs, results, and evidence for one undertaking together.
```

Actions:

- `Start blank`
- `Use Night Gummy Launch sample`
- `Import Production`

### Production header

Always show:

- title;
- plain-language status;
- owner;
- privacy/audience;
- current revision;
- whether a Run is configuring, ready, active, blocked, completed, or needs acceptance;
- `Make Production` only when the current configuration can be reviewed.

### Guided setup rail

The rail should be useful without implying one mandatory sequence for every Production.

Each step shows:

- what this Actor contributes;
- whether it is required or optional;
- current readiness;
- exact blocker in plain language;
- whether opening the surface executes anything: **No**;
- the next useful action.

Example:

```text
ImageHoss
Visual direction and image Assets
Needs two reference roles
Open to configure — no generation will run
```

### Actor App Surface

Replace generic key/value fields for specialists with structured, product-native sections.

Shared sections:

1. Direction
2. Deliverable
3. Locks
4. References / Assets
5. Exploration
6. Exclusions
7. Route and capability
8. Cost, locality, privacy, rights
9. Acceptance
10. Compiled preview
11. Save for this Production

The user should not need to edit schema-shaped fields such as `referenceMode`, `crop`, or `includeMule` without context.

### Compiled preview

Show a human-readable package before technical JSON.

```text
What stays fixed
What may vary
What each reference controls
What route will run
What it will cost
Where data goes
What counts as an acceptable result
What remains unresolved
```

Provide `View technical package` as an inspectable secondary action.

### Make Production review

Before execution, show:

- immutable configuration revision;
- required and optional nodes;
- actual eligible Agents/runtimes;
- missing capabilities;
- Work Orders to be created;
- source Assets and rights;
- cost ceilings;
- locality;
- cancellation/recovery expectations;
- likely outputs;
- exact consequence of continuing.

Suggested primary copy:

```text
Make this Production
This freezes the current configuration and starts only the authorized work shown here.
```

Do not use vague action labels such as `Run`, `Go`, `Generate`, or `Continue` for the Production-wide execution transition.

## Golden sample: Night Gummy Launch

The built-in sample should be safe, attractive, and representative.

### Purpose

Create launch material for Gummy OS using only repository-owned brand Assets and neutral environment references.

### Suggested specialist roles

- ImageHoss: one 16:9 launch image with protected interface-safe space;
- VideoBoss: a short motion/shot plan and, when connected, one bounded video take;
- Meshmallow: a simple stylized chamber/world concept and, when connected, one bounded scene package;
- ProjectComposer/Gummy Storage: assemble the accepted outputs and preserve evidence.

### Required behavior

- deterministic demo outputs are visibly labeled;
- real connected outputs use different evidence and are never conflated;
- the sample demonstrates locks, reference roles, route disclosure, comparison, Human acceptance, downstream handoff, Returns, and Receipts;
- no private likeness, voice, personal memory, or external copyrighted source is required;
- the user may duplicate the sample into an independent Production.

## Application surface

Each first-party application card should answer:

1. What is this application for?
2. What works right now?
3. What connection or runtime is required?
4. What can I do without that connection?
5. What will opening it do?
6. What will opening it **not** do?

### Example: ImageHoss

```text
ImageHoss
Direct images with structured references, compare candidates, accept Assets, and hand them to VideoBoss.

Connected locally: real bounded ComfyUI generation is available.
Not connected: direction, references, package preview, and deterministic studies remain available.
Opening ImageHoss does not generate an image.
```

### Example: VideoBoss

```text
VideoBoss
Plan sequences, build shots, protect credits, review takes, preserve continuity, and deliver video packages.

Planning and review work locally.
Real rendering requires a connected provider route.
Opening VideoBoss does not spend credits or render a take.
```

### Example: Meshmallow

```text
Meshmallow
Turn world intent into a reviewed scene plan, bounded Blender operations, editable source, and engine handoff.

Planning and mock execution work without Blender.
Real scene output requires the authenticated local supervisor and supported Blender runtime.
Opening Meshmallow does not execute Blender.
```

## State copy library

### Ready

```text
Ready to review
The configuration is complete. No work has started.
```

### Capability unavailable

```text
Runtime not connected
You can finish the configuration and inspect the package now. Connect the named runtime before Make Production can execute this node.
```

### Blocked by authority

```text
Approval required
This Asset or capability is outside the current permission. Review it in Master Control.
```

### Denied

```text
Not authorized
Nothing ran. The denied action and reason were recorded in a Receipt.
```

### Failed

```text
The attempt failed
Your sources and previous accepted results are unchanged. Review the evidence, then retry or revise.
```

### Cancelled

```text
Cancelled
The owned Job was asked to stop. Partial outputs are not accepted automatically.
```

### Ambiguous external call

```text
Provider outcome needs recovery
The request may have reached the provider, so Gummy OS will inspect the existing Job instead of submitting a duplicate.
```

### Completed, awaiting Human acceptance

```text
Results are ready
Compare the eligible outputs and choose what this Production should accept.
```

### Completed and accepted

```text
Accepted
The selected result now has the role shown below. Other candidates remain inspectable and unchanged.
```

## Empty states

Every empty state must contain:

- a short explanation of the surface;
- why it is empty;
- the safest useful action;
- whether the action executes anything.

Avoid empty states that say only `No items`, `Nothing here`, or `Get started`.

## Error and recovery design

Every terminal problem must show:

- what failed or was blocked;
- whether any external work may still exist;
- whether source/result state changed;
- what evidence was recorded;
- the safe next action;
- a technical detail expander.

Never leave the user with a permanent spinner or a generic `Something went wrong` message.

## Setup and capability guidance

Local runtime setup should be a guided capability check, not an infrastructure tutorial.

The UI may show:

```text
1. Install or open the supported application.
2. Start the authenticated local companion.
3. Gummy OS verifies the exact capability.
4. Review what the connection may access.
5. Approve the connection.
```

Do not expose GitHub App IDs, PEM files, repository installation internals, provider secret values, or raw local tokens in normal setup copy.

## Accessibility requirements

- the entire first-run and golden Production path works by keyboard;
- screen-reader users receive useful labels, status changes, progress, and terminal summaries;
- focus returns predictably after dialogs;
- all modal surfaces trap and restore focus correctly;
- action, status, and identity are never communicated by color alone;
- Night and Day both meet contrast requirements;
- reduced motion removes nonessential animation without removing state feedback;
- touch targets are usable at phone width;
- content reflows at 200% zoom;
- technical JSON does not precede the readable explanation.

## Content QA gate

Before release, extract or enumerate all user-facing strings and audit them for:

- stale names: `3D Bee` where current public copy should say Meshmallow;
- fixture-only language presented as product truth;
- false claims of real generation;
- unexplained protocol jargon;
- contradictory execution wording;
- unclear cost/locality/privacy;
- dead-end error copy;
- missing next action;
- inconsistent Gummy/Glopper voice;
- generic AI-assistant phrasing that erases the product’s distinctiveness.

The audit result belongs in `evidence/product-copy-audit.json`.
