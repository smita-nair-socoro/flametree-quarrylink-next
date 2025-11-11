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
  Plus,
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
import { Filter, X, Check } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetDefination?: FacetDefinition[];
  searchPlaceHolder?: string;
  simpleTable?: boolean;
  tableId?: string; // Unique identifier for localStorage
  useColumnSizing?: boolean; // Optional prop to enable column sizing
  onRowClick?: (row: TData) => void; // Optional row click handler
  isShowHideColumns?: boolean;
  enableRowSelection?: boolean; // Enable row selection with checkboxes
  onRowSelectionChange?: (selectedRows: TData[]) => void; // Callback when selection changes
  rowSelectionFilter?: (row: TData) => boolean; // Filter which rows can be selected
  bulkActionsSlot?: React.ReactNode; // Slot for bulk action buttons
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
const defaultRowSelection: RowSelectionState = {};

export function DataTableClient<TData, TValue>({
  columns,
  data = [],
  facetDefination = [],
  searchPlaceHolder = 'Filter..',
  simpleTable = false,
  tableId = 'default-table', // Default tableId if not provided
  useColumnSizing = false, // Default to false to maintain existing behavior
  onRowClick,
  isShowHideColumns = true,
  enableRowSelection = false,
  onRowSelectionChange,
  rowSelectionFilter,
  bulkActionsSlot,
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tempColumnFilters, setTempColumnFilters] =
    useState<ColumnFiltersState>([]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    defaultRowSelection
  );

  // Sync temp filters when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setTempColumnFilters(columnFilters);
    }
  }, [drawerOpen, columnFilters]);

  // Notify parent of selection changes
  useEffect(() => {
    if (enableRowSelection && onRowSelectionChange) {
      const selectedRowIds = Object.keys(rowSelection).filter(
        (key) => rowSelection[key]
      );
      const selectedRows = selectedRowIds
        .map((id) => {
          const index = parseInt(id);
          return data[index];
        })
        .filter(Boolean);
      onRowSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={!row.getCanSelect()}
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
    data,
    columns: tableColumns,
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
    onRowSelectionChange: setRowSelection,

    enableRowSelection: enableRowSelection
      ? (row: Row<TData>) => {
          if (!rowSelectionFilter) return true;
          return rowSelectionFilter(row.original);
        }
      : undefined,

    state: {
      sorting,
      pagination,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
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

  function handleTempFilterChange(columnId: string, values: string[]) {
    setTempColumnFilters((old) => {
      const existingFilter = old.find((filter) => filter.id === columnId);
      if (values.length === 0) {
        return old.filter((filter) => filter.id !== columnId);
      }
      if (existingFilter) {
        return old.map((filter) =>
          filter.id === columnId ? { ...filter, value: values } : filter
        );
      }
      return [...old, { id: columnId, value: values }];
    });
  }

  function applyTempFilters() {
    setColumnFilters(tempColumnFilters);
    if (!isMobile) {
      saveToStorage('columnFilters', tempColumnFilters);
    }
    setDrawerOpen(false);
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
              className="h-8 w-full md:w-[350px] lg:w-[450px] bg-white"
            />
          </div>

          {/* Mobile Filter Button - Only visible on mobile */}
          {facetedWithCounts.length > 0 && (
            <div className="md:hidden flex justify-center">
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-center"
                  >
                    <Filter size={16} className="mr-2" />
                    Filters
                    {columnFilters.length > 0 && (
                      <>
                        <div className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {columnFilters.length}
                        </div>
                      </>
                    )}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle className="text-left font-medium text-[31.67px] ">
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
                                {filter.options.map((option) => {
                                  const isSelected =
                                    currentFilterValues.includes(option.value);
                                  const displayLabel = option.label.includes(
                                    '_'
                                  )
                                    ? option.label.replace(/_/g, ' ')
                                    : option.label;

                                  return (
                                    <div
                                      key={option.value}
                                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => {
                                        const newValues = isSelected
                                          ? currentFilterValues.filter(
                                              (v) => v !== option.value
                                            )
                                          : [
                                              ...currentFilterValues,
                                              option.value,
                                            ];
                                        handleTempFilterChange(
                                          filter.column,
                                          newValues
                                        );
                                      }}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div
                                          className={cn(
                                            'flex h-4 w-4 items-center justify-center border border-primary rounded-sm',
                                            isSelected
                                              ? 'bg-primary text-primary-foreground'
                                              : 'opacity-50'
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
                                      {filter.counts &&
                                        filter.counts[option.value] != null && (
                                          <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                                            {filter.counts[option.value]}
                                          </span>
                                        )}
                                    </div>
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
                        setColumnFilters([]);
                        setTempColumnFilters([]);
                        if (!isMobile) {
                          saveToStorage('columnFilters', []);
                        }
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
            </div>
          )}

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
            {isShowHideColumns && (
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
        </div>
      )}

      {/* Bulk Actions Slot */}
      {enableRowSelection && bulkActionsSlot && (
        <div className="mb-3">{bulkActionsSlot}</div>
      )}

      {/* Table Container with External Scroll */}
      <div className="overflow-x-auto">
        <div
          className={cn(
            simpleTable ? '' : 'rounded-md border p-2',
            'bg-white',
            'min-w-fit'
          )}
        >
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className={cn(simpleTable ? 'border-b border-border' : '')}
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
                          'rounded-tr-md',
                        headerIndex === hg.headers.length - 1 &&
                          'w-auto text-right'
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
                      simpleTable &&
                        'border-b border-border hover:bg-transparent',
                      !simpleTable && 'bg-white hover:bg-gray-100 ',
                      onRowClick && !simpleTable && 'cursor-pointer'
                    )}
                    onClick={(e) => {
                      // Prevent row click if clicking on buttons or interactive elements
                      const target = e.target as HTMLElement;
                      const isInteractiveElement = target.closest(
                        'button, a, [role="button"], [role="menuitem"], [data-radix-dropdown-menu-item], input, select, textarea'
                      );

                      // Check if any modal/dialog is currently open
                      const hasOpenModal = document.querySelector(
                        '[data-state="open"][role="dialog"], [data-radix-dialog-overlay], [data-slot="dialog-overlay"]'
                      );

                      // Also check if the click is happening inside a modal/dialog content
                      const isInsideModal = target.closest(
                        '[role="dialog"], [data-radix-dialog-content], [data-slot="dialog-content"]'
                      );

                      if (
                        !isInteractiveElement &&
                        !hasOpenModal &&
                        !isInsideModal &&
                        onRowClick
                      ) {
                        onRowClick(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          simpleTable && 'border-b-0',
                          'whitespace-nowrap',
                          cellIndex === row.getVisibleCells().length - 1 &&
                            'w-auto text-right'
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
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow
                  className={cn(simpleTable && 'border-b-0', 'bg-white')}
                >
                  <TableCell
                    colSpan={columns.length}
                    className={cn('border-b-0 p-0')}
                  >
                    <div className="relative bg-purple-50 border-2 border-dashed border-purple-200 p-12 text-center mt-2">
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
