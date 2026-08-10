/**
 * Fire when an element may have moved without resizing — ancestor CSS
 * transforms (password viewport lift), visualViewport chrome, or the body
 * flag that drives those transforms.
 *
 * ResizeObserver alone misses this: translating `.hero-inner` moves the name
 * in viewport space without changing any observed box size, so portaled scenes
 * that perch on the name (monsters, meadow) stay put and overlap the copy.
 */
export function observeLayoutDrift(onChange: () => void): () => void {
  const vv = window.visualViewport;
  vv?.addEventListener("resize", onChange);
  vv?.addEventListener("scroll", onChange);

  let rafLoop = 0;
  const stopLiftLoop = () => {
    cancelAnimationFrame(rafLoop);
    rafLoop = 0;
  };
  const startLiftLoop = () => {
    stopLiftLoop();
    const tick = () => {
      onChange();
      if (document.body.hasAttribute("data-password-focused")) {
        rafLoop = requestAnimationFrame(tick);
      } else {
        rafLoop = 0;
      }
    };
    rafLoop = requestAnimationFrame(tick);
  };

  if (document.body.hasAttribute("data-password-focused")) startLiftLoop();

  const mo = new MutationObserver(() => {
    if (document.body.hasAttribute("data-password-focused")) startLiftLoop();
    else {
      stopLiftLoop();
      onChange();
    }
  });
  mo.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-password-focused"],
  });

  return () => {
    stopLiftLoop();
    mo.disconnect();
    vv?.removeEventListener("resize", onChange);
    vv?.removeEventListener("scroll", onChange);
  };
}
