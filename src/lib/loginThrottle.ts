/**
 * Per-client exponential backoff for the password endpoint.
 *
 * WHY
 * The whole site sits behind one shared password with a 30-day cookie, and
 * /api/auth accepted unlimited POSTs. That is a few lines of script to walk a
 * wordlist through.
 *
 * SCOPE — READ THIS BEFORE TRUSTING IT
 * State lives in module memory. On Vercel that means per warm function
 * instance, so it is genuinely defeatable by an attacker who can force cold
 * starts or spread requests across regions. It stops casual scripted guessing
 * and costs nothing; it is not a substitute for a shared store.
 *
 * If this ever guards something worth guarding, swap the two functions below
 * for @upstash/ratelimit backed by Redis — the call sites don't change.
 */

/** Failures allowed at full speed before backoff starts. */
const FREE_ATTEMPTS = 5;
/** First penalty, doubled per subsequent failure. */
const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 60_000;
/** Drop a client's record once it has been quiet this long. */
const IDLE_RESET_MS = 15 * 60_000;
/** Hard ceiling on tracked clients, so this can't be turned into a memory leak. */
const MAX_TRACKED = 10_000;

interface Attempt {
  count: number;
  /** Epoch ms before which the next attempt is refused. */
  blockedUntil: number;
  lastSeen: number;
}

const attempts = new Map<string, Attempt>();

function sweep(now: number) {
  for (const [key, record] of attempts) {
    if (now - record.lastSeen > IDLE_RESET_MS) attempts.delete(key);
  }
  // Still oversized after the idle sweep — evict oldest-seen first. Map
  // preserves insertion order, which is close enough for a safety valve.
  if (attempts.size > MAX_TRACKED) {
    const excess = attempts.size - MAX_TRACKED;
    let i = 0;
    for (const key of attempts.keys()) {
      if (i++ >= excess) break;
      attempts.delete(key);
    }
  }
}

/**
 * Identify the caller. Vercel sets x-forwarded-for; the leftmost entry is the
 * client. Falls back to a single shared bucket, which degrades to a global
 * throttle rather than to no throttle at all.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

/** Milliseconds the caller must wait, or 0 if they may try now. */
export function retryAfterMs(key: string, now = Date.now()): number {
  const record = attempts.get(key);
  if (!record) return 0;
  if (now - record.lastSeen > IDLE_RESET_MS) {
    attempts.delete(key);
    return 0;
  }
  return Math.max(0, record.blockedUntil - now);
}

/** Record a failed attempt and return the delay now imposed. */
export function noteFailure(key: string, now = Date.now()): number {
  sweep(now);

  const record = attempts.get(key) ?? { count: 0, blockedUntil: 0, lastSeen: now };
  record.count += 1;
  record.lastSeen = now;

  const over = record.count - FREE_ATTEMPTS;
  const delay =
    over > 0 ? Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (over - 1)) : 0;
  record.blockedUntil = now + delay;

  attempts.set(key, record);
  return delay;
}

/** Successful login — clear the record so a typo streak isn't held against them. */
export function noteSuccess(key: string): void {
  attempts.delete(key);
}

/** Test seam. */
export function resetThrottle(): void {
  attempts.clear();
}
