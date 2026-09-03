'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
  Updater,
  RowSelectionState,
  Row,
  RowPinningState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './button';
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  Loader2,
  Plus,
  Search,
  Filter,
  X,
  Check,
} from 'lucide-react';
import { TablePaginationFooter } from './table-pagination-footer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from './dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { DataTableFacetedFilter } from '../table-faceted-filter';
import { useFacets } from '@/hooks/useFacets';
import { InputIcon } from './input-icon';
import { Input } from './input';
import { cn, getSessionStorage, setSessionStorage } from '@/lib/utils';
import {
  usePinnedRecordsStore,
  usePinnedNewRecordIds,
  usePinnedNewRecordsData,
  usePinnedSyncErrorIds,
} from '@/app/stores/pinned-records-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { Checkbox } from './checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
import { formatNumberThousandSeparatorWithoutDecimal } from '@/lib/utils/number';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetDefinition?: FacetDefinition[];
  searchPlaceHolder?: string;
  simpleTable?: boolean;
  enablePagination?: boolean;
  tableId?: string; // Unique identifier for sessionStorage
  useColumnSizing?: boolean; // Optional prop to enable column sizing
  onRowClick?: (row: TData) => void; // Optional row click handler
  isShowHideColumns?: boolean;
  enableRowSelection?: boolean; // Enable row selection with checkboxes
  onRowSelectionChange?: (selectedRows: TData[]) => void; // Callback when selection changes
  rowSelectionFilter?: (row: TData) => boolean; // Filter which rows can be selected
  bulkActionsSlot?: React.ReactNode; // Slot for bulk action buttons
  allowClicksInsideModal?: boolean; // Allow row clicks when table is inside a modal/dialog (default: false)
  defaultSorting?: SortingState; // Default sorting configuration
  mobileCardRenderer?: (
    row: TData,
    onViewDetails?: () => void,
  ) => React.ReactNode; // Render function for mobile cards
  mobileUseTablePagination?: boolean; // Use TanStack pagination instead of mobile load-more cards
  mobileInfinite?: {
    items: TData[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    isLoading?: boolean;
    fetchNextPage: () => void;
  };
  totalElements?: number; // External pagination total records
  totalPages?: number; // External pagination total pages
  onPaginationChange?: (page: number, pageSize: number) => void; // Callback for server-side pagination
  externalPageIndex?: number; // Controlled page index from parent
  externalPageSize?: number; // Controlled page size from parent
  onSearchChange?: (search: string) => void; // Callback for server-side search (debounced)
  onFacetFiltersChange?: (filters: ColumnFiltersState) => void; // Callback for server-side facet filters (debounced)
  onSortingChange?: (sorting: SortingState) => void; // Callback for server-side sorting
  externalSorting?: SortingState; // Controlled sorting state from parent
  isLoading?: boolean; // Show loading overlay while server data is fetching
}

export type FacetDefinition = {
  column: string;
  title?: string;
  icon?: LucideIcon;
  /** When set, options come from the server instead of the current table rows. */
  options?: Array<{ value: string; label: string; icon?: LucideIcon }>;
  hideSearch?: boolean;
  asyncSearch?: (
    query: string,
  ) => Promise<Array<{ value: string; label: string }>>;
};

const SEARCH_MIN_WIDTH = 56; // just enough for the search icon + padding, no text

const paginationSizeSelect = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

// Default state values
const defaultPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};
const defaultColumnFilters: ColumnFiltersState = [];
const defaultGlobalFilter = '';
const defaultColumnVisibility: VisibilityState = {};
const defaultPaginationSize = '10';
const defaultRowSelection: RowSelectionState = {};

function areColumnFiltersEqual(
  left: ColumnFiltersState,
  right: ColumnFiltersState,
) {
  if (left.length !== right.length) return false;

  return left.every((filter, index) => {
    const other = right[index];
    return JSON.stringify(filter) === JSON.stringify(other);
  });
}

/** Empty state shown for the mobile card list, whether backed by infinite scroll or client-side pagination. */
function MobileEmptyState() {
  return (
    <div className="relative bg-purple-50 border-2 border-dashed border-purple-200 p-12 text-center rounded-md">
      <div className="flex justify-center mb-4">
        <Image
          src="/empty-table.svg"
          alt="No data available"
          width={128}
          height={128}
          className="w-32 h-auto"
        />
      </div>
      <h3 className="text-gray-700 font-medium mb-1">No items are available</h3>
    </div>
  );
}

