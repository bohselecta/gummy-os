# Contributing to Gummy

Gummy is in its founding architecture phase. Contributions should strengthen the product thesis rather than merely add surface area.

## Start here

Read, in order:

1. [`docs/VISION.md`](docs/VISION.md)
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md)
4. the relevant decision record in [`docs/adr/`](docs/adr/)

Then run:

```bash
npm install
npm run check
npm test
npm run dev
```

## Contribution rules

- Keep the desktop shell web-native and fast.
- Do not add a model SDK directly to UI components. Implement a `ModelAdapter`.
- Do not add a runtime directly to an app. Implement a `RuntimeAdapter` and route through policy.
- Do not expose a connector credential to a model or iframe.
- Add or update an Action Receipt for consequential user-visible actions.
- Treat every new iframe sandbox flag as a security change.
- Keep Gummy provider-neutral. Provider-specific behavior belongs in a pack or adapter.
- Preserve accessibility, keyboard operation, reduced-motion behavior, and readable contrast.
- Update schemas and examples together when changing a protocol artifact.
- Add an ADR for a decision that is expensive to reverse.

## Pull requests

A pull request should explain:

- the user problem;
- the chosen boundary;
- the security and data implications;
- the visible behavior;
- validation performed;
- any protocol or compatibility impact.

Keep commits intentional. Avoid generated assets or dependency churn unless they are necessary to the proof being built.
