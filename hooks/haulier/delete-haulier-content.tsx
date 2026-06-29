'use client';

import { TriangleAlert } from 'lucide-react';
import { HaulierDTO } from '@/lib/types/haulier';

// ─── Delete ───────────────────────────────────────────────────────────────────

export function DeleteHaulierDescription({
  haulier,
}: {
  haulier?: HaulierDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <span className="text-[16px] text-[#101828] font-medium">
        {haulier?.haulierName ?? '—'}
      </span>
    </div>
  );
}

export function DeleteHaulierContent() {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to delete this haulier?
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
          The haulier will be permanently deleted.
        </span>
      </div>

      {/* Impact warning */}
      <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-4 flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#101828]">
          What happens when deleted:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'You will not be able to create drivers under this haulier',
            'You will not be able to create trucks under this haulier',
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

export function CannotDeleteHaulierDescription({
  haulier,
}: {
  haulier?: HaulierDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[16px] text-[#101828] font-medium">
          {haulier?.haulierName ?? '—'}
        </span>
        <span className="text-[13px] text-[#6A7282]">
          #{haulier?.id} &bull; {haulier?.emailAddress}
        </span>
      </div>
    </div>
  );
}

export function CannotDeleteHaulierContent({
  haulier,
  activeDriverCount = 0,
  activeTruckCount = 0,
}: {
  haulier?: HaulierDTO | null;
  activeDriverCount?: number;
  activeTruckCount?: number;
}) {
  const totalCount = activeDriverCount + activeTruckCount;

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        This haulier cannot be deleted due to active records:
      </span>

      {/* Blocked warning */}
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-[#E7000B] flex-shrink-0" />
          <span className="text-[14px] font-semibold text-[#991B1B]">
            Active Records Found
          </span>
        </div>
        <span className="text-[14px] text-[#E7000B] pl-6">
          This haulier has {totalCount} active record(s) that must be resolved
          before deletion.
        </span>
      </div>

      {/* Active drivers */}
      {activeDriverCount > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-gray-900">
            Active Drivers ({activeDriverCount}):
          </span>
          <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
            <a
              href={`/logistics/drivers?haulierId=${haulier?.id}`}
              className="text-[14px] text-[#155DFC] underline font-medium"
            >
              {activeDriverCount} active{' '}
              {activeDriverCount === 1 ? 'driver' : 'drivers'}
            </a>
          </div>
        </div>
      )}

      {/* Active trucks */}
      {activeTruckCount > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-gray-900">
            Active Trucks ({activeTruckCount}):
          </span>
          <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
            <a
              href={`/logistics/trucks?haulierId=${haulier?.id}`}
              className="text-[14px] text-[#155DFC] underline font-medium"
            >
              {activeTruckCount} active{' '}
              {activeTruckCount === 1 ? 'truck' : 'trucks'}
            </a>
          </div>
        </div>
      )}

      {/* Resolution steps */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-gray-900">
          To delete this haulier:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'Reassign or remove all drivers linked to this haulier',
            'Reassign or remove all trucks linked to this haulier',
            'Complete or cancel all active dockets and jobs, then haulier can be deleted',
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
