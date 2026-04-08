import z from 'zod';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';

export const TruckFormSchema = z
  .object({
    type: z.enum(['INTERNAL', 'EXTERNAL']),
    haulier: z.string().trim().optional(),
    licensePlate: z
      .string()
      .trim()
      .nonempty({ message: 'Truck registration is required' })
      .max(50, 'Maximum 50 characters'),
    vin: z.string().trim().max(256, 'Maximum 256 characters').optional(),
    model: z
      .string()
      .trim()
      .nonempty({ message: 'Make & Model is required' })
      .max(256, 'Maximum 256 characters'),
    year: z.coerce.number().int().positive().max(2100, 'Invalid year').optional(),
    truckType: z.nativeEnum(TRUCK_TYPE, { message: 'Truck type is required' }),
    tankVolumeM3: z.coerce.number().nonnegative().optional(),
    tareWeight: z.coerce.number().nonnegative().optional(),
    combinationGvm: z.coerce.number().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'EXTERNAL' && (!data.haulier || data.haulier.trim().length === 0)) {
      ctx.addIssue({
        path: ['haulier'],
        code: z.ZodIssueCode.custom,
        message: 'Haulier is required for External trucks',
      });
    }
  });

export type TruckFormValues = z.infer<typeof TruckFormSchema>;
