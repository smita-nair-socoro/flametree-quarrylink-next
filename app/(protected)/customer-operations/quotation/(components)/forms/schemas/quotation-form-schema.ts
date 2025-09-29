import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

export const NewQuotationFormSchema = z.object({
  quote_type: z.string().nonempty({ message: 'Required' }),
  customer_id: z.coerce.number().min(1, { message: 'Required' }),
  account_manager: z.coerce.number().min(1, { message: 'Required' }),
  project_name: z.string().min(2, { message: 'At least 2 characters' }),
  delivery_start_date: z.date({ message: 'Required' }),
  delivery_window_start: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time‑of‑day with timezone',
    }),
  delivery_window_end: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time‑of‑day with timezone',
    }),
  expiry_date: z.date({ message: 'Required' }),
  delivery_address: z.string().trim().min(1, 'Required'),
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
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string(),
  last_modified_by: z.string(),
});
