/**
 * Shared 28px light-grey grid surface (Versions I & L).
 * Fill + lines match GridSprinkle — lines sit under scene content and use the
 * shared text-fade mask (`.grid-sprinkle__grid-lines` in hero.css).
 */
export const HERO_GRID_CELL = 28;

const fillStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundColor: "var(--color-gray-1)",
};

const linesStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  mixBlendMode: "multiply",
  backgroundImage: `
    linear-gradient(#f7f7f7 1px, transparent 1px),
    linear-gradient(90deg, #f7f7f7 1px, transparent 1px)
  `,
  backgroundSize: `${HERO_GRID_CELL}px ${HERO_GRID_CELL}px`,
};

/** Gray fill + masked grid lines for sprinkles / collage scenes. */
export default function HeroGridSurface() {
  return (
    <>
      <div className="grid-sprinkle__grid" aria-hidden="true" style={fillStyle} />
      <div className="grid-sprinkle__grid-lines" aria-hidden="true" style={linesStyle} />
    </>
  );
}
