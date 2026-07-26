import type { ShapeDef } from "./physicsShapes";

/** Figma node 297:95380 — colored paper rectangles (sharp corners) */
export const SHAPES_G: ShapeDef[] = [
  {
    id: "shape-g-orange-rect",
    color: "#e88e4e",
    aspect: 133 / 260,
    mixBlendMultiply: true,
  },
  {
    id: "shape-g-blue-rect",
    color: "#63bbd5",
    aspect: 105 / 260,
    mixBlendMultiply: true,
  },
  {
    id: "shape-g-green-rect",
    color: "#6ba97e",
    aspect: 105 / 413.862,
    mixBlendMultiply: true,
  },
  {
    id: "shape-g-pink-rect",
    color: "#eda6d0",
    aspect: 105 / 472,
    mixBlendMultiply: true,
  },
  {
    id: "shape-g-yellow-square",
    color: "#e1d347",
    aspect: 1,
    mixBlendMultiply: true,
  },
];

export const SHAPES_G_SPAWN = [...SHAPES_G, ...SHAPES_G];
