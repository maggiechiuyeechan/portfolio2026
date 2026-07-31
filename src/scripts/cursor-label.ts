/**
 * Global cursor-label controller.
 *
 * Native system cursor stays visible. A trailing label pill follows the
 * pointer whenever the active page sets copy via `updateCursorLabel()` (hero
 * variants do this from HeroShell).
 *
 * Behavior:
 * - Show when the page has label copy and the pointer is over non-controls
 * - Hide over links / buttons / inputs / textareas
 * - After Surprise me (`forceReveal`): stay visible even over controls until
 *   the user interacts with the scene (`dismissCursorLabel`)
 * - Hide while the pointer leaves the window / the window blurs; restore on return
 *
 * Visual styles: `src/styles/cursor-label.css`
 */
import { animate, type AnimationPlaybackControlsWithThen } from "motion";
import { easeOut } from "../lib/motion";

const INTERACTIVE_SELECTOR = "a, button, input, textarea, [role='button']";

const LERP_LABEL = 0.16;

const HIDDEN_SCALE = 0.88;
const CROSSFADE_S = 0.14;

const enterTransition = {
  opacity: { duration: 0.14, ease: easeOut },
  scale: { type: "spring", stiffness: 480, damping: 26, mass: 0.72 },
} as const;

const exitTransition = {
  opacity: { duration: 0.12, ease: easeOut },
  scale: { duration: 0.16, ease: easeOut },
} as const;

const FINE_POINTER_QUERY = "(pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Shared across bundles — React islands may import a separate module copy. */
const DISMISSED_ATTR = "data-cursor-label-dismissed";
const DISMISS_EVENT = "cursor-label:dismiss";

let pointerX = 0;
let pointerY = 0;
let labelX = 0;
let labelY = 0;

let rafId: number | null = null;
let scrollRafId: number | null = null;

let mounted = false;
let active = false;
let currentLabel: string | null = null;
let pageLabel: string | null = null;
let reducedMotion = false;

let rootEl: HTMLDivElement | null = null;
let pillEl: HTMLDivElement | null = null;
let pillVizEl: HTMLDivElement | null = null;
let textEl: HTMLSpanElement | null = null;

let animGen = 0;
let labelGen = 0;
let enterGen = 0;
let runningAnims: AnimationPlaybackControlsWithThen[] = [];

let fineMql: MediaQueryList | null = null;
let reducedMql: MediaQueryList | null = null;

let labelOffsetX = 12;
let labelOffsetY = 12;
/** After Surprise me — keep the label until the user interacts with the scene. */
let stayVisibleUntilDismiss = false;
let labelFontsReady: Promise<void> | null = null;

function whenLabelFontsReady() {
  if (labelFontsReady) return labelFontsReady;
  labelFontsReady = (async () => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    try {
      await document.fonts.load('400 0.625rem "Geist Mono"');
    } catch {
      // Preload failed — label may reflow once the face arrives.
    }
  })();
  return labelFontsReady;
}

function isDismissed() {
  return document.documentElement.hasAttribute(DISMISSED_ATTR);
}

function setDismissed(dismissed: boolean) {
  if (dismissed) document.documentElement.setAttribute(DISMISSED_ATTR, "");
  else document.documentElement.removeAttribute(DISMISSED_ATTR);
}

function syncDismissedFromDom() {
  return isDismissed();
}

function onDismissEvent() {
  syncDismissedFromDom();
  stayVisibleUntilDismiss = false;
  deactivate();
}

function prefersReducedMotion() {
  return reducedMql?.matches ?? false;
}

function labelLerp() {
  return reducedMotion ? 1 : LERP_LABEL;
}

function readMetrics() {
  if (!rootEl) return;
  const styles = getComputedStyle(rootEl);
  const ox = Number.parseFloat(styles.getPropertyValue("--cursor-label-offset-x"));
  const oy = Number.parseFloat(styles.getPropertyValue("--cursor-label-offset-y"));
  if (Number.isFinite(ox)) labelOffsetX = ox;
  if (Number.isFinite(oy)) labelOffsetY = oy;
}

function stopAnims() {
  for (const anim of runningAnims) anim.stop();
  runningAnims = [];
}

