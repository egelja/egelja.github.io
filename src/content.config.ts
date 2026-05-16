import { defineCollection, z } from "astro:content";
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

export const collections = { news, pubs };
