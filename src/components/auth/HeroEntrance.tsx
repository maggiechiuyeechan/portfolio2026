/**
 * Hero entrance: staggered fade-up (avatar → heading → links → password).
 * On auth success, fades out briefly before navigating to /work.
 * Layout styles live here so they survive the React island boundary.
 */
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { easeOut, useBreakpointReplayKey, usePrefersReducedMotion } from "../../lib/motion";
import { site } from "../../config/site";
import PasswordForm from "./PasswordForm";
import HeroAvatar from "./HeroAvatar";
import HeroAvatarHalftone from "./HeroAvatarHalftone";
import PhysicsTileStack from "./PhysicsTileStack";
import ShapeDesk from "./ShapeDesk";
import GridSprinkle from "./GridSprinkle";
import MonsterEyes from "./MonsterEyes";
import ShapeCollage from "./ShapeCollage";
import BotanicalGrowth from "./BotanicalGrowth";
import EditableBlobField from "./EditableBlobField";
import HeroGridBackdrop from "./HeroGridBackdrop";
import HeroNoiseOverlay from "./HeroNoiseOverlay";
import { SHAPES_D_SPAWN } from "./physicsShapesD";
import {
  GRID_SPRINKLE_PALETTE_I,
  type GridSprinklePalette,
} from "./gridSprinklePalettes";

interface Props {
  name: string;
  title: string;
  tagline: string;
  avatarSrc?: string;
  avatarAlt?: string;
  showAvatar?: boolean;
  /** Ripple shader on the avatar video (Version O). */
  avatarEffect?: "none" | "halftone";
  physicsTiles?: boolean;
  physicsFullCanvas?: boolean;
  physicsVariant?:
    | "tiles"
    | "shapes-c"
    | "shapes-d-desk"
    | "grid-sprinkle-i"
    | "shape-collage"
    | "botanical"
    | "editable-blobs";
  /** Perch the monster illustration on top of the name. */
  monsters?: boolean;
  /** Fixed film-grain overlay above shapes / under text. */
  noise?: boolean;
}

const SPRINKLE_PALETTES: Record<string, GridSprinklePalette> = {
  "grid-sprinkle-i": GRID_SPRINKLE_PALETTE_I,
};

const [linkedin, x, contact] = site.socials;

const linkStyle: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};

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

const monsterStack: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "center",
  width: "100%",
};

const monsterArt: React.CSSProperties = {
  width: "min(34rem, 100%)",
  // Light overlap so the monsters perch above the name without covering it.
  marginBottom: "calc(clamp(-1.25rem, -2.5vw, -0.5rem) + 10px)",
  position: "relative",
  zIndex: 2,
  pointerEvents: "none",
};

export default function HeroEntrance({
  name,
  title,
  tagline,
  avatarSrc = "/images/agent_generate_video - Golden-green meadow grass swaying in slow_ dreamlike undulat (4).mp4",
  avatarAlt = "Golden-green meadow grass swaying in slow motion",
  showAvatar = true,
  avatarEffect = "none",
  physicsTiles = false,
  physicsFullCanvas = false,
  physicsVariant = "tiles",
  monsters = false,
  noise = false,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);
  // Remount hero scene when crossing layout breakpoints so entrances replay.
  const replayKey = useBreakpointReplayKey(!reducedMotion && !exiting);

  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const motionState = exiting ? "exit" : "visible";
  const usePhysics = physicsTiles || physicsFullCanvas;
  const obstacleRefs = useMemo(() => [nameRef, titleRef, linksRef, formRef], []);

  const contentStyle: React.CSSProperties = physicsFullCanvas ? heroContentFullCanvas : heroContent;
  const sprinklePalette = SPRINKLE_PALETTES[physicsVariant];
  // Keep copy above the grain; monsters stay lower so noise can sit on them.
  const textAboveNoise: React.CSSProperties | undefined = noise
    ? { position: "relative", zIndex: 10 }
    : undefined;

  const nameHeading = (
    <motion.h1
      ref={nameRef}
      className="text-display hero-name"
      style={{ margin: 0, alignSelf: "center", position: "relative", zIndex: noise ? 10 : 1 }}
      variants={reducedMotion ? undefined : item}
    >
      {name}
    </motion.h1>
  );

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
        avatarEffect === "halftone" ? (
          <HeroAvatarHalftone
            src={avatarSrc}
            alt={avatarAlt}
            variants={reducedMotion ? undefined : item}
          />
        ) : (
          <HeroAvatar
            src={avatarSrc}
            alt={avatarAlt}
            variants={reducedMotion ? undefined : item}
          />
        )
      ) : null}

      {monsters ? (
        <div className="hero-monster-stack" style={monsterStack}>
          <motion.div
            className="hero-monsters"
            style={monsterArt}
            variants={reducedMotion ? undefined : item}
          >
            <MonsterEyes />
          </motion.div>
          {nameHeading}
        </div>
      ) : (
        nameHeading
      )}

      <motion.div
        className="hero-copy"
        style={{ ...heroCopy, ...textAboveNoise }}
        variants={reducedMotion ? undefined : item}
      >
        <div className="hero-text" style={heroText}>
          <div className="hero-heading" style={heroHeading}>
            <p
              ref={titleRef}
              className="text-title hero-title"
              style={{ margin: 0 }}
            >
              {title}
              <br />
              {tagline}
            </p>
          </div>
          <p
            ref={linksRef}
            className="text-body hero-bio"
            style={{ maxWidth: "100%", pointerEvents: "auto" }}
          >
            <a href={linkedin.href} target="_blank" rel="noreferrer" style={linkStyle}>
              {linkedin.label}
            </a>
            <span aria-hidden="true"> · </span>
            <a href={x.href} target="_blank" rel="noreferrer" style={linkStyle}>
              {x.label}
            </a>
            <span aria-hidden="true"> · </span>
            <a href={contact.href} style={linkStyle}>
              {contact.label}
            </a>
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
    const showGridBackdrop =
      physicsVariant === "shapes-d-desk" ||
      physicsVariant === "shape-collage" ||
      physicsVariant === "editable-blobs";

    return (
      <div key={replayKey} className="hero-entrance-replay">
        {showGridBackdrop ? <HeroGridBackdrop /> : null}
        {physicsVariant === "shapes-d-desk" ? (
          <ShapeDesk shapes={SHAPES_D_SPAWN} obstacleRefs={obstacleRefs} />
        ) : physicsVariant === "shape-collage" ? (
          <ShapeCollage obstacleRefs={obstacleRefs} />
        ) : physicsVariant === "botanical" ? (
          <BotanicalGrowth />
        ) : physicsVariant === "editable-blobs" ? (
          <EditableBlobField obstacleRefs={obstacleRefs} />
        ) : sprinklePalette ? (
          <GridSprinkle obstacleRefs={obstacleRefs} dotColors={sprinklePalette} />
        ) : (
          <PhysicsTileStack
            fullCanvas
            variant={physicsVariant as "tiles" | "shapes-c"}
            obstacleRefs={obstacleRefs}
            variants={reducedMotion ? undefined : item}
          />
        )}
        <HeroNoiseOverlay />
        {content}
      </div>
    );
  }

  return (
    <div key={replayKey} className="hero-entrance-replay">
      {noise ? <HeroNoiseOverlay /> : null}
      {content}
    </div>
  );
}
