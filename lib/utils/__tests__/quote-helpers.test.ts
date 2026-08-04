import { describe, expect, test } from 'vitest';
import {
  formatQuoteStatus,
  transformFormDataToQuoteDto,
  calculateQuotationPricing,
} from '../quote-helpers';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';
import { centsToDollars } from '../currency';
import { formatCurrency } from '../tenant-config-helper';
import type { QuotationLineItem } from '@/lib/types/quotation';

describe('formatQuoteStatus', () => {
  test('maps known statuses to display labels', () => {
    expect(formatQuoteStatus(QUOTE_STATUS.CONVERTED_TO_JOB)).toBe(
      'CONVERTED TO JOB',
    );
    expect(formatQuoteStatus(QUOTE_STATUS.DRAFT)).toBe('DRAFT');
    expect(formatQuoteStatus(QUOTE_STATUS.PENDING)).toBe('PENDING');
    expect(formatQuoteStatus(QUOTE_STATUS.APPROVED)).toBe('APPROVED');
    expect(formatQuoteStatus(QUOTE_STATUS.EXPIRED)).toBe('EXPIRED');
    expect(formatQuoteStatus(QUOTE_STATUS.DECLINED)).toBe('DECLINED');
    expect(formatQuoteStatus(QUOTE_STATUS.ARCHIVED)).toBe('ARCHIVED');
  });

  test('replaces underscores with spaces for unknown statuses', () => {
    expect(formatQuoteStatus('SOME_OTHER_STATUS')).toBe('SOME OTHER STATUS');
  });
});

describe('transformFormDataToQuoteDto', () => {
  const additionalData = {
    customerName: 'Acme Co',
    accountManagerName: 'Sam Manager',
    accountManagerSub: 'sub-1',
    quoteNumber: 'Q-100',
    lineItemsCount: 3,
  };

  test('throws when expiry date is missing', () => {
    expect(() =>
      transformFormDataToQuoteDto({ customerId: 1 }, additionalData),
    ).toThrow('Expiry date is required');
  });

  test('transforms complete form data into a QuotationDTO', () => {
    const formData = {
      customerId: 5,
      email: 'test@example.com',
      phone: '+61412345678',
      projectName: 'Driveway job',
      deliveryStartDate: new Date(2026, 0, 10),
      expiryDate: new Date(2026, 0, 20),
      deliveryWindowStart: '08:00',
      deliveryWindowEnd: '16:00',
    };

    const result = transformFormDataToQuoteDto(formData, additionalData);

    expect(result.quoteNumber).toBe('Q-100');
    expect(result.customerId).toBe(5);
    expect(result.customerName).toBe('Acme Co');
    expect(result.email).toBe('test@example.com');
    expect(result.phone).toBe('+61 412 345 678');
    expect(result.projectName).toBe('Driveway job');
    expect(result.quoteStatus).toBe(QUOTE_STATUS.DRAFT);
    expect(result.expiryDate).toBe('2026-01-20T00:00:00.000');
    expect(result.deliveryStartDate).toBe('2026-01-10T00:00:00.000');
    expect(result.deliveryWindowStart).toBe('2026-01-10T08:00:00.000');
    expect(result.deliveryWindowEnd).toBe('2026-01-10T16:00:00.000');
    expect(result.accountManagerSub).toBe('sub-1');
    expect(result.accountManagerName).toBe('Sam Manager');
    expect(result.version).toBe(1);
    expect(result.lineItemsCount).toBe(3);
  });

  test('omits optional fields when not provided', () => {
    const result = transformFormDataToQuoteDto(
      { customerId: 5, expiryDate: new Date(2026, 0, 20) },
      { ...additionalData, quoteNumber: undefined, lineItemsCount: undefined },
    );
    expect(result.quoteNumber).toBeUndefined();
    expect(result.deliveryStartDate).toBeUndefined();
    expect(result.deliveryWindowStart).toBeUndefined();
    expect(result.lineItemsCount).toBe(0);
    expect(result.email).toBe('');
    expect(result.phone).toBe('');
  });
});

function quoteLineItem(overrides: Partial<QuotationLineItem>): QuotationLineItem {
  return {
    totalProductCostPrice: 0,
    totalTruckCostPrice: 0,
    totalProductSellPrice: 0,
    totalTruckSellPrice: 0,
    ...overrides,
  } as unknown as QuotationLineItem;
}

describe('calculateQuotationPricing', () => {
  test('returns all-zero breakdown for empty/null line items', () => {
    const empty = calculateQuotationPricing([]);
    expect(empty.totalCost).toBe(0);
    expect(empty.totalInvoice).toBe(0);
    expect(calculateQuotationPricing(null)).toEqual(empty);
    expect(calculateQuotationPricing(undefined)).toEqual(empty);
  });

  test('sums all line items (unlike job pricing, truck costs are always included)', () => {
    const items = [
      quoteLineItem({
        totalProductCostPrice: 10000,
        totalTruckCostPrice: 2000,
        totalProductSellPrice: 15000,
        totalTruckSellPrice: 3000,
      }),
      quoteLineItem({
        totalProductCostPrice: 5000,
        totalTruckCostPrice: 1000,
        totalProductSellPrice: 7000,
        totalTruckSellPrice: 1500,
      }),
    ];

    const result = calculateQuotationPricing(items, 'AUD', 10);

    const totalProductCostCents = 15000;
    const totalTruckCostCents = 3000;
    const totalProductSellCents = 22000;
    const totalTruckSellCents = 4500;
    const totalCostCents = totalProductCostCents + totalTruckCostCents;
    const totalInvoiceCents = totalProductSellCents + totalTruckSellCents;
    const gstCents = totalInvoiceCents * 0.1;
    const totalInvoiceCentsWithGST = totalInvoiceCents + gstCents;
    const costGstCents = totalCostCents * 0.1;
    const totalCostCentsWithGST = totalCostCents + costGstCents;
    const grossProfitCents = totalInvoiceCentsWithGST - totalCostCentsWithGST;

    expect(result.totalTruckCostPrice).toBe(
      centsToDollars(totalTruckCostCents),
    );
    expect(result.totalTruckSellPrice).toBe(
      centsToDollars(totalTruckSellCents),
    );
    expect(result.totalCost).toBe(centsToDollars(totalCostCentsWithGST));
    expect(result.totalInvoice).toBe(
      centsToDollars(totalInvoiceCentsWithGST),
    );
    expect(result.grossProfit).toBe(
      formatCurrency(grossProfitCents / 100, 'AUD'),
    );
  });
});
