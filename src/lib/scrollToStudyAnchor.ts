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

/** Live Y of the sticky nav logo top — the work-page scroll alignment line. */
export function getStudyScrollAlignTop() {
  return getVisibleNavLogo()?.top ?? 48;
}

/** Scroll so a study title top aligns with the nav logo top. */
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
