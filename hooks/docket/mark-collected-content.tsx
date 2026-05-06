'use client';

import { Truck, CircleCheckBig } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';

export function MarkCollectedDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]">
        <Truck className="h-6 w-6 text-[#008236]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          <span className="font-bold">•</span>
          <span>
            {docket?.actualLoadSize || docket?.plannedLoadSize}
            {docket?.jobItem?.productSellUom}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MarkCollectedContent({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md bg-[#F9FAFB] px-4 py-3">
        <div className="text-sm text-[#6A7282]">
          <div>
            <span className="font-medium text-[#364153]">Customer:</span>{' '}
            {docket?.customerContactName ?? '—'}
          </div>
        </div>
      </div>

      <p className="text-base text-[#364153]">
        Are you sure you want to mark this order as collected? This confirms the
        logistics pickup is complete.
      </p>

      <div className="rounded-md border border-[#B9F8CF] bg-[#F0FDF4] px-4 py-4">
        <div className="flex items-start gap-3">
          <CircleCheckBig className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#008236]" />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[16px] text-[#008236]">
              Collection Complete
            </span>
            <span className="text-[14px] text-[#008236]">
              The order has been picked up and the collection workflow is
              complete.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#111827]">
          What happens:
        </span>
        <ul className="list-disc space-y-1 pl-5 text-[14px] text-[#6B7280]">
          {[
            'Docket status changes to "Collected"',
            'Job remaining quantity is updated',
            'Docket can be invoiced or marked as Cash Sale',
            'Collection workflow is finalized',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
