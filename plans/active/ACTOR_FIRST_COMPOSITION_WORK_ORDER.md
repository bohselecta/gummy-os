# Actor-First Composition Work Order

## Mission

Transform Gummy OS from application-first interaction into Actor-first composition while preserving all existing architecture invariants.

## Do not change

- Actor and Agent remain separate.
- Mold remains a permissioned operating contract.
- Master Control remains authority layer.
- No ambient authority.
- No automatic private-memory sharing.
- No automatic Actor memory mutation.

## Priority implementation order

### 1. Actor shell primitives

Implement first-class opening, pinning, and restoring Actors in the Gummy Canvas and Gummy Bar.

An Actor window is a view into a persistent Actor, not the Actor itself.

### 2. Production object

Add `gummy.production/v0`.

Production owns:

- participant Actors;
- Actor Plans;
- Bowls;
- Gummies;
- deliverables;
- milestones;
- rights/publication policy;
- Receipts.

### 3. Actor Plan compiler

Support natural language with @mentions.

Compile into a visible graph:

- Actor nodes;
- roles;
- edges;
- required approvals;
- execution assignments.

### 4. Relationship configuration

Support Actor-to-service relationships.

Example:

```
@Hoyt x @VideoBoss
```

Store relationship-specific:

- approved context;
- assets;
- capabilities;
- restrictions;
- retention rules;
- approval rules.

### 5. Context slicing

Never send complete Actor memory to Agents.

Create task-specific context envelopes derived from approved relationships.

### 6. Master Control surface

Create the visual control room window showing:

- Productions;
- Actors;
- Agents;
- Molds;
- Grants;
- data flow;
- Receipts;
- revocation.

### 7. Drag and drop UX

Use the visual OS advantage.

Support:

- dragging Gummies onto Actors;
- dragging Actors into Productions;
- dragging Actors onto other Actors to propose relationships;
- dragging outputs into Composer/Storage Actors;
- dropping files onto Glopper for governed work.

Every drag operation must resolve into explicit objects and permissions.

## Target experience

User:

```
Create Production: Ranch Video
Add @Hoyt
Add @VideoBoss
Add @ProjectComposer
Add @GummyStorage

Make a private family video.
```

Gummy OS:

- creates Production;
- resolves Actors;
- builds Actor Plan;
- previews data flow;
- requests approval;
- routes Agents;
- returns Gummies and Receipts.

## Codex acceptance test

A user can create one Production with multiple Actors, execute one governed Actor Plan, preserve source Gummies, produce results, close Gummy OS, reopen later, and see the same Production state.
