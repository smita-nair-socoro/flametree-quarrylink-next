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
import { Quotation } from '@/lib/types/quotation';
import { useDebounce } from '@/hooks/use-debounce';

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

/** Map quotation detail customer fields into a CustomerDTO for the form select. */
export function customerDtoFromQuotation(
  quotation: Quotation,
): CustomerDTO | null {
  if (!quotation.customerId) return null;

  const nested = quotation.customerWithAddressResponseDto;
  if (!nested) return null;

  const individualContactName =
    nested.contactName?.trim() ||
    [nested.firstName, nested.lastName].filter(Boolean).join(' ').trim() ||
    quotation.customerName;

  return {
    id: quotation.customerId,
    customerType: nested.customerType,
    businessName: nested.businessName ?? quotation.customerName,
    individualContactName:
      nested.customerType === 'BUSINESS' ? undefined : individualContactName,
    businessPhone: nested.businessPhone,
    businessEmail: nested.businessEmail,
    contactPersonEmail: nested.contactPersonEmail ?? nested.email ?? quotation.email,
    contactPersonPhone: nested.phone ?? quotation.phone,
    accountManagerName: nested.accountManagerName ?? quotation.accountManagerName,
    accountManagerSub: nested.accountManagerSub ?? quotation.accountManagerSub,
    creditLimit: nested.creditLimit,
    paymentType: nested.paymentType as CustomerDTO['paymentType'],
    customerStatus: nested.customerStatus,
    version: nested.version,
    billingAddress: nested.billingAddress,
  };
}

/**
 * Merge paginated customers with a linked customer from the parent entity.
 * Paginated results take precedence; the linked customer is only appended
 * when it is not already present (e.g. after loading more pages).
 */
function mergePaginatedWithLinkedCustomer(
  paginated: CustomerDTO[],
  linked?: CustomerDTO | null,
): CustomerDTO[] {
  if (!linked?.id) return paginated;

  const seenIds = new Set<number>();
  const merged: CustomerDTO[] = [];

  for (const customer of paginated) {
    if (customer.id == null || seenIds.has(customer.id)) continue;
    seenIds.add(customer.id);
    merged.push(customer);
  }

  if (!seenIds.has(linked.id)) {
    merged.push(linked);
  }

  return merged;
}

function ensureCustomerInList(
  customers: CustomerDTO[],
  customer?: CustomerDTO | null,
): CustomerDTO[] {
  if (!customer?.id) return customers;
  if (customers.some((item) => item.id === customer.id)) return customers;
  return [...customers, customer];
}

type UseCustomersForFormOptions = {
  /** When true and not duplicating, only the linked customer is fetched. */
  isEditing: boolean;
  isDuplicate?: boolean;
  customerId?: number;
  enabled?: boolean;
  /**
   * When true during edit, loads paginated customers and ensures the linked
   * customer is included even if not on the first page.
   */
  allowCustomerChangeWhileEditing?: boolean;
  /** Pre-loaded linked customer (e.g. from quotation detail). Skips getById fetch. */
  linkedCustomer?: CustomerDTO | null;
  /** When false, blocks fetchNextPage until the select dropdown is open. */
  loadMoreEnabled?: boolean;
  /** Keeps the selected customer visible in options while searching. */
  selectedCustomerId?: number;
};

