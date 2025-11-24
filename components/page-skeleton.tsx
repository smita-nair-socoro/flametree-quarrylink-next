import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/table-skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface PageSkeletonProps {
  showStats?: boolean;
  statsCount?: number;
  showFilters?: boolean;
  filterCount?: number;
  tableRows?: number;
  tableColumns?: number;
}

/**
 * Full page skeleton loader for data pages
 * Includes header, optional stats cards, optional filters, and table skeleton
 */
export function PageSkeleton({
  showStats = false,
  statsCount = 4,
  showFilters = false,
  filterCount = 3,
  tableRows = 10,
  tableColumns = 6,
}: PageSkeletonProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>

      {/* Stats cards skeleton */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: statsCount }).map((_, index) => (
            <Card key={index} className="p-5">
              <CardContent className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-9 w-[100px] mt-4" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters skeleton */}
      {showFilters && (
        <div className="flex space-x-4">
          {Array.from({ length: filterCount }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[150px]" />
          ))}
        </div>
      )}

      {/* Table skeleton */}
      <TableSkeleton rows={tableRows} columns={tableColumns} />
    </div>
  );
}

