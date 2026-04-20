'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Truck, DispatchDocket, formatTimeRange } from '../views/drivers-view';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

function calculateLayouts(dockets: DispatchDocket[]) {
  const intervals = dockets.map(d => {
    const start = TIME_SLOTS.indexOf(d.uiAssignedTime || '');
    const duration = d.uiAssignedDuration || 2;
    const end = start + duration;
    return { docket: d, start, end, col: 0 };
  }).filter(d => d.start !== -1);

  // Sort by start time, then by end time descending
  intervals.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });

  // Group overlapping intervals
  const groups: typeof intervals[] = [];
  let currentGroup: typeof intervals = [];
  let groupEnd = -1;

  for (const item of intervals) {
    if (currentGroup.length === 0) {
      currentGroup.push(item);
      groupEnd = item.end;
    } else if (item.start < groupEnd) {
      currentGroup.push(item);
      groupEnd = Math.max(groupEnd, item.end);
    } else {
      groups.push(currentGroup);
      currentGroup = [item];
      groupEnd = item.end;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  const layouts = new Map<string, { col: number }>();
  let maxCols = 1;

  for (const group of groups) {
    const columns: number[] = [];
    for (const item of group) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        if (item.start >= columns[i]) {
          item.col = i;
          columns[i] = item.end;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.col = columns.length;
        columns.push(item.end);
      }
    }

    const numCols = columns.length;
    maxCols = Math.max(maxCols, numCols);
    for (const item of group) {
      layouts.set(String(item.docket.id), {
        col: item.col
      });
    }
  }

  return { layouts, maxCols };
}

function DroppableSlot({
  truckId,
  time,
  children,
}: {
  truckId: string;
  time: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `truck-${truckId}-time-${time}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[112px] h-full p-1.5 transition-colors ${isOver ? 'bg-blue-50/50' : 'bg-transparent'
        }`}
    >
      {children}
    </div>
  );
}

