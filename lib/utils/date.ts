import { format, parseISO } from 'date-fns';

/**
 * ============================================================================
 * TIMEZONE-AWARE DATE FORMATTING UTILITIES
 * ============================================================================
 * The backend sends naive datetimes (no 'Z'/offset) already expressed in the
 * tenant's local timezone. These functions parse and render those wall-clock
 * values as-is, with no further timezone conversion. All display dates should
 * use these functions to ensure consistent handling across the application.
 * ============================================================================
 */

/**
 * Parse a date string from the backend.
 * The backend sends naive timestamps (no timezone indicator) already in the
 * tenant's local time, so we parse the wall-clock components directly rather
 * than converting - the digits shown should match the digits sent.
 *
 * @param dateString - Date string from backend (e.g., "2025-01-28T06:00:00")
 * @returns Date object whose local components match the string's digits
 */
export function parseAsUTC(dateString: string): Date {
  // If it carries an explicit timezone indicator, it's a real instant - parse as-is.
  if (dateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
    return parseISO(dateString);
  }
  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/,
  );
  if (!match) return parseISO(dateString);
  const [, year, month, day, hour, minute, second, msRaw] = match;
  const ms = msRaw ? Number(msRaw.slice(0, 3).padEnd(3, '0')) : 0;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    ms,
  );
}

/**
 * Parse a backend date/datetime as a calendar date at local midnight.
 * Uses only the YYYY-MM-DD portion so timezone does not shift the displayed day.
 * Use for date-only fields like deliveryCollectionDate.
 */
