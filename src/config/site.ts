/**
 * Single edit point for site copy and links.
 * Component code stays presentational; content lives here or in src/content/.
 */
export const site = {
  /** Canonical origin — no trailing slash. Used for SEO tags and sitemap. */
  url: "https://www.maggiechan.io",
  name: "maggie",
  /** Full name for search / structured data; display name stays lowercase. */
  fullName: "Maggie Chan",
  initials: "MC",
  title: "VP of Design & Research @ ClickUp",
  tagline: "Designing how humans and AI work together.",
  seoTitle: "Maggie Chan — VP of Design & Research @ ClickUp",
  seoDescription:
    "Product design and UX research portfolio. Maggie Chan leads design and research at ClickUp, designing how humans and AI work together.",
  /** Open Graph / Twitter preview image (absolute path on this site). */
  ogImage: "/images/meadow-poster.webp",
  passwordPlaceholder: "Enter password",
  socials: [
    { label: "Linkedin", href: "https://www.linkedin.com/in/mcychan" },
    { label: "X", href: "https://x.com/maggiechewychan" },
    { label: 'Ask for a password or just say "hi"', href: "mailto:mach.sq@gmail.com" },
  ],
} as const;

/** Profile URLs for JSON-LD sameAs (excludes mailto). */
export const siteProfileLinks = site.socials
  .map(({ href }) => href)
  .filter((href) => href.startsWith("http"));
