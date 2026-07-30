import { describe, expect, test } from 'vitest';
import {
  parseDeliveryTimeWindowValue,
  normalizeDeliveryTimeWindowStart,
  normalizeDeliveryTimeWindowEnd,
  normalizeDeliveryCollectionStartIso,
  normalizeDeliveryCollectionEndIso,
  getDeliveryTimeWindowHour,
  isDeliveryTimeWindowStartOptionDisabled,
  isDeliveryTimeWindowEndOptionDisabled,
  DELIVERY_TIME_WINDOW_START,
  DELIVERY_TIME_WINDOW_END,
} from '../time';

describe('parseDeliveryTimeWindowValue', () => {
  test('returns an HH:mm string unchanged', () => {
    expect(parseDeliveryTimeWindowValue('09:30')).toBe('09:30');
    expect(parseDeliveryTimeWindowValue('09:30:00')).toBe('09:30');
  });

  test('extracts time from a datetime with T separator', () => {
    expect(parseDeliveryTimeWindowValue('2026-01-01T14:30:00')).toBe('14:30');
  });

  test('extracts time from a datetime with space separator', () => {
    expect(parseDeliveryTimeWindowValue('2026-01-01 14:30:00')).toBe('14:30');
  });

  test('returns empty string for falsy input', () => {
    expect(parseDeliveryTimeWindowValue(undefined)).toBe('');
    expect(parseDeliveryTimeWindowValue(null)).toBe('');
    expect(parseDeliveryTimeWindowValue('')).toBe('');
  });
});

describe('normalizeDeliveryTimeWindowStart', () => {
  test('preserves an in-range start time', () => {
    expect(normalizeDeliveryTimeWindowStart('09:15')).toBe('09:15');
  });

  test('clamps an out-of-range hour to the window start', () => {
    expect(normalizeDeliveryTimeWindowStart('02:00')).toBe(
      DELIVERY_TIME_WINDOW_START,
    );
  });

  test('returns empty string for falsy input', () => {
    expect(normalizeDeliveryTimeWindowStart(undefined)).toBe('');
  });
});

describe('normalizeDeliveryTimeWindowEnd', () => {
  test('preserves an in-range end time', () => {
    expect(normalizeDeliveryTimeWindowEnd('20:00')).toBe('20:00');
  });

  test('clamps an out-of-range hour to the window end', () => {
    expect(normalizeDeliveryTimeWindowEnd('02:30')).toBe(
      DELIVERY_TIME_WINDOW_END,
    );
  });

  test('returns empty string for falsy input', () => {
    expect(normalizeDeliveryTimeWindowEnd(undefined)).toBe('');
  });
});

describe('normalizeDeliveryCollectionStartIso', () => {
  test('rebuilds the ISO string with a normalized start time', () => {
    expect(
      normalizeDeliveryCollectionStartIso('2026-01-01T02:15:00.000'),
    ).toBe('2026-01-01T04:00:00.000');
  });

  test('preserves in-range minutes', () => {
    expect(
      normalizeDeliveryCollectionStartIso('2026-01-01T09:15:00'),
    ).toBe('2026-01-01T09:15:00');
  });

  test('returns undefined for falsy input', () => {
    expect(normalizeDeliveryCollectionStartIso(undefined)).toBeUndefined();
    expect(normalizeDeliveryCollectionStartIso(null)).toBeUndefined();
  });
});

describe('normalizeDeliveryCollectionEndIso', () => {
  test('rebuilds the ISO string with a normalized end time', () => {
    expect(normalizeDeliveryCollectionEndIso('2026-01-01T02:45:00')).toBe(
      '2026-01-01T23:00:00',
    );
  });

  test('preserves in-range minutes', () => {
    expect(
      normalizeDeliveryCollectionEndIso('2026-01-01T20:45:00'),
    ).toBe('2026-01-01T20:45:00');
  });

  test('returns undefined for falsy input', () => {
    expect(normalizeDeliveryCollectionEndIso(undefined)).toBeUndefined();
  });
});

describe('getDeliveryTimeWindowHour', () => {
  test('extracts the hour from a time-like string', () => {
    expect(getDeliveryTimeWindowHour('14:30')).toBe(14);
  });

  test('returns null for falsy input', () => {
    expect(getDeliveryTimeWindowHour(undefined)).toBeNull();
    expect(getDeliveryTimeWindowHour(null)).toBeNull();
  });
});

describe('isDeliveryTimeWindowStartOptionDisabled', () => {
  test('disables options at or after 23:00', () => {
    expect(isDeliveryTimeWindowStartOptionDisabled('23:00')).toBe(true);
  });

  test('disables options at or after the current end time', () => {
    expect(
      isDeliveryTimeWindowStartOptionDisabled('12:00', '10:00'),
    ).toBe(true);
    expect(
      isDeliveryTimeWindowStartOptionDisabled('09:00', '10:00'),
    ).toBe(false);
  });

  test('enables options when no end time is set', () => {
    expect(isDeliveryTimeWindowStartOptionDisabled('09:00')).toBe(false);
  });
});

describe('isDeliveryTimeWindowEndOptionDisabled', () => {
  test('disables options at or before 04:00', () => {
    expect(isDeliveryTimeWindowEndOptionDisabled('04:00')).toBe(true);
  });

  test('disables options at or before the current start time', () => {
    expect(
      isDeliveryTimeWindowEndOptionDisabled('09:00', '10:00'),
    ).toBe(true);
    expect(
      isDeliveryTimeWindowEndOptionDisabled('11:00', '10:00'),
    ).toBe(false);
  });

  test('enables options when no start time is set', () => {
    expect(isDeliveryTimeWindowEndOptionDisabled('12:00')).toBe(false);
  });
});
