'use client';

import { CirclePlay, Truck } from 'lucide-react';
import { Docket } from '@/lib/types/docket';

export function StartDeliveryContent({ docket }: { docket?: Docket | null }) {
  const destination = docket?.deliveryAddress?.address?.formattedAddress ?? '—';
  const driverName = docket?.contactName ?? '—';
  const truckLabel = docket?.truckType ?? '—';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]">
          <CirclePlay className="h-5 w-5 text-[#2563EB]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-[#111827]">
            {docket?.docketNumber ?? '—'}
          </span>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
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

      <div className="rounded-md bg-[#F3F4F6] px-4 py-3">
        <div className="space-y-2 text-sm text-[#4B5563]">
          <div>
            <span className="font-medium text-[#374151]">Driver:</span>{' '}
            {driverName}
          </div>
          <div>
            <span className="font-medium text-[#374151]">Truck:</span>{' '}
            {truckLabel}
          </div>
          <div>
            <span className="font-medium text-[#374151]">Destination:</span>{' '}
            {destination}
          </div>
        </div>
      </div>

      <p className="text-base text-[#374151]">
        Are you sure you want to start this delivery?
      </p>

      <div className="rounded-md border border-[#BFDBFE] bg-[#DBEAFE] px-4 py-4">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2563EB]" />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[#1D4ED8]">Delivery Started</span>
            <span className="text-sm text-[#1D4ED8]">
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
            'Delivery tracking begins',
            'Customer can track delivery progress',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
