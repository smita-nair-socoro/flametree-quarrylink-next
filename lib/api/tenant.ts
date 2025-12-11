import { keepPreviousData, queryOptions } from '@tanstack/react-query';
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
