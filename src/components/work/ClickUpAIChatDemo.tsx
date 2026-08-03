import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import ivan from "../../assets/clickup-ai-demo/chat-avatar-ivan.png";
import sara from "../../assets/clickup-ai-demo/chat-avatar-sara.png";
import calvin from "../../assets/clickup-ai-demo/chat-avatar-calvin.png";
import prioritizer from "../../assets/clickup-ai-demo/chat-avatar-prioritizer.png";
import mykyta from "../../assets/clickup-ai-demo/chat-avatar-mykyta.png";
import jony from "../../assets/clickup-ai-demo/chat-avatar-jony.png";
import campaign from "../../assets/clickup-ai-demo/chat-avatar-campaign.png";
import paintbrush from "../../assets/clickup-ai-demo/chat-paintbrush.svg";
import navAdd from "../../assets/clickup-ai-demo/chat-nav-add.svg";
import chevron from "../../assets/clickup-ai-demo/chat-chevron.svg";
import viewChat from "../../assets/clickup-ai-demo/chat-view-chat.svg";
import viewList from "../../assets/clickup-ai-demo/chat-view-list.svg";
import viewBoard from "../../assets/clickup-ai-demo/chat-view-board.svg";
import viewTimeline from "../../assets/clickup-ai-demo/chat-view-timeline.svg";
import viewAdd from "../../assets/clickup-ai-demo/chat-view-add.svg";
import favorite from "../../assets/clickup-ai-demo/chat-favorite.svg";
import threadLine from "../../assets/clickup-ai-demo/chat-thread-line.svg";
import compactAdd from "../../assets/clickup-ai-demo/chat-compact-add.svg";
import compactAttach from "../../assets/clickup-ai-demo/chat-compact-attach.svg";
import compactMention from "../../assets/clickup-ai-demo/chat-compact-mention.svg";
import compactComment from "../../assets/clickup-ai-demo/chat-compact-comment.svg";
import compactReaction from "../../assets/clickup-ai-demo/chat-compact-reaction.svg";
import compactSend from "../../assets/clickup-ai-demo/chat-compact-send.svg";
import close from "../../assets/clickup-ai-demo/chat-thread-close.svg";
import progressRing from "../../assets/clickup-ai-demo/chat-status-progress.svg";
import progressDot from "../../assets/clickup-ai-demo/chat-status-dot.svg";
import milestone from "../../assets/clickup-ai-demo/chat-status-milestone.svg";
import statusAgent from "../../assets/clickup-ai-demo/chat-status-agent.png";
import "./ClickUpAIDemo.css";

const PROMPT = "What are the top design priorities this week for the Agent status project?";

type ChatFrame = {
  typed: string;
  posted: boolean;
  replied: boolean;
  thinking: boolean;
  blockers: number;
  calendar: boolean;
};

const FINAL_FRAME: ChatFrame = {
  typed: "",
  posted: true,
  replied: true,
  thinking: false,
  blockers: 4,
  calendar: true,
};

function frameAt(ms: number): ChatFrame {
  if (ms < 450) return { typed: "", posted: false, replied: false, thinking: false, blockers: 0, calendar: false };
  if (ms < 4700) {
    const count = Math.min(PROMPT.length, Math.floor((ms - 450) / 55));
    return { typed: PROMPT.slice(0, count), posted: false, replied: false, thinking: false, blockers: 0, calendar: false };
  }
  if (ms < 6500) return { typed: "", posted: true, replied: false, thinking: false, blockers: 0, calendar: false };
  if (ms < 8500) return { typed: "", posted: true, replied: true, thinking: true, blockers: 0, calendar: false };
  if (ms < 11700) {
    return {
      typed: "",
      posted: true,
      replied: true,
      thinking: false,
      blockers: Math.min(4, Math.floor((ms - 8500) / 700) + 1),
      calendar: false,
    };
  }
  return FINAL_FRAME;
}

function Avatar({ src }: { src: string }) {
  return <img className="cua-chat-avatar" src={src} alt="" />;
}

function ReplyAvatars({ replyCount }: { replyCount: number }) {
  return (
    <div className="cua-chat-reply-avatars" aria-hidden="true">
      <Avatar src={prioritizer.src} />
      {replyCount > 1 && <Avatar src={sara.src} />}
    </div>
  );
}

function Meta({ name, time }: { name: string; time: string }) {
  return (
    <div className="cua-chat-meta">
      <strong>{name}</strong>
      <time>{time}</time>
    </div>
  );
}

const SKELETON_WIDTHS = [85, 76, 93];
const CHANNEL_WIDTHS = [52, 95, 83, 101];

