/**
 * Sequenced rotation for hero variants.
 *
 * The first visit (no stored id) shows Meadow. Every later return to the hero
 * — reload, back button, typed URL, link, new tab — advances to the next id
 * in `HERO_ROTATION_ORDER`, then wraps. Variants marked `surpriseOnly` stay
 * out of this sequence; "Surprise me" does not consume a slot.
 *
 * The last sequenced id lives in localStorage so a later visit can pick up
 * where the previous one left off. Every access is wrapped — Safari private
 * mode and hardened privacy settings throw on localStorage, and a hero that
 * crashes because storage is unavailable is worse than one that just shows
 * Meadow.
 *
 * This module is client-only and must be imported from an island, never from
 * a prerendered .astro frontmatter block.
 */
import {
  eligibleVariantIds,
  getVariant,
  HERO_ROTATION_ORDER,
  type HeroVariantId,
} from "../config/heroVariants";

const STORAGE_KEY = "hero:seq:v1";
const NARROW_QUERY = "(max-width: 48rem)";

interface SeqState {
  /** Last id shown by the sequence (not by Surprise me). */
  last: HeroVariantId | null;
}

/** In-memory fallback when localStorage is unavailable. */
let memoryState: SeqState | null = null;

function readState(): SeqState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryState;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const last = (parsed as SeqState).last;
    if (last != null && !getVariant(last)) return { last: null };
    return { last: last ?? null };
  } catch {
    return memoryState;
  }
}

function writeState(state: SeqState): void {
  memoryState = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota, private mode, or storage disabled — memoryState carries us */
  }
}

function currentPool(): HeroVariantId[] {
  const isNarrow =
    typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches;
  const allowed = new Set(eligibleVariantIds(isNarrow));
  const ordered = HERO_ROTATION_ORDER.filter((id) => allowed.has(id));
  for (const id of allowed) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

function firstInSequence(pool: HeroVariantId[]): HeroVariantId {
  if (pool.includes("meadow")) return "meadow";
  return pool[0] ?? "meadow";
}

function nextInSequence(pool: HeroVariantId[], last: HeroVariantId | null): HeroVariantId {
  if (!last) return firstInSequence(pool);
  const index = pool.indexOf(last);
  if (index === -1) return firstInSequence(pool);
  return pool[(index + 1) % pool.length]!;
}

/**
 * Pick the variant for this hero visit and advance the sequence.
 *
 * Call once per visit (memoised in the hero island) so React re-renders
 * don't burn two entries. Browser-back from bfcache is a second visit —
 * HeroRotator listens for `pageshow` and calls this again.
 */
export function takeVariant(): HeroVariantId {
  const pool = currentPool();
  if (pool.length === 0) return "meadow";

  const picked = nextInSequence(pool, readState()?.last ?? null);
  writeState({ last: picked });
  return picked;
}

/**
 * Pick a variant for "Surprise me" — includes surprise-only entries (e.g.
 * organic shapes) and never consumes a slot from the visit sequence.
 */
export function takeSurpriseVariant(exclude: HeroVariantId): HeroVariantId {
  const isNarrow =
    typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches;
  const pool = eligibleVariantIds(isNarrow, { includeSurpriseOnly: true });
  const candidates = pool.filter((id) => id !== exclude);
  if (candidates.length === 0) return pool[0] ?? "meadow";
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

/**
 * The variant queued for the visitor's NEXT hero visit, if one is known.
 * Used to emit <link rel="prefetch"> so the following visit is warm.
 */
export function peekNextVariant(): HeroVariantId | null {
  const pool = currentPool();
  if (pool.length === 0) return null;
  return nextInSequence(pool, readState()?.last ?? null);
}

/** Progress through the current cycle — handy for a dev-only HUD. */
export function bagProgress(): { seen: number; total: number } {
  const pool = currentPool();
  const last = readState()?.last ?? null;
  const index = last ? pool.indexOf(last) : -1;
  return { seen: index + 1, total: pool.length };
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
 * Force a specific variant for this load without touching the sequence.
 * Reads `?v=<id>` from the URL — powers the /versions/[id] deep links and
 * lets you screenshot a specific hero without burning a rotation slot.
 */
export function forcedVariant(): HeroVariantId | null {
  if (typeof window === "undefined") return null;
  const requested = new URLSearchParams(window.location.search).get("v");
  if (requested && getVariant(requested)) return requested as HeroVariantId;
  return null;
}
