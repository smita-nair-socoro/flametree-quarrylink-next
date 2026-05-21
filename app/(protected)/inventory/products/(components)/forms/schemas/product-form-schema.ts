import z from 'zod';

export const NewProductFormSchema = z.object({
  product_name: z
    .string()
    .min(2, { message: 'Product Name must be at least 2 characters.' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  product_code: z.string().nonempty({ message: 'Required' }),
  material_id: z.coerce
    .number({ required_error: 'Material Type is required' })
    .min(1, { message: 'Material Type is required' }),
  product_description: z.string().optional(),
  density_tonnage_per_m3: z.coerce
    .number()
    .positive({ message: 'Density must be greater than 0' }),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  created_by: z.string().optional(),
  last_modified_by: z.string().optional(),
});
