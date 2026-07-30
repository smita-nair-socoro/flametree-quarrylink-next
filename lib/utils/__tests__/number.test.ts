import { describe, expect, test } from 'vitest';
import {
  formatNumberThousandSeparator,
  formatNumberThousandSeparatorWithoutDecimal,
} from '../number';

describe('formatNumberThousandSeparator', () => {
  test('formats with thousand separators and 2 decimal places', () => {
    expect(formatNumberThousandSeparator(1234.5)).toBe('1,234.50');
    expect(formatNumberThousandSeparator(1000000)).toBe('1,000,000.00');
  });

  test('defaults to 0.00 for null/undefined', () => {
    expect(formatNumberThousandSeparator(null)).toBe('0.00');
    expect(formatNumberThousandSeparator(undefined)).toBe('0.00');
  });
});

describe('formatNumberThousandSeparatorWithoutDecimal', () => {
  test('formats with thousand separators and no decimal places', () => {
    expect(formatNumberThousandSeparatorWithoutDecimal(1234.5)).toBe('1,235');
    expect(formatNumberThousandSeparatorWithoutDecimal(1000000)).toBe(
      '1,000,000',
    );
  });

  test('defaults to 0 for null/undefined', () => {
    expect(formatNumberThousandSeparatorWithoutDecimal(null)).toBe('0');
    expect(formatNumberThousandSeparatorWithoutDecimal(undefined)).toBe('0');
  });
});
