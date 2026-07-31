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
import { Suspense, useEffect, useMemo, useRef, useState, Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { easeOut, layoutShift, sceneFade, useBreakpointReplayKey, usePrefersReducedMotion } from "../../lib/motion";
import { site } from "../../config/site";
import type { HeroLayout, HeroSceneProps, HeroVariantId } from "../../config/heroVariants";
import PasswordForm from "../auth/PasswordForm";
import HeroNoiseOverlay from "../auth/HeroNoiseOverlay";
import HeroSceneFrame from "../auth/HeroSceneFrame";
import HeroEarlyBackdrop from "./HeroEarlyBackdrop";
import SceneBoundary from "./SceneBoundary";
import { getVariant } from "../../config/heroVariants";
import AnimatedTextLink from "../ui/AnimatedTextLink";
import { updateCursorLabel } from "../../scripts/cursor-label";

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
  const variantMeta = getVariant(variantId);
  const showSceneFrame = variantMeta?.sceneFrame ?? false;
  const showEarlyBackdrop = variantMeta?.earlyBackdrop === "grid";
  const settled = !animateEntrance;
  const animateLayout = settled && !reducedMotion;

  // Own the frame flag here so early backdrops clip on the first paint,
  // instead of waiting for the frame portal's mounted effect.
  useEffect(() => {
    if (!showSceneFrame) return;
    document.body.dataset.heroSceneFrame = "";
    return () => {
      delete document.body.dataset.heroSceneFrame;
    };
  }, [showSceneFrame]);

  const variantLabelMounted = useRef(false);

  useEffect(() => {
    return () => updateCursorLabel(null);
  }, []);

  useEffect(() => {
    updateCursorLabel(variantMeta?.cursorLabel ?? null, {
      forceReveal: variantLabelMounted.current,
      variantId,
    });
    variantLabelMounted.current = true;
  }, [variantId, variantMeta?.cursorLabel]);

  // The key remounts on variant swap / breakpoint replay, which also resets
  // SceneBoundary — see the note in that file.
  const scene = (
    <Fragment key={`scene-${variantId}-${sceneReplayKey}`}>
      <SceneBoundary label={variantId}>
        <Suspense fallback={null}>
          {renderScene({
            obstacleRefs,
            variants: sceneVariants,
            reducedMotion,
          })}
        </Suspense>
      </SceneBoundary>
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
          className="text-title hero-bio"
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
          <span aria-hidden="true"> · </span>
          <AnimatedTextLink
            href="/"
            inline
            className="hero-surprise-link"
            onClick={(event) => {
              event.preventDefault();
              onSurprise?.();
            }}
          >
            Surprise me
            <span className="hero-surprise-link__icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              </svg>
            </span>
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
      {showEarlyBackdrop ? <HeroEarlyBackdrop /> : null}
      {fullCanvas ? scene : null}
      {showNoise ? <HeroNoiseOverlay /> : null}
      {showSceneFrame ? <HeroSceneFrame /> : null}
      {content}
    </div>
  );
}
