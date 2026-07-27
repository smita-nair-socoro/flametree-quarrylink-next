import z from 'zod';

export const ExternalLinkFormSchema = z.object({
  name: z.string().trim().min(1, 'Display label is required').max(120),
  url: z.string().trim().min(1, 'URL is required').url('Enter a valid URL'),
  linkText: z.string().trim().min(1, 'Link text is required').max(120),
  defaultItem: z.boolean(),
});
