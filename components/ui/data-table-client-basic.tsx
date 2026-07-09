'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
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
import { useCallback, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { Separator } from './separator';
import { cn, getSessionStorage, setSessionStorage } from '@/lib/utils';
import Image from 'next/image';
import { formatNumberThousandSeparatorWithoutDecimal } from '@/lib/utils/number';

// A DataTableClient variant without the search bar and facet filters.
// Keeps the full table behavior: clickable rows, sorting, pagination,
// column sizing, empty state, and loading overlay.
interface DataTableClientBasicProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableId?: string; // Unique identifier for sessionStorage
  useColumnSizing?: boolean; // Optional prop to enable column sizing
  onRowClick?: (row: TData) => void; // Optional row click handler
  allowClicksInsideModal?: boolean; // Allow row clicks when table is inside a modal/dialog (default: false)
  defaultSorting?: SortingState; // Default sorting configuration
  isLoading?: boolean; // Show loading overlay while data is fetching
}

const paginationSizeSelect = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

const defaultPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};
const defaultPaginationSize = '10';

export function DataTableClientBasic<TData, TValue>({
  columns,
  data = [],
  tableId = 'default-table-basic',
  useColumnSizing = false,
  onRowClick,
  allowClicksInsideModal = false,
  defaultSorting,
  isLoading = false,
}: DataTableClientBasicProps<TData, TValue>) {
  const getStorageKey = useCallback(
    (key: string) => `${tableId}_${key}`,
    [tableId],
  );

  const defaultSortingState = useMemo(
    () => defaultSorting ?? [],
    [defaultSorting],
  );

  const [pagination, setPagination] =
    useState<PaginationState>(defaultPagination);

  const [sorting, setSorting] = useState<SortingState>(() => {
    try {
      return getSessionStorage(getStorageKey('sorting'), defaultSortingState);
    } catch {
      return defaultSortingState;
    }
  });

  const [paginationSize, setPaginationSize] = useState(defaultPaginationSize);

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((old) => {
      const newValue = typeof updater === 'function' ? updater(old) : updater;
      try {
        setSessionStorage(getStorageKey('sorting'), newValue);
      } catch (error) {
        console.warn('Failed to save sorting to sessionStorage:', error);
      }
      return newValue;
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (originalRow, index) => {
      const r = originalRow as TData & {
        id?: number | string | null;
        sub?: string;
      };
      if (r?.id != null && r.id !== 0) return String(r.id);
      if (typeof r?.sub === 'string' && r.sub.length > 0) return r.sub;
      return String(index);
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  const pageSizeTriggerContent = useMemo(() => {
    const found = paginationSizeSelect.find((f) => f.value === paginationSize);
    return found?.label ?? 'Select page size';
  }, [paginationSize]);

  const handlePaginationSizeChange = (value: string) => {
    setPaginationSize(value);
    table.setPageSize(Number(value));
  };

  const loadingOverlay = isLoading ? (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ) : null;

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-6 md:space-y-4">
      {/* Table Container with External Scroll */}
      <div className="relative overflow-x-auto">
        <div className="rounded-md border pt-2 bg-white min-w-fit">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header, headerIndex) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-muted-foreground whitespace-nowrap',
                        'first:pl-4 last:pr-4 py-2',
                        headerIndex === 0 && 'rounded-tl-md',
                        headerIndex === hg.headers.length - 1 &&
                        'rounded-tr-md w-auto text-right',
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
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'bg-white hover:bg-gray-100',
                      onRowClick && 'cursor-pointer',
                    )}
                    onClick={(e) => {
                      // Prevent row click if clicking on buttons or interactive elements
                      const target = e.target as HTMLElement;
                      const isInteractiveElement = target.closest(
                        'button, a, [role="button"], [role="menuitem"], [data-radix-dropdown-menu-item], input, select, textarea',
                      );

                      if (allowClicksInsideModal) {
                        // Special mode: Allow clicks inside modals
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
                          'whitespace-nowrap',
                          'first:pl-4 last:pr-4 py-2',
                          cellIndex === row.getVisibleCells().length - 1 &&
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
                ))
              ) : (
                <TableRow className="bg-white">
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="border-b-0 p-0"
                  >
                    <div className="relative bg-purple-50 border-2 border-dashed border-purple-200 p-12 text-center w-full h-full">
                      <div className="flex justify-center mb-4">
                        <Image
                          src="/empty-table.svg"
                          alt="No data available"
                          width={256}
                          height={256}
                          className="w-32 h-auto"
                        />
                      </div>
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
      <div className="overflow-x-auto">
        <div className="min-w-full py-2">
          <div className="flex flex-col items-center justify-between sm:flex-row sm:space-x-6">
            <div className="mb-4 flex h-5 items-center space-x-2 sm:mb-0">
              <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                Total Records:
                <span className="text-accent-foreground ml-2">
                  {formatNumberThousandSeparatorWithoutDecimal(
                    table.getFilteredRowModel().rows.length,
                  )}
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
            {table.getPageCount() > 1 && (
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
                    onClick={() =>
                      table.setPageIndex(table.getPageCount() - 1)
                    }
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Last page</span>
                    <ChevronsRight size={15} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
