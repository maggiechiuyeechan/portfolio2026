/** Version N — non-overlapping organic shapes, editable nodes on hover. */
import EditableBlobField from "../../auth/EditableBlobField";
import type { HeroSceneProps } from "../../../config/heroVariants";

export default function EditableBlobsScene({ obstacleRefs, variants }: HeroSceneProps) {
  return <EditableBlobField obstacleRefs={obstacleRefs} variants={variants} />;
}
