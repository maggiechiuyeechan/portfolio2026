/**
 * Single editable organic blob: idle flat fill → hover-reveal control nodes →
 * hover a node to expose its Bézier handles → drag nodes/handles to reshape.
 * Click-drag on the fill (not a node) moves the whole shape. Geometry is the
 * original cubic Bézier path from Figma.
 */
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import { playHeroSoundOnClick } from "../../lib/heroSounds";
import {
  cloneSubpaths,
  cubicsToPath,
  handlesForAnchor,
  moveAnchor,
  moveHandle,
  nodesFromSubpaths,
  pointsBounds,
} from "./blobPath";
import type { LiveBlobNode } from "./blobPath";
import type { BlobNode, BlobSubpath } from "./editableBlobs";

const NODE_RADIUS = 2.5;
const NODE_HIT = 6;
const HANDLE_RADIUS = 2;
const HANDLE_HIT = 5.5;
const NODE_HOVER_SCALE = 1.5;
const PAD = NODE_HIT * NODE_HOVER_SCALE + 4;
const REVEAL_MS = 200;
const MOVE_EPSILON = 0.35;

type DragKind = "anchor" | "in" | "out" | "shape";

interface Props {
  id: string;
  color: string;
  subpaths: BlobSubpath[];
  nodes: BlobNode[];
  /** Viewport centre of the blob, in CSS pixels. */
  cx: number;
  cy: number;
  scale: number;
  appearDelayMs?: number;
  /** Parent scene handles entrance — skip per-blob fade. */
  skipAppear?: boolean;
  /** Idle invite pulse when the user hasn't interacted yet. */
  nudged?: boolean;
  onInteract?: () => void;
  onChange?: (subpaths: BlobSubpath[]) => void;
}

