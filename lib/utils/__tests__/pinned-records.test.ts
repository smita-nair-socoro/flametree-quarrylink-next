import { afterEach, describe, expect, test, vi } from 'vitest';
import { getSessionStorage } from '../index';
import {
  addNewRecord,
  addNewRecordId,
  removeNewRecordId,
  addSyncErrorRecordId,
} from '../pinned-records';

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('addNewRecordId / removeNewRecordId', () => {
  test('adds a record id to the front of the list', () => {
    addNewRecordId('table', 1);
    addNewRecordId('table', 2);
    expect(getSessionStorage<string[]>('table_newRecordIds', [])).toEqual([
      '2',
      '1',
    ]);
  });

  test('moves an existing id to the front instead of duplicating it', () => {
    addNewRecordId('table', 1);
    addNewRecordId('table', 2);
    addNewRecordId('table', 1);
    expect(getSessionStorage<string[]>('table_newRecordIds', [])).toEqual([
      '1',
      '2',
    ]);
  });

  test('removes a record id from the list', () => {
    addNewRecordId('table', 1);
    addNewRecordId('table', 2);
    removeNewRecordId('table', 1);
    expect(getSessionStorage<string[]>('table_newRecordIds', [])).toEqual([
      '2',
    ]);
  });

  test('dispatches a sessionStorageUpdated event', () => {
    const handler = vi.fn();
    window.addEventListener('sessionStorageUpdated', handler);
    addNewRecordId('table', 1);
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('sessionStorageUpdated', handler);
  });
});

describe('addNewRecord', () => {
  test('stores the full record and pins its id', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    expect(getSessionStorage<string[]>('table_newRecordIds', [])).toEqual([
      '1',
    ]);
    expect(
      getSessionStorage<{ id: number; name: string }[]>(
        'table_newRecordsData',
        [],
      ),
    ).toEqual([{ id: 1, name: 'First' }]);
  });

  test('moves an existing record to the front instead of duplicating it', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    addNewRecord('table', { id: 2, name: 'Second' });
    addNewRecord('table', { id: 1, name: 'First (updated)' });
    expect(
      getSessionStorage<{ id: number; name: string }[]>(
        'table_newRecordsData',
        [],
      ),
    ).toEqual([
      { id: 1, name: 'First (updated)' },
      { id: 2, name: 'Second' },
    ]);
  });

  test('removeNewRecordId also clears the stored full record', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    removeNewRecordId('table', 1);
    expect(
      getSessionStorage<{ id: number; name: string }[]>(
        'table_newRecordsData',
        [],
      ),
    ).toEqual([]);
  });
});

describe('addSyncErrorRecordId', () => {
  test('adds a record id without duplicating existing entries', () => {
    addSyncErrorRecordId('table', 1);
    addSyncErrorRecordId('table', 1);
    expect(
      getSessionStorage<string[]>('table_syncErrorRecordIds', []),
    ).toEqual(['1']);
  });
});
