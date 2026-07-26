import type { ShapeDef, StaticShapePose } from "./physicsShapes";

export type { ShapeDef, StaticShapePose };

export const SHAPES_C: ShapeDef[] = [
  { id: "shape-diamond", src: "/images/shapes-vc/diamond.svg", aspect: 1 },
  { id: "shape-eye", src: "/images/shapes-vc/eye.svg", aspect: 0.96 },
  { id: "shape-circles", src: "/images/shapes-vc/circles.svg", aspect: 1 },
  { id: "shape-star", src: "/images/shapes-vc/star.svg", aspect: 1 },
  { id: "shape-arc", src: "/images/shapes-vc/arc.svg", aspect: 1.64 },
  { id: "shape-wave", src: "/images/shapes-vc/wave.svg", aspect: 8.04 },
  { id: "shape-quarter", src: "/images/shapes-vc/quarter-circle.svg", aspect: 1.96 },
];

export const SHAPES_C_SPAWN = [...SHAPES_C, ...SHAPES_C];

export const STATIC_SHAPE_POSES_C: StaticShapePose[] = [
  { shapeId: "shape-wave", x: 0.22, y: 0.78, angle: 0.12 },
  { shapeId: "shape-arc", x: 0.42, y: 0.82, angle: -0.35 },
  { shapeId: "shape-quarter", x: 0.62, y: 0.8, angle: 0.5 },
  { shapeId: "shape-circles", x: 0.78, y: 0.74, angle: -0.2 },
  { shapeId: "shape-diamond", x: 0.35, y: 0.58, angle: 0.65 },
  { shapeId: "shape-eye", x: 0.55, y: 0.55, angle: -0.08 },
  { shapeId: "shape-star", x: 0.72, y: 0.48, angle: 0.3 },
  { shapeId: "shape-diamond", x: 0.48, y: 0.32, angle: -0.4 },
  { shapeId: "shape-star", x: 0.28, y: 0.38, angle: 0.15 },
  { shapeId: "shape-eye", x: 0.65, y: 0.28, angle: -0.55 },
  { shapeId: "shape-arc", x: 0.38, y: 0.22, angle: 0.22 },
  { shapeId: "shape-circles", x: 0.82, y: 0.3, angle: 0.42 },
  { shapeId: "shape-quarter", x: 0.52, y: 0.12, angle: -0.12 },
  { shapeId: "shape-wave", x: 0.18, y: 0.55, angle: -0.18 },
];

/** @deprecated use STATIC_SHAPE_POSES_C */
export const STATIC_SHAPE_POSES = STATIC_SHAPE_POSES_C;
