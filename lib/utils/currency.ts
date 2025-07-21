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
  // Multiply by 100 and round to avoid fp imprecision
  return Math.round(n * 100);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
