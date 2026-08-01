import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const link = z
  .string()
  .refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "Expected an absolute URL or root-relative path",
  );

export const collections = {
  certifications: defineCollection({
    loader: glob({ pattern: "**/*.yml", base: "./src/content/certifications" }),
    schema: ({ image }) =>
      z.object({
        name: z.string().min(1),
        image: image(),
        certificateLink: link,
        featured: z.boolean(),
        displayOrder: z.number().int().positive(),
      }),
  }),
  experience: defineCollection({
    loader: glob({ pattern: "**/*.yml", base: "./src/content/experience" }),
    schema: z.object({
      startDate: z.date(),
      endDate: z.date().optional(),
      heading: z.string().min(1),
      subHeading: z.string().min(1),
      consultingFirm: z.string().min(1).optional(),
      description: z.string().min(1),
      tags: z.array(z.string().min(1)).optional(),
    }),
  }),
};
