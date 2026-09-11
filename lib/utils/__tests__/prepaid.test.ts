import { describe, expect, test } from 'vitest';
import {
  creditCardSurchargeAmount,
  isPrepaidPaid,
  isPrepaidUnpaid,
  prepaidBadgeNames,
  prepaidCashSaleBreakdown,
} from '../prepaid';

describe('prepaid helpers', () => {
  test('unpaid prepaid is prepay without a receipt', () => {
    expect(isPrepaidUnpaid({ prepay: true })).toBe(true);
    expect(isPrepaidUnpaid({ prepay: true, cashSaleReceiptId: 9 })).toBe(false);
    expect(isPrepaidPaid({ cashSaleReceiptId: 9 })).toBe(true);
  });

  test('adds a PREPAID badge alongside status', () => {
    expect(prepaidBadgeNames('PENDING', true)).toEqual(['PENDING', 'PREPAID']);
    expect(prepaidBadgeNames('ACTIVE', false)).toEqual(['ACTIVE']);
  });

  test('credit card surcharge rounds once HALF_UP to 2dp', () => {
    expect(creditCardSurchargeAmount(15000)).toBe(562.5);
    expect(creditCardSurchargeAmount(1)).toBe(0.04);
    expect(prepaidCashSaleBreakdown(15000, 'Cash')).toEqual({
      materialAmount: 15000,
      surchargeAmount: 0,
      totalCharged: 15000,
    });
    expect(prepaidCashSaleBreakdown(15000, 'Credit Card')).toEqual({
      materialAmount: 15000,
      surchargeAmount: 562.5,
      totalCharged: 15562.5,
    });
  });
});
