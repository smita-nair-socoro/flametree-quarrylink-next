import z from 'zod';
import { JOB_ATTACHMENT_CATEGORY } from '@/lib/types/job-enums';
import { FormSelectOption } from '@/components/ui/form-select';

export const JOB_ATTACHMENT_MAX_COUNT = 3;
export const JOB_ATTACHMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'message/rfc822',
]);

const ACCEPTED_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xlsx',
  '.jpeg',
  '.jpg',
  '.png',
  '.eml',
];

export const JOB_ATTACHMENT_CATEGORY_OPTIONS: readonly FormSelectOption[] = [
  {
    label: 'Purchase Order',
    value: JOB_ATTACHMENT_CATEGORY.PURCHASE_ORDER,
  },
  {
    label: 'Quote / Contract',
    value: JOB_ATTACHMENT_CATEGORY.QUOTE_CONTRACT,
  },
  {
    label: 'Site Map / Access',
    value: JOB_ATTACHMENT_CATEGORY.SITE_MAP_ACCESS,
  },
  {
    label: 'Permit / Approval',
    value: JOB_ATTACHMENT_CATEGORY.PERMIT_APPROVAL,
  },
  {
    label: 'Safety Documentation',
    value: JOB_ATTACHMENT_CATEGORY.SAFETY_DOCUMENTATION,
  },
  {
    label: 'Correspondence',
    value: JOB_ATTACHMENT_CATEGORY.CORRESPONDENCE,
  },
  {
    label: 'Other',
    value: JOB_ATTACHMENT_CATEGORY.OTHER,
  },
];

export const JOB_ATTACHMENT_CATEGORY_LABELS: Record<string, string> =
  Object.fromEntries(
    JOB_ATTACHMENT_CATEGORY_OPTIONS.map(({ label, value }) => [
      String(value),
      label,
    ]),
  );

export const JOB_ATTACHMENT_ACCEPT =
  '.pdf,.doc,.docx,.xlsx,.jpeg,.jpg,.png,.eml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,message/rfc822';

function hasAcceptedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function formatAttachmentFileSizeMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function displayNameFromFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
}

export const jobAttachmentFormSchema = z.object({
  category: z
    .string()
    .min(1, 'Category is required')
    .pipe(z.nativeEnum(JOB_ATTACHMENT_CATEGORY)),
  fileName: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(256, 'Maximum 256 characters'),
  file: z
    .instanceof(File, { message: 'File is required' })
    .superRefine((file, ctx) => {
      if (file.size > JOB_ATTACHMENT_MAX_FILE_SIZE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `This file is ${formatAttachmentFileSizeMb(file.size)}. The maximum is 10 MB.`,
        });
      }

      const extensionAccepted = hasAcceptedExtension(file.name);
      const typeAccepted =
        !file.type ||
        file.type === 'application/octet-stream' ||
        ACCEPTED_FILE_TYPES.has(file.type);

      if (!extensionAccepted || !typeAccepted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Only PDF, Word, Excel (xlsx), JPEG, JPG, PNG, and .eml files are accepted',
        });
      }
    }),
});
