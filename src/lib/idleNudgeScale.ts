/** Shared idle invite pulse — matches hero-idle-nudge.css keyframes. */
export const IDLE_NUDGE_MS = 5 * 1000;
export const IDLE_NUDGE_PULSE_MS = 5000;
export const IDLE_NUDGE_SCALE = 1.075;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Scale for canvas dots/shapes during the idle nudge pulse. */
export function idleNudgeScale(
  now: number,
  nudgeStartMs: number,
  peakScale = IDLE_NUDGE_SCALE,
): number {
  const elapsed = (now - nudgeStartMs) % IDLE_NUDGE_PULSE_MS;
  const t = elapsed / IDLE_NUDGE_PULSE_MS;

  if (t < 0.12 || t >= 0.34) return 1;
  if (t >= 0.18 && t < 0.28) return peakScale;
  if (t < 0.18) {
    const u = (t - 0.12) / 0.06;
    return 1 + (peakScale - 1) * easeInOut(u);
  }
  const u = (t - 0.28) / 0.06;
  return peakScale + (1 - peakScale) * easeInOut(u);
}
