export type TilePattern =
  | "asterisk"
  | "sunburst"
  | "pie-chart"
  | "chart-column"
  | "offset-lines"
  | "horizontal-lines"
  | "waves"
  | "dots-grid"
  | "circle-x"
  | "vertical-lines"
  | "heart"
  | "sharp-asterisk"
  | "donut"
  | "arrow-up-right"
  | "hourglass";

export interface TileDef {
  id: string;
  color: string;
  pattern: TilePattern;
}

export const TILES: TileDef[] = [
  { id: "tile-0-0", color: "#ffb805", pattern: "asterisk" },
  { id: "tile-0-1", color: "#ff5e2b", pattern: "sunburst" },
  { id: "tile-0-2", color: "#ffa5c9", pattern: "pie-chart" },
  { id: "tile-0-3", color: "#1876d2", pattern: "chart-column" },
  { id: "tile-0-4", color: "#2d7d32", pattern: "offset-lines" },
  { id: "tile-1-0", color: "#1876d2", pattern: "horizontal-lines" },
  { id: "tile-1-1", color: "#2d7d32", pattern: "waves" },
  { id: "tile-1-2", color: "#ffb805", pattern: "dots-grid" },
  { id: "tile-1-3", color: "#ff5e2b", pattern: "circle-x" },
  { id: "tile-1-4", color: "#ffa5c9", pattern: "vertical-lines" },
  { id: "tile-2-0", color: "#ff5e2b", pattern: "heart" },
  { id: "tile-2-1", color: "#ffa5c9", pattern: "sharp-asterisk" },
  { id: "tile-2-2", color: "#1876d2", pattern: "donut" },
  { id: "tile-2-3", color: "#2d7d32", pattern: "arrow-up-right" },
  { id: "tile-2-4", color: "#ffb805", pattern: "hourglass" },
];

/** Approximate settled pile for reduced-motion fallback */
export const STATIC_TILE_POSES: Array<{
  tileId: string;
  x: number;
  y: number;
  angle: number;
}> = [
  { tileId: "tile-0-3", x: 0.18, y: 0.78, angle: -0.22 },
  { tileId: "tile-1-3", x: 0.34, y: 0.82, angle: 0.35 },
  { tileId: "tile-0-1", x: 0.5, y: 0.8, angle: -0.12 },
  { tileId: "tile-1-4", x: 0.66, y: 0.79, angle: 0.28 },
  { tileId: "tile-0-2", x: 0.82, y: 0.76, angle: -0.4 },
  { tileId: "tile-2-2", x: 0.42, y: 0.62, angle: 0.15 },
  { tileId: "tile-1-0", x: 0.58, y: 0.6, angle: -0.3 },
  { tileId: "tile-0-4", x: 0.74, y: 0.58, angle: 0.42 },
  { tileId: "tile-2-0", x: 0.28, y: 0.58, angle: 0.08 },
  { tileId: "tile-1-1", x: 0.52, y: 0.45, angle: -0.18 },
  { tileId: "tile-2-4", x: 0.68, y: 0.42, angle: 0.55 },
  { tileId: "tile-0-0", x: 0.38, y: 0.38, angle: -0.45 },
  { tileId: "tile-2-1", x: 0.62, y: 0.32, angle: 0.2 },
  { tileId: "tile-2-3", x: 0.48, y: 0.24, angle: -0.08 },
  { tileId: "tile-1-2", x: 0.78, y: 0.28, angle: 0.38 },
];
