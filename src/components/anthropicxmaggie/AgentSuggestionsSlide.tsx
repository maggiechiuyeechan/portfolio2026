import type { CSSProperties, ReactNode } from "react";
import ClickUpAIChatDemo from "../work/ClickUpAIChatDemo";
import { artwork } from "./agent-suggestions-artwork";
import "./AgentSuggestionsSlide.css";

type Box = readonly [x: number, y: number, width?: number, height?: number];
type Asset = { node: string; box: Box; file: string; alt: string; crop?: Box; rounded?: boolean; rotation?: number; omitProductRow?: boolean };
const assets: Record<string, readonly Asset[]> = artwork;
const assetBase = "/anthropicxmaggie/slides/agent-suggestions/";
const chatDemoWidth = 1583;

function placement([x, y, width, height]: Box) {
  return {
    left: `${x / 1728 * 100}%`,
    top: `${y / 1117 * 100}%`,
    width: width === undefined ? undefined : `${width / 1728 * 100}%`,
    height: height === undefined ? undefined : `${height / 1117 * 100}%`,
  };
}

function Block({ node, box, className = "", children }: {
  node: string;
  box: Box;
  className?: string;
  children?: ReactNode;
}) {
  return <div className={`axm-suggestions-block ${className}`} data-node-id={node} style={placement(box)}>
    {children}
  </div>;
}

function Artwork({ node, box, file, alt, crop, rounded, rotation, omitProductRow }: Asset) {
  const [left, top, width, height] = crop ?? [0, 0, 100, 100];
  const imageStyle = rotation
    ? { left: "50%", top: "50%", width: box[3], height: box[2], transform: `translate(-50%, -50%) rotate(${rotation}deg)` }
    : { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };
  return <Block node={node} box={box} className={`axm-suggestions-art${rounded ? " axm-suggestions-art--rounded" : ""}${omitProductRow ? " axm-suggestions-art--omit-product" : ""}`}>
    <img src={assetBase + file} alt={alt} style={imageStyle} />
    {omitProductRow && <img src={assetBase + file} alt="" style={imageStyle} />}
    {node === "454:153322" && <img className="axm-suggestions-aligned-agent-label" src={assetBase + file} alt="" style={imageStyle} />}
  </Block>;
}

function Heading({ node, box, children, secondary }: { node: string; box: Box; children?: ReactNode; secondary?: ReactNode }) {
  return <Block node={node} box={box}>
    {children && <h1>{children}</h1>}
    {secondary && <p className="axm-suggestions-secondary">{secondary}</p>}
  </Block>;
}

function Challenge({ node, width, rows }: { node: string; width: number; rows: readonly (readonly [string, string])[] }) {
  return <Block node={node} box={[64, 64, width]}>
    {rows.map(([label, value]) => <p key={label}>{label}<span className="axm-suggestions-secondary">{value}</span></p>)}
  </Block>;
}

const frames: Record<number, string> = {
  4.661: "449:134333", 4.662: "447:130688", 4.663: "455:153334", 4.664: "447:134274",
  4.665: "450:134385", 4.666: "478:43674", 4.667: "450:134400", 4.668: "450:134436",
  4.669: "idea-to-test-onboarding", 4.6691: "447:134277", 4.67: "452:134469", 4.671: "450:134358", 4.672: "450:134354",
  4.673: "452:134525", 4.674: "452:134474", 4.675: "452:134577", 4.676: "453:142247",
  4.6761: "450:134366", 4.677: "449:134335",
};

const agentSuggestionFunnel = [
  { label: "Pressed “Try it”", value: "8,697", labelNode: "457:161485", barNode: "457:161482", labelTop: 624, barTop: 658, barWidth: 433 },
  { label: "Started building", value: "1,563 (18%)", labelNode: "457:161486", barNode: "457:161483", labelTop: 731, barTop: 763, barWidth: 215 },
  { label: "Finished an agent", value: "353 (22.6%)", labelNode: "457:161487", barNode: "457:161484", labelTop: 835, barTop: 871, barWidth: 95 },
];

