'use client';

import { Ban } from 'lucide-react';
import { SelectOptions } from '@/components/ui/select-options';
import { Textarea } from '@/components/ui/textarea';
import { Docket } from '@/lib/types/docket';

interface VoidDocketContentProps {
  docket?: Docket | null;
  voidReason: string;
  onVoidReasonChange: (value: string) => void;
  voidNotes: string;
  onVoidNotesChange: (value: string) => void;
}

const VOID_REASONS = [
  { value: 'entered-in-error', label: 'Entered in error' },
  { value: 'duplicate-docket', label: 'Duplicate docket' },
  { value: 'incorrect-job-selected', label: 'Incorrect job selected' },
  { value: 'incorrect-product-recorded', label: 'Incorrect product recorded' },
  {
    value: 'incorrect-quantity-recorded',
    label: 'Incorrect quantity recorded',
  },
  { value: 'test-training-entry', label: 'Test / training entry' },
  { value: 'driver-reported-issue', label: 'Driver reported issue' },
  { value: 'other', label: 'Other' },
];

export function VoidDocketContent({
  docket,
  voidReason,
  onVoidReasonChange,
  voidNotes,
  onVoidNotesChange,
}: VoidDocketContentProps) {
  const notesRequired = voidReason === 'other';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
          <Ban className="h-6 w-6 text-[#E7000B]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-[#101828]">
            {docket?.docketNumber ?? '—'}
          </span>
          <div className="flex items-center gap-2 text-sm text-[#6A7282]">
            <span>{docket?.productName ?? '—'}</span>
            {docket?.loadSize != null && (
              <>
                <span className="font-bold">•</span>
                <span>
                  {docket.loadSize} {docket.productUoM}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#364153]">
          Reason for voiding <span className="text-[#DC2626]">*</span>
        </label>
        <SelectOptions
          searchLabel="void reason"
          options={VOID_REASONS}
          value={voidReason}
          onChange={(value) => onVoidReasonChange(String(value))}
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
          value={voidNotes}
          onChange={(event) => onVoidNotesChange(event.target.value)}
          placeholder="Add any additional details about voiding this docket..."
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
            'Docket quantity stays the same and will not be added back to job',
            'Docket status changes to "Voided"',
            'Driver is unassigned (if applicable)',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
