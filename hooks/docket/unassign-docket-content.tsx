'use client';

import { Package, AlertTriangle, ArrowRight, Truck } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { formatDateWithOrdinal, formatTimeRange } from '@/lib/utils/date';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { formatUomLabel } from '@/lib/utils/docket-helper';

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
        </div>
      </div>
    </div>
  );
}

export function UnassignDocketContent({ docket }: { docket?: DocketDTO | null }) {
  const uom = formatUomLabel(docket?.jobItem?.productSellUom ?? '');

  return (
    <div className="flex flex-col gap-6">

      <p className="text-base text-[#364153]">
        Are you sure you want to unassign this docket?
      </p>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-start gap-1.5">
          <AlertTriangle
            className="h-4 w-4 shrink-0 text-amber-700 mt-1"
            aria-hidden
          />
          <span className="text-md font-semibold text-[#92400E]">
            Load size will be reset
          </span>
        </div>

        <p className="text-sm text-[#78350F] leading-relaxed">
          Returning to Unassigned will reset the{' '}
          <span className="font-bold">Actual Load Size</span> back to the{' '}
          <span className="font-bold">Planned Load Size</span>.
        </p>

        <div className="rounded-xl bg-[#FFFBF2] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78350F]">
                Actual (current)
              </span>
              <p className="text-lg font-bold leading-tight text-[#78350F]">
                {formatNumberThousandSeparator(docket?.actualLoadSize)}{' '}
                <span className="text-base font-semibold">{uom}</span>
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-0.5 px-1">
              <ArrowRight
                className="h-5 w-5 text-[#78350F]"
                aria-hidden
              />
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#78350F]">
                Resets to
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78350F]">
                Planned
              </span>
              <p className="text-lg font-bold leading-tight text-[#2D5A4C]">
                {formatNumberThousandSeparator(docket?.plannedLoadSize)}{' '}
                <span className="text-base font-semibold">{uom}</span>
              </p>
            </div>
          </div>
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

      {
        docket?.truck?.licensePlate && docket?.driver?.driverName && (
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
                  {formatTimeRange(
                    docket?.deliveryCollectionStartTime,
                    docket?.deliveryCollectionEndTime,
                    { hour12: true },
                  ) || '—'}
                </p>
              </div>
            </div>
          </div>
        )
      }

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
