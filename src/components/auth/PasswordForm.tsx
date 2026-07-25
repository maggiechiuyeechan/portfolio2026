/**
 * Password entry chip (Figma 247:118299): background/pressed fill, radius/2,
 * Inter 16 content-secondary placeholder. Posts to /api/auth; on success the
 * server sets the signed session cookie and we navigate to /work.
 * Wrong password -> Motion shake + inline message.
 */
import { useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";

interface Props {
  onSuccess?: () => void;
}

export default function PasswordForm({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimationControls();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const password = inputRef.current?.value.trim() ?? "";
    if (!password || status === "submitting") return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        if (onSuccess) onSuccess();
        else window.location.assign("/work");
        return;
      }
    } catch {
      // fall through to error state
    }
    setStatus("error");
    controls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.4 },
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
      <motion.div
        className="password-chip"
        animate={controls}
        style={{
          display: "inline-flex",
          background: "var(--color-background-pressed)",
          borderRadius: "var(--radius-2)",
        }}
      >
        <input
          ref={inputRef}
          type="password"
          name="password"
          placeholder="Enter password"
          aria-label="Password"
          autoComplete="current-password"
          onChange={() => status === "error" && setStatus("idle")}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "Inter, sans-serif",
            fontSize: "1rem",
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            color: "var(--color-typography-content-default)",
            textAlign: "center",
            minWidth: "9rem",
            width: "100%",
          }}
        />
      </motion.div>
      {status === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            margin: "var(--spacing-2) 0 0",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            color: "var(--color-typography-content-secondary)",
          }}
        >
          That&rsquo;s not it — try again.
        </motion.p>
      )}
    </form>
  );
}
