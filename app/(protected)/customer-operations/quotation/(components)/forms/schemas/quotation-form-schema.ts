import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

const requiredPhoneSchema = z
  .string()
  .trim()
  .nonempty({ message: 'Required' })
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });

const requiredRecipientEmailSchema = z.string().refine(
  (val) =>
    val
      .split(',')
      .map((e) => e.trim())
      .some(Boolean),
  { message: 'At least one recipient email is required' },
);

export const QuotationFormSchema = z.object({
  customerId: z.coerce.number().min(1, { message: 'Required' }),
  accountManagerSub: z.string().nonempty({ message: 'Required' }),
  projectName: z.string().min(2, { message: 'At least 2 characters' }),
  deliveryStartDate: z.date().optional(),
  deliveryWindowStart: z
    .string()
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    })
    .or(z.literal(''))
    .optional(),
  deliveryWindowEnd: z
    .string()
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    })
    .or(z.literal(''))
    .optional(),
  expiryDate: z.date({ message: 'Required' }),
  // Create flow: phone is auto-filled from customer but not shown — skip format checks.
  phone: z.string().optional(),
  receiptEmail: z.string().optional(),
  customerNotes: z
    .string()
    .max(2000, { message: 'Must be 2000 characters or fewer' })
    .optional(),
  attachedItemIds: z.array(z.union([z.string(), z.number()])).optional(),
  poNumber: z
    .string()
    .max(20, { message: 'Maximum 20 characters' })
    .optional(),
});

export type QuotationFormValues = z.infer<typeof QuotationFormSchema>;

export const getQuotationFormSchema = (isEditing: boolean) => {
  if (isEditing) {
    return QuotationFormSchema.extend({
      phone: requiredPhoneSchema,
      receiptEmail: requiredRecipientEmailSchema,
    });
  }
  return QuotationFormSchema;
};
