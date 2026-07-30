/**
 * Immediate gray + grid fill for variants whose real backdrop lives in a
 * lazy scene chunk. On mobile the scene frame mat is hidden, so without this
 * the page stays blank until the chunk downloads.
 *
 * Must portal to document.body — HeroShell lives under `.hero-inner`, which
 * has a transform and z-index. Fixed descendants there become a full-viewport
 * sheet anchored to the content box and paint above portaled scenes, carving
 * white holes out of the grid.
 *
 * No mounted gate: client:load already runs in the browser, so body exists
 * on the first render.
 */
import { createPortal } from "react-dom";

/** Cell size matches HeroGridBackdrop / GridSprinkle (28px). */
const HERO_GRID_CELL = 28;

const fillStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100dvh",
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
  backgroundColor: "var(--color-gray-1)",
};

const linesStyle: React.CSSProperties = {
  ...fillStyle,
  zIndex: 1,
  backgroundColor: "transparent",
  mixBlendMode: "multiply",
  backgroundImage: `
    linear-gradient(#f7f7f7 1px, transparent 1px),
    linear-gradient(90deg, #f7f7f7 1px, transparent 1px)
  `,
  backgroundSize: `${HERO_GRID_CELL}px ${HERO_GRID_CELL}px`,
};

export default function HeroEarlyBackdrop() {
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="hero-early-backdrop" aria-hidden="true" style={fillStyle} />
      <div className="hero-early-backdrop" aria-hidden="true" style={linesStyle} />
    </>,
    document.body,
  );
}
