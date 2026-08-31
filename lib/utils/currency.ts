import { getCurrencyLocale } from './tenant-config-helper';

const CENTS_SCALE = 100;
/** Corrects IEEE 754 artifacts before truncation (e.g. 10 * 0.18 -> 1.80, not 1.79). */
const TRUNCATION_EPSILON = 1e-8;

function resolveDollarPlaces(dollarDecimalPlaces: number = 2): number {
  return dollarDecimalPlaces === 4 ? 4 : 2;
}

function truncateToScale(amount: number, places: number): number {
  const scale = 10 ** places;
  const scaled = amount * scale;
  const adjusted =
    scaled >= 0 ? scaled + TRUNCATION_EPSILON : scaled - TRUNCATION_EPSILON;
  return Math.trunc(adjusted) / scale;
}

function truncateToCents(amount: number): number {
  return truncateToScale(amount, 2) * CENTS_SCALE;
}

/**
 * Convert a dollar-amount (string or number) to cents.
 * 2dp tenants truncate to integer cents. 4dp tenants keep hundredths of a cent
 * so a rate of $2.2450 is stored as 224.50.
 */
export function dollarsToCents(
  value: string | number,
  dollarDecimalPlaces: number = 2,
): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(n)) {
    throw new TypeError(`Invalid dollar amount: ${value}`);
  }
  return truncateToScale(n, resolveDollarPlaces(dollarDecimalPlaces)) * CENTS_SCALE;
}

export function roundToTwoDecimals(num: number): number {
  // Truncate to 2 decimal places as requested (e.g., 0.325 -> 0.32)
  return truncateToCents(num) / CENTS_SCALE;
}

export function centsToDollars(
  cents: number,
  dollarDecimalPlaces: number = 2,
): string {
  return formatAmount(cents / 100, resolveDollarPlaces(dollarDecimalPlaces));
}

export function formatDollars(dollars: number | string): string {
  return formatAmount(dollars, 2);
}

/** Rates display at stored precision, including trailing zeros. */
export function formatUnitPrice(
  dollars: number | string,
  decimalPlaces: number = 2,
): string {
  return formatAmount(dollars, resolveDollarPlaces(decimalPlaces));
}

function formatAmount(dollars: number | string, decimalPlaces: number): string {
  const amount = typeof dollars === 'string' ? Number.parseFloat(dollars) : dollars;
  if (Number.isNaN(amount)) {
    return 'N/A';
  }
  return amount.toLocaleString(getCurrencyLocale(), {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

export function centsToDollarsNum(
  value: string | number,
  dollarDecimalPlaces: number = 2,
): number {
  const cents = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(cents)) {
    throw new TypeError(`Invalid cents amount: ${value}`);
  }
  return truncateToScale(cents / 100, resolveDollarPlaces(dollarDecimalPlaces));
}
