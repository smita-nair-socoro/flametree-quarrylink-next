import { describe, expect, test } from 'vitest';
import { sortByLabel, sortByLabelOtherLast } from '../sort-options';

describe('sortByLabel', () => {
  test('sorts by label ascending', () => {
    const items = [{ label: 'Charlie' }, { label: 'Alpha' }, { label: 'Bravo' }];
    expect(sortByLabel(items, (i) => i.label).map((i) => i.label)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
    ]);
  });

  test('is case-insensitive', () => {
    const items = [{ label: 'bravo' }, { label: 'Alpha' }, { label: 'charlie' }];
    expect(sortByLabel(items, (i) => i.label).map((i) => i.label)).toEqual([
      'Alpha',
      'bravo',
      'charlie',
    ]);
  });

  test('is accent-insensitive', () => {
    const items = [{ label: 'Zebra' }, { label: 'Émile' }, { label: 'Apple' }];
    expect(sortByLabel(items, (i) => i.label).map((i) => i.label)).toEqual([
      'Apple',
      'Émile',
      'Zebra',
    ]);
  });

  test('sorts using an arbitrary label accessor', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alpha' }];
    expect(sortByLabel(items, (i) => i.name).map((i) => i.name)).toEqual([
      'Alpha',
      'Charlie',
    ]);
  });

  test('does not mutate the input array', () => {
    const items = [{ label: 'Bravo' }, { label: 'Alpha' }];
    const original = [...items];
    sortByLabel(items, (i) => i.label);
    expect(items).toEqual(original);
  });

  test('returns an empty array for empty input', () => {
    expect(sortByLabel([], (i: { label: string }) => i.label)).toEqual([]);
  });
});

describe('sortByLabelOtherLast', () => {
  test('sorts alphabetically but keeps "Other" last', () => {
    const items = [
      { label: 'Other' },
      { label: 'Weather conditions' },
      { label: 'Driver reported issue' },
    ];
    expect(
      sortByLabelOtherLast(items, (i) => i.label).map((i) => i.label),
    ).toEqual(['Driver reported issue', 'Weather conditions', 'Other']);
  });

  test('keeps "Other reason" (not just the literal word "Other") last', () => {
    const items = [
      { label: 'Other reason' },
      { label: 'Scope of work changed' },
      { label: 'Budget or payment issues' },
    ];
    expect(
      sortByLabelOtherLast(items, (i) => i.label).map((i) => i.label),
    ).toEqual([
      'Budget or payment issues',
      'Scope of work changed',
      'Other reason',
    ]);
  });

  test('does not treat labels merely containing "other" as the pinned entry', () => {
    const items = [{ label: 'Another delay' }, { label: 'Other' }, { label: 'Access issue' }];
    expect(
      sortByLabelOtherLast(items, (i) => i.label).map((i) => i.label),
    ).toEqual(['Access issue', 'Another delay', 'Other']);
  });
});
