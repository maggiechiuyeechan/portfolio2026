import type { BlobSubpath, CubicSegment } from "./editableBlobs";

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

/** Serialise cubic subpaths back to an SVG path `d` string. */
export function cubicsToPath(subpaths: BlobSubpath[]): string {
  let d = "";
  for (const sp of subpaths) {
    if (sp.segments.length === 0) continue;
    const first = sp.segments[0]!;
    d += `M${round(first.x0)} ${round(first.y0)}`;
    for (const s of sp.segments) {
      d += `C${round(s.x1)} ${round(s.y1)} ${round(s.x2)} ${round(s.y2)} ${round(s.x)} ${round(s.y)}`;
    }
    if (sp.closed) d += "Z";
  }
  return d;
}

/**
 * Move an on-curve anchor, dragging its neighbouring Bézier handles with it so
 * the local curve shape stays intact.
 */
export function moveAnchor(
  subpaths: BlobSubpath[],
  subIndex: number,
  anchorIndex: number,
  x: number,
  y: number,
): void {
  const sp = subpaths[subIndex];
  if (!sp || sp.segments.length === 0) return;

  const n = sp.segments.length;
  const i = ((anchorIndex % n) + n) % n;
  const prev = (i - 1 + n) % n;
  const seg = sp.segments[i]!;
  const prevSeg = sp.segments[prev]!;

  const dx = x - seg.x0;
  const dy = y - seg.y0;
  if (dx === 0 && dy === 0) return;

  seg.x0 += dx;
  seg.y0 += dy;
  seg.x1 += dx;
  seg.y1 += dy;

  prevSeg.x += dx;
  prevSeg.y += dy;
  prevSeg.x2 += dx;
  prevSeg.y2 += dy;
}

/** In/out Bézier control points for an on-curve anchor. */
export function handlesForAnchor(
  subpaths: BlobSubpath[],
  subIndex: number,
  anchorIndex: number,
): { ax: number; ay: number; inX: number; inY: number; outX: number; outY: number } | null {
  const sp = subpaths[subIndex];
  if (!sp || sp.segments.length === 0) return null;

  const n = sp.segments.length;
  const i = ((anchorIndex % n) + n) % n;
  const prev = (i - 1 + n) % n;
  const seg = sp.segments[i]!;
  const prevSeg = sp.segments[prev]!;

  return {
    ax: seg.x0,
    ay: seg.y0,
    inX: prevSeg.x2,
    inY: prevSeg.y2,
    outX: seg.x1,
    outY: seg.y1,
  };
}

/**
 * Move one Bézier handle of an anchor independently (Illustrator-style free handle).
 * `which: "in"` is the incoming control (prev segment's x2/y2);
 * `which: "out"` is the outgoing control (this segment's x1/y1).
 */
export function moveHandle(
  subpaths: BlobSubpath[],
  subIndex: number,
  anchorIndex: number,
  which: "in" | "out",
  x: number,
  y: number,
): void {
  const sp = subpaths[subIndex];
  if (!sp || sp.segments.length === 0) return;

  const n = sp.segments.length;
  const i = ((anchorIndex % n) + n) % n;
  const prev = (i - 1 + n) % n;

  if (which === "out") {
    const seg = sp.segments[i]!;
    seg.x1 = x;
    seg.y1 = y;
  } else {
    const prevSeg = sp.segments[prev]!;
    prevSeg.x2 = x;
    prevSeg.y2 = y;
  }
}

/** Deep-clone subpath geometry so each blob instance can be edited independently. */
export function cloneSubpaths(subpaths: BlobSubpath[]): BlobSubpath[] {
  return subpaths.map((sp) => ({
    closed: sp.closed,
    segments: sp.segments.map(
      (s): CubicSegment => ({
        x0: s.x0,
        y0: s.y0,
        x1: s.x1,
        y1: s.y1,
        x2: s.x2,
        y2: s.y2,
        x: s.x,
        y: s.y,
      }),
    ),
  }));
}

/**
 * An on-curve anchor as the editor tracks it while dragging. Deliberately
 * narrower than the authored `BlobNode` in `editableBlobs.ts`, which also
 * carries `ringLength` — that field describes the source ring and cannot be
 * recovered from live subpaths, so it is dropped at this boundary rather
 * than faked.
 */
export interface LiveBlobNode {
  x: number;
  y: number;
  subIndex: number;
  anchorIndex: number;
}

export function nodesFromSubpaths(subpaths: BlobSubpath[]): LiveBlobNode[] {
  const nodes: LiveBlobNode[] = [];
  subpaths.forEach((sp, subIndex) => {
    sp.segments.forEach((seg, anchorIndex) => {
      nodes.push({ x: seg.x0, y: seg.y0, subIndex, anchorIndex });
    });
  });
  return nodes;
}

export function pointsBounds(
  subpaths: BlobSubpath[],
  pad = 0,
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const consider = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  for (const sp of subpaths) {
    for (const s of sp.segments) {
      consider(s.x0, s.y0);
      consider(s.x1, s.y1);
      consider(s.x2, s.y2);
      consider(s.x, s.y);
    }
  }

  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}
