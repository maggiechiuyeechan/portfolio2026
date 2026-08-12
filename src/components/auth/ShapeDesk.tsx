/**
 * Draggable paper-desk — shapes splayed on a flat surface (no gravity).
 * Drag to move, scroll or use the handle to rotate, click to nudge rotation.
 * Initial placement keeps clear of the hero text and allows at most pairwise
 * overlaps (no 3+ stacks). Drag freely afterward.
 * After 5s idle, one shape pulses to 1.075× every 5s as a gentle invite.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../lib/motion";
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
const PLACE_ATTEMPTS = 120;
/** Bounding-circle shrink so light grazing doesn’t count as a stack. */
const OVERLAP_RADIUS_FACTOR = 0.78;
/** At most this many shapes may share an overlap (pairs only on first paint). */
const MAX_INITIAL_STACK = 2;
/** Single-column / mobile breakpoint (matches --single-column-break). */
const MOBILE_MAX_WIDTH_PX = 660;
const LARGE_DESKTOP_MIN_WIDTH_PX = 1920;

/** Scale shape size from viewport — smaller on phones, larger on desktop. */
function deskBaseSize(viewportWidth: number, viewportHeight: number) {
  const minDim = Math.min(viewportWidth, viewportHeight);

  let size: number;
  if (minDim <= 480) {
    // phone
    size = minDim * 0.34;
  } else if (minDim <= 768) {
    // large phone / small tablet
    size = 164 + ((minDim - 480) / (768 - 480)) * (260 - 164);
  } else if (minDim <= 1024) {
    // tablet / laptop
    size = 260 + ((minDim - 768) / (1024 - 768)) * (340 - 260);
  } else {
    // desktop
    size = 340 + ((minDim - 1024) / 416) * 100;
  }

  // Keep shapes from dominating short or narrow viewports
  size = Math.min(size, viewportHeight * 0.29, viewportWidth * 0.44);

  return Math.round(Math.max(104, Math.min(440, size)));
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

function pieceRadius(pieceWidth: number, pieceHeight: number) {
  return (Math.hypot(pieceWidth, pieceHeight) / 2) * OVERLAP_RADIUS_FACTOR;
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
  return Math.hypot(ax - bx, ay - by) < pieceRadius(aw, ah) + pieceRadius(bw, bh);
}

function overlapsZone(
  x: number,
  y: number,
  pieceWidth: number,
  pieceHeight: number,
  zones: Rect[],
) {
  // Use the diagonal so rotated pieces still clear the text on first paint.
  const radius = Math.hypot(pieceWidth, pieceHeight) / 2;
  const left = x - radius;
  const top = y - radius;
  const right = x + radius;
  const bottom = y + radius;

  return zones.some(
    (zone) => left < zone.right && right > zone.left && top < zone.bottom && bottom > zone.top,
  );
}

function randomEdgePosition(width: number, height: number, pieceSize: number) {
  const inset = pieceSize * 0.35;
  const band = Math.min(width, height) * 0.22;
  const edge = Math.floor(Math.random() * 4);

  const minX = inset;
  const maxX = width - inset;
  const minY = inset;
  const maxY = height - inset;

  switch (edge) {
    case 0: // top
      return { x: minX + Math.random() * (maxX - minX), y: inset + Math.random() * band };
    case 1: // right
      return { x: width - inset - Math.random() * band, y: minY + Math.random() * (maxY - minY) };
    case 2: // bottom
      return { x: minX + Math.random() * (maxX - minX), y: height - inset - Math.random() * band };
    default: // left
      return { x: inset + Math.random() * band, y: minY + Math.random() * (maxY - minY) };
  }
}

function randomScatterPosition(width: number, height: number, pieceSize: number) {
  const inset = pieceSize * 0.4;
  return {
    x: inset + Math.random() * Math.max(1, width - inset * 2),
    y: inset + Math.random() * Math.max(1, height - inset * 2),
  };
}

function randomDeskPosition(width: number, height: number, pieceSize: number) {
  // Bias toward the open field so the desk reads more spread out.
  if (Math.random() < 0.55) return randomScatterPosition(width, height, pieceSize);
  return randomEdgePosition(width, height, pieceSize);
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
  return false;
}

function placeClearOfText(
  width: number,
  height: number,
  pieceWidth: number,
  pieceHeight: number,
  zones: Rect[],
  placed: PlacedMeta[],
  shapeId: string,
) {
  const pieceSize = Math.max(pieceWidth, pieceHeight);
  let best: { x: number; y: number; score: number } | null = null;

  for (let attempt = 0; attempt < PLACE_ATTEMPTS; attempt++) {
    const { x, y } = randomDeskPosition(width, height, pieceSize);
    if (overlapsZone(x, y, pieceWidth, pieceHeight, zones)) continue;
    if (violatesStackLimit(x, y, pieceWidth, pieceHeight, placed)) continue;

    const nearestPiece =
      placed.length === 0
        ? Math.hypot(x - width / 2, y - height / 2)
        : Math.min(...placed.map((other) => Math.hypot(x - other.x, y - other.y)));
    const distanceFromCenter = Math.hypot(x - width / 2, y - height / 2);
    const sameShapes = placed.filter((other) => other.shapeId === shapeId);
    const nearestSameShape =
      sameShapes.length === 0
        ? Math.hypot(width, height)
        : Math.min(...sameShapes.map((other) => Math.hypot(x - other.x, y - other.y)));
    const score = nearestPiece + nearestSameShape * 0.6 + distanceFromCenter * 0.08;

    if (!best || score > best.score) best = { x, y, score };
  }

  if (best) return { x: best.x, y: best.y };

  // Last resort: park in a corner away from the centred copy.
  const inset = pieceSize * 0.45;
  const corners = [
    { x: inset, y: inset },
    { x: width - inset, y: inset },
    { x: inset, y: height - inset },
    { x: width - inset, y: height - inset },
  ];
  for (const corner of corners) {
    if (overlapsZone(corner.x, corner.y, pieceWidth, pieceHeight, zones)) continue;
    if (violatesStackLimit(corner.x, corner.y, pieceWidth, pieceHeight, placed)) continue;
    return corner;
  }
  return corners[0]!;
}

function shapesForViewport(shapes: ShapeDef[], width: number): ShapeDef[] {
  const seen = new Set<string>();
  const unique: ShapeDef[] = [];
  for (const shape of shapes) {
    if (seen.has(shape.id)) continue;
    seen.add(shape.id);
    unique.push(shape);
  }

  // Large desktop: add a third set; regular desktop keeps the doubled spawn set.
  if (width > LARGE_DESKTOP_MIN_WIDTH_PX) return [...shapes, ...unique];
  if (width > MOBILE_MAX_WIDTH_PX) return shapes;
  // Mobile: one of each shape (drop the doubled spawn set).
  return unique;
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
    const { x, y } = placeClearOfText(
      width,
      height,
      pieceWidth,
      pieceHeight,
      zones,
      placedMeta,
      shape.id,
    );

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
        shapesForViewport(shapes, width),
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

        return (
          <div
            key={piece.id}
            className={`shape-desk-piece${isNudged ? " is-idle-nudge" : ""}`}
            onPointerDown={(event) => startMove(piece, event)}
            onWheel={(event) => onWheel(piece, event)}
            style={{
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
