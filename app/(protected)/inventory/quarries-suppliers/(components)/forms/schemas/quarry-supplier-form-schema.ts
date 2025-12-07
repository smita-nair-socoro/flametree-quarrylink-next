import z from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const PhoneRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Phone number is required' })
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });

const PhoneOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });

const EmailRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Email is required' })
  .max(256, 'Maximum 256 characters')
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Invalid email format',
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
  name: z.string().trim().optional(),
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
  email: EmailRequired,
  phone: PhoneRequired,

  // Location Information
  address: z.string().trim().min(1, 'Address is required'),

  // Contact Person
  contact_person_name: z.string().trim().optional(),
  contact_person_phone: PhoneOptional,
  contact_person_email: EmailOptional,

  // Operational Information
  opening_closing_info: z.string().trim().optional(),
  weighbridge_info: z.string().trim().optional(),
  notes: z.string().trim().optional(),

  // Audit fields - these are managed by backend, so we accept any value
  created_at: z.any().optional(),
  updated_at: z.any().optional(),
  created_by: z.string().optional(),
  last_modified_by: z.string().optional(),
});

// Export the schema with conditional validation using superRefine
export const QuarrySupplierFormSchema = Base.superRefine((data, ctx) => {
  // Name is required for both types
  if (!data.name || data.name.trim().length === 0) {
    ctx.addIssue({
      path: ['name'],
      code: z.ZodIssueCode.custom,
      message: data.type === 'QUARRY' ? 'Quarry name is required' : 'Supplier name is required',
    });
  } else if (data.name.trim().length < 2) {
    ctx.addIssue({
      path: ['name'],
      code: z.ZodIssueCode.custom,
      message: 'At least 2 characters',
    });
  } else if (data.name.trim().length > 256) {
    ctx.addIssue({
      path: ['name'],
      code: z.ZodIssueCode.custom,
      message: 'Maximum 256 characters',
    });
  } else if (!/^[a-zA-Z0-9\s,.&-]+$/.test(data.name)) {
    ctx.addIssue({
      path: ['name'],
      code: z.ZodIssueCode.custom,
      message: 'Invalid characters',
    });
  }
});
