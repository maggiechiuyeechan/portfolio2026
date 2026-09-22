import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import PresentationGallery from "./PresentationGallery";
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
    primary: "2019 - ‘22 Uber Self Driving Cars Sr. Product Designer",
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

type Slide = { number: number; name: string; kind: "about" | "career" | "why-anthropic" | "overview" | "figma-frame" | "project-overview" | "divider" | "appendix" | "responsibilities" | "gallery" | "combined-study" | "placeholder"; previewNumber?: number; previewSrc?: string; videoSrc?: string; imageSrc?: string };

const slides: Slide[] = [
  { number: 1, name: "About Maggie", kind: "about" },
  { number: 2, name: "Career Experience", kind: "career" },
  { number: 3, name: "ClickUp Overview", kind: "overview" },
  { number: 3.1, name: "ClickUp Editor Toolbar Exploration", kind: "figma-frame", imageSrc: "/anthropicxmaggie/slides/slide-after-03.png", previewSrc: "/anthropicxmaggie/slides/slide-after-03-preview.png" },
  { number: 4, name: "Section Divider", kind: "divider" },
  { number: 4.1, name: "ClickUp Overview", kind: "overview", previewNumber: 3, videoSrc: "/anthropicxmaggie/video/slide-05-clickup.mp4" },
  { number: 5.1, name: "Why Anthropic?", kind: "why-anthropic" },
  { number: 6, name: "Nuffsaid Experience", kind: "gallery" },
  { number: 7, name: "Uber Experience", kind: "gallery" },
  { number: 7.1, name: "Headspace & Bloomberg Experience", kind: "combined-study" },
  { number: 11, name: "Design Principles", kind: "placeholder" },
  { number: 12, name: "Project 1: ClickUp Multi-Player Artifacts", kind: "overview", previewNumber: 3, imageSrc: "/anthropicxmaggie/slides/slide-12-project-artifacts.png" },
  ...[
    [13, "Project 1 Artifact Direction"], [14, "Project 1 V1 Scope"],
    [16, "Project 1 Annual Review"], [17, "Project 1 Design Workflow"],
    [18, "Project 1 EPD Collaboration"], [19, "Project 1 Agentic Testing"], [20, "Project 1 Publishing Test"],
    [22, "Project 1 Internal Launch"], [23, "Project 1 UX Prototyping"],
    [23.1, "Project 1 UX Prototyping · Video 2"],
    [24, "Project 1 Marketing Prototyping"], [25, "Project 1 Coding Contributions"],
    [27, "Project 2 Super agents as teammates Overview"], [28, "Project 2 Agent Direction"],
    [30, "Project 2 Agent Vision"], [31, "Project 2 Design Explorations"], [32, "Project 2 Continued Explorations"],
    [33, "Project 2 Avatar Exploration"], [34, "Project 2 Onsite Decisions"], [34.1, "Project 2 SuperAgents Demo"],
    [36, "Project 2 Agent Launch"], [37, "Project 2 Iterations Feedback"], [38, "Project 2 Credit Clarifications"],
    [39, "Project 2 Agent Growth"], [40, "Project 2 Onboarding Experiment"], [41, "Project 2 Sidebar Experiment"],
    [42, "Project 2 SuperAgents Results"],
    [42.1, "Appendix"],
    [9, "Headspace Experience"], [10, "User Research"],
    [15, "Project 1 Adapting an Existing UX and Making Improvements Along the Way"],
    [26, "Project 1 AI Design Lessons"],
    [5, "Leadership Responsibilities"],
    [21, "Project 1 Generated Content"], [29, "Project 2 V1 Learnings"], [35, "Project 2 Chat Setup"],
  ].map(([number, name]) => ({
    number: number as number,
    name: name as string,
    kind: number === 27 ? "project-overview" as const : number === 42.1 ? "appendix" as const : number === 9 || number === 10 ? "gallery" as const : number === 5 ? "responsibilities" as const : "placeholder" as const,
    previewNumber: number === 23.1 ? 23 : number === 34.1 ? 34 : undefined,
    videoSrc: number === 27 ? "/anthropicxmaggie/video/super-agents-demo.mp4" : undefined,
  })),
];

const slideTransition = { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] as const };

