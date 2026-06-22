'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Clock, FileText, Search, Truck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { useDebounce } from '@/hooks/use-debounce';
import {
  formatDispatchProductSellUomLabel,
  formatTimeRange,
  normalizedLoadM3ForSort,
  parseCollectionStartMs,
} from '@/lib/utils/dispatch-helper';
import { useDispatchMobile } from '../dispatch-mobile-context';
import {
  hasActiveQueueFilters,
  QueueFiltersDrawer,
  QueueFiltersTriggerButton,
  type QueueFilterState,
} from './queue-filters-drawer';
import {
  QueueSortDrawer,
  QueueSortTriggerButton,
  type QueueSortKey,
} from './queue-sort-drawer';

export function UnassignedDockets() {
  const {
    date,
    unassignedForDay,
    allUnassignedDockets,
    isLoadingQueue,
    queueDateScope,
    setQueueDateScope,
    isLoadingAllUnassignedDockets,
    hasNextUnassignedPage,
    isFetchingNextUnassignedPage,
    fetchNextUnassignedPage,
    setQueueListSortBy,
    setQueueListSearch,
    openAssignTruck,
    openAssignDriver,
    openDetails,
  } = useDispatchMobile();

  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const isFetchingNextPageRef = React.useRef(false);
  const hasNextPageRef = React.useRef(hasNextUnassignedPage);
  const queueDateScopeRef = React.useRef(queueDateScope);
  hasNextPageRef.current = hasNextUnassignedPage;
  queueDateScopeRef.current = queueDateScope;

  React.useEffect(() => {
    if (!isFetchingNextUnassignedPage) {
      isFetchingNextPageRef.current = false;
    }
  }, [isFetchingNextUnassignedPage]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = React.useState<QueueSortKey>('time');
  const [customerNames, setCustomerNames] = React.useState<string[]>([]);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const queueFilter: QueueFilterState = {
    dateScope: queueDateScope,
    customerNames,
  };

  const handleQueueFilterChange = (next: QueueFilterState) => {
    setQueueDateScope(next.dateScope);
    setCustomerNames(next.customerNames);
  };

  React.useEffect(() => {
    if (queueDateScope === 'all_dates') {
      setQueueListSortBy(sortBy);
      setQueueListSearch(debouncedSearch.trim() || undefined);
      return;
    }
    setQueueListSearch(undefined);
  }, [
    sortBy,
    debouncedSearch,
    queueDateScope,
    setQueueListSortBy,
    setQueueListSearch,
  ]);

  const isLoading = isLoadingQueue;

  const scopeDockets =
    queueDateScope === 'this_day' ? unassignedForDay : allUnassignedDockets;

  const customerOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const d of scopeDockets) {
      if (d.customerName) names.add(d.customerName);
    }
    return [...names].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
  }, [scopeDockets]);

  const visibleDockets = React.useMemo(() => {
    const filtered = scopeDockets.filter((d) => {
      if (
        customerNames.length > 0 &&
        (!d.customerName || !customerNames.includes(d.customerName))
      ) {
        return false;
      }
      return true;
    });

    // All dates: preserve API page order so infinite scroll appends at the bottom.
    if (queueDateScope === 'all_dates') {
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
      }
      if (cmp !== 0) return cmp;
      return String(a.docketNumber).localeCompare(String(b.docketNumber));
    });
    return list;
  }, [
    scopeDockets,
    customerNames,
    queueDateScope,
    sortBy,
  ]);

  React.useEffect(() => {
    if (isLoadingAllUnassignedDockets) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (queueDateScopeRef.current !== 'all_dates') return;
        if (
          entries[0]?.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          isFetchingNextPageRef.current = true;
          fetchNextUnassignedPage();
        }
      },
      { rootMargin: '120px', threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    isLoadingAllUnassignedDockets,
    fetchNextUnassignedPage,
    visibleDockets.length,
  ]);

  const filtersActive = hasActiveQueueFilters(queueFilter);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-end gap-2">
        {queueDateScope === 'all_dates' ? (
          <QueueSortTriggerButton onClick={() => setSortOpen(true)} />
        ) : null}
        <QueueFiltersTriggerButton
          active={filtersActive}
          onClick={() => setFiltersOpen(true)}
        />
      </div>

      {queueDateScope === 'all_dates' ? (
        <QueueSortDrawer
          open={sortOpen}
          onOpenChange={setSortOpen}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      ) : null}

      <QueueFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filter={queueFilter}
        onFilterChange={handleQueueFilterChange}
        customerOptions={customerOptions}
        boardDate={date}
        isDateScopeLoading={isLoadingAllUnassignedDockets}
      />

      {queueDateScope === 'all_dates' ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, customer, product..."
            className="h-11 rounded-xl border-gray-200 pl-9"
          />
        </div>
      ) : null}

      {queueDateScope === 'all_dates' ? (
        <p className="text-xs text-[#64748B]">
          Showing unassigned dockets across all dates. Assigning schedules on{' '}
          <span className="font-semibold text-[#0F172A]">
            {format(date, 'd MMM yyyy')}
          </span>
          .
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="medium" />
        </div>
      ) : visibleDockets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-muted-foreground">
          No unassigned dockets match your filters.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleDockets.map((docket) => {
            const loadSize =
              docket.actualLoadSize || docket.plannedLoadSize || 0;
            const uomLabel = formatDispatchProductSellUomLabel(
              docket.productSellUom,
            );

            return (
              <div
                key={docket.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-[#8E51FF]">
                    {docket.docketNumber}
                  </span>
                  {queueDateScope === 'all_dates' &&
                    docket.deliveryCollectionDate ? (
                    <span className="rounded-md border border-[#E9D5FF] bg-[#FAF5FF] px-2 py-0.5 text-xs font-semibold text-[#6D28D9]">
                      {format(
                        new Date(
                          docket.deliveryCollectionDate.replace('Z', ''),
                        ),
                        'd MMM yyyy',
                      )}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 text-lg font-bold text-[#0F172A]">
                  {docket.customerName || 'Unknown customer'}
                </h3>
                <p className="text-sm text-[#64748B]">
                  {docket.productName || '—'}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-gray-200 bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#0F172A]">
                    {formatNumberThousandSeparator(loadSize)} {uomLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#0F172A]">
                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                    {formatTimeRange(
                      docket.deliveryCollectionStartTime,
                      docket.deliveryCollectionEndTime,
                    )}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className="h-10 rounded-lg bg-[#8E51FF] hover:bg-[#7C3AED]"
                    onClick={() => openAssignTruck(String(docket.id))}
                  >
                    <Truck className="mr-1.5 h-4 w-4" />
                    Assign truck
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg border-[#C4B5FD] bg-[#F5F3FF] text-[#7C3AED] hover:bg-[#EDE9FE]"
                    onClick={() => openAssignDriver(String(docket.id))}
                  >
                    <User className="mr-1.5 h-4 w-4" />
                    Assign driver
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 h-10 w-full rounded-lg border-gray-200"
                  onClick={() => openDetails(String(docket.id))}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  Details
                </Button>
              </div>
            );
          })}
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextUnassignedPage ? <Spinner size="medium" /> : null}
          </div>
        </div>
      )}
    </div>
  );
}
