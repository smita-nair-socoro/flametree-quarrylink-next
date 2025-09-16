import z from 'zod';
import isValidABN from 'is-valid-abn';
import { isValidPhoneNumber } from 'react-phone-number-input';

const PhoneRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Phone number is required' })
  .refine((v) => !v || isValidPhoneNumber(v), {
    message: 'Invalid phone number',
  });
const EmailRequired = z
  .string()
  .trim()
  .nonempty({ message: 'Email is required' })
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Invalid email format',
  });

// Parts common to both customer types
const Base = z.object({
  customer_type: z.string(),
  payment_type: z.string(),
  contact_person_name: z
    .string()
    .trim()
    .nonempty({ message: 'Contact Person Name is required' })
    .max(255, 'Maximum 255 characters')
    .min(2, 'At least 2 characters'),
  contact_person_email: EmailRequired,
  contact_person_phone: PhoneRequired,

  // Business fields are optional in base schema but conditionally validated
  business_name: z
    .string()
    .trim()
    .max(255, 'Maximum 255 characters')
    .optional(),
  business_email: z.string().trim().optional(),
  business_phone: z.string().trim().optional(),

  // ABN is conditioned by customer_type (below)
  abn: z.string().trim().optional(),

  credit_limit: z.coerce
    .number()
    .nonnegative('Credit limit must be ≥ 0')
    .optional(),
  payment_terms_day: z.coerce
    .number()
    .int('Decimal numbers are not allowed')
    .optional(),
  payment_terms: z.string().trim().optional(),
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
  // Payment type specific validations
  if (data.payment_type === 'CREDIT') {
    // Credit limit is mandatory for credit payment type
    if (
      data.credit_limit === undefined ||
      data.credit_limit === null ||
      data.credit_limit === 0
    ) {
      ctx.addIssue({
        path: ['credit_limit'],
        code: z.ZodIssueCode.custom,
        message: 'Credit limit is required for credit payment type',
      });
    } else if (data.credit_limit < 0) {
      ctx.addIssue({
        path: ['credit_limit'],
        code: z.ZodIssueCode.custom,
        message: 'Credit limit must be ≥ 0',
      });
    } else if (data.credit_limit > 1000000) {
      ctx.addIssue({
        path: ['credit_limit'],
        code: z.ZodIssueCode.custom,
        message: 'Maximum is $1,000,000',
      });
    }

    // Payment terms day validation
    if (
      data.payment_terms &&
      data.payment_terms_day !== undefined &&
      data.payment_terms_day !== null
    ) {
      if (
        data.payment_terms === 'of the following month' ||
        data.payment_terms === 'of the current month'
      ) {
        if (data.payment_terms_day < 1 || data.payment_terms_day > 31) {
          ctx.addIssue({
            path: ['payment_terms_day'],
            code: z.ZodIssueCode.custom,
            message: 'Enter a value between 1 and 31',
          });
        }
      } else if (
        data.payment_terms === 'day(s) after the invoice date' ||
        data.payment_terms === 'day(s) after the invoice month'
      ) {
        if (data.payment_terms_day > 99) {
          ctx.addIssue({
            path: ['payment_terms_day'],
            code: z.ZodIssueCode.custom,
            message: 'Enter a value between 0 and 99',
          });
        }
      }
    }
  }

  // Customer type specific validations
  if (data.customer_type === 'BUSINESS') {
    // ABN must be valid for Business customers
    if (!data.abn || !isValidABN(data.abn)) {
      ctx.addIssue({
        path: ['abn'],
        code: z.ZodIssueCode.custom,
        message: data.abn ? 'Invalid ABN' : 'ABN is required',
      });
    }

    // Business name is required for Business customers
    if (!data.business_name || data.business_name.trim().length < 2) {
      ctx.addIssue({
        path: ['business_name'],
        code: z.ZodIssueCode.custom,
        message: !data.business_name
          ? 'Business name is required'
          : 'At least 2 characters',
      });
    }

    // Business email is required for Business customers
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

    // Business phone is required for Business customers
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

    if (!data.payment_terms || data.payment_terms.trim().length === 0) {
      ctx.addIssue({
        path: ['payment_terms'],
        code: z.ZodIssueCode.custom,
        message: 'Payment terms is required',
      });
    }

    // Credit limit validation for Business customers (only if not already validated by payment type)
    if (data.payment_type !== 'credit') {
      if (
        data.credit_limit === undefined ||
        data.credit_limit === null ||
        data.credit_limit < 0
      ) {
        ctx.addIssue({
          path: ['credit_limit'],
          code: z.ZodIssueCode.custom,
          message: 'Credit limit must be ≥ 0',
        });
      }
    }
  } else if (data.customer_type === 'INDIVIDUAL') {
    // For Individual customers, ABN should be "N/A" or empty
    if (data.abn && data.abn !== 'N/A' && data.abn.trim() !== '') {
      ctx.addIssue({
        path: ['abn'],
        code: z.ZodIssueCode.custom,
        message: 'ABN must be "N/A" for Individual customers',
      });
    }

    // Optional validation: if business email is provided, it should be valid
    if (
      data.business_email &&
      data.business_email.trim() !== '' &&
      !z.string().email().safeParse(data.business_email).success
    ) {
      ctx.addIssue({
        path: ['business_email'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid business email format',
      });
    }

    // Optional validation: if business phone is provided, it should be valid
    if (
      data.business_phone &&
      data.business_phone.trim() !== '' &&
      !isValidPhoneNumber(data.business_phone)
    ) {
      ctx.addIssue({
        path: ['business_phone'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid business phone format',
      });
    }

    // Optional validation: if credit limit is provided, it should be valid (only if not already validated by payment type)
    if (data.payment_type !== 'credit') {
      if (
        data.credit_limit !== undefined &&
        data.credit_limit !== null &&
        data.credit_limit < 0
      ) {
        ctx.addIssue({
          path: ['credit_limit'],
          code: z.ZodIssueCode.custom,
          message: 'Credit limit must be ≥ 0',
        });
      }
    }
  }
});
