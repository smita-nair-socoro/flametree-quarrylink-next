export function sortByLabel<T>(
  items: readonly T[],
  getLabel: (item: T) => string,
): T[] {
  return [...items].sort((a, b) =>
    getLabel(a).localeCompare(getLabel(b), undefined, { sensitivity: 'base' }),
  );
}

export function sortByLabelOtherLast<T>(
  items: readonly T[],
  getLabel: (item: T) => string,
): T[] {
  const sorted = sortByLabel(items, getLabel);
  const isOther = (item: T) => /^other\b/i.test(getLabel(item).trim());
  const primary = sorted.filter((item) => !isOther(item));
  const other = sorted.filter(isOther);
  return [...primary, ...other];
}
