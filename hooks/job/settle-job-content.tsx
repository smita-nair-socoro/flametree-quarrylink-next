'use client';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { JobDTO } from '@/lib/types/job';
import { centsToDollars } from '@/lib/utils/currency';

export function SettleJobDescription({ job }: { job?: JobDTO | null }) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#EFF6FF] rounded-md">
        <span className="flex items-center justify-center">
          <CircleAlert className="h-[20px] w-[20px] text-[#155DFC]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{job?.projectName}</span>
        <div className="flex justify-start gap-2">
          <span className="text-sm text-[#6A7282]">{job?.jobNumber}</span>
          <span className="text-sm text-[#6A7282] font-extrabold">·</span>
          <span className="text-sm text-[#6A7282]">
            {job?.customerDto?.customerType === 'BUSINESS'
              ? (job.customerDto.businessName || job?.contactPersonName)
              : (job?.customerDto?.individualContactName || job?.contactPersonName)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SettleJobInitialContent() {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[14px] font-medium text-[#111827]">
        Resolve outstanding invoices or payments:
      </span>
      <ul className="text-[14px] font-normal text-[#6B7280] space-y-1 list-disc list-outside pl-5">
        <li>All dockets must be in Paid, Cash Sale, or Voided status</li>
        <li>Outstanding balance must be $0</li>
      </ul>
    </div>
  );
}

interface SettleJobContentProps {
  job?: JobDTO | null;
  unfinalisedDocketsCount?: number;
  unfinalisedDocketsAmount?: number;
}

export function SettleJobContent({
  unfinalisedDocketsCount = 0,
  unfinalisedDocketsAmount = 0,
}: SettleJobContentProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="border border-[#FECACA] rounded-md p-4 bg-[#FFF1F2]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#B91C1C] font-medium">
              Settlement Blocked
            </span>
            <span className="text-[14px] font-normal text-[#B91C1C]">
              Outstanding balance of {centsToDollars(unfinalisedDocketsAmount)}{' '}
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
              {unfinalisedDocketsCount}
            </span>
          </div>
          <div className="flex justify-between py-2 text-[14px] font-medium text-[#111827]">
            <span>Outstanding Amount</span>
            <span className="font-semibold text-[#E11D48]">
              {centsToDollars(unfinalisedDocketsAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#111827]">
          <strong>Resolve outstanding dockets or payments:</strong>
        </span>
        <ul className="text-[14px] font-normal text-[#6B7280] space-y-1 list-disc list-outside pl-5">
          <li>All dockets must be in <strong>Invoiced</strong>, <strong>Cash Sale</strong>, or <strong>Voided</strong> status</li>
          <li>Uninvoiced balance must be <strong>$0</strong></li>
        </ul>
      </div>
    </div>
  );
}
