import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const collections = {
  'certifications': defineCollection({
    loader: glob({ pattern: '**/*.yml', base: './src/content/certifications' }),
    schema: ({ image }) => z.object({
      name: z.string(),
      image: image(),
      certificateLink: z.string(),
    }),
  }),
  'experience': defineCollection({
    loader: glob({ pattern: '**/*.yml', base: './src/content/experience' }),
    schema: z.object({
      startDate: z.date(),
      endDate: z.date().optional(),
      heading: z.string(),
      subHeading: z.string(),
      description: z.string(),
      tags: z.array(z.string()).optional(),
    }),
  }),
};
