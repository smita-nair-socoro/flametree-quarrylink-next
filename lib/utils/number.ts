// Number format helper functions
export function formatNumberThousandSeparator(number: number): string {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
