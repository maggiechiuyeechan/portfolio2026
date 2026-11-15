import { Fragment, type CSSProperties, type ReactNode } from "react";
import "./ClickUpCaseStudySlide.css";

const assetBase = "/anthropicxmaggie/slides/clickup-projects/";
type Box = [x: number, y: number, width: number, height: number];
type Crop = [width: number, height: number, left?: number, top?: number];
type ArtworkVideo = { src: string; playbackRate: number; fit?: "cover"; scale?: number; topCrop?: number };

function position([x, y, width, height]: Box, parentWidth = 1728, parentHeight = 1117): CSSProperties {
  return { left: x / parentWidth * 100 + "%", top: y / parentHeight * 100 + "%", width: width / parentWidth * 100 + "%", height: height / parentHeight * 100 + "%" };
}

const docsPillIcons = [
  { name: "help", bounds: [2077, 788, 39, 39], channels: [0.36, 0.64, 0], foreground: 70 },
  { name: "table", bounds: [2410, 788, 39, 39], channels: [1, 0, 0], foreground: 24 },
  { name: "todo", bounds: [2603, 789, 39, 36], channels: [1, 0, 0], foreground: 11 },
  { name: "meeting", bounds: [2850, 788, 37, 37], channels: [0, 0, 1], foreground: 0 },
];

