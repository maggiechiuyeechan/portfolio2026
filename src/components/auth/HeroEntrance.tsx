/**
 * Hero entrance: staggered fade-up (avatar → heading → bio → password).
 * On auth success, fades out briefly before navigating to /work.
 * Layout styles live here so they survive the React island boundary.
 */
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { easeOut, usePrefersReducedMotion } from "../../lib/motion";
import PasswordForm from "./PasswordForm";
import HeroAvatar from "./HeroAvatar";
import PhysicsTileStack from "./PhysicsTileStack";
import ShapeDesk from "./ShapeDesk";
import GridSprinkle from "./GridSprinkle";
import { SHAPES_D_SPAWN } from "./physicsShapesD";
import { SHAPES_G_SPAWN } from "./physicsShapesG";

interface Props {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatarSrc?: string;
  avatarAlt?: string;
  showAvatar?: boolean;
  physicsTiles?: boolean;
  physicsFullCanvas?: boolean;
  physicsVariant?: "tiles" | "shapes-c" | "shapes-d" | "shapes-e" | "shapes-d-desk" | "shapes-g-desk" | "grid-sprinkle";
}

const container = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.15, staggerChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: easeOut },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const heroContent: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--spacing-5)",
  width: "fit-content",
  maxWidth: "100%",
  textAlign: "center",
};

const heroCopy: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "35.5rem",
};

const heroContentFullCanvas: React.CSSProperties = {
  ...heroContent,
  position: "relative",
  zIndex: 10,
  pointerEvents: "none",
};

const heroText: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--spacing-2)",
  marginBottom: "var(--spacing-3)",
};

const heroHeading: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default function HeroEntrance({
  name,
  title,
  tagline,
  bio,
  avatarSrc = "/images/agent_generate_video - Golden-green meadow grass swaying in slow_ dreamlike undulat (3).mp4",
  avatarAlt = "Golden-green meadow grass swaying in slow motion",
  showAvatar = true,
  physicsTiles = false,
  physicsFullCanvas = false,
  physicsVariant = "tiles",
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);

  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const motionState = exiting ? "exit" : "visible";
  const usePhysics = physicsTiles || physicsFullCanvas;
  const obstacleRefs = useMemo(() => [nameRef, titleRef, bioRef, formRef], []);

  const contentStyle: React.CSSProperties = physicsFullCanvas ? heroContentFullCanvas : heroContent;

  const content = (
    <motion.div
      className="hero-content"
      style={contentStyle}
      variants={reducedMotion ? undefined : container}
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : motionState}
      onAnimationComplete={() => {
        if (exiting) window.location.assign("/work");
      }}
    >
      {!physicsFullCanvas && usePhysics ? (
        <PhysicsTileStack variants={reducedMotion ? undefined : item} />
      ) : !usePhysics && showAvatar ? (
        <HeroAvatar
          src={avatarSrc}
          alt={avatarAlt}
          variants={reducedMotion ? undefined : item}
        />
      ) : null}

      <motion.h1
        ref={nameRef}
        className="text-display hero-name hero-name--mega"
        style={{ margin: 0, alignSelf: "center" }}
        variants={reducedMotion ? undefined : item}
      >
        {name}
      </motion.h1>

      <motion.div className="hero-copy" style={heroCopy} variants={reducedMotion ? undefined : item}>
        <div className="hero-text" style={heroText}>
          <div className="hero-heading" style={heroHeading}>
            <p
              ref={titleRef}
              className="text-title hero-title"
              style={{ margin: 0, marginTop: "var(--spacing-5)" }}
            >
              {title}
              <br />
              {tagline}
            </p>
          </div>
          <p ref={bioRef} className="text-body hero-bio" style={{ maxWidth: "100%" }}>
            {bio}
          </p>
        </div>

        <div ref={formRef} style={{ pointerEvents: "auto" }}>
          <PasswordForm
            onSuccess={() => {
              if (reducedMotion) window.location.assign("/work");
              else setExiting(true);
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );

  if (physicsFullCanvas) {
    return (
      <>
        {physicsVariant === "shapes-d-desk" ? (
          <ShapeDesk shapes={SHAPES_D_SPAWN} />
        ) : physicsVariant === "shapes-g-desk" ? (
          <ShapeDesk shapes={SHAPES_G_SPAWN} />
        ) : physicsVariant === "grid-sprinkle" ? (
          <GridSprinkle obstacleRefs={obstacleRefs} />
        ) : (
          <PhysicsTileStack
            fullCanvas
            variant={physicsVariant as "tiles" | "shapes-c" | "shapes-d" | "shapes-e"}
            obstacleRefs={obstacleRefs}
            variants={reducedMotion ? undefined : item}
          />
        )}
        {content}
      </>
    );
  }

  return content;
}
