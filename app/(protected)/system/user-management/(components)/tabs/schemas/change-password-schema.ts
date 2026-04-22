import z from 'zod';

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().nonempty({ message: 'Required' }),
    new_password: z
      .string()
      .nonempty({ message: 'Required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        {
          message:
            'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
        },
      ),
    confirm_password: z.string().nonempty({ message: 'Required' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: 'You can not use the existing password for the new password',
    path: ['new_password'],
  });
