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

export const collections = { news };
