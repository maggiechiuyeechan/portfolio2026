/**
 * Picks one hero variant per page load and lazily loads only that scene.
 *
 * The pick happens at MODULE SCOPE — synchronously, before React's first
 * render — so the very first paint already knows which layout to use. Doing it
 * in an effect would flash the wrong layout; doing it in the component body
 * would re-roll (and burn a bag entry) on every re-render.
 */
import { lazy, useEffect, type ComponentType } from "react";
import HeroShell from "./HeroShell";
import {
  getVariant,
  HERO_VARIANTS,
  type HeroSceneProps,
  type HeroVariantId,
} from "../../config/heroVariants";
import { forcedVariant, peekNextVariant, takeVariant } from "../../lib/variantBag";

interface Props {
  name: string;
  title: string;
  tagline: string;
  /** Force a variant (deep links / screenshots). Skips the bag entirely. */
  variantId?: HeroVariantId;
}

/**
 * One lazy wrapper per registry entry. Vite still sees the literal
 * `import("...")` inside each entry's `load`, so this splits into 9 chunks.
 */
const LAZY_SCENES: Record<string, ComponentType<HeroSceneProps>> =
  Object.fromEntries(HERO_VARIANTS.map((v) => [v.id, lazy(v.load)]));

/**
 * Resolved once per page load. Order matters: a forced variant must be
 * checked BEFORE takeVariant(), or a deep link would consume a bag slot and
 * shorten the visitor's rotation.
 */
const rolledId: HeroVariantId = forcedVariant() ?? takeVariant();

export default function HeroRotator({ name, title, tagline, variantId }: Props) {
  const activeId = variantId ?? rolledId;
  const variant = getVariant(activeId) ?? HERO_VARIANTS[0]!;
  const Scene = LAZY_SCENES[variant.id]!;

  // Warm the NEXT visit's chunk once this page is idle. Speculative, so
  // prefetch (idle priority) — never preload, which would compete with the
  // scene we actually need right now.
  useEffect(() => {
    if (variantId) return; // deep link: the bag didn't move, nothing to warm
    const nextId = peekNextVariant();
    const next = nextId ? getVariant(nextId) : undefined;
    if (!next) return;

    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 1200);

    const handle = schedule(() => {
      void next.load();
      for (const href of next.assets ?? []) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle as number);
      } else {
        window.clearTimeout(handle as number);
      }
    };
  }, [variantId]);

  return (
    <HeroShell
      name={name}
      title={title}
      tagline={tagline}
      layout={variant.layout}
      noise={variant.noise}
      renderScene={(sceneProps) => <Scene {...sceneProps} />}
    />
  );
}
