import { getCurrencyLocale } from './tenant-config-helper';

/**
 * Convert a dollar‐amount (string or number) to integer cents.
 * Rounds to the nearest cent.
 * @throws if the input isn’t a valid number.
 */
export function dollarsToCents(value: string | number): number {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) {
    throw new Error(`Invalid dollar amount: ${value}`);
  }
  // Truncate to 2 decimal places to match the requirement (e.g., 0.325 -> 32 cents)
  return Math.trunc(Number(n + 'e2'));
}

export function roundToTwoDecimals(num: number): number {
  // Truncate to 2 decimal places as requested (e.g., 0.325 -> 0.32)
  return Number(Math.trunc(Number(num + 'e2')) + 'e-2');
}

export function centsToDollars(cents: number): string {
  const dollars = cents / 100;
  return formatDollars(dollars);
}

export function formatDollars(dollars: number | string): string {
  const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  if (isNaN(amount)) {
    return 'N/A';
  }
  return amount.toLocaleString(getCurrencyLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function centsToDollarsNum(value: string | number): number {
  const cents = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(cents)) {
    throw new Error(`Invalid cents amount: ${value}`);
  }
  return roundToTwoDecimals(cents / 100);
}
