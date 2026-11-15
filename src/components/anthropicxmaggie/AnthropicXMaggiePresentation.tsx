import { useCallback, useEffect, useState, type ReactNode } from "react";
import PresentationGallery, { type PresentationGalleryItem } from "./PresentationGallery";
import experienceGalleries from "./experience-galleries.json";
import NativeSlide from "./NativeSlide";
import PageNavigator from "./PageNavigator";
import CareerSequence from "./CareerSequence";
import LeadershipSlide from "./LeadershipSlide";
import ProductScopeSlide from "./ProductScopeSlide";
import ClickUpCaseStudySlide from "./ClickUpCaseStudySlide";
import TaskTypeFieldsSlide from "./task-type-fields/TaskTypeFieldsSlide";
import AgentSuggestionsSlide from "./AgentSuggestionsSlide";
import SlideCredits from "./SlideCredits";
import AgentExplorationCanvas from "./AgentExplorationCanvas";
import HeadspaceHeroDemo from "../work/HeadspaceHeroDemo";
import BlueDotHeroDemo from "../work/BlueDotHeroDemo";
import usePresentationScale from "../usePresentationScale";

type ExperienceCopy = {
  primary: ReactNode;
};

const yearDot = <span className="axm-year-dot">·</span>;

const experienceCopy: Record<string, ExperienceCopy> = {
  "Nuffsaid Experience": {
    primary: <>2020 {yearDot} Nuffsaid (Acq. ClickUp) {yearDot} Founding Designer</>,
  },
  "Uber Experience": {
    primary: <>2019 {yearDot} Uber Self Driving Cars {yearDot} Sr. Product Designer</>,
  },
  "Headspace Experience": {
    primary: <>2018 {yearDot} Headspace Study during MHCI at Carnegie Mellon</>,
  },
  "User Research": {
    primary: "2019 Bloomberg Study during MHCI at Carnegie Mellon. Team of 5",
  },
};

import { slides, type Slide } from "./slides";


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
  const galleryItems = experienceGalleries[title as keyof typeof experienceGalleries] as PresentationGalleryItem[];

  return (
    <div className="axm-gallery-slide">
      <PresentationGallery items={galleryItems} alignment="center" />
      <div className="axm-gallery-title">
        <p className="axm-gallery-title-primary">{copy.primary}</p>
      </div>
    </div>
  );
}

function CombinedStudySlide() {
  return <div className="axm-combined-study" data-node-id="360:35185">
    <div className="axm-combined-study-media axm-combined-study-media--headspace">
      <HeadspaceHeroDemo compactOnMobile={false} />
    </div>
    <video className="axm-combined-study-media axm-combined-study-media--bloomberg"
      src="/anthropicxmaggie/video/bloomberg.mp4" aria-label="Bloomberg machine learning platform prototype"
      autoPlay loop muted playsInline preload="auto" />
    <div className="axm-combined-study-caption">
      <p className="axm-combined-study-title">2019 Headspace &amp; Bloomberg during MHCI at Carnegie Mellon. Team of 5</p>
    </div>
  </div>;
}

const useCaseImages = [
  { src: "/anthropicxmaggie/use-cases/cadence-smart-scheduling.png", alt: "Cadence smart scheduling dashboard" },
  { src: "/anthropicxmaggie/use-cases/q3-revenue-pipeline.png", alt: "Q3 revenue pipeline dashboard" },
  { src: "/anthropicxmaggie/use-cases/halyard-executive-overview.png", alt: "Halyard executive overview dashboard" },
  { src: "/anthropicxmaggie/use-cases/the-forge-plot-engine.png", alt: "The Forge plot engine dashboard" },
] as const;

function UseCasesSlide() {
  return (
    <div className="axm-use-cases" data-node-id="370:35455">
      <h1 data-node-id="370:35457">Use cases</h1>
      <div className="axm-use-cases-grid">
        {useCaseImages.map(({ src, alt }, index) => (
          <figure className="axm-use-case-card" key={src} data-card-index={index + 1}>
            <img src={src} alt={alt} />
          </figure>
        ))}
      </div>
    </div>
  );
}

