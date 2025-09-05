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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from './dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { DataTableFacetedFilter } from '../table-faceted-filter';
import { useFacets } from '@/hooks/useFacets';
import { InputIcon } from './input-icon';
import { Separator } from './separator';
import { cn, getLocalStorage, setLocalStorage } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetDefination?: FacetDefinition[];
  searchPlaceHolder?: string;
  simpleTable?: boolean;
  tableId?: string; // Unique identifier for localStorage
}

export type FacetDefinition = {
  column: string;
  title?: string;
  icon?: LucideIcon;
};

const paginationSizeSelect = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
];

// Default state values
const defaultPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};
const defaultSorting: SortingState = [];
const defaultColumnFilters: ColumnFiltersState = [];
const defaultGlobalFilter = '';
const defaultColumnVisibility: VisibilityState = {};
const defaultPaginationSize = '10';

export function DataTableClient<TData, TValue>({
  columns,
  data = [],
  facetDefination = [],
  searchPlaceHolder = 'Filter..',
  simpleTable = false,
  tableId = 'default-table', // Default tableId if not provided
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();

  const getStorageKey = useCallback(
    (key: string) => `${tableId}_${key}`,
    [tableId]
  );

  const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
      const stored = getLocalStorage(getStorageKey(key), fallback);
      return stored;
    } catch {
      return fallback;
    }
  };

  const saveToStorage = (key: string, value: unknown) => {
    try {
      setLocalStorage(getStorageKey(key), value);
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  };

  // Initialize state with localStorage values or defaults
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (isMobile) return defaultPagination;
    return loadFromStorage('pagination', defaultPagination);
  });

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (isMobile) return defaultSorting;
    return loadFromStorage('sorting', defaultSorting);
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (isMobile) return defaultColumnFilters;
    return loadFromStorage('columnFilters', defaultColumnFilters);
  });

  const [globalFilter, setGlobalFilter] = useState<string>(() => {
    if (isMobile) return defaultGlobalFilter;
    return loadFromStorage('globalFilter', defaultGlobalFilter);
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (isMobile) return defaultColumnVisibility;
      return loadFromStorage('columnVisibility', defaultColumnVisibility);
    }
  );

  const [paginationSize, setPaginationSize] = useState(() => {
    if (isMobile) return defaultPaginationSize;
    return loadFromStorage('paginationSize', defaultPaginationSize);
  });

  // Clear localStorage when switching to mobile or reset everything for mobile
  useEffect(() => {
    if (isMobile) {
      // Clear all localStorage for this table when on mobile
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
          localStorage.removeItem(getStorageKey(key));
        } catch (error) {
          console.warn(`Failed to remove ${key} from localStorage:`, error);
        }
      });

      // Reset all state to defaults
      setPagination(defaultPagination);
      setSorting(defaultSorting);
      setColumnFilters(defaultColumnFilters);
      setGlobalFilter(defaultGlobalFilter);
      setColumnVisibility(defaultColumnVisibility);
      setPaginationSize(defaultPaginationSize);
    }
  }, [isMobile, tableId, getStorageKey]);

  // Enhanced state setters that save to localStorage (only when not mobile)
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      if (!isMobile) {
        saveToStorage('pagination', newValue);
      }
      return newValue;
    });
  };

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      if (!isMobile) {
        saveToStorage('sorting', newValue);
      }
      return newValue;
    });
  };

  const handleColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      if (!isMobile) {
        saveToStorage('columnFilters', newValue);
      }
      return newValue;
    });
  };

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    setGlobalFilter((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      if (!isMobile) {
        saveToStorage('globalFilter', newValue);
      }
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
    setPaginationSize(value);
    if (!isMobile) {
      saveToStorage('paginationSize', value);
    }
    table.setPageSize(Number(value));
  };

  const pageSizeTriggerContent = useMemo(() => {
    const found = paginationSizeSelect.find((f) => f.value === paginationSize);
    return found?.label ?? 'Select page size';
  }, [paginationSize]);

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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),

    globalFilterFn: 'auto',

    filterFns: { arrIncludesSome },
    defaultColumn: { filterFn: arrIncludesSome },

    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,

    state: {
      sorting,
      pagination,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
  });

  const facetedWithCounts = useFacets(table, facetDefination);

  function handleFilterChange(columnId: string, values: string[]) {
    setColumnFilters((old) => {
      const others = old.filter((f) => f.id !== columnId);
      const newFilters = values.length
        ? [...others, { id: columnId, value: values }]
        : others;

      if (!isMobile) {
        saveToStorage('columnFilters', newFilters);
      }
      return newFilters;
    });
  }

  return (
    <div className="space-y-4">
      {!simpleTable && (
        <div className="space-y-3">
          {/* Search Bar - Full width on all screens */}
          <div className="w-full">
            <InputIcon
              placeholder={searchPlaceHolder}
              type="search"
              value={table.getState().globalFilter ?? ''}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
              startIcon={<Search size={18} />}
              className="h-8 w-full md:w-[350px] lg:w-[450px]"
            />
          </div>

          {/* Controls Row - Hidden on mobile, responsive layout on larger screens */}
          <div className="hidden md:flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Faceted Filters - Row on larger screens */}
            <div className="flex flex-wrap gap-2">
              {facetedWithCounts.map((filter) => (
                <DataTableFacetedFilter
                  key={filter.column}
                  title={filter.title}
                  options={filter.options}
                  counts={filter.counts}
                  filterValues={
                    (columnFilters.find((f) => f.id === filter.column)
                      ?.value as string[]) || []
                  }
                  onFilterChange={(vals) =>
                    handleFilterChange(filter.column, vals)
                  }
                />
              ))}
            </div>

            {/* Show/Hide Columns - Hidden on mobile */}
            <div className="flex-shrink-0">
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
                      // Use meta property if available, otherwise format the column ID
                      const displayName =
                        (col.columnDef.meta as string) ||
                        col.id
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (char) => char.toUpperCase());

                      return (
                        <DropdownMenuCheckboxItem
                          key={col.id}
                          checked={col.getIsVisible()}
                          onCheckedChange={(val) => col.toggleVisibility(!!val)}
                        >
                          {displayName}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Table Container with External Scroll */}
      <div className="overflow-x-auto">
        <div
          className={cn(
            simpleTable ? '' : 'rounded-md border p-2',
            'bg-gray-50 dark:bg-gray-900',
            'min-w-fit'
          )}
        >
          <Table className="bg-gray-50 dark:bg-gray-900">
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className={cn(simpleTable && 'border-b-0')}
                >
                  {hg.headers.map((header, headerIndex) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-muted-foreground whitespace-nowrap',
                        simpleTable && 'border-b-0 font-medium',
                        !simpleTable && headerIndex === 0 && 'rounded-tl-md',
                        !simpleTable &&
                          headerIndex === hg.headers.length - 1 &&
                          'rounded-tr-md'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      simpleTable && 'border-r hover:bg-transparent',
                      !simpleTable &&
                        'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          simpleTable && 'border-b-0',
                          'whitespace-nowrap'
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow
                  className={cn(
                    simpleTable && 'border-b-0',
                    'bg-gray-50 dark:bg-gray-900'
                  )}
                >
                  <TableCell
                    colSpan={columns.length}
                    className={cn('border-b-0 p-0')}
                  >
                    <div className="relative bg-purple-50 dark:bg-purple-900/20 border-2 border-dashed border-purple-200 dark:border-purple-700 p-12 text-center mt-2">
                      {/* Empty state icon */}
                      <div className="flex justify-center mb-4">
                        <Image
                          src="/empty-table.svg"
                          alt="No data available"
                          width={128}
                          height={128}
                          className="w-32 h-auto"
                        />
                      </div>

                      {/* Empty state text */}
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        No items are available
                      </h3>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!simpleTable && (
        <div className="overflow-x-auto">
          <div className="min-w-full py-2">
            <div className="flex flex-col items-center justify-between sm:flex-row sm:space-x-6">
              <div className="mb-4 flex h-5 items-center space-x-2 sm:mb-0">
                <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                  Total Records:
                  <span className="text-accent-foreground ml-2">
                    {data.length}
                  </span>
                </p>

                <Separator
                  orientation="vertical"
                  className="text-accent-foreground"
                />

                <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                  Rows per page
                </p>
                <Select
                  value={paginationSize}
                  onValueChange={handlePaginationSizeChange}
                >
                  <SelectTrigger className="h-8 w-[80px]">
                    <SelectValue placeholder={pageSizeTriggerContent} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {paginationSizeSelect.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Page nav */}
              <div className="flex items-center space-x-4">
                <div className="flex min-w-[100px] items-center justify-center whitespace-nowrap text-sm font-medium">
                  Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">First page</span>
                    <ChevronsLeft size={15} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeft size={15} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Next page</span>
                    <ChevronRight size={15} />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Last page</span>
                    <ChevronsRight size={15} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
