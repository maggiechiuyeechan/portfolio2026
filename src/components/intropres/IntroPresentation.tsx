import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import PresentationGallery, { type PresentationGalleryItem } from "./PresentationGallery";
import experienceGalleries from "./experience-galleries.json";
import NativeSlide from "./NativeSlide";
import PageNavigator from "./PageNavigator";
import CareerSequence from "./CareerSequence";
import usePresentationScale from "../usePresentationScale";

type ExperienceCopy = {
  primary: string;
  secondary: string;
};

const experienceCopy: Record<string, ExperienceCopy> = {
  "Nuffsaid Experience": {
    primary: "2020 Nuffsaid Founding Designer (Acq. ClickUp)",
    secondary: "Design challenge: Seed stage, 0-1, Finding PM fit, Design system",
  },
  "Uber Experience": {
    primary: "2019 - ‘22 Uber Self Driving/Aurora (acq.) Sr. Product Designer",
    secondary: "Design challenge: Technical workflows, e2e research and design, roadmap definition",
  },
  "Headspace Experience": {
    primary: "2019 Headspace Study during MHCI at Carnegie Mellon. Team of 5",
    secondary: "Design challenge: Generative research, prototyping, consumer app",
  },
  "User Research": {
    primary: "2019 Bloomberg Study during MHCI at Carnegie Mellon. Team of 5",
    secondary: "Design challenge: Discovery research, data annotation, technical workflows",
  },
};

type Slide = { number: number; name: string; kind: "about" | "career" | "overview" | "figma-frame" | "project-overview" | "divider" | "appendix" | "responsibilities" | "gallery" | "combined-study" | "use-cases" | "placeholder"; previewNumber?: number; previewSrc?: string; videoSrc?: string; imageSrc?: string };

const slides: Slide[] = [
  { number: 1, name: "About Maggie", kind: "about" },
  { number: 2, name: "Career Experience", kind: "career" },
  { number: 3, name: "ClickUp Overview", kind: "overview" },
  { number: 4, name: "Section Divider", kind: "divider" },
  { number: 27, name: "Project 2 Super agents as teammates Overview", kind: "project-overview", videoSrc: "/intropres/video/super-agents-demo.mp4" },
  { number: 113, name: "Design System", kind: "overview", videoSrc: "/intropres/video/design-system.mp4" },
  { number: 112, name: "PT Gallery", kind: "overview", videoSrc: "/intropres/video/pt-gallery.mp4" },
  { number: 24, name: "Project 1 Marketing Prototyping", kind: "placeholder" },
  { number: 111, name: "Rulesets", kind: "overview", videoSrc: "/intropres/video/rulesets.mp4" },
  { number: 25, name: "Project 1 Coding Contributions", kind: "placeholder" },
  { number: 19, name: "Project 1 Agentic Testing", kind: "placeholder" },
  { number: 20, name: "Project 1 Publishing Test", kind: "placeholder" },
  { number: 5, name: "Leadership Responsibilities", kind: "responsibilities" },
  { number: 6, name: "Nuffsaid Experience", kind: "gallery" },
  { number: 7, name: "Uber Experience", kind: "gallery" },
  { number: 9, name: "Headspace Experience", kind: "gallery" },
  { number: 10, name: "User Research", kind: "gallery" },
  { number: 42.1, name: "Appendix", kind: "appendix" },
  { number: 101, name: "Screenshot 1", kind: "placeholder" },
  { number: 102, name: "Screenshot 2", kind: "placeholder" },
  { number: 103, name: "Screenshot 3", kind: "placeholder" },
  { number: 104, name: "Screenshot 4", kind: "placeholder" },
  { number: 105, name: "Screenshot 5", kind: "placeholder" },
  { number: 11, name: "Design Principles", kind: "placeholder" },
  { number: 12, name: "Project 1: ClickUp Multi-Player Artifacts", kind: "overview", previewNumber: 3, imageSrc: "/intropres/slides/slide-12-project-artifacts.png" },
  ...[
    [13, "Project 1 Artifact Direction"], [14, "Project 1 V1 Scope"],
    [16, "Project 1 Annual Review"],
    [18, "Project 1 EPD Collaboration"],

    [22, "Project 1 Internal Launch"], [22.1, "Project 1 Use Cases"], [23, "Project 1 UX Prototyping"],
    [23.1, "Project 1 UX Prototyping · Video 2"],
    [28, "Project 2 Agent Direction"],
    [30, "Project 2 Agent Vision"], [31, "Project 2 Design Explorations"], [32, "Project 2 Continued Explorations"],
    [33, "Project 2 Avatar Exploration"], [34, "Project 2 Onsite Decisions"], [34.1, "Project 2 SuperAgents Demo"],
    [36, "Project 2 Agent Launch"], [37, "Project 2 Iterations Feedback"], [38, "Project 2 Credit Clarifications"],
    [39, "Project 2 Agent Growth"], [40, "Project 2 Onboarding Experiment"], [41, "Project 2 Sidebar Experiment"],
    [42, "Project 2 SuperAgents Results"],
    [7.1, "Headspace & Bloomberg Experience"],
    [17, "Project 1 Design Workflow"],
    [3.1, "ClickUp Editor Toolbar Exploration"],
    [15, "Project 1 Adapting an Existing UX and Making Improvements Along the Way"],
    [26, "Project 1 AI Design Lessons"],
    [21, "Project 1 Generated Content"], [29, "Project 2 V1 Learnings"], [35, "Project 2 Chat Setup"],
  ].map(([number, name]) => ({
    number: number as number,
    name: name as string,
    kind: number === 27 ? "project-overview" as const : number === 42.1 ? "appendix" as const : number === 7.1 ? "combined-study" as const : number === 22.1 ? "use-cases" as const : number === 3.1 ? "figma-frame" as const : number === 7 || number === 9 || number === 10 ? "gallery" as const : number === 5 ? "responsibilities" as const : "placeholder" as const,
    previewNumber: number === 23.1 ? 23 : number === 34.1 ? 34 : undefined,
    videoSrc: number === 27 ? "/intropres/video/super-agents-demo.mp4" : undefined,
    imageSrc: number === 3.1 ? "/intropres/slides/slide-after-03.png" : undefined,
  })),
];

