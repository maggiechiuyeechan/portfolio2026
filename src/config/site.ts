/**
 * Single edit point for site copy and links.
 * Component code stays presentational; content lives here or in src/content/.
 */
export const site = {
  name: "maggie",
  initials: "MC",
  title: "VP of Design & Research @ ClickUp",
  tagline: "Designing how humans and AI work together.",
  passwordPlaceholder: "Enter password",
  socials: [
    { label: "Linkedin", href: "https://www.linkedin.com/in/mcychan" },
    { label: "X", href: "https://x.com/maggiechewychan" },
    { label: 'Ask for a password or just say "hi"', href: "mailto:mach.sq@gmail.com" },
  ],
} as const;
