import z from 'zod';

// Bare domains like "www.google.com" are common to paste; treat them as https.
const normalizeUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const ExternalLinkFormSchema = z.object({
  name: z.string().trim().min(1, 'Display label is required').max(120),
  url: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .transform(normalizeUrl)
    .refine(isHttpUrl, 'Enter a valid URL'),
  linkText: z.string().trim().min(1, 'Link text is required').max(120),
  defaultItem: z.boolean(),
});