function Sidebar() {
  return (
    <aside className="cua-chat-sidebar">
      <div className="cua-chat-sidebar-top">
        <i className="cua-chat-skeleton cua-chat-skeleton--logo" />
        <div className="cua-chat-add-button">
          <img src={navAdd.src} alt="" />
          <img src={chevron.src} alt="" />
        </div>
      </div>
      <div className="cua-chat-skeleton-stack">
        {SKELETON_WIDTHS.map((width) => (
          <div key={width}><i /><b style={{ width }} /></div>
        ))}
      </div>
      <div className="cua-chat-sidebar-divider" />
      <p className="cua-chat-sidebar-heading">Creative Team</p>
      <div className="cua-chat-skeleton-stack cua-chat-skeleton-stack--team">
        <div><i /><b style={{ width: 68 }} /></div>
        <div><i /><b style={{ width: 112 }} /></div>
      </div>
      <div className="cua-chat-person">
        <Avatar src={jony.src} /><strong>Jony</strong><b>1</b>
      </div>
      <div className="cua-chat-person">
        <Avatar src={campaign.src} /><strong>Campaign agent</strong><b>2</b>
      </div>
      <div className="cua-chat-skeleton-stack cua-chat-skeleton-stack--single">
        <div><i /><b style={{ width: 112 }} /></div>
      </div>
      <p className="cua-chat-sidebar-heading cua-chat-sidebar-heading--spaces">Spaces</p>
      <div className="cua-chat-selected-space">
        <span><img src={paintbrush.src} alt="" /></span>
        Product Design
      </div>
      <div className="cua-chat-channels">
        {CHANNEL_WIDTHS.map((width) => (
          <div key={width}><i /><b style={{ width }} /></div>
        ))}
      </div>
    </aside>
  );
}

function Header() {
  const tabs = [
    [viewChat.src, "Chat"],
    [viewList.src, "Open Tasks"],
    [viewBoard.src, "Design Needs"],
    [viewTimeline.src, "Timeline"],
    [viewAdd.src, "View"],
  ];

  return (
    <header className="cua-chat-header-exact">
      <div className="cua-chat-breadcrumb">
        <span><img src={paintbrush.src} alt="" /></span>
        <strong>Product Design</strong>
        <img className="cua-chat-favorite" src={favorite.src} alt="" />
      </div>
      <nav className="cua-chat-tabs-exact" aria-label="Product Design views">
        {tabs.map(([icon, label], index) => (
          <span className={index === 0 ? "is-active" : ""} key={label}>
            <img src={icon} alt="" />{label}
          </span>
        ))}
      </nav>
    </header>
  );
}

