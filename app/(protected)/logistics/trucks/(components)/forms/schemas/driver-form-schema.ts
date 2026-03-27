import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { DRIVER_STATUS, DRIVER_TYPE } from '@/lib/types/driver-enums';

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

export const NewDriverFormSchema = z
  .object({
    driverName: z
      .string()
      .trim()
      .nonempty({ message: 'Driver name is required' })
      .max(256, 'Maximum 256 characters'),
    email: EmailRequired,
    phone: PhoneRequired,
    status: z.nativeEnum(DRIVER_STATUS).optional(),
    type: z.nativeEnum(DRIVER_TYPE),
    haulier: z.string().trim().max(256, 'Maximum 256 characters').optional(),
    driverLicenseNumber: z
      .string()
      .trim()
      .max(256, 'Maximum 256 characters')
      .nonempty({ message: 'Driver license number is required' }),
    assignedTrucks: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === DRIVER_TYPE.SUBCONTRACTOR) {
      if (!data.haulier || data.haulier.trim().length === 0) {
        ctx.addIssue({
          path: ['haulier'],
          code: z.ZodIssueCode.custom,
          message: 'Haulier is required for Subcontractor drivers',
        });
      }
    }
  });

export type NewDriverFormValues = z.infer<typeof NewDriverFormSchema>;
