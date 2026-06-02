'use client';

import {
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { ConflictingDocket } from '@/lib/types/docket';
import { formatDispatchConflictDetail } from '@/lib/utils/dispatch-helper';

export interface TimeConflictModalProps {
  viewType: 'trucks' | 'drivers';
  resourceName: string;
  conflicts: ConflictingDocket[];
  isLoading?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TimeConflictModalContent({
  viewType,
  resourceName,
  conflicts,
  isLoading,
  isConfirming,
  onConfirm,
  onCancel,
}: TimeConflictModalProps) {
  const resourceLabel = viewType === 'trucks' ? 'Driver' : 'Truck';

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle className="text-xl font-bold text-gray-900">
          Confirm Assignment
        </DialogTitle>
      </DialogHeader>

      <div className="px-6 pb-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[75vh]">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-700" />
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-amber-900">
                Potential scheduling conflicts
              </span>
              <span className="text-sm text-amber-800/90 leading-relaxed">
                Review the notes below. Proceeding may overlap trips, exceed
                recommended daily limits, or otherwise clash with existing work.
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
            <Spinner size="small" />
            <span>Checking for conflicts...</span>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {resourceLabel}
              </span>
              <p className="mt-1 text-base font-bold text-gray-900">
                {resourceName || '—'}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Details
              </span>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-2">
                {conflicts.map((c) => (
                  <li key={c.id}>{formatDispatchConflictDetail(c)}</li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              Do you want to proceed with this assignment despite these
              potential conflicts?
            </p>
          </>
        )}
      </div>

      <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isConfirming}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={onConfirm}
          disabled={isLoading || isConfirming || conflicts.length === 0}
        >
          {isConfirming ? 'Assigning...' : 'Confirm Assignment'}
        </Button>
      </div>
    </>
  );
}
