/**
 * Draggable paper-desk — shapes splayed on a flat surface (no gravity).
 * Drag to move, scroll or use the handle to rotate, click to nudge rotation.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PhysicsShapeFace from "./PhysicsShapeFace";
import { shapeBodyDimensions, type ShapeDef } from "./physicsShapes";
import { SHAPES_D_SPAWN } from "./physicsShapesD";

interface Props {
  shapes?: ShapeDef[];
}

const ROTATE_HANDLE_OFFSET = 28;
const WHEEL_ROTATE = 0.004;
const CLICK_MOVE_THRESHOLD = 5;
const CLICK_ROTATE_RAD = (15 * Math.PI) / 180;

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
    size = 340 + ((minDim - 1024) / 416) * 60;
  }

  // Keep shapes from dominating short or narrow viewports
  size = Math.min(size, viewportHeight * 0.26, viewportWidth * 0.44);

  return Math.round(Math.max(104, Math.min(400, size)));
}

function rotateHandleOffset(baseSize: number) {
  return Math.max(20, Math.round(ROTATE_HANDLE_OFFSET * (baseSize / 360)));
}

interface DeskPiece {
  id: string;
  shape: ShapeDef;
  x: number;
  y: number;
  angle: number;
  zIndex: number;
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

function createInitialPieces(shapes: ShapeDef[], width: number, height: number, baseSize: number): DeskPiece[] {
  return shapes.map((shape, index) => {
    const { width: pieceWidth, height: pieceHeight } = shapeBodyDimensions(baseSize, shape);
    const pieceSize = Math.max(pieceWidth, pieceHeight);
    const { x, y } = randomEdgePosition(width, height, pieceSize);

    return {
      id: `${shape.id}-${index}`,
      shape,
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      zIndex: index + 1,
    };
  });
}

function pieceDimensions(piece: DeskPiece, baseSize: number) {
  return shapeBodyDimensions(baseSize, piece.shape);
}

function pointerAngle(piece: DeskPiece, clientX: number, clientY: number) {
  return Math.atan2(clientY - piece.y, clientX - piece.x);
}

export default function ShapeDesk({ shapes = SHAPES_D_SPAWN }: Props) {
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [baseSize, setBaseSize] = useState(360);
  const [pieces, setPieces] = useState<DeskPiece[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const interactionRef = useRef<ActiveInteraction | null>(null);
  const topZRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const size = deskBaseSize(width, height);
      setViewport({ width, height });
      setBaseSize(size);
      setPieces((current) => {
        if (current.length > 0) return current;
        const initial = createInitialPieces(shapes, width, height, size);
        topZRef.current = initial.length;
        return initial;
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [shapes]);

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
        setPieces((current) =>
          current.map((piece) =>
            piece.id === interaction.pieceId
              ? { ...piece, angle: piece.angle + direction * CLICK_ROTATE_RAD }
              : piece,
          ),
        );
      }

      interactionRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
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
        const handleX = 0;
        const handleOffset = rotateHandleOffset(baseSize);
        const handleY = -height / 2 - handleOffset;

        return (
          <div
            key={piece.id}
            className="shape-desk-piece"
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
            <div className="shape-desk-piece__face">
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
