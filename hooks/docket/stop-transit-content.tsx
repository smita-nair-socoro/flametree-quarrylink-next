'use client';

import { AlertTriangle, CircleStop } from 'lucide-react';
import { SelectOptions } from '@/components/ui/select-options';
import { Textarea } from '@/components/ui/textarea';
import { DocketDTO } from '@/lib/types/docket';

const STOP_REASONS = [
  { value: 'vehicle-breakdown', label: 'Vehicle breakdown' },
  { value: 'traffic-delay', label: 'Traffic delay' },
  { value: 'site-access-issue', label: 'Site access issue' },
  { value: 'customer-not-ready', label: 'Customer not ready' },
  { value: 'safety-concern', label: 'Safety concern' },
  { value: 'weather-conditions', label: 'Weather conditions' },
  { value: 'incorrect-delivery-details', label: 'Incorrect delivery details' },
  { value: 'load-issue-detected', label: 'Load issue detected' },
  { value: 'driver-rest-fatigue-break', label: 'Driver rest / fatigue break' },
  { value: 'awaiting-instructions', label: 'Awaiting instructions' },
  { value: 'other', label: 'Other' },
];

export function StopTransitDescription({ docket }: { docket?: DocketDTO | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
        <CircleStop className="h-6 w-6 text-[#F97316]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <span>{docket?.customerContactName ?? '—'}</span>
          <span className="font-bold">•</span>
          <span>{docket?.truckType ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

export function StopTransitContent({
  stopReason,
  onStopReasonChange,
  stopNotes,
  onStopNotesChange,
}: {
  stopReason: string;
  onStopReasonChange: (value: string) => void;
  stopNotes: string;
  onStopNotesChange: (value: string) => void;
}) {
  const notesRequired = stopReason === 'other';

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-[#FDBA74] bg-[#FFF7ED] px-4 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F97316]" />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[16px] text-[#9A3412]">
              Delivery Interruption
            </span>
            <span className="text-[14px] text-[#9A3412]">
              This will pause the delivery and mark it as Stopped. The driver
              can resume when the issue is resolved.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#DC2626]">
          Stop Reason (required):
        </label>
        <SelectOptions
          searchLabel="stop reason"
          options={STOP_REASONS}
          value={stopReason}
          onChange={(value) => onStopReasonChange(String(value))}
          placeholder="Select a reason..."
          className="h-11 bg-white text-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#374151]">
          Additional Notes{' '}
          {notesRequired ? (
            <span className="text-[#DC2626]">(required):</span>
          ) : (
            <span className="text-[#6B7280]">(optional):</span>
          )}
        </label>
        <Textarea
          value={stopNotes}
          onChange={(event) => onStopNotesChange(event.target.value)}
          aria-required={notesRequired}
          placeholder="Add any additional details about stopping this transit..."
          className="min-h-[96px] resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#101828]">
          What happens:
        </span>
        <ul className="list-disc space-y-1 pl-5 text-[14px] text-[#6A7282]">
          {[
            'Docket status changes to "Stopped"',
            'Admin is notified of the issue',
            'Driver can resume delivery when ready',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
