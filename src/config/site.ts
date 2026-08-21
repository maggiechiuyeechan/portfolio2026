/**
 * Single edit point for site copy and links.
 * Component code stays presentational; content lives here or in src/content/.
 */
export const site = {
  /** Canonical origin — no trailing slash. Used for SEO tags and sitemap. */
  url: "https://www.maggiechan.io",
  name: "Maggie",
  /** Full name for search / structured data. */
  fullName: "Maggie Chan",
  initials: "MC",
  title: "VP of Design & Research @ ClickUp",
  tagline: "Designing how humans and AI work together.",
  /**
   * Lede above the first case study on /work. Each string is a paragraph.
   * Holds inline company links, so they are injected with set:html —
   * keep the markup to plain anchors.
   */
  workIntroHtml: [
    `I'm Maggie, VP of Design &amp; Research at <a href="https://clickup.com">ClickUp</a> where I lead the org and stay close to the craft, often shipping features myself. Since 2023, I've shaped every major feature at ClickUp as the company grew from $150M to $360M+ ARR. Before that, I designed at <a href="https://www.uber.com">Uber</a> (self-driving), <a href="https://www.bloomberg.com">Bloomberg</a>, <a href="https://www.headspace.com">Headspace</a>, and BlueDot.`,
  ],
  seoTitle: "Maggie Chan — VP of Design & Research @ ClickUp",
  seoDescription:
    "Product design and UX research portfolio. Maggie Chan leads design and research at ClickUp, designing how humans and AI work together.",
  /** Open Graph / Twitter preview image (absolute path on this site). */
  ogImage: "/images/meadow-poster.webp",
  passwordPlaceholder: "Enter password",
  socials: [
    { label: "Linkedin", href: "https://www.linkedin.com/in/mcychan" },
    { label: "X", href: "https://x.com/maggiechewychan" },
    { label: "Email", href: "mailto:mach.sq@gmail.com" },
  ],
} as const;

/** Profile URLs for JSON-LD sameAs (excludes mailto). */
export const siteProfileLinks = site.socials
  .map(({ href }) => href)
  .filter((href) => href.startsWith("http"));
