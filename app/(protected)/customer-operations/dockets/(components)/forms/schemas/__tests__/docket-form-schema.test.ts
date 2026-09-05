import { describe, expect, test } from 'vitest';
import { getDocketFormSchema } from '../docket-form-schema';

const baseCustomerDocketValues = {
  jobId: 1,
  jobLineItemId: 1,
  plannedLoadSize: 10,
  pickUpAddressId: 'addr-1',
  deliveryAddressId: 'addr-2',
  deliveryCollectionDate: new Date('2026-09-05'),
  deliveryCollectionStartTime: '09:00',
  deliveryCollectionEndTime: '11:00',
  customerContactName: 'Site Contact',
  customerContactPhone: '+61411222333',
  docketEmail: 'armin@gmail.com, smita.nair@socoro.com.au',
  jobLineItemType: 'COLLECTION',
};

describe('getDocketFormSchema docket email', () => {
  test('allows customer dockets when at least one email remains', () => {
    const result = getDocketFormSchema(false).safeParse({
      ...baseCustomerDocketValues,
      docketEmail: 'smita.nair@socoro.com.au',
    });
    expect(result.success).toBe(true);
  });

  test('rejects customer dockets when all emails are removed', () => {
    const result = getDocketFormSchema(false).safeParse({
      ...baseCustomerDocketValues,
      docketEmail: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('docketEmail'),
      );
      expect(issue?.message).toBe('At least one docket email is required');
    }
  });

  test('allows internal transfer dockets without email', () => {
    const result = getDocketFormSchema(true).safeParse({
      ...baseCustomerDocketValues,
      customerContactName: '',
      customerContactPhone: '',
      docketEmail: '',
    });
    expect(result.success).toBe(true);
  });
});
