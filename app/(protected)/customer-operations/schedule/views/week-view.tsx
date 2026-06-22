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
  DispatchBoardDocketRow,
  DispatchTruckResource,
  DispatchDriverResource,
} from '@/lib/types/docket';
import {
  DispatchDriversTrucksFilter,
  type DispatchBoardFilterState,
} from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import {
  buildScheduleCustomerOptionsFromDockets,
  buildSchedulerFilterDriverOptions,
  buildSchedulerFilterHaulierOptions,
  buildSchedulerFilterTruckOptions,
  docketMatchesScheduleJobFilters,
  driverRowMatchesFilters,
  isDispatchDriverResource,
  isDispatchTruckResource,
  truckMatchesFleetFilters,
} from '@/lib/utils/dispatch-helper';
import { Button } from '@/components/ui/button';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { TableBadges } from '@/components/table-badges';

type ViewType = 'trucks' | 'drivers';

export type ScheduleWeekViewProps = {
  date: Date;
  viewType: ViewType;
  filter: DispatchBoardFilterState;
  onFilterChange: (next: DispatchBoardFilterState) => void;
};

type WeekViewDocket = DispatchBoardDocketRow & {
  driverName?: string;
  truckName?: string;
};

type ResourceRow = {
  id: string;
  name: string;
  companyLine?: string;
  weekSummaryLine: string;
  typeLabel: 'INTERNAL' | 'EXTERNAL';
  dockets: WeekViewDocket[];
};

const GRID_TEMPLATE = 'minmax(200px,1fr) repeat(7,minmax(0,1fr))';

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

function formatSellUomLabel(uom: string | undefined): string {
  if (uom === 'M3' || uom === 'm3') return 'm³';
  if (uom === 'KG_20') return '× 20kg';
  return uom || '';
}

function formatLoadLine(d: WeekViewDocket): string {
  const u = formatSellUomLabel(d.productSellUom);
  const loadSize = d.actualLoadSize || d.plannedLoadSize;
  return `${formatNumberThousandSeparator(loadSize)} ${u}`.trim();
}

function typeConvert(driverType?: string): 'INTERNAL' | 'EXTERNAL' {
  if (driverType === 'SUBCONTRACTOR') return 'EXTERNAL';
  return 'INTERNAL';
}

function buildWeekSummaryLine(dockets: WeekViewDocket[]): string {
  const n = dockets.length;
  if (n === 0) return '0 this week';
  return `${n} this week`;
}

