# Gummy Production Asset Catalog

Status: **production artwork supplied and locked**  
Date received: **2026-07-25**

The canonical operating rules remain in [`BRAND_SYSTEM.md`](BRAND_SYSTEM.md). This catalog maps each delivered production file to its role in Gummy OS.

## Source archive

The organized full-resolution masters are stored in Hayden's Drive folder while repository binary import is completed:

`https://drive.google.com/drive/folders/1YVnQchNUauRJ4DFPVd4fM6qGRSXVkMH4`

Do not use Drive URLs as production application dependencies. Checked-in repository assets are the runtime source of truth.

## Catalog

| Canonical filename | Dimensions | Role | Primary use |
|---|---:|---|---|
| `gummy-mascot-head-master.png` | 1024×1536 | Full mascot/head master | Large guide art, identity hero, documentation |
| `gummy-lockup-horizontal-master.png` | 1536×1024 | Mascot + wordmark horizontal lockup | Wide headers, marketing, desktop identity |
| `gummy-wordmark-master.png` | 1536×1024 | Wordmark only | Contexts where the mascot already appears |
| `gummy-lockup-vertical-master.png` | 1024×1536 | Mascot + wordmark vertical lockup | Launch, splash, narrow hero, poster layout |
| `gummy-mark-head-square.png` | 1024×1024 | Transparent compact head mark | Navigation, compact identity, avatar-sized use |
| `gummy-app-icon-detailed-square.png` | 1254×1254 | Detailed square application icon | PWA, Apple touch icon, app-store-style identity |
| `gummy-app-icon-flat-round.png` | 1254×1254 | Simplified round icon | Round badges, profile/avatar treatment |
| `gummy-app-icon-monogram.png` | 1254×1254 | G/visor monogram | Favicons and smallest identity contexts |

## Runtime hierarchy

```text
public/brand/gummy/
├── source/      untouched full-resolution PNG masters
├── web/         responsive WebP derivatives
└── favicons/    generated browser and PWA icon sizes
```

Runtime code should import paths from one centralized module:

```text
src/brand/gummy-assets.js
```

## Recommended small-icon mapping

```text
favicon 16/32/48      gummy-app-icon-monogram
Apple touch 180       gummy-app-icon-detailed-square
PWA 192/512           gummy-app-icon-detailed-square
round avatar          gummy-app-icon-flat-round
compact navigation    gummy-mark-head-square
```

## Locked behavior

- The artwork does not recolor between Day Gummy and Night Gummy.
- The wordmark is an image asset, not a font approximation.
- Gummy artwork identifies Gummy OS and the Gummy guide—not Glopper.
- The mascot silhouette, goggles, colors, outline, expression, and proportions remain unchanged.
- Derived assets preserve aspect ratio, transparency, and complete silhouettes.
- No arbitrary background plate may be baked into transparent marks.

## Source hashes

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

## Implementation authority

The active implementation instructions are in:

[`../plans/active/2026-07-25-production-brand-assets-cursor-addendum.md`](../plans/active/2026-07-25-production-brand-assets-cursor-addendum.md)

Cursor/Codex should treat that addendum as a bounded work package and return automated evidence rather than a founder regression checklist.