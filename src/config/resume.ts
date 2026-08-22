/**
 * Resume content — single edit point for /resume copy.
 * Mirrors the Figma "resume" file (tVMS249ETBK3cSjxrHQvGB, node 1:2).
 * Layout/markup: src/components/resume/; styles: src/styles/resume.css.
 */

export interface ResumeContact {
  label: string;
  /** Optional link target; plain text when omitted (e.g. phone, password). */
  href?: string;
}

export interface ResumeEducation {
  degree: string;
  school: string;
  /** Graduation year, kept separate from the school so parsers can read both. */
  year: string;
  location?: string;
}

/** Keyword group for the skills section (label + comma-joined items). */
export interface ResumeSkillGroup {
  label: string;
  items: readonly string[];
}

/** Sub-heading followed by its lines within one role (rendered flat, per Figma). */
export interface ResumeHighlightGroup {
  heading: string;
  bullets: readonly string[];
}

export interface ResumeRole {
  company: string;
  title: string;
  dates: string;
  /** Tertiary note after the title, e.g. promotion date. */
  promotion?: string;
  /** Secondary lines under company · title (prior roles, acquisition notes). */
  meta?: readonly string[];
  /** Intro paragraph before bullets or groups. */
  summary?: string;
  /** Ungrouped bullets (no sub-headings). */
  bullets?: readonly string[];
  /** Sub-headed bullet sections (ClickUp-style). */
  groups?: readonly ResumeHighlightGroup[];
}

