import { useEffect, useRef, useState } from "react";
import { CYCLE_MS, type ClickUpFourDemoProps } from "./clickupFourDemoShared";
import boardBase from "../../assets/clickup-four-demo/wb-board-base.png";
import cursorArrowA from "../../assets/clickup-four-demo/wb-cursor-arrow-a.svg";
import cursorArrowB from "../../assets/clickup-four-demo/wb-cursor-arrow-b.svg";

/**
 * ClickUp 4.0 Whiteboards demo — Figma node 68:28756 (871x530).
 *
 * Static board = 3x export of Figma node 68:28759 ("Whiteboard", i.e. the full
 * frame minus the two frame-root collaborator cursors), with the baked-in blue
 * sticky covered by a pixel-matched dot-grid patch. Both collaborator cursors
 * and the blue sticky are rebuilt as DOM and Andrew K. drags the sticky into
 * its exact Figma position (317, 287), then types the Figma text.
 *
 * All motion timing is inferred — the Figma file has no prototype data.
 */

// ---- Figma geometry (frame coordinates, 871x530) --------------------------
const STICKY = { x: 317, y: 287, w: 97, h: 97 } as const;
const STICKY_TEXT = "Position button in lower left corner";
/** Toolbar stickies icon yellow — sampled from wb-board-base.png (Figma 68:31151). */
const STICKY_COLOR = "#ffc53d";
// Frame-root collaborator cursor instances (arrow tip = instance origin).
const CURSOR_A_REST = { x: 459, y: 256.35 } as const; // Andrew K. (68:31420)
const CURSOR_B_REST = { x: 202.3, y: 239.7 } as const; // Court S. (68:31421)
// Court nudges toward Andrew's sticky while the drag/type sequence plays.
const CURSOR_B_FOCUS = { x: 222, y: 256 } as const;
// Dot grid: pitch 14.9317, dot d=1.4932 (#e0e0e0 on #f9f9f9), lattice origin
// (40.385, 33.735) — sampled from the 3x export.
// Board size the base export is drawn at, and the three baked-in canvas cards
// (outer bounds measured off the 3x export, padded 1px so the hairline border
// survives the clip). Each is re-rendered 5% larger about its own centre.
const BOARD = { w: 871.25, h: 510 } as const;
const CARD_SCALE = 1.05;
const CARDS = [
  { key: "task", x: 131.7, y: 112.0, w: 223.1, h: 115.7 },
  { key: "doc", x: 469.5, y: 70.1, w: 173.7, h: 126.1 },
  { key: "imggen", x: 531.5, y: 257.8, w: 156.7, h: 89.5 },
] as const;
const IMGGEN_CARD = CARDS[2];
/** Figma card 68:31069 — caption node 68:31072. */
const IMGGEN_FIGMA = { w: 153.12, h: 86.91 } as const;
const IMGGEN_CAPTION = {
  offsetX: 21.835,
  offsetY: 49.513,
  width: 110,
  height: 14,
  fontSize: 8,
  lineHeight: 13.602,
} as const;

const GRID_PITCH = 14.9317;
const GRID_DOT_R = 0.7466;
const GRID_ORIGIN = { x: 40.385, y: 33.735 } as const;

// ---- Inferred timeline (matches carousel CYCLE_MS) ------------------------
const T_MOVE_TO_TOOL = 400; // cursor leaves rest position
const T_GRAB = 1000; // cursor reaches the stickies tool
const T_STICKY_IN = 1250; // new sticky popped in under cursor
const T_DROPPED = 2600; // drag ends, sticky at final position
const T_SETTLED = 2900; // settle bounce done, typing starts
const T_TYPED = 5400; // full text typed, cursor returns to rest
const T_CURSOR_HOME = CYCLE_MS;
const TYPE_MS = (T_TYPED - T_SETTLED) / STICKY_TEXT.length;

