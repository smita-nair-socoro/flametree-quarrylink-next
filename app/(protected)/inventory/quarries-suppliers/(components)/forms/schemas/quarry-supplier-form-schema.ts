import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const PhoneOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });

const EmailOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || v === '' || z.string().email().safeParse(v).success, {
    message: 'Invalid email format',
  });

// Base schema with common fields
const Base = z.object({
  type: z.enum(['QUARRY', 'SUPPLIER'], {
    required_error: 'Type is required',
  }),

  // Basic Information
  quarry_name: z.string().trim().optional(),
  supplier_name: z.string().trim().optional(),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) =>
        !v ||
        v === '' ||
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v),
      {
        message: 'Invalid website URL',
      }
    ),
  email: EmailOptional,
  phone: PhoneOptional,

  // Location Information
  address: z.string().trim().min(1, 'Address is required'),

  // Contact Person
  contact_person_name: z.string().trim().optional(),
  contact_person_phone: PhoneOptional,
  contact_person_email: EmailOptional,

  // Operational Information
  opening_closing_times: z.string().trim().optional(),
  weighbridge_info: z.string().trim().optional(),
  notes: z.string().trim().optional(),

  // Audit fields
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  created_by: z.string().optional(),
  last_modified_by: z.string().optional(),
});

// Export the schema with conditional validation using superRefine
export const QuarrySupplierFormSchema = Base.superRefine((data, ctx) => {
  // Type-specific validations
  if (data.type === 'QUARRY') {
    // Quarry Name is required for Quarry type
    if (!data.quarry_name || data.quarry_name.trim().length === 0) {
      ctx.addIssue({
        path: ['quarry_name'],
        code: z.ZodIssueCode.custom,
        message: 'Quarry name is required',
      });
    } else if (data.quarry_name.trim().length < 2) {
      ctx.addIssue({
        path: ['quarry_name'],
        code: z.ZodIssueCode.custom,
        message: 'At least 2 characters',
      });
    } else if (data.quarry_name.trim().length > 256) {
      ctx.addIssue({
        path: ['quarry_name'],
        code: z.ZodIssueCode.custom,
        message: 'Maximum 256 characters',
      });
    } else if (!/^[a-zA-Z0-9\s,.&-]+$/.test(data.quarry_name)) {
      ctx.addIssue({
        path: ['quarry_name'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid characters',
      });
    }
  } else if (data.type === 'SUPPLIER') {
    // Supplier Name is required for Supplier type
    if (!data.supplier_name || data.supplier_name.trim().length === 0) {
      ctx.addIssue({
        path: ['supplier_name'],
        code: z.ZodIssueCode.custom,
        message: 'Supplier name is required',
      });
    } else if (data.supplier_name.trim().length < 2) {
      ctx.addIssue({
        path: ['supplier_name'],
        code: z.ZodIssueCode.custom,
        message: 'At least 2 characters',
      });
    } else if (data.supplier_name.trim().length > 256) {
      ctx.addIssue({
        path: ['supplier_name'],
        code: z.ZodIssueCode.custom,
        message: 'Maximum 256 characters',
      });
    } else if (!/^[a-zA-Z0-9\s,.&-]+$/.test(data.supplier_name)) {
      ctx.addIssue({
        path: ['supplier_name'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid characters',
      });
    }
  }
});
