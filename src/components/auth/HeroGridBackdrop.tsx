/**
 * Fixed 28px light-grey grid backdrop (Version L).
 * Background fill and line overlay are split so lines can stack above multiply shapes.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const HERO_GRID_CELL = 28;

const gridLinesStyle: React.CSSProperties = {
  mixBlendMode: "multiply",
  backgroundImage: `
    linear-gradient(#f7f7f7 1px, transparent 1px),
    linear-gradient(90deg, #f7f7f7 1px, transparent 1px)
  `,
  backgroundSize: `${HERO_GRID_CELL}px ${HERO_GRID_CELL}px`,
};

interface BackdropProps {
  zIndex?: number;
}

/** Gray-1 fill behind the scene. */
export default function HeroGridBackdrop({ zIndex = 0 }: BackdropProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="hero-grid-backdrop"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "var(--color-gray-1)",
      }}
    />,
    document.body,
  );
}

interface LinesProps {
  /** Above multiply shapes (z-index 5); below noise (z-index 6). */
  zIndex?: number;
}

/** Grid lines in a separate layer — multiply over shapes below. */
export function HeroGridLines({ zIndex = 6 }: LinesProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="hero-grid-backdrop__lines"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex,
        pointerEvents: "none",
        overflow: "hidden",
        ...gridLinesStyle,
      }}
    />,
    document.body,
  );
}
