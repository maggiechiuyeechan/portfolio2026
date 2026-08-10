---
name: figma-token-sync
description: Keep the portfolio's CSS design tokens in sync with the Figma design system and route all styling through them. Use when changing colors, typography, spacing, radii, borders, or shadows anywhere in the site, or when a token value looks wrong and needs re-syncing from Figma.
---

# Design token conventions and Figma sync

All styling in this repo routes through design tokens. The source of truth is the Figma file "2026 Design Portfolio Design System" (`fileKey: n6CcU7VyQjOQA8qDXV7Kcn`; variables/tokens live around node `3:60`).

## Rules

1. **Never hardcode style values in components.** Colors, shadows, radii, spacing, and type styles come from CSS custom properties in `src/styles/tokens.css` (variable names mirror the Figma collections 1:1) and `src/styles/typography.css` (semantic text styles).
2. **Change the token, not the instance.** When the user asks to tweak how something looks, find which token the element uses and decide with them whether to adjust the token globally or point the element at a different existing token. Only add a new token if no existing one fits.
3. **When a value "looks wrong", re-sync from Figma.** Pull current values with the Figma MCP `get_variable_defs` on the design-system file (node `3:60` for the token collections) and update `tokens.css` to match — do not guess or eyeball corrections. Box shadows (elevation and elevation-border tokens) have drifted before; multi-layer shadow values must be copied exactly. Note: components consume shadows through `--shadow-elevation-border-*` aliases defined in `src/styles/global.css`, which point at the `--elevation-border-*` tokens — update the token, and check the alias layer when tracing a consumer.
4. **Preserve the naming scheme.** Primitive scales (`--color-gray-1..12`) feed semantic tokens (`--color-background-*`, `--color-typography-*`, `--color-border-*`). New tokens follow the same primitive → semantic layering and mirror the Figma variable name.
5. **Verify visually after token edits.** A token change fans out site-wide; screenshot the affected components (see `playwright-visual-probes`) rather than assuming the one requested spot was the only consumer.

## Example

User: "the elevation border shadows look off — here's the Figma reference."
Correct response: call `get_variable_defs` on `n6CcU7VyQjOQA8qDXV7Kcn` node `3:60`, diff against the elevation tokens in `src/styles/tokens.css`, replace the drifted values verbatim, then confirm on an element that uses each changed token.
