/**
 * Boot Cuelume as early as possible (before React islands hydrate).
 *
 * Browsers block Web Audio until a user gesture (click / tap / key).
 * Unlock happens on pointerdown / keydown only — not on background hover.
 */
import { bind, play, setEnabled, setVolume } from "cuelume";

const UI_VOLUME = 0.75;

let gestureUnlocked = false;

/** Resume the shared AudioContext during a user gesture (click / tap / key). */
export function unlockCuelume() {
  if (gestureUnlocked || typeof document === "undefined") return;
  gestureUnlocked = true;
  play("tick", { volume: 0.12 });
}

export function initCuelume() {
  if (typeof document === "undefined") return;

  setEnabled(true);
  setVolume(UI_VOLUME);
  bind();

  const unlockFromGesture = () => unlockCuelume();

  document.addEventListener("pointerdown", unlockFromGesture, { capture: true });
  document.addEventListener("keydown", unlockFromGesture, { capture: true });
}
