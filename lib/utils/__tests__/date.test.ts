import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  parseBackendDateTime,
  parseCalendarDate,
  getCalendarDateString,
  getCalendarDatePart,
  formatCalendarDate,
  formatLocalDate,
  formatDateWithOrdinal,
  extractTimeLabel,
  formatTimeRange,
  formatLocalDateTime,
  formatLocalDateShort,
  GetTodaysDate,
  getRelativeTime,
  getRelativeTimeFuture,
  getRelativeTimePastOrFuture,
  toLocalDateTime,
  formatEpochDateDdMmYyyy,
  formatEpochMonthYear,
  formatTimeOnly,
  formatWeekdayDate,
  formatDispatchDateLabel,
} from '../date';

describe('parseBackendDateTime', () => {
  test('parses a naive datetime string with milliseconds as wall-clock components', () => {
    const date = parseBackendDateTime('2026-07-13T14:47:21.933996');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(13);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(47);
    expect(date.getSeconds()).toBe(21);
  });

  test('strips a trailing Z or offset before parsing', () => {
    const withZ = parseBackendDateTime('2026-01-01T10:00:00Z');
    const withOffset = parseBackendDateTime('2026-01-01T10:00:00+10:00');
    expect(withZ.getHours()).toBe(10);
    expect(withOffset.getHours()).toBe(10);
  });

  test('parses a date-only string at local midnight', () => {
    const date = parseBackendDateTime('2026-01-15');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
  });

  test('returns an invalid Date for unrecognized formats', () => {
    expect(Number.isNaN(parseBackendDateTime('not-a-date').getTime())).toBe(
      true,
    );
  });
});

describe('parseCalendarDate', () => {
  test('parses YYYY-MM-DD portion at local midnight', () => {
    const date = parseCalendarDate('2026-03-05T23:00:00');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
  });

  test('throws for an invalid calendar date string', () => {
    expect(() => parseCalendarDate('not-a-date')).toThrow(
      'Invalid calendar date string: not-a-date',
    );
  });
});

describe('getCalendarDateString', () => {
  test('formats a date using local calendar components', () => {
    const date = new Date(2026, 0, 5);
    expect(getCalendarDateString(date)).toBe('2026-01-05');
  });
});

describe('getCalendarDatePart', () => {
  test('extracts YYYY-MM-DD from a naive datetime string', () => {
    expect(getCalendarDatePart('2026-07-13T14:47:21.933996')).toBe(
      '2026-07-13',
    );
  });

  test('falls back to splitting on T when no match', () => {
    expect(getCalendarDatePart('bad-date')).toBe('bad-date');
  });
});

describe('formatCalendarDate', () => {
  test('formats a backend date string using only the date portion', () => {
    expect(formatCalendarDate('2026-07-13T23:59:00')).toBe('13 Jul 2026');
  });

  test('supports a custom format pattern', () => {
    expect(formatCalendarDate('2026-07-13', 'yyyy-MM-dd')).toBe(
      '2026-07-13',
    );
  });

  test('returns em dash for null/undefined', () => {
    expect(formatCalendarDate(null)).toBe('—');
    expect(formatCalendarDate(undefined)).toBe('—');
  });
});

describe('formatLocalDate', () => {
  test('formats a naive backend datetime for display', () => {
    expect(formatLocalDate('2026-07-13T10:00:00')).toBe('13 Jul 2026');
  });

  test('returns em dash for null/undefined', () => {
    expect(formatLocalDate(null)).toBe('—');
  });
});

describe('formatDateWithOrdinal', () => {
  test('formats dates with correct ordinal suffixes', () => {
    expect(formatDateWithOrdinal('2025-07-01')).toBe('1st July, 2025');
    expect(formatDateWithOrdinal('2025-07-02')).toBe('2nd July, 2025');
    expect(formatDateWithOrdinal('2025-07-03')).toBe('3rd July, 2025');
    expect(formatDateWithOrdinal('2025-07-04')).toBe('4th July, 2025');
    expect(formatDateWithOrdinal('2025-07-21')).toBe('21st July, 2025');
    expect(formatDateWithOrdinal('2025-07-22')).toBe('22nd July, 2025');
    expect(formatDateWithOrdinal('2025-07-23')).toBe('23rd July, 2025');
  });

  test('returns N/A for null/undefined', () => {
    expect(formatDateWithOrdinal(null)).toBe('N/A');
    expect(formatDateWithOrdinal(undefined)).toBe('N/A');
  });
});

describe('extractTimeLabel', () => {
  test('extracts HH:mm from a datetime with T separator', () => {
    expect(extractTimeLabel('2026-07-13T14:47:21')).toBe('14:47');
  });

  test('extracts HH:mm from a datetime with space separator', () => {
    expect(extractTimeLabel('2026-07-13 14:47:21')).toBe('14:47');
  });

  test('normalizes a bare HH:mm:ss time string', () => {
    expect(extractTimeLabel('14:47:21')).toBe('14:47');
  });

  test('returns empty string for falsy input', () => {
    expect(extractTimeLabel(undefined)).toBe('');
    expect(extractTimeLabel('')).toBe('');
  });

  test('returns the string unchanged if it has no recognizable separators', () => {
    expect(extractTimeLabel('unknown')).toBe('unknown');
  });
});

