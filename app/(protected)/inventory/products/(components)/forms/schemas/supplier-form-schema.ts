import z from 'zod';

const Base = z.object({
  quarry_supplier_id: z.coerce
    .number({ required_error: 'Supplier is required' })
    .min(1, { message: 'Supplier is required' }),
  supplier_product_name: z
    .string()
    .nonempty({ message: 'Required' })
    .min(1, { message: 'Product Name must be at least 1 character' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  supplier_product_code: z.string().nonempty({ message: 'Required' }),
  density_tonnage_per_m3: z.coerce
    .number()
    .positive({ message: 'Density must be greater than 0' }),

  cost_price_tn: z.coerce.number().optional(),
  sell_price_tn: z.coerce.number().optional(),
  cost_price_m3: z.coerce.number().optional(),
  sell_price_m3: z.coerce.number().optional(),
  cost_price_kg: z.coerce.number().optional(),
  sell_price_kg: z.coerce.number().optional(),
  cost_price_bulka: z.coerce.number().optional(),
  sell_price_bulka: z.coerce.number().optional(),
  margin_tn: z.coerce.number().optional(),
  margin_m3: z.coerce.number().optional(),
  margin_kg: z.coerce.number().optional(),
  margin_bulka: z.coerce.number().optional(),
  available_for_sale_tn: z.boolean(),
  available_for_sale_m3: z.boolean(),
  available_for_sale_kg: z.boolean(),
  available_for_sale_bulka: z.boolean(),

  truck_tn_rate: z.coerce.number().optional(),
  truck_m3_rate: z.coerce.number().optional(),
  truck_hourly_rate: z.coerce.number().optional(),
  truck_load_rate: z.coerce.number().optional(),
  truck_km_rate: z.coerce.number().optional(),
  truck_kg_rate: z.coerce.number().optional(),
  truck_bulka_rate: z.coerce.number().optional(),
  available_truck_tn_rate: z.boolean(),
  available_truck_m3_rate: z.boolean(),
  available_truck_hourly_rate: z.boolean(),
  available_truck_load_rate: z.boolean(),
  available_truck_km_rate: z.boolean(),
  available_truck_kg_rate: z.boolean(),
  available_truck_bulka_rate: z.boolean(),
});

export const NewSupplierFormSchema = Base.superRefine((data, ctx) => {
  // TN is always required to be available for sale
  if (data.available_for_sale_tn !== true) {
    ctx.addIssue({
      path: ['available_for_sale_tn'],
      code: z.ZodIssueCode.custom,
      message: 'TN must always be available',
    });
  }

  // Pricing configuration validations
  const units = ['tn', 'm3', 'kg', 'bulka'] as const;
  for (const unit of units) {
    if (data[`available_for_sale_${unit}`] === true) {
      // When switch is on, cost price and sell price should not be empty
      if (
        data[`cost_price_${unit}`] === undefined ||
        data[`cost_price_${unit}`] === null
      ) {
        ctx.addIssue({
          path: [`cost_price_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'required',
        });
      }
      if (
        data[`sell_price_${unit}`] === undefined ||
        data[`sell_price_${unit}`] === null
      ) {
        ctx.addIssue({
          path: [`sell_price_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'required',
        });
      }
    }
  }

  // Truck rates validation - at least one rate type must be available
  const truckUnits = [
    'tn_rate',
    'm3_rate',
    'hourly_rate',
    'load_rate',
    'km_rate',
  ] as const;

  const hasAnyTruckRateAvailable = truckUnits.some(
    (unit) => data[`available_truck_${unit}`] === true,
  );

  if (!hasAnyTruckRateAvailable) {
    ctx.addIssue({
      path: ['available_truck_tn_rate'],
      code: z.ZodIssueCode.custom,
      message: 'At least one must be available',
    });
  }

  for (const unit of truckUnits) {
    if (data[`available_truck_${unit}`] === true) {
      // When switch is on, rate should not be empty
      if (
        data[`truck_${unit}`] === undefined ||
        data[`truck_${unit}`] === null
      ) {
        ctx.addIssue({
          path: [`truck_${unit}`],
          code: z.ZodIssueCode.custom,
          message: 'required',
        });
      }
    }
  }
});
