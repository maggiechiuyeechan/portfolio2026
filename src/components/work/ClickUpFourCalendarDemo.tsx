import { useEffect, useRef } from "react";
import { CYCLE_MS, type ClickUpFourDemoProps } from "./clickupFourDemoShared";
import ClickUpFourGabBar from "./ClickUpFourGabBar";
import "./ClickUpFourCalendarDemo.css";

/*
 * Day columns (pills baked into the Figma exports), rasterised to 3x WebP by
 * scripts/rasterize-demo-svgs.mjs. As SVG these blurred in Safari, which
 * rasterises an SVG <img> at its pre-transform layout size and then stretches
 * that bitmap by the demo frame's scale. Re-run the script if the .svg sources
 * change.
 */
import colMon from "../../assets/clickup-four-demo/cal-col-mon.webp";
import colTue from "../../assets/clickup-four-demo/cal-col-tue.webp";
import colWed from "../../assets/clickup-four-demo/cal-col-wed.webp";
import colThu from "../../assets/clickup-four-demo/cal-col-thu.webp";
import colFri from "../../assets/clickup-four-demo/cal-col-fri.webp";
import allDayPill from "../../assets/clickup-four-demo/cal-allday-pill.svg";
import nowLine from "../../assets/clickup-four-demo/cal-now-line.svg";
// Event card
import gcalIcon from "../../assets/clickup-four-demo/cal-event-gcal.svg";
import closeIcon from "../../assets/clickup-four-demo/cal-event-close.svg";
import arrowRight from "../../assets/clickup-four-demo/cal-event-arrow-right.svg";
import zoomIcon from "../../assets/clickup-four-demo/cal-event-zoom.svg";
import usersIcon from "../../assets/clickup-four-demo/cal-event-users.svg";
import relationshipIcon from "../../assets/clickup-four-demo/cal-event-relationship.svg";
import indicatorBg from "../../assets/clickup-four-demo/cal-event-indicator-bg.svg";
import indicatorOnline from "../../assets/clickup-four-demo/cal-event-indicator.svg";
import docIcon from "../../assets/clickup-four-demo/cal-event-doc.svg";
import mentionStatus from "../../assets/clickup-four-demo/cal-event-status.svg";
import mentionProgress from "../../assets/clickup-four-demo/cal-event-progress.svg";
import avatarCourt from "../../assets/clickup-four-demo/cal-event-avatar-court.png";
import avatarMemoji from "../../assets/clickup-four-demo/cal-event-avatar-memoji.png";
// Header
import aiNotepad from "../../assets/clickup-four-demo/cal-header-ai-notepad.svg";
// Rail
import railHomeOutlined from "../../assets/clickup-four-demo/rail-home-outlined.svg";
import railChat from "../../assets/clickup-four-demo/rail-frame1618872783.svg";
import railBrainAi from "../../assets/clickup-four-demo/rail-brain-ai.svg";
import railCalendar from "../../assets/clickup-four-demo/cal-rail-calendar.svg";
import railNineDots from "../../assets/clickup-four-demo/rail-nine-dots.svg";

/**
 * Timing (all inferred — the Figma file contains no motion data):
 *   0.0–0.6s  hold at 9:00
 *   0.6–4.2s  now line eases down to the 9:30 slot (30 min at 47.379px/hour) while
 *             the badge ticks 9:00 → 9:30
 *   4.2–6.0s  Zoom logo pops and rings until the cycle ends
 */
const MOVE_START_MS = 600;
const MOVE_END_MS = 4200;
// The logo starts ringing the moment the now line lands on 9:30.
const SHAKE_START_MS = MOVE_END_MS;
const GRID_8AM_Y = 28.6 + 23.24;
const PX_PER_MIN = 47.379 / 60;
// Figma now-row top (75.79 at 8:47) sits ~13.16px above the day-column grid line.
const NOW_CONTAINER_OFFSET = 13.164;

function nowY(minOfDay: number) {
  return GRID_8AM_Y + (minOfDay - 8 * 60) * PX_PER_MIN - NOW_CONTAINER_OFFSET;
}

const START_MIN = 9 * 60;
const END_MIN = 9 * 60 + 30;
const NOW_START_Y = nowY(START_MIN);
const NOW_END_Y = nowY(END_MIN);
const NOW_DELTA = NOW_END_Y - NOW_START_Y;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function timeLabel(min: number) {
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
}

