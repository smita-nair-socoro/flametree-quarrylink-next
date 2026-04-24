'use client';
import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BADGE_COLORS } from '@/lib/utils';

export type UnassignTruckInfo = {
  licensePlate: string;
  status: string;
};

export function UnassignTruckDescription({
  licensePlate,
  driverName,
}: {
  licensePlate: string;
  driverName: string;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FFF7ED] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#F97316]" />
        </span>
      </div>
      <span className="font-medium">
        {licensePlate} / {driverName}
      </span>
    </div>
  );
}

export function UnassignTruckBlockedContent({
  licensePlate,
  activeDocketIds = [],
}: {
  licensePlate: string;
  activeDocketIds?: number[];
}) {
  const docketCount = activeDocketIds.length;
  const docketLink = `/customer-operations/dockets/?docketId=${activeDocketIds.join(',')}`;

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to unassign this truck from the driver?
      </span>

      <div className="border border-[#FECACA] rounded-md p-4 bg-[#FEF2F2]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#991B1B] font-medium">
              Cannot Unassign Truck
            </span>
            <span className="text-[14px] font-normal text-[#B91C1C]">
              <span className="font-semibold">{licensePlate}</span> cannot be
              unassigned because they have active deliveries with this driver.
            </span>
          </div>
        </div>
      </div>

      <div className="border border-[#BAE6FD] rounded-md p-4 bg-[#F0F9FF]">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-[#155DFC]">
            Options
          </span>
          <ul className="flex flex-col gap-1 pl-1">
            <li className="flex gap-2 text-[14px] text-[#155DFC]">
              <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#155DFC] flex-shrink-0" />
              Wait for deliveries to be completed
            </li>
            <li className="flex gap-2 text-[14px] text-[#155DFC]">
              <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#155DFC] flex-shrink-0" />
              Transfer delivery dockets to another driver
            </li>
          </ul>
        </div>
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
    </div>
  );
}

export function UnassignTruckContent({ truck }: { truck: UnassignTruckInfo }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to unassign this truck from the driver?
      </span>

      <div className="flex items-center justify-between rounded-md border px-4 py-3 bg-[#F9FAFB] border-[#E5E5E5]">
        <span className="text-sm font-medium">{truck.licensePlate}</span>
        <Badge
          variant="outline"
          className={
            BADGE_COLORS[truck.status] ||
            'bg-green-100 text-green-800 border-green-300'
          }
        >
          {truck.status}
        </Badge>
      </div>
    </div>
  );
}
