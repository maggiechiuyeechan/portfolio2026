/**
 * Version L — four collage shapes (Figma node 354:60407) scattered across the
 * viewport in multiply blend. Placement is randomised on mount and on click
 * (empty background). Hovering a mark fades that shape out and brings a new
 * one in (pixel-dissolve out / resolve in). Shapes keep clear of the hero text but
 * are nudged toward overlapping each other.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../lib/motion";
import { playHeroSound, playHeroSoundOnClick } from "../../lib/heroSounds";
import { acquireBodyFlag } from "../../lib/bodyFlag";
import { useIdleNudge } from "../../lib/useIdleNudge";
import HeroGridSurface from "./HeroGridBackdrop";
import { COLLAGE_INK_GRID, COLLAGE_SHAPES, type CollageShape } from "./collageShapes";

const SHAPE_COUNT = 4;

interface SizeBand {
  min: number;
  max: number;
}

/** Size ladder — large, medium, small (desktop). */
const SIZE_BAND_LADDER: SizeBand[] = [
  { min: 0.45, max: 0.55 },
  { min: 0.38, max: 0.45 },
  { min: 0.25, max: 0.31 },
];
/** Mobile: same three tiers with wider bands. */
const SIZE_BAND_LADDER_MOBILE: SizeBand[] = [
  { min: 0.75, max: 1 },
  { min: 0.55, max: 0.75 },
  { min: 0.25, max: 0.4 },
];
/**
 * Index into the three-entry size ladder above.
 *
 * Declared explicitly because `SIZE_TIER_ORDER as const` infers `0 | 1 | 2`,
 * and LivePlacement used to widen the same field to `number` — so rebuilding a
 * Selection from live placements (see the swap handler) failed to typecheck.
 * Naming the type once keeps both sides honest and keeps the narrowing useful.
 */
type SizeTierIndex = 0 | 1 | 2;

/** Always 2 large, 1 medium, 1 small — which shape is shuffled, not the mix. */
const SIZE_TIER_ORDER: readonly SizeTierIndex[] = [0, 0, 1, 2];
/** Single-column / mobile breakpoint (matches --single-column-break). */
const MOBILE_MAX_WIDTH_PX = 660;

function sizeBandsForViewport(vw: number) {
  return vw <= MOBILE_MAX_WIDTH_PX ? SIZE_BAND_LADDER_MOBILE : SIZE_BAND_LADDER;
}

/** Keeps tall shapes from towering over a short viewport. */
const MAX_HEIGHT_RATIO = 0.85;
/** How far a shape may hang off the edge of the viewport. */
const MAX_BLEED = 0.12;
/** Steps a shape may shrink toward the 25% floor when nothing fits at its chosen size. */
const SHRINK_STEPS = 6;
const SHRINK_FACTOR = 0.9;
/** Clearance around the hero text. */
const TEXT_PADDING = 24;
/** Ideal share of a shape's box covered by its neighbours. */
const TARGET_OVERLAP = 0.3;
const CANDIDATES_PER_SHAPE = 700;
/** Minimum share of the viewport covered by shape bounding boxes. */
const MIN_COVERAGE = 0.4;
/** How many full layouts to try before accepting the best coverage. */
const COVERAGE_ATTEMPTS = 28;
/** Coarse grid used to estimate union coverage without geometry libraries. */
const COVERAGE_COLS = 48;
const COVERAGE_ROWS = 36;
const DISSOLVE_MS = 300;
/** Don't re-swap the same slot until this long after a replacement starts. */
const SWAP_COOLDOWN_MS = 700;

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Placement {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

type Phase = "enter" | "idle" | "exit";

interface LivePlacement extends Placement {
  id: number;
  shape: CollageShape;
  tierIndex: SizeTierIndex;
  widthRatio: number;
  phase: Phase;
  enterDelayMs: number;
}

interface Props {
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
}

function isInteractiveTarget(target: Element | null) {
  if (!target) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, label, nav, [role='button'], .compare-switch",
    ),
  );
}

function measureTextZones(refs: React.RefObject<HTMLElement | null>[]): Rect[] {
  const zones: Rect[] = [];

  for (const ref of refs) {
    const element = ref.current;
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    zones.push({
      left: rect.left - TEXT_PADDING,
      top: rect.top - TEXT_PADDING,
      right: rect.right + TEXT_PADDING,
      bottom: rect.bottom + TEXT_PADDING,
    });
  }

  return zones;
}

function overlapArea(a: Rect, b: Rect) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
}

