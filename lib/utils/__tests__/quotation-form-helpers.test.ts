import { describe, expect, test } from 'vitest';
import { quotationToFormValues } from '../quotation-form-helpers';
import type { Quotation } from '@/lib/types/quotation';

function buildQuotation(overrides: Partial<Quotation> = {}): Quotation {
  return {
    customerId: 1,
    accountManagerSub: 'sub-1',
    projectName: 'Project A',
    deliveryStartDate: '2026-01-15',
    deliveryWindowStart: '2026-01-15T08:00:00',
    deliveryWindowEnd: '2026-01-15T16:00:00',
    expiryDate: '2026-02-01',
    phone: '0412345678',
    emailRecipients: ['a@example.com', 'b@example.com'],
    ...overrides,
  } as unknown as Quotation;
}

describe('quotationToFormValues', () => {
  test('returns blank defaults for a brand-new quotation', () => {
    expect(quotationToFormValues(null, false)).toEqual({
      customerId: 0,
      accountManagerSub: '',
      projectName: '',
      deliveryStartDate: undefined,
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
      expiryDate: undefined,
      phone: '',
      receiptEmail: '',
    });
  });

  test('maps an existing quotation to form values', () => {
    const result = quotationToFormValues(buildQuotation(), true);
    expect(result.customerId).toBe(1);
    expect(result.accountManagerSub).toBe('sub-1');
    expect(result.projectName).toBe('Project A');
    expect(result.deliveryStartDate).toBeInstanceOf(Date);
    expect(result.expiryDate).toBeInstanceOf(Date);
    expect(result.deliveryWindowStart).toBe('08:00');
    expect(result.deliveryWindowEnd).toBe('16:00');
    expect(result.receiptEmail).toBe('a@example.com,b@example.com');
    expect(result.phone).toBe('+61412345678');
  });

  test('when editing without a quotation, still maps through the null-safe defaults', () => {
    const result = quotationToFormValues(null, true);
    expect(result.customerId).toBe(0);
    expect(result.deliveryWindowStart).toBe('');
    expect(result.receiptEmail).toBe('');
  });

  test('falls back to customer address phone when quotation phone is missing', () => {
    const quotation = buildQuotation({
      phone: '',
      customerWithAddressResponseDto: {
        phone: '0498765432',
      } as unknown as Quotation['customerWithAddressResponseDto'],
    });
    const result = quotationToFormValues(quotation, true);
    expect(result.phone).toBe('+61498765432');
  });

  test('leaves date fields undefined when not provided', () => {
    const quotation = buildQuotation({
      deliveryStartDate: null,
      expiryDate: null,
    });
    const result = quotationToFormValues(quotation, true);
    expect(result.deliveryStartDate).toBeUndefined();
    expect(result.expiryDate).toBeUndefined();
  });
});
