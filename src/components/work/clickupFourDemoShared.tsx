/**
 * Shared contract for the four ClickUp 4.0 carousel demos.
 *
 * - `active`: this slide is the currently selected tab. A demo should run its
 *   ~6s sequence only while `active && !paused`, and restart the sequence from
 *   the beginning whenever `active` flips from false to true.
 * - `paused`: the carousel is offscreen. Freeze timers/RAF.
 * - `reducedMotion`: user prefers reduced motion. Render the completed static
 *   state; no shimmer/typing/drag/shake.
 */
export interface ClickUpFourDemoProps {
  active: boolean;
  paused: boolean;
  reducedMotion: boolean;
}

const SIZES = "(max-width: 660px) calc(100vw - 32px), (max-width: 1000px) calc(100vw - 48px), 960px";

function sourceSet(file: string, format: "avif" | "webp") {
  return [480, 960, 1920, 2613]
    .map((width) => `/images/casestudies/${file}-${width}.${format} ${width}w`)
    .join(", ");
}

/**
 * Temporary placeholder used by the stub demos: renders the pre-existing
 * static export for the slide so the site keeps working until each animated
 * rebuild lands. Phase-2 demos replace this with Figma-accurate DOM inside
 * the 871x530 `.cu4-demo-frame`.
 */
export function ClickUpFourStaticPlaceholder({ file, alt, active }: { file: string; alt: string; active: boolean }) {
  return (
    <picture className="cu4-demo-placeholder">
      <source type="image/avif" srcSet={sourceSet(file, "avif")} sizes={SIZES} />
      <source type="image/webp" srcSet={sourceSet(file, "webp")} sizes={SIZES} />
      <img
        src={`/images/casestudies/${file}.png`}
        width="2613"
        height="1590"
        loading="eager"
        decoding="async"
        alt={active ? alt : ""}
      />
    </picture>
  );
}
