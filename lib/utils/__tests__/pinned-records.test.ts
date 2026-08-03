import { afterEach, describe, expect, test } from 'vitest';
import { usePinnedRecordsStore } from '@/app/stores/pinned-records-store';
import {
  addNewRecord,
  removeNewRecordId,
  addSyncErrorRecordId,
} from '../pinned-records';

afterEach(() => {
  usePinnedRecordsStore.setState({ byTableId: {} });
});

describe('addNewRecord', () => {
  test('removes a record id from the list', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    addNewRecord('table', { id: 2, name: 'Second' });
    removeNewRecordId('table', 1);
    expect(usePinnedRecordsStore.getState().byTableId.table.ids).toEqual([
      '2',
    ]);
  });

  test('stores the full record and pins its id', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    expect(usePinnedRecordsStore.getState().byTableId.table.ids).toEqual([
      '1',
    ]);
    expect(usePinnedRecordsStore.getState().byTableId.table.records).toEqual([
      { id: 1, name: 'First' },
    ]);
  });

  test('moves an existing record to the front instead of duplicating it', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    addNewRecord('table', { id: 2, name: 'Second' });
    addNewRecord('table', { id: 1, name: 'First (updated)' });
    expect(usePinnedRecordsStore.getState().byTableId.table.records).toEqual([
      { id: 1, name: 'First (updated)' },
      { id: 2, name: 'Second' },
    ]);
  });

  test('removeNewRecordId also clears the stored full record', () => {
    addNewRecord('table', { id: 1, name: 'First' });
    removeNewRecordId('table', 1);
    expect(usePinnedRecordsStore.getState().byTableId.table.records).toEqual(
      [],
    );
  });
});

describe('addSyncErrorRecordId', () => {
  test('adds a record id without duplicating existing entries', () => {
    addSyncErrorRecordId('table', 1);
    addSyncErrorRecordId('table', 1);
    expect(
      usePinnedRecordsStore.getState().byTableId.table.syncErrorIds,
    ).toEqual(['1']);
  });
});
