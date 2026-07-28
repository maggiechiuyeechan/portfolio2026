/**
 * Variant-independent hero: name, title, links, password form, exit animation.
 *
 * This file must NOT import any scene, matter-js, or shape data. It is the
 * chunk every visitor downloads, so anything imported here is paid for on
 * every load regardless of which variant was rolled. If you find yourself
 * adding a scene import, put it in a `scenes/*` adapter instead.
 *
 * The scene arrives as a render prop and is placed according to `layout`:
 *   inline-avatar → above the name, inside the stagger container
 *   perched       → above the name, inside the copy stack
 *   full-canvas   → behind everything, outside the stagger container
 */
import { Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { easeOut, useBreakpointReplayKey, usePrefersReducedMotion } from "../../lib/motion";
import { site } from "../../config/site";
import type { HeroLayout, HeroSceneProps } from "../../config/heroVariants";
import PasswordForm from "../auth/PasswordForm";
import HeroNoiseOverlay from "../auth/HeroNoiseOverlay";
import AnimatedTextLink from "../ui/AnimatedTextLink";

export interface HeroShellProps {
  name: string;
  title: string;
  tagline: string;
  layout: HeroLayout;
  /** Film-grain overlay above the scene, below the copy. */
  noise?: boolean;
  /** Receives obstacle refs + motion variants; returns the lazy scene. */
  renderScene: (props: HeroSceneProps) => ReactNode;
}

const [linkedin, x, contact] = site.socials;

const container = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: easeOut } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
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

const heroContentFullCanvas: React.CSSProperties = {
  ...heroContent,
  position: "relative",
  zIndex: 10,
  pointerEvents: "none",
};

const heroCopy: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "35.5rem",
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

export default function HeroShell({
  name,
  title,
  tagline,
  layout,
  noise = false,
  renderScene,
}: HeroShellProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);
  const replayKey = useBreakpointReplayKey(!reducedMotion && !exiting);

  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const obstacleRefs = useMemo(() => [nameRef, titleRef, linksRef, formRef], []);

  const fullCanvas = layout === "full-canvas";
  const motionState = exiting ? "exit" : "visible";
  const sceneVariants = reducedMotion ? undefined : item;
  const showNoise = noise || fullCanvas;

  // Scenes mount lazily. Suspense fallback is null on purpose: the copy and
  // password form are already painted and interactive, so a spinner would be
  // noise. The scene fades in under the entrance stagger when it lands.
  const scene = (
    <Suspense fallback={null}>
      {renderScene({
        obstacleRefs,
        variants: sceneVariants,
        reducedMotion,
      })}
    </Suspense>
  );

  const nameHeading = (
    <motion.h1
      ref={nameRef}
      className="text-display hero-name"
      style={{
        margin: 0,
        alignSelf: "center",
        position: "relative",
        zIndex: showNoise ? 10 : 1,
      }}
      variants={reducedMotion ? undefined : item}
    >
      {name}
    </motion.h1>
  );

  const content = (
    <motion.div
      className="hero-content"
      style={fullCanvas ? heroContentFullCanvas : heroContent}
      variants={reducedMotion ? undefined : container}
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : motionState}
      onAnimationComplete={() => {
        if (exiting) window.location.assign("/work");
      }}
    >
      {layout === "inline-avatar" ? scene : null}

      {layout === "perched" ? (
        <div className="hero-monster-stack" style={monsterStack}>
          {scene}
          {nameHeading}
        </div>
      ) : (
        nameHeading
      )}

      <motion.div
        className="hero-copy"
        style={{
          ...heroCopy,
          ...(showNoise ? { position: "relative", zIndex: 10 } : null),
        }}
        variants={reducedMotion ? undefined : item}
      >
        <div className="hero-text" style={heroText}>
          <div className="hero-heading" style={heroHeading}>
            <p ref={titleRef} className="text-title hero-title" style={{ margin: 0 }}>
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
            <AnimatedTextLink href={linkedin.href} inline>
              {linkedin.label}
            </AnimatedTextLink>
            <span aria-hidden="true"> · </span>
            <AnimatedTextLink href={x.href} inline>
              {x.label}
            </AnimatedTextLink>
            <span aria-hidden="true"> · </span>
            <AnimatedTextLink href={contact.href} inline>
              {contact.label}
            </AnimatedTextLink>
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

  return (
    <div key={replayKey} className="hero-entrance-replay" data-hero-layout={layout}>
      {fullCanvas ? scene : null}
      {showNoise ? <HeroNoiseOverlay /> : null}
      {content}
    </div>
  );
}
