'use client';

import * as React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import {
  Maximize2,
  Minimize2,
  GripVertical,
  Lock,
  Infinity,
} from 'lucide-react';
import {
  DispatchDocket,
  formatTime,
  formatTimeRange,
  isGenericDispatchTruckName,
  sortDispatchBoardTruckColumns,
} from '@/lib/utils/dispatch-helper';
import { TableBadges } from '@/components/table-badges';
import { TruckResource } from '@/lib/types/truck';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { Spinner } from '@/components/ui/spinner';

const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

/** First column label (must match `TIME_SLOTS[0]`). */
const GRID_FIRST_HOUR = 6;
/** Must match row + card geometry (`h-[112px]`). */
const SLOT_HEIGHT_PX = 112;
/** Exclusive end of the grid in “hours since `GRID_FIRST_HOUR`” (06:00 … 24:00 → 18h). */
const GRID_SPAN_HOURS = TIME_SLOTS.length;

function hoursSinceGridStart(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso.replace('Z', ''));
  if (Number.isNaN(d.getTime())) return null;
  const h =
    d.getHours() +
    d.getMinutes() / 60 +
    d.getSeconds() / 3600 +
    d.getMilliseconds() / 3_600_000;
  return h - GRID_FIRST_HOUR;
}

function clampGridHour(h: number): number {
  return Math.min(Math.max(h, 0), GRID_SPAN_HOURS);
}

function fallbackSlotInterval(d: DispatchDocket): {
  start: number;
  end: number;
} | null {
  const slotIdx = TIME_SLOTS.indexOf(d.uiAssignedTime || '');
  if (slotIdx === -1) return null;
  const dur = d.uiAssignedDuration || 2;
  const end = Math.min(slotIdx + dur, GRID_SPAN_HOURS);
  if (end <= slotIdx) return null;
  return { start: slotIdx, end };
}

/** Interval in fractional hours from grid start (06:00 → 0, midnight → GRID_SPAN_HOURS). Never extends past midnight. */
function getDocketIntervalHours(d: DispatchDocket): {
  start: number;
  end: number;
} | null {
  if (d.deliveryCollectionStartTime && d.deliveryCollectionEndTime) {
    const s = new Date(d.deliveryCollectionStartTime.replace('Z', ''));
    const e = new Date(d.deliveryCollectionEndTime.replace('Z', ''));
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return fallbackSlotInterval(d);
    }

    let startH = hoursSinceGridStart(d.deliveryCollectionStartTime);
    if (startH === null) return fallbackSlotInterval(d);
    startH = clampGridHour(startH);

    const durationMs = e.getTime() - s.getTime();
    if (durationMs <= 0) return fallbackSlotInterval(d);

    const durationH = durationMs / 3_600_000;
    let endH = Math.min(startH + durationH, GRID_SPAN_HOURS);
    if (endH <= startH) {
      endH = Math.min(GRID_SPAN_HOURS, startH + 1 / 60);
    }
    if (endH <= startH) return null;
    return { start: startH, end: endH };
  }
  return fallbackSlotInterval(d);
}

/** Footer label; when the real window crosses midnight, show end as 00:00 (end of dispatch day). */
function formatDocketTimeRangeFooter(d: DispatchDocket): string {
  if (!d.deliveryCollectionStartTime || !d.deliveryCollectionEndTime) {
    return formatTimeRange(
      d.deliveryCollectionStartTime,
      d.deliveryCollectionEndTime,
    );
  }
  const s = new Date(d.deliveryCollectionStartTime.replace('Z', ''));
  const e = new Date(d.deliveryCollectionEndTime.replace('Z', ''));
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return formatTimeRange(
      d.deliveryCollectionStartTime,
      d.deliveryCollectionEndTime,
    );
  }
  const startRaw = hoursSinceGridStart(d.deliveryCollectionStartTime);
  if (startRaw === null) {
    return formatTimeRange(
      d.deliveryCollectionStartTime,
      d.deliveryCollectionEndTime,
    );
  }
  const endRaw = startRaw + (e.getTime() - s.getTime()) / 3_600_000;
  if (endRaw > GRID_SPAN_HOURS + 1e-4) {
    return `${formatTime(d.deliveryCollectionStartTime)} - 00:00`;
  }
  return formatTimeRange(
    d.deliveryCollectionStartTime,
    d.deliveryCollectionEndTime,
  );
}

function calculateLayouts(dockets: DispatchDocket[]) {
  const intervals = dockets
    .map((d) => {
      const iv = getDocketIntervalHours(d);
      if (!iv) return null;
      return { docket: d, start: iv.start, end: iv.end, col: 0 };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  // Sort by start time, then by end time descending
  intervals.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });

  // Group overlapping intervals
  const groups: (typeof intervals)[] = [];
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
        col: item.col,
      });
    }
  }

  return { layouts, maxCols };
}