const responsibilityCards = [
  {
    heading: "Workflows & Quality",
    body: "Agentic workflows for design and research: \nPrototype playground, Design System evaluations & rulesets, agents for research protocols, tests, and analysis.",
    icon: "/anthropicxmaggie/icons/workflows.svg",
    tone: "pink",
    iconShape: "wide",
  },
  {
    heading: "People & Performance",
    body: "1:1 cadence, perf management, promotion cases, leveling, calibration, and growth planning, revamped performance rubrics",
    icon: "/anthropicxmaggie/icons/people.svg",
    tone: "orange",
    iconShape: "narrow",
  },
  {
    heading: "Hiring",
    body: "Hiring manager for every Design & UX role. Revamped hiring process to have consistent and high quality bar.",
    icon: "/anthropicxmaggie/icons/hiring.svg",
    tone: "green",
    iconShape: "complete",
  },
  {
    heading: "Cross-Functional Leadership",
    body: "Roadmap goals & reviews. Standards & processes for all product rollouts to include high quality research + design bars. EPD collaboration, squad processes.",
    icon: "/anthropicxmaggie/icons/cross-functional.svg",
    tone: "blue",
    iconShape: "square",
  },
  {
    heading: "Budget & Resources",
    body: "Owns headcount budget. Controlled the tool stack (Figma, UserTesting, Mobbin) and the budget behind it. Designer squad allocations.",
    icon: "/anthropicxmaggie/icons/budget.svg",
    tone: "indigo",
    iconShape: "wide",
  },
  {
    heading: "Culture & Rituals",
    body: "Weekly/Monthly design rituals & meetings: weekly kickoffs, monthly townhalls, design reviews, design system jams. Planned Design Offsites & team bonding activities.",
    icon: "/anthropicxmaggie/icons/culture.svg",
    tone: "brown",
    iconShape: "square",
  },
] as const;

function GallerySlide({ title }: { title: string }) {
  const copy = experienceCopy[title];
  const galleryItems = experienceGalleries[title as keyof typeof experienceGalleries];

  return (
    <div className="axm-gallery-slide">
      <PresentationGallery items={galleryItems} alignment="center" />
      <div className="axm-gallery-title">
        <p className="axm-gallery-title-primary">{copy.primary}</p>
        <p className="axm-gallery-title-secondary">{copy.secondary}</p>
      </div>
    </div>
  );
}

function CombinedStudySlide() {
  return <div className="axm-combined-study" data-node-id="360:35185">
    <video className="axm-combined-study-media axm-combined-study-media--headspace"
      src="/anthropicxmaggie/video/headspace-study.mp4" aria-label="Headspace mindfulness app prototype"
      autoPlay loop muted playsInline preload="auto" />
    <video className="axm-combined-study-media axm-combined-study-media--bloomberg"
      src="/anthropicxmaggie/video/bloomberg.mp4" aria-label="Bloomberg machine learning platform prototype"
      autoPlay loop muted playsInline preload="auto" />
    <div className="axm-combined-study-caption">
      <p className="axm-combined-study-title">2019 Headspace &amp; Bloomberg during MHCI at Carnegie Mellon. Team of 5</p>
      <p className="axm-combined-study-subtitle">Design challenge: Generative research, prototyping, consumer app</p>
    </div>
  </div>;
}

function ClickUpOverviewCaption({ title, projectSubtitle = false }: { title?: string; projectSubtitle?: boolean }) {
  return (
    <>
      <p className="axm-overview-headline">{title ? <span>{title}</span> : <><span>ClickUp is an all-in-one work OS, building all the primitives of work</span><span>(Project management, Chat, Calendar, Docs, Whiteboards, and more)</span></>}</p>
      {projectSubtitle ? (
        <p className="axm-overview-metrics axm-overview-project-subtitle">
          <span>A demonstration of how we use product design agentic workflows to ship 0-1 projects as quickly as possible.</span>
          <span>Timeline for v1: ~1 week<span className="axm-overview-metrics-separator"> | </span>Team: CEO, 1 PM, 2 Eng leads<span className="axm-overview-metrics-separator"> | </span>Responsibility: IC Design, Rapid prototyping</span>
        </p>
      ) : (
        <>
          <p className="axm-overview-role-subtitle">Joined as an IC - now player coach to 5 designers &amp; 2 researchers. Leading the team and shipping features myself.</p>
        </>
      )}
    </>
  );
}

function ClickUpGrowthCaption() {
  return <p className="axm-overview-growth-copy">Along with Core product features, I also oversaw growth with a lead product designer including: activation, onboarding, retention, monetization, and expansion. Launched over +150 in-app experiments over 3 years.</p>;
}

function ClickUpDesignSystemCaption() {
  return <p className="axm-overview-growth-copy">Led 1 designer, 1 design engineer to create our first ever design system Kora. With this team we created vibe coding prototype library for the whole org to prototype with, and rulesets to evaluate vibecoded PRs.</p>;
}

