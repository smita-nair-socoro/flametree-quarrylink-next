import { APIClient } from './APIClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AccountCode,
  createUpdateTrackingCategory,
  TrackingCategory,
} from '../types/accounting';
import {
  AccountingKeys,
  XeroKeys,
  MyobAcumaticaKeys,
  MyobBusinessKeys,
} from './keys';

// Xero, Acumatica, MYOB Connect
export const useConnectXero = () =>
  useMutation({
    mutationKey: XeroKeys.connect(),
    mutationFn: (userEmail: string) => APIClient.xero.connect(userEmail),
  });

export const useXeroStatus = () =>
  useQuery({
    queryKey: XeroKeys.status(),
    queryFn: () => APIClient.xero.getStatus(),
  });

export const useConnectMyobBusiness = () =>
  useMutation({
    mutationKey: MyobBusinessKeys.connect(),
    mutationFn: (userEmail: string) =>
      APIClient.myobBusiness.connect(userEmail),
  });

export const useMyobBusinessStatus = () =>
  useQuery({
    queryKey: MyobBusinessKeys.status(),
    queryFn: () => APIClient.myobBusiness.getStatus(),
  });

export const useConnectMyobAcumatica = () =>
  useMutation({
    mutationKey: MyobAcumaticaKeys.connect(),
    mutationFn: (userEmail: string) =>
      APIClient.myobAcumatica.connect(userEmail),
  });

export const useMyobAcumaticaStatus = () =>
  useQuery({
    queryKey: MyobAcumaticaKeys.status(),
    queryFn: () => APIClient.myobAcumatica.getStatus(),
  });

export const useCreateTrackingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: createUpdateTrackingCategory) =>
      APIClient.accounting.createTrackingCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.trackingCategories,
      });
    },
  });
};

export const useUpdateTrackingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: createUpdateTrackingCategory;
    }): Promise<TrackingCategory> =>
      APIClient.accounting.updateTrackingCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.trackingCategories,
      });
    },
  });
};

export const useGetTrackingCategories = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: AccountingKeys.trackingCategories,
    queryFn: () => APIClient.accounting.getTrackingCategories(),
    enabled: options?.enabled ?? true,
  });
};

export const useGetTrackingCategoriesDefinitions = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: AccountingKeys.trackingCategoryDefinitions,
    queryFn: () => APIClient.accounting.getTrackingCategoriesDefinitions(),
    enabled: options?.enabled ?? true,
  });
};

export const useDeleteTrackingCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.accounting.deleteTrackingCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.trackingCategories,
      });
    },
  });
};

export const useGetAccountCodes = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: AccountingKeys.accountCodes,
    queryFn: () => APIClient.accounting.getAccountCodes(),
    enabled: options?.enabled ?? true,
  });
};

export const useGetAccountCodeById = (
  id: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: AccountingKeys.accountCodeById(id),
    queryFn: () => APIClient.accounting.getAccountCodeById(id),
    enabled: (options?.enabled ?? true) && Number.isFinite(id),
  });
};

export const useCreateAccountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AccountCode) =>
      APIClient.accounting.createAccountCode(data),
    onSuccess: (createdAccountCode) => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.accountCodes,
      });
      if (!createdAccountCode.id) return;
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.accountCodeById(createdAccountCode.id),
      });
    },
  });
};

export const useUpdateAccountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountCode }) =>
      APIClient.accounting.updateAccountCode(id, data),
    onSuccess: (_updatedAccountCode, { id }) => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.accountCodes,
      });
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.accountCodeById(id),
      });
    },
  });
};

export const useDeleteAccountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.accounting.deleteAccountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AccountingKeys.accountCodes,
      });
    },
  });
};
