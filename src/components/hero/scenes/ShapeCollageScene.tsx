/**
 * Version L — four randomly placed multiply collage shapes (Figma node 354:60407).
 * The grid backdrop is collage-specific, so it travels in this chunk rather
 * than being a shell concern.
 */
import ShapeCollage from "../../auth/ShapeCollage";
import HeroGridBackdrop from "../../auth/HeroGridBackdrop";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function ShapeCollageScene({ obstacleRefs }: HeroSceneProps) {
  return (
    <>
      <HeroGridBackdrop />
      <ShapeCollage obstacleRefs={obstacleRefs} />
    </>
  );
}
