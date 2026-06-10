'use client';

import * as React from 'react';
import {
  Clock,
  FileText,
  ListFilter,
  Search,
  SlidersHorizontal,
  Truck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import {
  formatDispatchProductSellUomLabel,
  formatTimeRange,
  matchesUnassignedSearch,
  normalizedLoadM3ForSort,
  parseCollectionStartMs,
} from '@/lib/utils/dispatch-helper';
import { useDispatchMobile } from '../dispatch-mobile-context';

type SortKey = 'time' | 'size' | 'customer';

export function UnassignedDockets() {
  const {
    unassignedForDay,
    isLoadingTrucks,
    isLoadingDrivers,
    openAssignTruck,
    openAssignDriver,
    openDetails,
  } = useDispatchMobile();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortKey>('time');

  const isLoading = isLoadingTrucks || isLoadingDrivers;

  const visibleDockets = React.useMemo(() => {
    const filtered = unassignedForDay.filter((d) =>
      matchesUnassignedSearch(d, searchQuery),
    );
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
  }, [unassignedForDay, searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-end gap-2">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="h-9 w-[110px] rounded-lg border-gray-200 text-sm">
            <ListFilter className="mr-1 h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Time</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-gray-200 text-sm font-medium"
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ID, customer, product..."
          className="h-11 rounded-xl border-gray-200 pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="medium" />
        </div>
      ) : visibleDockets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-muted-foreground">
          No unassigned dockets for this day.
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
        </div>
      )}
    </div>
  );
}