const slideTransition = { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] as const };

const responsibilityCards = [
  {
    heading: "Workflows & Quality",
    body: "Agentic workflows for design and research: \nPrototype playground, Design System evaluations & rulesets, agents for research protocols, tests, and analysis.",
    icon: "/intropres/icons/workflows.svg",
    tone: "pink",
    iconShape: "wide",
  },
  {
    heading: "People & Performance",
    body: "1:1 cadence, perf management, promotion cases, leveling, calibration, and growth planning, revamped performance rubrics",
    icon: "/intropres/icons/people.svg",
    tone: "orange",
    iconShape: "narrow",
  },
  {
    heading: "Hiring",
    body: "Hiring manager for every Design & UX role. Revamped hiring process to have consistent and high quality bar.",
    icon: "/intropres/icons/hiring.svg",
    tone: "green",
    iconShape: "complete",
  },
  {
    heading: "Cross-Functional Leadership",
    body: "Roadmap goals & reviews. Standards & processes for all product rollouts to include high quality research + design bars. EPD collaboration, squad processes.",
    icon: "/intropres/icons/cross-functional.svg",
    tone: "blue",
    iconShape: "square",
  },
  {
    heading: "Budget & Resources",
    body: "Owns headcount budget. Controlled the tool stack (Figma, UserTesting, Mobbin) and the budget behind it. Designer squad allocations.",
    icon: "/intropres/icons/budget.svg",
    tone: "indigo",
    iconShape: "wide",
  },
  {
    heading: "Culture & Rituals",
    body: "Weekly/Monthly design rituals & meetings: weekly kickoffs, monthly townhalls, design reviews, design system jams. Planned Design Offsites & team bonding activities.",
    icon: "/intropres/icons/culture.svg",
    tone: "brown",
    iconShape: "square",
  },
] as const;

function GallerySlide({ title }: { title: string }) {
  const copy = experienceCopy[title];
  const galleryItems = experienceGalleries[title as keyof typeof experienceGalleries] as PresentationGalleryItem[];

  return (
    <div className="intro-gallery-slide">
      <PresentationGallery items={galleryItems} alignment="center" />
      <div className="intro-gallery-title">
        <p className="intro-gallery-title-primary">{copy.primary}</p>
        <p className="intro-gallery-title-secondary">{copy.secondary}</p>
      </div>
    </div>
  );
}

function CombinedStudySlide() {
  return <div className="intro-combined-study" data-node-id="360:35185">
    <video className="intro-combined-study-media intro-combined-study-media--headspace"
      src="/intropres/video/headspace-study.mp4" aria-label="Headspace mindfulness app prototype"
      autoPlay loop muted playsInline preload="auto" />
    <video className="intro-combined-study-media intro-combined-study-media--bloomberg"
      src="/intropres/video/bloomberg.mp4" aria-label="Bloomberg machine learning platform prototype"
      autoPlay loop muted playsInline preload="auto" />
    <div className="intro-combined-study-caption">
      <p className="intro-combined-study-title">2019 Headspace &amp; Bloomberg during MHCI at Carnegie Mellon. Team of 5</p>
      <p className="intro-combined-study-subtitle">Design challenge: Generative research, prototyping, consumer app</p>
    </div>
  </div>;
}

