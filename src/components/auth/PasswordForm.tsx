/**
 * Password entry chip — Figma node 382:95126.
 *
 * States (Property 1):
 *   default / hover              → inverse chip, "Enter password" placeholder
 *   pressed in selected          → white field, inverse border, focused + empty
 *   password present             → white field, default border, value + submit arrow
 *
 * Posts to /api/auth; on success sets the session cookie and navigates to /work.
 * Wrong password → shake + inline message.
 */
import { useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { play } from "cuelume";

interface Props {
  onSuccess?: () => void;
}

/** Figma Enter 382:95116 — plain arrow, 16×16 (all states). */
function EnterArrow() {
  return (
    <svg
      className="password-chip-submit-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.33334 7.99999H12.6667M8.00001 12.6667L12.6667 7.99999L8.00001 3.33333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Match Cuelume hover throttle — keeps fast typing from stacking cues. */
const TYPE_SOUND_GAP_MS = 150;

export default function PasswordForm({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTypeSoundRef = useRef(-Infinity);
  const controls = useAnimationControls();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [submitPressed, setSubmitPressed] = useState(false);
  const [value, setValue] = useState("");

  const hasValue = value.length > 0;
  const active = focused || hasValue;

  const chipClass = [
    "password-chip",
    !active && hovered && "password-chip--hover",
    active && "password-chip--active",
    active && focused && "password-chip--focused",
    active && hasValue && "password-chip--filled",
  ]
    .filter(Boolean)
    .join(" ");

  async function submitPassword() {
    const password = value.trim();
    if (!password || status === "submitting") return;

    setStatus("submitting");
    play("loading");
    window.posthog?.capture("password_submitted");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        play("success");
        if (onSuccess) onSuccess();
        else window.location.assign("/work");
        return;
      }
    } catch {
      // fall through to error state
    }
    setStatus("error");
    play("error");
    controls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.4 },
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await submitPassword();
  }

  function handleChipPointerDown(event: React.PointerEvent) {
    if (event.target === inputRef.current) return;
    event.preventDefault();
    inputRef.current?.focus();
  }

  function handleBlur(event: React.FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    setFocused(false);
  }

  function handlePasswordInput(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    const now = performance.now();
    if (now - lastTypeSoundRef.current >= TYPE_SOUND_GAP_MS) {
      lastTypeSoundRef.current = now;
      if (next.length > value.length) {
        play("toggle");
      } else if (next.length < value.length) {
        play("whisper");
      }
    }
    setValue(next);
    if (status === "error") setStatus("idle");
  }

  return (
    <form className="password-form" onSubmit={handleSubmit}>
      <motion.div
        animate={controls}
        className={chipClass}
        data-cuelume-press
        data-cuelume-release
        data-cuelume-hover="tick"
        onPointerDown={handleChipPointerDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
      >
        <input
          ref={inputRef}
          type="password"
          name="password"
          value={value}
          placeholder="Enter password"
          aria-label="Password"
          autoComplete="current-password"
          disabled={status === "submitting"}
          onChange={handlePasswordInput}
        />
        {hasValue && (
          <button
            type="submit"
            className={[
              "password-chip-submit",
              submitHovered && !submitPressed && "password-chip-submit--hover",
              submitPressed && "password-chip-submit--pressed",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="Submit password"
            disabled={status === "submitting"}
            data-cuelume-press
            data-cuelume-release
            onMouseEnter={() => setSubmitHovered(true)}
            onMouseLeave={() => {
              setSubmitHovered(false);
              setSubmitPressed(false);
            }}
            onPointerDown={() => setSubmitPressed(true)}
            onPointerUp={() => setSubmitPressed(false)}
            onPointerCancel={() => setSubmitPressed(false)}
          >
            <EnterArrow />
          </button>
        )}
      </motion.div>
      {status === "error" && (
        <motion.p
          className="password-form-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          That&rsquo;s not it, try again.
        </motion.p>
      )}
    </form>
  );
}
