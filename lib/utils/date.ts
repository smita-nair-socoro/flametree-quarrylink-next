import { format } from 'date-fns';

/**
 * ============================================================================
 * BACKEND DATE/TIME CONTRACT
 * ============================================================================
 * Incoming: the backend sends tenant-local wall-clock values already converted
 * per tenant config, e.g. "2026-07-13T14:47:21.933996" (no Z, no offset).
 * The frontend displays and compares those digits as-is — no conversion.
 *
 * Outgoing: when sending dates/times to the backend, serialize the wall-clock
 * components the user picked (via toLocalDateTime / getCalendarDateString).
 * Do not append Z or offsets; the backend handles UTC storage internally.
 * ============================================================================
 */

/**
 * Parse a backend date/datetime string into a Date using wall-clock components.
 * Any trailing Z or offset is stripped — values are treated as tenant-local time.
 */
export function parseBackendDateTime(dateString: string): Date {
  const normalized = dateString
    .trim()
    .replace(/Z$/i, '')
    .replace(/[+-]\d{2}:\d{2}$/, '');

  const dateTimeMatch = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/,
  );
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute, second, msRaw] = dateTimeMatch;
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

  const dateOnlyMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return new Date(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]) - 1,
      Number(dateOnlyMatch[3]),
    );
  }

  return new Date(NaN);
}

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseBackendDateTime(value) : value;
}

/**
 * Parse a backend date/datetime as a calendar date at local midnight.
 * Uses only the YYYY-MM-DD portion so timezone does not shift the displayed day.
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

/** Returns YYYY-MM-DD using local calendar components. */
export function getCalendarDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Extracts YYYY-MM-DD from a backend naive datetime string. */
export function getCalendarDatePart(dateString: string): string {
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? dateString.split('T')[0];
}

/** Format a backend date/datetime using only the YYYY-MM-DD portion. */
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

/** Format a naive backend datetime for display (wall-clock, no conversion). */
export function formatLocalDate(
  dateString: string | Date | null | undefined,
  formatPattern: string = 'dd MMM yyyy',
): string {
  if (!dateString) return '—';

  try {
    return format(toDate(dateString as string | Date), formatPattern);
  } catch {
    return '—';
  }
}

/** Format a date with ordinal suffix. Output: "15th July, 2025" */
export function formatDateWithOrdinal(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return 'N/A';

  try {
    const date = toDate(dateString as string | Date);
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

/** Extract HH:mm from backend datetime, time-only, or bare time strings. */
export function extractTimeLabel(timeStr?: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return timeStr.split('T')[1].substring(0, 5);
  }
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5);
  }
  if (timeStr.includes(':')) {
    return timeStr.split(':').slice(0, 2).join(':');
  }
  return timeStr;
}

type FormatTimeRangeOptions = {
  /** When true, renders "9:00 AM - 5:00 PM". Default is 24h "09:00 - 17:00". */
  hour12?: boolean;
};

/**
 * Format a time range from two backend time/datetime strings.
 * Defaults to 24-hour dispatch style; pass `{ hour12: true }` for AM/PM display.
 */
export function formatTimeRange(
  startDateString?: string | null,
  endDateString?: string | null,
  options?: FormatTimeRangeOptions,
): string {
  if (!startDateString && !endDateString) return 'N/A';

  if (options?.hour12) {
    if (!startDateString || !endDateString) return 'N/A';
    try {
      const start = toDate(startDateString);
      const end = toDate(endDateString);
      const formatTime = (date: Date) =>
        date.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      return `${formatTime(start)} - ${formatTime(end)}`;
    } catch {
      return 'N/A';
    }
  }

  const startTime = extractTimeLabel(startDateString ?? undefined);
  const endTime = extractTimeLabel(endDateString ?? undefined);
  return startTime && endTime
    ? `${startTime} - ${endTime}`
    : startTime || endTime || 'N/A';
}

/** Format a date and time. Output: "29 Jan 2025, 1:00 AM" */
export function formatLocalDateTime(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return '—';

  try {
    return format(toDate(dateString as string | Date), 'dd MMM yyyy, h:mm a');
  } catch {
    return '—';
  }
}

/** Format a short date. Output: "29/01/25" */
export function formatLocalDateShort(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return '—';

  try {
    return format(toDate(dateString as string | Date), 'dd/MM/yy');
  } catch {
    return '—';
  }
}

export function GetTodaysDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

type RelativeGranularity = 'exact' | 'calendar';

function formatRelativeDuration(
  diffInSeconds: number,
  suffix = '',
  justNowText = 'Just now',
  granularity: RelativeGranularity = 'exact',
): string {
  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 5) return justNowText;

  const addSuffix = (text: string) => (suffix ? `${text} ${suffix}` : text);

  if (absDiff < 60) {
    return addSuffix(`${absDiff} sec${absDiff === 1 ? '' : 's'}`);
  }

  const diffInMinutes = Math.floor(absDiff / 60);
  if (diffInMinutes < 60) {
    return addSuffix(
      `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'}`,
    );
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return addSuffix(`${diffInHours} hour${diffInHours === 1 ? '' : 's'}`);
  }

  const diffInDays =
    granularity === 'calendar'
      ? Math.floor(absDiff / 86400)
      : Math.floor(diffInHours / 24);
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

function getCalendarDayDiffInSeconds(now: Date, target: Date): number {
  const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetLocal = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round((nowLocal.getTime() - targetLocal.getTime()) / 1000);
}

/** Relative time for past dates (e.g. "2 days ago"). */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const pastDate =
    typeof date === 'string' ? parseBackendDateTime(date) : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  return formatRelativeDuration(diffInSeconds, 'ago', 'Just now', 'exact');
}

/** Relative time for future dates without suffix (e.g. "2 days"). */
export function getRelativeTimeFuture(date: Date | string | number): string {
  const now = new Date();
  const futureDate =
    typeof date === 'string' ? parseBackendDateTime(date) : new Date(date);
  const diffInSeconds = Math.floor(
    (futureDate.getTime() - now.getTime()) / 1000,
  );
  return formatRelativeDuration(diffInSeconds, '', 'Now', 'exact');
}

/** Relative time for any date: past ("2 days ago") or future ("in 2 days"). */
export function getRelativeTimePastOrFuture(
  date: Date | string | number,
): string {
  const now = new Date();
  const target =
    typeof date === 'string' ? parseBackendDateTime(date) : new Date(date);
  const diffInSeconds = target.getTime() - now.getTime();

  if (diffInSeconds >= 0) {
    if (diffInSeconds < 5 * 1000) return 'Now';
    const calendarDiffSec = -getCalendarDayDiffInSeconds(now, target);
    const relative = formatRelativeDuration(
      Math.max(0, calendarDiffSec),
      '',
      'Now',
      'calendar',
    );
    return relative === 'Now' ? 'Now' : `in ${relative.toLowerCase()}`;
  }

  const calendarDiffSec = getCalendarDayDiffInSeconds(now, target);
  return formatRelativeDuration(
    calendarDiffSec,
    'ago',
    'Just now',
    'calendar',
  );
}

/**
 * Serialize a Date to the naive LocalDateTime format the backend expects.
 * Sends raw wall-clock components only — no timezone suffix.
 * Format: YYYY-MM-DDTHH:mm:ss[.SSS]
 */
export function toLocalDateTime(
  date: Date,
  includeMilliseconds = true,
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (!includeMilliseconds) {
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
}

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
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(d);
};

/** Format a time-only string. Output: "12:09 pm" */
export function formatTimeOnly(date: Date = new Date()): string {
  return format(date, 'h:mm aa');
}

/** Format a weekday + date string. Output: "Wednesday 21 January 2026" */
export function formatWeekdayDate(date: Date = new Date()): string {
  return format(date, 'EEEE d MMMM yyyy');
}

/** Compact dispatch/scheduler date label. Output: "Mon 28 Jan" */
export function formatDispatchDateLabel(timeStr?: string): string {
  if (!timeStr) return '';
  if (!timeStr.includes('T')) return timeStr;
  const date = parseBackendDateTime(timeStr);
  return format(date, 'EEE dd MMM');
}
