'use client';

import { Package, AlertTriangle, Truck } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { formatDateWithOrdinal, formatTimeRange } from '@/lib/utils/date';

export function UnassignDocketDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]">
        <Package className="h-6 w-6 text-[#10B981]" />
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

export function UnassignDocketContent({ docket }: { docket?: DocketDTO | null }) {
  return (
    <div className="flex flex-col gap-6">

      <p className="text-base text-[#364153]">
        Are you sure you want to unassign this docket?
      </p>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 flex gap-3">
        <AlertTriangle
          className="h-5 w-5 shrink-0 text-amber-700 mt-0.5"
          aria-hidden
        />
        <div>
          <p className="text-sm font-semibold text-[#92400E]">
            Remove active assignment
          </p>
          <p className="text-sm text-[#78350F] mt-1 leading-relaxed">
            This docket&apos;s Actual Load Size differs from the Planned Load
            Size. Returning it to Unassigned will update Actual Load Size.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-gray-50 p-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
            Destination
          </p>
          <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
            {docket?.deliveryAddress?.formattedAddress || '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
            Customer
          </p>
          <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
            {docket?.job?.customerDto?.customerType === CUSTOMER_TYPE.INDIVIDUAL ? docket?.job?.customerDto?.individualContactName : docket?.job?.customerDto?.businessName}
          </p>
        </div>
      </div>

      {docket?.truck?.licensePlate && docket?.driver?.driverName && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
              <Truck className="h-4 w-4 text-rose-700" aria-hidden />
            </div>
            <span className="text-sm font-semibold text-rose-900">
              Current assignment
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="text-[11px] font-medium text-[#64748B]">Truck</p>
              <p className="font-semibold text-[#0F172A]">{docket?.truck?.licensePlate || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#64748B]">Driver</p>
              <p className="font-semibold text-[#0F172A]">{docket?.driver?.driverName || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#64748B]">
                Assignment date
              </p>
              <p className="font-semibold text-[#0F172A]">
                {formatDateWithOrdinal(docket?.deliveryCollectionDate) || '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#64748B]">
                Time window
              </p>
              <p className="font-semibold text-[#0F172A]">
                {formatTimeRange(docket?.deliveryCollectionStartTime, docket?.deliveryCollectionEndTime) || '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-2">
          What happens when you unassign:
        </p>
        <ul className="list-disc pl-5 text-sm text-[#475569] space-y-1.5">
          <li>
            Docket status returns to Unassigned
          </li>
          <li>
            The driver is notified that they have been unassigned from this
            docket
          </li>
        </ul>
      </div>
    </div>
  );
}
