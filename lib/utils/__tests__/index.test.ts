import { afterEach, describe, expect, test } from 'vitest';
import {
  cn,
  getLocalStorage,
  setLocalStorage,
  getSessionStorage,
  setSessionStorage,
  splitReasonNote,
  dateSortingFn,
} from '../index';

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('cn', () => {
  test('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  test('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('getLocalStorage / setLocalStorage', () => {
  test('round-trips a value through localStorage', () => {
    setLocalStorage('key', { a: 1 });
    expect(getLocalStorage('key', null)).toEqual({ a: 1 });
  });

  test('returns the default value when nothing is stored', () => {
    expect(getLocalStorage('missing', 'fallback')).toBe('fallback');
  });

  test('returns the default value when stored JSON is corrupt', () => {
    window.localStorage.setItem('bad', '{not json');
    expect(getLocalStorage('bad', 'fallback')).toBe('fallback');
  });
});

describe('getSessionStorage / setSessionStorage', () => {
  test('round-trips a value through sessionStorage', () => {
    setSessionStorage('key', [1, 2, 3]);
    expect(getSessionStorage('key', [])).toEqual([1, 2, 3]);
  });

  test('returns the default value when nothing is stored', () => {
    expect(getSessionStorage('missing', 'fallback')).toBe('fallback');
  });
});

describe('splitReasonNote', () => {
  test('splits reason and note on the first hyphen', () => {
    expect(
      splitReasonNote('Bad weather - reschedule to 9-10am'),
    ).toEqual({ reason: 'Bad weather', note: 'reschedule to 9-10am' });
  });

  test('formats underscore-separated reasons without a note', () => {
    expect(splitReasonNote('driver_unavailable')).toEqual({
      reason: 'Driver unavailable',
      note: undefined,
    });
  });

  test('returns empty reason and undefined note for blank input', () => {
    expect(splitReasonNote(undefined)).toEqual({
      reason: '',
      note: undefined,
    });
    expect(splitReasonNote('   ')).toEqual({ reason: '', note: undefined });
  });
});

describe('dateSortingFn', () => {
  const row = (value: string) => ({ getValue: () => value });

  test('sorts ascending by parsed date', () => {
    const result = dateSortingFn(
      row('2026-01-01T00:00:00'),
      row('2026-01-02T00:00:00'),
      'date',
    );
    expect(result).toBeLessThan(0);
  });

  test('treats invalid dates as sorting after valid ones', () => {
    expect(dateSortingFn(row('not-a-date'), row('2026-01-01'), 'date')).toBe(
      1,
    );
    expect(dateSortingFn(row('2026-01-01'), row('not-a-date'), 'date')).toBe(
      -1,
    );
  });

  test('returns 0 when both are invalid', () => {
    expect(dateSortingFn(row('a'), row('b'), 'date')).toBe(0);
  });
});
