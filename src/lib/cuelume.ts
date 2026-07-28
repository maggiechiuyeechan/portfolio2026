/**
 * Boot Cuelume as early as possible (before React islands hydrate).
 * Browsers block Web Audio until a user gesture — unlock on first tap/key.
 */
import { bind, play, setEnabled, setVolume } from "cuelume";

const UI_VOLUME = 1;
let unlocked = false;

/** Resume the shared AudioContext during a user gesture (click / tap / key). */
export function unlockCuelume() {
  if (unlocked || typeof document === "undefined") return;
  unlocked = true;
  // Warm the shared AudioContext during the gesture so later cues work.
  play("tick", { volume: 0.12 });
}

export function initCuelume() {
  if (typeof document === "undefined") return;

  setEnabled(true);
  setVolume(UI_VOLUME);
  bind();

  const unlock = () => unlockCuelume();

  document.addEventListener("pointerdown", unlock, { once: true, capture: true });
  document.addEventListener("keydown", unlock, { once: true, capture: true });
}
