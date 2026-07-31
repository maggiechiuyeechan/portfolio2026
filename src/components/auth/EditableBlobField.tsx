/**
 * Version N — organic blob shapes packed around the hero text with hover-reveal
 * editable control nodes (and per-node Bézier handles). Drag the fill to move a
 * shape; drag a node/handle to reshape. Shapes may repeat, but the initial layout
 * never overlaps — the user can create overlaps only by editing. Placement is
 * computed once on mount / resize.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import EditableBlob from "./EditableBlob";
import { EDITABLE_BLOBS, type EditableBlobDef } from "./editableBlobs";
import { cloneSubpaths } from "./blobPath";
import { IDLE_NUDGE_SCALE } from "../../lib/idleNudgeScale";
import { getSceneFrameBounds } from "../../lib/sceneFrame";
import { useIdleNudge } from "../../lib/useIdleNudge";

const TEXT_PAD = 18;
/**
 * Target fraction of the viewport covered by non-overlapping packing circles.
 * Kept moderate — circle packing without overlap can't fill the screen solid.
 */
/** Baseline coverage at ~1280×800; large viewports scale up via viewportPackTargets. */
const TARGET_COVERAGE = 0.58;
const MIN_SCALE = 0.8;
const MAX_SCALE = 2.9;
const COMFORT_SCALE = 0.88;
/** Uniform size boost applied to every shape on the initial layout (~2.5× art size). */
const SIZE_MULTIPLIER = 2.5;
const PACK_ITERS = 110;
const CANDIDATES = 100;
/**
 * Packing radius = art circumradius × scale × this.
 * Must stay ≥ 1 so initial draws never visually overlap; editing may still overlap.
 */
const RADIUS_FACTOR = 1.02;
/** Minimum gap between packing circles on the initial layout. */
const GAP = 3;
const MIN_PIECES = 10;
/** Piece budget at the reference viewport (~1280×800). */
const BASE_MAX_PIECES = 22;
/** Hard cap so very wide monitors stay performant. */
const ABSOLUTE_MAX_PIECES = 48;
const REF_VIEWPORT_AREA = 1280 * 800;

interface PackTargets {
  maxPieces: number;
  targetCoverage: number;
}

