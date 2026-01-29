import { format, parseISO } from 'date-fns';

/**
 * ============================================================================
 * TIMEZONE-AWARE DATE FORMATTING UTILITIES
 * ============================================================================
 * These functions convert UTC dates from the backend to the user's local
 * browser timezone for display. All display dates should use these functions
 * to ensure consistent timezone handling across the application.
 * ============================================================================
 */

/**
 * Parse a date string from the backend, treating it as UTC.
 * The backend sends timestamps without the 'Z' suffix, so we need to
 * append it to ensure JavaScript interprets the time as UTC.
 *
 * @param dateString - Date string from backend (e.g., "2025-01-28T06:00:00")
 * @returns Date object representing the UTC time in local timezone
 */
function parseAsUTC(dateString: string): Date {
  // If already has timezone indicator, parse as-is
  if (dateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
    return parseISO(dateString);
  }
  // Otherwise, append Z to treat as UTC
  return parseISO(dateString + 'Z');
}

/**
 * Format a date string to the user's local timezone.
 * Converts UTC dates from backend to browser local time for display.
 *
 * @param dateString - ISO-8601 date string (e.g., "2025-01-28T14:00:00Z")
 * @param formatPattern - date-fns format pattern (default: 'dd MMM yyyy')
 * @returns Formatted date string in local timezone (e.g., "29 Jan 2025")
 *
 * @example
 * // Backend returns UTC: "2025-01-28T14:00:00Z"
 * // User in Sydney (UTC+11) sees: "29 Jan 2025" (1am next day)
 * formatLocalDate("2025-01-28T14:00:00Z") // Returns "29 Jan 2025"
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
 * Format a date in short format using browser's local timezone and locale.
 * Output format: "29/01/25" (dd/mm/yy based on user's locale)
 *
 * The date is converted to user's local timezone, so the same UTC timestamp
 * may show different dates for users in different timezones.
 *
 * @param dateString - ISO-8601 date string or Date object
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
  const pastDate =
    typeof date === 'string' ? parseAsUTC(date) : new Date(date);
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
    (futureDate.getTime() - now.getTime()) / 1000
  );

  return formatRelativeTime(diffInSeconds, '', 'Now');
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