// Grab point near the stickies tool in the bottom toolbar; the cursor "carries"
// the sticky with its tip at sticky top-left + CARRY_OFFSET.
const GRAB = { x: 470, y: 445 } as const;
const CARRY_OFFSET = { x: 60, y: 50 } as const;

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
const easeOut = (p: number) => 1 - (1 - p) ** 3;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function cardPointOnBoard(card: (typeof CARDS)[number], offsetX: number, offsetY: number) {
  const cx = card.x + card.w / 2;
  const cy = card.y + card.h / 2;
  const px = offsetX * (card.w / IMGGEN_FIGMA.w);
  const py = offsetY * (card.h / IMGGEN_FIGMA.h);
  const absX = card.x + px;
  const absY = card.y + py;
  return {
    x: cx + (absX - cx) * CARD_SCALE,
    y: cy + (absY - cy) * CARD_SCALE,
  };
}

function cardScaleFactor(card: (typeof CARDS)[number]) {
  return CARD_SCALE * (card.w / IMGGEN_FIGMA.w);
}

function useDemoClock(active: boolean, paused: boolean, reducedMotion: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!active || reducedMotion) {
      elapsedRef.current = 0;
      setElapsed(0);
      return;
    }
    if (paused) return;
    let raf = 0;
    const startedAt = performance.now() - elapsedRef.current;
    const tick = (now: number) => {
      const next = Math.min(now - startedAt, T_CURSOR_HOME);
      elapsedRef.current = next;
      setElapsed(next);
      if (next < T_CURSOR_HOME) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, reducedMotion]);

  return elapsed;
}

function CollaboratorCursor({
  arrow,
  chipColor,
  name,
  x,
  y,
}: {
  arrow: string;
  chipColor: string;
  name: string;
  x: number;
  y: number;
}) {
  return (
    <div className="cu4-wb-cursor" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <img src={arrow} alt="" width={19.55} height={20.58} />
      <span className="cu4-wb-cursor-chip" style={{ backgroundColor: chipColor }}>
        {name}
      </span>
    </div>
  );
}