export const resume = {
  name: "Maggie CY Chan",

  /** Header contact columns: [0] label rail column, [1] body column. */
  contactColumns: [
    [
      { label: "www.maggiechan.io", href: "https://www.maggiechan.io" },
      { label: "psw: build" },
    ],
    [
      { label: "Based in San Francisco" },
      { label: "mach.sq@gmail.com", href: "mailto:mach.sq@gmail.com" },
      { label: "412.298.2988" },
      {
        label: "linkedin.com/in/mcychan",
        href: "https://www.linkedin.com/in/mcychan",
      },
    ],
  ] satisfies ResumeContact[][],

  education: [
    {
      degree: "Master of Human-Computer Interaction",
      school: "Carnegie Mellon University",
      year: "2019",
      location: "Pittsburgh, PA",
    },
    {
      degree: "Bachelor of Graphic Design",
      school: "OCAD University",
      year: "2013",
      location: "Toronto, Canada",
    },
  ] satisfies ResumeEducation[],

  /* Sized to the slack left on print page 2 — roughly six wrapped lines. */
  skills: [
    {
      label: "Design & research",
      items: [
        "Product design",
        "Design systems",
        "Interaction design",
        "Prototyping",
        "Usability testing",
        "Mixed-methods research",
        "Continuous discovery",
        "Data visualization",
      ],
    },
    {
      label: "AI product",
      items: [
        "AI product design",
        "Agentic workflows",
        "LLM-powered features",
        "AI-assisted prototyping",
      ],
    },
    {
      label: "Leadership",
      items: [
        "Org leadership",
        "Hiring",
        "Career frameworks",
        "Performance management",
      ],
    },
    {
      label: "Tools",
      items: ["Cursor", "Figma", "ClickUp", "React", "TypeScript"],
    },
  ] satisfies ResumeSkillGroup[],

  work: [
    {
      company: "ClickUp",
      title: "VP of Design & Research",
      dates: "2023 – Present",
      meta: [
        "Promoted Jan 2026 · Sr. Director 2024–2025",
        "Product Design Manager 2023–2024 · Sr. Product Designer 2023",
      ],
      summary:
        "I lead product design and research in close partnership with the CEO, currently as a player-coach for 6 designers and 2 researchers. I stay close to the details, often shipping features myself. Since 2023, I've shaped every major feature as the company grew from $150M to $360M+ ARR.",
      groups: [
        {
          heading: "Turning ClickUp into an AI-native work platform",
          bullets: [
            "Led design across ClickUp's AI suite (Brain, Super Agents, AI Fields, AI Summaries, Artifacts, Skills) with three designers. Pushed pace & quality, aligned parallel teams by rapid prototyping, customer testing, and daily dogfooding",
            "As a result, Brain adoption grew from 9.6% to 19.6% while improving M1 retention by 35%. AI subscription ARR grew from $6.89M to $40.73M (5.9x) from Jan 2025 to Jun 2026, with NDR crossing 100% (98.2% to 102.1%)",
          ],
        },
        {
          heading: "Driving growth across the full funnel",
          bullets: [
            "Led design for ClickUp's in-app growth surfaces across the funnel: activation, onboarding, retention, monetization, and expansion. Mixed quantitative experiments with customer interviews, think-alouds, daily dogfooding, and a bit of intuition across 171 in-app experiments",
            "Two example winning experiments: an onboarding agent lifted W0 retention 3.3%, and a credit-card free trial raised net paid upgrade rate 13%",
          ],
        },
        {
          heading: "Leading initiatives, owning the details",
          bullets: [
            "Led ClickUp 4.0, the largest redesign in company history: a new visual language and navigation IA across Lists, Chat, Docs, and core surfaces. Product NPS rose 15 points to an all-time high; Task View shipped to 456K users at a 0.09% revert rate",
          ],
        },
        {
          heading: "Building the design practice, then remaking it for agents",
          bullets: [
            "Stood up the research and design practice and reinvented it for agents. Now agents launch studies, and live prototypes are coded and testable in minutes in the Prototype Playground; designers ship simple fixes straight to the frontend repo",
            "Built the design system myself, then won resourcing to take it 0 to 1, replacing thousands of hardcoded components and tokens. It's now the self-healing source of truth agents build from, correcting itself with human feedback",
            "Grew design 12 to 18 and research 1 to 4, with 6 promoted across both teams. Sharpened the hiring bar, built career ladders, personalized paths, and created a performance rubric on Craft, Collaboration, and Leadership; designed the rituals that drove alignment, quality, and speed",
          ],
        },
      ],
    },
    {
      company: "'Nuffsaid",
      title: "Head of Design",
      dates: "2022 – 2023",
      meta: ["Acquired by ClickUp, backed by Google Ventures and General Catalyst"],
      bullets: [
        "Joined as Head of Design and second design hire, brought in to rebuild the design practice",
        "Owned product, design language, and vision for a universal inbox for customer success teams",
        "Set up a weekly iteration loop from insights to prototypes with a live customer advisory board, building deep customer empathy across the team. The continuous discovery loop revealed that we were building the wrong thing, so we pivoted and launched a new product from scratch within three months",
      ],
    },
    {
      company: "Uber",
      title: "Sr. Product Designer",
      dates: "2019 – 2022",
      meta: ["Advanced Technologies Group (acquired by Aurora, 2021)"],
      bullets: [
        "Made complex tools more usable for ML engineers through human-centered design, leading user research and product design end-to-end across multiple autonomy teams",
        "Designed tools for log search and mining, map generation, and vehicle-data visualization used by mission specialists, triage teams, and autonomy developers",
      ],
    },
    {
      company: "Bloomberg LP",
      title: "Product Consultant",
      dates: "2019",
      bullets: [
        "Designed the next-generation data annotation platform that Bloomberg's data scientists use to train more accurate machine learning models. It ensured annotation quality, streamlined annotation requests, and consolidated multiple annotation sources",
      ],
    },
    {
      company: "Headspace",
      title: "Product Consultant",
      dates: "2019",
      bullets: [
        "Designed new mobile features aimed at the highest-attrition segment to lift weekend engagement",
      ],
    },
    {
      company: "BlueDot",
      title: "UX & Data Designer",
      dates: "2014 – 2018",
      bullets: [
        "Designed and built ML tools to track and predict how infectious diseases spread, including 100+ data visualizations, one featured in The Economist",
        "Built the product 0 to 1 across vision, research, build, and release. Created the proof of concept behind a $1M+ Air Canada partnership",
        "BlueDot later became the first in the world to flag COVID-19 ahead of the World Health Organization",
      ],
    },
  ] satisfies ResumeRole[],
} as const;
