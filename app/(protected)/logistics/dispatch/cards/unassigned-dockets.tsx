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
import { format } from 'date-fns';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DocketsInfiniteListQueryOptions } from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { useDebounce } from '@/hooks/use-debounce';
import {
  DispatchDocket,
  formatTimeRange,
  formatDate,
  parseCollectionStartMs,
  normalizedLoadM3ForSort,
  matchesUnassignedSearch,
  mapUnassignedDocketDtoToBoardRow,
} from '@/lib/utils/dispatch-helper';
import { Spinner } from '@/components/ui/spinner';

type UnassignedSortKey = 'time' | 'size' | 'customer';

/** Server sort for infinite scroll — must match list order so new pages append at the end. */
function getAllDatesApiSortParams(sortBy: UnassignedSortKey): {
  sortBy: string;
  sortOrder: 'asc';
} {
  switch (sortBy) {
    case 'time':
      return { sortBy: 'deliveryCollectionStartTime', sortOrder: 'asc' };
    case 'size':
      return { sortBy: 'plannedLoadSize', sortOrder: 'asc' };
    case 'customer':
      return { sortBy: 'customerName', sortOrder: 'asc' };
  }
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
            {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
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
              {formatDate(docket.deliveryCollectionDate)}
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
              {docket.pickUpSuburb}, {docket.pickUpState}
            </span>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
              DROP
            </span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {docket.deliverySuburb}, {docket.deliveryState}
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
            {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
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
              {docket.pickUpSuburb}, {docket.pickUpState}
            </span>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold tracking-wider text-[#64748B] uppercase">
              DROP
            </span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {docket.deliverySuburb}, {docket.deliveryState}
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
  assignedDocketIds = [],
  isLoading,
  selectedDocketId,
  onSelectDocket,
}: {
  date: Date;
  dockets: DispatchDocket[];
  assignedDocketIds?: string[];
  isLoading?: boolean;
  selectedDocketId?: string | null;
  onSelectDocket?: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<'this_day' | 'all_dates'>(
    'this_day',
  );

  const [sortBy, setSortBy] = React.useState<UnassignedSortKey>('time');
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const assignedIdsSet = React.useMemo(
    () => new Set(assignedDocketIds),
    [assignedDocketIds],
  );

  const {
    data: allDatesPages,
    isLoading: isAllDatesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...DocketsInfiniteListQueryOptions({
      pageSize: 10,
      search: debouncedSearch.trim() || undefined,
      status: DOCKET_STATUS.UNASSIGNED,
      ...getAllDatesApiSortParams(sortBy),
    }),
    enabled: activeTab === 'all_dates',
  });

  const allDatesUnassigned = React.useMemo(() => {
    const pages = allDatesPages?.pages ?? [];
    const seenIds = new Set<number>();
    const raw: DocketDTO[] = [];

    for (const page of pages) {
      const items = Array.isArray(page) ? page : (page.content ?? []);
      for (const docket of items) {
        if (seenIds.has(docket.id)) continue;
        seenIds.add(docket.id);
        raw.push(docket);
      }
    }

    return raw
      .filter((d) => !assignedIdsSet.has(String(d.id)))
      .map(mapUnassignedDocketDtoToBoardRow);
  }, [allDatesPages, assignedIdsSet]);

  const thisDayUnassigned = React.useMemo(
    () =>
      dockets.filter((d) => {
        if (d.docketStatus !== DOCKET_STATUS.UNASSIGNED) return false;
        if (!d.deliveryCollectionDate) return false;
        const docketDate = new Date(d.deliveryCollectionDate);
        return (
          docketDate.getFullYear() === date.getFullYear() &&
          docketDate.getMonth() === date.getMonth() &&
          docketDate.getDate() === date.getDate()
        );
      }),
    [dockets, date],
  );

  const unassignedDockets =
    activeTab === 'this_day' ? thisDayUnassigned : allDatesUnassigned;

  const isQueueLoading =
    activeTab === 'all_dates' ? isAllDatesLoading : isLoading;

  const visibleUnassignedDockets = React.useMemo(() => {
    const filtered =
      activeTab === 'all_dates'
        ? unassignedDockets
        : unassignedDockets.filter((d) =>
            matchesUnassignedSearch(d, searchQuery),
          );

    // All dates: preserve API page order so infinite scroll appends at the bottom.
    if (activeTab === 'all_dates') {
      return filtered;
    }

    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'time':
          cmp =
            parseCollectionStartMs(a.deliveryCollectionStartTime) -
            parseCollectionStartMs(b.deliveryCollectionStartTime);
          break;
        case 'size':
          cmp = normalizedLoadM3ForSort(a) - normalizedLoadM3ForSort(b);
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

  const hasNextPageRef = React.useRef(hasNextPage);
  const isFetchingNextPageRef = React.useRef(false);
  hasNextPageRef.current = hasNextPage;

  React.useEffect(() => {
    if (!isFetchingNextPage) {
      isFetchingNextPageRef.current = false;
    }
  }, [isFetchingNextPage]);

  React.useEffect(() => {
    if (activeTab !== 'all_dates' || isAllDatesLoading) return;
    const root = scrollContainerRef.current;
    const target = loadMoreRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          isFetchingNextPageRef.current = true;
          fetchNextPage();
        }
      },
      { root, rootMargin: '120px', threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, isAllDatesLoading, fetchNextPage]);

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
            Sorted by date, then by your sort option. Dragging onto the board
            schedules on{' '}
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

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3"
      >
        {isQueueLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full text-sm text-gray-500 font-medium">
            <Spinner size="medium" />
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
          <>
            {visibleUnassignedDockets.map((docket) => (
              <DraggableDocketCard
                key={docket.id}
                docket={docket}
                activeTab={activeTab}
                isSelected={selectedDocketId === String(docket.id)}
                onSelect={() => onSelectDocket?.(String(docket.id))}
              />
            ))}
            {activeTab === 'all_dates' && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-3 text-sm text-gray-500"
              >
                {isFetchingNextPage ? (
                  <Spinner size="small" />
                ) : hasNextPage ? (
                  'Scroll for more…'
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