function DocketCard({
  docket,
  layout,
  onUpdateDocket,
  isSelected,
  onSelect
}: {
  docket: DispatchDocket;
  layout: { col: number };
  onUpdateDocket?: (docketId: string, updates: Partial<DispatchDocket>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const [resizeDelta, setResizeDelta] = React.useState(0);
  const [isResizing, setIsResizing] = React.useState(false);

  const timeIndex = TIME_SLOTS.indexOf(docket.uiAssignedTime || '');
  if (timeIndex === -1) return null;

  const top = timeIndex * 112;
  const baseDuration = docket.uiAssignedDuration || 2;
  const baseHeight = baseDuration * 112;

  const currentHeight = Math.max(112, baseHeight + resizeDelta);
  const snappedHeight = Math.round(currentHeight / 112) * 112;
  const snappedDuration = snappedHeight / 112;

  const DOCKET_WIDTH = 160;
  const GAP = 8;
  const leftOffset = layout.col * DOCKET_WIDTH;

  const style = {
    top: `${top}px`,
    height: `${isResizing ? currentHeight : baseHeight}px`,
    width: `${DOCKET_WIDTH - GAP}px`,
    left: `${leftOffset + GAP / 2}px`,
    position: 'absolute' as const,
    zIndex: isResizing ? 50 : 10,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setResizeDelta(moveEvent.clientY - startY);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsResizing(false);

      const finalDelta = upEvent.clientY - startY;
      const finalHeight = Math.max(112, baseHeight + finalDelta);
      const finalSnappedHeight = Math.round(finalHeight / 112) * 112;
      const finalDuration = finalSnappedHeight / 112;

      const maxDuration = TIME_SLOTS.length - timeIndex - 1;
      const validDuration = Math.min(finalDuration, maxDuration);

      if (validDuration !== baseDuration && onUpdateDocket) {
        onUpdateDocket(String(docket.id), { uiAssignedDuration: validDuration });
      }
      setResizeDelta(0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const activeDuration = isResizing ? snappedDuration : baseDuration;
  const endTimeIndex = Math.min(timeIndex + activeDuration, TIME_SLOTS.length - 1);
  const endTime = TIME_SLOTS[endTimeIndex];

  return (
    <div
      style={style}
      onClick={() => {
        if (!isResizing && onSelect) {
          onSelect();
        }
      }}
      className={`bg-[#F0FDF4] border ${isResizing ? 'border-dashed border-[#059669]' : isSelected ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]' : 'border-[#A7F3D0]'} rounded-lg shadow-sm flex flex-col group overflow-hidden transition-shadow cursor-pointer`}
    >
      <div className="flex flex-1 p-2 gap-2">
        <div className="flex items-center text-[#94A3B8] cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-[#0F766E] truncate text-[15px]">
              {docket.docketNumber} <span className="text-[#0F766E] font-semibold text-[12px] ml-1">{docket.loadSize} {docket.jobItem?.productSellUom === 'M3' ? 'm³' : docket.jobItem?.productSellUom === 'KG_20' ? 'x 20kg' : docket.jobItem?.productSellUom}</span>
            </div>
          </div>
          <div className="text-[#0F766E] font-medium text-[13px] truncate mt-1">
            {docket.job?.customerDto?.customerType === CUSTOMER_TYPE.BUSINESS ? docket.job?.customerDto?.businessName : docket.job.contactPersonName}
          </div>
          <div className="text-[#0F766E]/80 text-[12px] truncate">
            {docket.pickUpAddress?.formattedAddress || ''}
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-[#0F766E]/70 text-[12px] font-medium">
              {formatTimeRange(docket.deliveryCollectionStartTime, docket.deliveryCollectionEndTime)}
            </span>
          </div>
        </div>
      </div>

      {isResizing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-[#059669] text-[#059669] text-[12px] font-medium px-3 py-1.5 rounded-md shadow-md whitespace-nowrap z-50">
          End snaps to {endTime}
        </div>
      )}

      {/* Resize handle */}
      <div
        className="h-2.5 bg-[#D1FAE5] hover:bg-[#A7F3D0] cursor-ns-resize transition-colors mt-auto relative z-20 border-t border-[#A7F3D0]/50"
        onPointerDown={handlePointerDown}
      />
    </div>
  );
}

export default function AssignedDockets({
  // date,
  trucks,
  dockets,
  isLoading,
  onUpdateDocket,
  selectedDocketId,
  onSelectDocket,
  // onUnassignDocket,
  viewType = 'drivers',
}: {
  // date: Date;
  trucks: Truck[];
  dockets: DispatchDocket[];
  isLoading?: boolean;
  onUpdateDocket?: (docketId: string, updates: Partial<DispatchDocket>) => void;
  selectedDocketId?: string | null;
  onSelectDocket?: (id: string | null) => void;
  // onUnassignDocket?: () => void;
  viewType?: 'trucks' | 'drivers';
}) {
  const [expandedTruckId, setExpandedTruckId] = React.useState<string | null>(null);

  const renderTruckCard = (truck: Truck) => {
    const isExpanded = expandedTruckId === truck.id;
    if (expandedTruckId && !isExpanded) return null;

    const truckDockets = dockets.filter((d) => d.uiAssignedTruckId === truck.id);
    const { layouts, maxCols } = calculateLayouts(truckDockets);

    const DOCKET_WIDTH = 160;
    const innerWidthStr = maxCols > 1 ? `calc(max(100%, ${maxCols * DOCKET_WIDTH}px))` : '100%';

    return (
      <div
        key={truck.id}
        className={`bg-white border border-[#E2E8F0] rounded-xl flex flex-col overflow-hidden shadow-sm shrink-0 transition-all duration-300 h-full ${isExpanded ? 'w-full flex-1' : 'min-w-[400px] flex-1'
          }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E2E8F0] bg-white flex flex-col gap-3 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[22px] font-bold text-[#0F172A]">
                  {viewType === 'trucks' ? truck.name : truck.drivers}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] text-[11px] font-bold tracking-wide">
                  INTERNAL
                </span>
              </div>
              <p className="text-[14px] text-[#64748B] mt-0.5">Metro Haulage</p>
            </div>
            <button
              onClick={() => setExpandedTruckId(isExpanded ? null : truck.id)}
              className="p-1.5 border border-[#E2E8F0] rounded-md hover:bg-gray-50 text-[#64748B] transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {viewType === 'trucks' ? (
              <>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">{truck.capacity}</span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">Capacity</span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">{truck.trips}</span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">Trips today</span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">1</span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">Drivers</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">1</span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">Trucks today</span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">{truck.trips}</span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">Trips today</span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">11</span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">This week</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Time Slots */}
        <div className="flex-1 overflow-auto relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
              <div className="text-sm text-gray-500">Loading assignments...</div>
            </div>
          )}
          <div className="flex flex-col relative" style={{ minWidth: innerWidthStr }}>
            {/* Background Grid */}
            {TIME_SLOTS.map((time) => (
              <div key={time} className="flex border-b border-[#E2E8F0] min-h-[112px]">
                {/* Time Label */}
                <div className="w-16 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-center pt-2 sticky left-0 z-20">
                  <span className="text-[13px] font-medium text-[#0F172A]">{time}</span>
                </div>
                {/* Droppable Area */}
                <div className="flex-1 relative">
                  <DroppableSlot truckId={truck.id} time={time}>
                    <div className="w-full h-full" />
                  </DroppableSlot>
                </div>
              </div>
            ))}
            {/* Absolutely Positioned Dockets */}
            <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
              <div className="relative w-full h-full pointer-events-auto">
                {truckDockets.map((docket) => (
                  <DocketCard
                    key={docket.id}
                    docket={docket}
                    layout={layouts.get(String(docket.id)) || { col: 0 }}
                    onUpdateDocket={onUpdateDocket}
                    isSelected={selectedDocketId === String(docket.id)}
                    onSelect={() => onSelectDocket?.(String(docket.id))}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex gap-4 h-full ${expandedTruckId ? '' : 'overflow-x-auto'}`}>
      {trucks.map((truck) => renderTruckCard(truck))}
    </div>
  );
}
