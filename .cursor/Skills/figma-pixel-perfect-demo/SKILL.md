---
name: figma-pixel-perfect-demo
description: Build or modify the portfolio's pixel-accurate animated work demos from Figma frames (ClickUp, Uber, BlueDot, Headspace case studies). Covers pulling specs from Figma, canonical stage sizing, asset export, fonts, and the visual QA loop. Use when rebuilding a demo from a Figma frame, adding a new case-study demo, or fixing accuracy issues where something "doesn't match the Figma".
---

# Pixel-perfect Figma demos

The work demos in `src/components/work/` are animated React recreations of specific Figma frames, rendered at the frame's exact dimensions and scaled to fit their container. Follow the conventions below; deviating from any of them has caused rework before.

## Build workflow

1. **Pull specs per frame.** Use the Figma MCP `get_design_context` on the exact node (load the `figma-design-to-code` skill first, per the plugin's rules). Pull frames one at a time — parallel high-res pulls have hung the Figma MCP server.
2. **Export, don't rebuild, complex vectors.** For illustrations, logos, and multi-layer icons, use `download_assets` (or the returned asset URLs with curl) into `src/assets/<demo>/` rather than re-drawing them. Rebuild in DOM/CSS only what animates or holds live text.
3. **Canonical stage size.** The component renders at the Figma node's exact pixel dimensions and scales via `--demo-scale` (see `src/lib/demoScale.ts` — register the new stage in `SCALERS`). Never hardcode responsive sizes inside the stage.
4. **Fonts are local.** Brand fonts live in `public/fonts/` (SF Pro, Geist, Apercu, Bagoss, Aguzzo). Site fonts are wired in `src/styles/fonts.css`; demo-only brand fonts have their own `@font-face` files (SF Pro is in `src/styles/sf-pro-demo.css`, others in the demo's own CSS). If a demo "can't load" SF Pro, check how the existing ClickUp demos load it before claiming it is unavailable.
5. **Shared chrome comes from one source frame.** Icons and UI repeated across sibling slides (nav rails, workspace pickers, search/AI icons) must be identical — take them from the single agreed frame rather than each slide's own export.
6. **One demo per component, don't touch siblings.** Each demo is its own component; CSS is per component or shared per case study (e.g. `ClickUpAIDemo.css` styles several ClickUp AI demos). When asked to change one demo or variant, never regenerate or clobber the others — and in shared CSS files, scope edits to the target demo's classes.
7. **Mount into the study page.** Demos render inside `StudyBlock` (`src/components/work/StudyBlock.astro`) on the `/work` page; follow how the existing demos are embedded there.

## Accuracy QA loop

Every visual claim gets verified, not eyeballed:

1. Screenshot the component with a throwaway Playwright script (see the `playwright-visual-probes` skill; existing examples: `scripts/cu4-*-shot.mjs`). Scripts must authenticate through the password gate: read `SITE_PASSWORD` from `.env` and `POST /api/auth`.
2. Compare against a Figma export of the same node at the same size.
3. Recheck the details users have repeatedly flagged: font weight/size, stroke widths, icon shapes, cursor decorations, alignment to the pixel, and animation order/speed.
4. Check both Chromium and WebKit before calling anything done (see `safari-demo-rendering` for known WebKit failure modes).

## Animation conventions

- Choreography comes from the user's description of the flow, not invented — confirm event order (e.g. "the reply comes after") before wiring timing.
- Standardize durations with the existing demos; do not speed up or slow down existing animations as a side effect.
- Hover must not pause or alter demos unless explicitly requested.
