'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  SchedulerTrucksQueryOptions,
  SchedulerDriversQueryOptions,
} from '@/lib/api/scheduler';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import {
  DocketDTO,
  DispatchBoardDocketRow,
  DispatchTruckResource,
  DispatchDriverResource,
} from '@/lib/types/docket';
import { ScheduleFilter } from './schedule-filter';

type ViewType = 'trucks' | 'drivers';

type WeekViewDocket = DispatchBoardDocketRow & {
  driverName?: string;
  truckName?: string;
};

type ResourceRow = {
  id: string;
  name: string;
  subtitle?: string;
  type?: string;
  dockets: WeekViewDocket[];
};

function getChipColor(status: DOCKET_STATUS) {
  switch (status) {
    case DOCKET_STATUS.UNASSIGNED:
      return 'bg-gray-50 border-gray-300 text-gray-800';
    case DOCKET_STATUS.PENDING:
      return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    case DOCKET_STATUS.PREPARING:
      return 'bg-blue-50 border-blue-300 text-blue-800';
    case DOCKET_STATUS.READY:
      return 'bg-pink-50 border-pink-300 text-pink-800';
    case DOCKET_STATUS.COLLECTED:
      return 'bg-green-50 border-green-300 text-green-800';
    case DOCKET_STATUS.CANCELLED:
      return 'bg-red-50 border-red-300 text-red-800';
    case DOCKET_STATUS.VOIDED:
      return 'bg-gray-50 border-gray-300 text-gray-800';
    case DOCKET_STATUS.CASH_SALE:
      return 'bg-gray-50 border-gray-300 text-gray-800';
    case DOCKET_STATUS.ASSIGNED:
      return 'bg-cyan-50 border-cyan-300 text-cyan-800';
    case DOCKET_STATUS.IN_TRANSIT:
      return 'bg-indigo-50 border-indigo-300 text-indigo-800';
    case DOCKET_STATUS.ARRIVED:
      return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    case DOCKET_STATUS.DELIVERED:
      return 'bg-green-50 border-green-300 text-green-800';
    case DOCKET_STATUS.INVOICED:
      return 'bg-purple-50 border-purple-300 text-purple-800';
    default:
      return 'bg-gray-50 border-gray-300 text-gray-800';
  }
}

function DocketChip({
  docket,
  onClick,
  isSelected = false,
}: {
  docket: WeekViewDocket;
  onClick: () => void;
  isSelected?: boolean;
}) {
  const customerName = docket.customerName || 'Unknown Customer';
  const location = docket.deliveryAddress || 'TBD';
  const colorClass = getChipColor(docket.docketStatus);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`text-[10px] p-2 rounded-lg border cursor-pointer hover:opacity-80 ${colorClass} ${
        isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''
      }`}
    >
      <div className="font-semibold flex justify-between mb-0.5">
        <span className="truncate w-[60%]">
          {docket.docketNumber || 'No Number'}
        </span>
        <span>
          {docket.loadSize}{' '}
          {docket.productSellUom === 'M3'
            ? 'm³'
            : docket.productSellUom === 'KG_20'
              ? 'x 20kg'
              : docket.productSellUom}
        </span>
      </div>
      <div className="truncate text-gray-700">{customerName}</div>
      <div className="truncate text-gray-500 mb-1">{location}</div>
      {docket.driverName && (
        <div className="truncate text-gray-500 mt-1">
          Driver: {docket.driverName}
        </div>
      )}
      {docket.truckName && (
        <div className="truncate text-gray-500">Truck: {docket.truckName}</div>
      )}
    </div>
  );
}