function trackAnim(anim: AnimationPlaybackControlsWithThen) {
  runningAnims.push(anim);
  void anim.finished.finally(() => {
    runningAnims = runningAnims.filter((item) => item !== anim);
  });
  return anim;
}

function awaitAnim(anim: AnimationPlaybackControlsWithThen) {
  return anim.finished.catch(() => undefined);
}

function writePillTransform() {
  if (!pillEl) return;
  pillEl.style.transform = `translate3d(${labelX + labelOffsetX}px, ${labelY + labelOffsetY}px, 0)`;
}

function startRaf() {
  if (rafId != null) return;
  const loop = () => {
    const t = labelLerp();
    labelX += (pointerX - labelX) * t;
    labelY += (pointerY - labelY) * t;
    writePillTransform();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}

function stopRaf() {
  if (rafId == null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
}

function snapToPointer() {
  labelX = pointerX;
  labelY = pointerY;
  writePillTransform();
}

function setVizHidden() {
  if (!pillVizEl) return;
  pillVizEl.style.opacity = "0";
  pillVizEl.style.transform = reducedMotion ? "none" : `scale(${HIDDEN_SCALE})`;
}

async function playEnter() {
  if (!pillVizEl) return;
  const gen = ++enterGen;
  stopAnims();
  setVizHidden();
  await whenLabelFontsReady();
  if (gen !== enterGen || !active || !pillVizEl) return;

  const to = reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 };
  trackAnim(
    animate(pillVizEl, to, reducedMotion ? { duration: 0.14, ease: easeOut } : enterTransition),
  );
}

async function playExit() {
  if (!pillVizEl) return;
  const gen = ++animGen;
  enterGen += 1;
  stopAnims();

  const to = reducedMotion ? { opacity: 0 } : { opacity: 0, scale: HIDDEN_SCALE };
  const pillAnim = trackAnim(
    animate(pillVizEl, to, reducedMotion ? { duration: 0.12, ease: easeOut } : exitTransition),
  );

  await awaitAnim(pillAnim);
  if (gen !== animGen || active) return;

  stopRaf();
  currentLabel = null;
  if (textEl) textEl.textContent = "";
  if (pillVizEl) pillVizEl.style.width = "";
}

async function crossfadeLabel(next: string) {
  if (!pillVizEl || !textEl) return;
  if (currentLabel === next) return;

  const gen = ++labelGen;
  pillVizEl.style.width = "auto";

  const fadeOut = trackAnim(
    animate(textEl, { opacity: 0 }, { duration: CROSSFADE_S / 2, ease: easeOut }),
  );

  await awaitAnim(fadeOut);
  if (gen !== labelGen) return;

  await whenLabelFontsReady();
  if (gen !== labelGen) return;

  textEl.textContent = next;
  currentLabel = next;

  trackAnim(
    animate(textEl, { opacity: 1 }, { duration: CROSSFADE_S / 2, ease: easeOut }),
  );
}

/**
 * Show the label. If already showing the same copy, leave it alone —
 * never replay enter on pointer move (that was causing random flash-outs).
 */
function activate(label: string) {
  if (!mounted || !rootEl?.isConnected || syncDismissedFromDom()) return;

  if (active) {
    if (label !== currentLabel) void crossfadeLabel(label);
    return;
  }

  active = true;
  animGen += 1;
  labelGen += 1;

  if (textEl) {
    textEl.textContent = label;
    textEl.style.opacity = "1";
  }
  currentLabel = label;
  if (pillVizEl) pillVizEl.style.width = "auto";

  snapToPointer();
  startRaf();
  void playEnter();
}

function deactivate() {
  if (!active) return;
  active = false;
  void playExit();
}

function isInteractive(el: Element | null) {
  return !!el?.closest(INTERACTIVE_SELECTOR);
}

function resolvePointerTarget(el: Element | null) {
  if (!mounted || !pageLabel || syncDismissedFromDom()) {
    deactivate();
    return;
  }

  // After Surprise me, stay visible until scene interaction dismisses.
  if (stayVisibleUntilDismiss) {
    activate(pageLabel);
    return;
  }

  if (!el || isInteractive(el)) {
    deactivate();
    return;
  }

  activate(pageLabel);
}

function onPointerMove(event: PointerEvent) {
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (syncDismissedFromDom()) {
    if (active) deactivate();
    return;
  }

  // Always re-resolve so moving onto/off links updates correctly.
  // While stayVisibleUntilDismiss, resolve keeps the label up without replaying enter.
  resolvePointerTarget(document.elementFromPoint(pointerX, pointerY));
}

function onPointerOver(event: PointerEvent) {
  const target = event.target;
  resolvePointerTarget(target instanceof Element ? target : null);
}

function onPointerLeaveDocument() {
  deactivate();
}

function onWindowBlur() {
  deactivate();
}

function onScroll() {
  if (scrollRafId != null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    resolvePointerTarget(document.elementFromPoint(pointerX, pointerY));
  });
}

