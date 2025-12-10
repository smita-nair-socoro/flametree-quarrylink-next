import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { TenantKeys } from './keys';

export const TenantsListQueryOptions = () =>
  queryOptions({
    queryKey: TenantKeys.list(),
    queryFn: () => APIClient.tenants.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const TenantDetailQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: TenantKeys.detail(tenantId),
    queryFn: () => APIClient.tenants.getById(tenantId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!tenantId,
  });
