import type { ShapeDef, StaticShapePose } from "./physicsShapes";

/** Figma node 327:39320 — organic shape set for Version C */
export type { ShapeDef, StaticShapePose };

export const SHAPES_C: ShapeDef[] = [
  { id: "shape-yellow-arc", src: "/images/shapes-vc/yellow-arc.svg", aspect: 1 },
  { id: "shape-red-quarter", src: "/images/shapes-vc/red-quarter.svg", aspect: 105.359 / 105.397 },
  { id: "shape-blue-semicircle", src: "/images/shapes-vc/blue-semicircle.svg", aspect: 209.851 / 105.408 },
  { id: "shape-overlap-circles", src: "/images/shapes-vc/overlap-circles.svg", aspect: 153.49 / 93.2258 },
  { id: "shape-wave", src: "/images/shapes-vc/wave.svg", aspect: 175.601 / 21.8423 },
  { id: "shape-star", src: "/images/shapes-vc/star.svg", aspect: 133.968 / 139.301 },
  { id: "shape-orange-diamond", src: "/images/shapes-vc/orange-diamond.svg", aspect: 146.342 / 146.317 },
  { id: "shape-eye", src: "/images/shapes-vc/eye.svg", aspect: 142.856 / 73.0109 },
  { id: "shape-triangle-pink", src: "/images/shapes-vc/triangle-pink.svg", aspect: 1 },
  { id: "shape-triangle-green", src: "/images/shapes-vc/triangle-green.svg", aspect: 1 },
];

export const SHAPES_C_SPAWN = [...SHAPES_C, ...SHAPES_C];

export const STATIC_SHAPE_POSES_C: StaticShapePose[] = [
  { shapeId: "shape-wave", x: 0.22, y: 0.78, angle: 0.12 },
  { shapeId: "shape-blue-semicircle", x: 0.42, y: 0.82, angle: -0.35 },
  { shapeId: "shape-red-quarter", x: 0.62, y: 0.8, angle: 0.5 },
  { shapeId: "shape-overlap-circles", x: 0.78, y: 0.74, angle: -0.2 },
  { shapeId: "shape-orange-diamond", x: 0.35, y: 0.58, angle: 0.65 },
  { shapeId: "shape-eye", x: 0.55, y: 0.55, angle: -0.08 },
  { shapeId: "shape-star", x: 0.72, y: 0.48, angle: 0.3 },
  { shapeId: "shape-yellow-arc", x: 0.48, y: 0.32, angle: -0.4 },
  { shapeId: "shape-triangle-pink", x: 0.28, y: 0.38, angle: 0.15 },
  { shapeId: "shape-triangle-green", x: 0.65, y: 0.28, angle: -0.55 },
  { shapeId: "shape-yellow-arc", x: 0.38, y: 0.22, angle: 0.22 },
  { shapeId: "shape-overlap-circles", x: 0.82, y: 0.3, angle: 0.42 },
  { shapeId: "shape-red-quarter", x: 0.52, y: 0.12, angle: -0.12 },
  { shapeId: "shape-wave", x: 0.18, y: 0.55, angle: -0.18 },
];

/** @deprecated use STATIC_SHAPE_POSES_C */
export const STATIC_SHAPE_POSES = STATIC_SHAPE_POSES_C;
