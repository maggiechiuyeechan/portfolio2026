/**
 * Version O — halftone WebGL ripple over the meadow grass video.
 * Full-canvas like editable blobs so copy sits at the same vertical position;
 * the avatar is fixed above the name, out of document flow.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import HeroAvatarHalftone from "../../auth/HeroAvatarHalftone";
import type { HeroSceneProps } from "../../../config/heroVariants";

const SRC = "/images/meadow.mp4";
const POSTER = "/images/meadow-poster.webp";
const ALT = "Golden-green meadow grass swaying in slow motion";
/** Matches hero-content gap (--spacing-5). */
const NAME_GAP_PX = 24;

export default function MeadowScene({ obstacleRefs, variants }: HeroSceneProps) {
  const nameRef = obstacleRefs?.[0];
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !nameRef) return;

    const measure = () => {
      const el = nameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      setAnchor({
        x: rect.left + rect.width / 2,
        y: rect.top - NAME_GAP_PX,
      });
    };

    measure();
    const boot = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(measure);
    });
    window.addEventListener("resize", measure);
    const sync = window.setInterval(measure, 200);

    return () => {
      cancelAnimationFrame(boot);
      window.removeEventListener("resize", measure);
      window.clearInterval(sync);
    };
  }, [mounted, nameRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="hero-meadow-scene"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "fixed",
          left: anchor?.x ?? "50%",
          top: anchor?.y ?? "50%",
          transform: "translate(-50%, -100%)",
          visibility: anchor ? "visible" : "hidden",
        }}
      >
        <HeroAvatarHalftone src={SRC} alt={ALT} poster={POSTER} variants={variants} />
      </div>
    </div>,
    document.body,
  );
}
