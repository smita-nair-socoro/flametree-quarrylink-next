import z from 'zod';
import DOMPurify from 'dompurify';

const MAX_TERMS_LENGTH = 8000;
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

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

export const textTemplateFormSchema = z.object({
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
  isDefault: z.boolean(),
});

export const externalLinkFormSchema = z.object({
  name: z.string().trim().min(1, 'Display label is required').max(120),
  url: z.string().trim().min(1, 'URL is required').url('Enter a valid URL'),
  isDefault: z.boolean(),
});

export const replaceDocumentFormSchema = z.object({
  name: z.string().trim().min(1, 'Display name is required').max(120),
  file: z
    .instanceof(File)
    .optional()
    .superRefine((file, ctx) => {
      if (!file) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PDF file is required',
        });
        return;
      }
      if (file.type !== 'application/pdf') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only PDF files are accepted',
        });
      }
      if (file.size > MAX_PDF_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'File size must be 10MB or less',
        });
      }
    }),
  isDefault: z.boolean(),
});

export type TextTemplateFormValues = z.infer<typeof textTemplateFormSchema>;
export type ExternalLinkFormValues = z.infer<typeof externalLinkFormSchema>;
export type ReplaceDocumentFormValues = z.infer<
  typeof replaceDocumentFormSchema
>;
