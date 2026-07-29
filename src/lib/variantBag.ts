/**
 * Shuffle-bag rotation for hero variants.
 *
 * Semantics: every visitor sees all N variants in a random order before any
 * repeats. When the bag empties it refills with a fresh shuffle, and the
 * refill is biased so the new cycle never opens with the variant that closed
 * the previous one (otherwise ~1-in-N of cycle boundaries look like a repeat).
 *
 * State lives in localStorage so it survives tab closes. Every access is
 * wrapped — Safari private mode and hardened privacy settings throw on
 * localStorage access, and a hero that crashes because storage is unavailable
 * is a far worse outcome than a hero that just picks randomly.
 *
 * This module is client-only and must be imported from an island, never from
 * a prerendered .astro frontmatter block.
 */
import {
  eligibleVariantIds,
  getVariant,
  type HeroVariantId,
} from "../config/heroVariants";

const STORAGE_KEY = "hero:bag:v1";
const NARROW_QUERY = "(max-width: 48rem)";

interface BagState {
  /** Ids not yet shown in the current cycle, in the order they'll appear. */
  remaining: HeroVariantId[];
  /** Last id actually shown — used to avoid a cycle-boundary repeat. */
  last: HeroVariantId | null;
}

/** In-memory fallback when localStorage is unavailable. */
let memoryState: BagState | null = null;

function readState(): BagState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryState;
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as BagState).remaining)
    ) {
      return null;
    }
    const state = parsed as BagState;
    // Drop ids that no longer exist in the registry (variant was deleted).
    state.remaining = state.remaining.filter((id) => getVariant(id));
    return state;
  } catch {
    return memoryState;
  }
}

function writeState(state: BagState): void {
  memoryState = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota, private mode, or storage disabled — memoryState carries us */
  }
}

/** Fisher–Yates, unbiased. */
function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Build a fresh cycle. If `avoidFirst` would land in slot 0 and there is more
 * than one option, swap it with a random later slot so consecutive visits
 * never show the same variant twice.
 */
function refill(pool: HeroVariantId[], avoidFirst: HeroVariantId | null): HeroVariantId[] {
  const next = shuffle(pool);
  if (avoidFirst && next.length > 1 && next[0] === avoidFirst) {
    const swapWith = 1 + Math.floor(Math.random() * (next.length - 1));
    [next[0], next[swapWith]] = [next[swapWith]!, next[0]!];
  }
  return next;
}

/**
 * Pick the variant for this page load and advance the bag.
 *
 * Call exactly once, at module scope inside the hero island, so the choice is
 * made synchronously before React's first render. Calling it twice (e.g. in a
 * component body that re-renders) burns two entries per visit.
 */
export function takeVariant(): HeroVariantId {
  const isNarrow =
    typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches;
  const pool = eligibleVariantIds(isNarrow);

  // Should never happen, but a registry misconfiguration shouldn't blank the page.
  if (pool.length === 0) return "meadow";

  const state = readState() ?? { remaining: [], last: null };

  // Find the first entry that's eligible right now. A desktop-only variant
  // already sitting in the bag is skipped over — not consumed — so it survives
  // for a later wide-viewport visit instead of being wasted on a phone.
  //
  // Note the asymmetry: a bag REFILLED on a narrow viewport is built from the
  // narrow pool, so it contains no desktop-only ids at all. Those reappear at
  // the next refill that happens on a wide viewport. That's intentional — the
  // alternative (carrying ineligible ids through every cycle) makes the phone
  // rotation shorter in a way that's invisible and hard to reason about.
  let index = state.remaining.findIndex((id) => pool.includes(id));

  if (index === -1) {
    state.remaining = refill(pool, state.last);
    index = 0;
  }

  const picked = state.remaining[index]!;
  state.remaining = state.remaining.filter((_, i) => i !== index);
  state.last = picked;
  writeState(state);

  return picked;
}

/**
 * The variant queued for the visitor's NEXT load, if one is known.
 * Used to emit <link rel="prefetch"> so the following visit is warm.
 * Returns null when the bag is empty (next visit triggers a reshuffle).
 */
export function peekNextVariant(): HeroVariantId | null {
  const isNarrow =
    typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches;
  const pool = eligibleVariantIds(isNarrow);
  const state = readState();
  if (!state) return null;
  return state.remaining.find((id) => pool.includes(id)) ?? null;
}

/** Progress through the current cycle — handy for a dev-only HUD. */
export function bagProgress(): { seen: number; total: number } {
  const isNarrow =
    typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches;
  // Compute the pool ONCE — this used to call eligibleVariantIds() inside the
  // filter predicate, rebuilding the whole array for every remaining entry.
  const pool = eligibleVariantIds(isNarrow);
  const state = readState();
  const remaining = state
    ? state.remaining.filter((id) => pool.includes(id)).length
    : pool.length;
  return { seen: pool.length - remaining, total: pool.length };
}

/** Clear rotation history. Wire this to a dev-only keyboard shortcut. */
export function resetBag(): void {
  memoryState = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

/**
 * Force a specific variant for this load without touching the bag.
 * Reads `?v=<id>` from the URL — powers the /versions/[id] deep links and
 * lets you screenshot a specific hero without burning a rotation slot.
 */
export function forcedVariant(): HeroVariantId | null {
  if (typeof window === "undefined") return null;
  const requested = new URLSearchParams(window.location.search).get("v");
  if (requested && getVariant(requested)) return requested as HeroVariantId;
  return null;
}
