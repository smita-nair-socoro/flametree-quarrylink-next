export type AccountingSyncDisplayStatus = 'SYNCED' | 'FAILED' | 'NOT_SYNCED';

export const ACCOUNTING_SYNC_LABEL: Record<AccountingSyncDisplayStatus, string> =
  {
    SYNCED: 'Synced',
    FAILED: 'Failed',
    NOT_SYNCED: 'Not synced',
  };

/** Flame Tree invoice statuses: SALES_ORDER_SYNCED is in progress → Not synced. */
export function toAccountingSyncDisplay(
  status?: string | null,
): AccountingSyncDisplayStatus {
  if (status === 'SYNCED') return 'SYNCED';
  if (status === 'FAILED') return 'FAILED';
  return 'NOT_SYNCED';
}

export function accountingSyncLabel(status?: string | null): string {
  return ACCOUNTING_SYNC_LABEL[toAccountingSyncDisplay(status)];
}
