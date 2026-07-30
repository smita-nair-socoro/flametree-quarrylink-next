import { describe, expect, test } from 'vitest';
import {
  getAccountingSoftwareProvider,
  getAccountingSoftwareLabel,
  getCurrencySymbol,
  getCurrencyLocale,
  formatCurrency,
  formatCentsToCurrency,
  getExTaxLabel,
  getTaxRateLabel,
  getSubscriptionCurrencySymbol,
  getCurrencyName,
  DEFAULT_ACCOUNTING_SOFTWARE_LABEL,
} from '../tenant-config-helper';

describe('getAccountingSoftwareProvider', () => {
  test('detects XERO and MYOB (case-insensitive, substring match)', () => {
    expect(getAccountingSoftwareProvider('XERO')).toBe('XERO');
    expect(getAccountingSoftwareProvider('xero')).toBe('XERO');
    expect(getAccountingSoftwareProvider('MYOB_BUSINESS')).toBe('MYOB');
  });

  test('returns null for unknown/missing values', () => {
    expect(getAccountingSoftwareProvider(undefined)).toBeNull();
    expect(getAccountingSoftwareProvider('QUICKBOOKS')).toBeNull();
  });
});

describe('getAccountingSoftwareLabel', () => {
  test('returns display labels for known providers', () => {
    expect(getAccountingSoftwareLabel('XERO')).toBe('Xero');
    expect(getAccountingSoftwareLabel('MYOB_BUSINESS')).toBe('MYOB');
  });

  test('falls back to the default label', () => {
    expect(getAccountingSoftwareLabel(undefined)).toBe(
      DEFAULT_ACCOUNTING_SOFTWARE_LABEL,
    );
  });
});

describe('getCurrencySymbol', () => {
  test('returns the narrow currency symbol for a code', () => {
    expect(getCurrencySymbol('AUD')).toBe('$');
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  test('defaults to AUD', () => {
    expect(getCurrencySymbol()).toBe('$');
  });
});

describe('getCurrencyLocale', () => {
  test('returns the fixed en-AU locale', () => {
    expect(getCurrencyLocale()).toBe('en-AU');
  });
});

describe('formatCurrency', () => {
  test('formats a dollar amount using the given currency', () => {
    expect(formatCurrency(1234.5, 'AUD')).toBe('$1,234.50');
  });

  test('defaults to AUD', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });
});

describe('formatCentsToCurrency', () => {
  test('converts cents to a formatted currency string', () => {
    expect(formatCentsToCurrency(123456, 'AUD')).toBe('$1,234.56');
  });
});

describe('getExTaxLabel', () => {
  test('wraps the tax label in parentheses', () => {
    expect(getExTaxLabel('GST')).toBe('(ex-GST)');
  });

  test('defaults to GST', () => {
    expect(getExTaxLabel()).toBe('(ex-GST)');
  });
});

describe('getTaxRateLabel', () => {
  test('formats label and percentage', () => {
    expect(getTaxRateLabel('GST', 10)).toBe('GST (10%)');
  });

  test('uses defaults when not provided', () => {
    expect(getTaxRateLabel()).toBe('GST (10%)');
  });
});

describe('getSubscriptionCurrencySymbol', () => {
  test('returns A$ for AUD', () => {
    expect(getSubscriptionCurrencySymbol('AUD')).toBe('A$');
    expect(getSubscriptionCurrencySymbol('aud')).toBe('A$');
  });

  test('defaults to $ for other/missing currencies', () => {
    expect(getSubscriptionCurrencySymbol('USD')).toBe('$');
    expect(getSubscriptionCurrencySymbol(undefined)).toBe('$');
  });
});

describe('getCurrencyName', () => {
  test('returns the display name for a currency code', () => {
    expect(getCurrencyName('AUD')).toBe('Australian Dollar');
  });

  test('falls back to the code itself on invalid input', () => {
    expect(getCurrencyName('NOTACODE')).toBe('NOTACODE');
  });
});
