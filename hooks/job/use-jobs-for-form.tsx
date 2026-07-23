'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  JobsInfiniteListQueryOptions,
  getJobsFromInfinitePages,
} from '@/lib/api/job';
import { useDebounce } from '@/hooks/use-debounce';
import { sortByLabel } from '@/lib/utils/sort-options';
import { FormSelectOption } from '@/components/ui/form-select';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { BADGE_COLORS } from '@/lib/utils';

type UseJobsForFormOptions = {
  /** When false, nothing is fetched (e.g. edit mode where the job is locked). */
  enabled?: boolean;
  /** Currently selected job id, kept visible even when not in loaded pages. */
  selectedJobId?: number;
  /**
   * Fallback source for the selected job's option label when the job isn't in
   * the loaded pages (e.g. from job details or the docket's embedded job).
   */
  fallbackJob?: { id: number; jobNumber?: string; projectName?: string } | null;
};

/**
 * Infinite-loading jobs list for form selects, with debounced server-side
 * search — same pattern as useCustomersForForm. Returns `jobSelectProps`
 * ready to spread onto a FormSelect.
 */
export function useJobsForForm({
  enabled = true,
  selectedJobId,
  fallbackJob,
}: UseJobsForFormOptions = {}) {
  const [selectOpen, setSelectOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  React.useEffect(() => {
    if (!selectOpen) {
      setSearch('');
    }
  }, [selectOpen]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...JobsInfiniteListQueryOptions({
        pageSize: 25,
        search: debouncedSearch.trim() || undefined,
      }),
      enabled,
    });

  const jobs = React.useMemo(
    () => getJobsFromInfinitePages(data?.pages),
    [data?.pages],
  );

  const jobOptions = React.useMemo(() => {
    const options: FormSelectOption[] = jobs.map((job) => {
      const isPaused = job.jobStatus === JOB_STATUS.PAUSED;
      return {
        label: `${job.jobNumber} - ${job.projectName}`,
        value: job.id,
        disabled: isPaused,
        badge: isPaused
          ? { label: 'Paused', className: BADGE_COLORS.PAUSED }
          : undefined,
      };
    });

    // Keep the selected/locked job visible even when it isn't in the loaded
    // pages (e.g. while searching, in edit mode, or deep in the list).
    if (
      selectedJobId &&
      fallbackJob?.id === selectedJobId &&
      !options.some((option) => option.value === selectedJobId)
    ) {
      options.push({
        label: `${fallbackJob.jobNumber} - ${fallbackJob.projectName}`,
        value: selectedJobId,
      });
    }

    return sortByLabel(options, (option) => option.label);
  }, [jobs, selectedJobId, fallbackJob]);

  const onOptionsListScrollEnd = React.useCallback(() => {
    if (!selectOpen || !hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [selectOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const jobSelectProps = React.useMemo(
    () => ({
      options: jobOptions,
      onDropdownOpenChange: setSelectOpen,
      searchValue: search,
      onSearchChange: setSearch,
      isSearchingOptions: search.trim() !== debouncedSearch.trim(),
      onOptionsListScrollEnd,
      hasMoreOptions: enabled && !!hasNextPage,
      isLoadingMoreOptions: isFetchingNextPage,
    }),
    [
      jobOptions,
      search,
      debouncedSearch,
      onOptionsListScrollEnd,
      enabled,
      hasNextPage,
      isFetchingNextPage,
    ],
  );

  return { jobs, jobSelectProps };
}
