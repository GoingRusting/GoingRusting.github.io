import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Written by scripts/sync-content.mjs from the project repositories.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    project: z.enum(['engine', 'brain', 'shader']),
    kind: z.enum(['docs', 'tutorials']),
    group: z.string(),
    order: z.number(),
    description: z.string(),
    source: z.string().url(),
    minutes: z.number().optional(),
  }),
});

export const collections = { pages };
