import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { FeeRecoveryKeys } from './keys';
import { FeeRecoverySettingsDto } from '../types/fee-recovery';
import { EFFECTIVE_SOURCE, RECOVERY_MODE } from '../types/fee-recovery-enums';
import { notifyError } from '../toast';
import { extractErrorMessage } from '../utils/error-message-helper';

export const FeeRecoveryScreenQueryOptions = (params?: {
  page?: number;
  size?: number;
  sort?: string[];
  search?: string;
  effectiveSource?: EFFECTIVE_SOURCE;
  recoveryMode?: RECOVERY_MODE;
}) =>
  queryOptions({
    queryKey: FeeRecoveryKeys.screen(params),
    queryFn: () => APIClient.feeRecovery.getScreen(params),
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
      queryClient.invalidateQueries({ queryKey: FeeRecoveryKeys.all });
    },
    onError: (error) => notifyError(extractErrorMessage(error)),
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
      queryClient.invalidateQueries({ queryKey: FeeRecoveryKeys.all });
    },
    onError: (error) => notifyError(extractErrorMessage(error)),
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
      queryClient.invalidateQueries({ queryKey: FeeRecoveryKeys.all });
    },
    onError: (error) => notifyError(extractErrorMessage(error)),
  });
};
