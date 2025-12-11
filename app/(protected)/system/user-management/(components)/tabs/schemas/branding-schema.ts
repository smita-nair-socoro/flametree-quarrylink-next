import z from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
];

export const BrandingSchema = z.object({
  company_logo: z
    .instanceof(File)
    .optional()
    .superRefine((file, ctx) => {
      if (!file) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Logo is required',
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'File size must be less than 2MB',
        });
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only JPEG, PNG, or SVG files are accepted',
        });
      }
    }),
});
