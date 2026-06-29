'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  HauliersInfiniteListQueryOptions,
  getHaulierItemsFromInfinitePages,
} from '@/lib/api/haulier';

export function useHauliersForForm({ enabled = true }: { enabled?: boolean } = {}) {
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingHauliers,
    isFetching: isFetchingHauliers,
  } = useInfiniteQuery({
    ...HauliersInfiniteListQueryOptions({ pageSize: 25 }),
    enabled,
  });

  const hauliers = React.useMemo(
    () => getHaulierItemsFromInfinitePages(infiniteData?.pages),
    [infiniteData?.pages],
  );

  const onHaulierScrollEnd = React.useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    hauliers,
    isLoadingHauliers,
    isFetchingHauliers,
    hasMoreHauliers: !!hasNextPage,
    isLoadingMoreHauliers: isFetchingNextPage,
    onHaulierScrollEnd,
  };
}