function DocketChip({
  docket,
  onClick,
  isSelected = false,
  viewType,
}: {
  docket: WeekViewDocket;
  onClick: () => void;
  isSelected?: boolean;
  viewType: ViewType;
}) {
  const customerName = docket.customerName || 'Unknown Customer';
  const location = docket.deliverySuburb + ', ' + docket.deliveryState || 'TBD';
  const colorClass = getChipColor(docket.docketStatus);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left cursor-pointer rounded-lg border px-2.5 py-2 shadow-sm transition hover:brightness-[0.98] ${colorClass} ${isSelected ? 'ring-2 ring-[#8B5CF6] ring-offset-1' : ''
        }`}
    >
      <div
        className={`flex items-start justify-between gap-2 text-[11px] leading-tight font-bold`}
      >
        <span className="truncate min-w-0">{docket.docketNumber || '—'}</span>
        <span className="shrink-0 tabular-nums">{formatLoadLine(docket)}</span>
      </div>
      <div
        className={`mt-1 text-[11px] font-semibold leading-snug truncate opacity-90`}
      >
        {customerName}
      </div>
      <div className={`text-[11px] leading-snug truncate opacity-75`}>
        {location}
      </div>
      {viewType === 'trucks' && docket.driverName ? (
        <div className={`mt-1.5 text-[11px] truncate opacity-75`}>
          Driver: {docket.driverName}
        </div>
      ) : null}
      {viewType === 'drivers' && docket.truckName ? (
        <div className={`mt-1.5 text-[11px] truncate opacity-75`}>
          Truck: {docket.truckName}
        </div>
      ) : null}
    </button>
  );
}

const VISIBLE_DOCKETS_PER_CELL = 3;

export function ScheduleWeekView({
  date,
  viewType,
  filter,
  onFilterChange,
}: ScheduleWeekViewProps) {
  const [selectedDocketId, setSelectedDocketId] = useState<number | undefined>(
    undefined,
  );

  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const endDate = endOfWeek(date, { weekStartsOn: 1 });

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const { data: trucksData, isLoading: isLoadingTrucks } = useQuery({
    ...SchedulerTrucksQueryOptions(startIso, endIso),
    enabled: viewType === 'trucks',
  });

  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    ...SchedulerDriversQueryOptions(startIso, endIso),
    enabled: viewType === 'drivers',
  });

  const isLoadingResources =
    viewType === 'trucks' ? isLoadingTrucks : isLoadingDrivers;

  const resources: ResourceRow[] = useMemo(() => {
    if (viewType === 'trucks' && trucksData) {
      return (trucksData.resources || []).map((r) => {
        const truck = r as DispatchTruckResource;
        const dockets = (truck.dockets || []).map((d) => ({
          ...d,
          truckName: truck.licensePlate,
          driverName: truck.drivers?.[0]?.driverName,
        }));
        const haulierName =
          truck.haulier?.haulierName?.trim() || undefined;
        const typeLabel = typeConvert(truck.truckBusinessType);

        return {
          id: String(truck.id),
          name: truck.licensePlate,
          companyLine: haulierName,
          weekSummaryLine: buildWeekSummaryLine(dockets),
          typeLabel,
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
        const typeLabel = typeConvert(driver.driverType);
        const haulierName =
          driver.haulier?.haulierName?.trim() || undefined;

        return {
          id: String(driver.id),
          name: driver.driverName,
          companyLine: haulierName,
          weekSummaryLine: buildWeekSummaryLine(dockets),
          typeLabel,
          dockets,
        };
      });
    }

    return [];
  }, [trucksData, driversData, viewType]);

  const filterCustomerOptions = useMemo(() => {
    const weekDockets = resources.flatMap((r) => r.dockets);
    return buildScheduleCustomerOptionsFromDockets(
      weekDockets,
      startDate,
      endDate,
    );
  }, [resources, startDate, endDate]);

  useEffect(() => {
    const allowed = new Set(filterCustomerOptions);
    const nextNames = filter.customerNames.filter((n) => allowed.has(n));
    if (nextNames.length !== filter.customerNames.length) {
      onFilterChange({ ...filter, customerNames: nextNames });
    }
    // Only re-run when the available customer list changes (e.g. week navigation).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCustomerOptions]);

  const filterDriverOptions = useMemo(
    () => buildSchedulerFilterDriverOptions(driversData),
    [driversData],
  );

  const filterTruckOptions = useMemo(
    () => buildSchedulerFilterTruckOptions(trucksData),
    [trucksData],
  );

  const filterHaulierOptions = useMemo(
    () =>
      buildSchedulerFilterHaulierOptions(viewType, trucksData, driversData),
    [viewType, trucksData, driversData],
  );

  const filteredResources = useMemo(() => {
    let result = resources.map((r) => ({
      ...r,
      dockets: r.dockets.filter((d) =>
        docketMatchesScheduleJobFilters(d, filter),
      ),
    }));

    if (viewType === 'trucks' && trucksData?.resources) {
      const allowedTruckIds = new Set(
        trucksData.resources
          .filter(isDispatchTruckResource)
          .filter((r) => truckMatchesFleetFilters(r, filter))
          .map((r) => String(r.id)),
      );
      result = result.filter((r) => allowedTruckIds.has(r.id));
    } else if (viewType === 'drivers' && driversData?.resources) {
      const allowedDriverIds = new Set(
        driversData.resources
          .filter(isDispatchDriverResource)
          .filter((r) => driverRowMatchesFilters(r, filter))
          .map((r) => String(r.id)),
      );
      result = result.filter((r) => allowedDriverIds.has(r.id));
    }

    if (filter.jobStatuses.length > 0 || filter.customerNames.length > 0) {
      result = result.filter((r) => r.dockets.length > 0);
    }

    return result;
  }, [resources, viewType, trucksData, driversData, filter]);

  const allDockets = useMemo(() => {
    return filteredResources.flatMap((r) => r.dockets);
  }, [filteredResources]);

  const headerStats = useMemo(() => {
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
      <DispatchDriversTrucksFilter
        viewType={viewType}
        driverOptions={filterDriverOptions}
        truckOptions={filterTruckOptions}
        haulierOptions={filterHaulierOptions}
        customerOptions={filterCustomerOptions}
        isLoadingResources={isLoadingResources}
        filter={filter}
        onFilterChange={onFilterChange}
      />
      <div className="border-b border-[#E2E8F0] pl-6 py-2.5 bg-white shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[12px] font-medium text-[#64748B]">
            THIS WEEK
          </span>

          <div className="border border-blue-200 bg-blue-50/80 rounded-xl px-3 py-1 flex gap-1 items-center">
            <span className="text-[12px] font-semibold text-blue-900 tabular-nums">
              {headerStats.trucksBooked}
            </span>
            <span className="text-[12px] font-medium text-blue-900/80">
              Trucks booked this week
            </span>
          </div>
          <div className="border border-purple-200 bg-purple-50/80 rounded-xl px-3 py-1 flex gap-1 items-center">
            <span className="text-[12px] font-semibold text-purple-900 tabular-nums">
              {headerStats.driversOnTrips}
            </span>
            <span className="text-[12px] font-medium text-purple-900/80">
              Drivers on trips
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto bg-[#F8FAFC] px-3 py-4">
          <div className="mx-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="border-b border-[#EDE9FE] bg-[#FAF5FF] px-4 py-2.5 shrink-0">
              <p className="text-[12px] font-semibold text-[#5B21B6]">
                View only
              </p>
              <p className="text-[11px] text-[#6D28D9]/90 mt-0.5 leading-snug">
                Assign and move dockets on Dispatch. Click a docket to open
                details.
              </p>
            </div>

            <div
              className="grid min-w-0 border-b border-[#E2E8F0] bg-white sticky top-0 z-10 shrink-0"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              <div className="px-4 py-3 font-semibold text-[13px] text-[#0F172A] border-r border-[#E2E8F0] flex items-end">
                {viewType === 'trucks' ? 'Truck' : 'Driver'}
              </div>
              {days.map((day) => {
                const isSelectedDate = isSameDay(day, date);
                return (
                  <div
                    key={day.toISOString()}
                    className={`px-2 py-3 text-center border-r border-[#E2E8F0] last:border-r-0 flex flex-col items-center justify-center gap-0.5 ${isSelectedDate ? 'bg-violet-50/70' : 'bg-white'
                      }`}
                  >
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${isSelectedDate ? 'text-violet-700' : 'text-[#64748B]'
                        }`}
                    >
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={`text-[18px] font-bold leading-none ${isSelectedDate ? 'text-violet-700' : 'text-[#0F172A]'
                        }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col min-w-0">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="grid border-b border-[#E2E8F0] last:border-b-0 bg-white"
                  style={{ gridTemplateColumns: GRID_TEMPLATE }}
                >
                  <div className="px-4 py-3 border-r border-[#E2E8F0] flex flex-col justify-between gap-2 bg-[#FAFBFC] min-w-0 overflow-hidden">
                    <div className="min-w-0">
                      <div className="flex flex-col items-start gap-1 min-w-0">
                        <span className="text-[15px] font-bold text-[#0F172A] tracking-tight break-words min-w-0">
                          {resource.name}
                        </span>
                        <TableBadges
                          names={[resource.typeLabel]}
                          visibleCount={1}
                        />
                      </div>
                      {resource.companyLine ? (
                        <p className="text-[12px] text-[#64748B] mt-1 leading-snug">
                          {resource.companyLine}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium leading-tight">
                      {resource.weekSummaryLine}
                    </p>
                  </div>

                  {days.map((day) => {
                    const isSelectedDate = isSameDay(day, date);
                    const dayDockets = resource.dockets.filter((d) => {
                      if (!d.deliveryCollectionDate) return false;
                      const localTimeStr = d.deliveryCollectionDate.includes(
                        'T',
                      )
                        ? d.deliveryCollectionDate.replace('Z', '')
                        : d.deliveryCollectionDate;
                      return isSameDay(new Date(localTimeStr), day);
                    });
                    const visible = dayDockets.slice(
                      0,
                      VISIBLE_DOCKETS_PER_CELL,
                    );
                    const overflow =
                      dayDockets.length - VISIBLE_DOCKETS_PER_CELL;

                    return (
                      <div
                        key={`${resource.id}-${day.toISOString()}`}
                        className={`p-2 border-r border-[#E2E8F0] last:border-r-0 flex flex-col gap-2 min-h-[112px] min-w-0 ${isSelectedDate ? 'bg-violet-50/25' : 'bg-white'
                          }`}
                      >
                        <div className="flex flex-col gap-2 flex-1 min-h-0">
                          {visible.map((docket) => (
                            <DocketChip
                              key={docket.id}
                              docket={docket}
                              viewType={viewType}
                              isSelected={selectedDocketId === docket.id}
                              onClick={() => setSelectedDocketId(docket.id)}
                            />
                          ))}
                        </div>
                        {overflow > 0 ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="link"
                                className="text-left text-[12px] font-semibold text-blue-600 bg-blue-50 hover:text-blue-700 rounded-lg border border-blue-600 py-1 cursor-pointer"
                              >
                                +{overflow} more dockets
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="overflow-y-auto max-h-[60vh] max-w-lg">
                              <DialogHeader>
                                <DialogTitle>
                                  All dockets ({dayDockets.length})
                                </DialogTitle>
                                <p className="text-sm text-[#64748B]">
                                  {format(day, 'EEEE, d MMMM yyyy')} ·{' '}
                                  {resource.name}
                                </p>
                              </DialogHeader>
                              <div className="flex flex-col gap-2.5 mt-4 pr-1">
                                {dayDockets.map((docket) => (
                                  <DocketChip
                                    key={docket.id}
                                    docket={docket}
                                    viewType={viewType}
                                    isSelected={selectedDocketId === docket.id}
                                    onClick={() =>
                                      setSelectedDocketId(docket.id)
                                    }
                                  />
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}

              {filteredResources.length === 0 && (
                <div className="p-10 text-center text-[#64748B] text-sm border-t border-[#E2E8F0]">
                  No {viewType} found for this week.
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedDocket && (
          <div className="w-[min(400px,28vw)] shrink-0 border-l border-[#E2E8F0] bg-white shadow-sm overflow-y-auto flex flex-col">
            <DocketDetailsPanel
              docketId={selectedDocket.id}
              onClose={() => setSelectedDocketId(undefined)}
              onUnassign={handleUnassign}
            />
          </div>
        )}
      </div>
    </div>
  );
}