/** Larger screens get more shapes and slightly higher coverage. */
function viewportPackTargets(vw: number, vh: number): PackTargets {
  const areaRatio = (vw * vh) / REF_VIEWPORT_AREA;
  const maxPieces = Math.min(
    ABSOLUTE_MAX_PIECES,
    Math.max(MIN_PIECES, Math.round(BASE_MAX_PIECES * Math.sqrt(areaRatio))),
  );
  const targetCoverage = Math.min(
    0.68,
    TARGET_COVERAGE + 0.1 * Math.min(1, (areaRatio - 1) / 1.5),
  );
  return { maxPieces, targetCoverage };
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Placement {
  def: EditableBlobDef;
  instanceId: string;
  cx: number;
  cy: number;
  scale: number;
  radius: number;
}

interface Props {
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
  variants?: Variants;
}

function measureZones(refs: React.RefObject<HTMLElement | null>[]): Rect[] {
  const zones: Rect[] = [];
  for (const ref of refs) {
    const el = ref.current;
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    zones.push({
      left: rect.left - TEXT_PAD,
      top: rect.top - TEXT_PAD,
      right: rect.right + TEXT_PAD,
      bottom: rect.bottom + TEXT_PAD,
    });
  }
  return zones;
}

function circleHitsRect(cx: number, cy: number, r: number, zone: Rect) {
  const closestX = Math.max(zone.left, Math.min(cx, zone.right));
  const closestY = Math.max(zone.top, Math.min(cy, zone.bottom));
  return Math.hypot(cx - closestX, cy - closestY) < r;
}

function overlapsAny(cx: number, cy: number, r: number, placed: Placement[]) {
  for (const other of placed) {
    const minDist = r + other.radius + GAP;
    if (Math.hypot(cx - other.cx, cy - other.cy) < minDist) return true;
  }
  return false;
}

function hitsText(cx: number, cy: number, r: number, zones: Rect[]) {
  return zones.some((zone) => circleHitsRect(cx, cy, r, zone));
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/** One of each shape, then random repeats until the viewport needs that many pieces. */
function buildPool(
  vw: number,
  vh: number,
  targets: PackTargets,
): { def: EditableBlobDef; instanceId: string }[] {
  const avgR2 =
    EDITABLE_BLOBS.reduce((s, b) => s + b.radius * b.radius, 0) / EDITABLE_BLOBS.length;
  const comfortR = Math.sqrt(avgR2) * COMFORT_SCALE * SIZE_MULTIPLIER * RADIUS_FACTOR;
  const targetCount = Math.min(
    targets.maxPieces,
    Math.max(
      MIN_PIECES,
      Math.round((targets.targetCoverage * vw * vh) / (Math.PI * comfortR * comfortR)),
    ) + 1,
  );

  const counts = new Map<string, number>();
  const pool: { def: EditableBlobDef; instanceId: string }[] = [];

  const push = (def: EditableBlobDef) => {
    const n = counts.get(def.id) ?? 0;
    counts.set(def.id, n + 1);
    pool.push({ def, instanceId: `${def.id}-${n}` });
  };

  for (const def of shuffle(EDITABLE_BLOBS)) push(def);

  const extras = shuffle(EDITABLE_BLOBS);
  let i = 0;
  while (pool.length < targetCount) {
    push(extras[i % extras.length]!);
    i += 1;
  }

  return pool.sort((a, b) => b.def.radius - a.def.radius);
}

function packBlobs(vw: number, vh: number, zones: Rect[]): Placement[] {
  const area = vw * vh;
  const targets = viewportPackTargets(vw, vh);
  const pool = buildPool(vw, vh, targets);
  const sumR2 = pool.reduce((s, p) => s + p.def.radius * p.def.radius, 0);
  // Packing uses artRadius × scale × RADIUS_FACTOR; solve scale so circle coverage ≈ target.
  // Pool size already accounts for SIZE_MULTIPLIER, so shapes land at the boosted size.
  let globalScale =
    Math.sqrt((targets.targetCoverage * area) / (Math.PI * sumR2)) / RADIUS_FACTOR;
  globalScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, globalScale));

  const tryPlace = (
    placed: Placement[],
    def: EditableBlobDef,
    instanceId: string,
    cx: number,
    cy: number,
    localScale: number,
  ) => {
    const radius = def.radius * localScale * RADIUS_FACTOR;
    if (cx < radius * 0.15 || cy < radius * 0.15) return false;
    if (cx > vw - radius * 0.15 || cy > vh - radius * 0.15) return false;
    if (hitsText(cx, cy, radius, zones)) return false;
    if (overlapsAny(cx, cy, radius, placed)) return false;
    placed.push({ def, instanceId, cx, cy, scale: localScale, radius });
    return true;
  };

  const pickCandidate = (
    placed: Placement[],
    radius: number,
  ): { cx: number; cy: number } => {
    if (placed.length === 0 || Math.random() < 0.22) {
      if (zones.length > 0) {
        const zone = zones[Math.floor(Math.random() * zones.length)]!;
        const midX = (zone.left + zone.right) / 2;
        const midY = (zone.top + zone.bottom) / 2;
        const angle = Math.random() * Math.PI * 2;
        const nest =
          Math.max(zone.right - zone.left, zone.bottom - zone.top) * 0.42 +
          radius +
          Math.random() * radius * 0.5;
        return {
          cx: midX + Math.cos(angle) * nest,
          cy: midY + Math.sin(angle) * nest,
        };
      }
      return {
        cx: radius + Math.random() * (vw - radius * 2),
        cy: radius + Math.random() * (vh - radius * 2),
      };
    }

    const anchor = placed[Math.floor(Math.random() * placed.length)]!;
    const angle = Math.random() * Math.PI * 2;
    const dist = anchor.radius + radius + GAP;
    return {
      cx: anchor.cx + Math.cos(angle) * dist,
      cy: anchor.cy + Math.sin(angle) * dist,
    };
  };

  const attemptPack = (scale: number): Placement[] => {
    const placed: Placement[] = [];

    for (const item of pool) {
      const radius = item.def.radius * scale * RADIUS_FACTOR;
      let seated = false;

      for (let i = 0; i < CANDIDATES && !seated; i++) {
        const { cx, cy } = pickCandidate(placed, radius);
        seated = tryPlace(placed, item.def, item.instanceId, cx, cy, scale);
      }

      if (!seated) {
        const step = Math.max(20, radius * 0.45);
        outer: for (let y = radius * 0.4; y <= vh - radius * 0.4; y += step) {
          for (let x = radius * 0.4; x <= vw - radius * 0.4; x += step) {
            if (tryPlace(placed, item.def, item.instanceId, x, y, scale)) {
              seated = true;
              break outer;
            }
          }
        }
      }
      // Skip pieces that still won't fit — denser pack with repeats doesn't need every one.
    }

    return placed;
  };

  let best: Placement[] = [];
  for (let step = 0; step < 8; step++) {
    const next = attemptPack(globalScale * 0.9 ** step);
    if (next.length > best.length) best = next;
    if (next.length >= pool.length * 0.85) {
      best = next;
      break;
    }
  }

  // Fill leftover gaps with more repeats at the scale of the best pack.
  const fillScale =
    best.length > 0
      ? best.reduce((s, p) => s + p.scale, 0) / best.length
      : globalScale * 0.7;
  const used = new Set(best.map((p) => p.instanceId));
  let fillGuard = 0;
  while (best.length < targets.maxPieces && fillGuard < targets.maxPieces * 8) {
    fillGuard += 1;
    const def = EDITABLE_BLOBS[Math.floor(Math.random() * EDITABLE_BLOBS.length)]!;
    let n = 0;
    let instanceId = `${def.id}-fill-${n}`;
    while (used.has(instanceId)) {
      n += 1;
      instanceId = `${def.id}-fill-${n}`;
    }
    const radius = def.radius * fillScale * RADIUS_FACTOR;
    let seated = false;
    for (let i = 0; i < CANDIDATES && !seated; i++) {
      const { cx, cy } = pickCandidate(best, radius);
      if (tryPlace(best, def, instanceId, cx, cy, fillScale)) {
        used.add(instanceId);
        seated = true;
      }
    }
    if (!seated) break;
  }

  const placed = best;

  // Relaxation: push apart anything that drifted into overlap; light clustering only when clear.
  for (let iter = 0; iter < PACK_ITERS; iter++) {
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i]!;
      let fx = 0;
      let fy = 0;

      for (let j = 0; j < placed.length; j++) {
        if (i === j) continue;
        const b = placed[j]!;
        const dx = a.cx - b.cx;
        const dy = a.cy - b.cy;
        const dist = Math.hypot(dx, dy) || 0.001;
        const min = a.radius + b.radius + GAP;
        if (dist < min) {
          const push = ((min - dist) / dist) * 0.55;
          fx += dx * push;
          fy += dy * push;
        } else if (dist < min + 24) {
          const pull = ((dist - min) / dist) * 0.06;
          fx -= dx * pull;
          fy -= dy * pull;
        }
      }

      for (const zone of zones) {
        if (circleHitsRect(a.cx, a.cy, a.radius, zone)) {
          const midX = (zone.left + zone.right) / 2;
          const midY = (zone.top + zone.bottom) / 2;
          const dx = a.cx - midX;
          const dy = a.cy - midY;
          const dist = Math.hypot(dx, dy) || 0.001;
          fx += (dx / dist) * 6;
          fy += (dy / dist) * 6;
        } else {
          const midX = (zone.left + zone.right) / 2;
          const midY = (zone.top + zone.bottom) / 2;
          const dx = midX - a.cx;
          const dy = midY - a.cy;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist > a.radius + 100) {
            fx += (dx / dist) * 0.25;
            fy += (dy / dist) * 0.25;
          }
        }
      }

      a.cx = Math.min(vw - a.radius * 0.15, Math.max(a.radius * 0.15, a.cx + fx));
      a.cy = Math.min(vh - a.radius * 0.15, Math.max(a.radius * 0.15, a.cy + fy));
    }
  }

  // Hard separation passes — initial draw must not overlap.
  for (let pass = 0; pass < 24; pass++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!;
        const b = placed[j]!;
        const dx = a.cx - b.cx;
        const dy = a.cy - b.cy;
        const dist = Math.hypot(dx, dy) || 0.001;
        const min = a.radius + b.radius + GAP;
        if (dist >= min) continue;
        const push = (min - dist) / 2;
        const ux = dx / dist;
        const uy = dy / dist;
        a.cx += ux * push;
        a.cy += uy * push;
        b.cx -= ux * push;
        b.cy -= uy * push;
      }
    }
    for (const a of placed) {
      for (const zone of zones) {
        if (!circleHitsRect(a.cx, a.cy, a.radius, zone)) continue;
        const midX = (zone.left + zone.right) / 2;
        const midY = (zone.top + zone.bottom) / 2;
        const dx = a.cx - midX;
        const dy = a.cy - midY;
        const dist = Math.hypot(dx, dy) || 0.001;
        a.cx += (dx / dist) * 4;
        a.cy += (dy / dist) * 4;
      }
      a.cx = Math.min(vw - a.radius * 0.15, Math.max(a.radius * 0.15, a.cx));
      a.cy = Math.min(vh - a.radius * 0.15, Math.max(a.radius * 0.15, a.cy));
    }
  }

  return placed;
}