export function parseCalendarDate(dateString: string): Date {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    throw new Error(`Invalid calendar date string: ${dateString}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

/**
 * Returns YYYY-MM-DD using local calendar components (no UTC conversion).
 */
export function getCalendarDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extracts YYYY-MM-DD from a backend naive datetime string.
 */
export function getCalendarDatePart(dateString: string): string {
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? dateString.split('T')[0];
}

/**
 * Format a backend date/datetime using only the YYYY-MM-DD portion.
 * Ignores any time component so the displayed calendar day is not shifted by timezone.
 */
export function formatCalendarDate(
  dateString: string | Date | null | undefined,
  formatPattern: string = 'dd MMM yyyy',
): string {
  if (!dateString) return '—';

  try {
    const date =
      typeof dateString === 'string'
        ? parseCalendarDate(dateString)
        : new Date(
            dateString.getFullYear(),
            dateString.getMonth(),
            dateString.getDate(),
          );
    return format(date, formatPattern);
  } catch {
    return '—';
  }
}

/**
 * Format a naive backend datetime (already tenant-local) for display.
 * The wall-clock digits are rendered as-is, with no timezone conversion.
 *
 * @param dateString - Date string from backend (e.g., "2025-01-28T14:00:00")
 * @param formatPattern - date-fns format pattern (default: 'dd MMM yyyy')
 * @returns Formatted date string (e.g., "28 Jan 2025")
 *
 * @example
 * // Backend sends tenant-local: "2025-01-28T14:00:00"
 * formatLocalDate("2025-01-28T14:00:00") // Returns "28 Jan 2025"
 */
export function formatLocalDate(
  dateString: string | Date | null | undefined,
  formatPattern: string = 'dd MMM yyyy',
): string {
  if (!dateString) return '—';

  try {
    const date =
      typeof dateString === 'string' ? parseAsUTC(dateString) : dateString;
    return format(date, formatPattern);
  } catch {
    return '—';
  }
}

/**
 * Format a date with ordinal suffix in the user's local timezone.
 * Output format: "15th July, 2025"
 *
 * @param dateString - ISO-8601 date string
 * @returns Formatted date with ordinal (e.g., "15th July, 2025")
 */
export function formatDateWithOrdinal(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return 'N/A';

  try {
    const date =
      typeof dateString === 'string' ? parseAsUTC(dateString) : dateString;
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
          ? 'nd'
          : day === 3 || day === 23
            ? 'rd'
            : 'th';

    return `${day}${suffix} ${month}, ${year}`;
  } catch {
    return typeof dateString === 'string' ? dateString : 'N/A';
  }
}

/**
 * Format a time range from two date strings in the user's local timezone.
 * Output format: "9:00 AM - 5:00 PM"
 *
 * @param startDateString - ISO-8601 date string for start time
 * @param endDateString - ISO-8601 date string for end time
 * @returns Formatted time range (e.g., "9:00 AM - 5:00 PM")
 */
export function formatTimeRange(
  startDateString: string | null | undefined,
  endDateString: string | null | undefined,
): string {
  if (!startDateString || !endDateString) return 'N/A';

  try {
    const start =
      typeof startDateString === 'string'
        ? parseAsUTC(startDateString)
        : startDateString;
    const end =
      typeof endDateString === 'string'
        ? parseAsUTC(endDateString)
        : endDateString;

    const formatTime = (date: Date) => {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Format a date and time in the user's local timezone.
 * Output format: "29 Jan 2025, 1:00 AM"
 *
 * @param dateString - ISO-8601 date string
 * @returns Formatted date and time (e.g., "29 Jan 2025, 1:00 AM")
 */
export function formatLocalDateTime(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return '—';

  try {
    const date =
      typeof dateString === 'string' ? parseAsUTC(dateString) : dateString;
    return format(date, 'dd MMM yyyy, h:mm a');
  } catch {
    return '—';
  }
}

/**
 * Format a date in short format (tenant-local, no conversion).
 * Output format: "29/01/25" (dd/mm/yy based on user's locale)
 *
 * @param dateString - Date string from backend or Date object
 * @returns Formatted date with 2-digit year (e.g., "29/01/25")
 */
export function formatLocalDateShort(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return '—';

  try {
    const date =
      typeof dateString === 'string' ? parseAsUTC(dateString) : dateString;
    // Use dd/MM/yy format consistently (day/month/year)
    return format(date, 'dd/MM/yy');
  } catch {
    return '—';
  }
}

/**
 * Format a date with full month name using browser's local timezone and locale.
 * Output format: "29 January 2025" (based on user's locale)
 *
 * @param dateString - ISO-8601 date string or Date object
 * @returns Formatted date with full month name
 */
export function formatLocalDateLong(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return '—';

  try {
    const date =
      typeof dateString === 'string' ? parseAsUTC(dateString) : dateString;
    // Uses browser's default locale (undefined = auto-detect)
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * ============================================================================
 * DATE CALCULATION UTILITIES
 * ============================================================================
 */

export function GetTomorrowDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function GetTodaysDate(): Date {
  const d = new Date();
  d.setDate(d.getDate());
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to format relative time
function formatRelativeTime(
  diffInSeconds: number,
  suffix: string = '',
  justNowText: string = 'Just now',
): string {
  // If the date is very recent
  if (diffInSeconds < 5) {
    return justNowText;
  }

  const addSuffix = (text: string) => (suffix ? `${text} ${suffix}` : text);

  // Seconds
  if (diffInSeconds < 60) {
    return addSuffix(`${diffInSeconds} sec${diffInSeconds === 1 ? '' : 's'}`);
  }

  // Minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return addSuffix(`${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'}`);
  }

  // Hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return addSuffix(`${diffInHours} hour${diffInHours === 1 ? '' : 's'}`);
  }

  // Days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return addSuffix(`${diffInDays} day${diffInDays === 1 ? '' : 's'}`);
  }

  // Weeks
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return addSuffix(`${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'}`);
  }

  // Months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return addSuffix(`${diffInMonths} month${diffInMonths === 1 ? '' : 's'}`);
  }

  // Years
  const diffInYears = Math.floor(diffInDays / 365);
  return addSuffix(`${diffInYears} year${diffInYears === 1 ? '' : 's'}`);
}

/**
 * Get relative time for past dates (e.g., "2 days ago", "5 hours ago")
 * Uses parseISO for consistent timezone handling with other date utilities.
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const pastDate = typeof date === 'string' ? parseAsUTC(date) : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  return formatRelativeTime(diffInSeconds, 'ago', 'Just now');
}

/**
 * Get relative time for future dates without suffix (e.g., "2 days", "5 hours")
 * Uses parseISO for consistent timezone handling with other date utilities.
 */
export function getRelativeTimeFuture(date: Date | string | number): string {
  const now = new Date();
  const futureDate =
    typeof date === 'string' ? parseAsUTC(date) : new Date(date);
  const diffInSeconds = Math.floor(
    (futureDate.getTime() - now.getTime()) / 1000,
  );

  return formatRelativeTime(diffInSeconds, '', 'Now');
}

/**
 * Calendar-day difference in local time (so "30 Jan" vs "2 Feb" = 3 days).
 * Uses local midnight for both dates to match displayed dates.
 */
function getCalendarDayDiffInSeconds(now: Date, target: Date): number {
  const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetLocal = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round((nowLocal.getTime() - targetLocal.getTime()) / 1000);
}