function createElements() {
  rootEl = document.createElement("div");
  rootEl.className = "cursor-label-root";
  rootEl.setAttribute("aria-hidden", "true");

  pillEl = document.createElement("div");
  pillEl.className = "cursor-label-pill";
  pillVizEl = document.createElement("div");
  pillVizEl.className = "cursor-label-pill__viz";
  textEl = document.createElement("span");
  textEl.className = "cursor-label-pill__text text-caption";
  pillVizEl.appendChild(textEl);
  pillEl.appendChild(pillVizEl);

  rootEl.appendChild(pillEl);
  document.body.appendChild(rootEl);

  readMetrics();
  writePillTransform();
}

function bindListeners() {
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerover", onPointerOver, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeaveDocument);
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  window.addEventListener(DISMISS_EVENT, onDismissEvent);
}

function unbindListeners() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerover", onPointerOver);
  document.documentElement.removeEventListener("pointerleave", onPointerLeaveDocument);
  window.removeEventListener("blur", onWindowBlur);
  window.removeEventListener("scroll", onScroll, true);
  window.removeEventListener(DISMISS_EVENT, onDismissEvent);
}

function mount() {
  if (mounted || typeof document === "undefined") return;

  createElements();

  if (!rootEl?.isConnected || !pillEl?.isConnected) {
    teardownDom();
    return;
  }

  mounted = true;
  reducedMotion = prefersReducedMotion();
  bindListeners();
}

function teardownDom() {
  stopAnims();
  stopRaf();
  if (scrollRafId != null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
  rootEl?.remove();
  rootEl = null;
  pillEl = null;
  pillVizEl = null;
  textEl = null;
  active = false;
  currentLabel = null;
  mounted = false;
}

function teardown() {
  if (!mounted && !rootEl) return;
  unbindListeners();
  teardownDom();
}

function syncFinePointer() {
  if (fineMql?.matches) mount();
  else teardown();
}

function onReducedMotionChange() {
  reducedMotion = prefersReducedMotion();
  if (!active && pillVizEl) setVizHidden();
}

/** Hide the label for the rest of this hero visit (until the variant changes). */
export function dismissCursorLabel() {
  if (typeof document === "undefined") return;
  if (isDismissed()) return;
  stayVisibleUntilDismiss = false;
  setDismissed(true);
  window.dispatchEvent(new CustomEvent(DISMISS_EVENT));
}

/** Set the label copy for the current page (hero variants). Pass null to hide. */
export function updateCursorLabel(
  label: string | null,
  options?: { forceReveal?: boolean },
) {
  pageLabel = label?.trim() || null;
  setDismissed(false);
  if (!pageLabel) {
    stayVisibleUntilDismiss = false;
    deactivate();
    return;
  }

  if (options?.forceReveal) {
    stayVisibleUntilDismiss = true;
    if (!mounted) return;
    activate(pageLabel);
    return;
  }

  if (!mounted) return;
  resolvePointerTarget(document.elementFromPoint(pointerX, pointerY));
}

/**
 * Boot the controller once from the base layout.
 * No-ops on coarse pointers; re-mounts if a hybrid device gains a mouse.
 */
export function initCursorLabel() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  fineMql = window.matchMedia(FINE_POINTER_QUERY);
  reducedMql = window.matchMedia(REDUCED_MOTION_QUERY);
  reducedMotion = reducedMql.matches;

  fineMql.addEventListener("change", syncFinePointer);
  reducedMql.addEventListener("change", onReducedMotionChange);

  syncFinePointer();
}
