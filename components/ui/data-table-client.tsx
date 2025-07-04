'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  GlobalFilterTableState,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
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
import { useMemo, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  LucideIcon,
} from 'lucide-react';
import { Input } from './input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from './dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { DataTableFacetedFilter } from '../table-faceted-filter';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetedFilters?: FacetedFilterConfig[];
}

export type FilterOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

export type FacetedFilterConfig = {
  column: string;
  title: string;
  options: FilterOption[];
};

export function DataTableClient<TData, TValue>({
  columns,
  data,
  facetedFilters: propsFacets = [],
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<GlobalFilterTableState>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // const filterValuesMap = useState<Record<string, string[]>>({});
  //
  // const isMobile = useIsMobile();

  const paginationSizeSelect = [
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
    { value: '200', label: '200' },
  ];

  const [paginationSize, setPaginationSize] = useState('10');

  const pageSizeTriggerContent = useMemo(() => {
    const found = paginationSizeSelect.find((f) => f.value === paginationSize);
    return found?.label ?? 'Select page size';
  }, [paginationSize, paginationSizeSelect]);

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

    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      pagination,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
  });

  function handleFilterChange(columnId: string, values: string[]) {
    setColumnFilters((old) => {
      const others = old.filter((f) => f.id !== columnId);
      return values.length
        ? [...others, { id: columnId, value: values }]
        : others;
    });
  }

  const facetedWithCounts = useMemo(() => {
    const rows = table.getPreFilteredRowModel().rows;

    return propsFacets.map((cfg) => {
      const counts = rows.reduce<Record<string, number>>((acc, row) => {
        const val = row.getValue<string>(cfg.column);
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

      return {
        ...cfg,
        counts,
      };
    });
  }, [table, propsFacets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-grow md:flex-grow-0">
          <Input
            placeholder="Filter…"
            type="search"
            value=""
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className="h-8 w-full md:w-[150px] lg:w-[250px]"
          />

          <div className="hidden md:flex space-x-2">
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
        </div>

        {/* “View” dropdown to toggle column visibility */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border p-2">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full py-2">
            <div className="flex flex-col items-center justify-between sm:flex-row sm:space-x-6">
              {/* Rows per page */}
              <div className="mb-4 flex items-center space-x-2 sm:mb-0">
                <p className="whitespace-nowrap text-sm font-medium">
                  Rows per page
                </p>
                <Select
                  value={paginationSize}
                  onValueChange={(value) => {
                    setPaginationSize(value);
                    table.setPageSize(Number(value));
                  }}
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

              {/* Page indicator & nav buttons */}
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
      </div>
    </div>
  );
}
