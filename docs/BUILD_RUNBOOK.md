# Gummy Build Runbook

## Orientation

Read `AGENTS.md` and all architecture/security documents before implementation.

## Local verification

```bash
npm run verify
npm run dev
```

Open `http://localhost:4173` and verify:

1. Gummy boots into the browser app.
2. Desktop and dock icons open applications.
3. Windows move, resize, minimize, maximize, and close.
4. `gummy://home`, `gummy://chat`, and `gummy://protocol` work.
5. Files drag to the companion.
6. Medium-risk attachment asks for confirmation.
7. Chat produces a transparent demo response and receipt.
8. Snack changes persist after refresh.
9. A Bowl can be created.
10. A Drop can be published and forked.
11. A Snack can be followed.
12. Enterprise policy can be changed.
13. An Application Pack can be inspected or verified.
14. Receipts reflect the actions above.
15. Full screen works where the browser permits it.

## Git workflow

The agent performing a build lane owns repository hygiene:

1. inspect `main`;
2. create `agent/<lane>`;
3. make the complete scoped change;
4. run `npm run verify`;
5. commit and push;
6. open a draft PR with validation details;
7. merge when checks pass and the user authorized automatic integration;
8. delete the merged branch.

Do not ask the user to manually perform ordinary branch, PR, merge, or cleanup work when connected tools can do it.

## Architecture change rule

Any change introducing a new object type, relationship, capability, trust boundary, runtime, model or connector path, enterprise policy, or federation behavior must update `docs/ARCHITECTURE.md`, `docs/PROTOCOL.md`, and `docs/SECURITY_MODEL.md` in the same lane.
