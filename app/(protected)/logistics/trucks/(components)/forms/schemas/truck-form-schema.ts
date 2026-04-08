import z from 'zod';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';

export const TruckFormSchema = z
  .object({
    type: z.enum(['INTERNAL', 'EXTERNAL']),
    haulierId: z.number(),
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
    year: z.string().optional(),
    truckType: z.nativeEnum(TRUCK_TYPE, { message: 'Truck type is required' }),
    tankVolumeM3: z.coerce.number().nonnegative().optional(),
    tareWeight: z.coerce.number().nonnegative().optional(),
    combinationGvm: z.coerce.number().nonnegative().optional(),
    driverId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.haulierId || data.haulierId === 0) {
      ctx.addIssue({
        path: ['haulierId'],
        code: z.ZodIssueCode.custom,
        message: 'Haulier is required',
      });
    }
  });

export type TruckFormValues = z.infer<typeof TruckFormSchema>;
