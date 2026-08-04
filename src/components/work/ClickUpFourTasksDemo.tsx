import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { ClickUpFourDemoProps } from "./clickupFourDemoShared";
import { CYCLE_MS } from "./clickupFourDemoShared";
import ClickUpFourGabBar from "./ClickUpFourGabBar";
import "./ClickUpFourTasksDemo.css";

// Chrome (rail)
import railHomeAsset from "../../assets/clickup-four-demo/rail-home.svg";
import railChatAsset from "../../assets/clickup-four-demo/rail-frame1618872783.svg";
import railBrainAiAsset from "../../assets/clickup-four-demo/rail-brain-ai.svg";
import railNineDotsAsset from "../../assets/clickup-four-demo/rail-nine-dots.svg";

// Sidebar
import sideAddAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill2.svg";
import sideChevronAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill3.svg";
import sideInboxAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill4.svg";
import sideMyTasksAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill5.svg";
import sideListAsset from "../../assets/clickup-four-demo/tasks-sidebar-stroke-stroke.svg";
import sideChatAsset from "../../assets/clickup-four-demo/tasks-sidebar-vector.svg";
import sideDocAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill8.svg";
import sidePaintbrushAsset from "../../assets/clickup-four-demo/tasks-sidebar-paintbrush.svg";
import sideList1Asset from "../../assets/clickup-four-demo/tasks-sidebar-stroke-stroke1.svg";
import sideDocFillAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill9.svg";
import sideWhiteboardAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill10.svg";
import sideFormAsset from "../../assets/clickup-four-demo/tasks-sidebar-fill11.svg";
import sideTeamPlumAsset from "../../assets/clickup-four-demo/tasks-sidebar-team-icons.svg";
import sideDotBgAsset from "../../assets/clickup-four-demo/tasks-sidebar-bg.svg";
import sideDotAsset from "../../assets/clickup-four-demo/tasks-sidebar-indicator.svg";
import avatarStephAsset from "../../assets/clickup-four-demo/tasks-sidebar-steph.jpg";
import avatarAgent7Asset from "../../assets/clickup-four-demo/tasks-sidebar-agent7.jpg";
import avatarIgorAsset from "../../assets/clickup-four-demo/tasks-sidebar-igor.jpg";

// Breadcrumb + views
import crumbTeamAsset from "../../assets/clickup-four-demo/tasks-crumb-team.svg";
import crumbFavAsset from "../../assets/clickup-four-demo/tasks-crumb-fav.svg";
import viewChatAsset from "../../assets/clickup-four-demo/tasks-view-chat.svg";
import viewListAsset from "../../assets/clickup-four-demo/tasks-view-list.svg";
import viewCalendarAsset from "../../assets/clickup-four-demo/tasks-view-calendar.svg";
import viewGanttAsset from "../../assets/clickup-four-demo/tasks-view-gantt.svg";
import viewTeamAsset from "../../assets/clickup-four-demo/tasks-view-team.svg";
import viewAddAsset from "../../assets/clickup-four-demo/tasks-view-add.svg";

// DONE group
import groupCaretDoneAsset from "../../assets/clickup-four-demo/tasks-group-caret.svg";
import statusDoneAsset from "../../assets/clickup-four-demo/tasks-status-done.svg";
import doneCaretExpandAsset from "../../assets/clickup-four-demo/tasks-done-fill3.svg";
import statusClosedAsset from "../../assets/clickup-four-demo/tasks-done-fill-override.svg";
import statusOpenAsset from "../../assets/clickup-four-demo/tasks-done-fill6.svg";
import subtaskIconAsset from "../../assets/clickup-four-demo/tasks-done-fill4.svg";
import flagLowAsset from "../../assets/clickup-four-demo/tasks-done-fill1.svg";
import flagUrgentAsset from "../../assets/clickup-four-demo/tasks-done-fill5.svg";
import flagNormalAsset from "../../assets/clickup-four-demo/tasks-done-fill7.svg";
import flagHighAsset from "../../assets/clickup-four-demo/tasks-done-fill8.svg";
import avatarAkshayAsset from "../../assets/clickup-four-demo/tasks-done-akshay.jpg";
import avatarAgent1Asset from "../../assets/clickup-four-demo/tasks-done-agent1.jpg";
import avatarAkramAsset from "../../assets/clickup-four-demo/tasks-done-akram.jpg";
import avatarMaggieAsset from "../../assets/clickup-four-demo/tasks-done-maggie.png";

