import z from 'zod';

const Base = z.object({
  supplier_name: z.string().trim().min(1, { message: 'Required' }),
  supplier_product_name: z
    .string()
    .min(2, { message: 'Product Name must be at least 2 characters.' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  supplier_product_code: z.string().nonempty({ message: 'Required' }),

  cost_price_TN: z.coerce.number().optional(),
  sell_price_TN: z.coerce.number().optional(),
  cost_price_M3: z.coerce.number().optional(),
  sell_price_M3: z.coerce.number().optional(),
  cost_price_KG: z.coerce.number().optional(),
  sell_price_KG: z.coerce.number().optional(),
  cost_price_Bulk: z.coerce.number().optional(),
  sell_price_Bulk: z.coerce.number().optional(),
  margin_TN: z.coerce.number().optional(),
  margin_M3: z.coerce.number().optional(),
  margin_KG: z.coerce.number().optional(),
  margin_BULK: z.coerce.number().optional(),
  available_for_sale_TN: z.boolean(),
  available_for_sale_M3: z.boolean(),
  available_for_sale_KG: z.boolean(),
  available_for_sale_Bulk: z.boolean(),

  truck_TN_rate: z.coerce.number().optional(),
  truck_M3_rate: z.coerce.number().optional(),
  truck_hourly_rate: z.coerce.number().optional(),
  truck_load_rate: z.coerce.number().optional(),
  available_truck_TN_rate: z.boolean(),
  available_truck_M3_rate: z.boolean(),
  available_truck_hourly_rate: z.boolean(),
  available_truck_load_rate: z.boolean(),
});

export const NewSupplierFormSchema = Base.superRefine((data, ctx) => {
  // Supplier type specific validations
  const units = ['TN', 'M3', 'KG', 'Bulk'] as const;
  for (const unit of units) {
    if (data[`available_for_sale_${unit}`] === true) {
      if (
        data[`cost_price_${unit}`] === undefined ||
        data[`cost_price_${unit}`] === null ||
        data[`cost_price_${unit}`] === 0
      ) {
        ctx.addIssue({
          path: [`cost_price_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'Cost price is required',
        });
      }
      if (
        data[`sell_price_${unit}`] === undefined ||
        data[`sell_price_${unit}`] === null ||
        data[`sell_price_${unit}`] === 0
      ) {
        ctx.addIssue({
          path: [`sell_price_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'Sell price is required',
        });
      }
      if (
        data[`cost_price_${unit}`] !== undefined &&
        data[`cost_price_${unit}`] !== null &&
        (data[`cost_price_${unit}`] as number) <= 0
      ) {
        ctx.addIssue({
          path: [`cost_price_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'Cost price must be greater than 0',
        });
      }
      if (
        data[`sell_price_${unit}`] !== undefined &&
        data[`sell_price_${unit}`] !== null &&
        (data[`sell_price_${unit}`] as number) <= 0
      ) {
        ctx.addIssue({
          path: [`sell_price_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'Sell price must be greater than 0',
        });
      }
    }
  }

  const truckUnits = [
    'TN_rate',
    'M3_rate',
    'hourly_rate',
    'load_rate',
  ] as const;
  for (const unit of truckUnits) {
    if (data[`available_truck_${unit}`] === true) {
      if (
        data[`truck_${unit}`] === undefined ||
        data[`truck_${unit}`] === null ||
        data[`truck_${unit}`] === 0
      ) {
        ctx.addIssue({
          path: [`truck_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'Truck rate is required',
        });
      }
      if (
        data[`truck_${unit}`] !== undefined &&
        data[`truck_${unit}`] !== null &&
        (data[`truck_${unit}`] as number) <= 0
      ) {
        ctx.addIssue({
          path: [`truck_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'Truck rate must be greater than 0',
        });
      }
    }
  }
});
