import { useCallback, useEffect, useRef, useState } from "react";
import { dismissCursorLabel } from "../scripts/cursor-label";
import { usePrefersReducedMotion } from "./motion";
import { IDLE_NUDGE_ENABLED, IDLE_NUDGE_MS } from "./idleNudgeScale";

/**
 * After a short idle period, pick one item id and pulse it (see hero-idle-nudge.css
 * or idleNudgeScale for canvas scenes). The first user interaction disables further
 * nudges until the component unmounts (fresh on refresh or hero variant swap).
 */
export function useIdleNudge(itemIds: string[], enabled = true) {
  const reducedMotion = usePrefersReducedMotion();
  const active = enabled && IDLE_NUDGE_ENABLED;
  const [nudgeId, setNudgeId] = useState<string | null>(null);
  const [nudgeStartMs, setNudgeStartMs] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const idsRef = useRef(itemIds);
  idsRef.current = itemIds;

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdleNudge = useCallback(() => {
    clearIdleTimer();
    if (reducedMotion || !active || hasInteracted) return;
    idleTimerRef.current = window.setTimeout(() => {
      const list = idsRef.current;
      if (list.length === 0) return;
      const pick = list[Math.floor(Math.random() * list.length)]!;
      setNudgeId(pick);
      setNudgeStartMs(performance.now());
    }, IDLE_NUDGE_MS);
  }, [clearIdleTimer, active, hasInteracted, reducedMotion]);

  const noteInteraction = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);
    setNudgeId(null);
    setNudgeStartMs(0);
    clearIdleTimer();
    dismissCursorLabel();
  }, [clearIdleTimer, hasInteracted]);

  useEffect(() => {
    if (!active || itemIds.length === 0 || reducedMotion || hasInteracted) {
      clearIdleTimer();
      setNudgeId(null);
      setNudgeStartMs(0);
      return;
    }
    scheduleIdleNudge();
    return clearIdleTimer;
  }, [active, itemIds.length, reducedMotion, hasInteracted, scheduleIdleNudge, clearIdleTimer]);

  // Stale target (e.g. dot culled) — re-pick without counting as user interaction.
  useEffect(() => {
    if (hasInteracted || !nudgeId || idsRef.current.includes(nudgeId)) return;
    setNudgeId(null);
    setNudgeStartMs(0);
    scheduleIdleNudge();
  }, [hasInteracted, itemIds.length, nudgeId, scheduleIdleNudge]);

  return { nudgeId, nudgeStartMs, noteInteraction, hasInteracted };
}
