import { usePinnedRecordsStore } from '@/app/stores/pinned-records-store';

// Pin a newly created record to the top of its table and highlight it,
// using the full object returned by the create API.
export function addNewRecord<T extends { id: number | string }>(
  tableId: string,
  record: T,
) {
  usePinnedRecordsStore.getState().addNewRecord(tableId, record);
}

// Pin a batch of newly created records in one store update (e.g. duplicate).
export function addNewRecords<T extends { id: number | string }>(
  tableId: string,
  records: T[],
) {
  usePinnedRecordsStore.getState().addNewRecords(tableId, records);
}

// Remove a record id from the table's pinned "new records" list.
export function removeNewRecordId(tableId: string, recordId: number | string) {
  usePinnedRecordsStore.getState().removeNewRecordId(tableId, recordId);
}

// Mark a record as sync-errored so the table can style it distinctly.
export function addSyncErrorRecordId(
  tableId: string,
  recordId: number | string,
) {
  usePinnedRecordsStore.getState().addSyncErrorRecordId(tableId, recordId);
}
