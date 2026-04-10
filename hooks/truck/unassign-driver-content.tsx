'use client';
import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BADGE_COLORS } from '@/lib/utils';

export type UnassignDriverInfo = {
  driverName: string;
  status: string;
};

export function UnassignDriverDescription({
  licensePlate,
  driverName,
}: {
  licensePlate: string;
  driverName: string;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <span className="font-medium">
        {licensePlate} / {driverName}
      </span>
    </div>
  );
}

export function UnassignDriverBlockedContent({
  driverName,
}: {
  driverName: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to unassign this driver from the truck?
      </span>

      <div className="border border-[#FECACA] rounded-md p-4 bg-[#FEF2F2]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#991B1B] font-medium">
              Cannot Unassign Truck
            </span>
            <span className="text-[14px] font-normal text-[#B91C1C]">
              <span className="font-semibold">{driverName}</span> cannot be
              unassigned because they have active deliveries with this truck.
            </span>
          </div>
        </div>
      </div>

      <div className="border border-[#BAE6FD] rounded-md p-4 bg-[#F0F9FF]">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-[#075985]">
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
    </div>
  );
}

export function UnassignDriverContent({
  driver,
}: {
  driver: UnassignDriverInfo;
}) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to unassign this driver from the truck?
      </span>

      <div className="flex items-center justify-between rounded-md border px-4 py-3">
        <span className="text-sm font-medium">{driver.driverName}</span>
        <Badge
          variant="outline"
          className={
            BADGE_COLORS[driver.status] ||
            'bg-green-100 text-green-800 border-green-300'
          }
        >
          {driver.status}
        </Badge>
      </div>
    </div>
  );
}
