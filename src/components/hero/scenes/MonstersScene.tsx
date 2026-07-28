/**
 * Version J — monster illustration perched on the name, pupils track the cursor.
 * Rendered inside the copy stack (layout: "perched"), so it carries its own
 * wrapper styling rather than relying on the shell.
 */
import { motion } from "motion/react";
import MonsterEyes from "../../auth/MonsterEyes";
import type { HeroSceneProps } from "../../../config/heroVariants";

const monsterArt: React.CSSProperties = {
  width: "min(34rem, 100%)",
  // Light overlap so the monsters perch above the name without covering it.
  marginBottom: "calc(clamp(-1.25rem, -2.5vw, -0.5rem) + 10px)",
  position: "relative",
  zIndex: 2,
  pointerEvents: "none",
};

export default function MonstersScene({ variants }: HeroSceneProps) {
  return (
    <motion.div className="hero-monsters" style={monsterArt} variants={variants}>
      <MonsterEyes />
    </motion.div>
  );
}
