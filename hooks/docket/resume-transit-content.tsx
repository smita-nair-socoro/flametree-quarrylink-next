'use client';

import { Play, Truck } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';

export function ResumeTransitDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]">
        <Play className="h-6 w-6 text-[#008236]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
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

export function ResumeTransitContent({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  const stopReasonSummary = docket?.notes?.trim() || 'Vehicle breakdown';

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md bg-[#F3F4F6] px-4 py-3">
        <div className="space-y-2 text-sm text-[#6A7282]">
          <div>
            <span className="font-medium text-[#364153]">Driver:</span>{' '}
            {docket?.customerContactName ?? '—'}
          </div>
          <div>
            <span className="font-medium text-[#364153]">Truck:</span>{' '}
            {docket?.jobItem.truckType ?? '—'}
          </div>
          <div>
            <span className="font-medium text-[#364153]">Stop Reason:</span>{' '}
            {stopReasonSummary}
          </div>
        </div>
      </div>

      <p className="text-base text-[#364153]">
        Are you sure you want to resume this delivery? The driver will continue
        the delivery route.
      </p>

      <div className="rounded-md border border-[#B9F8CF] bg-[#F0FDF4] px-4 py-4">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#008236]" />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[16px] text-[#008236]">
              Delivery Resuming
            </span>
            <span className="text-[14px] text-[#008236]">
              The delivery will continue from where it was stopped. Tracking
              will resume.
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
            'Docket status changes to "In Transit"',
            'Delivery tracking resumes',
            'Stop record is preserved for audit',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
