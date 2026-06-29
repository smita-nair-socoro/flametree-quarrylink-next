import {
  keepPreviousData,
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { HaulierKeys } from './keys';
import type { HaulierDTO, HauliersPage, HaulierCreateDTO, HaulierDeleteResponse } from '../types/haulier';

export type HauliersListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
};

const HAULIER_COLUMN_TO_API_SORT: Record<string, string> = {
  haulierName: 'haulierName',
  emailAddress: 'emailAddress',
  phoneNumber: 'phoneNumber',
  haulierType: 'haulierType',
};

export function toHaulierApiSortParams(
  sorting: { id: string; desc: boolean }[],
): Pick<HauliersListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) return { sortBy: 'haulierName', sortOrder: 'asc' };
  return {
    sortBy: HAULIER_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
    sortOrder: sort.desc ? 'desc' : 'asc',
  };
}

/** Hauliers API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

export function getHauliersPageFromListResponse(
  data: HauliersPage | null | undefined,
): HauliersPage | null {
  return data ?? null;
}

export function getHaulierItemsFromListResponse(
  data: HauliersPage | null | undefined,
): HaulierDTO[] {
  return data?.content ?? [];
}

export function getHaulierItemsFromInfinitePages(
  pages: (HauliersPage | null | undefined)[] | undefined,
): HaulierDTO[] {
  const seenIds = new Set<number>();
  const result: HaulierDTO[] = [];
  for (const page of pages ?? []) {
    for (const haulier of getHaulierItemsFromListResponse(page)) {
      if (haulier.id == null || seenIds.has(haulier.id)) continue;
      seenIds.add(haulier.id);
      result.push(haulier);
    }
  }
  return result;
}

export const HauliersListQueryOptions = (params?: HauliersListParams) =>
  queryOptions({
    queryKey: [...HaulierKeys.list(), params],
    queryFn: () =>
      APIClient.hauliers.getAll({
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const HauliersInfiniteListQueryOptions = (
  params: Omit<HauliersListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...HaulierKeys.list(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.hauliers.getAll({
        ...params,
        page: pageParam,
        pageSize: params.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getHauliersPageFromListResponse(lastPage);
      if (!page) return undefined;
      if ((page.content ?? []).length === 0) return undefined;
      const nextPage = lastPageParam + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export const HaulierDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: HaulierKeys.detail(id),
    queryFn: () => APIClient.hauliers.getById(id),
    enabled: !!id,
    staleTime: 5_000,
  });

export const HaulierDriversQueryOptions = (haulierId: number) =>
  queryOptions({
    queryKey: HaulierKeys.drivers(haulierId),
    queryFn: () => APIClient.hauliers.getDrivers(haulierId),
    staleTime: 5_000,
    enabled: !!haulierId,
  });

export const HaulierTrucksQueryOptions = (haulierId: number) =>
  queryOptions({
    queryKey: HaulierKeys.trucks(haulierId),
    queryFn: () => APIClient.hauliers.getTrucks(haulierId),
    staleTime: 5_000,
    enabled: !!haulierId,
  });

export const useUpdateHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HaulierCreateDTO }) =>
      APIClient.hauliers.update(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: HaulierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
    },
  });
};

export const useDeleteHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation<HaulierDeleteResponse, Error, number>({
    mutationFn: (id) => APIClient.hauliers.delete(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
      }
    },
  });
};

export const useCreateHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HaulierCreateDTO) => APIClient.hauliers.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
    },
  });
};
