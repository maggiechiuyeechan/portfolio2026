/** Version C — full-canvas physics with organic Figma shapes. */
import PhysicsTileStack from "../../auth/PhysicsTileStack";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function ShapesCScene({ obstacleRefs, variants }: HeroSceneProps) {
  return (
    <PhysicsTileStack
      fullCanvas
      variant="shapes-c"
      obstacleRefs={obstacleRefs}
      variants={variants}
    />
  );
}
