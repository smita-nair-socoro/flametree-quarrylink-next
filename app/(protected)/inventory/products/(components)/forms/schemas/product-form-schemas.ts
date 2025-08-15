import z from 'zod';

export const NewProductFormSchema = z.object({
  product_name: z
    .string()
    .min(2, { message: 'Product Name must be at least 2 characters.' })
    .max(100, { message: "Product Name can't be more than 100 characters" }),
  product_code: z.string().optional(),
  category: z
    .array(z.string())
    .min(1, { message: 'Select at least one category.' }),
  description: z.string().optional(),
  quarry_sources: z.string().nonempty({ message: 'Required' }),
  cost_price_per_tonne: z.string(),
  sell_price_per_tonne: z.string(),
});

export const NewCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Category Name must be at least 2 characters.' })
    .max(100, { message: "Category Name can't be more than 100 characters" })
    .regex(/^[A-Za-z0-9 _-]+$/, {
      message: 'Use only letters, numbers, spaces, dashes or underscores.',
    }),
});

export const NewQuarryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Quarry Name must be at least 2 characters.' })
    .max(100, { message: "Quarry Name can't be more than 100 characters" })
    .regex(/^[A-Za-z0-9 _-]+$/, {
      message: 'Use only letters, numbers, spaces, dashes or underscores.',
    }),
});