function popcount(n: number) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

/** Reused across candidates so the hot loop stays allocation-free. */
const hitRows = new Array<number>(COLLAGE_INK_GRID).fill(0);

/**
 * Number of inked grid cells that land on the text. Zero means the shape's marks
 * clear the text entirely, even if its bounding box does not.
 */
function inkCollision(
  shape: CollageShape,
  left: number,
  top: number,
  width: number,
  height: number,
  zones: Rect[],
) {
  let any = false;
  for (let r = 0; r < COLLAGE_INK_GRID; r++) hitRows[r] = 0;

  for (const zone of zones) {
    const overlapLeft = Math.max(left, zone.left);
    const overlapTop = Math.max(top, zone.top);
    const overlapRight = Math.min(left + width, zone.right);
    const overlapBottom = Math.min(top + height, zone.bottom);
    if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) continue;

    const c0 = Math.max(0, Math.floor(((overlapLeft - left) / width) * COLLAGE_INK_GRID));
    const c1 = Math.min(
      COLLAGE_INK_GRID - 1,
      Math.ceil(((overlapRight - left) / width) * COLLAGE_INK_GRID) - 1,
    );
    const r0 = Math.max(0, Math.floor(((overlapTop - top) / height) * COLLAGE_INK_GRID));
    const r1 = Math.min(
      COLLAGE_INK_GRID - 1,
      Math.ceil(((overlapBottom - top) / height) * COLLAGE_INK_GRID) - 1,
    );
    if (c1 < c0 || r1 < r0) continue;

    const columns = (((1 << (c1 - c0 + 1)) - 1) << c0) >>> 0;
    for (let r = r0; r <= r1; r++) {
      const hit = shape.ink[r]! & columns;
      if (hit) {
        hitRows[r] |= hit;
        any = true;
      }
    }
  }

  if (!any) return 0;
  let count = 0;
  for (let r = 0; r < COLLAGE_INK_GRID; r++) count += popcount(hitRows[r]!);
  return count;
}

