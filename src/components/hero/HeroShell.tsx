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
import { Suspense, useMemo, useRef, useState, Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { easeOut, layoutShift, sceneFade, useBreakpointReplayKey, usePrefersReducedMotion } from "../../lib/motion";
import { site } from "../../config/site";
import type { HeroLayout, HeroSceneProps, HeroVariantId } from "../../config/heroVariants";
import PasswordForm from "../auth/PasswordForm";
import HeroNoiseOverlay from "../auth/HeroNoiseOverlay";
import HeroSceneFrame from "../auth/HeroSceneFrame";
import { getVariant } from "../../config/heroVariants";
import AnimatedTextLink from "../ui/AnimatedTextLink";

export interface HeroShellProps {
  name: string;
  title: string;
  tagline: string;
  variantId: HeroVariantId;
  layout: HeroLayout;
  /** Film-grain overlay above the scene, below the copy. */
  noise?: boolean;
  /** Staggered copy entrance on first paint only. */
  playEntrance?: boolean;
  /** Advance to the next variant without reloading or re-animating copy. */
  onSurprise?: () => void;
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
  gap: "var(--spacing-3)",
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

export default function HeroShell({
  name,
  title,
  tagline,
  variantId,
  layout,
  noise = false,
  playEntrance = true,
  onSurprise,
  renderScene,
}: HeroShellProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);
  const sceneReplayKey = useBreakpointReplayKey(!reducedMotion && !exiting);
  const animateEntrance = playEntrance && !reducedMotion;

  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const obstacleRefs = useMemo(() => [nameRef, titleRef, linksRef, formRef], []);

  const fullCanvas = layout === "full-canvas";
  const motionState = exiting ? "exit" : "visible";
  const sceneVariants =
    variantId === "meadow"
      ? sceneFade
      : variantId === "editable-blobs" && !animateEntrance
        ? sceneFade
        : animateEntrance
          ? item
          : undefined;
  const showNoise = noise || fullCanvas;
  const showSceneFrame = getVariant(variantId)?.sceneFrame ?? false;
  const settled = !animateEntrance;
  const animateLayout = settled && !reducedMotion;

  const scene = (
    <Fragment key={`scene-${variantId}-${sceneReplayKey}`}>
      <Suspense fallback={null}>
        {renderScene({
          obstacleRefs,
          variants: sceneVariants,
          reducedMotion,
        })}
      </Suspense>
    </Fragment>
  );

  const nameHeading = (
    <motion.h1
      ref={nameRef}
      className="text-display hero-name"
      layout={animateLayout ? "position" : false}
      style={{
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        alignSelf: "center",
        position: "relative",
        zIndex: showNoise ? 10 : 1,
      }}
      variants={animateEntrance ? item : undefined}
      initial={false}
      animate={settled ? { opacity: 1, y: 0 } : undefined}
      transition={{ layout: layoutShift }}
    >
      {name}
    </motion.h1>
  );

  const heroCopyBlock = (
    <>
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
          <AnimatedTextLink href={linkedin.href} inline onClick={() => window.posthog?.capture("social_link_clicked", { platform: "linkedin" })}>
            {linkedin.label}
          </AnimatedTextLink>
          <span aria-hidden="true"> · </span>
          <AnimatedTextLink href={x.href} inline onClick={() => window.posthog?.capture("social_link_clicked", { platform: "x" })}>
            {x.label}
          </AnimatedTextLink>
          <span aria-hidden="true"> · </span>
          <AnimatedTextLink href={contact.href} inline onClick={() => window.posthog?.capture("social_link_clicked", { platform: "email" })}>
            {contact.label}
          </AnimatedTextLink>
          <span aria-hidden="true"> · </span>
          <AnimatedTextLink
            href="/"
            inline
            shimmer={!reducedMotion}
            onClick={(event) => {
              event.preventDefault();
              window.posthog?.capture("hero_surprise_clicked", { from_variant: variantId });
              onSurprise?.();
            }}
          >
            Surprise me
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
    </>
  );

  const copyStack = (
    <motion.div
      className="hero-copy"
      layout={animateLayout ? "position" : false}
      style={{
        ...heroCopy,
        ...(showNoise ? { position: "relative", zIndex: 10 } : null),
      }}
      variants={animateEntrance ? item : undefined}
      initial={false}
      animate={settled ? { opacity: 1, y: 0 } : undefined}
      transition={{ layout: layoutShift }}
    >
      {heroCopyBlock}
    </motion.div>
  );

  const inlineScene =
    layout === "inline-avatar" ? (
      <motion.div layout={animateLayout ? "position" : false} transition={{ layout: layoutShift }}>
        {scene}
      </motion.div>
    ) : null;

  const content = (
    <motion.div
      className="hero-content"
      layout={animateLayout ? "position" : false}
      style={fullCanvas ? heroContentFullCanvas : heroContent}
      variants={animateEntrance || exiting ? container : undefined}
      initial={animateEntrance ? "hidden" : false}
      animate={exiting ? "exit" : settled ? { opacity: 1 } : motionState}
      transition={{ layout: layoutShift }}
      onAnimationComplete={() => {
        if (exiting) window.location.assign("/work");
      }}
    >
      {inlineScene}
      {nameHeading}
      {copyStack}
    </motion.div>
  );

  return (
    <div className="hero-entrance-replay" data-hero-background data-hero-layout={layout}>
      {fullCanvas ? scene : null}
      {showNoise ? <HeroNoiseOverlay /> : null}
      {showSceneFrame ? <HeroSceneFrame /> : null}
      {content}
    </div>
  );
}
