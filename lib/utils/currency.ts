import { getCurrencyLocale } from './tenant-config-helper';

const CENTS_SCALE = 100;
/** Corrects IEEE 754 artifacts before truncation (e.g. 10 * 0.18 -> 1.80, not 1.79). */
const TRUNCATION_EPSILON = 1e-8;

function truncateToCents(amount: number): number {
  const scaled = amount * CENTS_SCALE;
  const adjusted =
    scaled >= 0 ? scaled + TRUNCATION_EPSILON : scaled - TRUNCATION_EPSILON;
  return Math.trunc(adjusted);
}

/**
 * Convert a dollar‐amount (string or number) to integer cents.
 * Truncates to the nearest cent.
 * @throws if the input isn’t a valid number.
 */
export function dollarsToCents(value: string | number): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(n)) {
    throw new TypeError(`Invalid dollar amount: ${value}`);
  }
  // Truncate to 2 decimal places to match the requirement (e.g., 0.325 -> 32 cents)
  return truncateToCents(n);
}

export function roundToTwoDecimals(num: number): number {
  // Truncate to 2 decimal places as requested (e.g., 0.325 -> 0.32)
  return truncateToCents(num) / CENTS_SCALE;
}

export function centsToDollars(cents: number): string {
  const dollars = cents / 100;
  return formatDollars(dollars);
}

export function formatDollars(dollars: number | string): string {
  const amount = typeof dollars === 'string' ? Number.parseFloat(dollars) : dollars;
  if (Number.isNaN(amount)) {
    return 'N/A';
  }
  return amount.toLocaleString(getCurrencyLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function centsToDollarsNum(value: string | number): number {
  const cents = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(cents)) {
    throw new TypeError(`Invalid cents amount: ${value}`);
  }
  return roundToTwoDecimals(cents / 100);
}
