import z from 'zod';

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().nonempty({ message: 'Required' }),
    new_password: z.string().nonempty({ message: 'Required' }),
    confirm_password: z.string().nonempty({ message: 'Required' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });
