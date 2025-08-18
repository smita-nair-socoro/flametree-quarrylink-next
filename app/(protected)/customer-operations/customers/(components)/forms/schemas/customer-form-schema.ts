import z from 'zod';
import isValidABN from 'is-valid-abn';
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
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Invalid email format',
  });

// Parts common to both customer types
const Base = z.object({
  customer_type: z.string(),
  payment_type: z.string(),
  contact_person_name: z.string().trim().min(2, 'At least 2 characters'),
  contact_person_email: EmailOptional,
  contact_person_phone: PhoneOptional,

  // business_* can be overridden by contact person details per your UI,
  // but for Business customers we'll require them below.
  business_name: z.string().trim().optional(),
  business_email: z.string().trim().optional(),
  business_phone: z.string().trim().optional(),

  // ABN is conditioned by customer_type (below)
  abn: z.string().trim(),

  credit_limit: z.coerce.number().nonnegative('Credit limit must be ≥ 0'),
  payment_terms: z.string().trim().min(1, 'Required'),
  account_manager: z.string().trim().min(1, 'Required'),
  billing_address: z.string().trim().min(1, 'Required'),

  // TODO: check if these are done in frontend or backend
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  created_by: z.string().optional(),
  last_modified_by: z.string().optional(),
});

// Export the schema with conditional validation using superRefine
export const NewCustomerFormSchema = Base.superRefine((data, ctx) => {
  // Customer type specific validations
  if (data.customer_type === 'Business') {
    // ABN must be valid for Business customers
    if (!isValidABN(data.abn)) {
      ctx.addIssue({
        path: ['abn'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid ABN',
      });
    }

    // Business fields are required for Business customers
    if (!data.business_name || data.business_name.trim().length < 2) {
      ctx.addIssue({
        path: ['business_name'],
        code: z.ZodIssueCode.custom,
        message: 'Business name is required',
      });
    }

    if (!data.business_email || data.business_email.trim().length === 0) {
      ctx.addIssue({
        path: ['business_email'],
        code: z.ZodIssueCode.custom,
        message: 'Business email is required',
      });
    } else if (!z.string().email().safeParse(data.business_email).success) {
      ctx.addIssue({
        path: ['business_email'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid business email format',
      });
    }

    if (!data.business_phone || data.business_phone.trim().length === 0) {
      ctx.addIssue({
        path: ['business_phone'],
        code: z.ZodIssueCode.custom,
        message: 'Business phone is required',
      });
    } else if (!isValidPhoneNumber(data.business_phone)) {
      ctx.addIssue({
        path: ['business_phone'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid business phone format',
      });
    }
  } else if (data.customer_type === 'Individual') {
    // ABN must be "N/A" for Individual customers
    if (data.abn !== 'N/A') {
      ctx.addIssue({
        path: ['abn'],
        code: z.ZodIssueCode.custom,
        message: 'ABN must be "N/A" for Individual customers',
      });
    }
  }
});
