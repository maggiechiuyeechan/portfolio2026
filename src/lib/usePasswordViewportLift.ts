import { useEffect, type RefObject } from "react";
import { acquireBodyFlag } from "./bodyFlag";

const MOBILE_QUERY = "(max-width: 41.25rem), (max-height: 40.625rem)";

/** Lift before visualViewport reports keyboard chrome — clears iOS 26's floating URL pill. */
const DEFAULT_LIFT_PX = 96;
/** Space to leave between the chip and the bottom of the visual viewport. */
const CHROME_CLEARANCE_PX = 80;

/**
 * On mobile Safari the login page is not scrollable and the password chip sits on
 * the bottom edge. When the field focuses, the keyboard and floating URL bar
 * overlay the chip instead of pushing it up — scroll-margin cannot help because
 * there is nowhere to scroll. Lift the hero copy with a visualViewport-driven
 * offset while the field is focused.
 */
export function usePasswordViewportLift(
  focused: boolean,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    if (!focused) return;
    if (typeof window === "undefined" || !window.matchMedia(MOBILE_QUERY).matches) return;

    const releaseFlag = acquireBodyFlag("passwordFocused");
    const root = document.documentElement;

    const sync = () => {
      const input = inputRef.current;
      const vv = window.visualViewport;
      if (!input || !vv) {
        root.style.setProperty("--password-lift", `${DEFAULT_LIFT_PX}px`);
        return;
      }

      const rect = input.getBoundingClientRect();
      const vvBottom = vv.offsetTop + vv.height;
      const overlap = rect.bottom + CHROME_CLEARANCE_PX - vvBottom;
      const lift = Math.max(DEFAULT_LIFT_PX, Math.ceil(overlap));
      root.style.setProperty("--password-lift", `${lift}px`);
    };

    sync();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    const raf = requestAnimationFrame(sync);
    const t1 = window.setTimeout(sync, 120);
    const t2 = window.setTimeout(sync, 320);

    return () => {
      releaseFlag();
      root.style.removeProperty("--password-lift");
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [focused, inputRef]);
}
