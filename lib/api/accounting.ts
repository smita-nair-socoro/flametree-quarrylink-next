import { APIClient } from './APIClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUpdateTrackingCategory,
  TrackingCategory,
} from '../types/accounting';

const AccountingKeys = {
  trackingCategories: ['tracking-categories'] as const,
  trackingCategoryDefinitions: ['tracking-categories-definitions'] as const,
};

export const useCreateTrackingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: createUpdateTrackingCategory) =>
      APIClient.accounting.createTrackingCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.trackingCategories,
      });
    },
  });
};

export const useUpdateTrackingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: createUpdateTrackingCategory;
    }): Promise<TrackingCategory> =>
      APIClient.accounting.updateTrackingCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.trackingCategories,
      });
    },
  });
};

export const useGetTrackingCategories = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: AccountingKeys.trackingCategories,
    queryFn: () => APIClient.accounting.getTrackingCategories(),
    enabled: options?.enabled ?? true,
  });
};

export const useGetTrackingCategoriesDefinitions = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: AccountingKeys.trackingCategoryDefinitions,
    queryFn: () => APIClient.accounting.getTrackingCategoriesDefinitions(),
    enabled: options?.enabled ?? true,
  });
};

export const useDeleteTrackingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.accounting.deleteTrackingCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.trackingCategories,
      });
    },
  });
};