function DroppableSlot({
  truckId,
  time,
  children,
  disabled = false,
}: {
  truckId: string;
  time: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `truck-${truckId}-time-${time}`,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-0 h-full p-1.5 transition-colors ${isOver
        ? 'bg-blue-100/90 ring-1 ring-inset ring-blue-300/80'
        : 'bg-transparent'
        }`}
    >
      {children}
    </div>
  );
}

const getStatusColors = (status?: string) => {
  switch (status) {
    case 'UNASSIGNED':
      return {
        bg: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        handleBg: 'bg-gray-50',
      };
    case 'PENDING':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        textMuted: 'text-yellow-700',
        handleBg: 'bg-white/60',
      };
    case 'PREPARING':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-900',
        textMuted: 'text-blue-700',
        handleBg: 'bg-white/60',
      };
    case 'READY':
      return {
        bg: 'bg-pink-50',
        border: 'border-pink-300',
        text: 'text-pink-900',
        textMuted: 'text-pink-700',
        handleBg: 'bg-white/60',
      };
    case 'COLLECTED':
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-900',
        textMuted: 'text-green-700',
        handleBg: 'bg-white/60',
      };
    case 'ASSIGNED':
      return {
        bg: 'bg-cyan-50',
        border: 'border-cyan-300',
        text: 'text-cyan-900',
        textMuted: 'text-cyan-700',
        handleBg: 'bg-white/60',
      };
    case 'IN_TRANSIT':
      return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-300',
        text: 'text-indigo-900',
        textMuted: 'text-indigo-700',
        handleBg: 'bg-white/60',
      };
    case 'STOPPED':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-900',
        textMuted: 'text-orange-700',
        handleBg: 'bg-white/60',
      };
    case 'ARRIVED':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        textMuted: 'text-yellow-700',
        handleBg: 'bg-white/60',
      };
    case 'DELIVERED':
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-900',
        textMuted: 'text-green-700',
        handleBg: 'bg-white/60',
      };
    case 'INVOICED':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-900',
        textMuted: 'text-purple-700',
        handleBg: 'bg-white/60',
      };
    case 'CANCELLED':
    case 'VOIDED':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-900',
        textMuted: 'text-red-700',
        handleBg: 'bg-white/60',
      };
    case 'CASH_SALE':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        textMuted: 'text-yellow-700',
        handleBg: 'bg-white/60',
      };
    default:
      return {
        bg: 'bg-[#F0FDF4]',
        border: 'border-[#A7F3D0]',
        text: 'text-[#0F766E]',
        textMuted: 'text-[#0F766E]/80',
        handleBg: 'bg-white/60',
      };
  }
};

export type DispatchBoardInteractionMode = 'full' | 'view-only';

function DocketCard({
  docket,
  layout,
  onUpdateDocket,
  onResizeDocket,
  isSelected,
  onSelect,
  boardInteractionMode = 'full',
}: {
  docket: DispatchDocket;
  layout: { col: number };
  onUpdateDocket?: (docketId: string, updates: Partial<DispatchDocket>) => void;
  onResizeDocket?: (docketId: string, newDuration: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  boardInteractionMode?: DispatchBoardInteractionMode;
}) {
  const isLocked =
    docket.docketStatus !== 'UNASSIGNED' && docket.docketStatus !== 'ASSIGNED';
  const canInteract = !isLocked && boardInteractionMode === 'full';

  if (canInteract) {
    return (
      <DocketCardDraggable
        docket={docket}
        layout={layout}
        onUpdateDocket={onUpdateDocket}
        onResizeDocket={onResizeDocket}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  }

  return (
    <DocketCardView
      docket={docket}
      layout={layout}
      isSelected={isSelected}
      onSelect={onSelect}
      isLocked={isLocked}
    />
  );
}

function DocketCardDraggable({
  docket,
  layout,
  onUpdateDocket,
  onResizeDocket,
  isSelected,
  onSelect,
}: {
  docket: DispatchDocket;
  layout: { col: number };
  onUpdateDocket?: (docketId: string, updates: Partial<DispatchDocket>) => void;
  onResizeDocket?: (docketId: string, newDuration: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(docket.id),
    data: { docket },
  });

  return (
    <DocketCardView
      docket={docket}
      layout={layout}
      onUpdateDocket={onUpdateDocket}
      onResizeDocket={onResizeDocket}
      isSelected={isSelected}
      onSelect={onSelect}
      isLocked={false}
      canDrag
      canResize
      setNodeRef={setNodeRef}
      dragHandleProps={{ ...listeners, ...attributes }}
      isDragging={isDragging}
    />
  );
}

function DocketCardView({
  docket,
  layout,
  onUpdateDocket,
  onResizeDocket,
  isSelected,
  onSelect,
  isLocked,
  canDrag = false,
  canResize = false,
  setNodeRef,
  dragHandleProps,
  isDragging = false,
}: {
  docket: DispatchDocket;
  layout: { col: number };
  onUpdateDocket?: (docketId: string, updates: Partial<DispatchDocket>) => void;
  onResizeDocket?: (docketId: string, newDuration: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  isLocked: boolean;
  canDrag?: boolean;
  canResize?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}) {
  const [resizeDelta, setResizeDelta] = React.useState(0);
  const [isResizing, setIsResizing] = React.useState(false);
  const colors = getStatusColors(docket.docketStatus);

  const interval = getDocketIntervalHours(docket);
  if (!interval) return null;

  const top = interval.start * SLOT_HEIGHT_PX;
  const baseDurationHours = interval.end - interval.start;
  const baseHeight = baseDurationHours * SLOT_HEIGHT_PX;

  const currentHeight = Math.max(SLOT_HEIGHT_PX, baseHeight + resizeDelta);

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
    if (!canResize) return;
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
      if (Math.abs(finalDelta) < 4) {
        setResizeDelta(0);
        return;
      }

      const finalHeight = Math.max(SLOT_HEIGHT_PX, baseHeight + finalDelta);
      const finalSnappedHeight =
        Math.round(finalHeight / SLOT_HEIGHT_PX) * SLOT_HEIGHT_PX;
      const finalDuration = Math.max(
        1,
        Math.round(finalSnappedHeight / SLOT_HEIGHT_PX),
      );

      const maxDuration = Math.max(
        1,
        Math.floor(GRID_SPAN_HOURS - interval.start + 1e-6),
      );
      const validDuration = Math.min(finalDuration, maxDuration);

      const roundedBaseDuration = Math.round(baseDurationHours);
      if (validDuration !== roundedBaseDuration && onResizeDocket) {
        onResizeDocket(String(docket.id), validDuration);
      } else if (validDuration !== roundedBaseDuration && onUpdateDocket) {
        // Fallback to local update if resize handler is not provided
        onUpdateDocket(String(docket.id), {
          uiAssignedDuration: validDuration,
        });
      }
      setResizeDelta(0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const activeDuration = isResizing
    ? currentHeight / SLOT_HEIGHT_PX
    : baseDurationHours;
  const endBoundaryHour = interval.start + activeDuration;
  const endTime =
    endBoundaryHour >= GRID_SPAN_HOURS - 1e-6
      ? '00:00'
      : TIME_SLOTS[
      Math.min(
        Math.max(0, Math.ceil(endBoundaryHour - 1e-6) - 1),
        TIME_SLOTS.length - 1,
      )
      ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (!isResizing && onSelect) {
          onSelect();
        }
      }}
      className={`${colors.bg} border ${isResizing ? 'border-dashed border-[#059669]' : isSelected ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]' : colors.border} rounded-lg shadow-sm flex flex-col group overflow-hidden transition-shadow cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex flex-1">
        <div
          {...(canDrag ? dragHandleProps : {})}
          className={`flex items-center justify-center w-8 shrink-0 border-r ${colors.border} ${colors.handleBg} ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <GripVertical className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className={`font-bold ${colors.text} truncate text-[15px]`}>
              {docket.docketNumber}{' '}
              <span className={`${colors.text} font-semibold text-[12px] ml-1`}>
                {formatNumberThousandSeparator(
                  docket.actualLoadSize || docket.plannedLoadSize,
                )}{' '}
                {docket.productSellUom === 'M3' || docket.productSellUom === 'm3'
                  ? 'm³'
                  : docket.productSellUom === 'KG_20'
                    ? 'x 20kg'
                    : docket.productSellUom || ''}
              </span>
            </div>
          </div>
          <div
            className={`${colors.text} font-medium text-[13px] truncate mt-1`}
          >
            {docket.customerName || 'Unknown Customer'}
          </div>
          <div className={`${colors.textMuted} text-[12px] truncate`}>
            {docket.pickUpSuburb}, {docket.pickUpState}
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <span className={`${colors.textMuted} text-[12px] font-medium`}>
              {formatDocketTimeRangeFooter(docket)}
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
      {canResize && (
        <div
          className={`h-2.5 ${colors.handleBg} hover:bg-gray-200 cursor-ns-resize transition-colors mt-auto relative z-20 border-t ${colors.border}`}
          onPointerDown={handlePointerDown}
        />
      )}
    </div>
  );
}

export default function AssignedDockets({
  trucks,
  dockets,
  isLoading,
  onUpdateDocket,
  onResizeDocket,
  selectedDocketId,
  onSelectDocket,
  viewType = 'drivers',
  utilisationFocus,
  boardInteractionMode = 'full',
}: {
  trucks: TruckResource[];
  dockets: DispatchDocket[];
  isLoading?: boolean;
  onUpdateDocket?: (docketId: string, updates: Partial<DispatchDocket>) => void;
  onResizeDocket?: (docketId: string, newDuration: number) => void;
  selectedDocketId?: string | null;
  onSelectDocket?: (id: string | null) => void;
  viewType?: 'trucks' | 'drivers';
  utilisationFocus?: { docketId: string; loadSize: number } | null;
  boardInteractionMode?: DispatchBoardInteractionMode;
}) {
  const [expandedTruckId, setExpandedTruckId] = React.useState<string | null>(
    null,
  );

  const focusLoadSize = utilisationFocus?.loadSize ?? 0;

  const maxValidPercentage = React.useMemo(() => {
    if (!utilisationFocus || focusLoadSize <= 0) return 0;
    let max = 0;
    for (const truck of trucks) {
      const cap = truck.capacity || 0;
      if (cap > 0) {
        const pct = (focusLoadSize / cap) * 100;
        if (pct <= 100 && pct > max) {
          max = pct;
        }
      }
    }
    return max;
  }, [trucks, utilisationFocus, focusLoadSize]);

  const sortedTrucks = React.useMemo(() => {
    if (utilisationFocus && viewType === 'trucks' && focusLoadSize > 0) {
      return [...trucks].sort((a, b) => {
        const capA = a.capacity || 0;
        const capB = b.capacity || 0;
        const pctA = capA > 0 ? (focusLoadSize / capA) * 100 : 0;
        const pctB = capB > 0 ? (focusLoadSize / capB) * 100 : 0;

        const isGenericA =
          pctA === 0 || isGenericDispatchTruckName(a.name);
        const isGenericB =
          pctB === 0 || isGenericDispatchTruckName(b.name);

        const isValidA = !isGenericA && pctA > 0 && pctA <= 100;
        const isValidB = !isGenericB && pctB > 0 && pctB <= 100;

        const isExceedA = !isGenericA && pctA > 100;
        const isExceedB = !isGenericB && pctB > 100;

        // 1. Valid fits (<= 100%) come first
        if (isValidA && !isValidB) return -1;
        if (!isValidA && isValidB) return 1;

        // 2. If both are valid, sort descending (closest to 100% first)
        if (isValidA && isValidB) {
          return pctB - pctA;
        }

        // 3. Generic trucks (Open Capacity) go next (between under capacity and exceeds limit)
        if (isGenericA && !isGenericB) return -1;
        if (!isGenericA && isGenericB) return 1;

        if (isGenericA && isGenericB) return 0;

        // 4. Exceeded fits (> 100%) come last
        if (isExceedA && !isExceedB) return -1;
        if (!isExceedA && isExceedB) return 1;

        // 5. If both exceed, sort ascending (least exceeded first)
        if (isExceedA && isExceedB) {
          return pctA - pctB;
        }

        return 0;
      });
    }

    if (viewType === 'trucks') {
      return sortDispatchBoardTruckColumns(trucks);
    }

    return trucks;
  }, [trucks, utilisationFocus, viewType, focusLoadSize]);

  const renderTruckCard = (truck: TruckResource) => {
    const isExpanded = expandedTruckId === truck.id;
    if (expandedTruckId && !isExpanded) return null;

    const truckDockets = dockets.filter(
      (d) => d.uiAssignedTruckId === truck.id,
    );
    const { layouts, maxCols } = calculateLayouts(truckDockets);

    const DOCKET_WIDTH = 160;
    const innerWidthStr =
      maxCols > 1 ? `calc(max(100%, ${maxCols * DOCKET_WIDTH}px))` : '100%';

    let utilisationNode = null;
    if (utilisationFocus && viewType === 'trucks') {
      const cap = truck.capacity || 0;
      const pct = cap > 0 ? (focusLoadSize / cap) * 100 : 0;
      const displayPct = Math.round(pct);
      const isExceeds = pct > 100;
      const isMostEfficient =
        !isExceeds && pct === maxValidPercentage && pct > 0;
      const isGeneric = isGenericDispatchTruckName(truck.name);

      let colorTheme = {
        container: 'bg-amber-50 border-amber-200',
        text: 'text-slate-700',
        pctText: 'text-amber-700',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        barBg: 'bg-amber-200',
        barFill: 'bg-amber-500',
        label: 'Under capacity',
      };

      if (isGeneric) {
        colorTheme = {
          container: 'bg-gray-50 border-gray-200',
          text: 'text-slate-700',
          pctText: 'text-gray-700',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-800',
          barBg: 'bg-gray-200',
          barFill: 'bg-gray-500',
          label: 'Open Capacity',
        };
      }

      if (isExceeds) {
        colorTheme = {
          container: 'bg-red-50 border-red-200',
          text: 'text-slate-700',
          pctText: 'text-red-700',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-800',
          barBg: 'bg-red-200',
          barFill: 'bg-red-500',
          label: 'Exceeds limit',
        };
      } else if (isMostEfficient) {
        colorTheme = {
          container: 'bg-emerald-50 border-emerald-200',
          text: 'text-slate-700',
          pctText: 'text-emerald-700',
          badgeBg: 'bg-emerald-100',
          badgeText: 'text-emerald-800',
          barBg: 'bg-emerald-200',
          barFill: 'bg-emerald-500',
          label: 'Most efficient fit',
        };
      }

      utilisationNode = (
        <div
          className={`px-3 py-2 rounded-lg border flex flex-col gap-1.5 ${colorTheme.container}`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-semibold ${colorTheme.text}`}>
              Load utilisation
            </span>
            <div
              className={`flex-1 h-2 rounded-full overflow-hidden ${colorTheme.barBg}`}
            >
              <div
                className={`h-full rounded-full ${colorTheme.barFill}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span
              className={`text-[13px] font-bold ${colorTheme.pctText} flex items-center`}
            >
              {isGeneric ? (
                <>
                  <Infinity className="w-5 h-5" />%
                </>
              ) : (
                `${displayPct}%`
              )}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorTheme.badgeBg} ${colorTheme.badgeText}`}
            >
              {colorTheme.label}
            </span>
          </div>
        </div>
      );
    }

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
                <TableBadges names={[truck.businessType || 'INTERNAL']} />
              </div>
              <p className="text-[14px] text-[#64748B] mt-0.5">
                {truck.haulierName || ''}
              </p>
            </div>
            <button
              onClick={() => setExpandedTruckId(isExpanded ? null : truck.id)}
              className="p-1.5 border border-[#E2E8F0] rounded-md hover:bg-gray-50 text-[#64748B] transition-colors"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {viewType === 'trucks' ? (
              <>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="flex items-center justify-center gap-1 text-[18px] font-bold text-[#0F172A]">
                    {isGenericDispatchTruckName(truck.name) ? (
                      <Infinity className="w-5 h-5" />
                    ) : (
                      truck.capacity
                    )}{' '}
                    m³
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    Capacity
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">
                    {truck.trips}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    Trips today
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">
                    {truck.driversCount}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    Drivers
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">
                    1
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    Trucks today
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">
                    {truck.trips}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    Trips today
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1 border border-[#E2E8F0] rounded-lg bg-white">
                  <span className="text-[18px] font-bold text-[#0F172A]">
                    11
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    This week
                  </span>
                </div>
              </>
            )}
          </div>
          {utilisationNode}
        </div>

        {/* Scrollable Time Slots */}
        <div className="flex-1 overflow-auto relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center gap-2 z-20">
              <Spinner size="medium" />
              <div className="text-sm text-gray-500 font-medium">
                Loading assignments...
              </div>
            </div>
          )}
          <div
            className="flex flex-col relative"
            style={{ minWidth: innerWidthStr }}
          >
            {/* Background Grid */}
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="flex border-b border-[#E2E8F0] h-[112px] shrink-0"
              >
                {/* Time Label */}
                <div className="w-16 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-center pt-2 sticky left-0 z-20">
                  <span className="text-[13px] font-medium text-[#0F172A]">
                    {time}
                  </span>
                </div>
                {/* Droppable Area */}
                <div className="flex-1 relative">
                  <DroppableSlot
                    truckId={truck.id}
                    time={time}
                    disabled={boardInteractionMode !== 'full'}
                  >
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
                    onResizeDocket={onResizeDocket}
                    isSelected={selectedDocketId === String(docket.id)}
                    onSelect={() => onSelectDocket?.(String(docket.id))}
                    boardInteractionMode={boardInteractionMode}
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
    <div
      className={`flex gap-4 h-full ${expandedTruckId ? '' : 'overflow-x-auto'}`}
    >
      {sortedTrucks.map((truck) => renderTruckCard(truck))}
    </div>
  );
}
