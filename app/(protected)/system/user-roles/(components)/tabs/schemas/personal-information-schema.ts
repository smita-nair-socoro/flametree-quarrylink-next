import z from 'zod';

export const PersonalInformationSchema = z.object({
  full_name: z.string().nonempty({ message: 'Required' }),
  phone: z.string().nonempty({ message: 'Required' }),
  created_at: z.date(),
  last_login_at: z.date(),
});
