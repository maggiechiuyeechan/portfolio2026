/** Version F — draggable paper desk, multiply blend (Figma node 327:60168). */
import ShapeDesk from "../../auth/ShapeDesk";
import { SHAPES_D_SPAWN } from "../../auth/physicsShapesD";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function ShapeDeskScene({ obstacleRefs }: HeroSceneProps) {
  return <ShapeDesk shapes={SHAPES_D_SPAWN} obstacleRefs={obstacleRefs} />;
}
