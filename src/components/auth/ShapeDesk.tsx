/**
 * Draggable paper-desk — shapes splayed on a flat surface (no gravity).
 * Drag to move, scroll or use the handle to rotate, click to nudge rotation.
 * Initial placement keeps clear of the hero text, spreads pieces evenly,
 * allows at most pairwise overlaps, and skips a piece rather than stacking it.
 * Count and size scale with the viewport. Drag freely afterward.
 * After 5s idle, one shape pulses to 1.075× every 5s as a gentle invite.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion, waveEnterDelayMs } from "../../lib/motion";
import { playHeroSoundOnClick } from "../../lib/heroSounds";
import { useIdleNudge } from "../../lib/useIdleNudge";
import PhysicsShapeFace from "./PhysicsShapeFace";
import { shapeBodyDimensions, type ShapeDef } from "./physicsShapes";
import { SHAPES_D_SPAWN } from "./physicsShapesD";

interface Props {
  shapes?: ShapeDef[];
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
}

const ROTATE_HANDLE_OFFSET = 28;
const WHEEL_ROTATE = 0.004;
const CLICK_MOVE_THRESHOLD = 5;
const CLICK_ROTATE_RAD = (15 * Math.PI) / 180;
/** Clearance around the hero text for initial placement. */
const TEXT_PADDING = 28;
/** Candidates per piece — pick the seat that spreads the field most. */
const PLACE_CANDIDATES = 160;
/** Bounding-box shrink so light grazing doesn’t count as a stack. */
const OVERLAP_RADIUS_FACTOR = 0.92;
/** At most this many shapes may share an overlap (pairs only on first paint). */
const MAX_INITIAL_STACK = 2;
/** Single-column / mobile breakpoint (matches --single-column-break). */
const MOBILE_MAX_WIDTH_PX = 660;

/** Scale shape size from viewport — smaller on phones, larger on desktop. */
function deskBaseSize(viewportWidth: number, viewportHeight: number) {
  const minDim = Math.min(viewportWidth, viewportHeight);
  const desktop = viewportWidth > 1024;

  if (desktop) {
    // Large enough to read as paper, sparse enough that the field stays airy.
    const size = 275 + Math.max(0, (minDim - 800) / 640) * 75;
    return Math.round(Math.min(size, viewportHeight * 0.31, viewportWidth * 0.23, 360));
  }

  let size: number;
  if (minDim <= 480) {
    size = minDim * 0.34;
  } else if (minDim <= 768) {
    size = 162 + ((minDim - 480) / (768 - 480)) * (216 - 162);
  } else {
    size = 216 + ((minDim - 768) / (1024 - 768)) * (250 - 216);
  }

  return Math.round(Math.max(104, Math.min(size, viewportHeight * 0.23, viewportWidth * 0.34, 260)));
}

