# Phase 16.5 Calm Workspace rollback

The exact pre-Phase-16.5 baseline is merge commit
`617d9356b92160f77cda84f19c4877292f8b6edb` from PR #45. Its production
deployment is `dpl_9kRsQWXMG3uZ3DmzFvSq3JDSU21c`.

Rollback is a normal source redeployment of that exact commit. Do not delete or
rewrite Local Gummy Box records. The Phase 16.5 additions are additive metadata:
notification history, navigation preference, Command Center projection
preferences, and a workspace group explicitly marked
`socialInstanceSemantics: false`.

After rollback, inspect those additive records before any optional cleanup:

- `notification-history:actor:hayden`
- `navigation:actor:hayden`
- `command-center-attention:actor:hayden`
- `workspace-group:actor:hayden:default`
- `workspace:last-focused`

No rollback step enables Google, live MCP execution, provider credentials,
publishing, payment, or remote authority. Historical Receipts and all canonical
Production records remain preserved.