export default function EditableBlob({
  id,
  color,
  subpaths: initialSubpaths,
  nodes: initialNodes,
  cx,
  cy,
  scale,
  appearDelayMs = 0,
  skipAppear = false,
  nudged = false,
  onInteract,
  onChange,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const subpathsRef = useRef(cloneSubpaths(initialSubpaths));
  const [pathD, setPathD] = useState(() => cubicsToPath(initialSubpaths));
  // Narrow to BlobNode at the boundary. The authored nodes carry `ringLength`,
  // which nothing here reads and which nodesFromSubpaths() cannot reproduce —
  // keeping it in the state type made every post-drag update a type error.
  const [nodes, setNodes] = useState<LiveBlobNode[]>(() =>
    initialNodes.map(({ x, y, subIndex, anchorIndex }) => ({
      x,
      y,
      subIndex,
      anchorIndex,
    })),
  );
  const [revealed, setRevealed] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [handleTick, setHandleTick] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [draggingShape, setDraggingShape] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [appeared, setAppeared] = useState(reducedMotion || skipAppear);
  const [boundsVersion, setBoundsVersion] = useState(0);
  // Fixed local-space anchor so reshaping expands the SVG without recentering
  // the whole blob (which looked like it was being pushed away from neighbours).
  const anchorRef = useRef<{ x: number; y: number } | null>(null);

  const pathRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const inHandleRef = useRef<SVGCircleElement | null>(null);
  const outHandleRef = useRef<SVGCircleElement | null>(null);
  const inLineRef = useRef<SVGLineElement | null>(null);
  const outLineRef = useRef<SVGLineElement | null>(null);
  const dragIndex = useRef(-1);
  const dragKind = useRef<DragKind>("anchor");
  const offsetRef = useRef({ x: 0, y: 0 });
  const shapeDragRef = useRef<{
    clientX: number;
    clientY: number;
    originX: number;
    originY: number;
    baseLeft: number;
    baseTop: number;
  } | null>(null);
  const rafId = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reducedMotion || skipAppear) {
      setAppeared(true);
      return;
    }
    const timer = window.setTimeout(() => setAppeared(true), appearDelayMs);
    return () => window.clearTimeout(timer);
  }, [appearDelayMs, reducedMotion, skipAppear]);

  const bounds = pointsBounds(subpathsRef.current, PAD / scale);
  if (!anchorRef.current) {
    anchorRef.current = {
      x: bounds.minX + bounds.width / 2,
      y: bounds.minY + bounds.height / 2,
    };
  }
  const anchor = anchorRef.current;

  const baseLeft = cx - (anchor.x - bounds.minX) * scale;
  const baseTop = cy - (anchor.y - bounds.minY) * scale;

  const localFromClient = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / scale + bounds.minX,
      y: (clientY - rect.top) / scale + bounds.minY,
    };
  };

  const syncHandleDom = (nodeIndex: number) => {
    const node = nodes[nodeIndex];
    if (!node) return;
    const handles = handlesForAnchor(subpathsRef.current, node.subIndex, node.anchorIndex);
    if (!handles) return;

    inHandleRef.current?.setAttribute("cx", String(handles.inX));
    inHandleRef.current?.setAttribute("cy", String(handles.inY));
    outHandleRef.current?.setAttribute("cx", String(handles.outX));
    outHandleRef.current?.setAttribute("cy", String(handles.outY));
    inLineRef.current?.setAttribute("x1", String(handles.ax));
    inLineRef.current?.setAttribute("y1", String(handles.ay));
    inLineRef.current?.setAttribute("x2", String(handles.inX));
    inLineRef.current?.setAttribute("y2", String(handles.inY));
    outLineRef.current?.setAttribute("x1", String(handles.ax));
    outLineRef.current?.setAttribute("y1", String(handles.ay));
    outLineRef.current?.setAttribute("x2", String(handles.outX));
    outLineRef.current?.setAttribute("y2", String(handles.outY));
  };

  const applyPending = () => {
    rafId.current = 0;
    const next = pending.current;
    const index = dragIndex.current;
    if (!next || index < 0) return;
    pending.current = null;

    const node = nodes[index];
    if (!node) return;

    const kind = dragKind.current;
    if (kind === "shape") return;

    if (kind === "anchor") {
      if (
        Math.abs(node.x - next.x) < MOVE_EPSILON &&
        Math.abs(node.y - next.y) < MOVE_EPSILON
      ) {
        return;
      }
      moveAnchor(subpathsRef.current, node.subIndex, node.anchorIndex, next.x, next.y);
      node.x = next.x;
      node.y = next.y;

      const circle = nodeRefs.current[index];
      if (circle) {
        circle.setAttribute("cx", String(next.x));
        circle.setAttribute("cy", String(next.y));
      }
      const hit = circle?.previousElementSibling as SVGCircleElement | null;
      if (hit?.tagName === "circle") {
        hit.setAttribute("cx", String(next.x));
        hit.setAttribute("cy", String(next.y));
      }
      syncHandleDom(index);
    } else {
      const handles = handlesForAnchor(
        subpathsRef.current,
        node.subIndex,
        node.anchorIndex,
      );
      if (!handles) return;
      const curX = kind === "in" ? handles.inX : handles.outX;
      const curY = kind === "in" ? handles.inY : handles.outY;
      if (
        Math.abs(curX - next.x) < MOVE_EPSILON &&
        Math.abs(curY - next.y) < MOVE_EPSILON
      ) {
        return;
      }
      moveHandle(
        subpathsRef.current,
        node.subIndex,
        node.anchorIndex,
        kind,
        next.x,
        next.y,
      );
      syncHandleDom(index);
    }

    const d = cubicsToPath(subpathsRef.current);
    const path = pathRef.current;
    if (path) path.setAttribute("d", d);
  };

  const scheduleApply = () => {
    if (rafId.current === 0) rafId.current = requestAnimationFrame(applyPending);
  };

  const endNodeDrag = () => {
    if (dragIndex.current < 0) return;
    dragIndex.current = -1;
    setDragging(false);
    const d = cubicsToPath(subpathsRef.current);
    setPathD(d);
    setNodes(nodesFromSubpaths(subpathsRef.current));
    setHandleTick((v) => v + 1);
    setBoundsVersion((v) => v + 1);
    onChange?.(cloneSubpaths(subpathsRef.current));
  };

  const endShapeDrag = () => {
    if (!shapeDragRef.current) return;
    shapeDragRef.current = null;
    setOffset({ ...offsetRef.current });
    setDragging(false);
    setDraggingShape(false);
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const shapeDrag = shapeDragRef.current;
      if (shapeDrag) {
        const nx = shapeDrag.originX + (event.clientX - shapeDrag.clientX);
        const ny = shapeDrag.originY + (event.clientY - shapeDrag.clientY);
        offsetRef.current = { x: nx, y: ny };
        const svg = svgRef.current;
        if (svg) {
          svg.style.left = `${shapeDrag.baseLeft + nx}px`;
          svg.style.top = `${shapeDrag.baseTop + ny}px`;
        }
        return;
      }

      if (dragIndex.current < 0) return;
      pending.current = localFromClient(event.clientX, event.clientY);
      scheduleApply();
    };

    const onUp = () => {
      if (shapeDragRef.current) {
        endShapeDrag();
        return;
      }
      endNodeDrag();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds.minX, bounds.minY, scale, boundsVersion]);

  useEffect(() => {
    if (!revealed && !dragging) return;

    const onOutside = (event: PointerEvent) => {
      if (dragging) return;
      const target = event.target as Element | null;
      if (target?.closest?.(`[data-blob-id="${id}"]`)) return;
      setRevealed(false);
      setActiveNode(null);
    };

    window.addEventListener("pointerdown", onOutside);
    return () => window.removeEventListener("pointerdown", onOutside);
  }, [revealed, dragging, id]);

  const onPathEnter = () => {
    setRevealed(true);
    onInteract?.();
  };
  const onPathLeave = (event: React.PointerEvent) => {
    if (dragging) return;
    const related = event.relatedTarget as Element | null;
    if (related?.closest?.(`[data-blob-id="${id}"]`)) return;
    setRevealed(false);
    setActiveNode(null);
  };

  const startNodeDrag = (
    index: number,
    kind: Exclude<DragKind, "shape">,
    event: React.PointerEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onInteract?.();
    playHeroSoundOnClick("press", "blob-press");
    dragIndex.current = index;
    dragKind.current = kind;
    setDragging(true);
    setDraggingShape(false);
    setRevealed(true);
    setActiveNode(index);
    (event.target as Element).setPointerCapture?.(event.pointerId);
  };

  const startShapeDrag = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onInteract?.();
    playHeroSoundOnClick("press", "blob-press");
    dragKind.current = "shape";
    dragIndex.current = -1;
    shapeDragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
      baseLeft,
      baseTop,
    };
    setDragging(true);
    setDraggingShape(true);
    setRevealed(true);
    setActiveNode(null);
    (event.target as Element).setPointerCapture?.(event.pointerId);
  };

  const svgWidth = bounds.width * scale;
  const svgHeight = bounds.height * scale;
  const left = baseLeft + offset.x;
  const top = baseTop + offset.y;
  const showNodes = revealed || dragging;
  const transition = reducedMotion
    ? "none"
    : `opacity ${REVEAL_MS}ms ease, transform ${REVEAL_MS}ms ease`;

  const active =
    activeNode != null
      ? (() => {
          const node = nodes[activeNode];
          if (!node) return null;
          // handleTick forces a re-read after edits.
          void handleTick;
          return handlesForAnchor(subpathsRef.current, node.subIndex, node.anchorIndex);
        })()
      : null;

  return (
    <svg
      ref={svgRef}
      data-blob-id={id}
      className={`editable-blob${nudged ? " is-idle-nudge" : ""}`}
      aria-hidden="true"
      width={svgWidth}
      height={svgHeight}
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        opacity: appeared ? 1 : 0,
        transition: reducedMotion
          ? undefined
          : `opacity 420ms ease-out ${appearDelayMs}ms`,
        pointerEvents: "none",
        mixBlendMode: "multiply",
        zIndex: dragging || activeNode != null ? 5 : 1,
      }}
    >
      <path
        ref={pathRef}
        d={pathD}
        fill={color}
        fillRule="evenodd"
        style={{
          pointerEvents: "auto",
          cursor: draggingShape ? "grabbing" : "grab",
          touchAction: "none",
          transition: reducedMotion ? undefined : `filter ${REVEAL_MS}ms ease`,
          filter: showNodes ? "brightness(1.04)" : "none",
        }}
        onPointerEnter={onPathEnter}
        onPointerLeave={onPathLeave}
        onPointerDown={startShapeDrag}
      />

      <g
        style={{
          opacity: showNodes ? 1 : 0,
          pointerEvents: showNodes ? "auto" : "none",
          transition,
        }}
      >
        {nodes.map((point, index) => {
          const hot =
            activeNode === index || (dragging && !draggingShape && dragIndex.current === index);
          const hitR = (NODE_HIT * (hot ? NODE_HOVER_SCALE : 1)) / scale;
          const nodeR = (NODE_RADIUS * (hot ? NODE_HOVER_SCALE : 1)) / scale;
          return (
            <g
              key={`${point.subIndex}-${point.anchorIndex}`}
              onPointerEnter={() => setActiveNode(index)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={hitR}
                fill="transparent"
                style={{ cursor: "pointer", pointerEvents: "auto", touchAction: "none" }}
                onPointerDown={(event) => startNodeDrag(index, "anchor", event)}
              />
              <circle
                ref={(el) => {
                  nodeRefs.current[index] = el;
                }}
                cx={point.x}
                cy={point.y}
                r={nodeR}
                fill="#ffffff"
                stroke="#1d1d1b"
                strokeWidth={1.5 / scale}
                style={{ pointerEvents: "none" }}
              />
            </g>
          );
        })}
      </g>

      {active && activeNode != null && showNodes && (
        <g
          style={{
            pointerEvents: "auto",
            opacity: 1,
            transition: reducedMotion ? undefined : `opacity ${REVEAL_MS}ms ease`,
          }}
          onPointerLeave={(event) => {
            if (dragging) return;
            const related = event.relatedTarget as Element | null;
            if (related?.closest?.(`[data-blob-id="${id}"]`)) return;
            setActiveNode(null);
          }}
        >
          <line
            ref={inLineRef}
            x1={active.ax}
            y1={active.ay}
            x2={active.inX}
            y2={active.inY}
            stroke="#1d1d1b"
            strokeWidth={1 / scale}
            strokeOpacity={0.55}
            style={{ pointerEvents: "none" }}
          />
          <line
            ref={outLineRef}
            x1={active.ax}
            y1={active.ay}
            x2={active.outX}
            y2={active.outY}
            stroke="#1d1d1b"
            strokeWidth={1 / scale}
            strokeOpacity={0.55}
            style={{ pointerEvents: "none" }}
          />
          <circle
            cx={active.inX}
            cy={active.inY}
            r={HANDLE_HIT / scale}
            fill="transparent"
            style={{ cursor: "pointer", pointerEvents: "auto", touchAction: "none" }}
            onPointerDown={(event) => startNodeDrag(activeNode, "in", event)}
          />
          <circle
            ref={inHandleRef}
            cx={active.inX}
            cy={active.inY}
            r={HANDLE_RADIUS / scale}
            fill="#ffffff"
            stroke="#1d1d1b"
            strokeWidth={1.25 / scale}
            style={{ pointerEvents: "none" }}
          />
          <circle
            cx={active.outX}
            cy={active.outY}
            r={HANDLE_HIT / scale}
            fill="transparent"
            style={{ cursor: "pointer", pointerEvents: "auto", touchAction: "none" }}
            onPointerDown={(event) => startNodeDrag(activeNode, "out", event)}
          />
          <circle
            ref={outHandleRef}
            cx={active.outX}
            cy={active.outY}
            r={HANDLE_RADIUS / scale}
            fill="#ffffff"
            stroke="#1d1d1b"
            strokeWidth={1.25 / scale}
            style={{ pointerEvents: "none" }}
          />
        </g>
      )}
    </svg>
  );
}
