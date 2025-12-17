import { format } from 'date-fns';

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
  justNowText: string = 'Just now'
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
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  return formatRelativeTime(diffInSeconds, 'ago', 'Just now');
}

/**
 * Get relative time for future dates without suffix (e.g., "2 days", "5 hours")
 */
export function getRelativeTimeFuture(date: Date | string | number): string {
  const now = new Date();
  const futureDate = new Date(date);
  const diffInSeconds = Math.floor(
    (futureDate.getTime() - now.getTime()) / 1000
  );

  return formatRelativeTime(diffInSeconds, '', 'Now');
}

/**
 * Format a date using a pattern (e.g., 'd MMM yyyy', 'h:mm a')
 * Returns '—' if the date is invalid
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  pattern: string
): string {
  if (!value) return '—';

  try {
    return format(new Date(value), pattern);
  } catch {
    return '—';
  }
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
  return new Intl.DateTimeFormat('en-AU', {
    month: 'long',
    year: 'numeric',
  }).format(d);
};
