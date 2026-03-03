import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

export const DocketFormSchema = z.object({
  jobId: z.coerce.number().min(1, { message: 'Required' }),
  jobLineItemId: z.coerce.number().min(1, { message: 'Required' }),
  truckType: z.string().optional(),
  loadSize: z.coerce.number().positive({ message: 'Must be greater than 0' }),
  pickUpAddressId: z.coerce.number().optional(),
  deliveryAddressId: z.coerce.number().optional(),
  purchaseOrder: z.string().optional(),
  productEstimatedVolume: z.coerce
    .number()
    .positive({ message: 'Must be greater than 0' }),
  deliveryCollectionDate: z.date({ message: 'Required' }),
  delieryCollectionStartTime: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    }),
  deliveryCollectionEndTime: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    }),
  customerContactName: z.string().nonempty({ message: 'Required' }),
  customerContactPhone: z
    .string()
    .nonempty({ message: 'Required' })
    .refine((v) => !v || isValidPhoneNumber(v), {
      message: 'Invalid phone number',
    }),
  docketEmail: z.string().email().nonempty({ message: 'Required' }),
  notes: z.string().optional(),
});
