/**
 * Version I — 28px grid + sprinkled multiply dots (1rem diameter, canvas).
 * Hover pops a dot into a radial burst of tiny circles; click empty background to resprinkle.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../lib/motion";
import { playHeroSound, playHeroSoundOnClick } from "../../lib/heroSounds";
import { acquireBodyFlag } from "../../lib/bodyFlag";
import { idleNudgeScale } from "../../lib/idleNudgeScale";
import { getSceneFrameBounds } from "../../lib/sceneFrame";
import { useIdleNudge } from "../../lib/useIdleNudge";
import {
  GRID_SPRINKLE_PALETTE_I,
  type GridSprinklePalette,
} from "./gridSprinklePalettes";
import HeroGridSurface, { HERO_GRID_CELL } from "./HeroGridBackdrop";

const GRID_CELL = HERO_GRID_CELL;
const LARGE_DESKTOP_MIN_WIDTH = 1920;
const MAX_DOTS = 140;
const LARGE_DESKTOP_MAX_DOTS = 200;
/** Dot diameter in rem (canvas draws in CSS px via root font-size). */
const DOT_DIAMETER_REM = 1;
const EXCLUSION_PAD = GRID_CELL * 2;
const OUTER_EXCLUSION_PAD = GRID_CELL * 4;
/** Per-dot ease-out duration when reshuffling. */
const SPRINKLE_IN_MS = 380;
/** Max random delay before a dot starts fading/scaling in. */
const SPRINKLE_STAGGER_MS = 160;
const SPRINKLE_FROM_SCALE = 0.35;
/** Grid sprinkle idle nudge — one dot pulses to 1.75× (other variants use 1.075×). */
const SPRINKLE_IDLE_NUDGE_SCALE = 1.75;
/**
 * Burst when a dot is erased — radial expand from the center, then each spark
 * shrinks to nothing (no opacity fade, no gravity).
 */
const BURST_MIN = 5;
const BURST_MAX = 8;
const BURST_LIFE_MIN_MS = 200;
const BURST_LIFE_MAX_MS = 300;
const BURST_DIST_MIN = 10;
const BURST_DIST_MAX = 15;
const SPARK_RADIUS_MIN = 1;
const SPARK_RADIUS_MAX = 1.5;
const TAU = Math.PI * 2;

function remPx(rem: number) {
  if (typeof document === "undefined") return rem * 16;
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return rem * (Number.isFinite(root) && root > 0 ? root : 16);
}

function dotDiameterPx() {
  return remPx(DOT_DIAMETER_REM);
}

function dotRadiusPx() {
  return dotDiameterPx() / 2;
}

function eraseRadiusPx() {
  return dotRadiusPx() * 1.2;
}

interface Dot {
  id: string;
  nx: number;
  ny: number;
  color: string;
  /** Stagger delay for sprinkle-in (ms from animation start). */
  enterDelay?: number;
}

interface Spark {
  ox: number;
  oy: number;
  angle: number;
  /** Max radial travel (px), eased out over the spark’s life. */
  dist: number;
  r: number;
  color: string;
  start: number;
  life: number;
}

interface ExclusionZone {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Props {
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
  dotColors?: GridSprinklePalette;
}

function isInteractiveTarget(target: Element | null) {
  if (!target) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, label, nav, [role='button'], .compare-switch",
    ),
  );
}

function dotCount(width: number, height: number) {
  const maxDots = width > LARGE_DESKTOP_MIN_WIDTH ? LARGE_DESKTOP_MAX_DOTS : MAX_DOTS;
  return Math.min(maxDots, Math.max(84, Math.round((width * height) / 14_000) + 52));
}

function measureExclusionZones(refs: React.RefObject<HTMLElement | null>[]): ExclusionZone[] {
  const zones: ExclusionZone[] = [];

  refs.forEach((ref, index) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const isOuterEdge = index === 0 || index === refs.length - 1;
    const padding = isOuterEdge ? OUTER_EXCLUSION_PAD : EXCLUSION_PAD;

    zones.push({
      left: rect.left - padding,
      top: rect.top - padding,
      right: rect.right + padding,
      bottom: rect.bottom + padding,
    });
  });

  return zones;
}