export function useCustomersForForm({
  isEditing,
  isDuplicate = false,
  customerId,
  enabled = true,
  allowCustomerChangeWhileEditing = false,
  linkedCustomer: linkedCustomerProp,
  loadMoreEnabled = false,
  selectedCustomerId,
}: UseCustomersForFormOptions) {
  const [customerSearch, setCustomerSearch] = React.useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const knownCustomersRef = React.useRef<Map<number, CustomerDTO>>(new Map());

  React.useEffect(() => {
    if (!loadMoreEnabled) {
      setCustomerSearch('');
    }
  }, [loadMoreEnabled]);

  const mergeLinkedCustomer =
    enabled &&
    allowCustomerChangeWhileEditing &&
    isEditing &&
    !isDuplicate &&
    Boolean(customerId);

  const loadSingleCustomerOnly =
    enabled &&
    isEditing &&
    !isDuplicate &&
    Boolean(customerId) &&
    !allowCustomerChangeWhileEditing;

  const loadPaginatedCustomers = enabled && !loadSingleCustomerOnly;

  const { data: singleCustomer, isLoading: isLoadingSingle } = useQuery({
    ...CustomerDetailQueryOptions(customerId ?? 0),
    enabled: loadSingleCustomerOnly,
  });

  const { data: fetchedLinkedCustomer, isLoading: isLoadingLinkedCustomer } =
    useQuery({
      ...CustomerDetailQueryOptions(customerId ?? 0),
      enabled: mergeLinkedCustomer && !linkedCustomerProp,
    });

  const resolvedLinkedCustomer =
    linkedCustomerProp ?? fetchedLinkedCustomer ?? null;

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
      statuses: [CUSTOMER_STATUS.ACTIVE],
      search: debouncedCustomerSearch.trim() || undefined,
    }),
    enabled: loadPaginatedCustomers,
  });

  const customers = React.useMemo(() => {
    if (loadSingleCustomerOnly) {
      return singleCustomer ? [singleCustomer] : [];
    }

    const paginated = getCustomerItemsFromInfinitePages(infiniteData?.pages);
    const hasActiveSearch = debouncedCustomerSearch.trim().length > 0;

    let merged = paginated;

    if (mergeLinkedCustomer && !hasActiveSearch) {
      merged = mergePaginatedWithLinkedCustomer(
        paginated,
        resolvedLinkedCustomer,
      );
    }

    if (selectedCustomerId) {
      const selectedFromKnown = knownCustomersRef.current.get(selectedCustomerId);
      const selectedFallback =
        resolvedLinkedCustomer?.id === selectedCustomerId
          ? resolvedLinkedCustomer
          : selectedFromKnown ?? null;
      merged = ensureCustomerInList(merged, selectedFallback);
    }

    for (const customer of merged) {
      if (customer.id != null) {
        knownCustomersRef.current.set(customer.id, customer);
      }
    }

    return merged;
  }, [
    loadSingleCustomerOnly,
    singleCustomer,
    infiniteData?.pages,
    mergeLinkedCustomer,
    resolvedLinkedCustomer,
    debouncedCustomerSearch,
    selectedCustomerId,
  ]);

  const customerOptions = React.useMemo(
    () => buildCustomerSelectOptions(customers),
    [customers],
  );

  const onCustomerOptionsScrollEnd = React.useCallback(() => {
    if (
      loadSingleCustomerOnly ||
      !loadMoreEnabled ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }
    void fetchNextPage();
  }, [
    loadSingleCustomerOnly,
    loadMoreEnabled,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const isLoadingLinked =
    mergeLinkedCustomer && !linkedCustomerProp && isLoadingLinkedCustomer;

  const isSearchingCustomers =
    customerSearch.trim() !== debouncedCustomerSearch.trim();

  return {
    customers,
    customerOptions,
    customerSearch,
    onCustomerSearchChange: setCustomerSearch,
    isSearchingCustomers,
    isLoadingCustomers: loadSingleCustomerOnly
      ? isLoadingSingle
      : isLoadingInfinite || isLoadingLinked,
    isFetchingCustomers: loadSingleCustomerOnly
      ? isLoadingSingle
      : isFetching || isLoadingLinked,
    hasMoreCustomerOptions: loadPaginatedCustomers && !!hasNextPage,
    isLoadingMoreCustomerOptions: isFetchingNextPage,
    onCustomerOptionsScrollEnd: loadSingleCustomerOnly
      ? undefined
      : onCustomerOptionsScrollEnd,
  };
}
