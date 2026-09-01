import { describe, expect, test } from 'vitest';
import { toAccountingSyncDisplay, accountingSyncLabel } from '../accounting-sync';

describe('toAccountingSyncDisplay', () => {
  test('maps SYNCED to Synced', () => {
    expect(toAccountingSyncDisplay('SYNCED')).toBe('SYNCED');
    expect(accountingSyncLabel('SYNCED')).toBe('Synced');
  });

  test('maps FAILED to Failed', () => {
    expect(toAccountingSyncDisplay('FAILED')).toBe('FAILED');
    expect(accountingSyncLabel('FAILED')).toBe('Failed');
  });

  test('maps in-progress invoice states to Not synced', () => {
    expect(toAccountingSyncDisplay('PENDING')).toBe('NOT_SYNCED');
    expect(toAccountingSyncDisplay('SALES_ORDER_SYNCED')).toBe('NOT_SYNCED');
    expect(toAccountingSyncDisplay(null)).toBe('NOT_SYNCED');
    expect(toAccountingSyncDisplay(undefined)).toBe('NOT_SYNCED');
    expect(accountingSyncLabel('SALES_ORDER_SYNCED')).toBe('Not synced');
  });
});
