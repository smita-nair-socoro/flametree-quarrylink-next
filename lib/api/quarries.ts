import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuarryKeys } from './keys';
import { PostEligibilityCheckResponse } from '../types/eligibility-check';
import { extractEligibilityBlockingDependencies } from '../utils/error-message-helper';
import { Quarry } from '../types/quarry';
import { removeNewRecordId } from '../utils/pinned-records';

export const QuarryListQueryOptions = () =>
  queryOptions({
    queryKey: QuarryKeys.list(),
    queryFn: () => APIClient.quarries.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuarryReportingQueryOptions = () =>
  queryOptions({
    queryKey: QuarryKeys.reporting(),
    queryFn: () => APIClient.quarries.reporting(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuarryDetailQueryOptions = (quarryId: number) =>
  queryOptions({
    queryKey: QuarryKeys.detail(quarryId),
    queryFn: () => APIClient.quarries.getById(quarryId),
    staleTime: 5_000,
    enabled: !!quarryId && quarryId > 0,
  });

export const SuburbsListQueryOptions = () =>
  queryOptions({
    queryKey: QuarryKeys.suburbs(),
    queryFn: () => APIClient.quarries.getSuburbs(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
/**
 * Mutation hook for creating a new quarry or supplier.
 * Automatically invalidates the quarries list cache on success.
 */
export const useCreateQuarry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Quarry) => APIClient.quarries.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuarryKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing quarry or supplier.
 * Automatically invalidates the quarries list and detail cache on success.
 */
export const useUpdateQuarry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Quarry }) =>
      APIClient.quarries.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuarryKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.all });
    },
  });
};

/**
 * Mutation hook for unarchiving an existing quarry or supplier.
 * Automatically invalidates the quarries list and detail cache on success.
 */
export const useUnarchiveQuarry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.quarries.unarchive(id),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuarryKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.all });
    },
  });
};

/**
 * Mutation hook for deleting a quarry or supplier after eligibility check.
 * Automatically invalidates the quarries list and detail cache on success.
 */
export const useDeleteQuarryAfterEligibilityCheck = () => {
  const queryClient = useQueryClient();
  return useMutation<PostEligibilityCheckResponse, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => APIClient.quarries.delete(id),
    onSuccess: (response, variables) => {
      const blocking = extractEligibilityBlockingDependencies(response);
      if (!blocking.hasBlockingDependencies) {
        queryClient.invalidateQueries({ queryKey: QuarryKeys.list() });
        queryClient.invalidateQueries({
          queryKey: QuarryKeys.detail(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: QuarryKeys.all });
        
        // Remove the deleted quarry/supplier ID from sessionStorage
        removeNewRecordId('quarry_suppliers_table', variables.id);
      }
    },
  });
};

export const LinkedProductsQueryOptions = (quarryId: number) =>
  queryOptions({
    queryKey: QuarryKeys.linkedProducts(quarryId),
    queryFn: () => APIClient.quarries.linkedProducts(quarryId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
