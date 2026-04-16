import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CustomerKeys } from './keys';
import { CustomerDTO } from '../types/customer';

// Backend uses different field names — this intersection lets us read them without breaking the DTO type
type CustomerApiRaw = CustomerDTO & {
  individualContactName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  contactPersonFirstName?: string;
  contactPersonLastName?: string;
  invoiceDueDateDayCount?: number;
};

/**
 * Maps a raw backend customer response to the frontend CustomerDTO shape.
 * Backend uses: individualContactName, contactPersonEmail, contactPersonPhone,
 *               contactPersonFirstName, contactPersonLastName, invoiceDueDateDayCount
 * Frontend uses: contactName, email, phone, firstName, lastName, invoiceDueDate
 */
function mapCustomerFromApi(raw: CustomerApiRaw): CustomerDTO {
  return {
    ...raw,
    contactName: raw.individualContactName ?? raw.contactName ?? '',
    email: raw.contactPersonEmail ?? raw.email ?? '',
    phone: raw.contactPersonPhone ?? raw.phone ?? '',
    firstName: raw.contactPersonFirstName ?? raw.firstName,
    lastName: raw.contactPersonLastName ?? raw.lastName,
    invoiceDueDate: raw.invoiceDueDateDayCount ?? raw.invoiceDueDate ?? 0,
  };
}

/**
 * Maps a frontend CustomerDTO payload to the backend field names before sending.
 */
function mapCustomerToApi(dto: Partial<CustomerDTO>): Partial<CustomerApiRaw> {
  const { contactName, email, phone, firstName, lastName, invoiceDueDate, ...rest } = dto;
  return {
    ...rest,
    individualContactName: contactName,
    contactPersonEmail: email,
    contactPersonPhone: phone,
    ...(firstName !== undefined ? { contactPersonFirstName: firstName } : {}),
    ...(lastName !== undefined ? { contactPersonLastName: lastName } : {}),
    invoiceDueDateDayCount: invoiceDueDate,
  };
}

export const CustomersListQueryOptions = () =>
  queryOptions({
    queryKey: CustomerKeys.list(),
    queryFn: async () => {
      const data = await APIClient.customers.getAll();
      return (data as CustomerApiRaw[]).map(mapCustomerFromApi);
    },
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const CustomerDetailQueryOptions = (customerId: number) =>
  queryOptions({
    queryKey: CustomerKeys.detail(customerId),
    queryFn: async () => {
      const data = await APIClient.customers.getById(customerId);
      return mapCustomerFromApi(data as CustomerApiRaw);
    },
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

export const CustomerDeliveryAddressesQueryOptions = (
  customerId: number,
  limit?: number
) =>
  queryOptions({
    queryKey: CustomerKeys.deliveryAddresses(customerId, limit),
    queryFn: () => APIClient.customers.getDeliveryAddresses(customerId, limit),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

/**
 * Mutation hook for updating delivery address usage (inUse status).
 * Used when removing a delivery address from suggestions.
 */
export const useUpdateDeliveryAddressUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      customerDeliveryAddressId,
      inUse,
    }: {
      customerId: number;
      customerDeliveryAddressId: number;
      inUse: boolean;
    }) =>
      APIClient.customers.updateDeliveryAddressUsage(
        customerId,
        customerDeliveryAddressId,
        inUse
      ),

    onSuccess: (_data, variables) => {
      // Invalidate all delivery addresses queries for this customer (partial match)
      queryClient.invalidateQueries({
        queryKey: [...CustomerKeys.all, 'delivery-addresses', variables.customerId],
      });
    },
  });
};

/**
 * Mutation hook for creating a new customer.
 * Automatically invalidates the customers list cache on success.
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerDTO>) =>
      APIClient.customers.create(mapCustomerToApi(data)),

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
      APIClient.customers.update(mapCustomerToApi(data)),

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
