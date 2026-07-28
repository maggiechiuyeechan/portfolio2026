/**
 * Figma node 354:105 — Version B icon blocks (360×360, 60px radius).
 */
export interface BlockDef {
  id: string;
  color: string;
  src: string;
}

/** Icon and corner radius relative to block size in Figma. */
export const BLOCK_ICON_RATIO = 200 / 360;
export const BLOCK_RADIUS_RATIO = 60 / 360;

export const BLOCKS: BlockDef[] = [
  { id: "block-45", color: "#1641e1", src: "/images/blocks/block-45.svg" },
  { id: "block-49", color: "#dbd4dd", src: "/images/blocks/block-49.svg" },
  { id: "block-53", color: "#f97be2", src: "/images/blocks/block-53.svg" },
  { id: "block-59", color: "#ffcb02", src: "/images/blocks/block-59.svg" },
  { id: "block-101", color: "#fd330c", src: "/images/blocks/block-101.svg" },
  { id: "block-63", color: "#791bc2", src: "/images/blocks/block-63.svg" },
  { id: "block-64", color: "#041e84", src: "/images/blocks/block-64.svg" },
  { id: "block-71", color: "#fb6d06", src: "/images/blocks/block-71.svg" },
  { id: "block-73", color: "#00d126", src: "/images/blocks/block-73.svg" },
  { id: "block-76", color: "#fb6d06", src: "/images/blocks/block-76.svg" },
  { id: "block-81", color: "#00d126", src: "/images/blocks/block-81.svg" },
  { id: "block-75", color: "#38a8eb", src: "/images/blocks/block-75.svg" },
  { id: "block-82", color: "#dbd4dd", src: "/images/blocks/block-82.svg" },
  { id: "block-83", color: "#38a8eb", src: "/images/blocks/block-83.svg" },
  { id: "block-84", color: "#1641e1", src: "/images/blocks/block-84.svg" },
  { id: "block-85", color: "#f97be2", src: "/images/blocks/block-85.svg" },
  { id: "block-86", color: "#ffcb02", src: "/images/blocks/block-86.svg" },
  { id: "block-87", color: "#fd330c", src: "/images/blocks/block-87.svg" },
  { id: "block-88", color: "#dbd4dd", src: "/images/blocks/block-88.svg" },
  { id: "block-89", color: "#f97be2", src: "/images/blocks/block-89.svg" },
  { id: "block-90", color: "#ffcb02", src: "/images/blocks/block-90.svg" },
  { id: "block-92", color: "#fd330c", src: "/images/blocks/block-92.svg" },
  { id: "block-95", color: "#791bc2", src: "/images/blocks/block-95.svg" },
  { id: "block-96", color: "#041e84", src: "/images/blocks/block-96.svg" },
  { id: "block-97", color: "#fb6d06", src: "/images/blocks/block-97.svg" },
  { id: "block-98", color: "#00d126", src: "/images/blocks/block-98.svg" },
  { id: "block-99", color: "#1641e1", src: "/images/blocks/block-99.svg" },
  { id: "block-100", color: "#791bc2", src: "/images/blocks/block-100.svg" },
];

/** Version B — first 14 blocks, repeated twice (desktop). */
const BLOCKS_SPAWN_BASE = BLOCKS.slice(0, 14);
export const BLOCKS_SPAWN = [...BLOCKS_SPAWN_BASE, ...BLOCKS_SPAWN_BASE];
/** Version B — unique set only on mobile. */
export const BLOCKS_SPAWN_MOBILE = BLOCKS_SPAWN_BASE;

export const STATIC_TILE_POSES: Array<{
  tileId: string;
  x: number;
  y: number;
  angle: number;
}> = [
  { tileId: "block-84", x: 0.18, y: 0.78, angle: -0.22 },
  { tileId: "block-87", x: 0.34, y: 0.82, angle: 0.35 },
  { tileId: "block-49", x: 0.5, y: 0.8, angle: -0.12 },
  { tileId: "block-92", x: 0.66, y: 0.79, angle: 0.28 },
  { tileId: "block-53", x: 0.82, y: 0.76, angle: -0.4 },
  { tileId: "block-75", x: 0.42, y: 0.62, angle: 0.15 },
  { tileId: "block-45", x: 0.58, y: 0.6, angle: -0.3 },
  { tileId: "block-73", x: 0.74, y: 0.58, angle: 0.42 },
  { tileId: "block-71", x: 0.28, y: 0.58, angle: 0.08 },
  { tileId: "block-81", x: 0.52, y: 0.45, angle: -0.18 },
  { tileId: "block-100", x: 0.68, y: 0.42, angle: 0.55 },
  { tileId: "block-59", x: 0.38, y: 0.38, angle: -0.45 },
  { tileId: "block-85", x: 0.62, y: 0.32, angle: 0.2 },
  { tileId: "block-96", x: 0.48, y: 0.24, angle: -0.08 },
  { tileId: "block-63", x: 0.78, y: 0.28, angle: 0.38 },
];
