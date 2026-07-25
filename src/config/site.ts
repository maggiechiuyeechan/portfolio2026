/**
 * Single edit point for site copy and links.
 * Component code stays presentational; content lives here or in src/content/.
 */
export const site = {
  name: "Maggie",
  initials: "MC",
  title: "VP of Design & Research @ ClickUp",
  tagline: "Designing how humans and AI work together.",
  bio: "Previously, self-driving tech at Uber. Head of design at NuffSaid. Consulted for Headspace and Bloomberg. Master\u2019s in HCI @ Carnegie Mellon.",
  passwordPlaceholder: "Enter password",
  footerNote: "Want a password? Get in touch",
  socials: [
    { label: "Linkedin", href: "https://www.linkedin.com/" },
    { label: "X", href: "https://x.com/" },
    { label: "Get in touch", href: "mailto:mach.sq@gmail.com" },
  ],
} as const;
