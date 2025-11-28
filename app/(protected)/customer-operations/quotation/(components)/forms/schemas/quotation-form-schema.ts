import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

export const NewQuotationFormSchema = z.object({
  quoteType: z.string().nonempty({ message: 'Required' }),
  customerId: z.coerce.number().min(1, { message: 'Required' }),
  accountManager: z.coerce.number().min(1, { message: 'Required' }),
  projectName: z.string().min(2, { message: 'At least 2 characters' }),
  deliveryStartDate: z.date({ message: 'Required' }),
  deliveryWindowStart: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time‑of‑day with timezone',
    }),
  deliveryWindowEnd: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time‑of‑day with timezone',
    }),
  expiryDate: z.date({ message: 'Required' }),
  deliveryAddress: z.string().trim().min(1, 'Required'),
  phone: z
    .string()
    .trim()
    .nonempty({ message: 'Required' })
    .refine((v) => !v || isValidPhoneNumber(v), {
      message: 'Invalid phone number',
    }),
  email: z
    .string()
    .trim()
    .nonempty({ message: 'Required' })
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: 'Invalid email format',
    }),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string(),
});
