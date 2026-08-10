---
name: safari-demo-rendering
description: Diagnose and fix Safari/WebKit rendering bugs in the portfolio's scaled work demos — blurry or pixelated SVGs, demos clipped or not scaling, soft baked-in text, broken alpha video masks, cut-off icons, missing border radii. Use when the user reports something looks blurry, cut off, clipped, or wrong "in Safari" or "on iPhone" on a work demo.
---

# Safari demo rendering fixes

The work demos are fixed-size stages scaled to their container with `transform: scale(var(--demo-scale))`. Most Safari bugs here trace back to how WebKit handles that scale. Diagnose by symptom, verify with a WebKit Playwright probe (see the `playwright-visual-probes` skill), never by assuming Chromium behavior carries over.

## Decision tree by symptom

**Demo clipped / stuck at wrong size in Safari only**
Safari rejects `transform: scale(calc(100cqw / Npx))`. Never use cqw math in transforms. `src/lib/demoScale.ts` sets `--demo-scale` (container width / design width) via ResizeObserver. Add the new stage's selector and design width to its `SCALERS` array and use `scale(var(--demo-scale, 1))` in CSS.

**SVG `<img>` blurry or pixelated when the frame scales up**
WebKit rasterizes an SVG `<img>` once at pre-transform layout size, then lets the compositor stretch the bitmap. Fix: bake the SVG to high-DPI lossless WebP with `scripts/rasterize-demo-svgs.mjs` — add a `TARGETS` entry (`cssWidth`/`cssHeight` = the CSS box the asset occupies, not the SVG header — measure with `getBoundingClientRect()` at `--demo-scale: 1` or read it from the component CSS; `scale` 3x for medium assets, 10-12x for tiny glyphs under ~20px), run `node scripts/rasterize-demo-svgs.mjs`, and swap the component import from `.svg` to `.webp`. Rendering goes through Chromium because these exports use filters/masks that librsvg renders differently. Note: `playwright` and `sharp` are not tracked in `package.json`; install them ad hoc if missing.

**Text soft/blurry compared with neighboring text**
Usually text baked into a PNG that got downscaled — not Safari-specific. Replace the baked run with live DOM text (`<p>` over a background-colored mask div) positioned to match the baked ink. Use pixel probes to align (example: `scripts/hsd-meta-ink.mjs` compares ink centroids of live vs baked text).

**Alpha/masked video not compositing**
Safari mishandles alpha video stacking (ProRes/HEVC-alpha). Prefer `clip-path: inset(... round Npx)` on the `<video>` element over alpha compositing or CSS masks.

**Icon cut off inside an `overflow: hidden` box positioned with `inset`**
`width/height: 100%` fights the inset box in WebKit. Set `width: auto; height: auto` (or size one axis only) so `inset` defines the box, and re-check the glyph against the Figma node.

**Border radius / shadow missing on a scaled demo**
Radius applied inside the scaling transform gets scaled away or clipped. Move `border-radius`, `box-shadow`, and `overflow: hidden` to the unscaled parent wrapper. If a corner is overlapped instead of clipped, it is a z-index stacking problem — raise the rounded element.

## Checklist

- [ ] Reproduce in WebKit via Playwright (`webkit.launch()`), not just Chromium
- [ ] Identify the symptom row above; apply the known fix before inventing a new one
- [ ] Screenshot the same component in both engines after the fix
- [ ] Check mobile widths (430px) as well as desktop (1440px)
