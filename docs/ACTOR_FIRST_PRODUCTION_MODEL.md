# Actor-First Production Model

**Status:** Founder architecture ruling

## Core shift

Gummy OS is Actor-first.

Humans do not primarily compose apps, models, or agents. Humans compose Actors.

Actors are persistent participants. Agents are replaceable execution processes.

> Actors are who/what participates. Agents are how work is performed.

## Production

A Production is the durable undertaking that combines Actors, Gummies, Actor Plans, Bowls, permissions, and deliverables around an outcome.

Examples:

- a family video project;
- a software product;
- a film;
- a research effort;
- a company initiative.

A Production may contain:

- personal Actors;
- service Actors;
- project Actors;
- collective Actors;
- storage Actors.

## @address composition

Users add participants through @addresses:

```
@Hoyt @VideoBoss @ProjectComposer @GummyStorage
```

An @mention requests participation. It does not grant authority.

Gummy OS resolves:

- Actor identity;
- applicable Mold;
- relationship rules;
- permitted context;
- capabilities;
- approval requirements;
- Agent routing.

## Actor Plan

Natural language creates a visible Actor Plan graph.

The plan identifies:

- participating Actors;
- roles;
- inputs;
- outputs;
- data movement;
- approvals;
- Agent execution nodes.

Plans are graphs, not simple chains.

## Production example

```
Ranch Video Production

@Hayden
  creative owner

@Hoyt
  approved participant context

@VideoBoss
  generation service

@ProjectComposer
  assembly service

@GummyStorage
  preservation service
```

## Relationship rule

Actor data is never globally exposed.

Each Actor contributes a task-specific context slice through an approved relationship.

Example:

```
@Hoyt x @VideoBoss

allowed:
- approved likeness references
- beagle references
- private family video permission

blocked:
- unrelated private memory
- commercial use
- public release
```

## Master Control

Master Control is the visual authority panel for:

- Productions;
- Actors;
- Agents;
- Molds;
- permissions;
- data flow;
- receipts;
- revocation.

It should exist as a normal Gummy OS window.

## Gummy meaning

Gummies are the objects that move between Actors and bind the work together:

- files;
- references;
- videos;
- projects;
- applications;
- results;
- receipts.

The brand meaning emerges through interaction, not explanation.

## Implementation principle

Do not replace Actor/Agent/Mold/Master Control. This model is the user-facing composition layer above them.
