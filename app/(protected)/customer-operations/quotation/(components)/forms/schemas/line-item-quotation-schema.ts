import z from 'zod';

import { QUOTE_TYPE } from '@/lib/types/quotation-enums';

const TruckString = z.string();

export const NewQuotationLineItemFormSchema = z
  .object({
    quoteType: z.nativeEnum(QUOTE_TYPE, { message: 'Required' }),
    productId: z.coerce.number().min(1, { message: 'Required' }),
    quarrySupplierId: z.coerce.number().min(1, { message: 'Required' }),
    supplierProductName: z.string().nonempty({ message: 'Required' }),
    productCostUom: z.string().nonempty({ message: 'Required' }),
    productCostQty: z.coerce.number().min(1, { message: 'Required' }),
    productCostPrice: z.coerce.number().min(0, { message: 'Required' }),
    productSellUom: z.string().nonempty({ message: 'Required' }),
    productSellQty: z.coerce.number().min(1, { message: 'Required' }),
    productSellPrice: z.coerce.number().min(0, { message: 'Required' }),
    truckType: TruckString,
    truckCostUom: TruckString,
    truckCostQty: z.coerce.number().min(0),
    truckCostPrice: z.coerce.number().min(0),
    truckSellUom: TruckString,
    truckSellQty: z.coerce.number().min(0),
    truckSellPrice: z.coerce.number().min(0),
    totalProductCostPrice: z.coerce.number().min(0),
    totalTruckCostPrice: z.coerce.number().min(0),
    totalProductSellPrice: z.coerce.number().min(0),
    totalTruckSellPrice: z.coerce.number().min(0),

    // Will come back to Gross Profit once we decide how to handle it
    grossProfit: z.coerce.number().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.quoteType === QUOTE_TYPE.COLLECTION) return;

    if (!values.truckType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckType'],
        message: 'Required',
      });
    }
    if (!values.truckCostUom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckCostUom'],
        message: 'Required',
      });
    }
    if ((values.truckCostQty || 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckCostQty'],
        message: 'Required',
      });
    }
    if ((values.truckCostPrice || 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckCostPrice'],
        message: 'Required',
      });
    }
    if (!values.truckSellUom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckSellUom'],
        message: 'Required',
      });
    }
    if ((values.truckSellQty || 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckSellQty'],
        message: 'Required',
      });
    }
    if ((values.truckSellPrice || 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckSellPrice'],
        message: 'Required',
      });
    }
    if ((values.totalTruckCostPrice || 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalTruckCostPrice'],
        message: 'Required',
      });
    }
    if ((values.totalTruckSellPrice || 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalTruckSellPrice'],
        message: 'Required',
      });
    }
  });
