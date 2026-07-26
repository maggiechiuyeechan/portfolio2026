import type { ShapeDef, StaticShapePose } from "./physicsShapes";

/** Figma node 297:95653 — 13 organic shapes */
export const SHAPES_E: ShapeDef[] = [
  {
    id: "shape-lime-fruit",
    src: "/images/shapes-ve/lime-fruit.svg",
    aspect: 126.468 / 124.789,
  },
  {
    id: "shape-orange-starburst",
    src: "/images/shapes-ve/orange-starburst.svg",
    aspect: 131.439 / 138.209,
  },
  {
    id: "shape-purple-pill",
    src: "/images/shapes-ve/purple-pill.svg",
    aspect: 84.107 / 43.184,
  },
  {
    id: "shape-black-line",
    src: "/images/shapes-ve/black-line.svg",
    aspect: 45.338 / 2.253,
  },
  {
    id: "shape-teal-eye",
    src: "/images/shapes-ve/teal-eye.svg",
    aspect: 52.829 / 53.198,
  },
  {
    id: "shape-mint-swirl",
    src: "/images/shapes-ve/mint-swirl.svg",
    aspect: 93.974 / 93.99,
  },
  {
    id: "shape-pink-scallop",
    src: "/images/shapes-ve/pink-scallop.svg",
    aspect: 96.144 / 95.946,
  },
  {
    id: "shape-grey-squiggle",
    src: "/images/shapes-ve/grey-squiggle.svg",
    aspect: 146.6 / 61.534,
  },
  {
    id: "shape-magenta-flower",
    src: "/images/shapes-ve/magenta-flower.svg",
    aspect: 83.749 / 83.591,
  },
  {
    id: "shape-maroon-stack",
    src: "/images/shapes-ve/maroon-stack.svg",
    aspect: 68.598 / 81.785,
  },
  {
    id: "shape-black-splatter",
    src: "/images/shapes-ve/black-splatter.svg",
    aspect: 58.79 / 57.502,
  },
  {
    id: "shape-red-starburst",
    src: "/images/shapes-ve/red-starburst.svg",
    aspect: 50.758 / 48.43,
  },
  {
    id: "shape-blue-dots",
    src: "/images/shapes-ve/blue-dots.svg",
    aspect: 91.084 / 86.014,
  },
];

/** 13 unique + 1 duplicate for ~14 falling bodies (matches B/C density) */
export const SHAPES_E_SPAWN = [...SHAPES_E, SHAPES_E[0]!];

export const STATIC_SHAPE_POSES_E: StaticShapePose[] = [
  { shapeId: "shape-orange-starburst", x: 0.18, y: 0.82, angle: 0.15 },
  { shapeId: "shape-grey-squiggle", x: 0.38, y: 0.78, angle: -0.3 },
  { shapeId: "shape-blue-dots", x: 0.58, y: 0.8, angle: 0.08 },
  { shapeId: "shape-purple-pill", x: 0.78, y: 0.76, angle: 0.4 },
  { shapeId: "shape-pink-scallop", x: 0.28, y: 0.58, angle: -0.2 },
  { shapeId: "shape-black-splatter", x: 0.48, y: 0.55, angle: 0.35 },
  { shapeId: "shape-teal-eye", x: 0.68, y: 0.52, angle: -0.12 },
  { shapeId: "shape-magenta-flower", x: 0.82, y: 0.48, angle: 0.25 },
  { shapeId: "shape-maroon-stack", x: 0.35, y: 0.35, angle: -0.45 },
  { shapeId: "shape-red-starburst", x: 0.55, y: 0.32, angle: 0.18 },
  { shapeId: "shape-mint-swirl", x: 0.72, y: 0.28, angle: -0.28 },
  { shapeId: "shape-lime-fruit", x: 0.42, y: 0.18, angle: 0.5 },
  { shapeId: "shape-black-line", x: 0.62, y: 0.15, angle: 0.05 },
  { shapeId: "shape-orange-starburst", x: 0.22, y: 0.42, angle: -0.55 },
];