function AgentSuggestionResults({ title }: { title: string }) {
  return <>
    <Heading node="450:134367" box={[64, 173, 1117]}>{title}</Heading>
    <div className="axm-suggestions-results">
      <Block node="457:161474" box={[64, 446, 708]} className="axm-suggestions-results-summary">
        <p>People do not want to go to the builder.</p>
        <p className="axm-suggestions-secondary">As predicted, we continue to see drop-off in the builder stage of the flow. Next version will attempt at a no-builder flow - ask for more setup after value is proven.</p>
      </Block>
      <Block node="457:161475" box={[876, 446, 620]} className="axm-suggestions-results-summary">
        <p>Specific agent use cases led more to completion.</p>
        <p className="axm-suggestions-secondary">This allows us to concentrate our efforts into creating better versions for these use cases.</p>
      </Block>
      {agentSuggestionFunnel.map(({ label, value, labelNode, barNode, labelTop, barTop, barWidth }) =>
        <div key={labelNode} className="axm-suggestions-funnel-row">
          <Block node={labelNode} box={[64, labelTop]}>
            <p>{label} <strong>{value}</strong></p>
          </Block>
          <div data-node-id={barNode} aria-hidden="true" style={placement([64, barTop, barWidth, 44])} className="axm-suggestions-results-bar" />
        </div>
      )}
      <Block node="458:161488" box={[64, 932]} className="axm-suggestions-funnel-note">
        <p>Roughly 1 in 25 clickers ends up with a finished agent.</p>
      </Block>
      <Block node="459:8314" box={[876, 617, 680]} className="axm-suggestions-results-templates">
        <div data-node-id="459:8315">
          <p>Full-funnel winners:</p>
          <ul className="axm-suggestions-secondary">
            <li>Personal Assistant — #1 → #1 → #1</li>
            <li>Project Manager — #2 → #2 → #2</li>
            <li>Social Media Content Studio — #4 → #4 → #4</li>
            <li>Daily Routine Planner — #3 → #3 → #6</li>
            <li>Data &amp; Excel Analyst — #8 → #5 → #3</li>
          </ul>
          <p>Consistent worst performers:</p>
          <ul className="axm-suggestions-secondary">
            <li>Mentions Digest — #25 → #25 → Tied last</li>
            <li>Competitive Intel Research — #24 → #21 → Tied last</li>
            <li>Pulse Survey Manager — #23 → #23 → #22</li>
            <li>Custom Field Sync Agent — #22 → #22 → #24</li>
            <li>Activity Updates — #18 → #23 → Tied last</li>
          </ul>
        </div>
        <p data-node-id="459:8316">Winners stay top-tier at every stage.</p>
      </Block>
    </div>
  </>;
}

const recurringThemes = [
  { node: "454:147734", left: 64, width: 483, bodyWidth: 463, title: "Setup complexity & learning curve", description: "Many users want simpler, more guided setup and clearer explanations of how agents work", mentions: "18 mentions" },
  { node: "454:147735", left: 632, width: 464, bodyWidth: 464, title: "High credit costs", description: "Agents reportedly feel expensive, unpredictable, and credits are poorly explained", mentions: "~7 mentions" },
  { node: "454:147736", left: 1160, width: 504, bodyWidth: 464, title: "Model quality & execution reliability", description: "Agents are giving incorrect or generic instructions and not honoring rules. Users reported agents being slow, flaky, or inconsistent (particularly with scheduled and bulk operations)", mentions: "~26 mentions" },
];

const builderOptions = [
  { node: "456:157002", left: 113, width: 459.64, caption: "Pre-filled prompt in builder" },
  { node: "456:157003", left: 655.34, width: 464.45, caption: "Auto-executed prompt in builder" },
  { node: "456:157004", left: 1195.75, width: 419.25, caption: "Skip the builder" },
];

