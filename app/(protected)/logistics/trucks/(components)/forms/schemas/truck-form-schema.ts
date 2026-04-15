import z from 'zod';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';

export const TruckFormSchema = z
  .object({
    haulierId: z.coerce.number(),
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
    year: z.string().nonempty({ message: 'Year is required' }),
    truckType: z.nativeEnum(TRUCK_TYPE, { message: 'Truck type is required' }),
    tankVolumeM3: z.coerce
      .number()
      .positive({ message: 'Volume must be greater than 0' }),
    tareWeight: z.coerce
      .number()
      .positive({ message: 'Tare weight must be greater than 0' }),
    combinationGvm: z.coerce
      .number()
      .positive({ message: 'GVM weight must be greater than 0' }),
    driverId: z.string().optional(),
  })
  ;

export type TruckFormValues = z.infer<typeof TruckFormSchema>;