export function DataTableClient<TData, TValue>({
  columns,
  data = [],
  facetDefinition = [],
  searchPlaceHolder = 'Filter..',
  simpleTable = false,
  enablePagination = true,
  tableId = 'default-table', // Default tableId if not provided
  useColumnSizing = false, // Default to false to maintain existing behavior
  onRowClick,
  isShowHideColumns = true,
  allowClicksInsideModal = false, // Default to false for safety
  enableRowSelection = false,
  onRowSelectionChange,
  rowSelectionFilter,
  bulkActionsSlot,
  defaultSorting, // Default sorting configuration (optional)
  mobileCardRenderer,
  mobileUseTablePagination = false,
  mobileInfinite,
  totalElements,
  totalPages,
  onPaginationChange,
  externalPageIndex,
  externalPageSize,
  onSearchChange,
  onFacetFiltersChange,
  onSortingChange,
  externalSorting,
  isLoading = false,
}: Readonly<DataTableProps<TData, TValue>>) {
  const isMobile = useIsMobile();

  const mobileInfiniteItems = mobileInfinite?.items;
  const mobileHasNextPage = mobileInfinite?.hasNextPage;
  const mobileIsFetchingNextPage = mobileInfinite?.isFetchingNextPage ?? false;
  const mobileIsLoading = mobileInfinite?.isLoading ?? false;
  const onFetchNextPage = mobileInfinite?.fetchNextPage;
  const mobileIsFetchingNextPageRef = useRef(mobileIsFetchingNextPage);
  mobileIsFetchingNextPageRef.current = mobileIsFetchingNextPage;

  const getStorageKey = useCallback(
    (key: string) => `${tableId}_${key}`,
    [tableId],
  );

  const newRecordIds = usePinnedNewRecordIds(tableId);
  const newRecordsDataRaw = usePinnedNewRecordsData(tableId);
  const newRecordsData = newRecordsDataRaw as unknown as TData[];

  // Convert to Set for fast lookup (only once per newRecordIds change)
  const newRecordIdsSet = useMemo(
    () => new Set<string>(newRecordIds),
    [newRecordIds],
  );

  const clearPinnedNewRecords = useCallback(() => {
    usePinnedRecordsStore.getState().clearPinned(tableId);
  }, [tableId]);

  const syncErrorRecordIds = usePinnedSyncErrorIds(tableId);

  const syncErrorRecordIdsSet = useMemo(
    () => new Set<string>(syncErrorRecordIds),
    [syncErrorRecordIds],
  );

  // Matches the `id !== 0` fallback in getRowId below, so pinned-row lookups
  // agree with TanStack's actual row identity.
  const getRowIdentity = useCallback(
    (row: TData & { id?: number | string | null; sub?: string }) => {
      if (row?.id != null && row.id !== 0) return String(row.id);
      if (typeof row?.sub === 'string' && row.sub.length > 0) return row.sub;
      return undefined;
    },
    [],
  );

  // Merge in any pinned new records that aren't present in the currently fetched
  // page of `data`.
  const tableData = useMemo(() => {
    if (newRecordsData.length === 0) return data;

    const presentIds = new Set(
      (data as Array<TData & { id?: number | string; sub?: string }>)
        .map(getRowIdentity)
        .filter((v): v is string => v !== undefined),
    );

    const missing = newRecordsData.filter((record) => {
      const id = getRowIdentity(record as TData & { id?: number | string });
      return id !== undefined && newRecordIdsSet.has(id) && !presentIds.has(id);
    });

    return missing.length > 0 ? [...missing, ...data] : data;
  }, [data, newRecordsData, newRecordIdsSet, getRowIdentity]);

  // Row pinning state (use TanStack Table row pinning instead of reordering data)
  const [rowPinning, setRowPinning] = useState<RowPinningState>(() => {
    const presentIds = new Set(
      (tableData as Array<TData & { id?: number | string; sub?: string }>)
        .map(getRowIdentity)
        .filter((v): v is string => v !== undefined),
    );
    const top = newRecordIds.filter((id) => presentIds.has(id));
    return { top, bottom: [] };
  });

  // Keep row pinning in sync with data and stored new IDs
  useEffect(() => {
    const presentIds = new Set(
      (tableData as Array<TData & { id?: number | string; sub?: string }>)
        .map(getRowIdentity)
        .filter((v): v is string => v !== undefined),
    );
    const top = newRecordIds.filter((id) => presentIds.has(id));
    setRowPinning((prev) => ({ ...prev, top }));
  }, [tableData, newRecordIds, getRowIdentity]);

  const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
      const stored = getSessionStorage(getStorageKey(key), fallback);
      return stored;
    } catch {
      return fallback;
    }
  };

  const saveToStorage = (key: string, value: unknown) => {
    try {
      setSessionStorage(getStorageKey(key), value);
    } catch (error) {
      console.warn(`Failed to save ${key} to sessionStorage:`, error);
    }
  };

  const defaultSortingState = useMemo(
    () => defaultSorting ?? [],
    [defaultSorting],
  );
  const defaultSortingStateRef = useRef(defaultSortingState);
  defaultSortingStateRef.current = defaultSortingState;

  // Initialize state with sessionStorage values or defaults
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (isMobile) return defaultPagination;
    return loadFromStorage('pagination', defaultPagination);
  });

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (externalSorting) return externalSorting;
    if (onSortingChange) return defaultSortingState;
    if (isMobile) return defaultSortingState;
    return loadFromStorage('sorting', defaultSortingState);
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (isMobile) return defaultColumnFilters;
    return loadFromStorage('columnFilters', defaultColumnFilters);
  });

  const [globalFilter, setGlobalFilter] = useState<string>(() => {
    if (isMobile) return defaultGlobalFilter;
    return loadFromStorage('globalFilter', defaultGlobalFilter);
  });

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);
  const isSearching = globalFilter !== debouncedGlobalFilter;

  // Filter loading state
  const [activeColumnFilters, setActiveColumnFilters] =
    useState<ColumnFiltersState>(() => {
      if (isMobile) return defaultColumnFilters;
      return loadFromStorage('columnFilters', defaultColumnFilters);
    });
  const debouncedColumnFilters = useDebounce(activeColumnFilters, 300);

  // Filtering drops pinned "new record" highlighting entirely — same
  // idempotent clearPinned() used below for pagination changes.
  useEffect(() => {
    if (columnFilters.length > 0 || globalFilter.trim().length > 0) {
      clearPinnedNewRecords();
    }
  }, [columnFilters, globalFilter, clearPinnedNewRecords]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (isMobile) return defaultColumnVisibility;
      return loadFromStorage('columnVisibility', defaultColumnVisibility);
    },
  );

  const [paginationSize, setPaginationSize] = useState(() => {
    if (isMobile) return defaultPaginationSize;
    return loadFromStorage('paginationSize', defaultPaginationSize);
  });

  const effectivePagination = useMemo(
    () => ({
      pageIndex: externalPageIndex ?? pagination.pageIndex,
      pageSize: externalPageSize ?? pagination.pageSize,
    }),
    [
      externalPageIndex,
      externalPageSize,
      pagination.pageIndex,
      pagination.pageSize,
    ],
  );

  useEffect(() => {
    if (externalPageIndex === undefined && externalPageSize === undefined) {
      return;
    }

    setPagination((prev) => {
      const nextPageIndex = externalPageIndex ?? prev.pageIndex;
      const nextPageSize = externalPageSize ?? prev.pageSize;

      if (nextPageIndex === prev.pageIndex && nextPageSize === prev.pageSize) {
        return prev;
      }

      return {
        pageIndex: nextPageIndex,
        pageSize: nextPageSize,
      };
    });

    if (externalPageSize !== undefined) {
      setPaginationSize(String(externalPageSize));
    }
  }, [externalPageIndex, externalPageSize]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tempColumnFilters, setTempColumnFilters] =
    useState<ColumnFiltersState>([]);

  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>(defaultRowSelection);

  // Mobile "Load More" state
  const [mobileVisibleCount, setMobileVisibleCount] = useState(10);
  const [mobilePageInput, setMobilePageInput] = useState('1');
  const MOBILE_PAGE_SIZE = 10;

  const mobileHasNextPageRef = useRef(mobileHasNextPage);
  mobileHasNextPageRef.current = mobileHasNextPage;
  const mobileSentinelObserverRef = useRef<IntersectionObserver | null>(null);
  const handleMobileSentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      mobileSentinelObserverRef.current?.disconnect();
      mobileSentinelObserverRef.current = null;
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;
          if (onFetchNextPage) {
            if (
              mobileHasNextPageRef.current &&
              !mobileIsFetchingNextPageRef.current
            ) {
              onFetchNextPage();
            }
          } else {
            setMobileVisibleCount((prev) => prev + MOBILE_PAGE_SIZE);
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(node);
      mobileSentinelObserverRef.current = observer;
    },
    [onFetchNextPage],
  );

  // Inline filter layout measurement
  const rowRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const showHideRef = useRef<HTMLDivElement>(null);
  const filterMeasureRef = useRef<HTMLDivElement>(null);
  const [filtersInline, setFiltersInline] = useState(false);

  // Sync temp filters when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setTempColumnFilters(columnFilters);
    }
  }, [drawerOpen, columnFilters]);

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedGlobalFilter);
    }
  }, [debouncedGlobalFilter, onSearchChange]);

  useEffect(() => {
    if (onFacetFiltersChange) {
      onFacetFiltersChange(debouncedColumnFilters);
    }
  }, [debouncedColumnFilters, onFacetFiltersChange]);

  // Update columnFilters when debounced filters change
  useEffect(() => {
    setColumnFilters((current) =>
      areColumnFiltersEqual(current, debouncedColumnFilters)
        ? current
        : debouncedColumnFilters,
    );
  }, [debouncedColumnFilters]);

  // Reset mobile visible count when filters or search change
  useEffect(() => {
    if (isMobile && !mobileUseTablePagination) {
      setMobileVisibleCount(MOBILE_PAGE_SIZE);
    }
  }, [globalFilter, columnFilters, isMobile, mobileUseTablePagination]);

  useEffect(() => {
    if (isMobile && mobileUseTablePagination) {
      setMobilePageInput(String(effectivePagination.pageIndex + 1));
    }
  }, [isMobile, mobileUseTablePagination, effectivePagination.pageIndex]);

  // Notify parent of selection changes
  useEffect(() => {
    if (enableRowSelection && onRowSelectionChange) {
      const selectedRowIds = Object.keys(rowSelection).filter(
        (key) => rowSelection[key],
      );
      const selectedRows = selectedRowIds
        .map((id) => {
          const index = Number.parseInt(id);
          return tableData[index];
        })
        .filter(Boolean);
      onRowSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  // Clear sessionStorage when switching to mobile or reset everything for mobile
  useEffect(() => {
    if (isMobile) {
      // Clear all sessionStorage for this table when on mobile
      const keys = [
        'pagination',
        'sorting',
        'columnFilters',
        'globalFilter',
        'columnVisibility',
        'paginationSize',
      ];
      keys.forEach((key) => {
        try {
          sessionStorage.removeItem(getStorageKey(key));
        } catch (error) {
          console.warn(`Failed to remove ${key} from sessionStorage:`, error);
        }
      });
      usePinnedRecordsStore.getState().clearPinned(tableId);

      // Reset all state to defaults
      setPagination(defaultPagination);
      setSorting(defaultSortingStateRef.current);
      setColumnFilters(defaultColumnFilters);
      setActiveColumnFilters(defaultColumnFilters);
      setGlobalFilter(defaultGlobalFilter);
      setColumnVisibility(defaultColumnVisibility);
      setPaginationSize(defaultPaginationSize);
    }
  }, [isMobile, tableId, getStorageKey]);

  // Enhanced state setters that save to localStorage (only when not mobile)
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((old) => {
      const currentState = {
        pageIndex: externalPageIndex ?? old.pageIndex,
        pageSize: externalPageSize ?? old.pageSize,
      };
      const newValue =
        typeof updater === 'function' ? updater(currentState) : updater;

      // clearPinned() is idempotent (no-op once already cleared), so it's
      // safe here even if React re-invokes this updater for the same commit.
      if (
        newValue.pageIndex !== currentState.pageIndex ||
        newValue.pageSize !== currentState.pageSize
      ) {
        clearPinnedNewRecords();
      }

      if (onPaginationChange) {
        // Schedule it so we don't cause React state updates during render phase
        setTimeout(
          () => onPaginationChange(newValue.pageIndex, newValue.pageSize),
          0,
        );
      }

      return newValue;
    });
  };

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((old) => {
      const currentSorting = externalSorting ?? old;
      const newValue =
        typeof updater === 'function' ? updater(currentSorting) : updater;

      if (!onSortingChange && !isMobile) {
        saveToStorage('sorting', newValue);
      }

      if (onSortingChange) {
        setTimeout(() => onSortingChange(newValue), 0);
      }

      return newValue;
    });
  };

  const handleColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      return newValue;
    });
  };

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    setGlobalFilter((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      return newValue;
    });
  };

  const handleColumnVisibilityChange = (updater: Updater<VisibilityState>) => {
    setColumnVisibility((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      if (!isMobile) {
        saveToStorage('columnVisibility', newValue);
      }
      return newValue;
    });
  };

  const handlePaginationSizeChange = (value: string) => {
    clearPinnedNewRecords();
    setPaginationSize(value);
    table.setPageSize(Number(value));
    if (onPaginationChange) {
      onPaginationChange(
        externalPageIndex ?? pagination.pageIndex,
        Number(value),
      );
    }
  };

  const pageSizeTriggerContent = useMemo(() => {
    const found = paginationSizeSelect.find((f) => f.value === paginationSize);
    return found?.label ?? 'Select page size';
  }, [paginationSize]);

  const handleMobilePageInputCommit = () => {
    const pageCount = Math.max(1, table.getPageCount());
    const nextPage = Number.parseInt(mobilePageInput, 10);

    if (Number.isFinite(nextPage) && nextPage >= 1 && nextPage <= pageCount) {
      table.setPageIndex(nextPage - 1);
      return;
    }

    setMobilePageInput(String(effectivePagination.pageIndex + 1));
  };

  // Create columns with checkbox column if row selection is enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const checkboxColumn: ColumnDef<TData, TValue> = {
      id: 'select',
      size: 40,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className={'data-[state=checked]:bg-[#1D2B41]'}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={!row.getCanSelect()}
          className={'data-[state=checked]:bg-[#1D2B41]'}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [checkboxColumn, ...columns];
  }, [columns, enableRowSelection]);

  // Define the filter function
  const arrIncludesSome: FilterFn<TData> = (row, columnId, filterValues) => {
    if (!Array.isArray(filterValues) || filterValues.length === 0) return true;

    const raw = row.getValue<unknown>(columnId);

    let arr: string[] = [];
    if (Array.isArray(raw)) {
      arr = raw.map((v) => String(v).trim());
    } else if (typeof raw === 'string' && raw.includes(',')) {
      arr = raw.split(',').map((v) => v.trim());
    } else if (typeof raw === 'string') {
      arr = [raw.trim()];
    }

    return arr.some((v) => filterValues.includes(v));
  };

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: (originalRow, index) => {
      const r = originalRow as TData & {
        id?: number | string | null;
        sub?: string;
      };
      if (r?.id != null && r.id !== 0) return String(r.id);
      if (typeof r?.sub === 'string' && r.sub.length > 0) return r.sub;
      return String(index);
    },
    enableRowPinning: true,

    manualPagination: enablePagination && !!onPaginationChange,
    manualFiltering: !!(onSearchChange || onFacetFiltersChange),
    manualSorting: !!onSortingChange,
    pageCount: totalPages,
    rowCount: totalElements,

    globalFilterFn: 'auto',

    filterFns: { arrIncludesSome },
    defaultColumn: { filterFn: arrIncludesSome },

    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    onRowPinningChange: setRowPinning,

    enableRowSelection: enableRowSelection
      ? (row: Row<TData>) => {
        if (!rowSelectionFilter) return true;
        return rowSelectionFilter(row.original);
      }
      : undefined,

    state: {
      sorting: externalSorting ?? sorting,
      pagination: {
        pageIndex: externalPageIndex ?? pagination.pageIndex,
        pageSize: externalPageSize ?? pagination.pageSize,
      },
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      rowPinning,
    },
  });

  // Notify parent of selection changes
  useEffect(() => {
    if (enableRowSelection && onRowSelectionChange) {
      const selectedRowIds = Object.keys(rowSelection).filter(
        (key) => rowSelection[key],
      );
      const selectedRows = selectedRowIds
        .map((id) => {
          // Use table.getRow to get the row by its ID (which could be the actual row id or index)
          try {
            const row = table.getRow(id);
            return row?.original;
          } catch (e) {
            // Row might not exist in current data model (e.g. after filtering/tab switch)
            console.error(e);
            return undefined;
          }
        })
        .filter((row): row is TData => row !== undefined);
      onRowSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, table]);

  // Clear temporary pinning when the table unmounts (e.g. navigating away).

  useEffect(() => {
    return () => {
      usePinnedRecordsStore.getState().clearPinned(tableId);
    };
  }, [tableId]);

  const facetedWithCounts = useFacets(table, facetDefinition);

  // Decide whether desktop filters fit in the gap between search bar and Show/Hide button
  useLayoutEffect(() => {
    if (isMobile) return;

    const calculate = () => {
      if (!rowRef.current || !filterMeasureRef.current) return;
      const containerWidth = rowRef.current.offsetWidth;

      const showHideWidth = showHideRef.current?.offsetWidth ?? 0;
      const filterWidth = filterMeasureRef.current.scrollWidth;
      const gap = 8; // gap-2 = 8px
      const available =
        containerWidth - SEARCH_MIN_WIDTH - showHideWidth - gap * 2;
      setFiltersInline(filterWidth > 0 && filterWidth <= available);
    };

    calculate();
    const observer = new ResizeObserver(calculate);
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [isMobile, facetedWithCounts.length, columnFilters.length]);

  function clearAllColumnFilters() {
    setColumnFilters([]);
    setTempColumnFilters([]);
    if (onFacetFiltersChange) {
      setActiveColumnFilters([]);
    } else if (!isMobile) {
      saveToStorage('columnFilters', []);
    }
  }

  function handleFilterChange(columnId: string, values: string[]) {
    const updateFilters = (old: ColumnFiltersState) => {
      const others = old.filter((f) => f.id !== columnId);
      return values.length
        ? [...others, { id: columnId, value: values }]
        : others;
    };

    setColumnFilters((old) => {
      const newFilters = updateFilters(old);
      if (!onFacetFiltersChange && !isMobile) {
        saveToStorage('columnFilters', newFilters);
      }
      return newFilters;
    });

    if (onFacetFiltersChange) {
      setActiveColumnFilters((old) => updateFilters(old));
    }
  }

  function handleTempFilterChange(columnId: string, values: string[]) {
    setTempColumnFilters((old) => {
      const existingFilter = old.some((filter) => filter.id === columnId);
      if (values.length === 0) {
        return old.filter((filter) => filter.id !== columnId);
      }
      if (existingFilter) {
        return old.map((filter) =>
          filter.id === columnId ? { ...filter, value: values } : filter,
        );
      }
      return [...old, { id: columnId, value: values }];
    });
  }

  function applyTempFilters() {
    setColumnFilters(tempColumnFilters);
    if (onFacetFiltersChange) {
      setActiveColumnFilters(tempColumnFilters);
    } else if (!isMobile) {
      saveToStorage('columnFilters', tempColumnFilters);
    }
    setDrawerOpen(false);
  }

  // Combine pinned top/bottom rows with the main row model and de-duplicate by row.id
  const displayRows = (() => {
    const combined = [
      ...table.getTopRows(),
      ...table.getRowModel().rows,
      ...table.getBottomRows(),
    ];
    const seen = new Set<string>();
    const deduped: Row<TData>[] = [];
    for (const r of combined) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        deduped.push(r);
      }
    }
    return deduped;
  })();

  const loadingOverlay = isLoading ? (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ) : null;

  let mobileCardList: ReactNode = null;
  if (isMobile && mobileCardRenderer) {
    if (onFetchNextPage) {
      const items = mobileInfiniteItems ?? [];
      const mobileEffectivelyLoading =
        isLoading || mobileIsLoading || isSearching;
      if (items.length === 0 && mobileEffectivelyLoading) {
        mobileCardList = (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        );
      } else if (items.length === 0) {
        mobileCardList = <MobileEmptyState />;
      } else {
        mobileCardList = (
          <>
            {items.map((item, index) => {
              const rawId = (item as Record<string, unknown>)?.id;
              const id =
                typeof rawId === 'string' || typeof rawId === 'number'
                  ? String(rawId)
                  : String(index);
              const handleViewDetails = onRowClick
                ? () => onRowClick(item)
                : undefined;
              return (
                <div key={id} className="p-0 gap-0">
                  {mobileCardRenderer(item, handleViewDetails)}
                </div>
              );
            })}

            {/* Intersection sentinel — triggers next page fetch when scrolled into view */}
            <div ref={handleMobileSentinelRef} className="h-4" />

            {mobileIsFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground pt-2">
              Showing {items.length} of{' '}
              {formatNumberThousandSeparatorWithoutDecimal(
                totalElements ?? items.length,
              )}{' '}
              items
            </div>
          </>
        );
      }
    } else {
      const filteredRows = table.getFilteredRowModel().rows;
      const paginatedRows = table.getPaginationRowModel().rows;
      const visibleRows = mobileUseTablePagination
        ? paginatedRows
        : filteredRows.slice(0, mobileVisibleCount);
      const hasMore =
        !mobileUseTablePagination && filteredRows.length > mobileVisibleCount;
      if (visibleRows.length === 0) {
        mobileCardList = <MobileEmptyState />;
      } else {
        mobileCardList = (
          <>
            {visibleRows.map((row) => {
              const handleViewDetails = onRowClick
                ? () => onRowClick(row.original)
                : undefined;
              return (
                <div key={row.id} className="p-0 gap-0">
                  {mobileCardRenderer(row.original, handleViewDetails)}
                </div>
              );
            })}

            {hasMore && <div ref={handleMobileSentinelRef} className="h-4" />}

            {mobileUseTablePagination ? (
              <div className="border-t border-[#E4E4E7] bg-white px-3 py-2 text-xs text-gray-500">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                    <div className="whitespace-nowrap">
                      {filteredRows.length} records
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Input
                        className="h-6 w-10 px-1 text-center text-xs"
                        inputMode="numeric"
                        value={mobilePageInput}
                        onChange={(event) =>
                          setMobilePageInput(event.target.value)
                        }
                        onBlur={handleMobilePageInputCommit}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleMobilePageInputCommit();
                          }
                        }}
                      />
                      <span>
                        Page {effectivePagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        type="button"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        type="button"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        type="button"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        type="button"
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronsRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground pt-2">
                Showing {visibleRows.length} of {filteredRows.length} items
              </div>
            )}
          </>
        );
      }
    }
  }

  return (
    <div className="space-y-6 md:space-y-4">
      {!simpleTable && (
        <div className="flex flex-col gap-2 relative">
          {/* Hidden measurement div — renders filters off-screen to measure their total width */}
          {!isMobile && facetedWithCounts.length > 0 && (
            <div
              ref={filterMeasureRef}
              className="absolute invisible pointer-events-none flex gap-2 flex-nowrap top-0 left-0"
              aria-hidden="true"
            >
              {facetedWithCounts.map((filter) => (
                <DataTableFacetedFilter
                  key={filter.column}
                  title={filter.title}
                  options={filter.options}
                  counts={filter.counts}
                  hideSearch={filter.hideSearch}
                  asyncSearch={filter.asyncSearch}
                  filterValues={
                    (columnFilters.find((f) => f.id === filter.column)
                      ?.value as string[]) || []
                  }
                  onFilterChange={() => { }}
                />
              ))}
              {columnFilters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-dashed"
                >
                  <X size={16} className="mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          )}
          {/* Row 1: Search bar + Show/Hide Columns */}
          <div ref={rowRef} className="flex flex-wrap items-center gap-2">
            <div ref={searchRef} className="flex-1 min-w-0 max-w-44">
              <InputIcon
                placeholder={searchPlaceHolder}
                type="search"
                value={table.getState().globalFilter ?? ''}
                onChange={(e) => table.setGlobalFilter(String(e.target.value))}
                startIcon={<Search size={18} />}
                className="w-full bg-white"
                endIcon={null}
              />
            </div>

            {/* Mobile filter drawer trigger */}
            {isMobile && facetedWithCounts.length > 0 && (
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="h-11 shrink-0">
                    <Filter size={16} className="mr-2" />
                    Filters
                    {columnFilters.length > 0 && (
                      <div className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground ml-2">
                        {columnFilters.length}
                      </div>
                    )}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle className="text-left font-medium text-[31.67px]">
                      Filters
                    </DrawerTitle>
                  </DrawerHeader>
                  <div
                    className="flex-1 overflow-y-auto px-4 py-3"
                    style={{ maxHeight: 'calc(95vh - 12rem)' }}
                  >
                    <Accordion type="multiple" className="w-full">
                      {facetedWithCounts.map((filter) => {
                        const currentFilterValues =
                          (tempColumnFilters.find((f) => f.id === filter.column)
                            ?.value as string[]) || [];

                        if (filter.asyncSearch) {
                          return (
                            <AccordionItem
                              key={filter.column}
                              value={filter.column}
                            >
                              <AccordionTrigger className="text-left">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <span className="text-lg">{filter.title}</span>
                                  {currentFilterValues.length > 0 && (
                                    <div className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                      {currentFilterValues.length}
                                    </div>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="pt-2">
                                  <DataTableFacetedFilter
                                    title={filter.title}
                                    options={filter.options}
                                    counts={filter.counts}
                                    hideSearch={filter.hideSearch}
                                    asyncSearch={filter.asyncSearch}
                                    filterValues={currentFilterValues}
                                    onFilterChange={(vals) =>
                                      handleTempFilterChange(filter.column, vals)
                                    }
                                    className="w-full"
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        }

                        return (
                          <AccordionItem
                            key={filter.column}
                            value={filter.column}
                          >
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span className="text-lg">{filter.title}</span>
                                {currentFilterValues.length > 0 && (
                                  <div className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {currentFilterValues.length}
                                  </div>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {[...filter.options]
                                  .sort((a, b) =>
                                    a.label
                                      .toLowerCase()
                                      .localeCompare(b.label.toLowerCase()),
                                  )
                                  .map((option) => {
                                    const isSelected =
                                      currentFilterValues.includes(
                                        option.value,
                                      );
                                    const displayLabel = option.label.includes(
                                      '_',
                                    )
                                      ? option.label.replaceAll('_', ' ')
                                      : option.label;

                                    return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={isSelected}
                                        className="flex w-full items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-left"
                                        onClick={() => {
                                          const newValues = isSelected
                                            ? currentFilterValues.filter(
                                              (v) => v !== option.value,
                                            )
                                            : [
                                              ...currentFilterValues,
                                              option.value,
                                            ];
                                          handleTempFilterChange(
                                            filter.column,
                                            newValues,
                                          );
                                        }}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div
                                            className={cn(
                                              'flex h-4 w-4 items-center justify-center border border-primary rounded-sm',
                                              isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'opacity-50',
                                            )}
                                          >
                                            {isSelected && (
                                              <Check className="h-3 w-3" />
                                            )}
                                          </div>
                                          <span className="text-sm">
                                            {displayLabel}
                                          </span>
                                        </div>
                                        {filter.counts?.[option.value] !=
                                          null && (
                                            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                                              {filter.counts[option.value]}
                                            </span>
                                          )}
                                      </button>
                                    );
                                  })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                  <DrawerFooter>
                    <Button variant="default" onClick={applyTempFilters}>
                      <Plus size={16} className="mr-2" />
                      Apply Filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearAllColumnFilters();
                        setDrawerOpen(false);
                      }}
                      className="w-full mb-4"
                    >
                      <X size={16} className="mr-2" />
                      Clear All Filters
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}

            {/* Inline filters — shown here when they fit in the gap */}
            {!isMobile && filtersInline && facetedWithCounts.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {facetedWithCounts.map((filter) => (
                  <DataTableFacetedFilter
                    key={filter.column}
                    title={filter.title}
                    options={filter.options}
                    counts={filter.counts}
                    hideSearch={filter.hideSearch}
                    asyncSearch={filter.asyncSearch}
                    filterValues={
                      (columnFilters.find((f) => f.id === filter.column)
                        ?.value as string[]) || []
                    }
                    onFilterChange={(vals) =>
                      handleFilterChange(filter.column, vals)
                    }
                  />
                ))}
                {columnFilters.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                    onClick={clearAllColumnFilters}
                  >
                    <X size={16} className="mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            )}

            {isShowHideColumns && !isMobile && (
              <div ref={showHideRef} className="ml-auto shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      Show/Hide Columns
                      <ChevronDown size={16} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {table
                      .getAllColumns()
                      .filter((col) => col.getCanHide())
                      .map((col) => {
                        const displayName =
                          (col.columnDef.meta as string) ||
                          col.id
                            .replaceAll('_', ' ')
                            .replace(/\b\w/g, (char) => char.toUpperCase());
                        return (
                          <DropdownMenuCheckboxItem
                            key={col.id}
                            checked={col.getIsVisible()}
                            onCheckedChange={(val) =>
                              col.toggleVisibility(!!val)
                            }
                          >
                            {displayName}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Row 2: Desktop filters — only when they don't fit inline on row 1 */}
          {!isMobile && !filtersInline && facetedWithCounts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {facetedWithCounts.map((filter) => (
                <DataTableFacetedFilter
                  key={filter.column}
                  title={filter.title}
                  options={filter.options}
                  counts={filter.counts}
                  hideSearch={filter.hideSearch}
                  asyncSearch={filter.asyncSearch}
                  filterValues={
                    (columnFilters.find((f) => f.id === filter.column)
                      ?.value as string[]) || []
                  }
                  onFilterChange={(vals) =>
                    handleFilterChange(filter.column, vals)
                  }
                />
              ))}
              {columnFilters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-dashed"
                  onClick={clearAllColumnFilters}
                >
                  <X size={16} className="mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Slot */}
      {enableRowSelection && bulkActionsSlot && (
        <div className="mb-3">{bulkActionsSlot}</div>
      )}

      {/* Mobile Card View */}
      {isMobile && mobileCardRenderer ? (
        <div className="relative space-y-3">
          {mobileCardList}
          {loadingOverlay}
        </div>
      ) : (
        <>
          {/* Table Container with External Scroll */}
          <div className="relative overflow-x-auto">
            <div
              className={cn(
                simpleTable ? '' : 'rounded-md border pt-2',
                'bg-white',
                'min-w-fit',
              )}
            >
              <Table className="w-full">
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow
                      key={hg.id}
                      className={cn(
                        simpleTable ? 'border-b border-border' : '',
                      )}
                    >
                      {hg.headers.map((header, headerIndex) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'text-muted-foreground whitespace-nowrap',
                            simpleTable && 'border-b-0 font-medium',
                            !simpleTable && 'first:pl-4 last:pr-4 py-2',
                            !simpleTable &&
                            headerIndex === 0 &&
                            'rounded-tl-md',
                            !simpleTable &&
                            headerIndex === hg.headers.length - 1 &&
                            'rounded-tr-md',
                            // Only force right-alignment on "Actions" columns (or non-simple tables where we expect an actions column)
                            ((header.column.id === 'actions' &&
                              headerIndex === hg.headers.length - 1) ||
                              (!simpleTable &&
                                headerIndex === hg.headers.length - 1)) &&
                            'w-auto text-right',
                          )}
                          style={
                            useColumnSizing
                              ? {
                                width: header.column.columnDef.size
                                  ? `${header.column.columnDef.size}px`
                                  : undefined,
                                minWidth: header.column.columnDef.size
                                  ? `${header.column.columnDef.size}px`
                                  : undefined,
                                maxWidth: header.column.columnDef.size
                                  ? `${header.column.columnDef.size}px`
                                  : undefined,
                              }
                              : undefined
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {displayRows.length > 0 ? (
                    displayRows.map((row) => {
                      // Check if this row is newly added (by checking ID against sessionStorage)
                      const isNewRecord = newRecordIdsSet.has(row.id);
                      const isSyncError = syncErrorRecordIdsSet.has(row.id);

                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className={cn(
                            simpleTable
                              ? 'border-b border-border hover:bg-transparent'
                              : 'bg-white hover:bg-gray-100',
                            !simpleTable && onRowClick && 'cursor-pointer',
                            row.getIsSelected() &&
                            'bg-[#EFF6FF]! hover:bg-blue-100!',
                            isNewRecord &&
                            !isSyncError &&
                            'bg-yellow-50! hover:bg-yellow-100! border-l-4 border-l-yellow-400 animate-in fade-in duration-500',
                            isSyncError &&
                            'bg-[#FEF2F2]! hover:bg-[#FEE2E2]! border-l-4 border-l-[#B11E1B] animate-in fade-in duration-500',
                          )}
                          onClick={(e) => {
                            // Prevent row click if clicking on buttons or interactive elements
                            const target = e.target as HTMLElement;
                            const isInteractiveElement = target.closest(
                              'button, a, [role="button"], [role="menuitem"], [data-radix-dropdown-menu-item], input, select, textarea',
                            );

                            if (allowClicksInsideModal) {
                              // Special mode: Allow clicks inside modals (for tables like UserAccessTab)
                              if (!isInteractiveElement && onRowClick) {
                                onRowClick(row.original);
                              }
                            } else {
                              // Default mode: Block clicks if modal is open (safe default)
                              const hasOpenModal = document.querySelector(
                                '[data-state="open"][role="dialog"], [data-radix-dialog-overlay], [data-slot="dialog-overlay"]',
                              );
                              const isInsideModal = target.closest(
                                '[role="dialog"], [data-radix-dialog-content], [data-slot="dialog-content"]',
                              );

                              if (
                                !isInteractiveElement &&
                                !hasOpenModal &&
                                !isInsideModal &&
                                onRowClick
                              ) {
                                onRowClick(row.original);
                              }
                            }
                          }}
                        >
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                simpleTable && 'border-b-0',
                                'whitespace-nowrap',
                                !simpleTable && 'first:pl-4 last:pr-4 py-2',
                                ((cell.column.id === 'actions' &&
                                  cellIndex ===
                                  row.getVisibleCells().length - 1) ||
                                  (!simpleTable &&
                                    cellIndex ===
                                    row.getVisibleCells().length - 1)) &&
                                'w-auto text-right',
                              )}
                              style={
                                useColumnSizing
                                  ? {
                                    width: cell.column.columnDef.size
                                      ? `${cell.column.columnDef.size}px`
                                      : undefined,
                                    minWidth: cell.column.columnDef.size
                                      ? `${cell.column.columnDef.size}px`
                                      : undefined,
                                    maxWidth: cell.column.columnDef.size
                                      ? `${cell.column.columnDef.size}px`
                                      : undefined,
                                  }
                                  : undefined
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow
                      className={cn(simpleTable && 'border-b-0', 'bg-white')}
                    >
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className={cn('border-b-0 p-0')}
                      >
                        <div className="relative bg-purple-50 border-2 border-dashed border-purple-200 p-12 text-center w-full h-full">
                          {/* Empty state icon */}
                          <div className="flex justify-center mb-4">
                            <Image
                              src="/empty-table.svg"
                              alt="No data available"
                              width={256}
                              height={256}
                              className="w-32 h-auto"
                            />
                          </div>

                          {/* Empty state text */}
                          <h3 className="text-gray-700 font-medium mb-1">
                            No items are available
                          </h3>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {loadingOverlay}
          </div>

          {/* Pagination Controls */}
          {enablePagination && (
            <TablePaginationFooter
              totalElements={
                totalElements ?? table.getFilteredRowModel().rows.length
              }
              pageIndex={effectivePagination.pageIndex}
              pageCount={table.getPageCount()}
              pageSize={paginationSize}
              pageSizeOptions={paginationSizeSelect}
              pageSizeTriggerContent={pageSizeTriggerContent}
              onPageSizeChange={handlePaginationSizeChange}
              onFirstPage={() => table.setPageIndex(0)}
              onPreviousPage={() => table.previousPage()}
              onNextPage={() => table.nextPage()}
              onLastPage={() => table.setPageIndex(table.getPageCount() - 1)}
              canPreviousPage={table.getCanPreviousPage()}
              canNextPage={table.getCanNextPage()}
              hideEdgeButtonsOnMobile
              showPageNav={table.getPageCount() > 1}
            />
          )}
        </>
      )}
    </div>
  );
}
