import { describe, expect, test } from 'vitest';
import {
  distinctJobTableValues,
  jobTableAdditionalCount,
  jobTablePoNumbers,
} from '../job-table-values';

describe('distinctJobTableValues', () => {
  test('keeps first-seen order and drops blanks', () => {
    expect(
      distinctJobTableValues(['Sabeto', '', 'Nadi', 'Sabeto', '  ']),
    ).toEqual(['Sabeto', 'Nadi']);
  });

  test('PO matching is case-insensitive and keeps first stored casing', () => {
    expect(
      distinctJobTableValues(['PO1234', 'po1234', 'PO5678'], true),
    ).toEqual(['PO1234', 'PO5678']);
  });
});

describe('jobTableAdditionalCount', () => {
  test('badge is additional distinct values, not the total', () => {
    expect(jobTableAdditionalCount([])).toBe(0);
    expect(jobTableAdditionalCount(['PO1234'])).toBe(0);
    expect(jobTableAdditionalCount(['PO1234', 'PO5678'])).toBe(1);
    expect(jobTableAdditionalCount(['A', 'B', 'C'])).toBe(2);
  });
});

describe('jobTablePoNumbers', () => {
  test('uses aggregated list when present, otherwise job-level PO', () => {
    expect(jobTablePoNumbers(['PO-A', 'po-a'], undefined)).toEqual(['PO-A']);
    expect(jobTablePoNumbers([], 'PO-B')).toEqual(['PO-B']);
    expect(jobTablePoNumbers(undefined, '  ')).toEqual([]);
  });
});
