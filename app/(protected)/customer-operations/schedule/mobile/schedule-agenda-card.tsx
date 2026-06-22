'use client';

import { isSameDay } from 'date-fns';
import { MapPin, Truck } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';
import { cn } from '@/lib/utils';
import type { DispatchBoardDocketRow } from '@/lib/types/docket';
import {
  formatTime,
  formatTimeRange,
  getDispatchStatusStripeClass,
} from '@/lib/utils/dispatch-helper';

export type ScheduleAgendaDocket = DispatchBoardDocketRow & {
  driverName?: string;
  truckName?: string;
  truckId?: string;
};

export function docketOnLocalDay(docket: ScheduleAgendaDocket, day: Date): boolean {
  if (!docket.deliveryCollectionDate) return false;
  const localTimeStr = docket.deliveryCollectionDate.includes('T')
    ? docket.deliveryCollectionDate.replace('Z', '')
    : docket.deliveryCollectionDate;
  return isSameDay(new Date(localTimeStr), day);
}

export function ScheduleAgendaDocketCard({
  docket,
  onClick,
}: {
  docket: ScheduleAgendaDocket;
  onClick: () => void;
}) {
  const location = [docket.deliverySuburb, docket.deliveryState]
    .filter(Boolean)
    .join(', ');
  const personnel = [docket.truckName, docket.driverName]
    .filter(Boolean)
    .join(' · ');
  const startTime = formatTime(docket.deliveryCollectionStartTime) || '—';
  const timeRange = formatTimeRange(
    docket.deliveryCollectionStartTime,
    docket.deliveryCollectionEndTime,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-colors hover:bg-gray-50/80"
    >
      <div className="flex w-[72px] shrink-0 items-center justify-center border-r border-gray-100 bg-[#F8FAFC] px-2 py-4">
        <span className="text-lg font-bold tabular-nums text-[#0F172A]">
          {startTime}
        </span>
      </div>
      <div
        className={cn(
          'w-1 shrink-0',
          getDispatchStatusStripeClass(docket.docketStatus),
        )}
      />
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-[#0F172A]">
            {docket.customerName || 'Unknown customer'}
          </h3>
          <TableBadges names={[docket.docketStatus]} visibleCount={1} />
        </div>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-[#8E51FF]">
            {docket.docketNumber}
          </span>
          {timeRange ? (
            <span className="ml-2 font-medium text-[#8E51FF]">{timeRange}</span>
          ) : null}
        </p>
        {personnel ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#64748B]">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{personnel}</span>
          </p>
        ) : null}
        {location ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748B]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}
      </div>
    </button>
  );
}
