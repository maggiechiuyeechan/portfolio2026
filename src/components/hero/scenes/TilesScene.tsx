/** Version B — falling tile physics, full canvas. */
import PhysicsTileStack from "../../auth/PhysicsTileStack";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function TilesScene({ obstacleRefs, variants }: HeroSceneProps) {
  return (
    <PhysicsTileStack
      fullCanvas
      variant="tiles"
      obstacleRefs={obstacleRefs}
      variants={variants}
    />
  );
}
