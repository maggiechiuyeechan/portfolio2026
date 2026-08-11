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
      { label: "mach.sq@gmail.com", href: "mailto:mach.sq@gmail.com" },
      { label: "412.298.2988" },
      {
        label: "linkedin.com/in/mcychan",
        href: "https://www.linkedin.com/in/mcychan",
      },
    ],
  ] satisfies ResumeContact[][],

  education: [
    { degree: "Master's HCI", school: "Carnegie Mellon 2019" },
    { degree: "Bachelor's Graphic Design", school: "OCAD University 2013" },
  ] satisfies ResumeEducation[],

  work: [
    {
      company: "ClickUp",
      title: "VP, Product Design & Research",
      dates: "2023 to present",
      meta: [
        "Promoted Jan '26 · Sr. Director 2024–25", 
        "Product Design Manager 2023–24 · Sr. Product Designer 2023",
      ],
      summary:
        "I lead product design and research in close partnership with the CEO. I scaled design from 12 to 18 and research from 1 to 4 before reorganizing around a leaner team of 8 designers and 2 researchers. I run the org and stay close to the details, often shipping features myself.",
      groups: [
        {
          heading: "Turning ClickUp into an AI-native work platform",
          bullets: [
            "Led design across ClickUp’s AI suite (including Brain, Super Agents, AI Fields, AI Summaries, Artifacts, and Skills) with three designers.", 
            "Pushed pace & quality, aligned parallel teams by rapid prototyping, customer testing, and daily dogfooding. As a result, Brain adoption grew from 9.6% to 19.6% while improving M1 retention by 35%.",
            "AI revenue got healthier between Jan 2025 and Jun 2026: AI subscription ARR $6.89M to $40.73M (5.9x), with NDR crossing 100% (98.2% to 102.1%)",
          ],
        },
        {
          heading: "Shipping with care for the pixels",
          bullets: [
            "Personally designed and shipped 135+ features to production as an IC and a design leader",
            "Led ClickUp 4.0, the largest redesign in company history, introducing a new visual language and navigation IA across Lists, Chat, Docs, and other core surfaces. Every risky change was tested qualitatively and quantitatively, while low-risk changes were shipped rapidly and dogfooded",
            "Overall product NPS rose 15 points to an all-time high. Task View shipped to 456K users at a 0.09% revert rate",
          ],
        },
        {
          heading:
            "Building internal AI-native tools for success, creativity & efficiency",
          bullets: [
            "Built the internal workflows that changed how EPD works: research studies launched by agents from inside ClickUp, and live prototypes coded with agents, testable in minutes in the Prototype Playground",
            "Brought coding and productivity agents into the design team's daily practice. Designers now ship simple fixes straight to the frontend repo themselves",
            "Building a learning system that improves from human corrections and adjusts its agents, skills, rules, and design-system documentation",
          ],
        },
        {
          heading: "Building and growing teams",
          bullets: [
            "Grew design 12 to 18 and research 1 to 4, with 6 promoted across both teams", 
            "Iterated on recruiting practices: screening, hiring process, and quality bars",
            "Built career ladders, personalized career paths, and created a performance rubric on Craft, Collaboration, and Leadership",
            "Established the design rituals and continuous processes that enabled alignment, quality, and speed",
          ],
        },
      ],
    },
    {
      company: "'Nuffsaid",
      title: "Head of Design",
      dates: "2022 to 2023",
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
      dates: "2019 to 2022",
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
      dates: "2014 to 2018",
      bullets: [
        "Designed and built ML tools to track and predict how infectious diseases spread, including 100+ data visualizations, one featured in The Economist",
        "Built the product 0 to 1 across vision, research, build, and release. Created the proof of concept behind a $1M+ Air Canada partnership",
        "BlueDot later became the first in the world to flag COVID-19 ahead of the World Health Organization",
      ],
    },
  ] satisfies ResumeRole[],
} as const;
