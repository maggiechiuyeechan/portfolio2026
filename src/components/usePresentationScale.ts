import { useLayoutEffect, useRef } from "react";

/** Keep all slide layout in design pixels; scale the entire canvas and controls. */
export default function usePresentationScale() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const styles = getComputedStyle(host);
    const token = (name: string) => parseFloat(styles.getPropertyValue(name));
    const width = token("--presentation-canvas-width");
    const height = token("--presentation-canvas-height");
    const minimum = Math.min(
      token("--presentation-min-viewport-width") / width,
      token("--presentation-min-viewport-height") / height,
    );
    const resize = () => {
      const scale = Math.max(minimum, Math.min(1, host.clientWidth / width, host.clientHeight / height));
      host.style.setProperty("--presentation-scale", String(scale));
      host.style.setProperty("--presentation-canvas-visibility", "visible");
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return ref;
}
