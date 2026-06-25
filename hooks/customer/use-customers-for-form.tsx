'use client';

import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  CustomerDetailQueryOptions,
  CustomersInfiniteListQueryOptions,
  getCustomerItemsFromInfinitePages,
} from '@/lib/api/customer';
import { CustomerDTO } from '@/lib/types/customer';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import { FormSelectOption } from '@/components/ui/form-select';

function toCustomerSelectOption(customer: CustomerDTO): FormSelectOption | null {
  if (
    customer.id === undefined ||
    customer.customerStatus === CUSTOMER_STATUS.ARCHIVED
  ) {
    return null;
  }

  const label =
    customer.customerType === 'BUSINESS'
      ? (customer.businessName as string)
      : (customer.individualContactName ?? '');

  return { label, value: customer.id };
}

export function buildCustomerSelectOptions(
  customers: CustomerDTO[],
): FormSelectOption[] {
  return customers
    .map(toCustomerSelectOption)
    .filter((option): option is FormSelectOption => option != null)
    .sort((a, b) => a.label.localeCompare(b.label));
}

type UseCustomersForFormOptions = {
  /** When true and not duplicating, only the linked customer is fetched. */
  isEditing: boolean;
  isDuplicate?: boolean;
  customerId?: number;
  enabled?: boolean;
};

export function useCustomersForForm({
  isEditing,
  isDuplicate = false,
  customerId,
  enabled = true,
}: UseCustomersForFormOptions) {
  const loadSingleCustomerOnly =
    enabled && isEditing && !isDuplicate && Boolean(customerId);

  const { data: singleCustomer, isLoading: isLoadingSingle } = useQuery({
    ...CustomerDetailQueryOptions(customerId ?? 0),
    enabled: loadSingleCustomerOnly,
  });

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
    isFetching,
  } = useInfiniteQuery({
    ...CustomersInfiniteListQueryOptions({
      pageSize: 25,
      status: CUSTOMER_STATUS.ACTIVE,
    }),
    enabled: enabled && !loadSingleCustomerOnly,
  });

  const customers = React.useMemo(() => {
    if (loadSingleCustomerOnly) {
      return singleCustomer ? [singleCustomer] : [];
    }

    return getCustomerItemsFromInfinitePages(infiniteData?.pages);
  }, [loadSingleCustomerOnly, singleCustomer, infiniteData?.pages]);

  const customerOptions = React.useMemo(
    () => buildCustomerSelectOptions(customers),
    [customers],
  );

  const onCustomerOptionsScrollEnd = React.useCallback(() => {
    if (loadSingleCustomerOnly || !hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [
    loadSingleCustomerOnly,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  return {
    customers,
    customerOptions,
    isLoadingCustomers: loadSingleCustomerOnly
      ? isLoadingSingle
      : isLoadingInfinite,
    isFetchingCustomers: loadSingleCustomerOnly ? isLoadingSingle : isFetching,
    hasMoreCustomerOptions: !loadSingleCustomerOnly && !!hasNextPage,
    isLoadingMoreCustomerOptions: isFetchingNextPage,
    onCustomerOptionsScrollEnd: loadSingleCustomerOnly
      ? undefined
      : onCustomerOptionsScrollEnd,
  };
}
