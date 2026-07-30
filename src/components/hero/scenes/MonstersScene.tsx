/**
 * Version J — monster illustration perched on the name, pupils track the cursor.
 * Full-canvas so copy matches other variants; monsters are fixed above the name.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import MonsterEyes from "../../auth/MonsterEyes";
import { useSceneAnchor } from "../../../lib/useSceneAnchor";
import type { HeroSceneProps } from "../../../config/heroVariants";

const monsterArt: React.CSSProperties = {
  width: "min(34rem, 100%)",
  position: "relative",
  zIndex: 2,
  pointerEvents: "none",
};

/** Clear gap between monster art and Maggie — matches --spacing-3 (12px). */
function monsterNameGapPx(): number {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return 0.75 * rem;
}

export default function MonstersScene({ obstacleRefs, variants }: HeroSceneProps) {
  const nameRef = obstacleRefs?.[0];
  const [mounted, setMounted] = useState(false);
  const anchor = useSceneAnchor(nameRef, monsterNameGapPx);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="hero-monsters-scene"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "fixed",
          left: anchor?.x ?? "50%",
          top: anchor?.y ?? "50%",
          transform: "translate(-50%, -100%)",
          width: "min(34rem, 100vw)",
          paddingInline: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        <motion.div
          className="hero-monsters"
          style={monsterArt}
          variants={variants}
          initial={variants ? "hidden" : false}
          animate={variants ? "visible" : undefined}
        >
          <MonsterEyes />
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
