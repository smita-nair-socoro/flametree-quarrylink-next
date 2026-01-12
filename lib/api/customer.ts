import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CustomerKeys } from './keys';
import { CustomerDTO } from '../types/customer';

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

export const CustomerReportingQueryOptions = () =>
  queryOptions({
    queryKey: CustomerKeys.reporting(),
    queryFn: () => APIClient.customers.reporting(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

/**
 * Mutation hook for creating a new customer.
 * Automatically invalidates the customers list cache on success.
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerDTO>) =>
      APIClient.customers.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing customer.
 * Automatically invalidates the customers list and detail cache on success.
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerDTO>) =>
      APIClient.customers.update(data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
      if (data.id) {
        queryClient.invalidateQueries({
          queryKey: CustomerKeys.detail(data.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
    },
  });
};