function rotateHandleOffset(baseSize: number) {
  return Math.max(20, Math.round(ROTATE_HANDLE_OFFSET * (baseSize / 360)));
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface DeskPiece {
  id: string;
  shape: ShapeDef;
  x: number;
  y: number;
  angle: number;
  zIndex: number;
}

interface PlacedMeta {
  x: number;
  y: number;
  w: number;
  h: number;
  overlapCount: number;
  shapeId: string;
}

interface ActiveInteraction {
  pieceId: string;
  pointerId: number;
  mode: "move" | "rotate";
  offsetX: number;
  offsetY: number;
  startAngle: number;
  startPointerAngle: number;
  startClientX: number;
  startClientY: number;
  moved: boolean;
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

function piecesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  // Axis-aligned boxes, not circumcircles. Circles treated 250px squares as
  // overlapping when they still had a 70px gap, so most seats got rejected.
  return (
    Math.abs(ax - bx) < ((aw + bw) / 2) * OVERLAP_RADIUS_FACTOR &&
    Math.abs(ay - by) < ((ah + bh) / 2) * OVERLAP_RADIUS_FACTOR
  );
}

function overlapsZone(
  x: number,
  y: number,
  pieceWidth: number,
  pieceHeight: number,
  zones: Rect[],
) {
  // Circumcircle so a rotated tile can’t swing a corner into the type.
  const radius = Math.hypot(pieceWidth, pieceHeight) / 2;
  const left = x - radius;
  const top = y - radius;
  const right = x + radius;
  const bottom = y + radius;

  return zones.some(
    (zone) => left < zone.right && right > zone.left && top < zone.bottom && bottom > zone.top,
  );
}

function randomScatterPosition(width: number, height: number, pieceSize: number) {
  // Keep the unrotated box on-screen so overflow:hidden doesn't swallow pieces.
  const inset = pieceSize * 0.52;
  return {
    x: inset + Math.random() * Math.max(1, width - inset * 2),
    y: inset + Math.random() * Math.max(1, height - inset * 2),
  };
}

/** Uniform sample in the open field (viewport minus hero text). */
function randomFreePosition(
  width: number,
  height: number,
  pieceWidth: number,
  pieceHeight: number,
  zones: Rect[],
) {
  const pieceSize = Math.max(pieceWidth, pieceHeight);
  for (let attempt = 0; attempt < 24; attempt++) {
    const spot = randomScatterPosition(width, height, pieceSize);
    if (!overlapsZone(spot.x, spot.y, pieceWidth, pieceHeight, zones)) return spot;
  }
  return randomScatterPosition(width, height, pieceSize);
}

/**
 * True if placing a new piece here would create a 3+ stack.
 * Allows pairs only: each piece may overlap at most one other on first paint.
 */
function violatesStackLimit(
  x: number,
  y: number,
  pieceWidth: number,
  pieceHeight: number,
  placed: PlacedMeta[],
  shapeId: string,
) {
  const hits: number[] = [];
  for (let i = 0; i < placed.length; i++) {
    const other = placed[i]!;
    if (piecesOverlap(x, y, pieceWidth, pieceHeight, other.x, other.y, other.w, other.h)) {
      hits.push(i);
    }
  }

  if (hits.length >= MAX_INITIAL_STACK) return true;
  // Partner already in a pair — adding this would make a triple.
  if (hits.some((i) => placed[i]!.overlapCount >= 1)) return true;
  // Two of the same SVG on top of each other reads as a muddy stack.
  if (hits.some((i) => placed[i]!.shapeId === shapeId)) return true;

  const ownSpan = Math.max(pieceWidth, pieceHeight);
  for (const other of placed) {
    if (other.shapeId !== shapeId) continue;
    const minDist = (ownSpan + Math.max(other.w, other.h)) * 0.48;
    if (Math.hypot(x - other.x, y - other.y) < minDist) return true;
  }

  return false;
}

function nearestPlacedDistance(x: number, y: number, width: number, height: number, placed: PlacedMeta[]) {
  if (placed.length === 0) return Math.hypot(width, height);
  return Math.min(...placed.map((other) => Math.hypot(x - other.x, y - other.y)));
}

/** 0 on the bezel, 1 toward the middle — stops max-min from filling only corners. */
function inwardBias(x: number, y: number, width: number, height: number) {
  const nx = Math.min(x, width - x) / (width * 0.5);
  const ny = Math.min(y, height - y) / (height * 0.5);
  return 0.5 + 0.5 * Math.min(1, Math.min(nx, ny) / 0.22);
}

function copyUnion(zones: Rect[]): Rect | null {
  if (zones.length === 0) return null;
  return {
    left: Math.min(...zones.map((zone) => zone.left)),
    top: Math.min(...zones.map((zone) => zone.top)),
    right: Math.max(...zones.map((zone) => zone.right)),
    bottom: Math.max(...zones.map((zone) => zone.bottom)),
  };
}

/** Seats on rings around the hero copy — the band the rim-only packer skipped. */
function haloPositions(zones: Rect[], pieceSize: number, gaps: number[]) {
  const bounds = copyUnion(zones);
  if (!bounds) return [];
  const cx = (bounds.left + bounds.right) / 2;
  const cy = (bounds.top + bounds.bottom) / 2;
  const spots: { x: number; y: number }[] = [];
  for (const gap of gaps) {
    const rw = (bounds.right - bounds.left) / 2 + pieceSize * gap;
    const rh = (bounds.bottom - bounds.top) / 2 + pieceSize * gap;
    for (let i = 0; i < 24; i++) {
      const t = ((i + Math.random() * 0.35) / 24) * Math.PI * 2;
      spots.push({
        x: cx + Math.cos(t) * rw + (Math.random() - 0.5) * pieceSize * 0.08,
        y: cy + Math.sin(t) * rh + (Math.random() - 0.5) * pieceSize * 0.08,
      });
    }
  }
  return spots;
}

function angularGap(
  x: number,
  y: number,
  zones: Rect[],
  placed: PlacedMeta[],
) {
  const bounds = copyUnion(zones);
  if (!bounds) return 0;
  const cx = (bounds.left + bounds.right) / 2;
  const cy = (bounds.top + bounds.bottom) / 2;
  const angle = Math.atan2(y - cy, x - cx);
  if (placed.length === 0) return Math.PI;
  let nearest = Math.PI;
  for (const other of placed) {
    let delta = Math.abs(angle - Math.atan2(other.y - cy, other.x - cx));
    if (delta > Math.PI) delta = 2 * Math.PI - delta;
    nearest = Math.min(nearest, delta);
  }
  return nearest;
}

function placementScore(
  x: number,
  y: number,
  pieceWidth: number,
  pieceHeight: number,
  width: number,
  height: number,
  placed: PlacedMeta[],
) {
  const nearest = nearestPlacedDistance(x, y, width, height, placed);
  const overlapping = placed.some((other) =>
    piecesOverlap(x, y, pieceWidth, pieceHeight, other.x, other.y, other.w, other.h),
  );
  // Even spread first. Pairs only win when no isolated seat is left.
  const spread = overlapping ? nearest * 0.5 : nearest;
  return spread * inwardBias(x, y, width, height);
}

function considerSpot(
  x: number,
  y: number,
  pieceWidth: number,
  pieceHeight: number,
  width: number,
  height: number,
  zones: Rect[],
  placed: PlacedMeta[],
  shapeId: string,
  best: { x: number; y: number; score: number } | null,
  score: number,
) {
  if (x < pieceWidth * 0.18 || x > width - pieceWidth * 0.18) return best;
  if (y < pieceHeight * 0.18 || y > height - pieceHeight * 0.18) return best;
  if (overlapsZone(x, y, pieceWidth, pieceHeight, zones)) return best;
  if (violatesStackLimit(x, y, pieceWidth, pieceHeight, placed, shapeId)) return best;
  if (!best || score > best.score) return { x, y, score };
  return best;
}

function gridDeskPositions(width: number, height: number, pieceSize: number) {
  const inset = pieceSize * 0.52;
  const usableW = Math.max(1, width - inset * 2);
  const usableH = Math.max(1, height - inset * 2);
  const cols = 10;
  const rows = 8;
  const spots: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      spots.push({
        x: inset + (col / Math.max(1, cols - 1)) * usableW,
        y: inset + (row / Math.max(1, rows - 1)) * usableH,
      });
    }
  }
  return spots;
}