// Time column rows are spaced 48.076px in Figma (day columns use 47.379).
const HOUR_LABELS = ["8 am", "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm"];
const DAY_COLUMNS = [colMon, colTue, colWed, colThu, colFri];
const SUBHEADER_DAYS: { name: string; num: string; nameX: number; numX: number; today?: boolean }[] = [
  { name: "Mon", num: "12", nameX: 43.66, numX: 71.21 },
  { name: "Tue", num: "13", nameX: 45.66, numX: 69.21 },
  { name: "Wed", num: "14", nameX: 42.31, numX: 70.86, today: true },
  { name: "Thu", num: "15", nameX: 45.16, numX: 69.71 },
  { name: "Fri", num: "16", nameX: 48.66, numX: 66.21 },
  { name: "Sat", num: "17", nameX: 46.96, numX: 68.51 },
];

export default function ClickUpFourCalendarDemo({ active, paused, reducedMotion }: ClickUpFourDemoProps) {
  const elapsedRef = useRef(CYCLE_MS);
  const nowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const zoomRef = useRef<HTMLImageElement>(null);

  const applyState = (elapsed: number) => {
    const t = Math.min(1, Math.max(0, (elapsed - MOVE_START_MS) / (MOVE_END_MS - MOVE_START_MS)));
    const p = easeInOut(t);
    if (nowRef.current) {
      nowRef.current.style.transform = `translateY(${(NOW_START_Y + NOW_DELTA * p).toFixed(2)}px)`;
    }
    if (labelRef.current) {
      const label = timeLabel(START_MIN + Math.round((END_MIN - START_MIN) * p));
      if (labelRef.current.textContent !== label) labelRef.current.textContent = label;
    }
    zoomRef.current?.classList.toggle("is-shaking", elapsed >= SHAKE_START_MS && elapsed < CYCLE_MS);
  };

  // Restart from the beginning whenever the slide becomes active; inactive or
  // reduced-motion slides show the completed static state.
  useEffect(() => {
    elapsedRef.current = active && !reducedMotion ? 0 : CYCLE_MS;
    applyState(elapsedRef.current);
  }, [active, reducedMotion]);

  // Drive the sequence with rAF; elapsed only advances while running.
  useEffect(() => {
    if (!active || paused || reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current = Math.min(CYCLE_MS, elapsedRef.current + (now - last));
      last = now;
      applyState(elapsedRef.current);
      if (elapsedRef.current < CYCLE_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, reducedMotion]);

  const rootClass = `cu4cal-root${paused ? " is-paused" : ""}`;

  return (
    <div className="cu4-demo-frame">
      <div className={rootClass} aria-hidden="true">
        <div className="cu4cal-surface">
          {/* Main app window */}
          <div className="cu4cal-app">
            {/* Header */}
            <div className="cu4cal-header">
              <div className="cu4cal-month-btn">Sep 2025</div>
              <div className="cu4cal-ai-btn">
                <img alt="" src={aiNotepad.src} width={10.9} height={12} />
                <p>AI Notetaker</p>
              </div>
            </div>

            {/* Sub-header: timezone + day strip */}
            <div className="cu4cal-subheader">
              <p className="cu4cal-tz">PST</p>
              {SUBHEADER_DAYS.map((d, i) => {
                const cellX = 61.2 + 133.5714 * i;
                return (
                  <div key={d.name} className="cu4cal-daycell" style={{ left: cellX, width: 133.57 }}>
                    <p className="cu4cal-dayname" style={{ left: d.nameX }}>
                      {d.name}
                    </p>
                    <div className={`cu4cal-daynum${d.today ? " is-today" : ""}`} style={{ left: d.numX }}>
                      <p>{d.num}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week grid */}
            <div className="cu4cal-week">
              {/* Day columns (Mon–Fri from Figma exports; Sat drawn in CSS) */}
              {DAY_COLUMNS.map((col, i) => (
                <img
                  key={i}
                  alt=""
                  src={col.src}
                  className="cu4cal-col"
                  style={{ left: 64.36 + 140.476 * i }}
                />
              ))}
              {Array.from({ length: 8 }, (_, k) => (
                <div
                  key={k}
                  className="cu4cal-col-line"
                  style={{ left: 64.36 + 140.476 * 5, top: 28.6 + 47.379 * k + 23.24 }}
                />
              ))}
              <div className="cu4cal-allday-border" />
              <div className="cu4cal-time-border" />

              {/* Time column */}
              <p className="cu4cal-allday-label">All day</p>
              {HOUR_LABELS.map((label, k) => (
                <p
                  key={label}
                  className={`cu4cal-hour-label${k < 2 ? " is-past" : ""}`}
                  style={{ top: 28.6 + 48.076 * k + 16.09 }}
                >
                  {label}
                </p>
              ))}

              {/* Loose all-day pill over Thursday */}
              <img
                alt=""
                src={allDayPill.src}
                width={130.5}
                height={42}
                style={{ position: "absolute", left: 487.2, top: 52.74 }}
              />

              {/* Now indicator (animated) */}
              <div ref={nowRef} className="cu4cal-now" style={{ transform: `translateY(${NOW_END_Y}px)` }}>
                <div className="cu4cal-now-badge">
                  <p ref={labelRef}>{timeLabel(END_MIN)}</p>
                </div>
                <img alt="" className="cu4cal-now-line" src={nowLine.src} />
              </div>

              {/* Focused event card */}
              <div className="cu4cal-event">
                <div className="cu4cal-event-top">
                  <div className="cu4cal-event-gcal">
                    <div className="cu4cal-event-gcal-icon">
                      <img alt="" src={gcalIcon.src} />
                    </div>
                  </div>
                  <p className="cu4cal-event-kind">Event</p>
                  <div className="cu4cal-event-close">
                    <div className="cu4cal-event-close-btn">
                      <img alt="" src={closeIcon.src} />
                    </div>
                  </div>
                </div>

                <p className="cu4cal-event-title">Design Sprint Feedback</p>

                <div className="cu4cal-event-dates">
                  <p style={{ left: 6.079 }}>14 Sep, 2025</p>
                  <p style={{ left: 83.429 }}>9:30 am</p>
                  <span className="cu4cal-event-dates-arrow" style={{ left: 129.02 }}>
                    <img alt="" src={arrowRight.src} />
                  </span>
                  <p style={{ left: 143.058 }}>10:30 am</p>
                </div>

                <div className="cu4cal-event-join">
                  <div className="cu4cal-event-join-inner">
                    <div className="cu4cal-zoom-wrap">
                      <img ref={zoomRef} alt="" className="cu4cal-zoom" src={zoomIcon.src} />
                    </div>
                    <p>Join Meeting</p>
                  </div>
                </div>

                <img
                  alt=""
                  className="cu4cal-event-users-icon"
                  src={usersIcon.src}
                  width={11.145}
                  height={9.118}
                />
                <div className="cu4cal-event-attendees">
                  <div className="cu4cal-avatar" style={{ zIndex: 3 }}>
                    <img alt="" src={avatarCourt.src} />
                    <span className="cu4cal-avatar-status" aria-hidden="true">
                      <img alt="" className="cu4cal-avatar-status-bg" src={indicatorBg.src} />
                      <img alt="" className="cu4cal-avatar-status-dot" src={indicatorOnline.src} />
                    </span>
                  </div>
                  <div className="cu4cal-avatar" style={{ zIndex: 2 }}>
                    <img alt="" src={avatarMemoji.src} />
                  </div>
                  <div className="cu4cal-counter">+3</div>
                </div>

                <div className="cu4cal-event-links">
                  <img
                    alt=""
                    className="cu4cal-event-links-icon"
                    src={relationshipIcon.src}
                    width={10.2}
                    height={10.2}
                  />
                  <div className="cu4cal-link-row" style={{ top: 3.799 }}>
                    <span className="cu4cal-link-icon">
                      <img alt="" className="cu4cal-link-status" src={mentionStatus.src} />
                      <img alt="" className="cu4cal-link-progress" src={mentionProgress.src} />
                    </span>
                    <p>App Mentions design</p>
                  </div>
                  <div className="cu4cal-link-row" style={{ top: 26.595 }}>
                    <span className="cu4cal-link-icon">
                      <img alt="" className="cu4cal-link-doc" src={docIcon.src} />
                    </span>
                    <p>Mango Technologies Product Design</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Black left rail (Figma 68:28665) */}
          <div className="cu4cal-rail">
            <div className="cu4cal-rail-items">
              <div className="cu4cal-rail-icon is-dim">
                <img alt="" src={railHomeOutlined.src} />
              </div>
              <div className="cu4cal-rail-icon is-dim">
                <img alt="" src={railChat.src} />
              </div>
              <div className="cu4cal-rail-icon is-dim cu4cal-rail-icon--brain">
                <img alt="" src={railBrainAi.src} />
              </div>
              <div className="cu4cal-rail-icon is-active">
                <div className="cu4cal-rail-glow" aria-hidden="true" />
                <div className="cu4cal-rail-calendar-view">
                  <img alt="" src={railCalendar.src} />
                </div>
              </div>
              <div className="cu4cal-rail-icon cu4cal-rail-icon--dots is-dim">
                <div className="cu4cal-rail-dots-view">
                  <div className="cu4cal-rail-dots-fill">
                    <img alt="" src={railNineDots.src} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ClickUpFourGabBar />
        </div>
      </div>
    </div>
  );
}
