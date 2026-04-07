'use client';

import { Info } from 'lucide-react';
import { TruckDTO } from '@/lib/types/truck';

export function ReactivateTruckDescription({
  truck,
}: {
  truck?: TruckDTO | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#EFF6FF] rounded-full flex-shrink-0">
        <span className="flex items-center justify-center">
          <Info className="h-[20px] w-[20px] text-[#2563EB]" />
        </span>
      </div>
      <span className="font-medium">{truck?.licensePlate ?? '—'}</span>
    </div>
  );
}

export function ReactivateTruckContent() {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        This will restore the truck to your active haulier. Please confirm the
        action below.
      </span>

      {/* Info box */}
      <div className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] p-4 flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-[#1E40AF]">
          Truck will be restored to active haulier
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'Truck will be restored to active haulier',
            'Historical data and maintenance records will be accessible',
            'Safety inspection will be required before use',
          ].map((item) => (
            <li key={item} className="flex gap-2 text-[14px] text-[#1D4ED8]">
              <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#1D4ED8] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
