import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { TenantKeys } from './keys';

export const TenantsGetDetailQueryOptions = () =>
  queryOptions({
    queryKey: TenantKeys.list(),
    queryFn: () => APIClient.tenants.getTenantDetails(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const TenantSubscriptionsAndInvoicesQueryOptions = () =>
  queryOptions({
    queryKey: TenantKeys.list(),
    queryFn: () => APIClient.tenants.getSubscriptionsAndInvoices(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const TenantCompleteDetailsQueryOptions = () =>
  queryOptions({
    queryKey: [...TenantKeys.all, 'complete-details'],
    queryFn: () => APIClient.tenants.getTenantCompleteDetails(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const TenantLogoQueryOptions = () =>
  queryOptions({
    queryKey: [...TenantKeys.all, 'logo'],
    queryFn: () => APIClient.tenants.getLogo(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

/**
 * Mutation hook for uploading a tenant logo.
 * Automatically invalidates tenant-related caches on success.
 */
export const useUploadTenantLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => APIClient.tenants.uploadLogo(file),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TenantKeys.all });
    },
  });
};
