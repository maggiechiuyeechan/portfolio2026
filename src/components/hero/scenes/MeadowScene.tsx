/**
 * Version O — halftone WebGL ripple over the meadow grass video.
 * Adapter only: props that used to live on the /  page now live here.
 */
import HeroAvatarHalftone from "../../auth/HeroAvatarHalftone";
import type { HeroSceneProps } from "../../../config/heroVariants";

const SRC = "/images/meadow.mp4";
const POSTER = "/images/meadow-poster.webp";
const ALT = "Golden-green meadow grass swaying in slow motion";

export default function MeadowScene({ variants }: HeroSceneProps) {
  return (
    <HeroAvatarHalftone src={SRC} alt={ALT} poster={POSTER} variants={variants} />
  );
}
