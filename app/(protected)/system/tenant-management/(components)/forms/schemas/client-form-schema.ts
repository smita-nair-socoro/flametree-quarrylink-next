import { isValidPhoneNumber } from 'react-phone-number-input';
import isValidABN from 'is-valid-abn';
import z from 'zod';

const PhoneRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Phone number is required' })
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });
const EmailRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Email is required' })
  .max(256, 'Maximum 256 characters')
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Invalid email format',
  });

export const ClientFormSchema = z.object({
  name: z.string().nonempty({ message: 'Required' }),
  contact_name: z.string().nonempty({ message: 'Required' }),
  email: EmailRequired,
  phone: PhoneRequired,
  subscription: z.string().nonempty({ message: 'Required' }),
  subscription_payment_term: z.string().nonempty({ message: 'Required' }),
  unit_subscription_price: z.coerce.number(), // Price per user
  total_subscription_price: z.coerce.number(), // Total price (unit price * number of users)
  number_of_users: z.coerce.number().min(10).max(20),
  abn: z
    .string()
    .trim()
    .nonempty({ message: 'ABN is required' })
    .refine((v) => isValidABN(v), {
      message: 'Invalid ABN',
    }),
  // billing_address: z.string().trim().min(1, 'Required'),
  billing_address: z.string().optional(),
  created_by: z.string().optional(),
  last_modified_by: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
