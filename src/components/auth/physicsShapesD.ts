import type { ShapeDef, StaticShapePose } from "./physicsShapes";

export const SHAPES_D: ShapeDef[] = [
  {
    id: "shape-subtract",
    src: "/images/shapes-vd/subtract.svg",
    aspect: 1,
    mixBlendMultiply: true,
  },
  {
    id: "shape-ellipse",
    src: "/images/shapes-vd/ellipse.svg",
    aspect: 1,
    mixBlendMultiply: true,
  },
  {
    id: "shape-pill-blue",
    color: "#1d4790",
    aspect: 105 / 260,
    borderRadius: "999px",
    mixBlendMultiply: true,
  },
  {
    id: "shape-pill-orange",
    color: "#e88e4e",
    aspect: 105 / 260,
    borderRadius: "999px",
    mixBlendMultiply: true,
  },
  {
    id: "shape-square-yellow",
    color: "#e1d347",
    aspect: 1,
    borderRadius: "1.5rem",
    mixBlendMultiply: true,
  },
  {
    id: "shape-square-grid",
    src: "/images/shapes-vd/square-grid.svg",
    aspect: 1,
    mixBlendMultiply: true,
  },
  {
    id: "shape-pink-dots",
    src: "/images/shapes-vd/pink-dotted-grid.svg",
    aspect: 1,
    mixBlendMultiply: true,
  },
];

export const SHAPES_D_SPAWN = [...SHAPES_D, ...SHAPES_D];

export const STATIC_SHAPE_POSES_D: StaticShapePose[] = [
  { shapeId: "shape-pill-blue", x: 0.2, y: 0.8, angle: 0.1 },
  { shapeId: "shape-subtract", x: 0.38, y: 0.78, angle: -0.25 },
  { shapeId: "shape-pill-orange", x: 0.58, y: 0.82, angle: 0.35 },
  { shapeId: "shape-ellipse", x: 0.76, y: 0.75, angle: -0.15 },
  { shapeId: "shape-square-yellow", x: 0.32, y: 0.58, angle: 0.5 },
  { shapeId: "shape-pink-dots", x: 0.52, y: 0.55, angle: -0.1 },
  { shapeId: "shape-square-grid", x: 0.72, y: 0.52, angle: 0.2 },
  { shapeId: "shape-subtract", x: 0.45, y: 0.35, angle: -0.4 },
  { shapeId: "shape-ellipse", x: 0.65, y: 0.3, angle: 0.12 },
  { shapeId: "shape-pill-blue", x: 0.25, y: 0.38, angle: -0.55 },
  { shapeId: "shape-square-grid", x: 0.82, y: 0.28, angle: 0.45 },
  { shapeId: "shape-pink-dots", x: 0.55, y: 0.18, angle: -0.08 },
  { shapeId: "shape-square-yellow", x: 0.35, y: 0.15, angle: 0.3 },
  { shapeId: "shape-pill-orange", x: 0.68, y: 0.12, angle: -0.22 },
];
