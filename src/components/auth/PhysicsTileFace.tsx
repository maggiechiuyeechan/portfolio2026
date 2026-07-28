import type { TileDef } from "./physicsTiles";
import { BLOCK_ICON_RATIO, BLOCK_RADIUS_RATIO } from "./physicsBlocks354";

interface Props {
  tile: TileDef;
  size: number;
}

export default function PhysicsTileFace({ tile, size }: Props) {
  const iconSize = size * BLOCK_ICON_RATIO;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * BLOCK_RADIUS_RATIO,
        background: tile.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      <img
        src={tile.src}
        alt=""
        draggable={false}
        style={{
          width: iconSize,
          height: iconSize,
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