/** Blob centers inside the clipped scene frame — nudges in the mat inset are invisible. */
function nudgeablePlacementIds(placements: Placement[], vw: number, vh: number) {
  if (placements.length === 0) return [];
  const frame = getSceneFrameBounds(vw, vh);
  const visible = placements.filter((placement) => {
    const margin = placement.radius * IDLE_NUDGE_SCALE;
    return (
      placement.cx >= frame.left + margin &&
      placement.cx <= frame.right - margin &&
      placement.cy >= frame.top + margin &&
      placement.cy <= frame.bottom - margin
    );
  });
  return (visible.length > 0 ? visible : placements).map((p) => p.instanceId);
}

export default function EditableBlobField({ obstacleRefs = [], variants }: Props) {
  const [mounted, setMounted] = useState(false);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const layoutKey = useRef(0);
  const nudgeIds = useMemo(() => {
    if (typeof window === "undefined" || placements.length === 0) return [];
    return nudgeablePlacementIds(placements, window.innerWidth, window.innerHeight);
  }, [placements]);
  const { nudgeId, noteInteraction } = useIdleNudge(
    nudgeIds,
    mounted && nudgeIds.length > 0,
  );
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    let resizeTimer = 0;

    const layout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const zones = measureZones(obstacleRefs);
      const next = packBlobs(vw, vh, zones);
      layoutKey.current += 1;
      setPlacements(next);
    };

    const boot = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(layout);
    });

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 160);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(boot);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, obstacleRefs]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="editable-blob-field"
      aria-hidden="true"
      variants={variants}
      initial={variants ? "hidden" : false}
      animate={variants ? "visible" : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "var(--color-gray-1)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {placements.map((placement, index) => (
          <EditableBlob
            key={`${layoutKey.current}-${placement.instanceId}`}
            id={placement.instanceId}
            color={placement.def.color}
            subpaths={cloneSubpaths(placement.def.subpaths)}
            nodes={placement.def.nodes}
            cx={placement.cx}
            cy={placement.cy}
            scale={placement.scale}
            appearDelayMs={variants ? 0 : Math.min(index * 28, 700)}
            skipAppear={!!variants}
            nudged={nudgeId === placement.instanceId}
            onInteract={noteInteraction}
          />
        ))}
      </div>
    </motion.div>,
    document.body,
  );
}
