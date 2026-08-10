# Skills backlog — mined from 18 conversation cards (2026-08-05)

Source: 24 parent transcripts across 3 projects (21 non-empty, 18 carded — 3 trivial chats skipped).
Cards live in `skills-mining/cards/`. Score = repeat count x non-obviousness x stability, each 1-3.

## Shipped in this batch (6 skills)

| Rank | Skill | Home | Supporting chats | Score | Notes |
|------|-------|------|------------------|-------|-------|
| 1 | `figma-pixel-perfect-demo` | project `.cursor/skills/` | 3807713d, c2d5a467, 6b8198e7, 9c183616, 541c4313, 8dee5dda | 3x3x3=27 | The dominant workflow: Figma frame -> animated React demo at canonical size, per-frame `get_design_context`, `download_assets` for illustrations, local OTF fonts |
| 2 | `playwright-visual-probes` | personal `~/.cursor/skills/` | 3807713d, c2d5a467, c1db85b0, cdda3ea9 | 3x3x3=27 | Throwaway `*-shot.mjs` / `*-probe.mjs` / `*-ab.mjs` scripts; auth gate, dual-engine capture, JSON geometry output |
| 3 | `safari-demo-rendering` | project `.cursor/skills/` | cdda3ea9 (+ WebKit checks in 3807713d, c2d5a467) | 2x3x3=18 | demoScale polyfill, SVG->WebP rasterization, DOM text overlays, clip-path over alpha video |
| 4 | `figma-token-sync` | project `.cursor/skills/` | e933d5f4, 89fd1a6f, 8dee5dda | 3x2x3=18 | Route every style change through tokens.css/typography.css; re-sync via `get_variable_defs` on the design-system file when values drift |
| 5 | `mobile-demo-crop-scale` | project `.cursor/skills/` | cdda3ea9, c2d5a467 | 2x3x2=12 | designWidth crop math: slice width + translateX offset + aspect-ratio, all keyed off `--demo-scale` |
| 6 | `ios-safari-form-fixes` | personal `~/.cursor/skills/` | cdda3ea9 | 1x3x3=9 | visualViewport lift, custom placeholder span, fixed chip width, webkit credential-button pseudo-elements |

## Deferred candidates (revisit when they recur)

| Candidate | Supporting chats | Why deferred |
|-----------|------------------|--------------|
| `hero-variant-conventions` (isolated variant components, /compare routes, rotation shell) | 8dee5dda, 9866ac6e, 0f6cb296 | Hero system is largely finished; medium stability |
| `vercel-deploy-failure-triage` (prod asset-hash diff vs local build, GitHub deployments API) | 2a07158e | Seen once; generic parts covered by Vercel plugin skills |
| `matterjs-snap-on-settle` (freeze position/angle once at rest to kill jitter) | 0f6cb296 | One occurrence; pattern is captured in PhysicsTileStack.tsx itself |
| `figma-mcp-connect-troubleshoot` | 690ae2a9, a8fd8cde, b51c485e | One-time setup problem, now solved |
| `token-driven-cursor-affordance-labels` | 89fd1a6f | Single feature build, not a repeatable workflow |

## Not skills (already covered or too generic)

- Commit/push and PR flows — existing user rules.
- Dev server runs, repo scaffolding, npm installs — generic.
- Figma design-to-code mechanics — covered by the built-in Figma plugin skills; project skills above only add portfolio-specific conventions on top.

## Pipeline notes

- `skills-mining/build-index.mjs` regenerates `index.json` from all local parent transcripts (deduped by chat UUID).
- No `~/cursor-exports/` folder existed at mining time; when older chats are exported, drop them there, normalize to one file per chat, and run the same card extraction with the schema used in `skills-mining/cards/`.
