/**
 * Text link with Default → hover color transition (Figma node 247:171960).
 * Default: content-secondary · hover/press: content-default, and presses
 * travel 1px down to match the ClickUp 4.0 carousel tabs.
 */
import { motion } from "motion/react";
import { easeOut } from "../../lib/motion";

const colorDefault = "var(--color-typography-content-default)";
const colorSecondary = "var(--color-typography-content-secondary)";

/** Press travel shared with the ClickUp 4.0 carousel tabs. */
const pressTransition = { duration: 0.1, ease: [0.16, 1, 0.3, 1] } as const;

const blockStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  width: "fit-content",
};

const inlineStyle: React.CSSProperties = {
  // inline-block rather than inline so the press travel can transform it.
  display: "inline-block",
  textDecoration: "none",
};

const surpriseInlineStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.2em",
  textDecoration: "none",
};

interface Props {
  href: string;
  children: React.ReactNode;
  /** Nav scroll-spy: keep default color while section is active. */
  active?: boolean;
  /** Hero bio links sit inline with · separators. */
  inline?: boolean;
  /** Extra classes (e.g. hero-surprise-link layout). */
  className?: string;
  /** Cuelume pointerenter cue (nav uses tick). */
  hoverSound?: string;
  /** Cuelume pointerdown/up cues (nav uses default press + release). */
  pressReleaseSound?: boolean;
  /**
   * Receives the click event — "Surprise me" is an <a href="/"> that calls
   * preventDefault() rather than navigating. Typed as the full handler so
   * that stays checked; a bare `() => void` silently made `event` an `any`.
   */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function AnimatedTextLink({
  href,
  children,
  active = false,
  inline = false,
  className,
  hoverSound,
  pressReleaseSound = false,
  onClick,
}: Props) {
  const openInNewTab = href.startsWith("http");
  const restColor = active ? colorDefault : colorSecondary;
  const hoverSoundAttr = hoverSound ? ({ "data-cuelume-hover": hoverSound } as const) : {};
  const pressReleaseSoundAttr = pressReleaseSound
    ? ({ "data-cuelume-press": true, "data-cuelume-release": true } as const)
    : {};
  const isSurprise = Boolean(className?.includes("hero-surprise-link"));
  const resolvedInline = isSurprise ? surpriseInlineStyle : inlineStyle;
  const resolvedClassName = [
    className,
    !inline ? "text-body" : null,
    isSurprise && inline ? "hero-surprise-link--inline" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.a
      href={href}
      className={resolvedClassName || undefined}
      style={inline ? resolvedInline : blockStyle}
      initial={false}
      animate={{ color: restColor, y: 0 }}
      whileHover={{ color: colorDefault }}
      whileTap={{ color: colorDefault, y: 1 }}
      transition={{ duration: 0.15, ease: easeOut, y: pressTransition }}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      {...hoverSoundAttr}
      {...pressReleaseSoundAttr}
      {...(openInNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </motion.a>
  );
}
