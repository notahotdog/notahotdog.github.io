import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "umar_blog";
export const PROJECTS_PATH = "src/data/projects";

const blog = defineCollection({
  loader: glob({
    pattern: ["**/[^_]*.md", "!**/_*/**", "!**/.*/**"],
    base: `./${BLOG_PATH}`,
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      format: z
        .enum(["essay", "tutorial", "talk-notes", "notes"])
        .optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: ["**/[^_]*.md", "!**/_*/**", "!**/.*/**"],
    base: `./${PROJECTS_PATH}`,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      stack: z.array(z.string()).default([]),
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
      role: z.string().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      ogImage: image().or(z.string()).optional(),
      timezone: z.string().optional(),
    }),
});

export const collections = { blog, projects };
