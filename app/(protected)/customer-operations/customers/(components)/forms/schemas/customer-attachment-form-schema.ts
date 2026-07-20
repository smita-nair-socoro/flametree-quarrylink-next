import z from 'zod';
import { CUSTOMER_ATTACHMENT_CATEGORY } from '@/lib/types/customer-enums';
import { FormSelectOption } from '@/components/ui/form-select';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

export const CUSTOMER_ATTACHMENT_CATEGORY_OPTIONS: readonly FormSelectOption[] =
  [
    {
      label: 'Credit Application',
      value: CUSTOMER_ATTACHMENT_CATEGORY.CREDIT_APPLICATION,
    },
    {
      label: 'Signed Terms & Conditions',
      value: CUSTOMER_ATTACHMENT_CATEGORY.SIGNED_TERMS_AND_CONDITIONS,
    },
    {
      label: 'ABN / GST Registration',
      value: CUSTOMER_ATTACHMENT_CATEGORY.ABN_GST_REGISTRATION,
    },
    {
      label: 'Insurance Certificate',
      value: CUSTOMER_ATTACHMENT_CATEGORY.INSURANCE_CERTIFICATE,
    },
    {
      label: 'Purchase Order',
      value: CUSTOMER_ATTACHMENT_CATEGORY.PURCHASE_ORDER,
    },
    {
      label: 'Quote / Quotation',
      value: CUSTOMER_ATTACHMENT_CATEGORY.QUOTE_QUOTATION,
    },
    {
      label: 'Contract / Agreement',
      value: CUSTOMER_ATTACHMENT_CATEGORY.CONTRACT_AGREEMENT,
    },
    {
      label: 'Identification',
      value: CUSTOMER_ATTACHMENT_CATEGORY.IDENTIFICATION,
    },
    {
      label: 'Correspondence',
      value: CUSTOMER_ATTACHMENT_CATEGORY.CORRESPONDENCE,
    },
  ];

export const CUSTOMER_ATTACHMENT_CATEGORY_LABELS: Record<string, string> =
  Object.fromEntries(
    CUSTOMER_ATTACHMENT_CATEGORY_OPTIONS.map(({ label, value }) => [
      String(value),
      label,
    ]),
  );

export const CUSTOMER_ATTACHMENT_ACCEPT =
  '.pdf,.doc,.docx,.xlsx,.jpeg,.jpg,.png,.eml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,message/rfc822';

function hasAcceptedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export const customerAttachmentFormSchema = z.object({
  category: z.nativeEnum(CUSTOMER_ATTACHMENT_CATEGORY, {
    required_error: 'Category is required',
  }),
  fileName: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(256, 'Maximum 256 characters'),
  file: z
    .instanceof(File, { message: 'File is required' })
    .superRefine((file, ctx) => {
      if (file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'File size must be less than 10MB',
        });
      }

      if (
        !ACCEPTED_FILE_TYPES.has(file.type) &&
        !hasAcceptedExtension(file.name)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Only PDF, Word, Excel (xlsx), JPEG, JPG, PNG, and .eml files are accepted',
        });
      }
    }),
});
