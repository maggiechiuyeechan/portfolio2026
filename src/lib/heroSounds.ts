/**
 * Throttled, quieter Cuelume cues for hero background interactions.
 *
 * Browsers (and Cuelume) block audio until the visitor has clicked, tapped,
 * or typed once. Hover-only scenes cannot be the first sound — use click or
 * call unlockCuelume() from a pointerdown handler first.
 */
import { play, type SoundName } from "cuelume";
import { unlockCuelume } from "./cuelume";

const BG_VOLUME = 0.4;
const THROTTLE_MS = 150;

const lastPlayed = new Map<string, number>();

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function playHeroSound(sound: SoundName, key = sound) {
  if (prefersReducedMotion()) return;

  const now = performance.now();
  const last = lastPlayed.get(key) ?? -Infinity;
  if (now - last < THROTTLE_MS) return;
  lastPlayed.set(key, now);
  play(sound, { volume: BG_VOLUME });
}

/** Call from pointerdown handlers so click + sound share the same gesture. */
export function playHeroSoundOnClick(sound: SoundName, key = sound) {
  unlockCuelume();
  playHeroSound(sound, key);
}