describe('formatTimeRange', () => {
  test('formats a 24h range from two datetime strings', () => {
    expect(
      formatTimeRange('2026-01-01T09:00:00', '2026-01-01T17:00:00'),
    ).toBe('09:00 - 17:00');
  });

  test('returns N/A when both inputs are missing', () => {
    expect(formatTimeRange(null, null)).toBe('N/A');
  });

  test('falls back to a single time when only one side is present', () => {
    expect(formatTimeRange('2026-01-01T09:00:00', null)).toBe('09:00');
  });

  test('formats a 12h range when hour12 is set', () => {
    expect(
      formatTimeRange('2026-01-01T09:00:00', '2026-01-01T17:00:00', {
        hour12: true,
      }),
    ).toBe('9:00 AM - 5:00 PM');
  });

  test('returns N/A for hour12 mode when either side is missing', () => {
    expect(
      formatTimeRange('2026-01-01T09:00:00', null, { hour12: true }),
    ).toBe('N/A');
  });
});

describe('formatLocalDateTime', () => {
  test('formats date and time', () => {
    expect(formatLocalDateTime('2025-01-29T01:00:00')).toBe(
      '29 Jan 2025, 1:00 AM',
    );
  });

  test('returns em dash for null/undefined', () => {
    expect(formatLocalDateTime(null)).toBe('—');
  });
});

describe('formatLocalDateShort', () => {
  test('formats a short date', () => {
    expect(formatLocalDateShort('2025-01-29T01:00:00')).toBe('29/01/25');
  });

  test('returns em dash for null/undefined', () => {
    expect(formatLocalDateShort(undefined)).toBe('—');
  });
});

describe('GetTodaysDate', () => {
  test('returns today at midnight', () => {
    const result = GetTodaysDate();
    const now = new Date();
    expect(result.getFullYear()).toBe(now.getFullYear());
    expect(result.getMonth()).toBe(now.getMonth());
    expect(result.getDate()).toBe(now.getDate());
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('toLocalDateTime', () => {
  test('serializes wall-clock components with milliseconds by default', () => {
    const date = new Date(2026, 0, 5, 9, 30, 15, 250);
    expect(toLocalDateTime(date)).toBe('2026-01-05T09:30:15.250');
  });

  test('omits milliseconds when includeMilliseconds is false', () => {
    const date = new Date(2026, 0, 5, 9, 30, 15, 250);
    expect(toLocalDateTime(date, false)).toBe('2026-01-05T09:30:15');
  });
});

describe('formatEpochDateDdMmYyyy', () => {
  test('formats an epoch seconds value', () => {
    const epochSeconds = Date.UTC(2026, 0, 15) / 1000;
    const expected = (() => {
      const d = new Date(epochSeconds * 1000);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${d.getFullYear()}`;
    })();
    expect(formatEpochDateDdMmYyyy(epochSeconds)).toBe(expected);
  });

  test('returns dash for falsy input', () => {
    expect(formatEpochDateDdMmYyyy(undefined)).toBe('-');
    expect(formatEpochDateDdMmYyyy(0)).toBe('-');
  });
});

describe('formatEpochMonthYear', () => {
  test('formats an epoch seconds value as month/year', () => {
    const epochSeconds = Date.UTC(2026, 0, 15) / 1000;
    const d = new Date(epochSeconds * 1000);
    const expected = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(d);
    expect(formatEpochMonthYear(epochSeconds)).toBe(expected);
  });

  test('returns dash for falsy input', () => {
    expect(formatEpochMonthYear(undefined)).toBe('-');
  });
});

describe('formatTimeOnly', () => {
  test('formats a given date as h:mm aa', () => {
    const date = new Date(2026, 0, 1, 12, 9, 0);
    expect(formatTimeOnly(date)).toBe('12:09 PM');
  });
});

describe('formatWeekdayDate', () => {
  test('formats weekday + full date', () => {
    const date = new Date(2026, 0, 21); // Wednesday 21 Jan 2026
    expect(formatWeekdayDate(date)).toBe('Wednesday 21 January 2026');
  });
});

describe('formatDispatchDateLabel', () => {
  test('formats a compact dispatch label', () => {
    const label = formatDispatchDateLabel('2026-01-26T10:00:00');
    expect(label).toBe('Mon 26 Jan');
  });

  test('returns empty string for falsy input', () => {
    expect(formatDispatchDateLabel(undefined)).toBe('');
  });

  test('returns the string unchanged when it has no T separator', () => {
    expect(formatDispatchDateLabel('2026-01-26')).toBe('2026-01-26');
  });
});

describe('relative time helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('getRelativeTime describes a past date in seconds/minutes/hours/days', () => {
    expect(getRelativeTime(new Date(2026, 0, 15, 11, 59, 58))).toBe(
      'Just now',
    );
    expect(getRelativeTime(new Date(2026, 0, 15, 11, 59, 0))).toBe(
      '1 min ago',
    );
    expect(getRelativeTime(new Date(2026, 0, 15, 11, 0, 0))).toBe(
      '1 hour ago',
    );
    expect(getRelativeTime(new Date(2026, 0, 14, 12, 0, 0))).toBe(
      '1 day ago',
    );
  });

  test('getRelativeTimeFuture describes a future date without a suffix', () => {
    expect(getRelativeTimeFuture(new Date(2026, 0, 15, 12, 1, 0))).toBe(
      '1 min',
    );
  });

  test('getRelativeTimePastOrFuture handles future dates with "in" prefix', () => {
    expect(
      getRelativeTimePastOrFuture(new Date(2026, 0, 17, 12, 0, 0)),
    ).toBe('in 2 days');
  });

  test('getRelativeTimePastOrFuture handles past dates with "ago" suffix', () => {
    expect(
      getRelativeTimePastOrFuture(new Date(2026, 0, 13, 12, 0, 0)),
    ).toBe('2 days ago');
  });

  test('getRelativeTimePastOrFuture returns Now for the current moment', () => {
    expect(getRelativeTimePastOrFuture(new Date(2026, 0, 15, 12, 0, 0))).toBe(
      'Now',
    );
  });
});