const whiteboardCursors = [
  { name: "Olga", x: 1257, y: 511, color: "pink" },
  { name: "Michael", x: 504, y: 494, color: "blue" },
  { name: "Shantelle", x: 976, y: 482, color: "orange" },
  { name: "Maggie", x: 777, y: 679, color: "blue" },
  { name: "Rami", x: 658, y: 735, color: "green" },
] as const;

const sidebarLabels = [
  ["456:158476", 196, 256, undefined, "originally, everyone would get this"],
  ["456:158474", 915, 256, undefined, "If AI or chat intent"],
  ["456:158475", 1404, 256, undefined, "If no ai or chat intent"],
  ["456:158478", 64, 355, 93, "Default pages"],
  ["456:158479", 64, 531, 93, "agents"],
  ["456:158480", 64, 763, 93, "chats"],
  ["456:158481", 64, 977, 93, "project management"],
  ["456:158483", 767, 531, 93, "agents"],
  ["456:158484", 767, 763, 93, "chats"],
  ["456:158485", 767, 977, 93, "project management"],
  ["456:158505", 1258, 563, 93, "project management"],
  ["456:158503", 1258, 760, 93, "agents"],
  ["456:158504", 1258, 954, 93, "chats"],
] as const;

const sidebarBrackets = [
  ["456:158490", 157, 294, 175],
  ["456:158493", 157, 488, 141],
  ["456:158494", 157, 648, 294],
  ["456:158495", 157, 961, 98],
  ["456:158500", 876, 482, 141],
  ["456:158501", 876, 642, 294],
  ["456:158502", 876, 955, 98],
  ["456:158509", 1367, 482, 206],
  ["456:158507", 1367, 707, 141],
  ["456:158508", 1367, 867, 187],
] as const;

const fades: Record<string, readonly (readonly [node: string, box: Box, direction?: "up"])[]> = {
  "447:134277": [
    ["456:157047", [231, 339, 325, 208]],
    ["456:157048", [600, 339, 325, 208]],
    ["456:157050", [983, 339, 325, 208]],
    ["456:157052", [978, 888, 325, 156], "up"],
    ["456:157053", [609, 888, 325, 156], "up"],
    ["456:157054", [226, 888, 325, 156], "up"],
  ],
  "450:134358": [
    ["456:157059", [530, 287, 497, 301]],
    ["456:157061", [530, 815, 497, 301], "up"],
  ],
  "453:142247": [
    ["456:158510", [338.671875, 144, 406.25, 260]],
    ["456:158511", [799.921875, 144, 440, 260]],
    ["456:158512", [811.171875, 843.59, 428.75, 173.75], "up"],
    ["456:158513", [323.671875, 843.59, 428.75, 173.75], "up"],
  ],
};

function IterationTooltip() {
  return <Block node="453:145651" box={[1207.578125, 419.15625, 359.375, 179.1875]} className="axm-suggestions-iteration-tooltip">
    <img className="axm-suggestions-iteration-arrow" data-node-id="453:145653" src={assetBase + "453-145653.svg"} alt="" />
    <div className="axm-suggestions-iteration-tooltip-body" data-node-id="453:145654">
      <div>
        <p className="axm-suggestions-iteration-tooltip-title" data-node-id="453:145658">UX writer</p>
        <p data-node-id="453:145659">Cleans up typos, tightens sentences, and ensures everything reads perfectly.</p>
      </div>
      <div className="axm-suggestions-iteration-tooltip-divider" data-node-id="453:145660" aria-hidden="true" />
      <p className="axm-suggestions-iteration-tooltip-credit" data-node-id="453:145663">
        <img data-node-id="453:145662" src={assetBase + "453-145662.svg"} alt="" />
        Recommended by ClickUp
      </p>
    </div>
  </Block>;
}

