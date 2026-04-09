'use client';

import { Ban, TriangleAlert, CheckCircle2, CircleX } from 'lucide-react';
import { TruckDTO } from '@/lib/types/truck';

// ─── Deactivate ───────────────────────────────────────────────────────────────

export function DeactivateTruckDescription({
  truck,
}: {
  truck?: TruckDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-full flex-shrink-0">
        <span className="flex items-center justify-center">
          <Ban className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <span className="font-medium">{truck?.licensePlate ?? '—'}</span>
    </div>
  );
}

export function DeactivateTruckContent({
  assignedDrivers = [],
  completedDocketBreakdown = { delivered: 0, collected: 0, cancelled: 0 },
}: {
  assignedDrivers?: string[];
  completedDocketBreakdown?: {
    delivered: number;
    collected: number;
    cancelled: number;
  };
}) {
  const totalCompleted =
    completedDocketBreakdown.delivered +
    completedDocketBreakdown.collected +
    completedDocketBreakdown.cancelled;

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to deactivate this truck?
      </span>

      {/* Driver Assignment */}
      {assignedDrivers.length > 0 && (
        <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-[#CA8A04] flex-shrink-0" />
            <span className="text-[14px] font-medium text-[#854D0E]">
              Driver Assignment
            </span>
          </div>
          <div className="flex flex-col gap-1 ">
            {assignedDrivers.map((driver) => (
              <span key={driver} className="text-[14px] text-[#A16207]">
                {driver} will remain assigned to this truck.
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Preservation */}
      {totalCompleted > 0 && (
        <div className="rounded-md border border-[#BAE6FD] bg-[#F0F9FF] p-4 flex flex-col gap-2">
          <span className="text-[14px] font-medium text-[#075985]">
            Data Preservation
          </span>
          <span className="text-[14px] text-[#0C4A6E]">
            <span className="font-semibold">
              {totalCompleted} completed dockets
            </span>{' '}
            will be preserved:
          </span>
          <div className="flex flex-col gap-1 pl-1">
            {completedDocketBreakdown.delivered > 0 && (
              <div className="flex items-center gap-2 text-[14px] text-[#0369A1]">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#0EA5E9]" />
                {completedDocketBreakdown.delivered} Delivered
              </div>
            )}
            {completedDocketBreakdown.collected > 0 && (
              <div className="flex items-center gap-2 text-[14px] text-[#0369A1]">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#0EA5E9]" />
                {completedDocketBreakdown.collected} Collected
              </div>
            )}
            {completedDocketBreakdown.cancelled > 0 && (
              <div className="flex items-center gap-2 text-[14px] text-[#0369A1]">
                <CircleX className="h-4 w-4 flex-shrink-0 text-[#0EA5E9]" />
                {completedDocketBreakdown.cancelled} Cancelled
              </div>
            )}
            <div className="flex items-center gap-2 text-[14px] text-[#0369A1]">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#0EA5E9]" />
              All maintenance records
            </div>
          </div>
        </div>
      )}

      {/* Archive Effects */}
      <div className="flex flex-col gap-2 bg-[#F9FAFB] p-4 round-md">
        <span className="text-[14px] font-semibold text-[#101828] ">
          Archive Effects
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'Truck will be hidden from active truck lists',
            'Cannot be assigned to delivery dockets',
            'Historical data remains accessible',
            'Can be reactivated if needed',
          ].map((item) => (
            <li key={item} className="flex gap-2 text-[14px] text-[#6A7282]">
              <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#6A7282] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Cannot Deactivate ────────────────────────────────────────────────────────

export function CannotDeactivateTruckDescription({
  truck,
}: {
  truck?: TruckDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-full flex-shrink-0">
        <span className="flex items-center justify-center">
          <Ban className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <span className="font-medium">{truck?.licensePlate ?? '—'}</span>
    </div>
  );
}

export function CannotDeactivateTruckContent({
  activeDocketCount = 0,
}: {
  activeDocketCount?: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Error box */}
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <TriangleAlert className="h-4 w-4 text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-semibold text-[#991B1B]">
              Cannot deactivate Truck
            </span>
            <span className="text-[14px] text-[#B91C1C]">
              The following dockets must be completed, cancelled, voided or
              reassigned to another truck:
            </span>
          </div>
        </div>
      </div>

      {/* Active dockets */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-gray-900">
          Active Dockets Found:
        </span>
        <div className="rounded-md border border-[#FECACA] bg-[#FFF5F5] px-4 py-3">
          <span className="text-[14px] text-[#1D4ED8] underline cursor-pointer">
            {activeDocketCount}{' '}
            {activeDocketCount === 1 ? 'active docket' : 'active dockets'}
          </span>
        </div>
      </div>
    </div>
  );
}
