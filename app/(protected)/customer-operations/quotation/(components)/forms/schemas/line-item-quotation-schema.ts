import z from 'zod';

import { QUOTE_TYPE } from '@/lib/types/quotation-enums';

const TruckString = z.string();

export const NewQuotationLineItemFormSchema = z
  .object({
    quoteType: z.nativeEnum(QUOTE_TYPE, { message: 'Required' }),
    address: z.string().nonempty({ message: 'Required' }),
    productId: z.coerce.number().min(1, { message: 'Required' }),
    quarrySupplierId: z.coerce.number().min(1, { message: 'Required' }),
    supplierProductName: z.string().nonempty({ message: 'Required' }),
    productCostUom: z.string().nonempty({ message: 'Required' }),
    productCostQty: z.coerce.number().optional(),
    productCostPrice: z.coerce.number().positive({ message: 'Must be greater than 0' }),
    productSellUom: z.string().nonempty({ message: 'Required' }),
    productSellQty: z.coerce.number().positive({ message: 'Must be greater than 0' }),
    productSellPrice: z.coerce.number().positive({ message: 'Must be greater than 0' }),
    truckType: TruckString,
    truckCostUom: TruckString,
    truckCostQty: z.coerce.number().optional(),
    truckCostPrice: z.coerce.number().optional(),
    truckSellUom: TruckString,
    truckSellQty: z.coerce.number().optional(),
    truckSellPrice: z.coerce.number().optional(),
    totalProductCostPrice: z.coerce.number().min(0, { message: 'Cannot be less than 0' }),
    totalTruckCostPrice: z.coerce.number().min(0, { message: 'Cannot be less than 0' }),
    totalProductSellPrice: z.coerce.number().min(0, { message: 'Cannot be less than 0' }),
    totalTruckSellPrice: z.coerce.number().min(0, { message: 'Cannot be less than 0' }),

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
    if (values.truckCostUom && (values.truckCostPrice ?? 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckCostPrice'],
        message: 'Must be greater than 0',
      });
    }
    if (!values.truckSellUom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckSellUom'],
        message: 'Required',
      });
    }
    if (values.truckSellUom && (values.truckSellPrice ?? 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckSellPrice'],
        message: 'Must be greater than 0',
      });
    }
    if ((values.totalTruckCostPrice || 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalTruckCostPrice'],
        message: 'Required',
      });
    }
    if ((values.totalTruckSellPrice || 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalTruckSellPrice'],
        message: 'Required',
      });
    }
    if ((values.truckSellUom === 'HOURLY' || values.truckSellUom === 'LOAD' || values.truckSellUom === 'KM') && !values.truckSellQty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckSellQty'],
        message: 'Required',
      });
    }
    if ((values.truckCostUom === 'HOURLY' || values.truckCostUom === 'LOAD' || values.truckCostUom === 'KM') && !values.truckCostQty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['truckCostQty'],
        message: 'Required',
      });
    }
  });
