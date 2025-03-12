import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    pdf: z.string().optional(), // Campo opcional para la ruta del PDF
  }),
});

export const collections = {
  blog: blogCollection,
};