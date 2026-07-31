import { getSessionStorage, setSessionStorage } from './index';

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
  if (typeof window === 'undefined') return;
  try {
    const dataKey = `${tableId}_newRecordsData`;
    const existingData = getSessionStorage<T[]>(dataKey, []);
    const updatedData = Array.isArray(existingData) ? [...existingData] : [];
    const recordKey = String(record.id);
    const existingIndex = updatedData.findIndex(
      (r) => String(r.id) === recordKey,
    );
    if (existingIndex !== -1) {
      updatedData.splice(existingIndex, 1);
    }
    updatedData.unshift(record);
    setSessionStorage(dataKey, updatedData);

    addNewRecordId(tableId, record.id);
  } catch (err) {
    console.log('failed to add new record to sessionStorage:', err);
  }
}

/**
 * Add a new record ID to the table's "new records" list in sessionStorage
 * This allows the table to highlight and pin newly created records at the top
 * until the user refreshes, changes page/sort, or navigates away.
 */
export function addNewRecordId(tableId: string, recordId: number | string) {
  if (typeof window === 'undefined') return;
  try {
    const key = `${tableId}_newRecordIds`;
    const existing = getSessionStorage<string[]>(key, []);
    const updated = Array.isArray(existing) ? [...existing] : [];

    // Add new ID if not already in the list
    const recordKey = String(recordId);
    const existingIndex = updated.indexOf(recordKey);
    if (existingIndex !== -1) {
      updated.splice(existingIndex, 1);
    }
    // Put newest first so it appears at the very top
    updated.unshift(recordKey);
    setSessionStorage(key, updated);
    // Dispatch custom event to notify DataTable components
    window.dispatchEvent(new Event('sessionStorageUpdated'));
  } catch (err) {
    console.log('failed to add new record ID to sessionStorage:', err);
  }
}

/**
 * Remove a record ID from the table's "new records" list in sessionStorage
 * This is called when a record is deleted to clean up the pinned rows
 */
export function removeNewRecordId(tableId: string, recordId: number | string) {
  if (typeof window === 'undefined') return;
  try {
    const recordKey = String(recordId);
    let changed = false;

    const key = `${tableId}_newRecordIds`;
    const existing = getSessionStorage<string[]>(key, []);
    const updated = Array.isArray(existing) ? [...existing] : [];
    const existingIndex = updated.indexOf(recordKey);
    if (existingIndex !== -1) {
      updated.splice(existingIndex, 1);
      setSessionStorage(key, updated);
      changed = true;
    }

    const dataKey = `${tableId}_newRecordsData`;
    const existingData = getSessionStorage<{ id: number | string }[]>(
      dataKey,
      [],
    );
    const updatedData = Array.isArray(existingData)
      ? existingData.filter((r) => String(r.id) !== recordKey)
      : [];
    if (updatedData.length !== existingData.length) {
      setSessionStorage(dataKey, updatedData);
      changed = true;
    }

    if (changed) {
      // Dispatch custom event to notify DataTable components
      window.dispatchEvent(new Event('sessionStorageUpdated'));
    }
  } catch (err) {
    console.log('failed to remove new record ID from sessionStorage:', err);
  }
}

/**
 * Mark a record as having a sync error so the table can apply distinct highlight styling.
 * Uses a separate sessionStorage key from newRecordIds.
 */
export function addSyncErrorRecordId(
  tableId: string,
  recordId: number | string,
) {
  if (typeof window === 'undefined') return;
  try {
    const key = `${tableId}_syncErrorRecordIds`;
    const existing = getSessionStorage<string[]>(key, []);
    const updated = Array.isArray(existing) ? [...existing] : [];
    const recordKey = String(recordId);
    if (!updated.includes(recordKey)) {
      updated.unshift(recordKey);
      setSessionStorage(key, updated);
      window.dispatchEvent(new Event('sessionStorageUpdated'));
    }
  } catch (err) {
    console.log('failed to add sync error record ID to sessionStorage:', err);
  }
}
