/**
 * Shared contract for the four ClickUp 4.0 carousel demos.
 *
 * - `active`: this slide is the currently selected tab. A demo should run its
 *   ~6s sequence only while `active && !paused`, and restart the sequence from
 *   the beginning whenever `active` flips from false to true.
 * - `paused`: the carousel is offscreen. Freeze timers/RAF.
 * - `reducedMotion`: user prefers reduced motion. Render the completed static
 *   state; no shimmer/typing/drag/shake.
 */
export interface ClickUpFourDemoProps {
  active: boolean;
  paused: boolean;
  reducedMotion: boolean;
}
