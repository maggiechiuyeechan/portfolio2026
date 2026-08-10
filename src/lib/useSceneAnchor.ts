import { useEffect, useState, type RefObject } from "react";
import { observeLayoutDrift } from "./observeLayoutDrift";

/**
 * Track a point just above an element, for scenes that perch art on the name.
 *
 * REPLACES a 200ms setInterval that ran for the life of the page. That loop
 * called getBoundingClientRect() (forced layout) and then setState with a
 * freshly allocated object every tick, so React re-rendered and re-committed
 * the portal five times a second forever — whether or not anything had moved.
 *
 * The poll existed because the anchor depends on more than the element's own
 * size: the copy above it reflows, and the display font swapping in shifts
 * the h1's box. Each of those is observable directly:
 *
 *   - ResizeObserver on the element AND its container (catches reflow of
 *     siblings, which moves the element without resizing it)
 *   - window resize
 *   - document.fonts.ready — the h1 uses a custom face, so first paint
 *     measures the fallback metrics and must be re-measured after swap
 *   - observeLayoutDrift — ancestor transforms (password lift) move the name
 *     in viewport space without resizing it; without this the portaled art
 *     stays put and overlaps the copy
 *
 * Net effect is also more accurate than the poll: the anchor now updates on
 * the frame the layout changes rather than up to 200ms later.
 */
export function useSceneAnchor(
  ref: RefObject<HTMLElement | null> | undefined,
  gap: number | (() => number),
): { x: number; y: number } | null {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!ref) return;

    const measure = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Element not laid out yet — keep the last good value rather than
      // snapping the art to 0,0.
      if (rect.width === 0 && rect.height === 0) return;

      const offset = typeof gap === "function" ? gap() : gap;
      const next = { x: rect.left + rect.width / 2, y: rect.top - offset };

      // Bail before setState when nothing moved. This is what stops the
      // render loop — the old code allocated a new object every tick, so
      // React could never bail out on its own.
      setAnchor((prev) =>
        prev && prev.x === next.x && prev.y === next.y ? prev : next,
      );
    };

    measure();

    // Two frames out: the first catches the initial commit, the second
    // catches layout settling after the entrance animation starts.
    const raf1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });

    const observer = new ResizeObserver(measure);
    const el = ref.current;
    if (el) {
      observer.observe(el);
      // The element can move without resizing when copy above it reflows,
      // so watch the container too.
      if (el.parentElement) observer.observe(el.parentElement);
    }

    window.addEventListener("resize", measure);
    const stopDrift = observeLayoutDrift(measure);

    // Custom display face — first measurement sees fallback metrics.
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      stopDrift();
    };
  }, [ref, gap]);

  return anchor;
}
