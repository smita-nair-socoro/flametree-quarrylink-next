import z from 'zod';

const pricingUnits = ['Tn', 'M3', 'Kg', 'Bulka'] as const;
const truckRateSuffixes = [
  'TnRate',
  'M3Rate',
  'KgRate',
  'BulkaRate',
  'HourlyRate',
  'LoadRate',
  'KmRate',
] as const;

const Base = z.object({
  quarrySupplierId: z.coerce
    .number({ required_error: 'Supplier is required' })
    .min(1, { message: 'Supplier is required' }),
  supplierProductName: z
    .string()
    .nonempty({ message: 'Required' })
    .min(1, { message: 'Product Name must be at least 1 character' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  supplierProductCode: z.string().nonempty({ message: 'Required' }),
  densityTonnagePerM3: z.coerce
    .number()
    .positive({ message: 'Density must be greater than 0' }),

  departmentId: z.number().optional(),

  costPriceTn: z.coerce.number().optional(),
  sellPriceTn: z.coerce.number().optional(),
  costPriceM3: z.coerce.number().optional(),
  sellPriceM3: z.coerce.number().optional(),
  costPriceKg: z.coerce.number().optional(),
  sellPriceKg: z.coerce.number().optional(),
  costPriceBulka: z.coerce.number().optional(),
  sellPriceBulka: z.coerce.number().optional(),
  marginTn: z.coerce.number().optional(),
  marginM3: z.coerce.number().optional(),
  marginKg: z.coerce.number().optional(),
  marginBulka: z.coerce.number().optional(),
  availableForSaleTn: z.boolean(),
  availableForSaleM3: z.boolean(),
  availableForSaleKg: z.boolean(),
  availableForSaleBulka: z.boolean(),

  truckTnRate: z.coerce.number().optional(),
  truckM3Rate: z.coerce.number().optional(),
  truckHourlyRate: z.coerce.number().optional(),
  truckLoadRate: z.coerce.number().optional(),
  truckKmRate: z.coerce.number().optional(),
  truckKgRate: z.coerce.number().optional(),
  truckBulkaRate: z.coerce.number().optional(),
  availableTruckTnRate: z.boolean(),
  availableTruckM3Rate: z.boolean(),
  availableTruckHourlyRate: z.boolean(),
  availableTruckLoadRate: z.boolean(),
  availableTruckKmRate: z.boolean(),
  availableTruckKgRate: z.boolean(),
  availableTruckBulkaRate: z.boolean(),
});

export const NewSupplierFormSchema = Base.superRefine((data, ctx) => {
  if (data.availableForSaleTn !== true) {
    ctx.addIssue({
      path: ['availableForSaleTn'],
      code: z.ZodIssueCode.custom,
      message: 'TN must always be available',
    });
  }

  for (const unit of pricingUnits) {
    const availableKey = `availableForSale${unit}` as keyof typeof data;
    const costKey = `costPrice${unit}` as keyof typeof data;
    const sellKey = `sellPrice${unit}` as keyof typeof data;

    if (data[availableKey] === true) {
      if (data[costKey] === undefined || data[costKey] === null) {
        ctx.addIssue({
          path: [costKey],
          code: z.ZodIssueCode.custom,
          message: 'required',
        });
      }
      if (data[sellKey] === undefined || data[sellKey] === null) {
        ctx.addIssue({
          path: [sellKey],
          code: z.ZodIssueCode.custom,
          message: 'required',
        });
      }
    }
  }

  const hasAnyTruckRateAvailable = truckRateSuffixes.some(
    (suffix) => data[`availableTruck${suffix}` as keyof typeof data] === true,
  );

  if (!hasAnyTruckRateAvailable) {
    ctx.addIssue({
      path: ['availableTruckTnRate'],
      code: z.ZodIssueCode.custom,
      message: 'At least one must be available',
    });
  }

  for (const suffix of truckRateSuffixes) {
    const availableKey = `availableTruck${suffix}` as keyof typeof data;
    const rateKey = `truck${suffix}` as keyof typeof data;

    if (data[availableKey] === true) {
      if (data[rateKey] === undefined || data[rateKey] === null) {
        ctx.addIssue({
          path: [rateKey],
          code: z.ZodIssueCode.custom,
          message: 'required',
        });
      }
    }
  }
});