function AgentRoiSlide() {
  return (
    <div className="axm-agent-roi" data-node-id="380:35455">
      <h1 data-node-id="380:35828">Agent ROI calculator</h1>
      <div className="axm-agent-roi-panel" data-node-id="380:35456">
        <img src="/presentation-shared/agent-roi/time-benchmark.png" alt="Agent time benchmark calculator" data-node-id="380:36281" />
      </div>
    </div>
  );
}

function ClickUpOverviewCaption({ title, projectSubtitle = false }: { title?: string; projectSubtitle?: boolean }) {
  return (
    <>
      <p className="axm-overview-headline">{title ? <span>{title}</span> : <><span>2023 {yearDot} ClickUp is a multiplayer all-in-one work OS, building all the primitives of work.</span><span>(Project management, Chat, Calendar, Docs, Whiteboards, and more)</span></>}</p>
      {projectSubtitle && (
        <p className="axm-overview-metrics axm-overview-project-subtitle">
          <span>A demonstration of how we use product design agentic workflows to ship 0-1 projects as quickly as possible.</span>
          <span>Prototyped in June<span className="axm-overview-metrics-separator"> | </span>Team: CEO, 1 PM, 2 Eng leads<span className="axm-overview-metrics-separator"> | </span>Responsibility: IC Design, Rapid prototyping</span>
        </p>
      )}
    </>
  );
}

function ClickUpGrowthCaption() {
  return <p className="axm-overview-growth-copy">Along with Core product features, I also oversaw growth including: activation, onboarding, retention, monetization, and expansion. Launched over +150 in-app experiments over 3 years.</p>;
}

function ClickUpDesignSystemCaption() {
  return <p className="axm-overview-growth-copy">Led team to create our first ever design system Kora. Invested in internal tool: vibe coding prototype library for the whole org</p>;
}

