import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    updatedDate: z.string().optional(),
    slug: z.string().optional(),
    topic: z.string(),
    topicSlug: z.string(),
    image: z.string().optional(),
    type: z.string(),
    published: z.boolean(),
  }),
});

export const collections = { blog };