function placeClearOfText(
  width: number,
  height: number,
  pieceWidth: number,
  pieceHeight: number,
  zones: Rect[],
  placed: PlacedMeta[],
  shapeId: string,
): { x: number; y: number } | null {
  const pieceSize = Math.max(pieceWidth, pieceHeight);
  let best: { x: number; y: number; score: number } | null = null;

  const trySpot = (x: number, y: number, score: number) => {
    best = considerSpot(x, y, pieceWidth, pieceHeight, width, height, zones, placed, shapeId, best, score);
  };

  // Necklace around the type — angular spacing, not max-min, so seats stay close in.
  for (const spot of haloPositions(zones, pieceSize, [0.78, 0.94])) {
    trySpot(spot.x, spot.y, angularGap(spot.x, spot.y, zones, placed));
  }
  if (best) return { x: best.x, y: best.y };

  for (const spot of haloPositions(zones, pieceSize, [0.78, 0.94, 1.12])) {
    trySpot(spot.x, spot.y, placementScore(spot.x, spot.y, pieceWidth, pieceHeight, width, height, placed));
  }

  for (let attempt = 0; attempt < PLACE_CANDIDATES; attempt++) {
    const { x, y } = randomFreePosition(width, height, pieceWidth, pieceHeight, zones);
    trySpot(x, y, placementScore(x, y, pieceWidth, pieceHeight, width, height, placed));
  }

  if (best) return { x: best.x, y: best.y };

  for (const spot of gridDeskPositions(width, height, pieceSize)) {
    trySpot(spot.x, spot.y, placementScore(spot.x, spot.y, pieceWidth, pieceHeight, width, height, placed));
  }
  if (best) return { x: best.x, y: best.y };

  // No legal pair-only seat — omit the piece instead of stacking it.
  return null;
}

