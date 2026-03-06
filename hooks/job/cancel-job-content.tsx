'use client';
import { CircleX, TriangleAlert } from 'lucide-react';
import { JobDetails } from '@/lib/types/job';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function CancelJobContent({
  job,
  cancelReason,
  onCancelReasonChange,
  cancelNotes,
  onCancelNotesChange,
}: {
  job?: JobDetails | null;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  cancelNotes: string;
  onCancelNotesChange: (notes: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
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
            {job?.customerName && (
              <>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">{job.customerName}</span>
              </>
            )}
          </div>
        </div>
      </div>

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
              Cancelling stops deliveries, unassigned dockets are auto-cancelled.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#E7000B]">
          Cancellation Reason (required):
        </label>
        <Select value={cancelReason} onValueChange={onCancelReasonChange}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            <SelectItem value="customer_requested">
              Customer requested cancellation
            </SelectItem>
            <SelectItem value="project_cancelled_postponed">
              Project cancelled or postponed
            </SelectItem>
            <SelectItem value="budget_payment_issues">
              Budget or payment issues
            </SelectItem>
            <SelectItem value="scope_changed">Scope of work changed</SelectItem>
            <SelectItem value="supplier_unavailable">
              Supplier or materials unavailable
            </SelectItem>
            <SelectItem value="scheduling_conflict">
              Scheduling conflict
            </SelectItem>
            <SelectItem value="weather_or_site_conditions">
              Weather or site conditions
            </SelectItem>
            <SelectItem value="duplicate_job_entry">
              Duplicate job entry
            </SelectItem>
            <SelectItem value="other">Other reason</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-normal text-[#6A7282]">
          Additional notes{' '}
          {cancelReason === 'other' ? (
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
