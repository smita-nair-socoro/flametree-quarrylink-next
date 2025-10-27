import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const PhoneOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });

export const InviteUserFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: PhoneOptional,
  role: z.string().min(1, 'Role is required'),
});
