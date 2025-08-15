import z from 'zod';
import isValidABN from 'is-valid-abn';

export const NewCustomerFormSchema = z.object({
  customer_type: z.string().nonempty({ message: 'Required' }),
  payment_type: z.string().nonempty({ message: 'Required' }),
  business_name: z.string().min(2, { message: 'At least 2 characters' }),
  business_email: z.string().email({ message: 'Invalid email address' }),
  business_phone: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(/^\+61\s\d{3}\s\d{3}\s\d{3}$/, {
      message: 'Phone must be in format +61 xxx xxx xxx',
    }),
  abn: z
    .string()
    .nonempty({ message: 'Required' })
    .refine((val) => isValidABN(val), {
      message: 'Invalid ABN',
    }),
  contact_person_name: z.string().min(2, { message: 'At least 2 characters' }),
  contact_person_email: z.string().email({ message: 'Invalid email address' }),
  contact_person_phone: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(/^\+61\s\d{3}\s\d{3}\s\d{3}$/, {
      message: 'Phone must be in format +61 xxx xxx xxx',
    }),
  credit_limit: z.coerce
    .number()
    .nonnegative({ message: 'Credit limit must be greater than 0' }),
  payment_terms: z.string().nonempty({ message: 'Required' }),
  account_manager: z.string().nonempty({ message: 'Required' }),
  billing_address: z.string().nonempty({ message: 'Required' }),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string(),
  last_modified_by: z.string(),
});
