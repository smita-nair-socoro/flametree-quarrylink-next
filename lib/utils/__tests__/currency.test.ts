import { describe, expect, test } from 'vitest';
import {
  centsToDollars,
  centsToDollarsNum,
  dollarsToCents,
  formatDollars,
  formatUnitPrice,
  roundToTwoDecimals,
} from '../currency';

describe('dollarsToCents', () => {
  test('converts whole dollar amounts from strings and numbers', () => {
    expect(dollarsToCents('100')).toBe(10000);
    expect(dollarsToCents(100)).toBe(10000);
  });

  test('converts decimal dollar amounts', () => {
    expect(dollarsToCents('1.99')).toBe(199);
    expect(dollarsToCents(1.99)).toBe(199);
  });

  test('truncates beyond two decimal places instead of rounding', () => {
    expect(dollarsToCents(0.325)).toBe(32);
    expect(dollarsToCents('0.325')).toBe(32);
  });

  test('handles floating-point multiplication artifacts', () => {
    expect(dollarsToCents(10 * 0.18)).toBe(180);
  });

  test('handles zero and negative values', () => {
    expect(dollarsToCents(0)).toBe(0);
    expect(dollarsToCents(-1.5)).toBe(-150);
  });

  test('throws for invalid input', () => {
    expect(() => dollarsToCents('abc')).toThrow(
      'Invalid dollar amount: abc',
    );
    expect(() => dollarsToCents(Number.NaN)).toThrow(
      'Invalid dollar amount: NaN',
    );
  });

  test('preserves four decimal dollar rates as fractional cents', () => {
    expect(dollarsToCents('2.2450', 4)).toBe(224.5);
    expect(dollarsToCents(2.25, 4)).toBe(225);
  });
});

describe('roundToTwoDecimals', () => {
  test('truncates to two decimal places', () => {
    expect(roundToTwoDecimals(0.325)).toBe(0.32);
    expect(roundToTwoDecimals(1.999)).toBe(1.99);
  });

  test('preserves values already at two decimal places', () => {
    expect(roundToTwoDecimals(123.45)).toBe(123.45);
    expect(roundToTwoDecimals(0)).toBe(0);
  });

  test('handles floating-point multiplication artifacts', () => {
    expect(roundToTwoDecimals(10 * 0.18)).toBe(1.8);
  });
});

describe('formatDollars', () => {
  test('formats numeric and string dollar amounts with locale separators', () => {
    expect(formatDollars(1234.56)).toBe('1,234.56');
    expect(formatDollars('1234.56')).toBe('1,234.56');
    expect(formatDollars(100)).toBe('100.00');
  });

  test('returns N/A for invalid amounts', () => {
    expect(formatDollars('abc')).toBe('N/A');
    expect(formatDollars(Number.NaN)).toBe('N/A');
  });
});

describe('formatUnitPrice', () => {
  test('includes trailing zeros at the tenant scale', () => {
    expect(formatUnitPrice(2.25, 2)).toBe('2.25');
    expect(formatUnitPrice(2.25, 4)).toBe('2.2500');
    expect(formatUnitPrice(2.245, 4)).toBe('2.2450');
  });
});

describe('centsToDollars', () => {
  test('converts cents to a formatted dollar string', () => {
    expect(centsToDollars(10000)).toBe('100.00');
    expect(centsToDollars(123456)).toBe('1,234.56');
    expect(centsToDollars(0)).toBe('0.00');
  });
});

describe('centsToDollarsNum', () => {
  test('converts cents to a numeric dollar amount', () => {
    expect(centsToDollarsNum(10000)).toBe(100);
    expect(centsToDollarsNum('10000')).toBe(100);
    expect(centsToDollarsNum(325)).toBe(3.25);
    expect(centsToDollarsNum(0)).toBe(0);
  });

  test('truncates fractional cents when converting', () => {
    expect(centsToDollarsNum(32.5)).toBe(0.32);
  });

  test('throws for invalid input', () => {
    expect(() => centsToDollarsNum('abc')).toThrow(
      'Invalid cents amount: abc',
    );
    expect(() => centsToDollarsNum(Number.NaN)).toThrow(
      'Invalid cents amount: NaN',
    );
  });

  test('preserves four decimal dollar rates', () => {
    expect(centsToDollarsNum(224.5, 4)).toBe(2.245);
    expect(centsToDollarsNum(225, 4)).toBe(2.25);
  });
});
