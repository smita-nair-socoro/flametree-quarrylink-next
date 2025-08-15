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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetDefination?: FacetDefinition[];
  searchPlaceHolder?: string;
  simpleTable?: boolean;
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

export function DataTableClient<TData, TValue>({
  columns,
  data = [],
  facetDefination = [],
  searchPlaceHolder = 'Filter..',
  simpleTable = false,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<GlobalFilterTableState>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [paginationSize, setPaginationSize] = useState('10');

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

  const facetedWithCounts = useFacets(table, facetDefination);

  function handleFilterChange(columnId: string, values: string[]) {
    setColumnFilters((old) => {
      const others = old.filter((f) => f.id !== columnId);
      return values.length
        ? [...others, { id: columnId, value: values }]
        : others;
    });
  }

  return (
    <div className="space-y-4">
      {!simpleTable && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-grow md:flex-grow-0">
            <InputIcon
              placeholder={searchPlaceHolder}
              type="search"
              value={table.getState().globalFilter ?? ''}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
              startIcon={<Search size={18} />}
              className="h-8 w-full md:w-[250px] lg:w-[350px]"
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

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Show/Hide Columns
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/** Table Wrapper **/}
      <div className="rounded-md border p-2">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {table.getRowModel().rows.length > 0 ? (
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
      </div>

      {/** Pagination Controls **/}
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
                  onValueChange={(val) => {
                    setPaginationSize(val);
                    table.setPageSize(Number(val));
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

              {/** Page nav **/}
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
