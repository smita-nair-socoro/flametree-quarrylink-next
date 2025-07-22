import { z } from 'zod';

const PriceFields = z.object({
  scheduled_cost_price: z.coerce.number().nonnegative(),
  scheduled_sell_price: z.coerce.number().nonnegative(),
  status: z.string(),
});

const ScheduleShape = {
  applyTiming: z.enum(['immediate', 'scheduled']) as z.ZodEnum<
    ['immediate', 'scheduled']
  >,
  validFrom: z.date().optional(),
};

const _UpdatePriceBase = PriceFields.merge(z.object(ScheduleShape)).extend({
  id: z.coerce.number(),
});

export const UpdatePriceSchema = _UpdatePriceBase.refine(
  (data) => data.applyTiming === 'immediate' || Boolean(data.validFrom),
  {
    message: 'Please pick a date when scheduling.',
    path: ['scheduledDate'],
  },
);

export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;

export const ToggleStatusSchema = z.object({
  id: z.coerce.number(),
  status: z.string(),
});
