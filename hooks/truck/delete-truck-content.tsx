'use client';

import { TriangleAlert } from 'lucide-react';
import { TruckDTO } from '@/lib/types/truck';

// ─── Delete ───────────────────────────────────────────────────────────────────

export function DeleteTruckDescription({ truck }: { truck?: TruckDTO | null }) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <span className="text-[16px] text-[#101828] font-medium">
        {truck?.licensePlate ?? '—'}
      </span>
    </div>
  );
}

export function DeleteTruckContent() {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to delete this truck?
      </span>

      {/* Cannot be undone warning */}
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-[#E7000B] flex-shrink-0" />
          <span className="text-[16px] font-medium text-[#991B1B]">
            This action cannot be undone
          </span>
        </div>
        <span className="text-[14px] text-[#B91C1C] pl-6">
          The truck will be permanently deleted.
        </span>
      </div>

      {/* Historical data preserved */}
      <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-4 flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#101828]">
          Historical data preserved
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'Details remain on all past dockets and delivery records',
            'Job history and completed deliveries remain accessible',
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

// ─── Cannot Delete ────────────────────────────────────────────────────────────

export function CannotDeleteTruckDescription({
  truck,
}: {
  truck?: TruckDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <span className="text-[16px] text-[#101828] font-medium">
        {truck?.licensePlate ?? '—'}
      </span>
    </div>
  );
}

export function CannotDeleteTruckContent({
  truck,
  activeDocketIds = [],
}: {
  truck?: TruckDTO | null;
  activeDocketIds?: number[];
}) {
  const docketCount = activeDocketIds.length;
  const docketLink = `/customer-operations/dockets/?docketId=${activeDocketIds.join(',')}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-[#E7000B] flex-shrink-0" />
          <span className="text-[14px] font-semibold text-[#991B1B]">
            Deletion Blocked
          </span>
        </div>
        <span className="text-[14px] text-[#E7000B] pl-6">
          {truck?.licensePlate ?? 'This truck'} has active deliveries in
          progress. All deliveries must be completed or reassigned before this
          truck can be deleted.
        </span>
      </div>

      {docketCount > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-gray-900">
            Active Dockets Found:
          </span>
          <div className="rounded-md border border-[#FFD6A7] bg-[#FFF3E6] px-4 py-3">
            <a
              href={docketLink}
              className="text-[14px] text-[#155DFC] underline font-medium"
            >
              {docketCount} active {docketCount === 1 ? 'docket' : 'dockets'}
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-gray-900">
          Required actions:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'Wait for active deliveries to be completed',
            'Or reassign dockets to another truck',
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
