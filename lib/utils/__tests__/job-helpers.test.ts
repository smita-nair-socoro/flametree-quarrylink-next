import { describe, expect, test } from 'vitest';
import {
  calculateJobPricing,
  calculateJobPricingFromTotals,
} from '../job-helpers';
import { centsToDollars } from '../currency';
import { formatCurrency } from '../tenant-config-helper';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';
import type { JobLineItem } from '@/lib/types/job';

function lineItem(overrides: Partial<JobLineItem>): JobLineItem {
  return {
    totalProductCostPrice: 0,
    totalTruckCostPrice: 0,
    totalProductSellPrice: 0,
    totalTruckSellPrice: 0,
    type: JOB_LINE_ITEM_TYPE.DELIVERY,
    ...overrides,
  } as unknown as JobLineItem;
}

describe('calculateJobPricing', () => {
  test('returns all-zero breakdown for empty/null line items', () => {
    const empty = calculateJobPricing([]);
    expect(empty.totalCost).toBe(0);
    expect(empty.totalInvoice).toBe(0);
    expect(empty.grossProfitPercentage).toBe(0);
    expect(calculateJobPricing(null)).toEqual(empty);
    expect(calculateJobPricing(undefined)).toEqual(empty);
  });

  test('excludes truck cost/sell price for COLLECTION line items, sums product price for all types', () => {
    const items = [
      lineItem({
        type: JOB_LINE_ITEM_TYPE.DELIVERY,
        totalProductCostPrice: 10000,
        totalTruckCostPrice: 2000,
        totalProductSellPrice: 15000,
        totalTruckSellPrice: 3000,
      }),
      lineItem({
        type: JOB_LINE_ITEM_TYPE.COLLECTION,
        totalProductCostPrice: 5000,
        totalTruckCostPrice: 1000,
        totalProductSellPrice: 7000,
        totalTruckSellPrice: 1500,
      }),
    ];

    const result = calculateJobPricing(items, 'AUD', 10);

    const totalProductCostCents = 15000;
    const totalTruckCostCents = 2000; // COLLECTION's truck cost excluded
    const totalProductSellCents = 22000;
    const totalTruckSellCents = 3000; // COLLECTION's truck sell excluded
    const totalCostCents = totalProductCostCents + totalTruckCostCents;
    const totalInvoiceCents = totalProductSellCents + totalTruckSellCents;
    const gstCents = totalInvoiceCents * 0.1;
    const totalInvoiceCentsWithGST = totalInvoiceCents + gstCents;
    const costGstCents = totalCostCents * 0.1;
    const totalCostCentsWithGST = totalCostCents + costGstCents;
    const grossProfitCents = totalInvoiceCentsWithGST - totalCostCentsWithGST;
    const grossProfitPercentage =
      (grossProfitCents / totalInvoiceCentsWithGST) * 100;

    expect(result.totalProductCostPrice).toBe(
      centsToDollars(totalProductCostCents),
    );
    expect(result.totalTruckCostPrice).toBe(
      centsToDollars(totalTruckCostCents),
    );
    expect(result.totalProductSellPrice).toBe(
      centsToDollars(totalProductSellCents),
    );
    expect(result.totalTruckSellPrice).toBe(
      centsToDollars(totalTruckSellCents),
    );
    expect(result.grossProfitPercentage).toBeCloseTo(grossProfitPercentage);
    expect(result.grossProfit).toBe(
      formatCurrency(grossProfitCents / 100, 'AUD'),
    );
    expect(result.totalCost).toBe(centsToDollars(totalCostCentsWithGST));
    expect(result.totalInvoice).toBe(
      centsToDollars(totalInvoiceCentsWithGST),
    );
  });

  test('falls back to jobItemType field when type is absent (JobItem shape)', () => {
    const items = [
      {
        totalProductCostPrice: 1000,
        totalTruckCostPrice: 500,
        totalProductSellPrice: 2000,
        totalTruckSellPrice: 800,
        jobItemType: JOB_LINE_ITEM_TYPE.COLLECTION,
      },
    ] as unknown as JobLineItem[];

    const result = calculateJobPricing(items, 'AUD', 10);
    expect(result.totalTruckCostPrice).toBe(centsToDollars(0));
    expect(result.totalTruckSellPrice).toBe(centsToDollars(0));
  });
});

describe('calculateJobPricingFromTotals', () => {
  test('returns all-zero breakdown when totals are missing', () => {
    const empty = calculateJobPricing([]);
    expect(calculateJobPricingFromTotals(null)).toEqual(empty);
    expect(calculateJobPricingFromTotals(undefined)).toEqual(empty);
  });

  test('builds a breakdown directly from backend-computed totals', () => {
    const result = calculateJobPricingFromTotals(
      {
        totalProductCostPrice: 10000,
        totalTruckCostPrice: 2000,
        totalProductSellPrice: 15000,
        totalTruckSellPrice: 3000,
      },
      'AUD',
      10,
    );

    expect(result.totalProductCostPrice).toBe(centsToDollars(10000));
    expect(result.totalCost).toBe(centsToDollars((10000 + 2000) * 1.1));
    expect(result.totalInvoice).toBe(centsToDollars((15000 + 3000) * 1.1));
  });

  test('defaults missing individual total fields to 0', () => {
    const result = calculateJobPricingFromTotals({}, 'AUD', 10);
    expect(result.totalProductCostPrice).toBe(centsToDollars(0));
    expect(result.totalCost).toBe(centsToDollars(0));
  });
});
