import z from 'zod';

export const NewProductFormSchema = z.object({
  productName: z
    .string()
    .min(2, { message: 'Product Name must be at least 2 characters.' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  productCode: z.string().nonempty({ message: 'Required' }),
  materialId: z.coerce
    .number({ required_error: 'Material Type is required' })
    .min(1, { message: 'Material Type is required' }),
  productDescription: z.string().optional(),
  densityTonnagePerM3: z.coerce
    .number()
    .positive({ message: 'Density must be greater than 0' }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});