function dotInExclusion(x: number, y: number, zones: ExclusionZone[]) {
  return zones.some(
    (zone) => x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom,
  );
}

function cullDots(dots: Dot[], width: number, height: number, zones: ExclusionZone[]) {
  if (zones.length === 0) return dots;
  return dots.filter((dot) => !dotInExclusion(dot.nx * width, dot.ny * height, zones));
}

/** Dots inside the clipped scene frame — nudge targets outside the inset are invisible. */
function nudgeableDotIds(dots: Dot[], width: number, height: number) {
  if (dots.length === 0) return [];
  const frame = getSceneFrameBounds(width, height);
  const margin = dotRadiusPx() * SPRINKLE_IDLE_NUDGE_SCALE + 2;
  const visible = dots.filter((dot) => {
    const x = dot.nx * width;
    const y = dot.ny * height;
    return (
      x >= frame.left + margin &&
      x <= frame.right - margin &&
      y >= frame.top + margin &&
      y <= frame.bottom - margin
    );
  });
  return (visible.length > 0 ? visible : dots).map((dot) => dot.id);
}

function createDots(
  count: number,
  width: number,
  height: number,
  zones: ExclusionZone[],
  dotColors: GridSprinklePalette,
): Dot[] {
  const dots: Dot[] = [];
  const maxAttempts = count * 50;
  let attempts = 0;
  let nextId = 0;

  while (dots.length < count && attempts < maxAttempts) {
    attempts += 1;
    const diameter = dotDiameterPx();
    const radius = diameter / 2;
    const x = radius + Math.random() * Math.max(diameter, width - diameter);
    const y = radius + Math.random() * Math.max(diameter, height - diameter);
    if (dotInExclusion(x, y, zones)) continue;

    dots.push({
      id: `dot-${nextId++}`,
      nx: x / width,
      ny: y / height,
      color: dotColors[Math.floor(Math.random() * dotColors.length)]!,
    });
  }

  return dots;
}

