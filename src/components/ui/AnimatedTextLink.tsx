/**
 * Text link with Default → hover color transition (Figma node 247:171960).
 * Default: content-secondary · hover/press: content-default.
 */
import { motion } from "motion/react";
import { easeOut } from "../../lib/motion";

const colorDefault = "var(--color-typography-content-default)";
const colorSecondary = "var(--color-typography-content-secondary)";

const blockStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Geist, sans-serif",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
  textDecoration: "none",
  width: "fit-content",
};

const inlineStyle: React.CSSProperties = {
  display: "inline",
  textDecoration: "none",
};

interface Props {
  href: string;
  children: React.ReactNode;
  /** Nav scroll-spy: keep default color while section is active. */
  active?: boolean;
  /** Hero bio links sit inline with · separators. */
  inline?: boolean;
  onClick?: () => void;
}

export default function AnimatedTextLink({
  href,
  children,
  active = false,
  inline = false,
  onClick,
}: Props) {
  const openInNewTab = href.startsWith("http");
  const restColor = active ? colorDefault : colorSecondary;

  return (
    <motion.a
      href={href}
      style={inline ? inlineStyle : blockStyle}
      initial={false}
      animate={{ color: restColor }}
      whileHover={{ color: colorDefault }}
      whileTap={{ color: colorDefault }}
      transition={{ duration: 0.15, ease: easeOut }}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      {...(openInNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </motion.a>
  );
}