function MainMessageList({ posted, replied, replyCount }: { posted: boolean; replied: boolean; replyCount: number }) {
  return (
    <section className="cua-chat-message-list">
      <article className="cua-chat-message-exact">
        <Avatar src={ivan.src} />
        <div><Meta name="Ivan" time="3:56 pm" /><p>Yeah that's a bug not a design gap, flagging to Anthony's team</p></div>
      </article>
      <article className="cua-chat-message-exact">
        <Avatar src={sara.src} />
        <div><Meta name="Sara" time="3:56 pm" /><p><strong>@Calvin</strong> Quick one - did we land on whether the agent status pill lives in the composer or the message itself? I have two people building against different assumptions rn</p></div>
      </article>
      <div className="cua-chat-date-exact"><span>Today</span></div>
      <article className="cua-chat-message-exact cua-chat-message-exact--calvin">
        <Avatar src={calvin.src} />
        <div><Meta name="Calvin" time="10:34 am" /><p>Composer, per the thread from Tuesday. But I don't think we ever updated the spec doc, my bad - updating now</p></div>
      </article>
      <article className={`cua-chat-message-exact cua-chat-message-exact--posted${posted ? " is-visible" : ""}`}>
        <Avatar src={sara.src} />
        <div>
          <Meta name="Sara" time="10:34 am" />
          <p><strong>@Design Prioritizer</strong> {PROMPT}</p>
          {replied && (
            <div className="cua-chat-reply-exact">
              <img className="cua-chat-thread-line" src={threadLine.src} alt="" />
              <ReplyAvatars replyCount={replyCount} />
              <strong>{replyCount} {replyCount === 1 ? "reply" : "replies"}</strong><span>Just now</span>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function Composer({ frame }: { frame: ChatFrame }) {
  const icons = [compactAdd.src, compactAttach.src, compactMention.src, compactComment.src, compactReaction.src];
  return (
    <div className="cua-chat-composer-frame">
      <div className="cua-chat-composer-exact">
        <p className={frame.typed ? "is-typing" : "is-placeholder"}>
          {!frame.typed && <i className="cua-chat-caret" />}
          {frame.typed || "Write to Product Design"}
          {frame.typed && <i className="cua-chat-caret" />}
        </p>
        <div className="cua-chat-composer-tools">
          {icons.map((icon, index) => (
            <span className={index === 0 ? "is-add" : ""} key={icon}><img src={icon} alt="" /></span>
          ))}
        </div>
        <span className="cua-chat-send"><img src={compactSend.src} alt="" /></span>
      </div>
    </div>
  );
}

const BLOCKERS = [
  { label: "Redesign Agents", status: "IN DESIGN", tone: "orange", kind: "progress" },
  { label: "UI Refinements", status: "NEEDS DESIGN", tone: "red", kind: "milestone", avatar: mykyta.src },
  { label: "Broken Links", status: "IN DESIGN", tone: "orange", kind: "bug" },
  { label: "[CLK-24] Merger", status: "WAITING", tone: "mint", kind: "medal" },
] as const;

function BlockerIcon({ kind }: { kind: (typeof BLOCKERS)[number]["kind"] }) {
  if (kind === "progress") {
    return <span className="cua-chat-blocker-icon is-progress"><img src={progressRing.src} alt="" /><img src={progressDot.src} alt="" /></span>;
  }
  if (kind === "milestone") {
    return <span className="cua-chat-blocker-icon"><img src={milestone.src} alt="" /></span>;
  }
  return <span className={`cua-chat-blocker-icon cua-chat-blocker-icon--${kind}`} aria-hidden="true" />;
}

function ThreadPanel({ frame }: { frame: ChatFrame }) {
  return (
    <aside className={`cua-chat-thread-exact${frame.posted ? " is-visible" : ""}`}>
      <header>Sara’s thread <span><img src={close.src} alt="" /></span></header>
      <div className="cua-chat-thread-body-exact">
        <article className="cua-chat-message-exact">
          <Avatar src={sara.src} />
          <div><Meta name="Sara" time="10:34 am" /><p><strong>@Design Prioritizer</strong> {PROMPT}</p></div>
        </article>
        {frame.replied && (
          <>
            <div className="cua-chat-replies-exact"><span>{frame.calendar ? 2 : 1} {frame.calendar ? "replies" : "reply"}</span></div>
            <article className="cua-chat-message-exact cua-chat-prioritizer-message">
              <Avatar src={prioritizer.src} />
              <div>
                <Meta name="Design Prioritizer" time="10:34 am" />
                {frame.thinking ? (
                  <div className="cua-chat-thinking"><i /><i /><i /></div>
                ) : (
                  <p>This week, we have 4 design blockers marked P0:</p>
                )}
              </div>
            </article>
            <ul className="cua-chat-blockers-exact">
              {BLOCKERS.map((blocker, index) => (
                <li className={index < frame.blockers ? "is-visible" : ""} key={blocker.label}>
                  <BlockerIcon kind={blocker.kind} />
                  <span>{blocker.label}</span>
                  <b className={`is-${blocker.tone}`}>{blocker.status}</b>
                  {"avatar" in blocker && <img className="cua-chat-assignee" src={blocker.avatar} alt="" />}
                </li>
              ))}
            </ul>
            <article className={`cua-chat-message-exact cua-chat-calendar-exact${frame.calendar ? " is-visible" : ""}`}>
              <Avatar src={sara.src} />
              <div><Meta name="Sara" time="10:34 am" /><p><strong>@Calendar agent</strong> Set a calendar invite for the assignees of the Broken Links task</p></div>
            </article>
          </>
        )}
      </div>
    </aside>
  );
}

function AgentStatus({ visible }: { visible: boolean }) {
  return (
    <div className={`cua-chat-agent-status${visible ? " is-visible" : ""}`}>
      <span>
        <img src={statusAgent.src} alt="" />
        <span className="cua-chat-status-dots"><i /><i /><i /></span>
      </span>
      <p>Checking 3 calendars</p>
    </div>
  );
}

export default function ClickUpAIChatDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const [frame, setFrame] = useState<ChatFrame>(reducedMotion ? FINAL_FRAME : frameAt(0));

  useEffect(() => {
    if (reducedMotion) {
      setFrame(FINAL_FRAME);
      return;
    }
    const started = performance.now();
    const id = window.setInterval(() => {
      setFrame(frameAt((performance.now() - started) % 16000));
    }, 32);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="cua-chat-demo study-image" role="img" aria-label="ClickUp AI chat animation showing an agent prioritizing design blockers">
      {/* Right-anchored slice: identical to the default fit while the frame
          keeps the viewBox's ratio, and crops off the left sidebar once a
          narrow-width rule makes the frame proportionally taller. */}
      <svg
        className="cua-chat-viewport"
        viewBox="0 0 936.667 500"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <foreignObject width="936.667" height="500">
          <div className={`cua-chat-stage${frame.posted ? " is-thread-open" : ""}`}>
            <div className="cua-chat-app" />
            <div className="cua-chat-main-background" />
            <div className="cua-chat-noise" aria-hidden="true" />
            <Sidebar />
            <Header />
            <MainMessageList posted={frame.posted} replied={frame.replied} replyCount={frame.calendar ? 2 : 1} />
            <Composer frame={frame} />
            <ThreadPanel frame={frame} />
            <AgentStatus visible={frame.calendar} />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