export function ScheduleWeekView({
  date,
  viewType,
  onDateChange,
}: {
  date: Date;
  viewType: ViewType;
  onDateChange?: (date: Date) => void;
}) {
  const [selectedDocketId, setSelectedDocketId] = useState<number | undefined>(
    undefined,
  );

  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
  const endDate = endOfWeek(date, { weekStartsOn: 1 });

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const { data: trucksData } = useQuery({
    ...SchedulerTrucksQueryOptions(startIso, endIso),
    enabled: viewType === 'trucks',
  });

  const { data: driversData } = useQuery({
    ...SchedulerDriversQueryOptions(startIso, endIso),
    enabled: viewType === 'drivers',
  });

  const resources: ResourceRow[] = useMemo(() => {
    if (viewType === 'trucks' && trucksData) {
      return (trucksData.resources || []).map((r) => {
        const truck = r as DispatchTruckResource;
        const dockets = (truck.dockets || []).map((d) => ({
          ...d,
          truckName: truck.licensePlate,
          driverName: truck.drivers?.[0]?.driverName,
        }));
        
        // Calculate total volume for the week
        const totalVolume = dockets.reduce((sum, d) => sum + (d.loadSize || 0), 0);
        const uom = dockets[0]?.productSellUom === 'M3' ? 'm³' : 'TN'; // Simplified

        return {
          id: String(truck.id),
          name: truck.licensePlate,
          subtitle: `${dockets.length} this week • ${totalVolume} ${uom}`,
          type: truck.drivers?.[0]?.driverType || 'INTERNAL',
          dockets,
        };
      });
    }

    if (viewType === 'drivers' && driversData) {
      return (driversData.resources || []).map((r) => {
        const driver = r as DispatchDriverResource;
        const dockets = (driver.dockets || []).map((d) => ({
          ...d,
          driverName: driver.driverName,
          truckName: driver.trucks?.[0]?.licensePlate,
        }));

        return {
          id: String(driver.id),
          name: driver.driverName,
          subtitle: `${dockets.length} this week`,
          dockets,
        };
      });
    }

    return [];
  }, [trucksData, driversData, viewType]);

  const allDockets = useMemo(() => {
    return resources.flatMap((r) => r.dockets);
  }, [resources]);

  const headerStats = useMemo(() => {
    const total = allDockets.length;
    const assignedCount = allDockets.filter(
      (d) => d.docketStatus === DOCKET_STATUS.ASSIGNED,
    ).length;

    const assignedDockets = allDockets.filter(
      (d) => d.docketStatus === DOCKET_STATUS.ASSIGNED,
    );
    const trucksBooked = new Set(
      assignedDockets
        .map((d) => d.truckName)
        .filter((name): name is string => Boolean(name)),
    ).size;

    const onTripDriverNames = new Set<string>();
    for (const d of allDockets) {
      if (
        d.docketStatus === DOCKET_STATUS.IN_TRANSIT ||
        d.docketStatus === DOCKET_STATUS.ARRIVED
      ) {
        if (d.driverName) onTripDriverNames.add(d.driverName);
      }
    }

    return {
      assignedCount,
      total,
      trucksBooked,
      driversOnTrips: onTripDriverNames.size,
    };
  }, [allDockets]);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const selectedDocket = selectedDocketId
    ? allDockets.find((d) => d.id === selectedDocketId)
    : null;

  const handleUnassign = () => {
    setSelectedDocketId(undefined);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      <ScheduleFilter viewType={viewType} />
      {/* Fixed top bar */}
      <div className="border-b pl-6 py-2.5 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-[#64748B]">
            THIS WEEK
          </span>
          <div className="border bg-green-50 border-green-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">
              {headerStats.assignedCount}/{headerStats.total}
            </span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Assigned
            </span>
          </div>
          <div className="border bg-blue-50 border-blue-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">
              {headerStats.trucksBooked}
            </span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Trucks booked this week
            </span>
          </div>
          <div className="border bg-purple-50 border-purple-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">
              {headerStats.driversOnTrips}
            </span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Drivers on trips
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white my-5 mx-3 rounded-xl border border-gray-300 shadow-md flex flex-col relative">
          <div className="bg-[#FAF5FF] border-b border-[#EDE9FE] px-5 py-4 shrink-0">
            <h3 className="text-sm font-semibold text-[#4C1D95]">
              View only
            </h3>
            <p className="text-xs text-[#6D28D9] mt-0.5">
              Assign and move dockets on Dispatch. Click a docket here to inspect details.
            </p>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
            <div className="p-4 font-semibold text-sm text-gray-700 border-r border-gray-200 flex items-center">
              {viewType === 'trucks' ? 'Truck' : 'Driver'}
            </div>
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toString()}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 flex flex-col items-center justify-center ${
                    isToday ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-purple-600' : 'text-gray-500'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-lg font-bold ${isToday ? 'text-purple-700' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {resources.map((resource) => (
              <div key={resource.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-gray-200 last:border-b-0">
                {/* Resource Info Cell */}
                <div className="p-4 border-r border-gray-200 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{resource.name}</span>
                    {resource.type && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        resource.type === 'INTERNAL' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resource.type}
                      </span>
                    )}
                  </div>
                  {resource.subtitle && (
                    <div className="text-xs text-gray-500">{resource.subtitle}</div>
                  )}
                </div>

                {/* Days Cells */}
                {days.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  
                  // Filter dockets for this specific day
                  const dayDockets = resource.dockets.filter((d) => {
                    if (!d.deliveryCollectionStartTime) return false;
                    const localTimeStr = d.deliveryCollectionStartTime.includes('T')
                      ? d.deliveryCollectionStartTime.replace('Z', '')
                      : d.deliveryCollectionStartTime;
                    return isSameDay(new Date(localTimeStr), day);
                  });

                  return (
                    <div
                      key={day.toString()}
                      className={`p-2 border-r border-gray-200 last:border-r-0 flex flex-col gap-2 ${
                        isToday ? 'bg-purple-50/20' : ''
                      }`}
                    >
                      {dayDockets.slice(0, 4).map((docket) => (
                        <DocketChip
                          key={docket.id}
                          docket={docket}
                          isSelected={selectedDocketId === docket.id}
                          onClick={() => setSelectedDocketId(docket.id)}
                        />
                      ))}
                      
                      {dayDockets.length > 4 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-[10px] cursor-pointer font-bold text-blue-800 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-1.5 px-2 w-full rounded-md transition-colors mt-auto text-center border border-blue-200">
                              +{dayDockets.length - 4} more dockets
                            </button>
                          </DialogTrigger>
                          <DialogContent className="overflow-y-auto max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>
                                All Dockets ({dayDockets.length})
                              </DialogTitle>
                              <p className="text-sm text-gray-500">
                                Select a docket to view its details.
                              </p>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 mt-4">
                              {dayDockets.map((docket) => (
                                <DocketChip
                                  key={docket.id}
                                  docket={docket}
                                  isSelected={selectedDocketId === docket.id}
                                  onClick={() => setSelectedDocketId(docket.id)}
                                />
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {resources.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No {viewType} found for this week.
              </div>
            )}
          </div>
        </div>

        {/* Fixed right panel — sticks to viewport height, scrolls internally */}
        {selectedDocket && (
          <div className="w-[23vw] shrink-0 border-l border-[#E2E8F0] bg-white shadow-sm overflow-y-auto flex flex-col">
            <DocketDetailsPanel
              docket={selectedDocket as unknown as DocketDTO}
              onClose={() => setSelectedDocketId(undefined)}
              onUnassign={handleUnassign}
            />
          </div>
        )}
      </div>
    </div>
  );
}
