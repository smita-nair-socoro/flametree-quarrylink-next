import { describe, expect, test } from 'vitest';
import {
  normalizePhoneNumber,
  formatPhoneNumber,
  normalizeObjectPhoneNumbers,
} from '../phone-helper';

describe('normalizePhoneNumber', () => {
  test('adds +61 and strips leading 0', () => {
    expect(normalizePhoneNumber('0412345678')).toBe('+61412345678');
  });

  test('leaves an already E.164 number unchanged (minus spaces)', () => {
    expect(normalizePhoneNumber('+61 412 345 678')).toBe('+61412345678');
  });

  test('adds +61 to a bare number without leading 0', () => {
    expect(normalizePhoneNumber('412345678')).toBe('+61412345678');
  });

  test('returns empty string for empty/null/undefined input', () => {
    expect(normalizePhoneNumber('')).toBe('');
    expect(normalizePhoneNumber(null)).toBe('');
    expect(normalizePhoneNumber(undefined)).toBe('');
    expect(normalizePhoneNumber('   ')).toBe('');
  });
});

describe('formatPhoneNumber', () => {
  test('formats an E.164 number as an international, human-readable string', () => {
    expect(formatPhoneNumber('+61411000003')).toBe('+61 411 000 003');
  });

  test('returns empty string for empty/null/undefined input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber(undefined)).toBe('');
  });

  test('returns the value unchanged when it does not start with +', () => {
    expect(formatPhoneNumber('0412345678')).toBe('0412345678');
  });

  test('returns an empty string when the E.164 input cannot be formatted', () => {
    expect(formatPhoneNumber('+notanumber')).toBe('');
  });
});

describe('normalizeObjectPhoneNumbers', () => {
  test('normalizes all fields ending with "phone" (case-insensitive)', () => {
    const result = normalizeObjectPhoneNumbers({
      phone: '0412345678',
      contact_person_phone: '0498765432',
      businessPhone: '0387654321',
      MOBILE_PHONE: '0411222333',
      name: 'unchanged',
    });
    expect(result).toEqual({
      phone: '+61412345678',
      contact_person_phone: '+61498765432',
      businessPhone: '+61387654321',
      MOBILE_PHONE: '+61411222333',
      name: 'unchanged',
    });
  });

  test('returns non-object input unchanged', () => {
    expect(normalizeObjectPhoneNumbers(null)).toBeNull();
    expect(normalizeObjectPhoneNumbers(undefined)).toBeUndefined();
  });

  test('does not mutate the original object', () => {
    const original = { phone: '0412345678' };
    const result = normalizeObjectPhoneNumbers(original);
    expect(result).not.toBe(original);
    expect(original.phone).toBe('0412345678');
  });
});
