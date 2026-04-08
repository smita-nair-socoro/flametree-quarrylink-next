import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const HaulierFormSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: 'Haulier name is required' })
    .max(256, 'Maximum 256 characters'),
  email: z
    .string()
    .trim()
    .nonempty({ message: 'Email is required' })
    .max(256, 'Maximum 256 characters')
    .refine((v) => z.string().email().safeParse(v).success, {
      message: 'Invalid email format',
    }),
  phone: z
    .string()
    .trim()
    .nonempty({ message: 'Phone number is required' })
    .refine((v) => isValidPhoneNumber(v), {
      message: 'Invalid phone number',
    }),
});

