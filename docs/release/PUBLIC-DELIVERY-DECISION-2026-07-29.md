# Public Delivery Decision — 2026-07-29

## Scope

This cleanup corrects public routing and metadata without changing Gummy's Actor, Production, storage, Composer, authority, or execution architecture.

## Corrections

- Remove the universal rewrite to `index.html`.
- Keep the explicit API rewrite.
- Add real `robots.txt` and `sitemap.xml` files.
- Let unknown URLs return genuine 404 responses.
- Use one title and description across browser, Open Graph, and Twitter metadata.
- Describe the user outcome in the boot shell.
- Protect these decisions with automated tests.

The OS remains at `/`. A separate public landing page and an `/app` or `/os` route require a later founder-approved product decision.

## Loopback CSP decision

The current loopback connection allowance is retained deliberately for compatibility while the local companion path is audited. It is not a vulnerability, but it does reveal a small implementation detail in response headers.

Removing it without a capability audit could cause a functionality regression. A later public-site split can give the public surface a narrower policy while the OS keeps only the local connections it genuinely requires.

## Later public-content work

A crawler-readable landing page, dated changelog, JSON-LD application record, and public provenance timeline should be designed together so discoverability and disclosure are intentional.
