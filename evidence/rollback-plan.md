# Gummy OS final-release rollback

The application rollback anchor is Gummy OS commit
`c1279e5f45d51e64febf4c29a701bbd5b21e62f1`, deployed by Vercel as
`dpl_2vHQChhogRqYeBndN2HFEsJj49oV` at
`https://gummy-re97al5i9-mygummy.vercel.app`.

## Trigger

Roll back the application when the exact production deployment shows a
critical data-loss, authority-bypass, source-mutation, persistent boot,
security, or accessibility failure that was not present in the acceptance
environment. Do not roll back merely because an optional live specialist is
unavailable; that is already an explicit product state.

## Application rollback

Promote the retained Vercel deployment
`dpl_2vHQChhogRqYeBndN2HFEsJj49oV` for project
`prj_iN4lDNquY0Y2xf297UvDZCVGWmsY`, or redeploy the exact baseline commit
`c1279e5f45d51e64febf4c29a701bbd5b21e62f1`. Verify that the canonical
production alias reports that commit before declaring rollback complete.

## Local Box safety

Before any intentional downgrade, export a complete `.gummybox` backup from
the current build. The final release migrations are additive and idempotent;
never delete IndexedDB/OPFS data or rewrite accepted Results and Receipts as
part of an application rollback. If the older application cannot interpret a
new record, preserve the backup and the browser profile, then restore forward
to the final release rather than destructively coercing the record.

## Specialist rollback

The specialist merge anchors are ImageHoss
`384109c8136b24f9f1843727020d92dee213bfba`, VideoBoss
`1b5c83f9765ca93efb3b37f4c0d89b47e5489143`, and Meshmallow/3D Bee
`78cd86b2482490bbfdc0881ffafa101133850f29`. If a specialist must be reverted,
revert its merge commit without rewriting history, then update Gummy OS's
contract head and cross-repository fixture in the same release transaction.
Never rename or rewrite historical 3D Bee IDs or receipts.

## Verification after rollback

Confirm the deployed commit, boot terminal state, security headers, Local Box
open, and non-destructive access to existing Productions and Receipts. Record
the new Vercel deployment ID and the reason for rollback.
