import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CustomerKeys } from './keys';

export const CustomersListQueryOptions = () =>
  queryOptions({
    queryKey: CustomerKeys.list(),
    queryFn: () => APIClient.customers.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const CustomerDetailQueryOptions = (customerId: number) =>
  queryOptions({
    queryKey: CustomerKeys.detail(customerId),
    queryFn: () => APIClient.customers.getById(customerId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });
