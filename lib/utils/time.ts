// Delay
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const DELIVERY_TIME_WINDOW_START = '04:00';
export const DELIVERY_TIME_WINDOW_END = '23:00';

/** Hourly options for delivery time window selects (04:00–23:00). */
export const DELIVERY_TIME_WINDOW_HOUR_OPTIONS = Array.from(
  { length: 20 },
  (_, i) => {
    const hour = String(i + 4).padStart(2, '0');
    return `${hour}:00`;
  },
);

export function parseDeliveryTimeWindowValue(timeStr?: string | null): string {
  if (!timeStr) return '';

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    return timeStr.substring(0, 5);
  }

  if (timeStr.includes('T')) {
    return timeStr.split('T')[1]?.substring(0, 5) ?? '';
  }

  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1]?.substring(0, 5) ?? '';
  }

  const date = new Date(timeStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return timeStr.substring(0, 5);
}

function isDeliveryTimeWindowHourInRange(hour: number): boolean {
  return hour >= 4 && hour <= 23;
}

/** Drops minutes so times align to the hour (e.g. 11:30 → 11:00). */
function snapDeliveryTimeWindowToHour(parsed: string): string {
  const [hourPart, minutePart] = parsed.split(':');
  const hour = Number.parseInt(hourPart, 10);
  const minutes = Number.parseInt(minutePart ?? '0', 10);

  if (Number.isNaN(hour)) return parsed;
  if (Number.isNaN(minutes) || minutes === 0) return parsed;

  return `${String(hour).padStart(2, '0')}:00`;
}

/** Clamps out-of-range start times to 04:00. */
export function normalizeDeliveryTimeWindowStart(
  timeStr?: string | null,
): string {
  const parsed = snapDeliveryTimeWindowToHour(
    parseDeliveryTimeWindowValue(timeStr),
  );
  if (!parsed) return '';

  const hour = Number.parseInt(parsed.split(':')[0], 10);
  if (Number.isNaN(hour) || !isDeliveryTimeWindowHourInRange(hour)) {
    return DELIVERY_TIME_WINDOW_START;
  }

  return parsed;
}

/** Clamps out-of-range end times to 23:00. */
export function normalizeDeliveryTimeWindowEnd(timeStr?: string | null): string {
  const parsed = snapDeliveryTimeWindowToHour(
    parseDeliveryTimeWindowValue(timeStr),
  );
  if (!parsed) return '';

  const hour = Number.parseInt(parsed.split(':')[0], 10);
  if (Number.isNaN(hour) || !isDeliveryTimeWindowHourInRange(hour)) {
    return DELIVERY_TIME_WINDOW_END;
  }

  return parsed;
}

function rebuildIsoWithNormalizedTime(
  iso: string,
  normalizedTime: string,
): string {
  const local = iso.replace('Z', '');
  const datePart = local.includes('T')
    ? local.split('T')[0]
    : local.split(' ')[0];
  const fractional = local.match(/T\d{2}:\d{2}:\d{2}(\.\d+)/)?.[1] ?? '';
  return `${datePart}T${normalizedTime}:00${fractional}`;
}

/** Normalizes ISO/local delivery start to allowed window (04:00–23:00, on the hour). */
export function normalizeDeliveryCollectionStartIso(
  iso?: string | null,
): string | undefined {
  if (!iso) return undefined;
  const normalizedTime = normalizeDeliveryTimeWindowStart(iso);
  if (!normalizedTime) return iso;
  return rebuildIsoWithNormalizedTime(iso, normalizedTime);
}

/** Normalizes ISO/local delivery end to allowed window (04:00–23:00, on the hour). */
export function normalizeDeliveryCollectionEndIso(
  iso?: string | null,
): string | undefined {
  if (!iso) return undefined;
  const normalizedTime = normalizeDeliveryTimeWindowEnd(iso);
  if (!normalizedTime) return iso;
  return rebuildIsoWithNormalizedTime(iso, normalizedTime);
}

export function getDeliveryTimeWindowHour(
  timeStr?: string | null,
): number | null {
  const parsed = parseDeliveryTimeWindowValue(timeStr);
  if (!parsed) return null;
  const hour = Number.parseInt(parsed.split(':')[0], 10);
  return Number.isNaN(hour) ? null : hour;
}

/** When end is set, start options at or after end are disabled. Start cannot be 23:xx (end must be later). */
export function isDeliveryTimeWindowStartOptionDisabled(
  option: string,
  endTime?: string | null,
): boolean {
  const optionNorm = parseDeliveryTimeWindowValue(option);
  if (!optionNorm) return false;

  const optionHour = Number.parseInt(optionNorm.split(':')[0], 10);
  if (Number.isNaN(optionHour) || optionHour >= 23) return true;

  const endNorm = parseDeliveryTimeWindowValue(endTime);
  if (!endNorm) return false;

  // option must be strictly before end (full HH:MM comparison)
  return optionNorm >= endNorm;
}

/** When start is set, end options at or before start are disabled. End cannot be 04:xx or earlier. */
export function isDeliveryTimeWindowEndOptionDisabled(
  option: string,
  startTime?: string | null,
): boolean {
  const optionNorm = parseDeliveryTimeWindowValue(option);
  if (!optionNorm) return false;

  const optionHour = Number.parseInt(optionNorm.split(':')[0], 10);
  if (Number.isNaN(optionHour) || optionHour <= 4) return true;

  const startNorm = parseDeliveryTimeWindowValue(startTime);
  if (!startNorm) return false;

  // option must be strictly after start (full HH:MM comparison)
  return optionNorm <= startNorm;
}
