/**
 * Subtle reveal — animates on load (eager) or when scrolled into view.
 */
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "../../lib/motion";

interface Props {
  children: ReactNode;
  className?: string;
  eager?: boolean;
  delay?: number;
}

export default function FadeInView({
  children,
  className,
  eager = false,
  delay = 0,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  // `width: 100%` lives in study.css rather than an inline style: it was
  // duplicated across all three branches below, and an inline style rewrites
  // the style attribute on every render for a value that never changes.
  const classes = className ? `fade-in-view ${className}` : "fade-in-view";

  if (reducedMotion) {
    return <div className={classes}>{children}</div>;
  }

  const transition = { duration: 0.45, ease: "easeOut" as const, delay };
  const from = { opacity: 0, y: eager ? 10 : 16 };

  if (eager) {
    return (
      <motion.div
        className={classes}
        initial={from}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={classes}
      initial={from}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
