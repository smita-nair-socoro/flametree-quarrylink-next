import z from 'zod';

const timeWithoutZoneRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?$/;

export const JobFormSchema = z.object({
  poNumber: z.string().optional(),
  customerId: z.coerce.number().min(1, { message: 'Required' }),
  accountManagerSub: z.string().nonempty({ message: 'Required' }),
  projectName: z.string().min(2, { message: 'At least 2 characters' }),
  deliveryStartDate: z.date({ message: 'Required' }),
  deliveryWindowStart: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    }),
  deliveryWindowEnd: z
    .string()
    .nonempty({ message: 'Required' })
    .regex(timeWithoutZoneRegex, {
      message: 'Invalid time of day with timezone',
    }),
  receiptEmail: z.string().optional(),
  phone: z.string().optional(),
  contactPersonName: z.string().optional(),
});

export type JobFormValues = z.infer<typeof JobFormSchema>;

export const getJobFormSchema = (isEditing: boolean) => {
  if (isEditing) {
    return JobFormSchema.extend({
      contactPersonName: z.string().min(1, { message: 'Required' }),
      phone: z.string().min(1, { message: 'Required' }),
    });
  }
  return JobFormSchema;
};
