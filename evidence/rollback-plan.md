# Gummy OS final-release rollback

The application rollback anchor is the accepted Phase 10 Gummy OS commit
`4369d7181868cfd173f88698816b9190f9c0ad11`, deployed by Vercel as
`dpl_EzAjF9HeksPnNWg8tYDnzhLNhVQa` at
`https://gummy-os-six.vercel.app`.

## Trigger

Roll back the application when the exact production deployment shows a
critical data-loss, authority-bypass, source-mutation, persistent boot,
security, or accessibility failure that was not present in the acceptance
environment. Do not roll back merely because an optional live specialist is
unavailable; that is already an explicit product state.

## Application rollback

Promote the retained Vercel deployment
`dpl_EzAjF9HeksPnNWg8tYDnzhLNhVQa` for project
`prj_iN4lDNquY0Y2xf297UvDZCVGWmsY`, or redeploy the exact baseline commit
`4369d7181868cfd173f88698816b9190f9c0ad11`. Verify that the canonical
production alias reports that commit before declaring rollback complete.

## Local Box safety

Before any intentional downgrade, export a complete `.gummybox` backup from
the current build. The final release migrations are additive and idempotent;
never delete IndexedDB/OPFS data or rewrite accepted Results and Receipts as
part of an application rollback. If the older application cannot interpret a
new record, preserve the backup and the browser profile, then restore forward
to the final release rather than destructively coercing the record.

## Specialist rollback

The accepted specialist heads are ImageHoss
`340f819b20c5b6d7ea988459c9380759941c757f`, VideoBoss
`e67db769219e5a764821f7bac74638f3791dca98`, and Meshmallow/3D Bee
`0c911f7552739f2e0bdefaf863a78a53f04a04c0`. If a specialist must be
reverted, revert its Phase 10 merge commit without rewriting history, then
update Gummy OS's contract head and cross-repository fixture in the same
release transaction. Never delete accepted artifacts or rename/rewrite
historical 3D Bee IDs or receipts.

## Verification after rollback

Confirm the deployed commit, boot terminal state, security headers, Local Box
open, and non-destructive access to existing Productions and Receipts. Record
the new Vercel deployment ID and the reason for rollback.
