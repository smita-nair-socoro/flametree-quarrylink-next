'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  JobItemsInfiniteQueryOptions,
  getJobLineItemsFromInfinitePages,
} from '@/lib/api/job';

type UseJobLineItemsForFormOptions = {
  jobId: number;
  /** When false, nothing is fetched (e.g. edit mode where the product is locked). */
  enabled?: boolean;
};

/**
 * Infinite-loading line items of a job for form selects. The job-items
 * endpoint has no search param, so filtering stays client-side in FormSelect.
 * Returns `lineItemSelectProps` ready to spread onto a FormSelect (options
 * are left to the caller, which may need to build them from another source,
 * e.g. a docket's embedded jobItem in edit mode).
 */
export function useJobLineItemsForForm({
  jobId,
  enabled = true,
}: UseJobLineItemsForFormOptions) {
  const [selectOpen, setSelectOpen] = React.useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...JobItemsInfiniteQueryOptions(jobId, { pageSize: 25 }),
      enabled: enabled && !!jobId,
    });

  // Every job-items page repeats the job-level fields; use the first page.
  const jobDetails = data?.pages[0];

  const jobLineItems = React.useMemo(
    () => getJobLineItemsFromInfinitePages(data?.pages),
    [data?.pages],
  );

  const onOptionsListScrollEnd = React.useCallback(() => {
    if (!selectOpen || !hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [selectOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const lineItemSelectProps = React.useMemo(
    () => ({
      onDropdownOpenChange: setSelectOpen,
      onOptionsListScrollEnd,
      hasMoreOptions: enabled && !!hasNextPage,
      isLoadingMoreOptions: isFetchingNextPage,
    }),
    [onOptionsListScrollEnd, enabled, hasNextPage, isFetchingNextPage],
  );

  return { jobDetails, jobLineItems, lineItemSelectProps };
}