function SlideContent({ slide, onSlideKey }: { slide: Slide; onSlideKey: (event: KeyboardEvent) => void }) {
  if (slide.number === 31) return <AgentExplorationCanvas />;
  if (slide.kind === "about") {
    return (
      <div className="axm-about" data-node-id="438:35459">
        <h1 data-node-id="438:35461">Maggie Chan</h1>
        <div className="axm-about-details" data-node-id="438:35462">
          <p>Recently: VP of Design and Research at ClickUp<br />Lives in Bay Area (San Ramon)</p>
          <p>Visual resume<br />Leadership Scope</p>
          <p>Case Study 1: 4.0<br />Case Study 2: Custom Fields<br />Case Study 3: IC prototypes</p>
        </div>
      </div>
    );
  }
  if (slide.kind === "career") return <CareerSequence />;
  if (slide.kind === "leadership-heading") {
    return (
      <div className="axm-leadership-heading" data-node-id="448:134320">
        <header data-node-id="448:134322">
          <p>Section 2</p>
          <h1>{slide.name}</h1>
        </header>
      </div>
    );
  }
  if (slide.kind === "leadership") return <LeadershipSlide number={slide.number} />;
  if (slide.kind === "product-scope") return <ProductScopeSlide number={slide.number} title={slide.name} />;
  if (slide.kind === "clickup-case-study") return <ClickUpCaseStudySlide number={slide.number} title={slide.name} />;
  if (slide.kind === "task-type-fields") return <TaskTypeFieldsSlide number={slide.number} />;
  if (slide.kind === "agent-suggestions") return <AgentSuggestionsSlide number={slide.number} title={slide.name} />;
  if (slide.kind === "agent-suggestions-demo") {
    return (
      <iframe
        className="axm-agent-suggestions-demo"
        src="/anthropicxmaggie/prototypes/agent-suggestions/demo.html"
        title={slide.name}
        onLoad={event => event.currentTarget.contentWindow?.addEventListener("keydown", onSlideKey)}
      />
    );
  }
  if (slide.kind === "typography-study") {
    return (
      <figure className="axm-typography-study" data-node-id="438:35464">
        <img src={slide.imageSrc} alt="Annotated diagram of letterforms" data-node-id="438:35467" />
        <figcaption>2013 {yearDot} Studied Graphic Design</figcaption>
      </figure>
    );
  }
  if (slide.kind === "bluedot") {
    const [year, company, ...role] = slide.name.split(" ");
    return (
      <figure className="axm-bluedot-demo">
        <BlueDotHeroDemo stackOnMobile={false} sparseChart />
        <figcaption>{year} {yearDot} {company} {yearDot} {role.join(" ")}</figcaption>
      </figure>
    );
  }
  if (slide.kind === "why-anthropic") {
    return <div className="axm-why-anthropic" data-node-id="357:143638">
      <div className="axm-why-anthropic-logo" data-node-id="357:143660"><img src="/anthropicxmaggie/slides/why-anthropic-logo.png" alt="Anthropic" /></div>
      <div className="axm-why-anthropic-copy" data-node-id="357:143656">
        <p><strong>Why Anthropic?</strong><br /><span>Designing for beneficial AI<br />Closer to model development, not just a layer on top<br />Builder first role<br />Talent dense environment<br />Claude is something I use<br />This area that really interests me<br />Going back to a hybrid work situation would be exciting</span></p>
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
        <p className="axm-overview-headline"><span>Project 2: Super agents as "specialist" teammates</span></p>
        <p className="axm-overview-metrics axm-overview-tagline">Reconceptualizing Agents 0 to 1. Iterating via feedback and experiments.</p>
        <p className="axm-overview-metrics axm-overview-project-subtitle axm-overview-super-agents-subtitle">
          <span>Timeline: Multiple projects over 8 months, First launched Dec 2025<span className="axm-overview-metrics-separator"> | </span>Team: CEO, 4 designers<span className="axm-overview-metrics-separator"> | </span>Role: Team Lead</span>
        </p>
      </div>
    );
  }
  if (slide.kind === "overview") {
    return <div className="axm-overview"><div className={`axm-green-panel${slide.videoSrc ? " axm-green-panel--slide-05" : ""}${slide.number === 12 ? " axm-green-panel--slide-12" : ""}${slide.number === 3 ? " axm-green-panel--clickup-overview" : ""}`}>{slide.imageSrc ? <img className="axm-overview-video axm-overview-image" src={slide.imageSrc} alt="ClickUp Multi-Player Artifacts" /> : <video className={`axm-overview-video${slide.videoSrc ? " axm-overview-video--slide-05" : ""}`} src={slide.videoSrc ?? "/anthropicxmaggie/video/clickup-demo.mp4"} aria-label="ClickUp product demo" autoPlay loop muted playsInline preload="auto" onLoadedMetadata={event => { event.currentTarget.playbackRate = slide.videoSrc ? 1.25 : 1; }} />}</div>{slide.videoSrc ? <ClickUpDesignSystemCaption /> : <ClickUpOverviewCaption title={slide.number === 12 ? "Project 1: ClickUp Multi-Player Artifacts" : undefined} projectSubtitle={slide.number === 12} />}</div>;
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
  if (slide.kind === "use-cases") return <UseCasesSlide />;
  if (slide.kind === "agent-roi") return <AgentRoiSlide />;
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
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(preload, { timeout: 1500 });
    else timeoutId = globalThis.setTimeout(preload, 500);
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
      links.forEach((link) => link.remove());
    };
  }, []);

  const onSlideKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const target = event.target as Element | null;
    if (event.defaultPrevented || target?.closest?.("input, textarea, select, [contenteditable], dialog, [role='menu']")) return;
    event.preventDefault();
    go(event.key === "ArrowLeft" ? -1 : 1);
  }, [go]);

  useEffect(() => {
    window.addEventListener("keydown", onSlideKey);
    return () => window.removeEventListener("keydown", onSlideKey);
  }, [onSlideKey]);

  return <main ref={presentationRef} className="axm-presentation"><div className="axm-stage-viewport"><div className="axm-stage"><section key={slide.number} className="axm-slide" aria-label={`Slide ${slide.number}: ${slide.name}`}><SlideContent slide={slide} onSlideKey={onSlideKey} />{slide.credits?.length ? <SlideCredits credits={slide.credits} /> : null}</section></div><PageNavigator pages={slides} index={index} onSelect={setIndex} /></div></main>;
}
