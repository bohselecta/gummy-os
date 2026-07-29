# Runtime Binding Migration Plan

## Starting point

The integration stack starts at the founder-accepted Phase 16 merge commit:

`2d4c96cc78d35bc374af4b3d4fce12f5d9c8745a`

The accepted Phase 16 schemas and documents are preserved as-is.

## Additive migration

1. Register the provider-neutral Runtime Binding and execution schemas.
2. Allow new Work Order runs to reference an execution route without changing
   existing Work Order meaning.
3. Create Runtime Bindings only after Lease, Mold, Grant, Production Pool
   authorization, Return anchor, and acceptance policy validation.
4. Project adapter status into Command Center as non-authoritative observations.
5. Route input, scope, budget, continuation, acceptance, and release decisions to
   Master Control.
6. Convert completion into a Return candidate, then use existing Return and
   Receipt objects.
7. Persist provider-neutral checkpoints beside canonical Gummy Box state.
8. Enable deterministic adapters for release.
9. Evaluate each live adapter as a separate optional capability.

Existing objects are not renamed, flattened, duplicated, or replaced. Existing
records without a Runtime Binding continue through their current execution route.

## Rollback

Rollback disables creation and dispatch of new Runtime Bindings while preserving
their records and checkpoints for audit. Existing canonical Gummy objects remain
readable because no provider migration owns or rewrites them.

Production rollback continues to use the repository release process. The
historical rollback anchor is
`4369d7181868cfd173f88698816b9190f9c0ad11`; the current production deployment
discovered before this stack was deployment `5649699169` at
`f9bccc2894e301c6cbf0f73bcf2fd387206cd73f`.

## Data migration status

No destructive or bulk data migration is required for this checkpoint. Runtime
Bindings are new records. A future live provider migration must first demonstrate
export, replay, cancellation, credential rotation, and provider-loss recovery.
