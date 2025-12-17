import z from 'zod';

export const NewQuotationLineItemFormSchema = z.object({
  productId: z.coerce.number().min(1, { message: 'Required' }),
  quarrySupplierId: z.coerce.number().min(1, { message: 'Required' }),
  supplierProductName: z.string().nonempty({ message: 'Required' }),
  productCostUom: z.string().nonempty({ message: 'Required' }),
  productCostQty: z.coerce.number().min(1, { message: 'Required' }),
  productCostPrice: z.coerce.number().min(1, { message: 'Required' }),
  productSellUom: z.string().nonempty({ message: 'Required' }),
  productSellQty: z.coerce.number().min(1, { message: 'Required' }),
  productSellPrice: z.coerce.number().min(1, { message: 'Required' }),
  truckType: z.string().nonempty({ message: 'Required' }),
  truckCostUom: z.string().nonempty({ message: 'Required' }),
  truckCostQty: z.coerce.number().min(1, { message: 'Required' }),
  truckCostPrice: z.coerce.number().min(1, { message: 'Required' }),
  truckSellUom: z.string().nonempty({ message: 'Required' }),
  truckSellQty: z.coerce.number().min(1, { message: 'Required' }),
  truckSellPrice: z.coerce.number().min(1, { message: 'Required' }),
  requiredLoads: z.coerce.number().min(1, { message: 'Required' }),
  totalProductCostPrice: z.coerce.number().min(1, { message: 'Required' }),
  totalTruckCostPrice: z.coerce.number().min(1, { message: 'Required' }),
  totalProductSellPrice: z.coerce.number().min(1, { message: 'Required' }),
  totalTruckSellPrice: z.coerce.number().min(1, { message: 'Required' }),

  // Will come back to Gross Profit once we decide how to handle it
  grossProfit: z.coerce.number().optional(),
});
