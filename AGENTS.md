# Gummy Agent Instructions

Read, in order:

1. `README.md`
2. `docs/VISION.md`
3. `docs/PRODUCT_SPEC.md`
4. `docs/ARCHITECTURE.md`
5. `docs/SECURITY_MODEL.md`
6. `docs/SOCIAL_GRAPH.md`
7. `docs/ENTERPRISE_FRAMEWORK.md`
8. `docs/ROADMAP.md`
9. `docs/BUILD_RUNBOOK.md`

## Non-negotiable constraints

- Preserve provider neutrality.
- Keep the desktop shell web-native and fast.
- Do not grant models ambient access.
- Do not treat Snack shape or color as authentication.
- Do not bypass browser framing policy.
- Do not hide network, model, connector, or runtime activity.
- Every consequential action must be representable as a capability grant and Action Receipt.
- Social sharing must have explicit audience, provenance, and revocation.
- Enterprise features use the same protocol objects as personal Gummy, with additional policy—not a separate incompatible product.
- Update architecture and protocol docs whenever a feature changes a boundary or object model.

## Completion standard

A lane is complete only when the user-visible path works, the security boundary is explicit, protocol objects are typed, tests cover deterministic logic, docs match code, and `npm run verify` passes.
