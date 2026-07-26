import type { ShapeDef } from "./physicsShapes";
import { shapeBodyDimensions } from "./physicsShapes";

interface Props {
  shape: ShapeDef;
  baseSize: number;
  /** When false, skip per-element blend (e.g. parent wrapper applies multiply). */
  applyBlend?: boolean;
}

export default function PhysicsShapeFace({ shape, baseSize, applyBlend = true }: Props) {
  const { width, height } = shapeBodyDimensions(baseSize, shape);

  const blendStyle =
    applyBlend && shape.mixBlendMultiply ? { mixBlendMode: "multiply" as const } : undefined;

  if (shape.color) {
    return (
      <div
        style={{
          width,
          height,
          background: shape.color,
          borderRadius: shape.borderRadius ?? 0,
          display: "block",
          ...blendStyle,
        }}
      />
    );
  }

  return (
    <img
      src={shape.src}
      alt=""
      draggable={false}
      style={{
        width,
        height,
        display: "block",
        objectFit: "contain",
        ...blendStyle,
      }}
    />
  );
}
