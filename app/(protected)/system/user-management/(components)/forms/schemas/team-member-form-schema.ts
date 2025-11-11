import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const FullNameRequired = z
  .string()
  .trim()
  .min(1, 'Full name is required')
  .min(2, 'At least 2 characters')
  .max(256, 'Maximum 256 characters');

const EmailRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Email is required' })
  .max(256, 'Maximum 256 characters')
  .refine((value) => z.string().email().safeParse(value).success, {
    message: 'Invalid email format',
  });

const PhoneOptional = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || isValidPhoneNumber(value), {
    message: 'Invalid phone number',
  });

export const EditTeamMemberFormSchema = z.object({
  full_name: FullNameRequired,
  phone: PhoneOptional,
  email: EmailRequired,
  role: z.string().trim().min(1, 'Role is required'),
});