function SlideCopy({ number, title }: { number: number; title: string }) {
  switch (number) {
    case 4.661:
      return <Block node="449:134334" box={[0, 534, 1728]} className="axm-suggestions-center axm-suggestions-case-study-divider">
        <p className="axm-suggestions-secondary">Case Study 2</p>
        <h1>Agent Suggestions</h1>
      </Block>;
    case 4.662:
      return <>
        <Heading node="447:134275" box={[81, 64, 998]}>Context: Agents were launched in Dec 2025</Heading>
        <Block node="450:134382" box={[81, 233, chatDemoWidth]}>
          <ClickUpAIChatDemo useOriginalAgentAvatars fixedWidth={chatDemoWidth} />
        </Block>
      </>;
    case 4.663:
      return <>
        <Heading node="455:153335" box={[81, 64, 1117]}>We ran a number of different solution experiments. One of them was suggesting relevant agents to new users based on their intent.</Heading>
      </>;
    case 4.664:
      return <>
        <Heading node="449:134339" box={[64, 227, 1117]}>Shaped research program with<br />our lead UXR on agent's customer feedback</Heading>
        <Block node="450:134384" box={[64, 565, 760]} className="axm-suggestions-feedback">
          <p>Monthly surveys</p>
          <ul>
            <li>Custom perceived quality score via in-app surveys</li>
            <li>Qualitative feedback themes</li>
          </ul>
          <p>Weekly customer interviews</p>
          <ul><li>Use cases, painpoints, opportunities</li></ul>
        </Block>
        <Block node="450:134383" box={[880, 565, 656]} className="axm-suggestions-feedback">
          <p>Metrics via Amplitude</p>
          <ul>
            <li>Unique users</li>
            <li>Creation entry points</li>
            <li>Creation funnel</li>
            <li>Total agent runs</li>
            <li>W1 retention</li>
            <li>Manual triggers</li>
            <li>Setup time</li>
          </ul>
        </Block>
      </>;
    case 4.665:
      return <>
        <Heading node="450:134386" box={[64, 227, 1117]} secondary="Sample from Feb survey (n=83)">{title}</Heading>
        {recurringThemes.map(({ node, left, width, bodyWidth, title, description, mentions }) =>
          <Block key={node} node={node} box={[left, 559, width]} className="axm-suggestions-theme axm-suggestions-body">
            <h2>{title}</h2>
            <div className="axm-suggestions-secondary">
              <p style={{ maxWidth: bodyWidth }}>{description}</p>
              <p className="axm-suggestions-caption">{mentions}</p>
            </div>
          </Block>
        )}
      </>;
    case 4.666:
      return <>
        <Block node="489:8300" box={[0, 678, 1728, 451]} className="axm-suggestions-insight-panel" />
        <Heading node="478:43675" box={[64, 64, 1117, 130]}>{title}</Heading>
        <Block node="479:43693" box={[64, 312]} className="axm-suggestions-insight-label">Interview quote</Block>
        <Block node="488:8293" box={[64, 749]} className="axm-suggestions-insight-label">Survey qualitative quotes (feb 2026)</Block>
        <Block node="489:8294" box={[876, 749]} className="axm-suggestions-insight-label">Metrics from Amplitude</Block>
        <Block node="478:43690" box={[64, 349, 1170]} className="axm-suggestions-insight-quote">
          “Really hard to understand how it works. A lot of steps, so you lose track quite fast. You're supposed to use AI to help you not make everything so much longer.”
        </Block>
        <Block node="488:8288" box={[1282, 362, 382]} className="axm-suggestions-insight-context">
          <p>New-user participant P1, ~15:44.</p>
          <p>They had tried Automations first, hit an upgrade wall, and worked through builder follow-ups. This is the strongest emotional quote about setup effort.</p>
        </Block>
        <Block node="478:43687" box={[64, 797, 779]} className="axm-suggestions-insight-survey">
          <p>“I need more ideas on how to use them.”</p>
          <p>“More suggestions please”</p>
          <p>“I would love to be able to have an easier set up process, that doesn’t require as lengthy of a description for basic tasks.”</p>
        </Block>
        <Block node="489:8296" box={[852, 769, 812]} className="axm-suggestions-metrics">
          <div className="axm-suggestions-metric" data-node-id="478:43677">
            <p data-node-id="478:43679">% of people who finish setup flow on WS setup</p>
            <p className="axm-suggestions-metric-value" data-node-id="478:43680">~10%</p>
            <p data-node-id="478:43681">Jan - Sep 2026</p>
          </div>
          <div className="axm-suggestions-metric" data-node-id="478:43682">
            <p data-node-id="478:43684">Avg time to setup</p>
            <p className="axm-suggestions-metric-value" data-node-id="478:43685">7 min</p>
            <p data-node-id="478:43686">Jan - Sep 2026</p>
          </div>
        </Block>
      </>;
    case 4.667:
      return <Heading node="450:134439" box={[64, 74, 565]}>Where might we be able to provide a near “one-click” experience by providing relevant uses for agents</Heading>;
    case 4.668:
      return <Heading node="451:134468" box={[64, 64, 991]}>Prioritizing ideas that would have the most impact and balance of user reach, ability to match user’s intent, and reduce setup overhead (potentially by-passing the builder)</Heading>;
    case 4.669:
      return <>
        <Block node="growth-experiment-caption" box={[70, 88]} className="axm-suggestions-caption">Growth experiment</Block>
        <Heading node="454:149696" box={[70, 122.6, 1087]} secondary={<>For new users, match the user’s intent as expressed on the onboarding survey and suggest relevant agents, by-passing<br />as many steps in the builder as possible</>} />
      </>;
    case 4.6691:
      return <Heading node="454:149696" box={[70, 74, 1087]}>{title}</Heading>;
    case 4.67:
      return <>
        <Heading node="452:134472" box={[70, 64, 985]} secondary="Team did not have an answer for good suggestion logic">{title}</Heading>
        <Block node="454:149684" box={[64, 372, 220]} className="axm-suggestions-body">Input</Block>
        <Block node="452:134522" box={[314, 372, 1000]} className="axm-suggestions-body">Mined 21,033 unique agent configurations</Block>
        <Block node="454:149685" box={[64, 468, 230]} className="axm-suggestions-body">Ranking score<br />(simplified)</Block>
        <Block node="452:134515" box={[314, 468, 1093]} className="axm-suggestions-body axm-suggestions-ranking">
          <ul>
            <li><span>Agent Popularity</span> (agent runs, unique user &amp; ws)</li>
            <li><span>Agent Quality</span> (agent runs, unique user &amp; ws)</li>
          </ul>
        </Block>
        <Block node="454:149686" box={[64, 619, 220]} className="axm-suggestions-body">Output</Block>
        <Block node="452:134523" box={[314, 619, 1083]} className="axm-suggestions-body axm-suggestions-ranking">
          <ul>
            <li>A clean <span>template name</span> suitable for a product gallery</li>
            <li>A <span>starter prompt</span> that synthesizes the common intent across all agents in the cluster: specific enough to be useful, general enough to apply broadly</li>
            <li><span>150 use-case</span> archetypes emerged</li>
            <li>Top use case examples:
              <ul>
                <li>Progress Pulse Reporter (22 agents, 89% success, score 0.59),</li>
                <li>Weekly Activity Standup (39 agents, 89% success)</li>
                <li>Weekly Project Report (210 agents, 86% success)</li>
              </ul>
            </li>
          </ul>
        </Block>
      </>;
    case 4.671:
      return <Challenge node="450:134359" width={1300} rows={[
        ["Challenged: ", "team’s logic on inability to persist user settings"],
        ["Team’s proposal: ", "hiding suggestions would not be able to persist after a logout"],
        ["Result: ", "Spoke to engineer who built the dynamic ux platform directly to see if we can achieve the desired ux"],
      ]} />;
    case 4.672:
      return <>
        <Challenge node="451:134442" width={1600} rows={[
          ["Challenged: ", "Builder vs auto-execute"],
          ["Team’s proposal: ", "Option 1 pre-filled prompt in builder"],
          ["Result: ", "went with Option 1 - team articulated hypothesis and named clear tradeoffs"],
        ]} />
        {builderOptions.map(({ node, left, width, caption }, index) =>
          <Block key={node} node={node} box={[left, 512.32, width]} className="axm-suggestions-option axm-suggestions-center">
            <h2>Option {index + 1}</h2>
            <p className="axm-suggestions-body axm-suggestions-secondary">{caption}</p>
          </Block>
        )}
      </>;
    case 4.673:
      return <>
        <Challenge node="452:134535" width={1619} rows={[
          ["Challenged: ", "team’s proposal to place agents as first section"],
          ["Team’s proposal: ", "Agent suggestions would always be ontop of Spaces"],
          ["Results:  ", "Sidebar section order adapts based on primary intent"],
        ]} />
      </>;
    case 4.674:
      return <Heading node="452:134475" box={[53, 64, 1117]}>{title}</Heading>;
    case 4.675:
      return <Heading node="452:134578" box={[64, 83, 1117]}>{title}</Heading>;
    case 4.676:
      return <Heading node="453:142248" box={[64, 83, 1117]}>{title}</Heading>;
    case 4.6761:
      return <AgentSuggestionResults title={title} />;
    case 4.677:
      return <Block node="449:134336" box={[0, 534, 1728]} className="axm-suggestions-center axm-suggestions-case-study-divider">
        <p className="axm-suggestions-secondary">Case Study 3</p>
        <h1>IC prototypes</h1>
      </Block>;
  }
}

