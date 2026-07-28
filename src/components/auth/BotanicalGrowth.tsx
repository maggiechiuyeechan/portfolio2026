/**
 * Version M — the botanical illustration (Figma node 354:79447) sits behind the
 * centred hero text, its two columns framing the copy.
 *
 * Every mark is drawn on one canvas in the Figma viewBox: the mauve / pink /
 * orange skeleton paints immediately, then the green fill circles stipple in
 * over 25 seconds (at most 3 fading in at once). Click the background while
 * stippling to finish instantly; click again after it completes to restart.
 * The full frame is centred on the page (object-fit: contain).
 *
 * Desktop only — narrow viewports skip the layer entirely.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../lib/motion";
import { playHeroSoundOnClick } from "../../lib/heroSounds";
import {
  BOTANICAL_CIRCLES,
  BOTANICAL_STATIC,
  BOTANICAL_VIEWBOX,
} from "./botanicalCircles";

const DRAW_DURATION_MS = 25_000;
/** How long one dot takes to reach full strength. */
const DOT_FADE_MS = 40;
/** Cap concurrent fades so the stipple stays light; overflow snaps in. */
const MAX_FADING = 3;
/** Match the compare-nav breakpoint that hides Version M. */
const DESKTOP_MIN_WIDTH = 768;
const TAU = Math.PI * 2;

interface Dots {
  x: Float32Array;
  y: Float32Array;
  r: Float32Array;
  colorIndex: Uint8Array;
  palette: string[];
}

interface StaticPath {
  color: string;
  path: Path2D;
}

/** Unpacks the per-colour runs into flat arrays the draw loop can index directly. */
function flattenCircles(): Dots {
  let total = 0;
  for (const group of BOTANICAL_CIRCLES) total += group.points.length / 2;

  const dots: Dots = {
    x: new Float32Array(total),
    y: new Float32Array(total),
    r: new Float32Array(total),
    colorIndex: new Uint8Array(total),
    palette: BOTANICAL_CIRCLES.map((group) => group.color),
  };

  let i = 0;
  BOTANICAL_CIRCLES.forEach((group, index) => {
    for (let p = 0; p < group.points.length; p += 2) {
      dots.x[i] = group.points[p]!;
      dots.y[i] = group.points[p + 1]!;
      dots.r[i] = group.radius;
      dots.colorIndex[i] = index;
      i++;
    }
  });

  return dots;
}

function buildStaticPaths(): StaticPath[] {
  const out: StaticPath[] = [];
  for (const group of BOTANICAL_STATIC.paths) {
    for (const d of group.paths) {
      out.push({ color: group.color, path: new Path2D(d) });
    }
  }
  return out;
}

function shuffledOrder(length: number) {
  const order = new Uint16Array(length);
  for (let i = 0; i < length; i++) order[i] = i;
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = order[i]!;
    order[i] = order[j]!;
    order[j] = swap;
  }
  return order;
}

function isDesktop() {
  return window.innerWidth >= DESKTOP_MIN_WIDTH;
}

function isInteractiveTarget(target: Element | null) {
  if (!target) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, label, nav, [role='button'], .compare-switch",
    ),
  );
}

