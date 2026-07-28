/** Version I — 28px grid with sprinkled multiply dots (Figma node 354:82). */
import GridSprinkle from "../../auth/GridSprinkle";
import { GRID_SPRINKLE_PALETTE_I } from "../../auth/gridSprinklePalettes";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function GridSprinkleScene({ obstacleRefs }: HeroSceneProps) {
  return (
    <GridSprinkle obstacleRefs={obstacleRefs} dotColors={GRID_SPRINKLE_PALETTE_I} />
  );
}
