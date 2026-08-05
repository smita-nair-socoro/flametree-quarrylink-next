import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { FeeRecoveryKeys } from './keys';
import { FeeRecoverySettingsDto } from '../types/fee-recovery';

export const CustomerFeeRecoveryOverridesQueryOptions = (params?: {
  page?: number;
  size?: number;
  sort?: string[];
}) =>
  queryOptions({
    queryKey: FeeRecoveryKeys.customerOverrides(params),
    queryFn: () => APIClient.feeRecovery.getCustomerOverrides(params),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const FeeRecoveryScreenQueryOptions = () =>
  queryOptions({
    queryKey: FeeRecoveryKeys.screen(),
    queryFn: () => APIClient.feeRecovery.getScreen(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const FeeRecoverySettingsQueryOptions = () =>
  queryOptions({
    queryKey: FeeRecoveryKeys.settings(),
    queryFn: () => APIClient.feeRecovery.getSettings(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useUpdateFeeRecoverySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Pick<
        FeeRecoverySettingsDto,
        'recoveryMode' | 'feeAmount' | 'invoiceLineDescription'
      >,
    ) => APIClient.feeRecovery.updateSettings(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FeeRecoveryKeys.settings() });
    },
  });
};

export const CustomerFeeRecoveryOverrideQueryOptions = (customerId: number) =>
  queryOptions({
    queryKey: FeeRecoveryKeys.customerOverride(customerId),
    queryFn: () => APIClient.feeRecovery.getCustomerOverride(customerId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

export const useUpdateCustomerFeeRecoveryOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: number;
      data: Pick<
        FeeRecoverySettingsDto,
        'recoveryMode' | 'feeAmount' | 'invoiceLineDescription'
      >;
    }) => APIClient.feeRecovery.updateCustomerOverride(customerId, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FeeRecoveryKeys.customerOverride(variables.customerId),
      });
    },
  });
};

export const CustomerEffectiveFeeRecoveryQueryOptions = (customerId: number) =>
  queryOptions({
    queryKey: FeeRecoveryKeys.customerEffective(customerId),
    queryFn: () => APIClient.feeRecovery.getCustomerEffective(customerId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

export const useDeleteCustomerFeeRecoveryOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: number) =>
      APIClient.feeRecovery.deleteCustomerOverride(customerId),

    onSuccess: (_data, customerId) => {
      queryClient.invalidateQueries({
        queryKey: FeeRecoveryKeys.customerOverride(customerId),
      });
    },
  });
};
