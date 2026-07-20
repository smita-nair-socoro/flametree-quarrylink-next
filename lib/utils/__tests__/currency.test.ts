import { describe, expect, test } from 'vitest';
import {
  centsToDollars,
  centsToDollarsNum,
  dollarsToCents,
  formatDollars,
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
});
