'use client';
import { CircleX, TriangleAlert } from 'lucide-react';
import { SelectOptions } from '@/components/ui/select-options';
import { JobDTO } from '@/lib/types/job';
import { Textarea } from '@/components/ui/textarea';

export type CannotCancelBlockerType =
  | 'active_drivers'
  | 'unfinalised_dockets'
  | 'multiple_blockers';

export function CannotCancelJobDescription({
  job,
}: {
  job?: JobDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{job?.projectName}</span>
        <div className="flex justify-start gap-2">
          <span className="text-sm text-[#6A7282]">{job?.jobNumber}</span>
          {job?.customerDto?.businessName || job?.customerDto?.contactName && (
            <>
              <span className="text-sm text-[#6A7282] font-extrabold">·</span>
              <span className="text-sm text-[#6A7282]">{job?.customerDto?.businessName || job?.customerDto?.contactName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CannotCancelJobContent({
  blockerType,
  activeDeliveryCount = 0,
  deliveredDocketCount = 0,
  collectedDocketCount = 0,
}: {
  blockerType: CannotCancelBlockerType;
  activeDeliveryCount?: number;
  deliveredDocketCount?: number;
  collectedDocketCount?: number;
}) {
  const blockerMessage =
    blockerType === 'active_drivers'
      ? "This job can't be cancelled while deliveries are in progress"
      : blockerType === 'unfinalised_dockets'
        ? "This job can't be cancelled while completed work remains unfinalised"
        : "This job can't be cancelled while deliveries are in progress and completed work remains unfinalised";

  const blockingItems: string[] = [];
  if (
    (blockerType === 'active_drivers' || blockerType === 'multiple_blockers') &&
    activeDeliveryCount > 0
  ) {
    blockingItems.push(
      `${activeDeliveryCount} ${activeDeliveryCount === 1 ? 'delivery is' : 'deliveries are'} currently active (assigned or in transit)`,
    );
  }
  if (
    blockerType === 'unfinalised_dockets' ||
    blockerType === 'multiple_blockers'
  ) {
    if (deliveredDocketCount > 0 && collectedDocketCount > 0) {
      blockingItems.push(
        `${deliveredDocketCount} delivered ${deliveredDocketCount === 1 ? 'docket' : 'dockets'} and ${collectedDocketCount} collected ${collectedDocketCount === 1 ? 'docket' : 'dockets'} haven't been finalised`,
      );
    } else {
      if (deliveredDocketCount > 0) {
        blockingItems.push(
          `${deliveredDocketCount} delivered ${deliveredDocketCount === 1 ? 'docket' : 'dockets'} ${deliveredDocketCount === 1 ? "hasn't" : "haven't"} been finalised`,
        );
      }
      if (collectedDocketCount > 0) {
        blockingItems.push(
          `${collectedDocketCount} collected ${collectedDocketCount === 1 ? 'docket' : 'dockets'} ${collectedDocketCount === 1 ? "hasn't" : "haven't"} been finalised`,
        );
      }
    }
  }

  const actionItems: string[] = [];
  if (blockerType === 'active_drivers' || blockerType === 'multiple_blockers') {
    actionItems.push('Stop or unassign all active deliveries');
  }
  if (
    blockerType === 'unfinalised_dockets' ||
    blockerType === 'multiple_blockers'
  ) {
    if (deliveredDocketCount > 0) {
      actionItems.push('Invoice or void delivered dockets');
    }
    if (collectedDocketCount > 0) {
      actionItems.push('Invoice, mark as cash sale, or void collected dockets');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        This job cannot be cancelled due to the following restrictions:
      </span>

      <div className="border border-[#FECACA] rounded-md p-4 bg-[#FEF2F2]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#991B1B] font-medium">
              Cancellation Blocked
            </span>
            <span className="text-[14px] font-normal text-[#B91C1C]">
              {blockerMessage}
            </span>
          </div>
        </div>
      </div>

      {blockingItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-gray-900">
            What&apos;s blocking cancellation:
          </span>
          <ul className="flex flex-col gap-1 pl-1">
            {blockingItems.map((item, i) => (
              <li key={i} className="flex gap-2 text-[14px] text-[#6A7282]">
                <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#6A7282] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-gray-900">
            What needs to happen first:
          </span>
          <ul className="flex flex-col gap-1 pl-1">
            {actionItems.map((item, i) => (
              <li key={i} className="flex gap-2 text-[14px] text-[#6A7282]">
                <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#6A7282] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const CANCEL_REASON_LABELS: Record<string, string> = {
  customer_requested: 'Customer requested cancellation',
  project_cancelled_postponed: 'Project cancelled or postponed',
  budget_payment_issues: 'Budget or payment issues',
  scope_changed: 'Scope of work changed',
  supplier_unavailable: 'Supplier or materials unavailable',
  scheduling_conflict: 'Scheduling conflict',
  weather_or_site_conditions: 'Weather or site conditions',
  duplicate_job_entry: 'Duplicate job entry',
  other: 'Other reason',
};

const CANCEL_REASONS = Object.entries(CANCEL_REASON_LABELS).map(
  ([, label]) => ({ value: label, label }),
);

export function CancelJobDescription({ job }: { job?: JobDTO | null }) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FFE2E2] rounded-full">
        <span className="flex items-center justify-center">
          <CircleX className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{job?.projectName}</span>
        <div className="flex justify-start gap-2">
          <span className="text-sm text-[#6A7282]">{job?.jobNumber}</span>
          {job?.customerDto?.businessName || job?.customerDto?.contactName && (
            <>
              <span className="text-sm text-[#6A7282] font-extrabold">·</span>
              <span className="text-sm text-[#6A7282]">{job?.customerDto?.businessName || job?.customerDto?.contactName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CancelJobContent({
  cancelReason,
  onCancelReasonChange,
  cancelNotes,
  onCancelNotesChange,
}: {
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  cancelNotes: string;
  onCancelNotesChange: (notes: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to cancel this job?
      </span>

      <div className="border border-[#FFD6A7] rounded-md p-4 bg-[#FFF3E6]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#CA3500] font-medium">
              Business Impact
            </span>
            <span className="text-[14px] font-normal text-[#9F2D00]">
              Cancelling stops deliveries, unassigned dockets are
              auto-cancelled.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#E7000B]">
          Cancellation Reason (required):
        </label>
        <SelectOptions
          searchLabel="cancellation reason"
          options={CANCEL_REASONS}
          value={cancelReason}
          onChange={(value) => onCancelReasonChange(String(value))}
          placeholder="Select a reason..."
          className="h-10 bg-white text-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-normal text-[#6A7282]">
          Additional notes{' '}
          {cancelReason === CANCEL_REASON_LABELS.other ? (
            <span className="text-[#E7000B]">*</span>
          ) : (
            '(Optional)'
          )}
        </label>
        <Textarea
          value={cancelNotes}
          onChange={(e) => onCancelNotesChange(e.target.value)}
          placeholder="Add any additional details about cancelling this job..."
          className="min-h-[140px] resize-none placeholder:text-xs"
          rows={4}
        />
      </div>
    </div>
  );
}
