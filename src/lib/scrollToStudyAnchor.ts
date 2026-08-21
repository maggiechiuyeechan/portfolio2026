/**
 * Prefer the visible nav logo. Both mobile and desktop render a `.nav-logo`;
 * the hidden one reports a zero rect, which would make scroll offset 0 and
 * send titles flush past the header.
 */
export function getVisibleNavLogo() {
  const logos = document.querySelectorAll<HTMLElement>(".nav-logo");
  for (const logo of logos) {
    const { width, height, top } = logo.getBoundingClientRect();
    if (width > 0 && height > 0) return { logo, top };
  }
  return null;
}

/** Extra air between the sticky chrome and the study title after a nav jump. */
function studyScrollGapPx() {
  const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(rootSize) ? rootSize : 16; // 1rem
}

/**
 * Live Y of the work-page scroll alignment line.
 *
 * Desktop: sticky sidebar — align study titles with the logo top.
 * Mobile: sticky header bar covers everything below the logo, so align to the
 * bar's bottom (matches `--scroll-anchor-top`). Using logo top here scrolled
 * titles up under the opaque bar.
 *
 * Always leave 1rem under that line so the title isn't flush against the nav.
 */
export function getStudyScrollAlignTop() {
  const gap = studyScrollGapPx();
  const mobileBar = document.querySelector<HTMLElement>(".mobile-nav-bar");
  if (mobileBar) {
    const { width, height, bottom } = mobileBar.getBoundingClientRect();
    // Hidden desktop twin (parent `display: none`) reports a zero box.
    if (width > 0 && height > 0) return bottom + gap;
  }
  return (getVisibleNavLogo()?.top ?? 48) + gap;
}

function alignedTop(target: HTMLElement) {
  return Math.max(
    0,
    window.scrollY + target.getBoundingClientRect().top - getStudyScrollAlignTop(),
  );
}

let settle: { stop: () => void } | null = null;

/**
 * Scroll so a study title sits on the nav alignment line.
 *
 * Demos below the fold (client:visible, --demo-scale) grow after we measure,
 * which used to leave the target hundreds of pixels short — Growth sat at the
 * bottom of the viewport after a click because ClickUp AI hadn't sized yet.
 * A short ResizeObserver on `.study` re-pins the target as that layout lands.
 * User input or 2s of quiet ends the watch so we don't steal the scroll.
 */
export function scrollToStudyAnchor(
  anchorId: string,
  options?: { behavior?: ScrollBehavior; updateHash?: boolean },
) {
  const target = document.getElementById(anchorId);
  if (!target) return;

  const behavior =
    options?.behavior ??
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  settle?.stop();
  window.scrollTo({ top: alignedTop(target), behavior });

  let stopped = false;
  const pin = () => {
    const top = alignedTop(target);
    if (Math.abs(window.scrollY - top) > 2) {
      window.scrollTo({ top, behavior: "auto" });
    }
  };
  const observer = new ResizeObserver(pin);
  document.querySelectorAll<HTMLElement>(".study").forEach((el) => observer.observe(el));

  const stop = () => {
    if (stopped) return;
    stopped = true;
    observer.disconnect();
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", onKey);
    window.clearTimeout(timer);
    if (settle?.stop === stop) settle = null;
  };
  const onKey = (event: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      stop();
    }
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", onKey);
  const timer = window.setTimeout(stop, 2000);
  settle = { stop };

  if (options?.updateHash !== false) {
    history.replaceState(null, "", `#${anchorId}`);
  }
}