function createBurst(
  ox: number,
  oy: number,
  colors: string[],
  now: number,
): Spark[] {
  const count = BURST_MIN + Math.floor(Math.random() * (BURST_MAX - BURST_MIN + 1));
  const sparks: Spark[] = [];
  const base = Math.random() * TAU;
  const palette = colors.length > 0 ? colors : ["#000000"];

  for (let i = 0; i < count; i++) {
    // Even radial spacing with a little jitter.
    const angle = base + (i / count) * TAU + (Math.random() - 0.5) * 0.18;
    sparks.push({
      ox,
      oy,
      angle,
      dist: BURST_DIST_MIN + Math.random() * (BURST_DIST_MAX - BURST_DIST_MIN),
      r: SPARK_RADIUS_MIN + Math.random() * (SPARK_RADIUS_MAX - SPARK_RADIUS_MIN),
      color: palette[Math.floor(Math.random() * palette.length)]!,
      start: now,
      life: BURST_LIFE_MIN_MS + Math.random() * (BURST_LIFE_MAX_MS - BURST_LIFE_MIN_MS),
    });
  }

  return sparks;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Stronger ease-out — more slowdown near the end of travel. */
function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

/** Slow start, then accelerates — good for shrinking away at the end of travel. */
function easeInCubic(t: number) {
  return t * t * t;
}

function paintScene(
  canvas: HTMLCanvasElement,
  dots: Dot[],
  sparks: Spark[],
  now: number,
  paintDot?: (dot: Dot, index: number) => { alpha: number; scale: number },
) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width <= 0 || height <= 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "multiply";

  const radius = dotRadiusPx();
  for (let index = 0; index < dots.length; index++) {
    const dot = dots[index]!;
    const { alpha, scale } = paintDot?.(dot, index) ?? { alpha: 1, scale: 1 };
    if (alpha <= 0.001) continue;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = dot.color;
    ctx.beginPath();
    ctx.arc(dot.nx * width, dot.ny * height, radius * scale, 0, TAU);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  for (const spark of sparks) {
    const elapsed = now - spark.start;
    const t = Math.min(1, Math.max(0, elapsed / spark.life));
    if (t >= 1) continue;
    // Travel: strong ease-out (slows near the end); size: hold, then collapse.
    const travel = spark.dist * easeOutQuint(t);
    const r = spark.r * (1 - easeInCubic(t));
    if (r <= 0.15) continue;
    const x = spark.ox + Math.cos(spark.angle) * travel;
    const y = spark.oy + Math.sin(spark.angle) * travel;
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
}

export default function GridSprinkle({
  obstacleRefs = [],
  dotColors = GRID_SPRINKLE_PALETTE_I,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [dotIds, setDotIds] = useState<string[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  const { nudgeId, nudgeStartMs, noteInteraction } = useIdleNudge(
    dotIds,
    mounted && dotIds.length > 0,
  );
  const noteInteractionRef = useRef(noteInteraction);
  noteInteractionRef.current = noteInteraction;
  const nudgeIdRef = useRef(nudgeId);
  const nudgeStartMsRef = useRef(nudgeStartMs);
  nudgeIdRef.current = nudgeId;
  nudgeStartMsRef.current = nudgeStartMs;
  const kickAnimRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const dotsPlacedRef = useRef(false);
  const viewportRef = useRef({ width: 0, height: 0 });
  const obstacleRefsRef = useRef(obstacleRefs);
  const dotColorsRef = useRef(dotColors);
  const animFrameRef = useRef<number | null>(null);
  const sprinkleInRef = useRef<{ start: number } | null>(null);
  const reducedMotionRef = useRef(reducedMotion);
  obstacleRefsRef.current = obstacleRefs;
  dotColorsRef.current = dotColors;
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (nudgeId) kickAnimRef.current?.();
  }, [nudgeId, nudgeStartMs]);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const cancelAnim = () => {
      if (animFrameRef.current != null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    const paintDots = (now: number) => {
      const sprinkle = sprinkleInRef.current;
      const nudgeKey = nudgeIdRef.current;
      const nudgeStart = nudgeStartMsRef.current;
      const dots = dotsRef.current;

      return (dot: Dot, _index: number) => {
        if (sprinkle) {
          const t = Math.min(
            1,
            Math.max(0, (now - sprinkle.start - (dot.enterDelay ?? 0)) / SPRINKLE_IN_MS),
          );
          const e = easeOutCubic(t);
          return {
            alpha: e,
            scale: SPRINKLE_FROM_SCALE + (1 - SPRINKLE_FROM_SCALE) * e,
          };
        }
        let scale = 1;
        if (nudgeKey && dot.id === nudgeKey && nudgeStart > 0) {
          scale = idleNudgeScale(now, nudgeStart, SPRINKLE_IDLE_NUDGE_SCALE);
        }
        return { alpha: 1, scale };
      };
    };

    const paintFrame = (now: number) => {
      const dots = dotsRef.current;
      const sprinkle = sprinkleInRef.current;
      const nudgeKey = nudgeIdRef.current;

      paintScene(canvas, dots, sparksRef.current, now, paintDots(now));

      sparksRef.current = sparksRef.current.filter((spark) => now - spark.start < spark.life);

      const bursting = sparksRef.current.length > 0;
      const sprinkleDone =
        !sprinkle || now >= sprinkle.start + SPRINKLE_IN_MS + SPRINKLE_STAGGER_MS;
      const nudging = nudgeKey != null;

      if (sprinkleDone) sprinkleInRef.current = null;

      if (bursting || !sprinkleDone || nudging) {
        animFrameRef.current = requestAnimationFrame(paintFrame);
      } else {
        animFrameRef.current = null;
        paintScene(canvas, dotsRef.current, [], now, paintDots(now));
      }
    };

    const ensureAnim = () => {
      if (animFrameRef.current != null) return;
      animFrameRef.current = requestAnimationFrame(paintFrame);
    };
    kickAnimRef.current = ensureAnim;

    const animateSprinkleIn = () => {
      cancelAnim();
      sparksRef.current = [];
      const dots = dotsRef.current;
      if (dots.length === 0 || reducedMotionRef.current) {
        sprinkleInRef.current = null;
        paintScene(canvas, dots, [], performance.now(), paintDots(performance.now()));
        return;
      }

      for (const dot of dots) {
        dot.enterDelay = Math.random() * SPRINKLE_STAGGER_MS;
      }
      sprinkleInRef.current = { start: performance.now() };
      ensureAnim();
    };

    const syncDotIds = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDotIds(nudgeableDotIds(dotsRef.current, width, height));
    };

    const layout = (forceReseed = false) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const zones = measureExclusionZones(obstacleRefsRef.current);
      const sizeChanged =
        width !== viewportRef.current.width || height !== viewportRef.current.height;

      if (forceReseed || !dotsPlacedRef.current) {
        if (obstacleRefsRef.current.length > 0 && zones.length === 0) {
          cancelAnim();
          sprinkleInRef.current = null;
          sparksRef.current = [];
          paintScene(canvas, [], [], performance.now());
          return;
        }

        dotsRef.current = createDots(
          dotCount(width, height),
          width,
          height,
          zones,
          dotColorsRef.current,
        );
        sparksRef.current = [];
        dotsPlacedRef.current = true;
        viewportRef.current = { width, height };
        syncDotIds();
        if (forceReseed) {
          animateSprinkleIn();
          return;
        }
      } else if (sizeChanged) {
        cancelAnim();
        sprinkleInRef.current = null;
        sparksRef.current = [];
        dotsRef.current = createDots(
          dotCount(width, height),
          width,
          height,
          zones,
          dotColorsRef.current,
        );
        viewportRef.current = { width, height };
        syncDotIds();
      } else {
        // Don't interrupt a resprinkle entrance for exclusion sync.
        if (animFrameRef.current != null && sprinkleInRef.current) return;
        dotsRef.current = cullDots(dotsRef.current, width, height, zones);
        syncDotIds();
      }

      if (animFrameRef.current == null) {
        paintScene(
          canvas,
          dotsRef.current,
          sparksRef.current,
          performance.now(),
          paintDots(performance.now()),
        );
      }
    };

    layout();
    const syncTimer =
      obstacleRefs.length > 0 ? window.setInterval(() => layout(), 250) : undefined;
    const stopSync = window.setTimeout(() => {
      if (syncTimer) window.clearInterval(syncTimer);
    }, 2500);

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    // Scene is hover-interactive: flag <body> so hero.css can set the cursor,
    // leaving the password input and links to override it. (Was an inline
    // body.style.cursor write, which no element could opt out of.)
    const releaseCursor = acquireBodyFlag("heroInteractive");

    // Hover to burst a dot into tiny firework circles.
    const burstAt = (mx: number, my: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width <= 0 || height <= 0) return;

      const hitR = eraseRadiusPx();
      const hitR2 = hitR * hitR;
      const dots = dotsRef.current;

      let hitIndex = -1;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]!;
        const dx = dot.nx * width - mx;
        const dy = dot.ny * height - my;
        if (dx * dx + dy * dy <= hitR2) {
          hitIndex = i;
          break;
        }
      }
      if (hitIndex === -1) return;

      noteInteractionRef.current();

      const now = performance.now();
      const colorsOnCanvas = [...new Set(dots.map((dot) => dot.color))];
      const next: Dot[] = [];

      for (const dot of dots) {
        const dx = dot.nx * width - mx;
        const dy = dot.ny * height - my;
        if (dx * dx + dy * dy > hitR2) {
          next.push(dot);
          continue;
        }
        if (!reducedMotionRef.current) {
          sparksRef.current.push(
            ...createBurst(dot.nx * width, dot.ny * height, colorsOnCanvas, now),
          );
        }
      }

      playHeroSound("sparkle", "grid-burst");
      dotsRef.current = next;
      syncDotIds();
      ensureAnim();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (isInteractiveTarget(event.target as Element | null)) return;
      burstAt(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Click empty background (not nav / form / links) to re-roll the sprinkle.
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveTarget(event.target as Element | null)) return;
      noteInteractionRef.current();
      playHeroSoundOnClick("page", "grid-resprinkle");
      layout(true);
    };
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      kickAnimRef.current = null;
      cancelAnim();
      sprinkleInRef.current = null;
      sparksRef.current = [];
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      releaseCursor();
      if (syncTimer) window.clearInterval(syncTimer);
      window.clearTimeout(stopSync);
    };
  }, [mounted, obstacleRefs, dotColors]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="grid-sprinkle"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 5,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <HeroGridSurface />
      <canvas
        ref={canvasRef}
        className="grid-sprinkle__dots"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          mixBlendMode: "multiply",
        }}
      />
    </div>,
    document.body,
  );
}