function uniqueShapes(shapes: ShapeDef[]): ShapeDef[] {
  const seen = new Set<string>();
  const unique: ShapeDef[] = [];
  for (const shape of shapes) {
    if (seen.has(shape.id)) continue;
    seen.add(shape.id);
    unique.push(shape);
  }
  return unique;
}

function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = items[i]!;
    items[i] = items[j]!;
    items[j] = current;
  }
  return items;
}

function deskTargetCount(width: number, height: number, baseSize: number, zones: Rect[]) {
  const viewArea = width * height;
  let blocked = 0;
  for (const zone of zones) {
    const w = Math.max(0, Math.min(zone.right, width) - Math.max(zone.left, 0));
    const h = Math.max(0, Math.min(zone.bottom, height) - Math.max(zone.top, 0));
    blocked += w * h;
  }
  const freeArea = Math.max(viewArea * 0.5, viewArea - blocked);
  const byArea = Math.floor(freeArea / (baseSize * baseSize * 1.15));

  let minCount: number;
  let maxCount: number;
  if (width <= MOBILE_MAX_WIDTH_PX) {
    minCount = 6;
    maxCount = 8;
  } else if (width <= 1024) {
    minCount = 10;
    maxCount = 14;
  } else if (width <= 1440) {
    minCount = 14;
    maxCount = 18;
  } else if (width <= 1920) {
    minCount = 16;
    maxCount = 22;
  } else {
    minCount = 18;
    maxCount = 26;
  }

  return Math.max(minCount, Math.min(maxCount, byArea));
}

function shapesForCount(palette: ShapeDef[], count: number): ShapeDef[] {
  const unique = shuffleInPlace(uniqueShapes(palette));
  if (unique.length === 0 || count <= 0) return [];
  const out: ShapeDef[] = [];
  for (let i = 0; i < count; i++) out.push(unique[i % unique.length]!);
  return out;
}

function overlapDegree(index: number, meta: PlacedMeta[]) {
  const self = meta[index]!;
  let hits = 0;
  for (let i = 0; i < meta.length; i++) {
    if (i === index) continue;
    const other = meta[i]!;
    if (piecesOverlap(self.x, self.y, self.w, self.h, other.x, other.y, other.w, other.h)) {
      hits += 1;
    }
  }
  return hits;
}

/** Drop the newest piece in any 3+ overlap so pairs stay the maximum. */
function cullTripleStacks(pieces: DeskPiece[], meta: PlacedMeta[]) {
  let changed = true;
  while (changed) {
    changed = false;
    let worst = -1;
    let worstDegree = 1;
    for (let i = 0; i < meta.length; i++) {
      const degree = overlapDegree(i, meta);
      if (degree > worstDegree || (degree > 1 && degree === worstDegree && i > worst)) {
        worst = i;
        worstDegree = degree;
      }
    }
    if (worst >= 0 && worstDegree >= 2) {
      pieces.splice(worst, 1);
      meta.splice(worst, 1);
      changed = true;
    }
  }
}

function createInitialPieces(
  shapes: ShapeDef[],
  width: number,
  height: number,
  baseSize: number,
  zones: Rect[],
): DeskPiece[] {
  const placedMeta: PlacedMeta[] = [];
  const pieces: DeskPiece[] = [];

  shapes.forEach((shape, index) => {
    const { width: pieceWidth, height: pieceHeight } = shapeBodyDimensions(baseSize, shape);
    const spot = placeClearOfText(
      width,
      height,
      pieceWidth,
      pieceHeight,
      zones,
      placedMeta,
      shape.id,
    );
    if (!spot) return;

    const { x, y } = spot;

    // Update overlap counts for the pair graph.
    const hits: number[] = [];
    for (let i = 0; i < placedMeta.length; i++) {
      const other = placedMeta[i]!;
      if (piecesOverlap(x, y, pieceWidth, pieceHeight, other.x, other.y, other.w, other.h)) {
        hits.push(i);
      }
    }
    for (const i of hits) placedMeta[i]!.overlapCount += 1;
    placedMeta.push({
      x,
      y,
      w: pieceWidth,
      h: pieceHeight,
      overlapCount: hits.length,
      shapeId: shape.id,
    });

    pieces.push({
      id: `${shape.id}-${index}`,
      shape,
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      zIndex: index + 1,
    });
  });

  cullTripleStacks(pieces, placedMeta);
  return pieces;
}