export default function BotanicalGrowth() {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    setMounted(true);
    const sync = () => setDesktop(isDesktop());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (!mounted || !desktop) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dots = flattenCircles();
    const total = dots.x.length;
    const staticPaths = buildStaticPaths();
    const { width, height } = BOTANICAL_VIEWBOX;

    let order = shuffledOrder(total);
    let revealed = 0;
    let fading: { index: number; opacity: number }[] = [];
    let frameId = 0;
    let resizeTimer = 0;
    let animating = false;
    let complete = false;
    let animStart = 0;
    let last = 0;

    const paintDot = (index: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = dots.palette[dots.colorIndex[index]!]!;
      ctx.beginPath();
      ctx.arc(dots.x[index]!, dots.y[index]!, dots.r[index]!, 0, TAU);
      ctx.fill();
    };

    const paintSkeleton = () => {
      ctx.globalAlpha = 1;

      for (const group of BOTANICAL_STATIC.circles) {
        ctx.fillStyle = group.color;
        for (let p = 0; p < group.points.length; p += 2) {
          ctx.beginPath();
          ctx.arc(group.points[p]!, group.points[p + 1]!, group.radius, 0, TAU);
          ctx.fill();
        }
      }

      for (const group of BOTANICAL_STATIC.rects) {
        ctx.fillStyle = group.color;
        for (let p = 0; p < group.points.length; p += 2) {
          ctx.fillRect(group.points[p]!, group.points[p + 1]!, group.w, group.h);
        }
      }

      for (const mark of staticPaths) {
        ctx.fillStyle = mark.color;
        ctx.fill(mark.path);
      }
    };

    const repaint = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      paintSkeleton();
      for (let k = 0; k < revealed; k++) paintDot(order[k]!, 1);
      ctx.globalAlpha = 1;
      fading = [];
    };

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Fit the full Figma frame inside the viewport and centre it — same as
      // object-fit: contain. The art is already recentred in the frame.
      const scale = Math.min(vw / width, vh / height);
      const frameW = Math.round(width * scale);
      const frameH = Math.round(height * scale);
      const offsetX = Math.round((vw - frameW) / 2);
      const offsetY = Math.round((vh - frameH) / 2);

      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);

      repaint();
    };

    const finishNow = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      fading = [];
      revealed = total;
      animating = false;
      complete = true;
      repaint();
    };

    const frame = (now: number) => {
      const delta = now - last;
      last = now;

      const target = Math.min(
        total,
        Math.floor(((now - animStart) / DRAW_DURATION_MS) * total),
      );

      while (revealed < target) {
        if (fading.length < MAX_FADING) {
          fading.push({ index: order[revealed]!, opacity: 0 });
          revealed += 1;
        } else {
          // Behind schedule (tab background, etc.) — snap the rest of this tick.
          while (revealed < target) {
            paintDot(order[revealed]!, 1);
            revealed += 1;
          }
          break;
        }
      }

      if (fading.length > 0) {
        const step = delta / DOT_FADE_MS;
        fading = fading.filter((dot) => {
          const next = Math.min(1, dot.opacity + step);
          const alpha = next >= 1 ? 1 : (next - dot.opacity) / (1 - dot.opacity);
          paintDot(dot.index, alpha);
          dot.opacity = next;
          return next < 1;
        });
      }

      ctx.globalAlpha = 1;

      if (revealed < total || fading.length > 0) {
        frameId = requestAnimationFrame(frame);
      } else {
        frameId = 0;
        animating = false;
        complete = true;
      }
    };

    const startAnim = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      order = shuffledOrder(total);
      revealed = 0;
      fading = [];
      animating = true;
      complete = false;
      animStart = performance.now();
      last = animStart;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      paintSkeleton();

      frameId = requestAnimationFrame(frame);
    };

    resize();

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "pointer";

    if (reducedMotion) {
      revealed = total;
      complete = true;
      animating = false;
      repaint();
    } else {
      startAnim();
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveTarget(event.target as Element | null)) return;
      if (reducedMotion) return;

      if (animating) {
        playHeroSoundOnClick("ready", "botanical-finish");
        finishNow();
      } else if (complete) {
        playHeroSoundOnClick("bloom", "botanical-restart");
        startAnim();
      }
    };
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown);
      document.body.style.cursor = previousCursor;
    };
  }, [reducedMotion, mounted, desktop]);

  if (!mounted || !desktop) return null;

  return createPortal(
    <div
      className="botanical-growth"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        className="botanical-growth__dots"
        style={{ position: "absolute", inset: 0, display: "block" }}
      />
    </div>,
    document.body,
  );
}
