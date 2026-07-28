/**
 * Fixed 28px light-grey grid backdrop (Version I look), reused by F / L / N.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const HERO_GRID_CELL = 28;

interface Props {
  /** Stacking order — keep below interactive shape layers. */
  zIndex?: number;
}

export default function HeroGridBackdrop({ zIndex = 0 }: Props) {
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
        backgroundColor: "var(--color-background-main)",
        backgroundImage: `
          linear-gradient(var(--color-border-low-contrast) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-border-low-contrast) 1px, transparent 1px)
        `,
        backgroundSize: `${HERO_GRID_CELL}px ${HERO_GRID_CELL}px`,
      }}
    />,
    document.body,
  );
}
