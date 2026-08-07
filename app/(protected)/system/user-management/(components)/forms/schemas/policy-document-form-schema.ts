import z from 'zod';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export const PolicyDocumentFormSchema = z.object({
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
});
