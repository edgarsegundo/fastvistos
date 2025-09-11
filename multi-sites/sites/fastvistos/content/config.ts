import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    updatedDate: z.string().optional(),
    topic: z.string(),
    topicSlug: z.string(),
    image: z.string().default(''),
    type: z.string(),
    published: z.boolean(),
  }),
});

export const collections = {
  blog: blogCollection,
};