function DocsPillIconFilter() {
  return (
    <svg className="axm-case-study-filter-definitions" width="0" height="0" aria-hidden="true">
      <filter id="axm-docs-pill-icons" x="0" y="0" width="1" height="1"
        filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
        {docsPillIcons.map(({ name, bounds: [x, y, width, height], channels, foreground }) => {
          const region = { x: x / 4096, y: y / 2560, width: width / 4096, height: height / 2560 };
          // Recover the icon's antialiased coverage against the screenshot's white pill.
          const scale = 255 / (255 - foreground);
          const alpha = channels.map((channel) => -channel * scale).join(" ");
          return (
            <Fragment key={name}>
              <feColorMatrix {...region} in="SourceGraphic" type="matrix"
                values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${alpha} 0 ${scale}`} result={`${name}-mask`} />
              <feFlood {...region} floodColor="var(--color-gray-11)" result={`${name}-ink`} />
              <feComposite {...region} in={`${name}-ink`} in2={`${name}-mask`} operator="in" result={`${name}-icon`} />
              <feFlood {...region} floodColor="var(--color-white)" result={`${name}-pill`} />
              <feComposite {...region} in={`${name}-icon`} in2={`${name}-pill`} operator="over" result={name} />
            </Fragment>
          );
        })}
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          {docsPillIcons.map(({ name }) => <feMergeNode key={name} in={name} />)}
        </feMerge>
      </filter>
    </svg>
  );
}

function Copy({ node, box, children, kind = "lead" }: {
  node: string; box: Box; children: ReactNode; kind?: "lead" | "centered-lead" | "caption" | "label";
}) {
  return <div className={`axm-case-study-copy axm-case-study-copy--${kind}`} data-node-id={node} style={position(box)}>{children}</div>;
}

function Artwork({ node, box, file, alt, crop, rounded = false, elevation, fit, video, children }: {
  node?: string; box: Box; file?: string; alt: string; crop?: Crop; rounded?: boolean; elevation?: string; fit?: "contain"; video?: ArtworkVideo; children?: ReactNode;
}) {
  const [width, height, left = 0, top = 0] = crop ?? [100, 100];
  return (
    <div className={`axm-case-study-artwork${rounded ? " axm-case-study-artwork--rounded" : ""}`}
      data-node-id={node} style={{ ...position(box), boxShadow: elevation ? `var(--${elevation})` : undefined }}>
      {video ? (
        <video src={video.src} poster={file ? assetBase + file : undefined} aria-label={alt}
          style={{
            objectFit: video.fit,
            objectPosition: video.topCrop === undefined ? undefined : `center -${video.topCrop}px`,
            scale: video.scale,
            transformOrigin: video.topCrop === undefined ? undefined : "center top",
          }}
          autoPlay muted loop playsInline preload="metadata"
          onLoadedMetadata={(event) => { event.currentTarget.playbackRate = video.playbackRate; }} />
      ) : file && (
        <img src={assetBase + file} alt={alt} style={{ width: width + "%", height: height + "%", left: left + "%", top: top + "%",
          objectFit: fit, objectPosition: fit ? "center top" : undefined }} />
      )}
      {children}
    </div>
  );
}

type Screenshot = {
  frame: string;
  heading: string;
  artwork: string;
  box: Box;
  file: string;
  crop?: Crop;
  fit?: "contain";
  white?: boolean;
  rounded?: boolean;
  elevation?: string;
  video?: ArtworkVideo;
};

const screenshots: Partial<Record<number, Screenshot>> = {
  4.54: { frame: "441:125524", heading: "441:125531", artwork: "442:125533", box: [142.5, 119, 1443, 900], file: "441-125524-1.png", crop: [100, 106.9], rounded: true, elevation: "elevation-border-3" },
  4.541: {
    frame: "442:125534", heading: "442:125536", artwork: "442:125538",
    box: [119.33, 119, 1489.34, 900], file: "whiteboards-4-0-poster.webp",
    rounded: true, elevation: "elevation-border-3",
    video: { src: "/anthropicxmaggie/video/whiteboards-4-0.mp4", playbackRate: 1.25 },
  },
  4.55: { frame: "442:125550", heading: "442:125551", artwork: "442:125552", box: [103, 152, 1522, 867], file: "442-125550-1.png", crop: [100, 109.72, 0, 0.02], rounded: true, elevation: "elevation-border-3" },
  4.56: { frame: "442:125553", heading: "442:125554", artwork: "442:125555", box: [103, 152, 1522, 862], file: "442-125553-1.png", crop: [100, 110.35, 0, 0.02], fit: "contain", rounded: true, elevation: "elevation-border-3" },
  4.57: { frame: "442:125556", heading: "442:125557", artwork: "442:125558", box: [103, 152, 1522, 867], file: "442-125556-1.png", crop: [100, 109.72, 0, 0.02], rounded: true, elevation: "elevation-border-3" },
  4.58: { frame: "442:125585", heading: "442:125586", artwork: "442:125587", box: [167, 152, 1394, 871], file: "442-125585-1.png", crop: [100, 100.03, 0, 0.02], rounded: true, elevation: "elevation-border-3" },
  4.59: { frame: "442:125582", heading: "442:125583", artwork: "442:125584", box: [104.5, 152, 1519, 865], file: "442-125582-1.png", rounded: true, elevation: "elevation-border-3" },
  4.60: { frame: "442:127382", heading: "442:127383", artwork: "442:127385", box: [39.5, 233, 1649, 651], file: "442-127382-1.png", white: true },
  4.61: { frame: "442:127389", heading: "442:127390", artwork: "442:127880", box: [238, 194, 1252, 729], file: "442-127389-1.png", white: true },
};

const headerCaptions: Partial<Record<number, readonly (readonly [string, number, number])[]>> = {
  4.60: [
    ["Tasks", 58, 32.5],
    ["Docs", 58, 131.5],
    ["Dashboards", 58, 222.5],
    ["Whiteboards", 58, 332.5],
    ["Locations", 58, 469.5],
  ],
  4.61: [
    ["Whiteboards", 82, 53],
    ["Docs", 82, 177],
    ["Task", 82, 318],
    ["Location with chat", 82, 440],
    ["Location without chat", 82, 579],
  ],
};

const badges = [
  ["443:128839", 28, 303], ["443:128841", 289, 275], ["443:128843", 226, 240],
  ["443:128845", 1051, 196], ["443:128848", 1133, 310], ["443:128850", 649, 247],
  ["443:128852", 233, 361], ["443:128854", 177, 467], ["443:128856", 184, 545],
  ["443:128858", 446, 958], ["443:128860", 22, 979],
] as const;

function ExperimentArrows({ nodes }: { nodes: [string, string] }) {
  return <>
    <Artwork node={nodes[0]} box={[1312.8, 396.4, 30.04, 11.02]} file="443-128795-2.svg" alt="" />
    <Artwork node={nodes[1]} box={[1294.92, 411.54, 27.94, 44.03]} file="443-128795-3.svg" alt="" />
  </>;
}

function TestingClip({ href }: { href: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">clip</a>;
}

function LaunchResults() {
  return <div className="axm-case-study" data-node-id="445:128866">
    <Copy node="457:158521" box={[64, 290, 585, 130]}>
      Positive quantitative results allowed us to launch in to GA in Oct 2025
    </Copy>
    <table className="axm-case-study-results" aria-label="W1 Retention" style={position([64, 515, 585, 339])}>
      <colgroup><col style={{ width: 406 }} /><col /></colgroup>
      <thead data-node-id="457:158540">
        <tr>
          <th scope="col" data-node-id="457:158523"><strong>W1 Retention</strong></th>
          <th scope="col" data-node-id="457:158528">4.0 vs 3.0</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Overall</th><td>+2.9%</td></tr>
        <tr><th scope="row">Company Domains</th><td>+3.33%</td></tr>
        <tr><th scope="row">Freemail</th><td>+4.3%</td></tr>
      </tbody>
    </table>
    <table className="axm-case-study-results" aria-label="NPS" style={position([876, 515, 788, 339])}>
      <colgroup><col style={{ width: 406 }} /><col style={{ width: 138 }} /><col style={{ width: 135 }} /><col /></colgroup>
      <thead data-node-id="457:158541">
        <tr>
          <th scope="col" data-node-id="457:158524"><strong>NPS</strong> <span className="axm-case-study-secondary">(Sep 2025, n=4.6k)</span></th>
          <th scope="col" data-node-id="457:158530">4.0</th>
          <th scope="col" data-node-id="457:158531">3.0</th>
          <th scope="col" data-node-id="457:158532">Delta</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">All users</th><td>43.2</td><td>28.1</td><td>+15.1</td></tr>
        <tr><th scope="row">Tenured users <span className="axm-case-study-secondary">(7+ mo)</span></th><td>49.6</td><td>29.4</td><td>+20.2</td></tr>
        <tr><th scope="row">New users <span className="axm-case-study-secondary">(&lt;7 mo)</span></th><td>40.7</td><td>24.0</td><td>+16.7</td></tr>
      </tbody>
    </table>
  </div>;
}

export default function ClickUpCaseStudySlide({ number, title }: { number: number; title: string }) {
  const screenshot = screenshots[number];
  if (screenshot) {
    const [subject, comparison] = title.split(/ (before|after)$/i);
    return <div className={`axm-case-study${screenshot.white ? "" : " axm-case-study--gray"}${number <= 4.59 ? " axm-case-study--compact-artwork" : ""}`} data-node-id={screenshot.frame}>
      {number === 4.57 && <DocsPillIconFilter />}
      <Copy node={screenshot.heading} box={[64, screenshot.white ? 64 : 48, 1600, 48]} kind="centered-lead">
        {comparison ? <span className="axm-case-study-comparison-title">{subject} <span>{comparison}</span></span> : title}
      </Copy>
      <Artwork node={screenshot.artwork} box={screenshot.box} file={screenshot.file} alt={title}
        crop={screenshot.crop} fit={screenshot.fit} rounded={screenshot.rounded} elevation={screenshot.elevation} video={screenshot.video}>
        {headerCaptions[number]?.map(([label, x, centerY]) =>
          <span key={label} className="axm-case-study-header-caption"
            style={position([x - 2, centerY - 6, 190, 12], screenshot.box[2], screenshot.box[3])}>{label}</span>
        )}
      </Artwork>
    </div>;
  }

  switch (number) {
    case 4.631:
      return <div className="axm-case-study" data-node-id="480:8282">
        <Copy node="480:8286" box={[64, 64, 1015, 48]}>{title}</Copy>
        <p className="axm-case-study-navigation-feedback" data-node-id="480:8288" style={position([64, 277, 788, 219])}>
          Customer A, Enterprise account, said some navigation items didn’t fit their workflows and asked for customizable navigation.
        </p>
        <p className="axm-case-study-navigation-feedback" data-node-id="481:8291" style={position([876, 277, 748, 219])}>
          Customer B: “Spaces section located at the bottom of the sidebar creates friction.”
        </p>
        <div className="axm-case-study-navigation-panel" data-node-id="481:8293" style={position([64, 402, 788, 647])}>
          <div className="axm-case-study-navigation-video axm-case-study-navigation-video--pin" data-node-id="481:8289"
            style={position([180.5, 48, 428, 552], 788, 647)}>
            <video src="/anthropicxmaggie/video/navigation-pin-unpin-clean.mp4" poster={assetBase + "navigation-pin-unpin-poster.png"}
              aria-label="Pinning and unpinning navigation items" autoPlay muted loop playsInline preload="metadata"
              style={position([0, 0, 970, 1286], 970, 552 / 428 * 970)} />
          </div>
        </div>
        <div className="axm-case-study-navigation-panel" data-node-id="481:8297" style={position([876, 402, 788, 647])}>
          <div className="axm-case-study-navigation-video" data-node-id="481:8290"
            style={position([101, 39, 587, 569], 788, 647)}>
            <video src="/anthropicxmaggie/video/navigation-sections.mp4#t=0.12" poster={assetBase + "navigation-sections-poster.png"}
              aria-label="Reordering sidebar sections" autoPlay muted loop playsInline preload="metadata"
              style={position([-140, -65, 1148, 982], 895, 569 / 587 * 895)} />
          </div>
        </div>
      </div>;
    case 4.6001:
      return <div className="axm-case-study axm-case-study--gray">
        <Copy node="442:127383" box={[64, 64, 1600, 48]} kind="centered-lead">{title}</Copy>
        <Artwork box={[220.35, 312.47, 834.3, 494.163]} file="status-colors-feedback.png"
          crop={[100, 100 + 2 / 494.163 * 100, 0, -2 / 494.163 * 100]}
          alt="Customer feedback on the readability of ClickUp status colors"
          rounded elevation="elevation-border-3" />
        <Artwork box={[1102.65, 312.47, 405, 494.163]} alt="ClickUp color picker recording"
          rounded elevation="elevation-border-3"
          video={{ src: "/anthropicxmaggie/video/color-picker-overlap.mp4", playbackRate: 1, fit: "cover", scale: 1.055, topCrop: 10 }} />
      </div>;
    case 4.51:
      return <div className="axm-leadership-heading" data-node-id="448:134324">
        <header data-node-id="448:134325"><p>Case Study 1</p><h1>ClickUp 4.0</h1></header>
      </div>;
    case 4.52:
      return <div className="axm-case-study" data-node-id="441:112516">
        <Copy node="441:112518" box={[64, 64, 1015, 130]}>
          ClickUp 4.0<br /><span className="axm-case-study-secondary">New global nav and updates across +25 squads</span>
        </Copy>
        <Artwork node="441:121211" box={[0, 220, 1555.2, 770.085]} file="441-112516-1.png" alt="ClickUp 4.0 global navigation and task list" />
        <div className="axm-case-study-fade" data-node-id="448:134328" style={position([1254.6, 134.5, 300.6, 892.8])} />
      </div>;
    case 4.521:
    case 4.522:
      return <div className="axm-case-study axm-case-study--gray axm-case-study--compact-artwork" data-node-id="441:123702">
        <Copy node="441:123703" box={[64, 64, 1600, 48]} kind="centered-lead">{title}</Copy>
        <Artwork node="441:125518" box={[132.5, 139, 1463, 914]}
          file={number === 4.521 ? "441-125516-1.png" : "clickup-chat.webp"}
          alt={number === 4.521 ? "ClickUp task list with the previous global navigation" : "ClickUp Chat with the previous global navigation"}
          rounded elevation="elevation-border-3" />
      </div>;
    case 4.53:
      return <div className="axm-case-study axm-case-study--gray axm-case-study--compact-artwork" data-node-id="441:125516">
        <Copy node="441:125519" box={[64, 64, 1600, 48]} kind="centered-lead">{title}</Copy>
        <div className="axm-case-study-comparison">
          <Artwork node="441:125520" box={[64, 139, 788, 873]} file="441-125516-1.png" alt="Previous ClickUp navigation"
            crop={[177.36, 100, -0.01]} rounded elevation="elevation-border-3">
            <div className="axm-case-study-mask" data-node-id="445:130686" style={position([248, 177, 540, 696], 788, 873)} />
          </Artwork>
          <Artwork node="441:125521" box={[876, 139, 788, 873]} file="441-125516-2.jpg" alt="Updated ClickUp navigation"
            crop={[180.46, 100]} rounded elevation="elevation-border-3">
            <div className="axm-case-study-mask" data-node-id="445:130687" style={position([329, 167, 459, 615], 788, 873)} />
          </Artwork>
        </div>
      </div>;
    case 4.62:
      return <div className="axm-case-study" data-node-id="443:128752">
        <Copy node="443:128791" box={[64, 139, 566, 897]}>
          <span>{title}</span>
          <ul className="axm-case-study-feedback-list" role="list">
            <li>1 main user researcher</li>
            <li>1 main GTM researcher</li>
            <li>1 Growth PM NUX experiments</li>
            <li>Each squad was responsible for testing their own surfaces</li>
          </ul>
        </Copy>
        <Artwork node="449:134329" box={[764, 139, 914, 897]} file="449-134329.png"
          alt="Early ClickUp 4.0 navigation with the Getting started checklist" rounded />
      </div>;
    case 4.63:
      return <div className="axm-case-study" data-node-id="443:128766">
        <Copy node="443:128769" box={[64, 64, 1015, 48]}>{title}</Copy>
        <Artwork node="443:128780" box={[64, 139, 512, 763]} file="443-128766-3.gif" alt="Sidebar collapse and expand during a user test" rounded />
        <Artwork node="443:128774" box={[702, 139, 332.36, 763]} file="443-128766-1.png" alt="An unread filter applied to the sidebar"
          crop={[104.97, 105.84, -0.04, -5.44]} />
        <Artwork node="443:128777" box={[1232, 139, 333.18, 763]} file="443-128766-2.png" alt="The former My Tasks navigation" crop={[127.86, 100]} />
        <Copy node="443:128772" box={[64, 920, 490, 126]} kind="caption">
          <p className="axm-case-study-problem"><span aria-hidden="true">🛑</span> Sidebar button was overlooked</p>
          All 5 users in 4/30 testing struggled to expand the sidebar. Users completely missed sidebar collapse button{" "}<TestingClip href="https://app.usertesting.com/c/aad121d2-1f3e-4601-a2bb-e32838c75854" />
        </Copy>
        <Copy node="443:128773" box={[699, 920, 423, 105]} kind="caption">
          <p className="axm-case-study-problem"><span aria-hidden="true">🛑</span> Filters hid items unexpectedly</p>
          Users accidentally applied filters, then couldn't figure out why items were missing. <TestingClip href="https://app.usertesting.com/c/0144633e-21fc-42b2-8194-7922ed3993f0" />
        </Copy>
        <Copy node="443:128779" box={[1232, 920, 442, 133]} kind="caption">
          <p className="axm-case-study-problem"><span aria-hidden="true">🛑</span> Home and My Tasks were confusing</p>
          “My Tasks” and “Home” was a confusing concept. It was a legacy feature and removed from the sidebar
        </Copy>
      </div>;
    case 4.64:
      return <div className="axm-case-study" data-node-id="443:128795">
        <Artwork node="443:128797" box={[42, 190, 1634, 855]} file="443-128795-1.png" alt="Annotated ClickUp experiment screenshot"
          crop={[106.53, 122.33, -3.36, -13.95]} rounded />
        <ExperimentArrows nodes={["443:128802", "443:128803"]} />
        <Copy node="443:128810" box={[52, 49, 1624, 98]}>
          Our first experiment showed <span className="axm-case-study-negative">-3% retention, -29% Space creation, -17% task</span> opens.<br />
          Iterated continuously taking 6 experiments every 2 weeks to get to positive results
        </Copy>
        {badges.map(([node, x, y], index) => (
          <span key={node} className="axm-case-study-badge" data-node-id={node} style={position([x, y, index < 9 ? 28 : 39, 28])}>{index + 1}</span>
        ))}
      </div>;
    case 4.65:
      return <div className="axm-case-study axm-case-study--gray" data-node-id="443:128811">
        <ExperimentArrows nodes={["443:128813", "443:128814"]} />
        <Artwork node="443:128816" box={[79, 108, 1570, 902]} file="clickup-4-0-list-poster.webp" alt="Updated ClickUp global navigation and list view"
          rounded elevation="elevation-border-3"
          video={{ src: "/anthropicxmaggie/video/clickup-4-0-list.mp4", playbackRate: 1 }} />
      </div>;
    case 4.66:
      return <LaunchResults />;
    default:
      return null;
  }
}
