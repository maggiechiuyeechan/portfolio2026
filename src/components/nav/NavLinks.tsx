/**
 * Single React island for every animated nav link (one hydration root).
 * Colors per Figma "Nav Link" variants: default content-secondary,
 * hover content-default.
 */
import { motion } from "motion/react";

type Link = { label: string; href: string };

interface Props {
  workLinks: Link[];
  socials: Link[];
}

const linkStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
  color: "var(--color-typography-content-secondary)",
  textDecoration: "none",
  width: "fit-content",
};

function AnimatedLink({ label, href }: Link) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  return (
    <motion.a
      href={href}
      style={linkStyle}
      initial={false}
      whileHover={{ color: "var(--color-typography-content-default)" }}
      whileTap={{ color: "var(--color-typography-content-default)" }}
      transition={{ duration: 0.15 }}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {label}
    </motion.a>
  );
}

export default function NavLinks({ workLinks, socials }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      {workLinks.length > 0 && (
        <div>
          <p
            style={{
              ...linkStyle,
              margin: 0,
              marginBottom: "var(--spacing-2)",
            }}
          >
            Work
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-2)",
              alignItems: "stretch",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "1px",
                background: "var(--color-border-default)",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {workLinks.map((link) => (
                <AnimatedLink key={link.href} {...link} />
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {socials.map((link) => (
          <AnimatedLink key={link.href} {...link} />
        ))}
      </div>
    </div>
  );
}