// IN PROGRESS group
import groupCaretIpAsset from "../../assets/clickup-four-demo/tasks-group-caret-ip.svg";
import statusIpAsset from "../../assets/clickup-four-demo/tasks-status-ip.svg";
import statusIpProgressAsset from "../../assets/clickup-four-demo/tasks-status-ip-progress.svg";
import ipDashboardRectAsset from "../../assets/clickup-four-demo/tasks-ip-dashboard-rect.svg";
import ipDashboardVectorAsset from "../../assets/clickup-four-demo/tasks-ip-dashboard-vector.svg";
import ipExpandCaretAsset from "../../assets/clickup-four-demo/tasks-ip-expand-caret.svg";
import ipCaretAsset from "../../assets/clickup-four-demo/tasks-ip-caret.svg";
import ipLockAsset from "../../assets/clickup-four-demo/tasks-ip-lock.svg";
import ipSubtaskAsset from "../../assets/clickup-four-demo/tasks-ip-subtask.svg";
import ipBlockingAsset from "../../assets/clickup-four-demo/tasks-ip-blocking.svg";
import avatarCourtAsset from "../../assets/clickup-four-demo/tasks-ip-avatar-court.png";
import avatarDanilaAsset from "../../assets/clickup-four-demo/tasks-ip-avatar-danila.png";

const railHome = railHomeAsset.src;
const railChat = railChatAsset.src;
const railBrainAi = railBrainAiAsset.src;
const railNineDots = railNineDotsAsset.src;
const sideAdd = sideAddAsset.src;
const sideChevron = sideChevronAsset.src;
const sideInbox = sideInboxAsset.src;
const sideMyTasks = sideMyTasksAsset.src;
const sideList = sideListAsset.src;
const sideChat = sideChatAsset.src;
const sideDoc = sideDocAsset.src;
const sidePaintbrush = sidePaintbrushAsset.src;
const sideList1 = sideList1Asset.src;
const sideDocFill = sideDocFillAsset.src;
const sideWhiteboard = sideWhiteboardAsset.src;
const sideForm = sideFormAsset.src;
const sideTeamPlum = sideTeamPlumAsset.src;
const sideDotBg = sideDotBgAsset.src;
const sideDot = sideDotAsset.src;
const avatarSteph = avatarStephAsset.src;
const avatarAgent7 = avatarAgent7Asset.src;
const avatarIgor = avatarIgorAsset.src;
const crumbTeam = crumbTeamAsset.src;
const crumbFav = crumbFavAsset.src;
const viewChat = viewChatAsset.src;
const viewList = viewListAsset.src;
const viewCalendar = viewCalendarAsset.src;
const viewGantt = viewGanttAsset.src;
const viewTeam = viewTeamAsset.src;
const viewAdd = viewAddAsset.src;
const groupCaretDone = groupCaretDoneAsset.src;
const statusDone = statusDoneAsset.src;
const doneCaretExpand = doneCaretExpandAsset.src;
const statusClosed = statusClosedAsset.src;
const statusOpen = statusOpenAsset.src;
const subtaskIcon = subtaskIconAsset.src;
const flagLow = flagLowAsset.src;
const flagUrgent = flagUrgentAsset.src;
const flagNormal = flagNormalAsset.src;
const flagHigh = flagHighAsset.src;
const avatarAkshay = avatarAkshayAsset.src;
const avatarAgent1 = avatarAgent1Asset.src;
const avatarAkram = avatarAkramAsset.src;
const avatarMaggie = avatarMaggieAsset.src;
const groupCaretIp = groupCaretIpAsset.src;
const statusIp = statusIpAsset.src;
const statusIpProgress = statusIpProgressAsset.src;
const ipDashboardRect = ipDashboardRectAsset.src;
const ipDashboardVector = ipDashboardVectorAsset.src;
const ipExpandCaret = ipExpandCaretAsset.src;
const ipCaret = ipCaretAsset.src;
const ipLock = ipLockAsset.src;
const ipSubtask = ipSubtaskAsset.src;
const ipBlocking = ipBlockingAsset.src;
const avatarCourt = avatarCourtAsset.src;
const avatarDanila = avatarDanilaAsset.src;