/**
 * Format relative time using calendar-day difference for days and above,
 * so "30 Jan" and "29 Jan" show "3 days ago" and "4 days ago" correctly.
 */
function formatRelativeTimeCalendarDays(
  diffInSeconds: number,
  suffix: string,
  justNowText: string,
): string {
  if (diffInSeconds < 5) return justNowText;
  const addSuffix = (text: string) => (suffix ? `${text} ${suffix}` : text);

  if (diffInSeconds < 60) {
    return addSuffix(`${diffInSeconds} sec${diffInSeconds === 1 ? '' : 's'}`);
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return addSuffix(`${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'}`);
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return addSuffix(`${diffInHours} hour${diffInHours === 1 ? '' : 's'}`);
  }
  // Use calendar days for day/week/month/year so displayed dates match
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays < 7) {
    return addSuffix(`${diffInDays} day${diffInDays === 1 ? '' : 's'}`);
  }
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return addSuffix(`${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'}`);
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return addSuffix(`${diffInMonths} month${diffInMonths === 1 ? '' : 's'}`);
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return addSuffix(`${diffInYears} year${diffInYears === 1 ? '' : 's'}`);
}

/**
 * Get relative time for any date: past ("2 days ago") or future ("in 2 days").
 * Uses calendar-day difference for day+ so "30 Jan" = 3 days ago, "29 Jan" = 4 days ago.
 * Backend sends naive datetimes already in tenant-local time; we parse them
 * as-is (no conversion) then compare in calendar days.
 */
export function getRelativeTimePastOrFuture(
  date: Date | string | number,
): string {
  const now = new Date();
  const target = typeof date === 'string' ? parseAsUTC(date) : new Date(date);

  const diffInSeconds = target.getTime() - now.getTime();

  if (diffInSeconds >= 0) {
    if (diffInSeconds < 5 * 1000) return 'Now';
    // Future: calendar days from now to target (target - now)
    const calendarDiffSec = -getCalendarDayDiffInSeconds(now, target);
    const relative = formatRelativeTimeCalendarDays(
      Math.max(0, calendarDiffSec),
      '',
      'Now',
    );
    return relative === 'Now' ? 'Now' : `in ${relative.toLowerCase()}`;
  }

  // Past: calendar days from target to now (now - target)
  const calendarDiffSec = getCalendarDayDiffInSeconds(now, target);
  return formatRelativeTimeCalendarDays(calendarDiffSec, 'ago', 'Just now');
}

/**
 * Converts a JavaScript Date to LocalDateTime format (without timezone).
 * Format: YYYY-MM-DDTHH:mm:ss.SSS
 *
 * This is used for Java backend APIs that expect LocalDateTime format.
 * The date is formatted in the browser's local timezone.
 *
 * @param date - The date to convert
 * @returns String in LocalDateTime format (e.g., "2025-11-28T09:20:00.000")
 *
 * @example
 * const date = new Date('2025-11-28T09:20:00');
 * toLocalDateTime(date); // Returns "2025-11-28T09:20:00.000"
 */
export function toLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Format a Date as UTC (offset 0) without the "Z" suffix.
 * Use for backend APIs that expect UTC LocalDateTime-style strings.
 *
 * @param date - The date to convert
 * @returns String in UTC format without Z (e.g., "2026-01-23T00:00:00.000")
 */
export function toUTCDateTimeWithoutZ(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
}

// Format epoch seconds to date in format dd/mm/yyyy
export const formatEpochDateDdMmYyyy = (epochSeconds?: number): string => {
  if (!epochSeconds) return '-';
  const d = new Date(epochSeconds * 1000);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatEpochMonthYear = (epochSeconds?: number): string => {
  if (!epochSeconds) return '-';
  const d = new Date(epochSeconds * 1000);
  // Uses browser's default locale (undefined = auto-detect)
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(d);
};

/**
 * Format a date as a time-only string in the user's local timezone.
 * Output format: "12:09 pm"
 *
 * @param date - Date object (defaults to now)
 * @returns Formatted time string (e.g., "12:09 pm")
 */
export function formatTimeOnly(date: Date = new Date()): string {
  return format(date, 'h:mm aa');
}

/**
 * Format a date as a full weekday + date string in the user's local timezone.
 * Output format: "Wednesday 21 January 2026"
 *
 * @param date - Date object (defaults to now)
 * @returns Formatted date string (e.g., "Wednesday 21 January 2026")
 */
export function formatWeekdayDate(date: Date = new Date()): string {
  return format(date, 'EEEE d MMMM yyyy');
}
