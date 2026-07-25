/**
 * Hero entrance: staggered fade-up (avatar → heading → bio → password).
 * On auth success, fades out briefly before navigating to /work.
 * Layout styles live here so they survive the React island boundary.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { easeOut, usePrefersReducedMotion } from "../../lib/motion";
import PasswordForm from "./PasswordForm";
import HeroAvatar from "./HeroAvatar";

interface Props {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
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
  width: "100%",
  maxWidth: "35.5rem",
  textAlign: "center",
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
  avatarSrc,
  avatarAlt,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);

  const motionState = exiting ? "exit" : "visible";

  return (
    <motion.div
      className="hero-content"
      style={heroContent}
      variants={reducedMotion ? undefined : container}
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : motionState}
      onAnimationComplete={() => {
        if (exiting) window.location.assign("/work");
      }}
    >
      <HeroAvatar
        src={avatarSrc}
        alt={avatarAlt}
        variants={reducedMotion ? undefined : item}
      />

      <motion.div className="hero-text" style={heroText} variants={reducedMotion ? undefined : item}>
        <div className="hero-heading" style={heroHeading}>
          <h1 className="text-display hero-name" style={{ margin: 0 }}>
            {name}
          </h1>
          <p className="text-title hero-title" style={{ margin: 0, marginTop: "calc(var(--spacing-3) + 0.5rem)" }}>
            {title}
            <br />
            {tagline}
          </p>
        </div>
        <p className="text-body hero-bio" style={{ maxWidth: "100%" }}>
          {bio}
        </p>
      </motion.div>

      <motion.div variants={reducedMotion ? undefined : item}>
        <PasswordForm
          onSuccess={() => {
            if (reducedMotion) window.location.assign("/work");
            else setExiting(true);
          }}
        />
      </motion.div>
    </motion.div>
  );
}
