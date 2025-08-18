import z from 'zod';
import isValidABN from 'is-valid-abn';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const NewCustomerFormSchema = z
  .object({
    customer_type: z.string().nonempty({ message: 'Required' }),
    payment_type: z.string().nonempty({ message: 'Required' }),
    business_name: z.string().min(2, { message: 'At least 2 characters' }),
    business_email: z.string().email({ message: 'Invalid email address' }),
    business_phone: z
      .union([z.string(), z.undefined()])
      .refine((val) => !val || isValidPhoneNumber(val), {
        message: 'Invalid phone number',
      }),
    abn: z.string().nonempty({ message: 'Required' }),
    contact_person_name: z
      .string()
      .min(2, { message: 'At least 2 characters' }),
    contact_person_email: z
      .string()
      .email({ message: 'Invalid email address' }),
    contact_person_phone: z
      .union([z.string(), z.undefined()])
      .refine((val) => !val || isValidPhoneNumber(val), {
        message: 'Invalid phone number',
      }),
    credit_limit: z.coerce.number().nonnegative({
      message: 'Credit limit must be greater than or equal to 0',
    }),
    payment_terms: z.string().nonempty({ message: 'Required' }),
    account_manager: z.string().nonempty({ message: 'Required' }),
    billing_address: z.string().nonempty({ message: 'Required' }),
    created_at: z.date(),
    updated_at: z.date(),
    created_by: z.string(),
    last_modified_by: z.string(),
  })
  .refine(
    (data) => {
      // For Business customers, ABN must be valid
      // For Individual customers, ABN can be "N/A"
      if (data.customer_type === 'Business') {
        return isValidABN(data.abn);
      } else if (data.customer_type === 'Individual') {
        return data.abn === 'N/A';
      }
      return true;
    },
    {
      message:
        'Invalid ABN for Business customers or must be "N/A" for Individual customers',
      path: ['abn'],
    }
  )
  .refine(
    (data) => {
      // For Pre-paid customers, credit limit must be 0
      if (data.payment_type === 'Prepaid') {
        return data.credit_limit === 0;
      }
      // For Credit customers, credit limit must be greater than 0
      if (data.payment_type === 'Credit') {
        return data.credit_limit > 0;
      }
      return true;
    },
    {
      message:
        'Credit limit is required and must be greater than 0 for Credit customers, or must be 0 for Pre-paid customers',
      path: ['credit_limit'],
    }
  );
