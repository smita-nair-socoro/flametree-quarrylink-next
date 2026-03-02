'use client';
import { TriangleAlert } from 'lucide-react';
import { Job } from '@/lib/types/job';

const DUMMY_OUTSTANDING_AMOUNTS: Record<number, number> = {
  1: 12500,
  2: 22500,
  3: 72500,
  4: 62500,
  5: 42500,
  6: 30500,
};

export function SettleJobContent({ job }: { job?: Job | null }) {
  const outstandingAmount = job?.id
    ? (DUMMY_OUTSTANDING_AMOUNTS[job.id] ?? 0)
    : 0;
  const docketsNotFinalised = job?.uninvoicedDockets ?? 0;

  return (
    <div className="flex flex-col gap-5">
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
            <span className="text-sm text-[#6A7282] font-extrabold">·</span>
            <span className="text-sm text-[#6A7282]">{job?.customerName}</span>
          </div>
        </div>
      </div>

      <div className="border border-[#FECACA] rounded-md p-4 bg-[#FFF1F2]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#B91C1C] font-medium">
              Settlement Blocked
            </span>
            <span className="text-[14px] font-normal text-[#B91C1C]">
              Outstanding balance of $
              {outstandingAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              or dockets not in Invoiced / Cash Sale / Void status.
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-[#F3F4F6] py-2 px-4">
        <span className="text-[14px] font-medium text-[#111827]">
          Blocking Conditions
        </span>
        <div className="mt-2 divide-y divide-[#E5E7EB]">
          <div className="flex justify-between py-2 text-[14px] text-[#6B7280]">
            <span>Dockets not finalised</span>
            <span className="font-semibold text-[#E35700]">
              {docketsNotFinalised}
            </span>
          </div>
          <div className="flex justify-between py-2 text-[14px] font-medium text-[#111827]">
            <span>Outstanding Amount</span>
            <span className="font-semibold text-[#E11D48]">
              $
              {outstandingAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#111827]">
          Resolve outstanding invoices or payments:
        </span>
        <ul className="text-[14px] font-normal text-[#6B7280] space-y-1 list-disc list-outside pl-5">
          <li>All dockets must be in Paid, Cash Sale, or Voided status</li>
          <li>Outstanding balance must be $0</li>
        </ul>
      </div>
    </div>
  );
}
