import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

export const JobFormSchema = z.object({
  poNumber: z.string().optional(),
  customerId: z.coerce.number().min(1, { message: 'Required' }),
  accountManagerSub: z.string().nonempty({ message: 'Required' }),
  projectName: z.string().min(2, { message: 'At least 2 characters' }),
  deliveryStartDate: z.date({ message: 'Required' }),
  deliveryWindowStart: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    }),
  deliveryWindowEnd: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    }),
  receiptEmail: z.string().refine(
    (val) =>
      val
        .split(',')
        .map((e) => e.trim())
        .some(Boolean),
    { message: 'At least one recipient email is required' },
  ),
  phone: z.string().optional(),
  contactPersonName: z.string().optional(),
});

export type JobFormValues = z.infer<typeof JobFormSchema>;

export const getJobFormSchema = (isEditing: boolean) => {
  if (isEditing) {
    return JobFormSchema.extend({
      contactPersonName: z
        .string()
        .min(2, {
          message: 'Contact person name must be at least 2 characters.',
        })
        .max(100, {
          message: "Contact person name can't be more than 100 characters",
        }),
      phone: z
        .string()
        .trim()
        .nonempty({ message: 'Phone number is required' })
        .refine((v) => !v || isValidPhoneNumber(v), {
          message: 'Invalid phone number',
        }),
    });
  }
  return JobFormSchema;
};