const useCaseImages = [
  { src: "/intropres/use-cases/cadence-smart-scheduling.png", alt: "Cadence smart scheduling dashboard" },
  { src: "/intropres/use-cases/q3-revenue-pipeline.png", alt: "Q3 revenue pipeline dashboard" },
  { src: "/intropres/use-cases/halyard-executive-overview.png", alt: "Halyard executive overview dashboard" },
  { src: "/intropres/use-cases/the-forge-plot-engine.png", alt: "The Forge plot engine dashboard" },
] as const;

function UseCasesSlide() {
  return (
    <div className="intro-use-cases" data-node-id="370:35455">
      <h1 data-node-id="370:35457">Use cases</h1>
      <div className="intro-use-cases-grid">
        {useCaseImages.map(({ src, alt }, index) => (
          <figure className="intro-use-case-card" key={src} data-card-index={index + 1}>
            <img src={src} alt={alt} />
          </figure>
        ))}
      </div>
    </div>
  );
}

function ClickUpOverviewCaption({ title, projectSubtitle = false }: { title?: string; projectSubtitle?: boolean }) {
  return (
    <>
      <p className="intro-overview-headline">{title ? <span>{title}</span> : <><span>ClickUp is an all-in-one work OS, building all the primitives of work</span><span>(Project management, Chat, Calendar, Docs, Whiteboards, and more)</span></>}</p>
      {projectSubtitle ? (
        <p className="intro-overview-metrics intro-overview-project-subtitle">
          <span>A demonstration of how we use product design agentic workflows to ship 0-1 projects as quickly as possible.</span>
          <span>Timeline for v1: ~1 week<span className="intro-overview-metrics-separator"> | </span>Team: CEO, 1 PM, 2 Eng leads<span className="intro-overview-metrics-separator"> | </span>Responsibility: IC Design, Rapid prototyping</span>
        </p>
      ) : (
        <>
          <p className="intro-overview-role-subtitle">Joined as an IC. At height, led team of 18 designers, 4 researchers. Latest, player coach of 5 designers &amp; 2 researchers after reorg. Directly under the CEO. Style: leading the team and shipping features myself.</p>
        </>
      )}
    </>
  );
}

function ClickUpGrowthCaption() {
  return <p className="intro-overview-growth-copy">Along with Core product features, I also oversaw growth with a lead product designer including: activation, onboarding, retention, monetization, and expansion. Launched over +150 in-app experiments over 3 years.</p>;
}

function ClickUpDesignSystemCaption() {
  return <><p className="intro-overview-growth-copy">Design infrastructure team: rulesets for coding agents. Mining our coding activity to define a baseline set of rules that "self-improves". Code is now our source of truth.</p><p className="intro-overview-role-subtitle">Rulesets are versioned, multiple rulesets eg. marketing vs in app, different product lines. Self improves: suggests violations, suggests improvements based on corrections, human in the loop evaluations.</p></>;
}

