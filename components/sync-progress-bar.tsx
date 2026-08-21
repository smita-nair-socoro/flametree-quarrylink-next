'use client';

import * as React from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SyncStatusResponse } from '@/lib/types/sync';

interface SyncProgressBarProps {
  syncStatus?: SyncStatusResponse;
  entityType: 'Product' | 'Customer';
}

export function SyncProgressBar({ syncStatus, entityType }: SyncProgressBarProps) {
  if (!syncStatus || syncStatus.state === 'IDLE') {
    return null;
  }

  if (syncStatus.state === 'IN_PROGRESS') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-blue-700">
              Syncing {entityType.toLowerCase()}s from accounting software...
            </span>
          </div>
          <Progress value={undefined} className="mt-1.5 h-1.5 bg-blue-200 [&>[data-slot=progress-indicator]]:bg-blue-600 [&>[data-slot=progress-indicator]]:animate-pulse" />
        </div>
      </div>
    );
  }

  if (syncStatus.state === 'COMPLETED') {
    const hasFailures = syncStatus.failureCount > 0;
    return (
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${hasFailures ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
        {hasFailures ? (
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
        )}
        <span className={`text-sm font-medium ${hasFailures ? 'text-amber-700' : 'text-green-700'}`}>
          {entityType} sync complete: {syncStatus.successCount} succeeded
          {syncStatus.failureCount > 0 && `, ${syncStatus.failureCount} failed`}
          {syncStatus.totalAttempted > 0 && ` (of ${syncStatus.totalAttempted} total)`}
        </span>
      </div>
    );
  }

  if (syncStatus.state === 'FAILED') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
        <span className="text-sm font-medium text-red-700">
          {entityType} sync failed{syncStatus.errorMessage ? `: ${syncStatus.errorMessage}` : ''}
        </span>
      </div>
    );
  }

  return null;
}
