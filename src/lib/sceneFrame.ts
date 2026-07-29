/** Matches --single-column-break / hero scene frame mobile cutoff. */
export const SCENE_FRAME_MOBILE_MAX_PX = 660;

export interface SceneFrameBounds {
  active: boolean;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function remPx(value: string, rootFontSize: number) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n * rootFontSize : 0;
}

/** Play area inside the hero scene frame (full viewport when frame is off or mobile). */
export function getSceneFrameBounds(
  viewportWidth: number,
  viewportHeight: number,
): SceneFrameBounds {
  const full = {
    active: false,
    left: 0,
    top: 0,
    right: viewportWidth,
    bottom: viewportHeight,
    width: viewportWidth,
    height: viewportHeight,
  };

  if (typeof document === "undefined") return full;

  const frameOn =
    document.body.dataset.heroSceneFrame !== undefined &&
    viewportWidth > SCENE_FRAME_MOBILE_MAX_PX;

  if (!frameOn) return full;

  const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const bodyStyle = getComputedStyle(document.body);
  const inset = remPx(bodyStyle.getPropertyValue("--hero-scene-frame-inset").trim(), rootSize) || 48;

  return {
    active: true,
    left: inset,
    top: inset,
    right: viewportWidth - inset,
    bottom: viewportHeight - inset,
    width: viewportWidth - inset * 2,
    height: viewportHeight - inset * 2,
  };
}