function SlideContent({ slide }: { slide: Slide }) {
  if (slide.kind === "about") {
    return <div className="intro-about"><div className="intro-about-photo"><img src="/intropres/maggie.png" alt="Maggie Chan" /></div><h1>Maggie Chan</h1><p>Latest: VP of Design and Research at ClickUp<br />Lives in Bay Area (San Ramon)</p></div>;
  }
  if (slide.kind === "career") return <CareerSequence />;
  if (slide.kind === "appendix") return <div className="intro-appendix"><h1>Appendix</h1></div>;
  if (slide.kind === "figma-frame") {
    return (
      <div className="intro-figma-frame-slide">
        <img className="intro-figma-frame-slide-base" src={slide.imageSrc} alt="ClickUp editor toolbar states and tooltip examples" />
        <video className="intro-figma-frame-slide-video" src="/intropres/video/doc-concept.mp4" aria-label="ClickUp document concept demonstration" autoPlay loop muted playsInline preload="auto" />
        <img className="intro-figma-frame-slide-bottom" src="/intropres/slides/slide-after-03-bottom.png" alt="" aria-hidden="true" />
        <span className="intro-figma-frame-slide-index-mask" aria-hidden="true" />
      </div>
    );
  }
  if (slide.kind === "project-overview") {
    return (
      <div className="intro-overview intro-project-overview">
        <div className="intro-green-panel intro-green-panel--slide-27">
          <video className="intro-overview-video intro-overview-video--slide-27" src={slide.videoSrc} aria-label="SuperAgents as Teammates" autoPlay loop muted playsInline preload="auto" />
        </div>
        <p className="intro-overview-headline"><span>AI transformation: Agents as teammates (launched Dec. 2025)</span></p>
      </div>
    );
  }
  if (slide.kind === "overview") {
    return <div className="intro-overview"><div className={`intro-green-panel${slide.videoSrc ? " intro-green-panel--slide-05" : ""}${slide.number === 12 ? " intro-green-panel--slide-12" : ""}`}>{slide.imageSrc ? <img className="intro-overview-video intro-overview-image" src={slide.imageSrc} alt="ClickUp Multi-Player Artifacts" /> : <video className={`intro-overview-video${slide.videoSrc ? " intro-overview-video--slide-05" : ""}`} src={slide.videoSrc ?? "/intropres/video/clickup-demo.mp4"} aria-label="ClickUp product demo" autoPlay loop muted playsInline preload="auto" onLoadedMetadata={event => { event.currentTarget.playbackRate = 1; }} />}</div>{slide.videoSrc ? (slide.number === 113 ? <p className="intro-overview-growth-copy">Design infrastructure team: stood it up 0-1. Staffing it with 1 lead designer &amp; 2 design engineers. Kora design system and its UI.</p> : slide.number === 112 ? <p className="intro-overview-growth-copy">Design infrastructure team: prototyping playground enabled org (leaders, PMs, marketing team, CFO, etc.) to vibecode share, remix, branch high fidelity prototypes.</p> : <ClickUpDesignSystemCaption />) : <ClickUpOverviewCaption title={slide.number === 12 ? "Project 1: ClickUp Multi-Player Artifacts" : undefined} projectSubtitle={slide.number === 12} />}</div>;
  }
  if (slide.kind === "divider") {
    return (
      <div className="intro-overview intro-overview--divider">
        <div className="intro-green-panel">
          <video
            className="intro-divider-video"
            src="/intropres/video/clickup-growth.mp4"
            aria-label="ClickUp growth"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        </div>
        <ClickUpGrowthCaption />
      </div>
    );
  }
  if (slide.kind === "responsibilities") {
    return (
      <div className="intro-responsibilities">
        <p className="intro-responsibilities-intro">
          Leadership &amp; management responsibilties
          <br />
          <span>In true startup fashion, I led the org&nbsp; and stayed close to the craft, often shipping features myself. Now: Player coach to a team of 5 designers, 2 researchers.</span>
        </p>
        <div className="intro-card-grid">
          {responsibilityCards.map(({ heading, body, icon, tone, iconShape }) => (
            <article className={`intro-card intro-card--${tone}`} key={heading}>
              <div className={`intro-card-icon intro-card-icon--${iconShape}`}>
                <img src={icon} alt="" aria-hidden="true" />
              </div>
              <div className="intro-card-content">
                <h2>{heading}</h2>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }
  if (slide.kind === "gallery") return <GallerySlide title={slide.name} />;
  if (slide.kind === "combined-study") return <CombinedStudySlide />;
  if (slide.kind === "use-cases") return <UseCasesSlide />;
  return <NativeSlide number={slide.number} />;
}

export default function IntroPresentation() {
  const presentationRef = usePresentationScale();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const go = useCallback((direction: number) => setIndex((value) => (value + direction + slides.length) % slides.length), []);

  useEffect(() => {
    const prototypeBase = "/intropres/prototypes/sharing-artifacts-user-testing/";
    const resources = [
      { href: `${prototypeBase}poster.png`, rel: "preload", as: "image" },
      { href: `${prototypeBase}index.html`, rel: "prefetch", as: "document" },
      { href: `${prototypeBase}styles-LFJD6OZF.css`, rel: "prefetch", as: "style" },
      { href: `${prototypeBase}chunk-SVJC2ZTZ.js`, rel: "modulepreload", as: "script" },
      { href: `${prototypeBase}chunk-D5ZYZPND.js`, rel: "modulepreload", as: "script" },
      { href: `${prototypeBase}polyfills-PZSJNBYU.js`, rel: "modulepreload", as: "script" },
      { href: `${prototypeBase}main-SCJCN423.js`, rel: "modulepreload", as: "script" },
    ];
    const links: HTMLLinkElement[] = [];
    const preload = () => resources.forEach((resource) => {
        const link = document.createElement("link");
        link.href = resource.href;
        link.rel = resource.rel;
        link.as = resource.as;
        document.head.appendChild(link);
        links.push(link);
      });
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(preload, { timeout: 1500 });
    else timeoutId = globalThis.setTimeout(preload, 500);
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
      links.forEach((link) => link.remove());
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  return <main ref={presentationRef} className="intro-presentation"><div className="intro-stage-viewport"><div className="intro-stage"><AnimatePresence mode="wait"><motion.section key={slide.number} className="intro-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={slideTransition} aria-label={`Slide ${index + 1}: ${slide.name}`}><SlideContent slide={slide} /></motion.section></AnimatePresence></div><PageNavigator pages={slides} index={index} onSelect={setIndex} /></div></main>;
}
