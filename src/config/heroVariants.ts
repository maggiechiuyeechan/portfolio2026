/**
 * Hero variant registry — the single source of truth for every hero scene.
 *
 * Each entry owns:
 *   - the props the shared <HeroEntrance> shell needs to lay itself out
 *   - a `load()` that dynamically imports ONLY that variant's scene chunk
 *
 * Adding a variant means adding one entry here. Nothing else changes:
 * the rotation bag, the /versions/[id] deep links, and the lazy chunk
 * splitting all derive from this array.
 *
 * IMPORTANT: `load` must be a bare `() => import("...")` with a static
 * string literal. Vite can only code-split when it can see the specifier
 * at build time — template strings or variables silently collapse the
 * whole registry back into one chunk.
 */
import type { ComponentType } from "react";
import type { Variants } from "motion/react";

export type HeroVariantId =
  | "meadow"
  | "tiles"
  | "shapes-c"
  | "shapes-d-desk"
  | "grid-sprinkle-i"
  | "shape-collage"
  | "botanical"
  | "editable-blobs"
  | "monsters";

/** Cursor-label copy shown by the global cursor pill (lowercase in source; caption styles uppercase it). */
export type HeroCursorLabel = string;

/** How the shell arranges itself around the scene. */
export type HeroLayout =
  /** Scene stacked above the name inside the copy column (reserved). */
  | "inline-avatar"
  /** Scene is a full-viewport canvas behind the copy. */
  | "full-canvas"
  /** Scene perches on top of the name inside the copy stack. */
  | "perched";

export interface HeroVariant {
  id: HeroVariantId;
  /** Human label — used in the dev switcher and the deep-link routes. */
  label: string;
  /** One line for your own reference; not rendered. */
  note: string;
  layout: HeroLayout;
  /** Fixed film-grain overlay above the scene, under the copy. */
  noise?: boolean;
  /**
   * Excluded from rotation below 48rem. Physics-heavy scenes that were
   * authored against a desktop canvas and don't reflow.
   */
  desktopOnly?: boolean;
  /**
   * Only reachable via "Surprise me", never on a natural first landing or
   * bag rotation reload.
   */
  surpriseOnly?: boolean;
  /**
   * Assets the scene needs immediately. Used to emit <link rel="prefetch">
   * for the NEXT variant in the bag, so the following visit is warm.
   */
  assets?: string[];
  /** 2rem background-main inset frame around the full-canvas scene. */
  sceneFrame?: boolean;
  /**
   * Paint a gray grid from the shell before the lazy scene chunk arrives.
   * Needed on mobile where the scene-frame mat is hidden and the real
   * backdrop lives inside the scene bundle.
   */
  earlyBackdrop?: "grid";
  /** Affordance verb shown by the global cursor-label pill. Omit when none. */
  cursorLabel?: HeroCursorLabel;
  /** Lazily-loaded scene component. Must be a static import specifier. */
  load: () => Promise<{ default: ComponentType<HeroSceneProps> }>;
}

/** Props every scene component receives from the shell. */
export interface HeroSceneProps {
  /** Refs to the copy blocks, so physics scenes can treat them as obstacles. */
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
  /**
   * Motion variants from the shell's stagger container. Undefined = reduced
   * motion. Typed as motion's own `Variants` so scenes can spread it straight
   * onto a `motion.*` element without a cast.
   */
  variants?: Variants;
  reducedMotion?: boolean;
}

export const HERO_VARIANTS: HeroVariant[] = [
  {
    id: "meadow",
    label: "Meadow ripple",
    note: "Version O — halftone WebGL ripple over the grass video.",
    layout: "full-canvas",
    cursorLabel: "click on image",
    assets: ["/images/meadow.mp4", "/images/meadow-poster.webp"],
    load: () => import("../components/hero/scenes/MeadowScene"),
  },
  {
    id: "tiles",
    label: "Tile stack",
    note: "Version B — falling tile physics, full canvas.",
    layout: "full-canvas",
    sceneFrame: true,
    surpriseOnly: true,
    cursorLabel: "hover on tiles",
    load: () => import("../components/hero/scenes/TilesScene"),
  },
  {
    id: "shapes-c",
    label: "Organic shapes",
    note: "Version C — full-canvas physics with organic Figma shapes.",
    layout: "full-canvas",
    sceneFrame: true,
    surpriseOnly: true,
    cursorLabel: "hover on shapes",
    load: () => import("../components/hero/scenes/ShapesCScene"),
  },
  {
    id: "shapes-d-desk",
    label: "Paper desk",
    note: "Version F — draggable paper desk, multiply blend (node 327:60168).",
    layout: "full-canvas",
    sceneFrame: true,
    cursorLabel: "Drag & click on shapes",
    load: () => import("../components/hero/scenes/ShapeDeskScene"),
  },
  {
    id: "grid-sprinkle-i",
    label: "Grid sprinkle",
    note: "Version I — 28px grid, sprinkled multiply dots (node 354:82).",
    layout: "full-canvas",
    sceneFrame: true,
    earlyBackdrop: "grid",
    cursorLabel: "hover on dots, click to reload",
    load: () => import("../components/hero/scenes/GridSprinkleScene"),
  },
  {
    id: "shape-collage",
    label: "Collage",
    note: "Version L — four randomly placed multiply collage shapes (node 354:60407).",
    layout: "full-canvas",
    sceneFrame: true,
    earlyBackdrop: "grid",
    surpriseOnly: true,
    cursorLabel: "hover on shapes, click to reload",
    load: () => import("../components/hero/scenes/ShapeCollageScene"),
  },
  {
    id: "botanical",
    label: "Botanical stipple",
    note: "Version M — botanical dot illustration, 50s stipple-in (node 354:79447).",
    layout: "full-canvas",
    desktopOnly: true,
    surpriseOnly: true,
    cursorLabel: "Click on background",
    load: () => import("../components/hero/scenes/BotanicalScene"),
  },
  {
    id: "editable-blobs",
    label: "Editable blobs",
    note: "Version N — non-overlapping organic shapes, editable nodes on hover.",
    layout: "full-canvas",
    sceneFrame: true,
    cursorLabel: "Drag and edit shapes",
    load: () => import("../components/hero/scenes/EditableBlobsScene"),
  },
  {
    id: "monsters",
    label: "Monsters",
    note: "Version J — monster illustration perched on the name, pupils track cursor.",
    layout: "full-canvas",
    noise: true,
    cursorLabel: "move around",
    load: () => import("../components/hero/scenes/MonstersScene"),
  },
];

const BY_ID = new Map(HERO_VARIANTS.map((v) => [v.id, v]));

export function getVariant(id: string): HeroVariant | undefined {
  return BY_ID.get(id as HeroVariantId);
}

/** Ids eligible for rotation at the current viewport. */
export function eligibleVariantIds(
  isNarrow: boolean,
  opts?: { includeSurpriseOnly?: boolean },
): HeroVariantId[] {
  const includeSurpriseOnly = opts?.includeSurpriseOnly ?? false;
  return HERO_VARIANTS.filter((v) => {
    if (isNarrow && v.desktopOnly) return false;
    if (!includeSurpriseOnly && v.surpriseOnly) return false;
    return true;
  }).map((v) => v.id);
}
