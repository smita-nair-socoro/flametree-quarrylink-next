import z from 'zod';
import DOMPurify from 'dompurify';

const MAX_TERMS_LENGTH = 8000;

/**
 * Restrict stored template HTML to what the rich text editor can produce:
 * paragraphs (with text-align style), bold/italic/underline/strike, lists,
 * and links. Everything else (scripts, event handlers, etc.) is stripped.
 */
const sanitizeTemplateHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
  });

export const TextTemplateFormSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required').max(120),
  content: z
    .string()
    .trim()
    .min(1, 'Terms & conditions text is required')
    .transform(sanitizeTemplateHtml)
    .refine(
      (html) => html.length <= MAX_TERMS_LENGTH,
      `Must be ${MAX_TERMS_LENGTH} characters or fewer, including formatting`,
    ),
  defaultItem: z.boolean(),
});
