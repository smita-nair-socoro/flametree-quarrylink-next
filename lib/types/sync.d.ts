export interface SyncStatusResponse {
  state: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  entityType: 'PRODUCT' | 'CUSTOMER';
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  errorMessage: string | null;
}
