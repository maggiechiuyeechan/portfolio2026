import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * work — case studies rendered on /work. One folder per project with an
 * index.md and co-located images.
 */
const work = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/work" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Small tertiary suffix after the title, e.g. a year */
      meta: z.string().optional(),
      subtitle: z.string(),
      /** Short label shown in the left nav */
      navLabel: z.string(),
      order: z.number(),
      /** In-page scroll target on /work */
      anchorId: z.string(),
      /**
       * Static mockups, rendered by StudyBlock's generic branch.
       *
       * Every study currently ships a bespoke animated demo instead, so this
       * is empty across the board — but it stays as the fallback path for a
       * study that doesn't warrant one. Defaults to [] so a study can omit it.
       */
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
          }),
        )
        .default([]),
    }),
});

/** blog — scaffold for future posts; add .md/.mdx files to activate. */
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

/** prototypes — scaffold for future vibe-coded prototype galleries. */
const prototypes = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/prototypes" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      tags: z.array(z.string()).default([]),
      embedUrl: z.string().url().optional(),
      cover: image().optional(),
    }),
});

export const collections = { work, blog, prototypes };
