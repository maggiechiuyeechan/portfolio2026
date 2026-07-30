/**
 * Version O — halftone WebGL ripple over the meadow grass video.
 * Full-canvas like editable blobs so copy sits at the same vertical position.
 *
 * Default: avatar perches just above the name.
 * When hero.css bottom-anchors the copy (short height OR mobile width), the
 * avatar is centered in the empty band above the content instead.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import HeroAvatarHalftone from "../../auth/HeroAvatarHalftone";
import { useBandCenterAnchor } from "../../../lib/useBandCenterAnchor";
import { useSceneAnchor } from "../../../lib/useSceneAnchor";
import type { HeroSceneProps } from "../../../config/heroVariants";

const SRC = "/images/meadow.mp4";
const POSTER = "/images/meadow-poster.webp";
const ALT = "Golden-green meadow grass swaying in slow motion";
/** Matches hero-content gap / short-viewport band floor (--spacing-5). */
const NAME_GAP_PX = 24;
/**
 * Same conditions as hero.css bottom-anchoring the copy — that's when the
 * open band above the name appears. Height-only missed tall phones (e.g.
 * 390×844) that still bottom-anchor via max-width.
 */
const BAND_CENTER_QUERY = "(max-height: 40.625rem), (max-width: 41.25rem)";

function useBandCenterLayout() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(BAND_CENTER_QUERY);
    setActive(media.matches);
    const onChange = () => setActive(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return active;
}

export default function MeadowScene({ obstacleRefs, variants }: HeroSceneProps) {
  const nameRef = obstacleRefs?.[0];
  const artRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const bandCenter = useBandCenterLayout();
  const perchAnchor = useSceneAnchor(nameRef, NAME_GAP_PX);
  const bandAnchor = useBandCenterAnchor(nameRef, NAME_GAP_PX, artRef);
  const anchor = bandCenter ? bandAnchor : perchAnchor;

  useEffect(() => setMounted(true), []);

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
        ref={artRef}
        style={{
          position: "fixed",
          left: anchor?.x ?? "50%",
          top: anchor?.y ?? (bandCenter ? "35%" : "50%"),
          transform: bandCenter ? "translate(-50%, -50%)" : "translate(-50%, -100%)",
        }}
      >
        <HeroAvatarHalftone src={SRC} alt={ALT} poster={POSTER} variants={variants} />
      </div>
    </div>,
    document.body,
  );
}
