---
name: mobile-demo-crop-scale
description: Crop and rescale a fixed-size work demo on mobile so a chosen slice of the stage fills the frame — the designWidth + translateX + aspect-ratio pattern keyed off --demo-scale. Use when the user asks to scale demo content up on mobile, crop out part of a demo, zoom into a slice, or says a demo looks too small or its margins too large on phone widths.
---

# Mobile demo crop and scale

Demos render at a fixed design size and scale to their container via `--demo-scale` (set by `src/lib/demoScale.ts`). To show only a slice of the stage on mobile — zoomed to fill the frame — three values must change together. Reference implementation: `.cua-chat-scaler` in `src/components/work/ClickUpAIDemo.css` plus its `SCALERS` entry in `src/lib/demoScale.ts`.

## The pattern

Pick, in design-space pixels (the demo's own coordinate system):
- `W` — width of the visible slice (smaller W = more zoom)
- `X` — left offset where the slice starts
- `H` — height of the visible slice

Then make three coordinated edits:

1. **Frame aspect ratio** (mobile media query, typically `@media (max-width: 30rem)`):

```css
.demo-frame { aspect-ratio: W / H; }
```

2. **Scaler transform** — shift left by the offset, in scaled pixels, then scale:

```css
.demo-scaler {
  transform: translateX(calc(-Xpx * var(--demo-scale, 1))) scale(var(--demo-scale, 1));
  transform-origin: top left;
}
```

3. **`SCALERS` entry in `src/lib/demoScale.ts`** — the design width becomes the slice width on mobile, so the slice exactly fills the container:

```typescript
{
  selector: ".demo-scaler",
  designWidth: () => (window.matchMedia("(max-width: 30rem)").matches ? W : FULL_WIDTH),
},
```

The media query string in CSS and TS must match exactly, or the crop and the scale will disagree at the breakpoint. Two wiring caveats in `demoScale.ts`:

- The re-apply-on-breakpoint-flip logic (`refreshChatScalers`) is hardcoded to `.cua-chat-scaler`. A new entry with a media-query-dependent `designWidth` needs that refresh extended to its selector, or the scale will be stale after a viewport crosses the breakpoint.
- If the scaler element already carries other transforms at that breakpoint (e.g. `.cua-credits-scaler` has a mobile `translateY`), compose them into the same `transform` declaration — a second rule will overwrite, not add.

## Tuning

- "Scale up a bit more / crop out more of the left": decrease `W` and increase `X` together; keep the right edge (`X + W`) inside content you want visible. Update the `aspect-ratio` with the same `W`.
- Keep `overflow: hidden`, `border-radius`, and shadows on the unscaled frame element, never the scaled child (WebKit clips scaled radii incorrectly).
- Verify at 430px and at the breakpoint boundary with a WebKit screenshot probe (see `playwright-visual-probes`), since the slice math is easy to get off by a few pixels.
