import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type PinnedRecord = Record<string, unknown> & { id: number | string };

interface TablePinnedState {
  /** Pinned record ids, newest first. */
  ids: string[];
  /** Full records (e.g. straight from a create API response), newest first. */
  records: PinnedRecord[];
  syncErrorIds: string[];
}

const EMPTY_IDS: string[] = [];
const EMPTY_RECORDS: PinnedRecord[] = [];
const EMPTY_TABLE_STATE: TablePinnedState = {
  ids: EMPTY_IDS,
  records: EMPTY_RECORDS,
  syncErrorIds: EMPTY_IDS,
};

interface PinnedRecordsStore {
  byTableId: Record<string, TablePinnedState>;

  addNewRecordId: (tableId: string, recordId: number | string) => void;
  addNewRecord: (tableId: string, record: PinnedRecord) => void;
  addNewRecords: (tableId: string, records: PinnedRecord[]) => void;
  removeNewRecordId: (tableId: string, recordId: number | string) => void;
  addSyncErrorRecordId: (tableId: string, recordId: number | string) => void;
  /** Drop all pinned state for a table (page/sort change, refresh, navigating away). */
  clearPinned: (tableId: string) => void;
}

// Tracks "just created" records per table so DataTableClient can pin them to
// the top and highlight them, even before they're in the fetched page of data.
export const usePinnedRecordsStore = create<PinnedRecordsStore>()(
  devtools(
    (set) => ({
      byTableId: {},

      addNewRecordId: (tableId, recordId) => {
        const recordKey = String(recordId);
        set((state) => {
          const current = state.byTableId[tableId] ?? EMPTY_TABLE_STATE;
          return {
            byTableId: {
              ...state.byTableId,
              [tableId]: {
                ...current,
                ids: [
                  recordKey,
                  ...current.ids.filter((id) => id !== recordKey),
                ],
              },
            },
          };
        });
      },

      addNewRecord: (tableId, record) => {
        const recordKey = String(record.id);
        set((state) => {
          const current = state.byTableId[tableId] ?? EMPTY_TABLE_STATE;
          return {
            byTableId: {
              ...state.byTableId,
              [tableId]: {
                ...current,
                ids: [
                  recordKey,
                  ...current.ids.filter((id) => id !== recordKey),
                ],
                records: [
                  record,
                  ...current.records.filter(
                    (r) => String(r.id) !== recordKey,
                  ),
                ],
              },
            },
          };
        });
      },

      addNewRecords: (tableId, records) => {
        if (records.length === 0) return;
        const newKeys = new Set(records.map((r) => String(r.id)));
        set((state) => {
          const current = state.byTableId[tableId] ?? EMPTY_TABLE_STATE;
          return {
            byTableId: {
              ...state.byTableId,
              [tableId]: {
                ...current,
                ids: [
                  ...records.map((r) => String(r.id)),
                  ...current.ids.filter((id) => !newKeys.has(id)),
                ],
                records: [
                  ...records,
                  ...current.records.filter(
                    (r) => !newKeys.has(String(r.id)),
                  ),
                ],
              },
            },
          };
        });
      },

      removeNewRecordId: (tableId, recordId) => {
        const recordKey = String(recordId);
        set((state) => {
          const current = state.byTableId[tableId];
          if (!current) return state;
          return {
            byTableId: {
              ...state.byTableId,
              [tableId]: {
                ...current,
                ids: current.ids.filter((id) => id !== recordKey),
                records: current.records.filter(
                  (r) => String(r.id) !== recordKey,
                ),
              },
            },
          };
        });
      },

      addSyncErrorRecordId: (tableId, recordId) => {
        const recordKey = String(recordId);
        set((state) => {
          const current = state.byTableId[tableId] ?? EMPTY_TABLE_STATE;
          if (current.syncErrorIds.includes(recordKey)) return state;
          return {
            byTableId: {
              ...state.byTableId,
              [tableId]: {
                ...current,
                syncErrorIds: [recordKey, ...current.syncErrorIds],
              },
            },
          };
        });
      },

      clearPinned: (tableId) => {
        set((state) => {
          if (!state.byTableId[tableId]) return state;
          const rest = { ...state.byTableId };
          delete rest[tableId];
          return { byTableId: rest };
        });
      },
    }),
    { name: 'pinned-records-store' },
  ),
);

export const usePinnedNewRecordIds = (tableId: string) =>
  usePinnedRecordsStore((state) => state.byTableId[tableId]?.ids ?? EMPTY_IDS);

export const usePinnedNewRecordsData = (tableId: string) =>
  usePinnedRecordsStore(
    (state) => state.byTableId[tableId]?.records ?? EMPTY_RECORDS,
  );

export const usePinnedSyncErrorIds = (tableId: string) =>
  usePinnedRecordsStore(
    (state) => state.byTableId[tableId]?.syncErrorIds ?? EMPTY_IDS,
  );