function SlideContent({ slide }: { slide: Slide }) {
  if (slide.kind === "about") {
    return <div className="axm-about"><div className="axm-about-photo"><img src="/anthropicxmaggie/maggie.png" alt="Maggie Chan" /></div><h1>Maggie Chan</h1><p>Currently: VP of Design and Research at ClickUp<br />Lives in Bay Area (San Ramon)<br />From Toronto, ON<br /><br /><span>Work Experience · 10 minutes<br />Project 1 · 10 minutes<br />Project 2 · 10 minutes</span></p></div>;
  }
  if (slide.kind === "career") return <CareerSequence />;
  if (slide.kind === "why-anthropic") {
    return <div className="axm-why-anthropic" data-node-id="357:143638">
      <div className="axm-why-anthropic-logo" data-node-id="357:143660"><img src="/anthropicxmaggie/slides/why-anthropic-logo.png" alt="Anthropic" /></div>
      <div className="axm-why-anthropic-copy" data-node-id="357:143656">
        <p><strong>Why Anthropic?</strong><br /><span>Designing for good, a mission I can get behind<br />Massive change<br />Closer to model development, not just a layer on top<br />Builder first role<br />Claude is something I use</span></p>
      </div>
    </div>;
  }
  if (slide.kind === "appendix") return <div className="axm-appendix"><h1>Appendix</h1></div>;
  if (slide.kind === "figma-frame") {
    return (
      <div className="axm-figma-frame-slide">
        <img className="axm-figma-frame-slide-base" src={slide.imageSrc} alt="ClickUp editor toolbar states and tooltip examples" />
        <video className="axm-figma-frame-slide-video" src="/anthropicxmaggie/video/doc-concept.mp4" aria-label="ClickUp document concept demonstration" autoPlay loop muted playsInline preload="auto" />
        <img className="axm-figma-frame-slide-bottom" src="/anthropicxmaggie/slides/slide-after-03-bottom.png" alt="" aria-hidden="true" />
        <span className="axm-figma-frame-slide-index-mask" aria-hidden="true" />
      </div>
    );
  }
  if (slide.kind === "project-overview") {
    return (
      <div className="axm-overview axm-project-overview">
        <div className="axm-green-panel axm-green-panel--slide-27">
          <video className="axm-overview-video axm-overview-video--slide-27" src={slide.videoSrc} aria-label="Super agents as teammates" autoPlay loop muted playsInline preload="auto" />
        </div>
        <p className="axm-overview-headline"><span>Project 2: Super agents as teammates</span></p>
        <p className="axm-overview-metrics axm-overview-tagline">Reconceptualizing Agents 0 to 1. Iterating via feedback and experiments.</p>
        <p className="axm-overview-metrics axm-overview-project-subtitle axm-overview-super-agents-subtitle">
          <span>Timeline: Multiple projects over 8 months<span className="axm-overview-metrics-separator"> | </span>Team: CEO, Head of product strategy, 4 designers<span className="axm-overview-metrics-separator"> | </span>Role: Team Lead</span>
        </p>
      </div>
    );
  }
  if (slide.kind === "overview") {
    return <div className="axm-overview"><div className={`axm-green-panel${slide.videoSrc ? " axm-green-panel--slide-05" : ""}${slide.number === 12 ? " axm-green-panel--slide-12" : ""}`}>{slide.imageSrc ? <img className="axm-overview-video axm-overview-image" src={slide.imageSrc} alt="ClickUp Multi-Player Artifacts" /> : <video className={`axm-overview-video${slide.videoSrc ? " axm-overview-video--slide-05" : ""}`} src={slide.videoSrc ?? "/anthropicxmaggie/video/clickup-demo.mp4"} aria-label="ClickUp product demo" autoPlay loop muted playsInline preload="auto" onLoadedMetadata={event => { event.currentTarget.playbackRate = slide.videoSrc ? 3 : 1; }} />}</div>{slide.videoSrc ? <ClickUpDesignSystemCaption /> : <ClickUpOverviewCaption title={slide.number === 12 ? "Project 1: ClickUp Multi-Player Artifacts" : undefined} projectSubtitle={slide.number === 12} />}</div>;
  }
  if (slide.kind === "divider") {
    return (
      <div className="axm-overview axm-overview--divider">
        <div className="axm-green-panel">
          <video
            className="axm-divider-video"
            src="/anthropicxmaggie/video/clickup-growth.mp4"
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
      <div className="axm-responsibilities">
        <p className="axm-responsibilities-intro">
          Leadership &amp; management responsibilties
          <br />
          <span>In true startup fashion, I led the org&nbsp; and stayed close to the craft, often shipping features myself. Now: Player coach to a team of 5 designers, 2 researchers.</span>
        </p>
        <div className="axm-card-grid">
          {responsibilityCards.map(({ heading, body, icon, tone, iconShape }) => (
            <article className={`axm-card axm-card--${tone}`} key={heading}>
              <div className={`axm-card-icon axm-card-icon--${iconShape}`}>
                <img src={icon} alt="" aria-hidden="true" />
              </div>
              <div className="axm-card-content">
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
  return <NativeSlide number={slide.number} />;
}

export default function AnthropicXMaggiePresentation() {
  const presentationRef = usePresentationScale();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const go = useCallback((direction: number) => setIndex((value) => (value + direction + slides.length) % slides.length), []);

  useEffect(() => {
    const prototypeBase = "/anthropicxmaggie/prototypes/sharing-artifacts-user-testing/";
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
    let timeoutId: number | undefined;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(preload, { timeout: 1500 });
    else timeoutId = window.setTimeout(preload, 500);
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
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

  return <main ref={presentationRef} className="axm-presentation"><div className="axm-stage-viewport"><div className="axm-stage"><AnimatePresence mode="wait"><motion.section key={slide.number} className="axm-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={slideTransition} aria-label={`Slide ${slide.number}: ${slide.name}`}><SlideContent slide={slide} /></motion.section></AnimatePresence></div><PageNavigator pages={slides} index={index} onSelect={setIndex} /></div></main>;
}