function pieceDimensions(piece: DeskPiece, baseSize: number) {
  return shapeBodyDimensions(baseSize, piece.shape);
}

function pointerAngle(piece: DeskPiece, clientX: number, clientY: number) {
  return Math.atan2(clientY - piece.y, clientX - piece.x);
}

export default function ShapeDesk({ shapes = SHAPES_D_SPAWN, obstacleRefs = [] }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [baseSize, setBaseSize] = useState(360);
  const [pieces, setPieces] = useState<DeskPiece[]>([]);
  const [entering, setEntering] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { nudgeId, noteInteraction } = useIdleNudge(
    pieces.map((piece) => piece.id),
    mounted && pieces.length > 0,
  );
  const interactionRef = useRef<ActiveInteraction | null>(null);
  const topZRef = useRef(0);
  const placedRef = useRef(false);
  const piecesRef = useRef<DeskPiece[]>([]);

  piecesRef.current = pieces;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pieces.length === 0 || reducedMotion) {
      setEntering(false);
      return;
    }
    setEntering(true);
    const timer = window.setTimeout(() => setEntering(false), 1300);
    return () => window.clearTimeout(timer);
  }, [mounted, pieces.length, reducedMotion]);

  useEffect(() => {
    if (!mounted) return;

    const tryPlace = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const size = deskBaseSize(width, height);
      setViewport({ width, height });
      setBaseSize(size);

      if (placedRef.current) return true;

      const zones = measureTextZones(obstacleRefs);
      // Wait until hero text has a measurable box before seeding the desk.
      if (obstacleRefs.length > 0 && zones.length === 0) return false;

      const initial = createInitialPieces(
        shapesForCount(shapes, deskTargetCount(width, height, size, zones)),
        width,
        height,
        size,
        zones,
      );
      topZRef.current = initial.length;
      placedRef.current = true;
      setPieces(initial);
      return true;
    };

    tryPlace();
    const retry = window.setInterval(() => {
      if (tryPlace()) window.clearInterval(retry);
    }, 100);
    const stop = window.setTimeout(() => window.clearInterval(retry), 2500);

    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({ width, height });
      setBaseSize(deskBaseSize(width, height));
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.clearInterval(retry);
      window.clearTimeout(stop);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, shapes, obstacleRefs]);

  const bringToFront = useCallback((pieceId: string) => {
    topZRef.current += 1;
    const nextZ = topZRef.current;
    setPieces((current) =>
      current.map((piece) => (piece.id === pieceId ? { ...piece, zIndex: nextZ } : piece)),
    );
    setSelectedId(pieceId);
  }, []);

  const updatePiece = useCallback((pieceId: string, patch: Partial<Pick<DeskPiece, "x" | "y" | "angle">>) => {
    setPieces((current) =>
      current.map((piece) => (piece.id === pieceId ? { ...piece, ...patch } : piece)),
    );
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.pointerId !== event.pointerId) return;

      setPieces((current) => {
        const piece = current.find((entry) => entry.id === interaction.pieceId);
        if (!piece) return current;

        if (interaction.mode === "move") {
          if (!interaction.moved) {
            const dx = event.clientX - interaction.startClientX;
            const dy = event.clientY - interaction.startClientY;
            if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD) {
              interaction.moved = true;
            }
          }

          return current.map((entry) =>
            entry.id === piece.id
              ? {
                  ...entry,
                  x: event.clientX - interaction.offsetX,
                  y: event.clientY - interaction.offsetY,
                }
              : entry,
          );
        }

        const angle =
          interaction.startAngle + (pointerAngle(piece, event.clientX, event.clientY) - interaction.startPointerAngle);

        return current.map((entry) => (entry.id === piece.id ? { ...entry, angle } : entry));
      });
    };

    const endInteraction = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.pointerId !== event.pointerId) return;

      if (interaction.mode === "move" && !interaction.moved) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        playHeroSoundOnClick("toggle", "desk-nudge");
        setPieces((current) =>
          current.map((piece) =>
            piece.id === interaction.pieceId
              ? { ...piece, angle: piece.angle + direction * CLICK_ROTATE_RAD }
              : piece,
          ),
        );
      } else if (interaction.moved || interaction.mode === "rotate") {
        playHeroSoundOnClick("release", "desk-release");
      }

      interactionRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", endInteraction);
    window.addEventListener("pointercancel", endInteraction);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endInteraction);
      window.removeEventListener("pointercancel", endInteraction);
    };
  }, []);

  const startMove = (piece: DeskPiece, event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    noteInteraction();
    playHeroSoundOnClick("press", "desk-press");
    event.currentTarget.setPointerCapture(event.pointerId);
    bringToFront(piece.id);
    interactionRef.current = {
      pieceId: piece.id,
      pointerId: event.pointerId,
      mode: "move",
      offsetX: event.clientX - piece.x,
      offsetY: event.clientY - piece.y,
      startAngle: piece.angle,
      startPointerAngle: 0,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
  };

  const startRotate = (piece: DeskPiece, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    noteInteraction();
    playHeroSoundOnClick("press", "desk-press");
    event.currentTarget.setPointerCapture(event.pointerId);
    bringToFront(piece.id);
    interactionRef.current = {
      pieceId: piece.id,
      pointerId: event.pointerId,
      mode: "rotate",
      offsetX: 0,
      offsetY: 0,
      startAngle: piece.angle,
      startPointerAngle: pointerAngle(piece, event.clientX, event.clientY),
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: true,
    };
  };

  const onWheel = (piece: DeskPiece, event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    noteInteraction();
    bringToFront(piece.id);
    updatePiece(piece.id, { angle: piece.angle + event.deltaY * WHEEL_ROTATE });
  };

  if (!mounted || viewport.width === 0) return null;

  const desk = (
    <div
      className="shape-desk"
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
      {pieces.map((piece) => {
        const { width, height } = pieceDimensions(piece, baseSize);
        const isSelected = selectedId === piece.id;
        const isNudged = nudgeId === piece.id;
        const handleX = 0;
        const handleOffset = rotateHandleOffset(baseSize);
        const handleY = -height / 2 - handleOffset;

        const enterDelay = reducedMotion
          ? 0
          : waveEnterDelayMs(piece.x, piece.y, viewport.width, viewport.height);

        return (
          <div
            key={piece.id}
            className={`shape-desk-piece${entering ? " is-entering" : ""}${isNudged ? " is-idle-nudge" : ""}`}
            onPointerDown={(event) => startMove(piece, event)}
            onWheel={(event) => onWheel(piece, event)}
            style={{
              ["--desk-enter-delay" as string]: `${enterDelay}ms`,
              position: "absolute",
              left: 0,
              top: 0,
              width,
              height,
              zIndex: piece.zIndex,
              pointerEvents: "auto",
              touchAction: "none",
              cursor: "grab",
              mixBlendMode: "multiply",
              transform: `translate(${Math.round(piece.x - width / 2)}px, ${Math.round(piece.y - height / 2)}px) rotate(${piece.angle}rad)`,
              transformOrigin: "center center",
            }}
          >
            <div className="shape-desk-piece__face hero-idle-nudge__target">
              <PhysicsShapeFace shape={piece.shape} baseSize={baseSize} applyBlend={false} />
            </div>
            {isSelected ? (
              <button
                type="button"
                aria-label="Rotate shape"
                onPointerDown={(event) => startRotate(piece, event)}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${handleX}px)`,
                  top: `calc(50% + ${handleY}px)`,
                  width: 14,
                  height: 14,
                  marginLeft: -7,
                  marginTop: -7,
                  borderRadius: "50%",
                  border: "1.5px solid var(--color-border-default, #ccc)",
                  background: "var(--color-background-onmain-default, #fff)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  padding: 0,
                  cursor: "grab",
                  pointerEvents: "auto",
                  mixBlendMode: "normal",
                  isolation: "isolate",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return createPortal(desk, document.body);
}
