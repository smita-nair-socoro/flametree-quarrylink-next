import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const PhoneRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Phone number is required' })
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });

export const PersonalInformationSchema = z.object({
  full_name: z.string().nonempty({ message: 'Required' }),
  phone: PhoneRequired,
  created_at: z.string(),
  last_login_at: z.string(),
});
