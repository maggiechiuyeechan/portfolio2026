/**
 * Throttled, quieter Cuelume cues for hero background interactions.
 * Sounds play only from scene handlers when the cursor hits a dot, shape, tile, etc.
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

/**
 * `key` is the THROTTLE bucket, not a sound id — scenes pass descriptive
 * strings like "physics-pop" so two different scenes sharing one cue still
 * throttle independently. It must be typed `string`: letting it infer from
 * the `= sound` default constrained it to SoundName and made every
 * descriptive key a type error.
 */
export function playHeroSound(sound: SoundName, key: string = sound) {
  if (prefersReducedMotion()) return;

  const now = performance.now();
  const last = lastPlayed.get(key) ?? -Infinity;
  if (now - last < THROTTLE_MS) return;
  lastPlayed.set(key, now);

  play(sound, { volume: BG_VOLUME });
}

/**
 * Call from pointerdown handlers so click + sound share the same gesture.
 * `key` is a throttle bucket, same as playHeroSound — see the note there.
 */
export function playHeroSoundOnClick(sound: SoundName, key: string = sound) {
  unlockCuelume();
  playHeroSound(sound, key);
}