export default function AgentSuggestionsSlide({ number, title }: { number: number; title: string }) {
  const frame = frames[number];
  return <div className="axm-suggestions" data-node-id={frame}>
    <div className="axm-suggestions-visual">
      {assets[frame] && <div className="axm-suggestions-artwork">
        {assets[frame].map((asset, index) => <Artwork key={`${asset.node}-${index}`} {...asset} />)}
      </div>}
      {fades[frame]?.map(([node, box, direction]) =>
        <Block key={node} node={node} box={box} className={`axm-suggestions-fade${direction === "up" ? " axm-suggestions-fade--up" : ""}`} />
      )}
      {number === 4.676 && <IterationTooltip />}
      {number === 4.667 && whiteboardCursors.map(({ name, x, y, color }) =>
        <div key={name} className="axm-suggestions-whiteboard-cursor" style={{
          ...placement([x, y]),
          "--cursor-color": `var(--presentation-cursor-${color})`,
        } as CSSProperties}>
          <svg width="23.2968" height="24.264" viewBox="0 0 23.2968 24.264" aria-hidden="true">
            <path d="M8.75418 20L5.62291 4.0409L20 11.9182L12.9181 13.9727L8.75418 20Z" />
          </svg>
          <span>{name}</span>
        </div>
      )}
      {number === 4.673 && <>
        <div className="axm-suggestions-sidebar-divider" style={placement([640, 257, undefined, 789])} aria-hidden="true" />
        {sidebarLabels.map(([node, left, top, width, label]) =>
          <Block key={node} node={node} box={[left, top, width]} className="axm-suggestions-caption">{label}</Block>
        )}
        {sidebarBrackets.map(([node, left, top, height]) =>
          <Block key={node} node={node} box={[left, top, 27, height]} className="axm-suggestions-bracket" />
        )}
      </>}
    </div>
    <SlideCopy number={number} title={title} />
  </div>;
}