/*
 * Animation timing (all inferred — Figma only defines the static
 * "Prioritizing..." text and the finished priority chips). Every row in the
 * Priority column starts as "Prioritizing..." and resolves top to bottom; the
 * CSS fade/rise of each chip runs 300ms, landing as the tab cycle ends.
 */
const RESOLVE_START = 800;
const RESOLVE_ANIM_MS = 300;
const RESOLVE_ORDER = [
  "socialCampaign",
  "websiteAssets",
  "landingPage",
  "aboutPage",
  "mobileAssets",
  "marketResearch",
  "competitorBenchmarking",
  "brandPositioning",
] as const;
const RESOLVE_STEP = (CYCLE_MS - RESOLVE_START - RESOLVE_ANIM_MS) / (RESOLVE_ORDER.length - 1);
const RESOLVE_AT = Object.fromEntries(
  RESOLVE_ORDER.map((row, index) => [row, RESOLVE_START + index * RESOLVE_STEP]),
) as Record<(typeof RESOLVE_ORDER)[number], number>;

type IconProps = { src: string; rotate?: number; className?: string; style?: CSSProperties };

/*
 * Every glyph is exported at its Figma "fill" size (the inner vector box, not
 * the icon frame), so drawing it at its intrinsic size centred in the frame
 * reproduces Figma's inset percentages without hard-coding them per icon.
 */
function Icon({ src, rotate, className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{ position: "relative", display: "block", ...style }}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "auto",
          height: "auto",
          maxWidth: "none",
          display: "block",
          transform: `translate(-50%, -50%)${rotate ? ` rotate(${rotate}deg)` : ""}`,
        }}
      />
    </span>
  );
}

function RowStatus({ src }: { src: string }) {
  return (
    <span className="cu4t-row-prefix-slot is-status" aria-hidden="true">
      <span className="cu4t-status-round">
        <img alt="" src={src} />
      </span>
    </span>
  );
}

function RowExpand({ src, rotate }: { src: string; rotate?: number }) {
  return (
    <span className="cu4t-icon-btn" aria-hidden="true">
      <Icon src={src} rotate={rotate} className="cu4t-icon-glyph" />
    </span>
  );
}

function SideRow({
  top,
  icon,
  label,
  badge,
  className,
}: {
  top: number;
  icon: ReactNode;
  label: string;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={`cu4t-side-row ${className ?? ""}`} style={{ top }}>
      {icon}
      <span
        style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {label}
      </span>
      {badge ? <span className="cu4t-badge">{badge}</span> : null}
    </div>
  );
}

function PersonIcon({ src }: { src?: string }) {
  return (
    <span className="cu4t-avatar" aria-hidden="true">
      {src ? <img src={src} alt="" /> : <span className="cu4t-avatar-fill" />}
      <span className="cu4t-avatar-dot">
        <img src={sideDotBg} alt="" />
        <img src={sideDot} alt="" />
      </span>
    </span>
  );
}

function TeamTile({ color, icon }: { color: string; icon: string }) {
  return (
    <span className="cu4t-team-tile" aria-hidden="true">
      <span style={{ background: color }}>
        <img src={icon} alt="" />
      </span>
    </span>
  );
}

function RowAvatar({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <span className="cu4t-row-avatar" aria-hidden="true">
      <img src={src} alt="" />
    </span>
  );
}

