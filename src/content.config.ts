import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const news = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(["paper", "talk", "award", "position"]),
    details: z.array(z.string()).optional(),
  }),
});

const pubs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pubs" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    date: z.coerce.date(),
    pdf: z.string().optional(),
    badges: z
      .array(
        z.enum([
          "acm-available",
          "acm-functional",
          "acm-reusable",
          "acm-reproduced",
          "acm-replicated",
        ]),
      )
      .optional(),
    arxiv: z.string().optional(),
    doi: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      url: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news, pubs, projects, blog };
