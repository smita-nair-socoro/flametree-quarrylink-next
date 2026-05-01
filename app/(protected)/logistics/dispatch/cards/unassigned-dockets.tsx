'use client';

import * as React from 'react';
import { Search, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from 'react-aria-components';
import { format, startOfDay } from 'date-fns';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  DispatchDocket,
  formatTimeRange,
  formatDate,
} from '../views/dispatch-view';

function parseCollectionStartMs(iso: string | undefined): number {
  if (!iso) return 0;
  const local = iso.includes('T') ? iso.replace('Z', '') : iso;
  const t = new Date(local).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function dayBucketMs(iso: string | undefined): number {
  const ms = parseCollectionStartMs(iso);
  if (!ms) return 0;
  return startOfDay(new Date(ms)).getTime();
}

/**
 * Comparable “volume” in m³ when product density is available (same basis as job line item:
 * 1 TN → m³ via densityTonnagePerM3). Without density, falls back to raw loadSize.
 */
function normalizedLoadM3ForSort(docket: DispatchDocket): number {
  const density = docket.jobItem?.product?.densityTonnagePerM3;
  const uom = docket.productSellUom;
  const qty = Number(docket.loadSize);
  if (!Number.isFinite(qty)) return 0;

  if (density != null && density > 0) {
    if (uom === 'TN') return qty / density;
    if (uom === 'M3') return qty;
    if (uom === 'KG_20' || uom === 'BULKA') {
      return (qty * 0.02) / density;
    }
  }

  return qty;
}

type UnassignedSortKey = 'time' | 'size' | 'customer';

function matchesUnassignedSearch(docket: DispatchDocket, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const num = (docket.docketNumber || '').toLowerCase();
  const customer = (docket.customerName || '').toLowerCase();
  return num.includes(q) || customer.includes(q);
}

function DraggableDocketCard({
  docket,
  activeTab,
  isSelected,
  onSelect,
}: {
  docket: DispatchDocket;
  activeTab: string;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(docket.id),
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`bg-white border rounded-xl flex overflow-hidden shadow-sm shrink-0 cursor-pointer transition-colors ${isSelected
        ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]'
        : 'border-[#E2E8F0]'
        } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag Handle Area */}
      <div
        {...listeners}
        {...attributes}
        className="w-8 bg-[#FEFCE8] flex items-center justify-center border-r border-[#E2E8F0] shrink-0 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-[#D97706]" />
      </div>

      {/* Card Content */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-[#64748B]">
            {docket.docketNumber}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[#FDE68A] text-[12px] font-semibold text-[#7b3805] bg-yellow-50 whitespace-nowrap">
            {docket.loadSize}{' '}
            {docket.productSellUom === 'M3'
              ? 'm³'
              : docket.productSellUom === 'KG_20'
                ? 'x 20kg'
                : docket.productSellUom || ''}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[#E2E8F0] text-[12px] font-semibold text-[#0F172A] bg-white whitespace-nowrap">
            {formatTimeRange(
              docket.deliveryCollectionStartTime,
              docket.deliveryCollectionEndTime,
            )}
          </span>
        </div>
        <div className="">
          {activeTab === 'all_dates' && (
            <span className="px-2 py-0.5 rounded-full border border-[#E9D5FF] text-[12px] font-semibold text-[#6D28D9] bg-[#FAF5FF] whitespace-nowrap">
              {formatDate(docket.deliveryCollectionStartTime)}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-[16px] font-bold text-[#0F172A] leading-tight truncate">
            {docket.customerName || 'Unknown Customer'}
          </h3>
          <p className="text-[13px] text-[#64748B] truncate">
            {docket.productName || ''}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
              PICKUP
            </span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {docket.pickUpAddress}
            </span>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
              DROP
            </span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {docket.deliveryAddress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocketCardOverlay({ docket }: { docket: DispatchDocket }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl flex overflow-hidden shadow-2xl shrink-0 rotate-2 cursor-grabbing w-[320px]">
      {/* Drag Handle Area */}
      <div className="w-8 bg-[#FEFCE8] flex items-center justify-center pt-4 border-r border-[#E2E8F0] shrink-0">
        <GripVertical className="h-4 w-4 text-[#D97706]" />
      </div>

      {/* Card Content */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-[#64748B]">
            {docket.docketNumber}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[#FDE68A] text-[12px] font-semibold text-[#7b3805] bg-yellow-50 whitespace-nowrap">
            {docket.loadSize}{' '}
            {docket.productSellUom === 'M3'
              ? 'm³'
              : docket.productSellUom === 'KG_20'
                ? 'x 20kg'
                : docket.productSellUom || ''}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[#E2E8F0] text-[12px] font-semibold text-[#0F172A] bg-white whitespace-nowrap">
            {formatTimeRange(
              docket.deliveryCollectionStartTime,
              docket.deliveryCollectionEndTime,
            )}
          </span>
        </div>

        <div>
          <h3 className="text-[16px] font-bold text-[#0F172A] leading-tight truncate">
            {docket.customerName || 'Unknown Customer'}
          </h3>
          <p className="text-[13px] text-[#64748B] truncate">
            {docket.productName || ''}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
              PICKUP
            </span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {docket.pickUpAddress}
            </span>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
              DROP
            </span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {docket.deliveryAddress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnassignedDockets({
  date,
  dockets,
  isLoading,
  selectedDocketId,
  onSelectDocket,
}: {
  date: Date;
  dockets: DispatchDocket[];
  isLoading?: boolean;
  selectedDocketId?: string | null;
  onSelectDocket?: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<'this_day' | 'all_dates'>(
    'this_day',
  );

  const [sortBy, setSortBy] = React.useState<UnassignedSortKey>('time');
  const [searchQuery, setSearchQuery] = React.useState('');

  const unassignedDockets = dockets.filter((d) => {
    const isUnassigned = d.docketStatus === 'UNASSIGNED';
    if (!isUnassigned) return false;

    if (activeTab === 'this_day') {
      // chnage to deliveryCollectionDate once we have the data
      // const docketDate = new Date(d.deliveryCollectionDate);
      const docketDate = new Date(d.deliveryCollectionStartTime);
      return (
        docketDate.getFullYear() === date.getFullYear() &&
        docketDate.getMonth() === date.getMonth() &&
        docketDate.getDate() === date.getDate()
      );
    }

    return true;
  });

  const visibleUnassignedDockets = React.useMemo(() => {
    const filtered = unassignedDockets.filter((d) =>
      matchesUnassignedSearch(d, searchQuery),
    );
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      if (
        activeTab === 'all_dates' &&
        sortBy === 'customer'
      ) {
        cmp = dayBucketMs(a.deliveryCollectionStartTime) -
          dayBucketMs(b.deliveryCollectionStartTime);
        if (cmp !== 0) return cmp;
      }
      switch (sortBy) {
        case 'time':
          cmp =
            parseCollectionStartMs(a.deliveryCollectionStartTime) -
            parseCollectionStartMs(b.deliveryCollectionStartTime);
          break;
        case 'size':
          cmp =
            normalizedLoadM3ForSort(a) - normalizedLoadM3ForSort(b);
          break;
        case 'customer':
          cmp = (a.customerName || '').localeCompare(
            b.customerName || '',
            undefined,
            { sensitivity: 'base' },
          );
          break;
        default:
          break;
      }
      if (cmp !== 0) return cmp;
      return String(a.docketNumber).localeCompare(String(b.docketNumber));
    });
    return list;
  }, [unassignedDockets, sortBy, activeTab, searchQuery]);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: 'unassigned-queue',
  });

  return (
    <div
      ref={setDroppableRef}
      className={`bg-white border ${isOver ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-[#FDE68A]'} h-full rounded-xl flex flex-col transition-colors`}
    >
      {/* Header Section */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wider text-[#B45309]">
              SOURCE QUEUE
            </span>
            <h2 className="text-[22px] font-bold text-[#0F172A]">Unassigned</h2>
          </div>
          <div className="px-3 py-1.5 rounded-full border border-[#FDE68A] text-[12px] font-medium text-[#B45309]">
            Drag out to assign
          </div>
        </div>

        <p className="text-[14px] text-[#64748B]">
          {searchQuery.trim()
            ? `${visibleUnassignedDockets.length} of ${unassignedDockets.length} dockets match`
            : `${unassignedDockets.length} dockets waiting for assignment`}
        </p>

        {/* Custom Toggle Tabs */}
        <div className="flex w-full rounded-lg border border-[#FDE68A] bg-[#FEFCE8]/30">
          <button
            onClick={() => setActiveTab('this_day')}
            className={`flex-1 py-2 text-[14px] font-medium rounded-md cursor-pointer transition-colors ${activeTab === 'this_day'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#FDE68A]'
              : 'text-[#B45309] hover:bg-[#FEFCE8]'
              }`}
          >
            This day
          </button>
          <button
            onClick={() => setActiveTab('all_dates')}
            className={`flex-1 py-2 text-[14px] font-medium rounded-md cursor-pointer transition-colors ${activeTab === 'all_dates'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#FDE68A]'
              : 'text-[#B45309] hover:bg-[#FEFCE8]'
              }`}
          >
            All dates
          </button>
        </div>

        {activeTab === 'all_dates' && (
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Sorted by date, then by your sort option. Dragging onto the board schedules on{' '}
            <span className="font-bold text-[#0F172A]">
              {format(date, 'EEEE, d MMMM yyyy')}
            </span>
            .
          </p>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            placeholder="Search dockets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#FDE68A] focus-visible:ring-[#FDE68A] rounded-lg h-10 text-[14px]"
            aria-label="Search dockets by number or customer"
          />
        </div>

        {/* Sort Select */}
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as UnassignedSortKey)}
        >
          <SelectTrigger className="w-full border-[#FDE68A] focus:ring-[#FDE68A] rounded-lg h-10 text-[14px] font-medium">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Sort by Time</SelectItem>
            <SelectItem value="size">Sort by Size</SelectItem>
            <SelectItem value="customer">Sort by Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-2" />
      {/* Scrollable Dockets List */}

      {isOver && (
        <div className="shrink-0 px-4 pb-3">
          <div className="rounded-xl border border-[#E7C37C] bg-[#FFF9E8] px-4 py-3.5 shadow-sm">
            <p className="text-center text-[14px] font-semibold leading-snug text-[#78350F]">
              Release to unassign — docket returns here after you confirm
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Loading dockets...
          </div>
        ) : unassignedDockets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No unassigned dockets found.
          </div>
        ) : visibleUnassignedDockets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 px-2 text-center">
            No dockets match your search. Try another docket number or customer
            name.
          </div>
        ) : (
          visibleUnassignedDockets.map((docket) => (
            <DraggableDocketCard
              key={docket.id}
              docket={docket}
              activeTab={activeTab}
              isSelected={selectedDocketId === String(docket.id)}
              onSelect={() => onSelectDocket?.(String(docket.id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
