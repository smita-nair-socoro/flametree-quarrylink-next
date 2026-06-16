// Number format helper functions
export function formatNumberThousandSeparator(
  number: number | undefined | null,
): string {
  return (number ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumberThousandSeparatorWithoutDecimal(
  number: number | undefined | null,
): string {
  return (number ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
