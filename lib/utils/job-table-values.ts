export function distinctJobTableValues(
  values: Array<string | null | undefined>,
  caseInsensitive = false,
): string[] {
  const seen = new Map<string, string>();
  for (const raw of values) {
    const stored = raw?.trim();
    if (!stored) continue;
    const key = caseInsensitive ? stored.toLowerCase() : stored;
    if (!seen.has(key)) {
      seen.set(key, stored);
    }
  }
  return [...seen.values()];
}

export function jobTableAdditionalCount(values: string[]): number {
  return Math.max(values.length - 1, 0);
}

export function jobTablePoNumbers(
  poNumbers?: string[] | null,
  poNumber?: string | null,
): string[] {
  if (poNumbers && poNumbers.length > 0) {
    return distinctJobTableValues(poNumbers, true);
  }
  return distinctJobTableValues([poNumber], true);
}
