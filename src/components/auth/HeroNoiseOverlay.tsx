/**
 * Fixed film-grain overlay — small tiled PNG, above shapes / below hero text.
 * Overlay blend with enough contrast/opacity to read on light backgrounds.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const NOISE_TILE_SIZE = 128;

interface Props {
  /** Stacking order — above shape layers (z≈5), below hero content (z=10). */
  zIndex?: number;
}

export default function HeroNoiseOverlay({ zIndex = 6 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="hero-noise-overlay"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex,
        pointerEvents: "none",
        opacity: 0.22,
        mixBlendMode: "overlay",
        backgroundImage: "url(/images/noise-tile.png)",
        backgroundRepeat: "repeat",
        backgroundSize: `${NOISE_TILE_SIZE}px ${NOISE_TILE_SIZE}px`,
      }}
    />,
    document.body,
  );
}
