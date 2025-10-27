import z from 'zod';

export const NewQuotationLineItemFormSchema = z.object({
  product_id: z.coerce.number().min(1, { message: 'Required' }),
  quarry_id: z.coerce.number().min(1, { message: 'Required' }),
  supplier_product_name: z.string().nonempty({ message: 'Required' }),
  product_cost_uom: z.string().nonempty({ message: 'Required' }),
  product_cost_qty: z.coerce.number().min(1, { message: 'Required' }),
  product_cost_price: z.coerce.number().min(1, { message: 'Required' }),
  product_sell_uom: z.string().nonempty({ message: 'Required' }),
  product_sell_qty: z.coerce.number().min(1, { message: 'Required' }),
  product_sell_price: z.coerce.number().min(1, { message: 'Required' }),
  truck_type: z.string().nonempty({ message: 'Required' }),
  truck_cost_uom: z.string().nonempty({ message: 'Required' }),
  truck_cost_qty: z.coerce.number().min(1, { message: 'Required' }),
  truck_cost_price: z.coerce.number().min(1, { message: 'Required' }),
  truck_sell_uom: z.string().nonempty({ message: 'Required' }),
  truck_sell_qty: z.coerce.number().min(1, { message: 'Required' }),
  truck_sell_price: z.coerce.number().min(1, { message: 'Required' }),
  required_loads: z.coerce.number().min(1, { message: 'Required' }),
  total_product_cost_price: z.coerce.number().min(1, { message: 'Required' }),
  total_truck_cost_price: z.coerce.number().min(1, { message: 'Required' }),
  total_product_sell_price: z.coerce.number().min(1, { message: 'Required' }),
  total_truck_sell_price: z.coerce.number().min(1, { message: 'Required' }),

  // Will come back to Gross Profit once we decide how to handle it
  gross_profit: z.coerce.number().optional(),
});
