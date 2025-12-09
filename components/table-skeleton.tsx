import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showToolbar?: boolean;
  showPagination?: boolean;
}

/**
 * Skeleton loader for data tables
 * Mimics the structure of DataTableClient for better visual continuity
 */
export function TableSkeleton({
  rows = 10,
  columns = 6,
  showHeader = true,
  showToolbar = true,
  showPagination = true,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton (search + filters) */}
      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-10 w-full max-w-sm" /> {/* Search bar */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" /> {/* Filter button */}
            <Skeleton className="h-10 w-24" /> {/* Columns button */}
          </div>
        </div>
      )}

      {/* Table container */}
      <div className="rounded-md border">
        <div className="space-y-0">
          {/* Table header */}
          {showHeader && (
            <div className="flex items-center border-b bg-muted/50 p-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1 mx-2" />
              ))}
            </div>
          )}

          {/* Table rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center border-b last:border-0 p-4 hover:bg-muted/50"
            >
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1 mx-2" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-8 w-40" /> {/* Rows per page */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" /> {/* Page indicator */}
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8" /> {/* First page */}
              <Skeleton className="h-8 w-8" /> {/* Previous */}
              <Skeleton className="h-8 w-8" /> {/* Next */}
              <Skeleton className="h-8 w-8" /> {/* Last page */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
