'use client';

import { Play, Truck } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';

export function StartTransitDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]">
        <Play className="h-6 w-6 text-[#1E40AF]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#111827]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <span>{docket?.jobItem.product.productName ?? '—'}</span>
          {docket?.loadSize != null && (
            <>
              <span className="font-bold">•</span>
              <span>
                {docket.loadSize} {docket.jobItem.productSellUom}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function StartTransitContent({ docket }: { docket?: DocketDTO | null }) {
  const destination = docket?.deliveryAddress?.formattedAddress ?? '—';
  const driverName = docket?.customerContactName ?? '—';
  const truckLabel = docket?.jobItem.truckType ?? '—';

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md bg-[#F9FAFB] px-4 py-3">
        <div className="space-y-2 text-sm text-[#6A7282]">
          <div>
            <span className="font-medium text-[#364153]">Driver:</span>{' '}
            {driverName}
          </div>
          <div>
            <span className="font-medium text-[#364153]">Truck:</span>{' '}
            {truckLabel}
          </div>
          <div>
            <span className="font-medium text-[#364153]">Destination:</span>{' '}
            {destination}
          </div>
        </div>
      </div>

      <p className="text-base text-[#374151]">
        Are you sure you want to start this delivery?
      </p>

      <div className="rounded-md border border-[#BFDBFE] bg-[#DBEAFE] px-4 py-4">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1E40AF]" />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[16px] text-[#1E40AF]">
              Delivery Started
            </span>
            <span className="text-[14px] text-[#1E40AF]">
              The driver will be marked as In Transit and tracking will begin.
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
            'Transit tracking begins',
            'Customer can track transit progress',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
