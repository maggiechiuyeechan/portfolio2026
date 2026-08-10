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

/** Scroll so a study title sits on the nav alignment line (see getStudyScrollAlignTop). */
export function scrollToStudyAnchor(
  anchorId: string,
  options?: { behavior?: ScrollBehavior; updateHash?: boolean },
) {
  const target = document.getElementById(anchorId);
  if (!target) return;

  const behavior =
    options?.behavior ??
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const top =
    window.scrollY + target.getBoundingClientRect().top - getStudyScrollAlignTop();

  window.scrollTo({ top: Math.max(0, top), behavior });

  if (options?.updateHash !== false) {
    history.replaceState(null, "", `#${anchorId}`);
  }
}
