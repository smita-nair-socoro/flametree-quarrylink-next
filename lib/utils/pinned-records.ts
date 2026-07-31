import { usePinnedRecordsStore } from '@/app/stores/pinned-records-store';

/**
 * Pin a newly created record to the top of its table and mark it for highlighting.
 * Pass the full object returned by the create API so the table can render it
 * immediately, without needing it to be present in the currently fetched
 * (possibly server-paginated) page of data.
 *
 * Cleared automatically when the table's page/sort changes, on refresh, or when
 * navigating away (see components/ui/data-table-client.tsx).
 */
export function addNewRecord<T extends { id: number | string }>(
  tableId: string,
  record: T,
) {
  usePinnedRecordsStore.getState().addNewRecord(tableId, record);
}

/**
 * Add a new record ID to the table's "new records" list. This allows the
 * table to highlight and pin newly created records at the top until the
 * user refreshes, changes page/sort, or navigates away.
 */
export function addNewRecordId(tableId: string, recordId: number | string) {
  usePinnedRecordsStore.getState().addNewRecordId(tableId, recordId);
}

/**
 * Remove a record ID from the table's "new records" list. This is called
 * when a record is deleted to clean up the pinned rows.
 */
export function removeNewRecordId(tableId: string, recordId: number | string) {
  usePinnedRecordsStore.getState().removeNewRecordId(tableId, recordId);
}

/**
 * Mark a record as having a sync error so the table can apply distinct
 * highlight styling, separate from the newly-created highlight.
 */
export function addSyncErrorRecordId(
  tableId: string,
  recordId: number | string,
) {
  usePinnedRecordsStore.getState().addSyncErrorRecordId(tableId, recordId);
}
