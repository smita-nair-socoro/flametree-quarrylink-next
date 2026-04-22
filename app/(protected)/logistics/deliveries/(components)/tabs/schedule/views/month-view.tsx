'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { DocketsListQueryOptions } from '@/lib/api/docket';
import { DispatchDocket } from '../../dispatch/views/dispatch-view';
import { DocketDetailsPanel } from '../../dispatch/cards/docket-details-panel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';

const CHIP_COLORS = [
  'bg-cyan-50 border-cyan-200 text-cyan-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-green-50 border-green-200 text-green-800',
  'bg-blue-50 border-blue-200 text-blue-800',
];

function getChipColor(index: number) {
  return CHIP_COLORS[index % CHIP_COLORS.length];
}

function DocketChip({ docket, onClick, index, isSelected = false }: { docket: DispatchDocket; onClick: () => void; index: number; isSelected?: boolean }) {
  const customerName = docket.job?.customerDto?.customerType === CUSTOMER_TYPE.BUSINESS
    ? docket.job?.customerDto?.businessName
    : docket.job?.contactPersonName;

  const location = docket.deliveryAddress?.city || docket.deliveryAddress?.suburb || 'TBD';
  const colorClass = getChipColor(index);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`text-[10px] p-2 rounded-lg border cursor-pointer hover:opacity-80 ${colorClass} ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}
    >
      <div className="font-semibold flex justify-between mb-0.5">
        <span>{docket.docketNumber || 'No Number'}</span>
        <span>{docket.loadSize} {docket.jobItem?.productSellUom === 'M3' ? 'm³' : docket.jobItem?.productSellUom === 'KG_20' ? 'x 20kg' : docket.jobItem?.productSellUom}</span>
      </div>
      <div className="truncate text-gray-700">{customerName}</div>
      <div className="truncate text-gray-500 mb-1">{location}</div>
      {(docket.uiAssignedTruckId || docket.driver) && (
        <div className="truncate text-gray-500 mt-1">
          Driver: {docket.driver ? docket.driver.driverName || 'Assigned' : 'Unassigned'}
        </div>
      )}
      {(docket.uiAssignedTruckId || docket.truckType) && (
        <div className="truncate text-gray-500">
          Truck: {docket.uiAssignedTruckId || docket.truckType || 'No Truck'}
        </div>
      )}
    </div>
  );
}

export function ScheduleMonthView({ date, onDateChange }: { date: Date; onDateChange: (date: Date) => void }) {
  const [selectedDocketId, setSelectedDocketId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const { data: docketsData } = useQuery(DocketsListQueryOptions());

  const dockets: DispatchDocket[] = useMemo(() => {
    if (!docketsData) return [];
    return ('content' in docketsData ? docketsData.content : docketsData) as DispatchDocket[];
  }, [docketsData]);

  const docketsByDate = useMemo(() => {
    const grouped: Record<string, DispatchDocket[]> = {};
    dockets.forEach(docket => {
      if (!docket.deliveryCollectionDate) return;
      // Format as YYYY-MM-DD for grouping
      const dateKey = format(new Date(docket.deliveryCollectionDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(docket);
    });
    return grouped;
  }, [dockets]);

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDocket = selectedDocketId ? dockets.find(d => d.id === selectedDocketId) : null;

  const handleUnassign = () => {
    // In a real app, this would mutate the server state.
    // For now, we just close the panel or handle it locally if needed.
    setSelectedDocketId(undefined);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      {/* Fixed top bar */}
      <div className="border-b pl-6 py-2.5 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-[#64748B]">
            {format(date, 'EEE dd MMM').toUpperCase()}
          </span>
          <div className="border bg-green-50 border-green-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">13/17</span>{" "}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">Assigned</span>
          </div>
          <div className="border bg-blue-50 border-blue-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">2</span>{" "}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">Trucks booked this month</span>
          </div>
          <div className="border bg-purple-50 border-purple-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">2</span>{" "}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">Drivers on trips</span>
          </div>
        </div>
      </div>

      {/* Body row: scrollable calendar + fixed right panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Scrollable left content */}
        <div className="flex-1 overflow-y-auto bg-white m-5 rounded-xl border border-gray-300 shadow-md">
          <div className="overflow-hidden mb-6">
            <div className="p-5 bg-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{format(date, 'MMMM yyyy')}</h2>
              <p className="text-sm text-gray-500 mt-1">Fleet load and assignments at a glance</p>
            </div>
            <div className="bg-[#FAF5FF] border-t border-[#EDE9FE] px-5 py-4">
              <h3 className="text-sm font-semibold text-[#4C1D95]">View only</h3>
              <p className="text-xs text-[#6D28D9] mt-0.5">
                Use Dispatch to assign or move dockets. Click a day to focus the date; click a docket chip for full details.
              </p>
            </div>
          </div>

          <div className="flex flex-col pb-8">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-3 px-2 pb-2 shrink-0">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-3 px-5 pt-4">
              {days.map((day, dayIdx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayDockets = docketsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelectedDate = isSameDay(day, selectedDate);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => {
                      setSelectedDate(day);
                      onDateChange(day);
                    }}
                    className={`p-2 flex flex-col rounded-xl border cursor-pointer transition-colors
                    ${isSelectedDate
                        ? 'ring-1 ring-purple-400 border-purple-400 bg-purple-200/10 z-10'
                        : !isCurrentMonth
                          ? 'bg-gray-50/40 border-gray-100'
                          : 'bg-white border-gray-200 shadow-sm'}
                    ${dayDockets.length > 0 ? 'min-h-[150px]' : 'min-h-[100px]'}`}
                  >
                    <div className="flex flex-col mb-3">
                      <span className={`text-sm font-bold
                        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                        ${isSelectedDate ? 'text-purple-700' : ''}`}>
                        {format(day, dateFormat)}
                      </span>
                      {dayDockets.length > 0 && (
                        <div className="text-[10px] text-gray-500 mt-1 flex flex-col gap-0.5">
                          <div>{dayDockets.length} docket{dayDockets.length !== 1 ? 's' : ''}</div>
                          <div>{Math.floor(Math.random() * 3) + 1} drivers on trips</div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 overflow-visible">
                      {dayDockets.slice(0, 2).map((docket, idx) => (
                        <DocketChip
                          key={docket.id}
                          docket={docket}
                          index={idx}
                          isSelected={selectedDocketId === docket.id}
                          onClick={() => setSelectedDocketId(docket.id)}
                        />
                      ))}
                      {dayDockets.length > 2 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-[10px] cursor-pointer font-bold text-blue-800 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-1 px-2 w-full rounded-md transition-colors mt-auto text-left border border-blue-200">
                              +{dayDockets.length - 2} more
                            </button>
                          </DialogTrigger>
                          <DialogContent className="overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>All Dockets ({dayDockets.length})</DialogTitle>
                              <p className="text-sm text-gray-500">Select a docket to view its details.</p>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 mt-4">
                              {dayDockets.map((docket, idx) => (
                                <DocketChip
                                  key={docket.id}
                                  docket={docket}
                                  index={idx}
                                  isSelected={selectedDocketId === docket.id}
                                  onClick={() => setSelectedDocketId(docket.id)}
                                />
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed right panel — sticks to viewport height, scrolls internally */}
        {
          selectedDocket && (
            <div className="w-[23vw] shrink-0 border-l border-[#E2E8F0] bg-white shadow-sm overflow-y-auto flex flex-col">
              <DocketDetailsPanel
                docket={selectedDocket}
                onClose={() => setSelectedDocketId(undefined)}
                onUnassign={handleUnassign}
              />
            </div>
          )
        }
      </div >
    </div >
  );
}