/** True when the cursor sits on an inked cell of the shape (not empty padding). */
function inkHit(
  shape: CollageShape,
  left: number,
  top: number,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  if (x < left || x >= left + width || y < top || y >= top + height) return false;
  const c = Math.min(
    COLLAGE_INK_GRID - 1,
    Math.max(0, Math.floor(((x - left) / width) * COLLAGE_INK_GRID)),
  );
  const r = Math.min(
    COLLAGE_INK_GRID - 1,
    Math.max(0, Math.floor(((y - top) / height) * COLLAGE_INK_GRID)),
  );
  return (shape.ink[r]! & (1 << c)) !== 0;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickShapes(vw: number) {
  const tiers = sizeBandsForViewport(vw);
  const pool = [...COLLAGE_SHAPES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  return pool.slice(0, SHAPE_COUNT).map((shape, slotIndex) => {
    const tierIndex = SIZE_TIER_ORDER[slotIndex]!;
    const band = tiers[tierIndex]!;
    return {
      shape,
      band,
      tierIndex,
      widthRatio: randomBetween(band.min, band.max),
    };
  });
}

type Selection = ReturnType<typeof pickShapes>;

function placeOneShape(
  shape: CollageShape,
  widthRatio: number,
  vw: number,
  vh: number,
  zones: Rect[],
  placed: Placement[],
): Placement {
  const minWidth = 0.25 * vw;
  const widthCap = vw <= MOBILE_MAX_WIDTH_PX ? 1 : 0.45;
  const maxWidth = Math.min(widthCap * vw, MAX_HEIGHT_RATIO * vh * shape.aspect);
  const preferredWidth = Math.max(minWidth, Math.min(widthRatio * vw, maxWidth));

  let best: Placement | null = null;
  let fallback: Placement | null = null;
  let fallbackCollision = Infinity;

  for (let step = 0; step < SHRINK_STEPS && !best; step++) {
    const width = Math.max(minWidth, preferredWidth * SHRINK_FACTOR ** step);
    const height = width / shape.aspect;

    const minLeft = -MAX_BLEED * width;
    const maxLeft = vw - width + MAX_BLEED * width;
    const minTop = -MAX_BLEED * height;
    const maxTop = vh - height + MAX_BLEED * height;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < CANDIDATES_PER_SHAPE; attempt++) {
      const left = randomBetween(minLeft, maxLeft);
      const top = randomBetween(minTop, maxTop);
      const candidate: Placement = { src: shape.src, left, top, width, height };

      const collision = inkCollision(shape, left, top, width, height, zones);
      if (collision > 0) {
        if (collision < fallbackCollision) {
          fallbackCollision = collision;
          fallback = candidate;
        }
        continue;
      }

      let score: number;
      if (placed.length === 0) {
        score = Math.random();
      } else if (placed.length === 1) {
        const rect: Rect = { left, top, right: left + width, bottom: top + height };
        const other = placed[0]!;
        const otherRect: Rect = {
          left: other.left,
          top: other.top,
          right: other.left + other.width,
          bottom: other.top + other.height,
        };
        const ratio =
          overlapArea(rect, otherRect) / Math.min(width * height, other.width * other.height);
        score = -Math.abs(ratio - TARGET_OVERLAP);
      } else {
        let nearest = Infinity;
        for (const other of placed) {
          const dx = left + width / 2 - (other.left + other.width / 2);
          const dy = top + height / 2 - (other.top + other.height / 2);
          nearest = Math.min(nearest, Math.hypot(dx, dy));
        }
        score = nearest;
      }

      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
  }

  return best ?? fallback!;
}

function layoutShapes(selection: Selection, vw: number, vh: number, zones: Rect[]): Placement[] {
  const placed: Placement[] = [];
  // Largest first: the big shapes are the hardest to fit around the text.
  const ordered = [...selection].sort((a, b) => b.widthRatio - a.widthRatio);

  for (const { shape, widthRatio } of ordered) {
    placed.push(placeOneShape(shape, widthRatio, vw, vh, zones, placed));
  }

  return placed;
}

/** Fraction of the viewport covered by the union of shape boxes (clipped to the screen). */
function viewportCoverage(placements: Placement[], vw: number, vh: number) {
  if (placements.length === 0 || vw <= 0 || vh <= 0) return 0;

  let covered = 0;
  for (let row = 0; row < COVERAGE_ROWS; row++) {
    const y = ((row + 0.5) / COVERAGE_ROWS) * vh;
    for (let col = 0; col < COVERAGE_COLS; col++) {
      const x = ((col + 0.5) / COVERAGE_COLS) * vw;
      for (const placement of placements) {
        if (
          x >= placement.left &&
          x < placement.left + placement.width &&
          y >= placement.top &&
          y < placement.top + placement.height
        ) {
          covered++;
          break;
        }
      }
    }
  }

  return covered / (COVERAGE_COLS * COVERAGE_ROWS);
}

/**
 * Lay out until coverage hits MIN_COVERAGE, or return the densest attempt.
 * Re-picks the shape set halfway through if sizes alone can't reach the floor.
 */
function layoutWithCoverage(vw: number, vh: number, zones: Rect[], preferred?: Selection | null) {
  let selection = preferred ?? pickShapes(vw);
  let best: Placement[] = [];
  let bestSelection = selection;
  let bestCoverage = -1;

  for (let attempt = 0; attempt < COVERAGE_ATTEMPTS; attempt++) {
    if (attempt === Math.floor(COVERAGE_ATTEMPTS / 2) && bestCoverage < MIN_COVERAGE) {
      selection = pickShapes(vw);
    }

    const placements = layoutShapes(selection, vw, vh, zones);
    const coverage = viewportCoverage(placements, vw, vh);
    if (coverage > bestCoverage) {
      bestCoverage = coverage;
      best = placements;
      bestSelection = selection;
    }
    if (coverage >= MIN_COVERAGE) {
      return { placements: best, selection: bestSelection, coverage: bestCoverage };
    }
  }

  return { placements: best, selection: bestSelection, coverage: bestCoverage };
}

function toLive(
  placements: Placement[],
  selection: Selection,
  idStart: number,
  phase: Phase,
  stagger: boolean,
): LivePlacement[] {
  // layoutShapes sorts by size; match each placement back to selection by src.
  const unused = [...selection];
  return placements.map((placement, index) => {
    let matchIndex = unused.findIndex((entry) => entry.shape.src === placement.src);
    if (matchIndex < 0) matchIndex = 0;
    const [entry] = unused.splice(matchIndex, 1);
    const selected = entry ?? selection[index]!;
    return {
      id: idStart + index,
      src: placement.src,
      left: placement.left,
      top: placement.top,
      width: placement.width,
      height: placement.height,
      shape: selected.shape,
      tierIndex: selected.tierIndex,
      widthRatio: selected.widthRatio,
      phase,
      enterDelayMs: stagger ? index * 90 : 0,
    };
  });
}

function pickReplacementShape(current: LivePlacement[]) {
  const used = new Set(current.map((entry) => entry.src));
  const fresh = COLLAGE_SHAPES.filter((shape) => !used.has(shape.src));
  const pool = fresh.length > 0 ? fresh : COLLAGE_SHAPES;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Stamp one mosaic level into `scratch`, then optionally onto `ctx`. */
function stampMosaic(
  scratch: HTMLCanvasElement,
  img: HTMLImageElement,
  cellsW: number,
  cellsH: number,
) {
  const tw = Math.max(1, cellsW);
  const th = Math.max(1, cellsH);
  if (scratch.width !== tw) scratch.width = tw;
  if (scratch.height !== th) scratch.height = th;
  const tctx = scratch.getContext("2d");
  if (!tctx) return;
  tctx.imageSmoothingEnabled = false;
  tctx.clearRect(0, 0, tw, th);
  tctx.drawImage(img, 0, 0, tw, th);
}

/**
 * Draw a pixelated frame. Uses a fractional cell count and crossfades the two
 * nearest mosaics so block-size steps don’t pop/jitter.
 */
function drawPixelatedSmooth(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  block: number,
  scratchA: HTMLCanvasElement,
  scratchB: HTMLCanvasElement,
) {
  // Cap finest mosaic — dissolve never needs full-res samples.
  const fineW = Math.min(Math.round(width), 96);
  const coarseBlock = Math.max(block, width / fineW);
  const exactW = Math.max(1, width / coarseBlock);
  const w0 = Math.max(1, Math.floor(exactW));
  const w1 = Math.max(w0 + 1, Math.ceil(exactW));
  const frac = Math.min(1, Math.max(0, exactW - w0));
  const h0 = Math.max(1, Math.round((height / width) * w0));
  const h1 = Math.max(1, Math.round((height / width) * w1));

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);

  stampMosaic(scratchA, img, w0, h0);
  if (frac < 0.001) {
    ctx.globalAlpha = 1;
    ctx.drawImage(scratchA, 0, 0, w0, h0, 0, 0, width, height);
    return;
  }

  stampMosaic(scratchB, img, w1, h1);
  ctx.globalAlpha = 1 - frac;
  ctx.drawImage(scratchA, 0, 0, w0, h0, 0, 0, width, height);
  ctx.globalAlpha = frac;
  ctx.drawImage(scratchB, 0, 0, w1, h1, 0, 0, width, height);
  ctx.globalAlpha = 1;
}

/**
 * Emulates a shape dissolving into (or resolving from) large pixels —
 * nearer to a mosaic dissolve than an opacity fade.
 */
function PixelDissolve({
  src,
  width,
  height,
  mode,
  durationMs,
  delayMs = 0,
}: {
  src: string;
  width: number;
  height: number;
  mode: "out" | "in";
  durationMs: number;
  delayMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scratchA = document.createElement("canvas");
    const scratchB = document.createElement("canvas");
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    let frameId = 0;
    let cancelled = false;
    // Softer end state — fewer huge jumps in the last stretch.
    const maxBlock = Math.max(6, Math.round(Math.min(width, height) / 12));
    const minBlock = Math.max(width / 96, 1.25);

    const paint = (block: number) => {
      if (!img.naturalWidth) return;
      drawPixelatedSmooth(ctx, img, width, height, block, scratchA, scratchB);
    };

    const run = () => {
      const startAt = performance.now() + delayMs;

      const frame = (now: number) => {
        if (cancelled) return;

        if (now < startAt) {
          paint(mode === "out" ? minBlock : maxBlock);
          frameId = requestAnimationFrame(frame);
          return;
        }

        const t = Math.min(1, Math.max(0, (now - startAt) / durationMs));
        // In-out pacing keeps early/late block steps smaller and less jittery.
        const e = easeInOutCubic(t);
        const block = mode === "out" ? minBlock + e * (maxBlock - minBlock) : maxBlock - e * (maxBlock - minBlock);
        paint(block);

        if (t < 1) frameId = requestAnimationFrame(frame);
        else if (mode === "out") ctx.clearRect(0, 0, width, height);
      };

      frameId = requestAnimationFrame(frame);
    };

    if (img.complete && img.naturalWidth > 0) run();
    else {
      img.onload = run;
      img.onerror = () => {
        // Fallback: nothing to draw.
      };
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [src, width, height, mode, durationMs, delayMs]);

  return (
    <canvas
      ref={canvasRef}
      className="shape-collage__shape shape-collage__dissolve"
      aria-hidden="true"
      style={{
        width: `${Math.round(width)}px`,
        height: `${Math.round(height)}px`,
        display: "block",
      }}
    />
  );
}

export default function ShapeCollage({ obstacleRefs = [] }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const [placements, setPlacements] = useState<LivePlacement[] | null>(null);
  const placementsRef = useRef<LivePlacement[]>([]);
  const selectionRef = useRef<Selection | null>(null);
  const obstacleRefsRef = useRef(obstacleRefs);
  const nextIdRef = useRef(0);
  const swapTimersRef = useRef<number[]>([]);
  const lastSwapAtRef = useRef<Map<number, number>>(new Map());
  obstacleRefsRef.current = obstacleRefs;

  const { nudgeId, noteInteraction } = useIdleNudge(
    (placements ?? []).map((placement) => String(placement.id)),
    placements != null && placements.length > 0,
  );
  const noteInteractionRef = useRef(noteInteraction);
  noteInteractionRef.current = noteInteraction;

  useEffect(() => {
    let settled = false;

    const publish = (next: LivePlacement[]) => {
      placementsRef.current = next;
      setPlacements(next);
    };

    const clearSwapTimers = () => {
      swapTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      swapTimersRef.current = [];
    };

    const relayout = (forceReseed = false) => {
      const refs = obstacleRefsRef.current;
      const zones = measureTextZones(refs);
      if (refs.length > 0 && zones.length === 0) return false;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      clearSwapTimers();
      lastSwapAtRef.current.clear();

      if (forceReseed || !selectionRef.current) {
        const result = layoutWithCoverage(vw, vh, zones);
        selectionRef.current = result.selection;
        const idStart = nextIdRef.current;
        nextIdRef.current += result.placements.length;
        const stagger = !reducedMotionRef.current;
        publish(
          toLive(
            result.placements,
            result.selection,
            idStart,
            reducedMotionRef.current ? "idle" : "enter",
            stagger,
          ),
        );

        if (stagger) {
          const idleTimer = window.setTimeout(() => {
            publish(
              placementsRef.current.map((entry) =>
                entry.phase === "enter" ? { ...entry, phase: "idle" } : entry,
              ),
            );
          }, DISSOLVE_MS + SHAPE_COUNT * 90);
          swapTimersRef.current.push(idleTimer);
        }
        return true;
      }

      // Resize: keep the same shapes, re-roll positions until coverage holds.
      let best = layoutShapes(selectionRef.current, vw, vh, zones);
      let bestCoverage = viewportCoverage(best, vw, vh);
      for (let attempt = 1; attempt < 10 && bestCoverage < MIN_COVERAGE; attempt++) {
        const next = layoutShapes(selectionRef.current, vw, vh, zones);
        const coverage = viewportCoverage(next, vw, vh);
        if (coverage > bestCoverage) {
          best = next;
          bestCoverage = coverage;
        }
      }
      const idStart = nextIdRef.current;
      nextIdRef.current += best.length;
      publish(toLive(best, selectionRef.current, idStart, "idle", false));
      return true;
    };

    settled = relayout();

    // The hero text fades up on load, so retry until it has a stable box.
    const retry = settled
      ? undefined
      : window.setInterval(() => {
          if (relayout()) window.clearInterval(retry!);
        }, 120);
    const stopRetry = window.setTimeout(() => {
      if (retry) window.clearInterval(retry);
    }, 2500);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => relayout(), 180);
    };
    window.addEventListener("resize", onResize);

    // Scene is hover-interactive: flag <body> so hero.css can set the cursor,
    // leaving the password input and links to override it. (Was an inline
    // body.style.cursor write, which no element could opt out of.)
    const releaseCursor = acquireBodyFlag("heroInteractive");

    const swapAtIndex = (index: number) => {
      const current = placementsRef.current;
      const outgoing = current[index];
      if (!outgoing || outgoing.phase !== "idle") return;

      const now = performance.now();
      const last = lastSwapAtRef.current.get(outgoing.id) ?? 0;
      if (now - last < SWAP_COOLDOWN_MS) return;
      lastSwapAtRef.current.set(outgoing.id, now);
      playHeroSound("page", "collage-swap");

      const finishSwap = () => {
        const latest = placementsRef.current;
        const slot = latest.findIndex((entry) => entry.id === outgoing.id);
        if (slot < 0) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const zones = measureTextZones(obstacleRefsRef.current);
        const others = latest.filter((_, i) => i !== slot);
        const shape = pickReplacementShape(others);
        const band = sizeBandsForViewport(vw)[outgoing.tierIndex] ?? sizeBandsForViewport(vw)[0]!;
        const widthRatio = randomBetween(band.min, band.max);
        const placed = placeOneShape(shape, widthRatio, vw, vh, zones, others);
        const id = nextIdRef.current++;
        const incoming: LivePlacement = {
          id,
          ...placed,
          shape,
          tierIndex: outgoing.tierIndex,
          widthRatio,
          phase: reducedMotionRef.current ? "idle" : "enter",
          enterDelayMs: 0,
        };

        const next = latest.map((entry, i) => (i === slot ? incoming : entry));
        // Keep selection in sync for resize.
        if (selectionRef.current) {
          selectionRef.current = next.map((entry) => ({
            shape: entry.shape,
            band: sizeBandsForViewport(vw)[entry.tierIndex]!,
            tierIndex: entry.tierIndex,
            widthRatio: entry.widthRatio,
          }));
        }
        publish(next);
        lastSwapAtRef.current.set(id, performance.now());

        if (!reducedMotionRef.current) {
          const idleTimer = window.setTimeout(() => {
            publish(
              placementsRef.current.map((entry) =>
                entry.id === id ? { ...entry, phase: "idle" } : entry,
              ),
            );
          }, DISSOLVE_MS);
          swapTimersRef.current.push(idleTimer);
        }
      };

      if (reducedMotionRef.current) {
        finishSwap();
        return;
      }

      publish(current.map((entry, i) => (i === index ? { ...entry, phase: "exit" } : entry)));
      const outTimer = window.setTimeout(finishSwap, DISSOLVE_MS);
      swapTimersRef.current.push(outTimer);
    };

    // Hover an inked mark → fade out, replace, fade in.
    const onPointerMove = (event: PointerEvent) => {
      if (isInteractiveTarget(event.target as Element | null)) return;
      const list = placementsRef.current;
      if (list.length === 0) return;

      // Topmost first (later in DOM).
      for (let i = list.length - 1; i >= 0; i--) {
        const entry = list[i]!;
        if (entry.phase !== "idle") continue;
        if (
          inkHit(
            entry.shape,
            entry.left,
            entry.top,
            entry.width,
            entry.height,
            event.clientX,
            event.clientY,
          )
        ) {
          noteInteractionRef.current();
          swapAtIndex(i);
          return;
        }
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Click empty background (not nav / form / links) to re-roll the collage.
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveTarget(event.target as Element | null)) return;
      noteInteractionRef.current();
      playHeroSoundOnClick("bloom", "collage-relayout");
      selectionRef.current = null;
      relayout(true);
    };
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      if (retry) window.clearInterval(retry);
      window.clearTimeout(stopRetry);
      window.clearTimeout(resizeTimer);
      clearSwapTimers();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      releaseCursor();
    };
  }, [reducedMotion]);

  if (!placements) return null;

  return createPortal(
    <div
      className="shape-collage"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <HeroGridSurface />
      {placements.map((placement) => {
        const isNudged =
          nudgeId === String(placement.id) && placement.phase === "idle";
        const box = {
          position: "absolute" as const,
          left: `${Math.round(placement.left)}px`,
          top: `${Math.round(placement.top)}px`,
          width: `${Math.round(placement.width)}px`,
          height: `${Math.round(placement.height)}px`,
          mixBlendMode: "multiply" as const,
        };
        const nudgeClass = isNudged ? " is-idle-nudge is-idle-nudge--subtle" : "";

        if (!reducedMotion && placement.phase === "exit") {
          return (
            <div key={placement.id} className={nudgeClass.trim()} style={box}>
              <PixelDissolve
                src={placement.src}
                width={placement.width}
                height={placement.height}
                mode="out"
                durationMs={DISSOLVE_MS}
              />
            </div>
          );
        }

        if (!reducedMotion && placement.phase === "enter") {
          return (
            <div key={placement.id} className={nudgeClass.trim()} style={box}>
              <PixelDissolve
                src={placement.src}
                width={placement.width}
                height={placement.height}
                mode="in"
                durationMs={DISSOLVE_MS}
                delayMs={placement.enterDelayMs}
              />
            </div>
          );
        }

        return (
          <div key={placement.id} className={nudgeClass.trim()} style={box}>
            <img
              className="shape-collage__shape hero-idle-nudge__target"
              src={placement.src}
              alt=""
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