export default function ClickUpFourWhiteboardsDemo({ active, paused, reducedMotion }: ClickUpFourDemoProps) {
  const elapsed = useDemoClock(active, paused, reducedMotion);
  // Inactive slides hold the completed state so the crossfade always shows a
  // finished board; the clock resets on activation, restarting the sequence.
  const done = reducedMotion || !active;
  const t = done ? T_CURSOR_HOME : elapsed;

  // Sticky position/visibility.
  let stickyVisible = true;
  let stickyX: number = STICKY.x;
  let stickyY: number = STICKY.y;
  let stickyScale = 1;
  let dragging = false;
  if (!done && t < T_GRAB) {
    stickyVisible = false;
  } else if (t < T_STICKY_IN) {
    const p = easeOut(clamp01((t - T_GRAB) / (T_STICKY_IN - T_GRAB)));
    stickyVisible = true;
    stickyScale = lerp(0.5, 1, p);
    stickyX = GRAB.x - CARRY_OFFSET.x;
    stickyY = GRAB.y - CARRY_OFFSET.y;
    dragging = true;
  } else if (t < T_DROPPED) {
    const p = easeInOut(clamp01((t - T_STICKY_IN) / (T_DROPPED - T_STICKY_IN)));
    stickyX = lerp(GRAB.x - CARRY_OFFSET.x, STICKY.x, p);
    stickyY = lerp(GRAB.y - CARRY_OFFSET.y, STICKY.y, p);
    dragging = true;
  }
  const settleP = easeOut(clamp01((t - T_DROPPED) / (T_SETTLED - T_DROPPED)));
  const dragTilt = dragging ? -2.5 * Math.sin(Math.PI * clamp01((t - T_STICKY_IN) / (T_DROPPED - T_STICKY_IN))) : 0;
  const lift = dragging ? 1 : 1 - settleP;

  // Typed text — caret stays through T_TYPED so it doesn't vanish early.
  const typedCount =
    t < T_SETTLED ? 0 : Math.min(STICKY_TEXT.length, Math.floor((t - T_SETTLED) / TYPE_MS));
  const showStickyCaret = !done && t >= T_SETTLED && t < T_TYPED;

  // Andrew K. cursor position.
  let cursorX: number = CURSOR_A_REST.x;
  let cursorY: number = CURSOR_A_REST.y;
  if (t >= T_MOVE_TO_TOOL && t < T_GRAB) {
    const p = easeInOut(clamp01((t - T_MOVE_TO_TOOL) / (T_GRAB - T_MOVE_TO_TOOL)));
    cursorX = lerp(CURSOR_A_REST.x, GRAB.x, p);
    cursorY = lerp(CURSOR_A_REST.y, GRAB.y, p);
  } else if (t >= T_GRAB && t < T_TYPED) {
    cursorX = stickyX + CARRY_OFFSET.x;
    cursorY = stickyY + CARRY_OFFSET.y;
  } else if (t >= T_TYPED && t < T_CURSOR_HOME) {
    const p = easeInOut(clamp01((t - T_TYPED) / (T_CURSOR_HOME - T_TYPED)));
    cursorX = lerp(STICKY.x + CARRY_OFFSET.x, CURSOR_A_REST.x, p);
    cursorY = lerp(STICKY.y + CARRY_OFFSET.y, CURSOR_A_REST.y, p);
  }

  // Court S. — drifts toward the sticky while Andrew works, with a tiny idle wiggle.
  let courtX: number = CURSOR_B_REST.x;
  let courtY: number = CURSOR_B_REST.y;
  if (t >= T_MOVE_TO_TOOL && t < T_TYPED) {
    const engageP =
      t < T_SETTLED
        ? easeInOut(clamp01((t - T_MOVE_TO_TOOL) / (T_SETTLED - T_MOVE_TO_TOOL)))
        : 1;
    courtX = lerp(CURSOR_B_REST.x, CURSOR_B_FOCUS.x, engageP);
    courtY = lerp(CURSOR_B_REST.y, CURSOR_B_FOCUS.y, engageP);
    if (t >= T_SETTLED) {
      courtX += Math.sin(t / 380) * 1.8;
      courtY += Math.cos(t / 460) * 1.4;
    }
  } else if (t >= T_TYPED && t < T_CURSOR_HOME) {
    const p = easeInOut(clamp01((t - T_TYPED) / (T_CURSOR_HOME - T_TYPED)));
    courtX = lerp(CURSOR_B_FOCUS.x, CURSOR_B_REST.x, p);
    courtY = lerp(CURSOR_B_FOCUS.y, CURSOR_B_REST.y, p);
  }
  if (done) {
    courtX = CURSOR_B_FOCUS.x;
    courtY = CURSOR_B_FOCUS.y;
  }

  // Dot-grid patch hiding the baked-in sticky (aligned to the dot lattice).
  const patchLeft = GRID_ORIGIN.x + 16 * GRID_PITCH - GRID_PITCH / 2; // 271.83
  const patchTop = GRID_ORIGIN.y + 16 * GRID_PITCH - GRID_PITCH / 2; // 265.18
  const patch = { left: patchLeft, top: patchTop, width: 428 - patchLeft, height: 411 - patchTop };

  const imggenScale = cardScaleFactor(IMGGEN_CARD);
  const imggenCaptionPos = cardPointOnBoard(IMGGEN_CARD, IMGGEN_CAPTION.offsetX, IMGGEN_CAPTION.offsetY);
  const imggenCaptionWidth = IMGGEN_CAPTION.width * imggenScale;
  const imggenCaptionHeight = IMGGEN_CAPTION.height * imggenScale;
  const imggenCaptionFont = IMGGEN_CAPTION.fontSize * imggenScale;
  const imggenCaptionLine = IMGGEN_CAPTION.lineHeight * imggenScale;
  const imggenShimmerActive = active && !reducedMotion;

  return (
    <div className="cu4-demo-frame cu4-wb">
      <img
        className="cu4-wb-base"
        src={boardBase.src}
        width={BOARD.w}
        height={BOARD.h}
        loading="eager"
        decoding="async"
        alt={active ? "ClickUp 4.0 Whiteboards interface" : ""}
      />
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="cu4-wb-card"
          aria-hidden="true"
          style={{
            left: card.x + card.w / 2 - (card.w * CARD_SCALE) / 2,
            top: card.y + card.h / 2 - (card.h * CARD_SCALE) / 2,
            width: card.w * CARD_SCALE,
            height: card.h * CARD_SCALE,
          }}
        >
          <img
            src={boardBase.src}
            alt=""
            style={{
              left: -card.x * CARD_SCALE,
              top: -card.y * CARD_SCALE,
              width: BOARD.w * CARD_SCALE,
              height: BOARD.h * CARD_SCALE,
            }}
          />
        </div>
      ))}
      <div
        className="cu4-wb-imggen-caption-mask"
        aria-hidden="true"
        style={{
          left: imggenCaptionPos.x - 1,
          top: imggenCaptionPos.y - 1,
          width: imggenCaptionWidth + 2,
          height: imggenCaptionHeight + 2,
        }}
      />
      <p
        className={`cu4-wb-imggen-caption${imggenShimmerActive ? " is-shimmer" : ""}${imggenShimmerActive && paused ? " is-paused" : ""}`}
        aria-hidden="true"
        style={{
          left: imggenCaptionPos.x,
          top: imggenCaptionPos.y,
          width: imggenCaptionWidth,
          fontSize: imggenCaptionFont,
          lineHeight: `${imggenCaptionLine}px`,
        }}
      >
        Image generation in progress
      </p>
      <div
        className="cu4-wb-grid-patch"
        aria-hidden="true"
        style={{
          ...patch,
          backgroundImage: `radial-gradient(circle ${GRID_DOT_R}px at ${GRID_PITCH / 2}px ${GRID_PITCH / 2}px, #e0e0e0 98%, transparent)`,
          backgroundSize: `${GRID_PITCH}px ${GRID_PITCH}px`,
        }}
      />
      <div
        className="cu4-wb-sticky-mask"
        aria-hidden="true"
        style={{
          transform: `translate(${STICKY.x}px, ${STICKY.y}px)`,
          width: STICKY.w,
          height: STICKY.h,
        }}
      />
      {stickyVisible && (
        <div
          className="cu4-wb-sticky"
          aria-hidden={!done}
          style={{
            width: STICKY.w,
            height: STICKY.h,
            backgroundColor: STICKY_COLOR,
            transform: `translate(${stickyX}px, ${stickyY}px) rotate(${dragTilt}deg) scale(${stickyScale})`,
            boxShadow:
              lift > 0
                ? `0 ${4 + 8 * lift}px ${6 + 10 * lift}px ${-4 + -2 * lift}px rgba(0,0,0,0.11), 0 ${10 + 12 * lift}px ${15 + 15 * lift}px -3px rgba(0,0,0,${0.11 + 0.05 * lift})`
                : "0 4px 6px -4px rgba(0,0,0,0.11), 0 10px 15px -3px rgba(0,0,0,0.11)",
          }}
        >
          <p className="cu4-wb-sticky-text">
            {STICKY_TEXT.slice(0, typedCount)}
            {showStickyCaret ? <span className="cu4-wb-caret" aria-hidden="true" /> : null}
          </p>
        </div>
      )}
      <CollaboratorCursor
        arrow={cursorArrowB.src}
        chipColor="#a43cb4"
        name="Court S."
        x={courtX}
        y={courtY}
      />
      <CollaboratorCursor
        arrow={cursorArrowA.src}
        chipColor="#12a594"
        name="Andrew K."
        x={cursorX}
        y={cursorY}
      />
    </div>
  );
}
