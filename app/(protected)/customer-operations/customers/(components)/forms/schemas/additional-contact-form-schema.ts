import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

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

export const additionalContactFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(256, 'Maximum 256 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(256, 'Maximum 256 characters'),
  email: EmailRequired,
  phone: PhoneRequired,
  position: z.string().trim().max(256, 'Maximum 256 characters').optional(),
});
