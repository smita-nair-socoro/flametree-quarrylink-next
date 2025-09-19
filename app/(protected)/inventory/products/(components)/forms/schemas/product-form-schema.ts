import z from 'zod';

export const NewProductFormSchema = z.object({
  product_name: z
    .string()
    .min(2, { message: 'Product Name must be at least 2 characters.' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  product_code: z.string().nonempty({ message: 'Required' }),
  material_type: z.string().trim().min(1, { message: 'Required' }),
  product_description: z.string().optional(),
  density_tonnage_per_m3: z.coerce.number().nonnegative(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  created_by: z.string(),
  last_modified_by: z.string(),
});
