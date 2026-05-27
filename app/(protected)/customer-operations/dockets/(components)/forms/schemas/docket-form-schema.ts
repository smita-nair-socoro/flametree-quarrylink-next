import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

export const DocketFormSchema = z
  .object({
  jobId: z.coerce.number().min(1, { message: 'Required' }),
  jobLineItemId: z.coerce.number().min(1, { message: 'Required' }),
  jobLineItemType: z.string().optional(),
  plannedLoadSize: z.coerce.number().gt(0, { message: 'Planned Load Size must be greater than 0' }).optional(),
  actualLoadSize: z.coerce.number().min(0).optional(),
  truckQty: z.coerce.number().min(0).optional(),
  pickUpAddressId: z.coerce.string().nonempty({ message: 'Required' }),
  deliveryAddressId: z.coerce.string().optional(),
  purchaseOrder: z.string().optional(),
  productEstimatedVolume: z.coerce.number().min(0).optional(),
  deliveryCollectionDate: z.date({ message: 'Required' }),
  deliveryCollectionStartTime: z
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
  docketEmail: z.string().optional(),
  notes: z.string().optional(),
  truckType: z.string().optional(),
})
.superRefine((data, ctx) => {
  if (data.jobLineItemType === 'DELIVERY' && !data.deliveryAddressId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Required',
      path: ['deliveryAddressId'],
    });
  }
});
