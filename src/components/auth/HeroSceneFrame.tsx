/**
 * Fixed inset frame for framed hero variants (B, C, I, F, L, N).
 * Sits above the scene and noise, below the copy.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function HeroSceneFrame() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.dataset.heroSceneFrame = "";
    return () => {
      delete document.body.dataset.heroSceneFrame;
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="hero-scene-frame" aria-hidden="true">
      <div className="hero-scene-frame__mat" />
      <div className="hero-scene-frame__border" />
    </div>,
    document.body,
  );
}