function Tag({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="cu4t-tag" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

function Flag({ src }: { src: string }) {
  return <Icon src={src} className="cu4t-flag" />;
}

/* A priority cell that shimmers "Prioritizing..." and then resolves to its flag. */
function PriorityResolve({
  flag,
  label,
  resolved,
  reducedMotion,
  shimmerPaused,
}: {
  flag: string;
  label: string;
  resolved: boolean;
  reducedMotion: boolean;
  shimmerPaused: boolean;
}) {
  return (
    <div className={`cu4t-priority-anim${reducedMotion ? "" : " is-animating"}`}>
      <span className={`cu4t-priority-state${resolved ? "" : " is-visible"}`}>
        <span
          className={`cu4t-prioritizing${resolved || reducedMotion ? "" : " is-shimmer"}${shimmerPaused ? " is-paused" : ""}`}
        >
          Prioritizing...
        </span>
      </span>
      <span className={`cu4t-priority-state is-resolved${resolved ? " is-visible" : ""}`}>
        <Flag src={flag} />
        <span className="cu4t-priority-text">{label}</span>
      </span>
    </div>
  );
}

/* Figma 68:27652 — 17px frame: 12.573 square centred at 13.02% top/bottom,
 * an 8.5x4.25 vector at 25%/50%, and a white 5.667x1.417 notch at 25%/25%. */
function DashboardIcon() {
  return (
    <span className="cu4t-dashboard" aria-hidden="true">
      <img className="cu4t-dashboard-rect" src={ipDashboardRect} alt="" />
      <img className="cu4t-dashboard-vector" src={ipDashboardVector} alt="" />
      <span className="cu4t-dashboard-notch" />
    </span>
  );
}

function RowStatusLead({ src }: { src: string }) {
  return (
    <span className="cu4t-icon-btn" aria-hidden="true">
      <span className="cu4t-status-round">
        <img alt="" src={src} />
      </span>
    </span>
  );
}

export default function ClickUpFourTasksDemo({ active, paused, reducedMotion }: ClickUpFourDemoProps) {
  const [elapsed, setElapsed] = useState(reducedMotion ? CYCLE_MS : 0);
  const elapsedRef = useRef(0);

  // Restart the cascade on activation.
  useEffect(() => {
    if (active) {
      elapsedRef.current = 0;
      setElapsed(reducedMotion ? CYCLE_MS : 0);
    }
  }, [active, reducedMotion]);

  // Pausable clock driving the staggered resolves.
  useEffect(() => {
    if (!active || paused || reducedMotion) return;
    if (elapsedRef.current >= CYCLE_MS) return;
    let raf = 0;
    const startedAt = performance.now() - elapsedRef.current;
    const tick = (now: number) => {
      const next = Math.min(now - startedAt, CYCLE_MS);
      elapsedRef.current = next;
      setElapsed(next);
      if (next < CYCLE_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, reducedMotion]);

  const shimmerPaused = paused || !active;
  const isResolved = (at: number) => elapsed >= at;

  return (
    <div
      className="cu4-demo-frame cu4t"
      role="img"
      aria-label="ClickUp 4.0 Tasks list view: an AI agent works down the Priority column, resolving every task from Prioritizing to a priority level"
    >
      <div className="cu4t-surface">
        <ClickUpFourGabBar />

        {/* Black icon rail (Figma 68:27977) */}
        <div className="cu4t-rail">
          <div className="cu4t-rail-stack">
            <span className="cu4t-rail-item is-active">
              <span className="cu4t-rail-glow" aria-hidden="true" />
              <span className="cu4t-rail-home-view">
                <span className="cu4t-rail-home-fill">
                  <img className="cu4t-rail-home" src={railHome} alt="" />
                </span>
              </span>
            </span>
            <span className="cu4t-rail-item is-dim">
              <img src={railChat} alt="" />
            </span>
            <span className="cu4t-rail-item is-dim cu4t-rail-item--brain">
              <img src={railBrainAi} alt="" />
            </span>
            <span className="cu4t-rail-item cu4t-rail-item--dots is-dim">
              <span className="cu4t-rail-dots-view">
                <span className="cu4t-rail-dots-fill">
                  <img src={railNineDots} alt="" />
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* App container */}
        <div className="cu4t-container">
          {/* Sidebar */}
          <div className="cu4t-sidebar">
            <p className="cu4t-side-title">Home</p>
            <div className="cu4t-side-add" aria-hidden="true">
              <Icon src={sideAdd} style={{ width: 13.6, height: 13.6, flex: "none" }} />
              <Icon src={sideChevron} style={{ width: 11.9, height: 11.9, flex: "none" }} />
            </div>

            <SideRow
              top={37.4}
              className="is-small is-strong"
              icon={<Icon src={sideInbox} className="cu4t-side-icon" />}
              label="Inbox"
              badge="3"
            />
            <SideRow
              top={62.9}
              className="is-small"
              icon={<Icon src={sideMyTasks} className="cu4t-side-icon" />}
              label="My Tasks"
            />

            <div className="cu4t-side-divider" style={{ top: 97.3 }} />
            <p className="cu4t-side-header" style={{ top: 111.75 }}>
              Creative Team
            </p>

            <SideRow
              top={128.75}
              icon={<Icon src={sideList} className="cu4t-side-icon" />}
              label="Product Backlog"
            />
            <SideRow
              top={154.65}
              icon={<Icon src={sideChat} className="cu4t-side-icon" />}
              label="Creative"
            />
            <SideRow top={180.55} className="is-strong" icon={<PersonIcon src={avatarSteph} />} label="Steph" badge="1" />
            <SideRow
              top={206.45}
              className="is-strong"
              icon={<PersonIcon src={avatarAgent7} />}
              label="Campaign Agent"
              badge="3"
            />
            <SideRow top={232.35} icon={<PersonIcon src={avatarIgor} />} label="Igor" />
            <SideRow
              top={258.25}
              icon={<Icon src={sideDoc} className="cu4t-side-icon" />}
              label="Vision & Strategy"
            />

            <p className="cu4t-side-header" style={{ top: 301.75 }}>
              Spaces
            </p>

            <SideRow
              top={324.15}
              className="is-selected"
              icon={<TeamTile color="#e5484d" icon={sidePaintbrush} />}
              label="Marketing"
            />
            <div className="cu4t-side-thread" style={{ top: 352, height: 127 }} />
            <SideRow
              top={350.05}
              className="is-indent"
              icon={<Icon src={sideList1} className="cu4t-side-icon" />}
              label="Campaigns"
            />
            <SideRow
              top={375.95}
              className="is-indent"
              icon={<Icon src={sideList1} className="cu4t-side-icon" />}
              label="Blogs"
            />
            <SideRow
              top={401.85}
              className="is-indent"
              icon={<Icon src={sideDocFill} className="cu4t-side-icon" />}
              label="Brand Assets"
            />
            <SideRow
              top={427.75}
              className="is-indent"
              icon={<Icon src={sideWhiteboard} className="cu4t-side-icon" />}
              label="Design Workflows"
            />
            <SideRow
              top={453.65}
              className="is-indent"
              icon={<Icon src={sideForm} className="cu4t-side-icon" />}
              label="Creative Request"
            />
            <SideRow
              top={479.55}
              icon={<TeamTile color="#ab4aba" icon={sideTeamPlum} />}
              label="Product"
            />
          </div>

          {/* Breadcrumb header (68:27724) */}
          <div className="cu4t-crumb">
            <div className="cu4t-crumb-inner">
              <span className="cu4t-crumb-loc">
                <span className="cu4t-crumb-team" aria-hidden="true">
                  <span>
                    <img src={crumbTeam} alt="" />
                  </span>
                </span>
                Marketing
              </span>
              <span className="cu4t-crumb-fav-btn" aria-hidden="true">
                <Icon src={crumbFav} className="cu4t-crumb-fav" />
              </span>
            </div>
          </div>

          {/* Main list window */}
          <div className="cu4t-main">
            {/* View tabs */}
            <div className="cu4t-views">
              <div className="cu4t-views-tabs">
                <span className="cu4t-view-tab">
                  <Icon src={viewChat} className="cu4t-view-icon" />
                  Chat
                </span>
                <span className="cu4t-view-tab is-active">
                  <Icon src={viewList} className="cu4t-view-icon" />
                  Tasks
                </span>
                <span className="cu4t-view-tab">
                  <Icon src={viewCalendar} className="cu4t-view-icon" />
                  Schedule
                </span>
                <span className="cu4t-view-tab">
                  <Icon src={viewGantt} className="cu4t-view-icon" />
                  Gantt
                </span>
                <span className="cu4t-view-tab">
                  <Icon src={viewTeam} className="cu4t-view-icon" />
                  Customers
                </span>
                <span className="cu4t-view-divider" aria-hidden="true" />
                <span className="cu4t-view-tab is-add">
                  <Icon src={viewAdd} className="cu4t-view-icon" />
                  View
                </span>
              </div>
              <div className="cu4t-views-underline" />
            </div>

            {/* Column header */}
            <div className="cu4t-colheader">
              <span className="cu4t-col cu4t-col--name">Name</span>
              <span className="cu4t-col cu4t-col--assignee">Assignee</span>
              <span className="cu4t-col cu4t-col--priority">Priority</span>
              <span className="cu4t-col cu4t-col--team">Team</span>
              <span className="cu4t-ai-pill">AI</span>
            </div>

            <div className="cu4t-content">
              {/* DONE group */}
              <div className="cu4t-group-header" style={{ top: 3.4 }}>
                <span className="cu4t-group-caret">
                  <Icon src={groupCaretDone} className="cu4t-icon-glyph" />
                </span>
                <div className="cu4t-group-label">
                  <span className="cu4t-status-chip" style={{ background: "#30a46c" }}>
                    <span className="cu4t-status-icon">
                      <img src={statusDone} alt="" />
                    </span>
                    DONE
                  </span>
                  <span className="cu4t-group-count">5</span>
                </div>
              </div>

              <div className="cu4t-table" style={{ top: 37.4 }}>
                {/* Social campaign */}
                <div className="cu4t-row" style={{ top: 0 }}>
                  <span className="cu4t-row-lead" style={{ width: 40.8 }} />
                  <div className="cu4t-row-body has-status">
                    <RowStatus src={statusClosed} />
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Social campaign</span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar src={avatarAkshay} />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagLow}
                        label="Low"
                        resolved={isResolved(RESOLVE_AT.socialCampaign)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="Design" bg="#e7f9f5" color="#067a6f" />
                    </div>
                  </div>
                </div>

                {/* Website assets */}
                <div className="cu4t-row is-inset-612" style={{ top: 30.6 }}>
                  <span className="cu4t-row-lead" style={{ width: 20.4 }} />
                  <RowExpand src={doneCaretExpand} />
                  <RowStatusLead src={statusClosed} />
                  <div className="cu4t-row-body">
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Website assets</span>
                      <span className="cu4t-prop">
                        <Icon src={subtaskIcon} className="cu4t-prop-icon" />2
                      </span>
                    </div>
                    <div className="cu4t-cell-assignee" />
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagUrgent}
                        label="Urgent"
                        resolved={isResolved(RESOLVE_AT.websiteAssets)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="PMM" bg="#ffefef" color="#c62a2f" />
                    </div>
                  </div>
                </div>

                {/* Landing page */}
                <div className="cu4t-row is-inset-612" style={{ top: 61.2 }}>
                  <span className="cu4t-row-lead" style={{ width: 61.2 }} />
                  <div className="cu4t-row-body has-status">
                    <RowStatus src={statusOpen} />
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Landing page</span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar src={avatarAgent1} />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagNormal}
                        label="Normal"
                        resolved={isResolved(RESOLVE_AT.landingPage)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="Design" bg="#e7f9f5" color="#067a6f" />
                    </div>
                  </div>
                </div>

                {/* About page */}
                <div className="cu4t-row is-inset-612" style={{ top: 91.8 }}>
                  <span className="cu4t-row-lead" style={{ width: 61.2 }} />
                  <div className="cu4t-row-body has-status">
                    <RowStatus src={statusOpen} />
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">About page</span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar src={avatarAkram} />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagHigh}
                        label="High"
                        resolved={isResolved(RESOLVE_AT.aboutPage)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="Web" bg="#f0f1ff" color="#5e42de" />
                    </div>
                  </div>
                </div>

                {/* Mobile assets */}
                <div className="cu4t-row" style={{ top: 122.4 }}>
                  <span className="cu4t-row-lead" style={{ width: 40.8 }} />
                  <div className="cu4t-row-body has-status">
                    <RowStatus src={statusClosed} />
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Mobile assets</span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar src={avatarMaggie} />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagUrgent}
                        label="Urgent"
                        resolved={isResolved(RESOLVE_AT.mobileAssets)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="Design" bg="#e7f9f5" color="#067a6f" />
                    </div>
                  </div>
                </div>
              </div>

              {/* IN PROGRESS group */}
              <div className="cu4t-group-header" style={{ top: 230.35 }}>
                <span className="cu4t-group-caret">
                  <Icon src={groupCaretIp} className="cu4t-icon-glyph" />
                </span>
                <div className="cu4t-group-label">
                  <span className="cu4t-status-chip" style={{ background: "#0091ff" }}>
                    <span className="cu4t-status-icon">
                      <img src={statusIp} alt="" />
                      <img className="cu4t-status-progress" src={statusIpProgress} alt="" />
                    </span>
                    IN PROGRESS
                  </span>
                  <span className="cu4t-group-count">3</span>
                </div>
              </div>

              <div className="cu4t-table" style={{ top: 264.35 }}>
                {/* Market Research Analysis — animated priority */}
                <div className="cu4t-row" style={{ top: 0 }}>
                  <span className="cu4t-row-lead" style={{ width: 40.8 }} />
                  <div className="cu4t-row-body has-dashboard is-wide">
                    <span className="cu4t-row-prefix-slot is-dashboard">
                      <DashboardIcon />
                    </span>
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Market Research Analysis</span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar src={avatarCourt} />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagUrgent}
                        label="Urgent"
                        resolved={isResolved(RESOLVE_AT.marketResearch)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <span className="cu4t-tag" style={{ background: "#fceffc" }}><span className="cu4t-tag-gradient">Agent</span></span>
                    </div>
                  </div>
                </div>

                {/* Competitor Benchmarking */}
                <div className="cu4t-row" style={{ top: 30.6 }}>
                  <span className="cu4t-row-lead" style={{ width: 20.4 }} />
                  <RowExpand src={ipExpandCaret} />
                  <div className="cu4t-row-body has-dashboard is-wide">
                    <span className="cu4t-row-prefix-slot is-dashboard">
                      <DashboardIcon />
                    </span>
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Competitor Benchmarking</span>
                      <span className="cu4t-prop">
                        <Icon src={ipSubtask} className="cu4t-prop-icon" />1
                      </span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar src={avatarDanila} />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagNormal}
                        label="Normal"
                        resolved={isResolved(RESOLVE_AT.competitorBenchmarking)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="PMM" bg="#ffefef" color="#c62a2f" />
                    </div>
                  </div>
                </div>

                {/* Brand Positioning Strategy */}
                <div className="cu4t-row" style={{ top: 61.2 }}>
                  <span className="cu4t-row-lead" style={{ width: 20.4 }} />
                  <RowExpand src={ipCaret} rotate={-90} />
                  <div className="cu4t-row-body has-dashboard is-wide">
                    <span className="cu4t-row-prefix-slot is-dashboard">
                      <DashboardIcon />
                    </span>
                    <div className="cu4t-task-cell">
                      <span className="cu4t-task-text">Brand Positioning Strategy</span>
                      <span className="cu4t-prop is-lock">
                        <Icon src={ipLock} className="cu4t-prop-icon" />
                      </span>
                      <span className="cu4t-prop">
                        <Icon src={ipSubtask} className="cu4t-prop-icon" />5
                      </span>
                      <span className="cu4t-prop is-danger">
                        <Icon src={ipBlocking} className="cu4t-prop-icon" />1
                      </span>
                    </div>
                    <div className="cu4t-cell-assignee">
                      <RowAvatar />
                    </div>
                    <div className="cu4t-cell-priority">
                      <PriorityResolve
                        flag={flagHigh}
                        label="High"
                        resolved={isResolved(RESOLVE_AT.brandPositioning)}
                        reducedMotion={reducedMotion}
                        shimmerPaused={shimmerPaused}
                      />
                    </div>
                    <div className="cu4t-cell-tag">
                      <Tag label="Content" bg="#f8f1ee" color="#7d5e54" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
