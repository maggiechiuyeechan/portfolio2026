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

  if (reducedMotion) {
    return <div className={className} style={{ width: "100%" }}>{children}</div>;
  }

  const transition = { duration: 0.45, ease: "easeOut" as const, delay };
  const from = { opacity: 0, y: eager ? 10 : 16 };

  if (eager) {
    return (
      <motion.div
        className={className}
        style={{ width: "100%" }}
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
      className={className}
      style={{ width: "100%" }}
      initial={from}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
