import { describe, expect, test } from 'vitest';
import {
  applyDateRangePreset,
  toIsoDate,
} from '@/components/date-range-presets';

describe('applyDateRangePreset', () => {
  test('today sets from and to to the same day', () => {
    const range = applyDateRangePreset('today');
    expect(range.preset).toBe('today');
    expect(range.from).toBeDefined();
    expect(range.to).toBeDefined();
    expect(toIsoDate(range.from)).toBe(toIsoDate(range.to));
  });

  test('clear dates removes the range', () => {
    const range = applyDateRangePreset('clear');
    expect(range.preset).toBe('clear');
    expect(range.from).toBeUndefined();
    expect(range.to).toBeUndefined();
  });

  test('last 7 days spans 7 calendar days inclusive', () => {
    const range = applyDateRangePreset('last7');
    expect(range.from).toBeDefined();
    expect(range.to).toBeDefined();
    const from = range.from as Date;
    const to = range.to as Date;
    const days =
      Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    expect(days).toBe(7);
  });
});
