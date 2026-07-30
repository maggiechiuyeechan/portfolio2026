import { useEffect, useState, type RefObject } from "react";

/**
 * Center of the empty band above a content element (viewport top → content top).
 * Used by meadow so the video sits in the open space, not perched on the name.
 */
export function useBandCenterAnchor(
  contentRef: RefObject<HTMLElement | null> | undefined,
  /** Gap reserved between the band bottom and the content top. */
  gapPx: number,
  /** Optional art element — when known, clamp so it stays inside the band. */
  artRef?: RefObject<HTMLElement | null>,
): { x: number; y: number } | null {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!contentRef) return;

    const measure = () => {
      const el = contentRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const bandTop = 0;
      const bandBottom = Math.max(bandTop, rect.top - gapPx);
      let y = (bandTop + bandBottom) / 2;

      const art = artRef?.current;
      if (art) {
        const artH = art.getBoundingClientRect().height;
        if (artH > 0) {
          const half = artH / 2;
          const minY = bandTop + half;
          const maxY = bandBottom - half;
          if (minY <= maxY) {
            y = Math.min(maxY, Math.max(minY, y));
          } else {
            // Band shorter than art — keep the bottom of the art on the band floor.
            y = bandBottom - half;
          }
        }
      }

      const next = { x: rect.left + rect.width / 2, y };

      setAnchor((prev) =>
        prev && prev.x === next.x && prev.y === next.y ? prev : next,
      );
    };

    measure();

    const raf1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });

    const observer = new ResizeObserver(measure);
    const el = contentRef.current;
    if (el) {
      observer.observe(el);
      if (el.parentElement) observer.observe(el.parentElement);
    }
    if (artRef?.current) observer.observe(artRef.current);

    window.addEventListener("resize", measure);

    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [contentRef, gapPx, artRef]);

  return anchor;
}
