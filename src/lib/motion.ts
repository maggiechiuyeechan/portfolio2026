import { useEffect, useRef, useState } from "react";

export const easeOut = [0.25, 0.1, 0.25, 1] as const;

/** Media queries that drive hero/layout responsive changes across versions. */
const HERO_BREAKPOINT_QUERIES = [
  "(max-width: 80rem)",
  "(max-width: 52rem)",
  "(max-width: 48rem)",
  "(max-width: 41.25rem)",
  "(max-height: 40.625rem)",
] as const;

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);

    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Increments when the viewport crosses a responsive breakpoint.
 * Use as a React `key` to remount and replay entrance animations.
 */
export function useBreakpointReplayKey(enabled = true) {
  const [replayKey, setReplayKey] = useState(0);
  const prevSig = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const mqls = HERO_BREAKPOINT_QUERIES.map((query) => window.matchMedia(query));
    const signature = () => mqls.map((mql) => (mql.matches ? "1" : "0")).join("");

    const onChange = () => {
      const next = signature();
      if (prevSig.current !== null && prevSig.current !== next) {
        setReplayKey((key) => key + 1);
      }
      prevSig.current = next;
    };

    onChange();
    mqls.forEach((mql) => mql.addEventListener("change", onChange));
    return () => mqls.forEach((mql) => mql.removeEventListener("change", onChange));
  }, [enabled]);

  return replayKey;
}
