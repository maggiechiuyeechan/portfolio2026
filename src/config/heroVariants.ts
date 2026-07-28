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

/** How the shell arranges itself around the scene. */
export type HeroLayout =
  /** Scene is an inline element stacked above the name (meadow video). */
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
   * Assets the scene needs immediately. Used to emit <link rel="prefetch">
   * for the NEXT variant in the bag, so the following visit is warm.
   */
  assets?: string[];
  /** Lazily-loaded scene component. Must be a static import specifier. */
  load: () => Promise<{ default: ComponentType<HeroSceneProps> }>;
}

/** Props every scene component receives from the shell. */
export interface HeroSceneProps {
  /** Refs to the copy blocks, so physics scenes can treat them as obstacles. */
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
  /** Motion variants from the shell's stagger container. Undefined = reduced motion. */
  variants?: Record<string, unknown>;
  reducedMotion?: boolean;
}

export const HERO_VARIANTS: HeroVariant[] = [
  {
    id: "meadow",
    label: "Meadow ripple",
    note: "Version O — halftone WebGL ripple over the grass video.",
    layout: "inline-avatar",
    assets: ["/images/meadow.mp4", "/images/meadow-poster.webp"],
    load: () => import("../components/hero/scenes/MeadowScene"),
  },
  {
    id: "tiles",
    label: "Tile stack",
    note: "Version B — falling tile physics, full canvas.",
    layout: "full-canvas",
    load: () => import("../components/hero/scenes/TilesScene"),
  },
  {
    id: "shapes-c",
    label: "Organic shapes",
    note: "Version C — full-canvas physics with organic Figma shapes.",
    layout: "full-canvas",
    load: () => import("../components/hero/scenes/ShapesCScene"),
  },
  {
    id: "shapes-d-desk",
    label: "Paper desk",
    note: "Version F — draggable paper desk, multiply blend (node 327:60168).",
    layout: "full-canvas",
    load: () => import("../components/hero/scenes/ShapeDeskScene"),
  },
  {
    id: "grid-sprinkle-i",
    label: "Grid sprinkle",
    note: "Version I — 28px grid, sprinkled multiply dots (node 354:82).",
    layout: "full-canvas",
    load: () => import("../components/hero/scenes/GridSprinkleScene"),
  },
  {
    id: "shape-collage",
    label: "Collage",
    note: "Version L — four randomly placed multiply collage shapes (node 354:60407).",
    layout: "full-canvas",
    load: () => import("../components/hero/scenes/ShapeCollageScene"),
  },
  {
    id: "botanical",
    label: "Botanical stipple",
    note: "Version M — botanical dot illustration, 25s stipple-in (node 354:79447).",
    layout: "full-canvas",
    desktopOnly: true,
    load: () => import("../components/hero/scenes/BotanicalScene"),
  },
  {
    id: "editable-blobs",
    label: "Editable blobs",
    note: "Version N — non-overlapping organic shapes, editable nodes on hover.",
    layout: "full-canvas",
    load: () => import("../components/hero/scenes/EditableBlobsScene"),
  },
  {
    id: "monsters",
    label: "Monsters",
    note: "Version J — monster illustration perched on the name, pupils track cursor.",
    layout: "perched",
    noise: true,
    load: () => import("../components/hero/scenes/MonstersScene"),
  },
];

const BY_ID = new Map(HERO_VARIANTS.map((v) => [v.id, v]));

export function getVariant(id: string): HeroVariant | undefined {
  return BY_ID.get(id as HeroVariantId);
}

/** Ids eligible for rotation at the current viewport. */
export function eligibleVariantIds(isNarrow: boolean): HeroVariantId[] {
  return HERO_VARIANTS.filter((v) => !(isNarrow && v.desktopOnly)).map((v) => v.id);
}

export const ALL_VARIANT_IDS: HeroVariantId[] = HERO_VARIANTS.map((v) => v.id);
