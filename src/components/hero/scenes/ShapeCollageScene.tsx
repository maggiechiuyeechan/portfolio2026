/**
 * Version L — four randomly placed multiply collage shapes (Figma node 354:60407).
 * Uses the same grid fill + text-masked lines as Version I (sprinkles).
 */
import ShapeCollage from "../../auth/ShapeCollage";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function ShapeCollageScene({ obstacleRefs }: HeroSceneProps) {
  return <ShapeCollage obstacleRefs={obstacleRefs} />;
}
