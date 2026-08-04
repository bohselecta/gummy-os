# Gummy Box

**Status:** Architecture primer matching shipped Gummy OS behavior  
**Canonical name:** Gummy Box (Local Box authoritative by default)

## What it is

The Human-owned durable handoff and storage space for Productions, Gummies, Work Orders, Returns, Receipts, and related records. It is not a generic Drive clone and not the conceptual center of Gummy OS — Actors and Productions are.

## Delivery lanes

```text
Local Box     created on first run — no external account required
Managed Box   explicit opt-in
GitHub        optional scoped connector
Google Drive  optional scoped connector
```

Connecting a provider does not silently make it authoritative. Authority changes, migration, sync, and deletion require explicit Human review and Receipts.

## What Local Box keeps

- Protocol records (IndexedDB)
- Gummy / artifact bytes (OPFS where used)
- Productions, configurations, Runs, results
- Returns and Receipts
- Collaboration / Shared Vision records used by Living Collaboration

Onboarding copy: *Your Local Gummy Box is ready* — private on this device.

## Work Order path

```text
Structured Work Order
→ Gummy Box / Glopper Inbox
→ Human or Master Control review
→ Task Lease + Capability Grant
→ bounded Agent / Demo Worker / specialist runtime
→ Return + artifacts + Receipt
→ back in the Box
```

## Backup

Export/import is inspect-first, versioned, and conflict-aware in the product foundations. Clearing browser site data without a backup loses Local Box state.

## What Box is not

- Not a substitute for Actor Home or Production
- Not automatic cloud sync
- Not a place to hide provider secrets in client-visible material
- Not permission to flatten specialist-native Jobs and Receipts

## Related

- `docs/GUMMY_BOX_WORK_ORDERS.md`
- `docs/finish-kit/INFRASTRUCTURE_AND_GUMMY_BOX.md`
- `src/apps/gummy-box.js`
