// Number format helper functions
export function formatNumberThousandSeparator(number: number | undefined | null, decimals = 2): string {
  return (number ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
