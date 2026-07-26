export interface ShapeDef {
  id: string;
  /** width / height from Figma export bounds */
  aspect: number;
  src?: string;
  color?: string;
  /** CSS border-radius — use "999px" for pills */
  borderRadius?: string;
  mixBlendMultiply?: boolean;
}

export function shapeBodyDimensions(baseSize: number, shape: ShapeDef) {
  if (shape.aspect >= 1) {
    return { width: baseSize, height: baseSize / shape.aspect };
  }
  return { width: baseSize * shape.aspect, height: baseSize };
}

export interface StaticShapePose {
  shapeId: string;
  x: number;
  y: number;
  angle: number;
}
