'use client';

import type { ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Separator } from './separator';
import { formatNumberThousandSeparatorWithoutDecimal } from '@/lib/utils/number';

export interface TablePaginationFooterProps {
  totalElements: number;
  pageIndex: number;
  pageCount: number;
  pageSize: string;
  pageSizeOptions: { value: string; label: string }[];
  pageSizeTriggerContent?: ReactNode;
  onPageSizeChange: (value: string) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  /** Collapse the first/last-page buttons on small screens (data-table-client default). */
  hideEdgeButtonsOnMobile?: boolean;
  /** Hide the page nav entirely, e.g. when there's only one page. */
  showPageNav?: boolean;
}

export function TablePaginationFooter({
  totalElements,
  pageIndex,
  pageCount,
  pageSize,
  pageSizeOptions,
  pageSizeTriggerContent,
  onPageSizeChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  canPreviousPage,
  canNextPage,
  hideEdgeButtonsOnMobile = false,
  showPageNav = true,
}: Readonly<TablePaginationFooterProps>) {
  const edgeButtonClassName = hideEdgeButtonsOnMobile
    ? 'hidden h-8 w-8 p-0 lg:flex'
    : 'h-8 w-8 p-0';

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full py-2">
        <div className="flex flex-col items-center justify-between sm:flex-row sm:space-x-6">
          <div className="mb-4 flex h-5 items-center space-x-2 sm:mb-0">
            <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              Total Records:{' '}
              <span className="text-accent-foreground ml-2">
                {formatNumberThousandSeparatorWithoutDecimal(totalElements)}
              </span>
            </p>

            <Separator
              orientation="vertical"
              className="text-accent-foreground"
            />

            <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              Rows per page
            </p>
            <Select value={pageSize} onValueChange={onPageSizeChange}>
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder={pageSizeTriggerContent} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {showPageNav && (
            <div className="flex items-center space-x-4">
              <div className="flex min-w-[100px] items-center justify-center whitespace-nowrap text-sm font-medium">
                Page {pageIndex + 1} of {pageCount}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className={edgeButtonClassName}
                  onClick={onFirstPage}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">First page</span>
                  <ChevronsLeft size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onPreviousPage}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeft size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onNextPage}
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRight size={15} />
                </Button>
                <Button
                  variant="outline"
                  className={edgeButtonClassName}
                  onClick={onLastPage}
                  disabled={!canNextPage}
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
  );
}
