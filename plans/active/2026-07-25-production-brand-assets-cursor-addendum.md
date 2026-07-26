# Production Gummy Brand Assets — Cursor Addendum

Status: **active founder directive**  
Artwork received: **2026-07-25**  
Applies to: `bohselecta/gummy-os`, active PR #11

## Objective

Replace temporary Gummy marks and artwork slots with the founder-supplied production identity without changing the underlying Phase 1 authority, storage, Work Order, execution, or evidence architecture.

This is an asset-integration pass, not a redesign and not permission to reinterpret the identity.

## Canonical source folder

The eight full-resolution PNG masters are organized in Hayden's Google Drive folder:

`Gummy Production Brand Assets — 2026-07-25`

Folder ID:

`1YVnQchNUauRJ4DFPVd4fM6qGRSXVkMH4`

Folder URL:

`https://drive.google.com/drive/folders/1YVnQchNUauRJ4DFPVd4fM6qGRSXVkMH4`

The repository should ultimately contain its own checked-in copies. Do not ship production UI that depends on Google Drive URLs.

## Canonical filenames and target paths

Use lowercase kebab-case exactly.

| Role | Canonical master filename | Repository target |
|---|---|---|
| Primary mascot/head master | `gummy-mascot-head-master.png` | `public/brand/gummy/source/gummy-mascot-head-master.png` |
| Full horizontal lockup | `gummy-lockup-horizontal-master.png` | `public/brand/gummy/source/gummy-lockup-horizontal-master.png` |
| Wordmark only | `gummy-wordmark-master.png` | `public/brand/gummy/source/gummy-wordmark-master.png` |
| Full vertical lockup | `gummy-lockup-vertical-master.png` | `public/brand/gummy/source/gummy-lockup-vertical-master.png` |
| Transparent compact head mark | `gummy-mark-head-square.png` | `public/brand/gummy/source/gummy-mark-head-square.png` |
| Detailed square app icon | `gummy-app-icon-detailed-square.png` | `public/brand/gummy/source/gummy-app-icon-detailed-square.png` |
| Flat round app/avatar icon | `gummy-app-icon-flat-round.png` | `public/brand/gummy/source/gummy-app-icon-flat-round.png` |
| G/visor monogram icon | `gummy-app-icon-monogram.png` | `public/brand/gummy/source/gummy-app-icon-monogram.png` |

## Source integrity checks

The imported source files must match these SHA-256 hashes:

```text
78a0c9e79f04d451214dde2a02deded724fd130f78bd25e6d044cf5b469e8778  gummy-mascot-head-master.png
8add90bde3dd717384f517aa24f174091ff9ff9c7a360c2cae1284899f6af704  gummy-lockup-horizontal-master.png
c736c38780eba24c08e0ffb70cd9d1e3f08ea2398ade0d4fa8ceda253f1f72c6  gummy-wordmark-master.png
e53dc4abef4dc94113ef3b23bc9acb34005ba7a25722d84ed5c3dfe32c542449  gummy-lockup-vertical-master.png
7869aa12e4ff182c93aa2941c796d016d1822b59c976b1b2fdfe898edf26c9f6  gummy-mark-head-square.png
3cadb21ad08b0d78900648b0f64ba74b10d7372f9f02033aa06b4b0d9871da15  gummy-app-icon-detailed-square.png
4c03dfd8ae413af93ce6721f465ad67d31b6756d4a02ce7431c73c97e2a42c49  gummy-app-icon-flat-round.png
bd6b00a8dd10b257429f72c941cd981e1ab45092d74733f3663b45ad91888385  gummy-app-icon-monogram.png
```

Do not silently accept an altered, recompressed, renamed, recolored, or regenerated file as the source master.

## Derived web assets

Preserve the PNG masters. Generate web derivatives into:

```text
public/brand/gummy/web/
```

Required derivatives:

```text
gummy-mascot-head.webp
gummy-lockup-horizontal.webp
gummy-wordmark.webp
gummy-lockup-vertical.webp
gummy-mark-head-square.webp
gummy-app-icon-detailed-square.webp
gummy-app-icon-flat-round.webp
gummy-app-icon-monogram.webp
```

Rules:

- preserve transparency;
- preserve aspect ratio;
- do not crop through the mascot, goggles, outline, or wordmark;
- do not use CSS hue rotation, filters, tinting, or recoloring;
- do not stretch or rebuild the wordmark as live text;
- use responsive dimensions and avoid downloading full master resolution for small controls;
- keep the source PNG masters out of routine page payloads.

## Product placement map

### Gummy OS top bar

Desktop/tablet:

- use `gummy-lockup-horizontal.webp` when the available width supports a readable lockup;
- otherwise use `gummy-mark-head-square.webp` with the accessible name `Gummy OS`;
- remove the temporary purple `G` circle.

