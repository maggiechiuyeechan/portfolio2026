/**
 * Fixed inset frame for framed hero variants (B, C, I, F, L, N).
 * Sits above the scene and noise, below the copy.
 *
 * Body `data-hero-scene-frame` is owned by HeroShell so early backdrops can
 * clip in the same paint as the shell, before this portal mounts.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function HeroSceneFrame() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="hero-scene-frame" aria-hidden="true">
      <div className="hero-scene-frame__mat" />
      <div className="hero-scene-frame__border" />
    </div>,
    document.body,
  );
}
