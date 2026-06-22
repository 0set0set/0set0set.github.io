import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const CATEGORIES = ["essay", "note"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  essay: "Essays",
  note: "Short notes",
};

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(CATEGORIES).default("essay"),
    draft: z.boolean().default(false),
    keywords: z.array(z.string()).optional(),
    image: z.string().optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { articles };
