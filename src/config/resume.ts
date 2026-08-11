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
  name: "Maggie Chiu Yee Chan",

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
        "I lead the design and research team, working closely with the CEO. Built the team to 18 designers and 4 researchers at peak, now 8 designers and 2 researchers after a company-wide restructuring. I run the org and stay close to the details, shipping features myself.",
      groups: [
        {
          heading: "Turning ClickUp into an AI-native work platform",
          bullets: [
            "Oversaw design across the AI suite (Brain, Super Agents, AI Fields, AI Summaries, Artifacts, Skills) with 3 designers in the area. Shaped, tested, and iterated on directions, created alignment across parallel feature areas, and pushed pace & quality across all surfaces",
            "Measuring the UX: Brain adoption went 9.6% to 19.6% (+104%) with M1 retention up 35% and 3.7x growth in monthly AI uses, and agents grew to 117,751 monthly active workspaces",
            "AI revenue got healthier: AI subscription ARR $6.89M to $40.73M between Jan 2025 and Jun 2026 (5.9x), with NDR crossing 100% (98.2% to 102.1%)",
          ],
        },
        {
          heading: "Shipping with care for the pixels",
          bullets: [
            "Personally designed and shipped 135+ features to production as an IC and a design leader",
            "Led design on ClickUp 4.0, the biggest redesign in the company's history: a new visual language and navigation IA, with improvements across every surface including Lists, Chats, and Docs. Every risky change was tested qualitatively and quantitatively",
            "Overall product NPS rose 15 points to an all-time high. Task View shipped to 456K users at a 0.09% revert rate",
          ],
        },
        {
          heading:
            "Internal agentic tools & workflow for success, creativity & efficiency",
          bullets: [
            "Built the internal workflows that changed how EPD works: research studies launched by agents from inside ClickUp, and live prototypes coded with agents and Cursor, testable in minutes in the Prototype Playground",
            "Brought coding and productivity agents into the team's daily practice. Designers now ship simple fixes straight to the frontend repo themselves",
            "Currently setting up the foundation that lets the system learn from human corrections and improve its own agents, skills, rules, and design system documentation",
          ],
        },
        {
          heading: "Building and growing teams",
          bullets: [
            "Grew design 12 to 18 and research 1 to 4, with 6 promoted across both teams", 
            "Iterated on recruiting practices with our recruiting partners: screening, hiring process, and quality bars",
            "Built career ladders, personalized career paths, and created a performance rubric on Craft, Collaboration, and Leadership",
            "Established the design rituals and continuous processes that enable alignment, quality, and speed",
            "Built structured onboarding for new product designers",
            "Organized pivotal onsites to align and motivate the team",
          ],
        },
      ],
    },
    {
      company: "'Nuffsaid",
      title: "Head of Design",
      dates: "2022 to 2023",
      meta: ["Acquired by ClickUp"],
      bullets: [
        "Joined as Head of Design and second design hire, brought in to rebuild the design practice",
        "Owned product, design language, and vision for a universal inbox for customer success teams. Hired the team's next designer. Backed by Google Ventures and General Catalyst",
        "Set up a weekly iteration loop with a live customer advisory board. It caught that we were building the wrong thing. We pivoted the whole product and launched a new product from scratch within 3 months",
      ],
    },
    {
      company: "Uber",
      title: "Sr. Product Designer",
      dates: "2019 to 2022",
      meta: ["Advanced Technologies Group (acquired by Aurora, 2021)"],
      bullets: [
        "Led user research and design end to end across multiple teams, every one of them building for engineers and researchers: log search and mining, tooling to generate and improve the maps self-driving vehicles run on, and vehicle data visualization for mission specialists, triage, autonomy capabilities, and autonomy developers",
      ],
    },
    {
      company: "Bloomberg LP",
      title: "Product Consultant",
      dates: "2019",
      bullets: [
        "Led a team of 5 designing a tool for Bloomberg's data scientists, improving the accuracy of their machine learning models",
      ],
    },
    {
      company: "Headspace",
      title: "Product Consultant",
      dates: "2019",
      bullets: [
        "Diagnosed the usage dips driving churn risk across a 65M-user base, then designed new mobile features aimed at the highest-attrition segment to lift weekend engagement",
      ],
    },
    {
      company: "BlueDot",
      title: "UX & Data Designer",
      dates: "2014 to 2018",
      bullets: [
        "Designed and coded 100+ data visualizations for an infectious disease surveillance platform, one featured in The Economist",
        "Built the product 0 to 1 across vision, research, build, and release. Created the proof of concept behind a $1M+ Air Canada partnership",
        "BlueDot later became the first in the world to flag COVID-19 ahead of the World Health Organization",
      ],
    },
  ] satisfies ResumeRole[],
} as const;
