/**
 * Picks one hero variant per page load and lazily loads only that scene.
 *
 * The pick happens at MODULE SCOPE — synchronously, before React's first
 * render — so the very first paint already knows which layout to use. Doing it
 * in an effect would flash the wrong layout; doing it in the component body
 * would re-roll (and burn a bag entry) on every re-render.
 */
import { lazy, useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import HeroShell from "./HeroShell";
import {
  eligibleVariantIds,
  getVariant,
  HERO_VARIANTS,
  type HeroSceneProps,
  type HeroVariantId,
} from "../../config/heroVariants";
import { forcedVariant, peekNextVariant, takeSurpriseVariant, takeVariant } from "../../lib/variantBag";

/** Match hero.css `--hero-scene-swap-duration` — keep outgoing art up until faded. */
const SCENE_SWAP_MS = 400;

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
 * Resolved at most once per page load, and ONLY when this page actually needs
 * a roll.
 *
 * This used to be a module-scope `const rolledId = forcedVariant() ??
 * takeVariant()`, which ran unconditionally — before the `variantId` prop was
 * ever read. /versions/<id> passes an explicit variantId and carries no `?v=`
 * param, so forcedVariant() returned null, takeVariant() ran anyway, and its
 * result was thrown away. Every visit to a versions page silently consumed a
 * bag slot and shortened the real rotation on /, directly contradicting the
 * doc comment on that route.
 *
 * Memoised so React StrictMode's double-invoke can't burn two slots either.
 */
let memoisedRoll: HeroVariantId | null = null;

function getRolledId(): HeroVariantId {
  if (memoisedRoll === null) memoisedRoll = forcedVariant() ?? takeVariant();
  return memoisedRoll;
}

/** Kick the scene chunk + current assets ASAP — don't wait for Suspense / idle. */
function warmVariant(id: HeroVariantId) {
  const variant = getVariant(id);
  if (!variant) return Promise.reject(new Error(`Unknown hero variant: ${id}`));
  const load = variant.load();
  // Initial and speculative warmups are intentionally fire-and-forget, but
  // their failures must not become unhandled rejections in the browser.
  void load.catch(() => undefined);
  if (typeof document === "undefined") return;
  for (const href of variant.assets ?? []) {
    if (document.head.querySelector(`link[data-hero-preload="${href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = href.endsWith(".mp4") || href.endsWith(".webm") ? "video" : "image";
    link.dataset.heroPreload = href;
    document.head.appendChild(link);
  }
  return load;
}

export default function HeroRotator({ name, title, tagline, variantId }: Props) {
  // Lazy initialiser: getRolledId() is not called at all when variantId is set.
  const [activeId, setActiveId] = useState<HeroVariantId>(() => {
    const id = variantId ?? getRolledId();
    warmVariant(id);
    return id;
  });
  const [playEntrance, setPlayEntrance] = useState(true);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const swappingRef = useRef(false);
  const swapTimerRef = useRef(0);
  const variant = getVariant(activeId) ?? HERO_VARIANTS[0]!;
  const Scene = LAZY_SCENES[variant.id]!;

  useEffect(() => {
    return () => {
      window.clearTimeout(swapTimerRef.current);
      delete document.body.dataset.heroSceneExiting;
      delete document.body.dataset.heroSceneEntering;
      swappingRef.current = false;
    };
  }, []);

  const handleSurprise = useCallback(async () => {
    if (swappingRef.current) return;
    swappingRef.current = true;
    setPlayEntrance(false);
    if (window.location.pathname !== "/" || window.location.search) {
      window.history.replaceState(null, "", "/");
    }

    const currentId = activeIdRef.current;
    const firstChoice = takeSurpriseVariant(currentId);
    const isNarrow = window.matchMedia("(max-width: 48rem)").matches;
    const fallbackChoices = eligibleVariantIds(isNarrow, { includeSurpriseOnly: true })
      .filter((id) => id !== currentId && id !== firstChoice)
      .sort(() => Math.random() - 0.5);
    const candidates = [firstChoice, ...fallbackChoices];

    let nextId: HeroVariantId | null = null;
    let loadError: unknown;
    for (const candidate of candidates) {
      try {
        await warmVariant(candidate);
        nextId = candidate;
        break;
      } catch (error) {
        loadError = error;
      }
    }

    if (!nextId) {
      // Keep the current scene visible if every eligible chunk fails.
      console.error("[hero] Could not load a surprise scene", loadError);
      swappingRef.current = false;
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setActiveId(nextId);
      swappingRef.current = false;
      return;
    }

    // Fade the portaled scene out in place, then remount the next variant.
    // Scenes render under document.body, so a React wrapper fade would miss them.
    delete document.body.dataset.heroSceneEntering;
    document.body.dataset.heroSceneExiting = "";

    window.clearTimeout(swapTimerRef.current);
    swapTimerRef.current = window.setTimeout(() => {
      delete document.body.dataset.heroSceneExiting;
      document.body.dataset.heroSceneEntering = "";
      setActiveId(nextId);
      swappingRef.current = false;
      swapTimerRef.current = window.setTimeout(() => {
        delete document.body.dataset.heroSceneEntering;
      }, SCENE_SWAP_MS);
    }, SCENE_SWAP_MS);
  }, []);

  // Warm the NEXT visit's chunk once this page is idle. Speculative, so
  // prefetch (idle priority) — never preload, which would compete with the
  // scene we actually need right now.
  useEffect(() => {
    const nextId = peekNextVariant();
    const next = nextId ? getVariant(nextId) : undefined;
    if (!next) return;

    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 1200);

    const handle = schedule(() => {
      void next.load().catch(() => undefined);
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
  }, [activeId]);

  return (
    <HeroShell
      name={name}
      title={title}
      tagline={tagline}
      variantId={variant.id}
      layout={variant.layout}
      noise={variant.noise}
      playEntrance={playEntrance}
      onSurprise={handleSurprise}
      renderScene={(sceneProps) => <Scene {...sceneProps} />}
    />
  );
}
