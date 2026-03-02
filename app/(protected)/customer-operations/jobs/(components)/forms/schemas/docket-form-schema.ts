import z from 'zod';

export const DocketFormSchema = z.object({
  jobId: z.coerce.number().min(1, { message: 'Required' }),
  productId: z.coerce.number().min(1, { message: 'Required' }),
  quarrySupplierId: z.coerce.number().min(1, { message: 'Required' }),
  loadSize: z.coerce.number().positive({ message: 'Must be greater than 0' }),
});
