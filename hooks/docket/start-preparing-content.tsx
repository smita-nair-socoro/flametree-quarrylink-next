'use client';

import { ClipboardList } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';

export function StartPreparingDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
        <ClipboardList className="h-6 w-6 text-[#F97316]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          <span className="font-bold">•</span>
          <span>
            {docket?.actualLoadSize || docket?.plannedLoadSize}{' '}
            {docket?.jobItem?.productSellUom === 'M3'
              ? 'm³'
              : docket?.jobItem?.productSellUom === 'KG_20'
                ? 'x 20kg'
                : docket?.jobItem?.productSellUom === 'TN'
                  ? 'TN'
                  : docket?.jobItem?.productSellUom === 'BULKA'
                    ? 'Bulka'
                    : docket?.jobItem?.productSellUom}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StartPreparingContent({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md bg-[#F9FAFB] px-4 py-3">
        <div className="space-y-2 text-sm text-[#6A7282]">
          <div>
            <span className="font-medium text-[#364153]">Customer:</span>{' '}
            {docket?.customerContactName ?? '—'}
          </div>
          <div>
            <span className="font-medium text-[#364153]">Job:</span>{' '}
            {docket?.job.jobNumber ?? '—'}
          </div>
        </div>
      </div>

      <p className="text-base text-[#364153]">
        Are you sure you want to start preparing this collection docket?
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#111827]">
          What happens:
        </span>
        <ul className="list-disc space-y-1 pl-5 text-[14px] text-[#6B7280]">
          {[
            'Docket status changes from "Pending" to "Preparing"',
            'Operations is notified to begin preparing the order',
            'Once ready, docket can be marked as Ready for collection',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
