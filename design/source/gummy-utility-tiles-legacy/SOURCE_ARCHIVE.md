# Founder Source Archive

The original founder-supplied archive is stored in Hayden's Google Drive:

`https://drive.google.com/file/d/10JJn88oYrK_3WzD5tuNpnec2riv-9-WE/view?usp=drivesdk`

File name:

```text
gummy-utility-tiles-founder-source-2026-07-27.zip
```

Codex must download and verify the archive against `manifest.json` before generating derivatives.

Import only the seven unique masters listed in the manifest. Exclude:

- `screenshot-placeholder.png`, which is an exact duplicate of `gummylayout-tile.png`;
- all `__MACOSX` AppleDouble metadata files.

Do not modify or recompress the source masters when placing them under this directory. Production derivatives belong under `public/brand/gummy/utility-tiles/` and must have their own deterministic hash manifest.
