'use client';

import { XCircle, AlertTriangle } from 'lucide-react';
import { SelectOptions } from '@/components/ui/select-options';
import { Textarea } from '@/components/ui/textarea';
import { DocketDTO } from '@/lib/types/docket';

export const CANCEL_REASON_LABELS: Record<string, string> = {
  customer_requested: 'Customer requested',
  job_cancelled: 'Job cancelled',
  incorrect_job_selected: 'Incorrect job selected',
  incorrect_product_recorded: 'Incorrect product recorded',
  incorrect_quantity_recorded: 'Incorrect quantity recorded',
  scheduling_conflict: 'Scheduling conflict',
  test_training_entry: 'Test / training entry',
  other: 'Other',
};

const CANCEL_REASONS = Object.entries(CANCEL_REASON_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function CancelDocketDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
        <XCircle className="h-6 w-6 text-[#E7000B]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          {docket?.loadSize != null && (
            <>
              <span className="font-bold">•</span>
              <span>
                {docket.loadSize} {docket.jobItem?.productSellUom}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CancelDocketContent({
  cancelReason,
  onCancelReasonChange,
  cancelNotes,
  onCancelNotesChange,
}: {
  cancelReason: string;
  onCancelReasonChange: (value: string) => void;
  cancelNotes: string;
  onCancelNotesChange: (value: string) => void;
}) {
  const notesRequired = cancelReason === 'other';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E7000B]" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#E7000B]">
            Cancellation Warning
          </span>
          <span className="text-sm text-[#E7000B]">
            This docket will be permanently cancelled. The quantity will be
            returned to the job&apos;s available quantity.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#364153]">
          Reason for cancelling <span className="text-[#DC2626]">*</span>
        </label>
        <SelectOptions
          searchLabel="cancel reason"
          options={CANCEL_REASONS}
          value={cancelReason}
          onChange={(value) => onCancelReasonChange(String(value))}
          placeholder="Select a reason..."
          className="h-11 bg-white text-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#364153]">
          Additional notes{' '}
          {notesRequired ? (
            <span className="text-[#DC2626]">*</span>
          ) : (
            <span className="font-normal text-[#6B7280]">(Optional)</span>
          )}
        </label>
        <Textarea
          value={cancelNotes}
          onChange={(event) => onCancelNotesChange(event.target.value)}
          placeholder="Add any additional details about cancelling this docket..."
          aria-required={notesRequired}
          className="min-h-[96px] resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#111827]">
          What happens:
        </span>
        <ul className="list-disc space-y-1 pl-5 text-[14px] text-[#6B7280]">
          {[
            'Docket is permanently cancelled',
            'Quantity returned to job',
            'Driver is unassigned (if applicable)',
            'Record kept for audit purposes',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
