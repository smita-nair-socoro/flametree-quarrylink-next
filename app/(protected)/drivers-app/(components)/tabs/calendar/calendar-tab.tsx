'use client';

import * as React from 'react';
import { DocketDTO } from '@/lib/types/docket';
import rawJson from '@/lib/tests/driverDocketsResponseData.json';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  Truck,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableBadges } from '@/components/table-badges';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

export default function CalendarTab() {
  const { items } = rawJson as unknown as {
    items: DocketDTO[];
  };


  const today = new Date();

  // State for the calendar
  const [currentDate, setCurrentDate] = React.useState(new Date(today));
  const [selectedDate, setSelectedDate] = React.useState(new Date(today));

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get days to display in the calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Filter out dockets that are not assigned, delivered, in transit, arrived, or stopped
  const filteredItems = items.filter((docket) => [DOCKET_STATUS.ASSIGNED, DOCKET_STATUS.DELIVERED, DOCKET_STATUS.IN_TRANSIT, DOCKET_STATUS.ARRIVED, DOCKET_STATUS.STOPPED].includes(docket.docketStatus));

  // Get dockets for a specific date
  const getDocketsForDate = (date: Date) => {
    return filteredItems.filter((docket) => {
      if (!docket.deliveryCollectionDate) return false;
      const docketDate = parseISO(docket.deliveryCollectionDate.toString());
      return isSameDay(docketDate, date);
    });
  };

  const selectedDockets = getDocketsForDate(selectedDate);

  const formatTimeWindow = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
    } catch {
      return 'Invalid Date';
    }
  };

  const renderDocketCard = (docket: DocketDTO) => {
    return (
      <div
        key={docket.id}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[16px] font-bold text-[#0F172A]">
            {docket.docketNumber}
          </span>
          <div className="flex items-center gap-2">
            <TableBadges names={[docket.docketStatus]} />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[15px] font-medium text-[#45556C] leading-tight mb-0.5">
            {docket.job?.customerName || 'Unknown Customer'}
          </h3>
          <p className="text-[14px] text-[#94A3B8]">
            {docket.jobItem?.product?.productName}
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
            <span className="text-[13px] text-[#64748B] leading-snug">
              {docket.deliveryAddress?.formattedAddress}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <span className="text-[13px] text-[#64748B]">
              {docket.jobItem?.quarrySupplierName}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <span className="text-[13px] text-[#64748B] font-mono">
              {docket.truckType}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2">
          <span className="text-[16px] font-bold text-[#0F172A]">
            {docket.loadSize}
            {docket.jobItem?.productSellUom === 'TN'
              ? 'T'
              : docket.jobItem?.productSellUom === 'M3'
                ? 'm³'
                : ''}
          </span>
          <span className="text-[13px] text-[#94A3B8] font-medium">
            {formatTimeWindow(
              docket.deliveryCollectionStartTime,
              docket.deliveryCollectionEndTime,
            )}
          </span>
        </div>

        {docket.notes && (
          <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-start gap-2 border border-gray-100 mt-4">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-[13px] text-gray-500 italic">
              {docket.notes}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white min-h-screen pb-24">
      <div className="p-4 pt-6">
        <h1 className="text-[20px] font-bold text-[#0F172A] mb-8">
          Calendar View
        </h1>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <button
            onClick={prevMonth}
            className="p-1 text-[#94A3B8] hover:text-[#64748B]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[16px] font-bold text-[#0F172A]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1 text-[#94A3B8] hover:text-[#64748B]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-6 mb-4">
          {/* Weekdays */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-[13px] font-medium text-[#94A3B8] mb-2"
            >
              {day}
            </div>
          ))}

          {/* Days */}
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const docketsForDay = getDocketsForDate(day);
            const hasDockets = docketsForDay.length > 0;

            return (
              <div
                key={day.toString()}
                className="flex flex-col items-center justify-start h-12 cursor-pointer"
                onClick={() => setSelectedDate(day)}
              >
                <div
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-full text-[14px]',
                    isSelected
                      ? 'bg-[#8E51FF] text-white font-medium'
                      : isCurrentMonth
                        ? 'text-[#0F172A] font-medium'
                        : 'text-[#CBD5E1] font-medium',
                  )}
                >
                  {format(day, 'd')}
                </div>
                {hasDockets && (
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full mt-1',
                      isSelected ? 'bg-[#8E51FF]' : 'bg-[#94A3B8]',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-[#F1F5F9] w-full" />

      {/* Selected Date Details */}
      <div className="p-4 flex flex-col gap-4 bg-white">
        <div className="mb-2">
          <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">
            {format(selectedDate, 'EEEE dd MMMM yyyy')}
          </h3>
          <p className="text-[14px] text-[#94A3B8]">
            {selectedDockets.length} assigned docket
            {selectedDockets.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {selectedDockets.map((docket) => renderDocketCard(docket))}
          {selectedDockets.length === 0 && (
            <div className="text-center py-8 text-[#94A3B8] text-[14px]">
              No dockets assigned for this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