Phone/narrow layouts:

- use the compact head mark or monogram;
- do not shrink the full wordmark until it becomes illegible.

### Opening/boot surface

- replace the temporary `G` glyph with `gummy-app-icon-monogram.webp` or the compact head mark;
- keep the boot fast and non-blocking;
- preload only the asset actually used.

### Welcome / guide surface

- replace `Gummy guide · temporary artwork slot` and the temporary Gummy artwork treatment with production Gummy artwork;
- use `gummy-mascot-head.webp` or `gummy-lockup-vertical.webp` according to available space;
- do not put the Gummy mascot into Glopper-specific surfaces.

### App, PWA, and browser identity

Default mapping:

```text
16–48 px browser favicon     gummy-app-icon-monogram.png
180 px Apple touch icon      gummy-app-icon-detailed-square.png
192/512 px PWA icons         gummy-app-icon-detailed-square.png
round avatar/badge contexts  gummy-app-icon-flat-round.png
```

Generate actual favicon/PWA sizes into:

```text
public/brand/gummy/favicons/
```

Update `index.html`, `vite.config.js`, the PWA manifest, and any metadata references. The monogram is preferred at very small sizes because the detailed head loses clarity.

### Marketing and documentation

- horizontal lockup = wide headers, repository/social banners, compact marketing areas;
- vertical lockup = poster-like, launch, splash, and narrow hero placements;
- wordmark = places where the mascot is already independently visible;
- full mascot/head master = large identity art, not a tiny navigation glyph.

## Gummy versus Glopper

These files belong to **Gummy**, the purple-dominant platform guide and Gummy OS identity.

They do not replace Glopper.

Do not:

- use the monkey as the Glopper Agent avatar;
- label Gummy artwork as Glopper;
- remove explicit executor identity such as `agent:glopper-web`;
- merge Gummy and Glopper into one character.

Gummy tells the Human where they are. Glopper helps the Human act.

## Day and Night behavior

The artwork itself is locked and does not recolor between Night Gummy and Day Gummy.

Only its surrounding surface, spacing, shadows, and contrast treatment may change. Do not add a white box behind transparent masters. Verify the production artwork remains legible against both canonical expressions.

## Accessibility

- meaningful brand images receive concise accessible names such as `Gummy OS` or `Gummy, the VR-goggled chimp guide`;
- decorative duplicates use empty alt text or `aria-hidden="true"`;
- the product name remains available as text to assistive technology even where the visible wordmark is an image;
- do not place essential status, authority, or action information inside the artwork;
- reduced motion must not affect brand comprehension.

## Performance and implementation

- define one centralized asset map/module; do not scatter string paths throughout the application;
- use width/height or `aspect-ratio` to prevent layout shift;
- eagerly load only the top-bar/boot identity asset;
- lazy-load large welcome or marketing art;
- verify service-worker/PWA caching does not retain obsolete placeholder assets after an update;
- keep source and derived asset names deterministic.

Suggested module:

```text
src/brand/gummy-assets.js
```

Suggested export shape:

```js
export const gummyAssets = {
  mascotHead: '/brand/gummy/web/gummy-mascot-head.webp',
  horizontalLockup: '/brand/gummy/web/gummy-lockup-horizontal.webp',
  wordmark: '/brand/gummy/web/gummy-wordmark.webp',
  verticalLockup: '/brand/gummy/web/gummy-lockup-vertical.webp',
  compactHeadMark: '/brand/gummy/web/gummy-mark-head-square.webp',
  appIconDetailed: '/brand/gummy/web/gummy-app-icon-detailed-square.webp',
  appIconRound: '/brand/gummy/web/gummy-app-icon-flat-round.webp',
  appIconMonogram: '/brand/gummy/web/gummy-app-icon-monogram.webp'
};
```

## Automated acceptance

Add automated checks that prove:

1. all required source and derived assets exist;
2. source hashes match this addendum;
3. no temporary `G` brand glyph remains in production UI;
4. no `temporary artwork slot` copy remains after the integration pass;
5. top bar, boot, guide, Day Gummy, Night Gummy, desktop, and phone screenshots render the production identity;
6. favicon, Apple touch icon, and PWA manifest paths return HTTP 200;
7. Gummy artwork is never used as the Glopper executor identity;
8. visual tests fail on missing, distorted, or clipped artwork;
9. `npm run verify` and preview acceptance remain green.

No founder regression checklist is required. Cursor/Codex owns implementation and automated evidence.

## Completion report

Return:

- exact commit SHA;
- final repository paths;
- generated derivative dimensions and file sizes;
- screenshots for Day/Night desktop and phone;
- CI and deployed-preview results;
- any genuine asset limitation that could not be automated.

Do not call this complete while production UI still displays placeholder Gummy marks.