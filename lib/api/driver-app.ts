import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverAppKeys } from './keys';
import { DOCKET_STATUS } from '../types/docket-enums';

export const DriverAppAssignedDocketsQueryOptions = () => ({
  queryKey: DriverAppKeys.assignedDockets(),
  queryFn: () => APIClient.driverApp.getAssignedDockets(),
});

export const DriverAppAssignedDocketDetailQueryOptions = (docketId: number) => ({
  queryKey: DriverAppKeys.assignedDocketDetail(docketId),
  queryFn: () => APIClient.driverApp.getAssignedDocketById(docketId),
});

export const useDriverAppOperationalUpdate = () =>
  useMutation({
    mutationFn: ({ id, actualLoadSize }: { id: number; actualLoadSize: number }) =>
      APIClient.driverApp.operationalUpdate(id, actualLoadSize),
  });

export const useDriverAppUpdateDocketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      docketStatus,
      reason,
      notes,
      latitude,
      longitude,
      deliveredProductsConfirmed,
      receiverOnSite,
      receiverName,
      signatureImage,
      deliveryNotes,
      unloadedPhotos,
      receivedPhotos,
    }: {
      id: number;
      docketStatus: DOCKET_STATUS;
      reason?: string;
      notes?: string;
      latitude?: number;
      longitude?: number;
      deliveredProductsConfirmed?: boolean;
      receiverOnSite?: boolean;
      receiverName?: string;
      signatureImage?: string;
      deliveryNotes?: string;
      unloadedPhotos?: string[];
      receivedPhotos?: string[];
    }) =>
      APIClient.driverApp.updateDocketStatus(id, {
        docketStatus,
        ...(reason !== undefined && { reason }),
        ...(notes !== undefined && { notes }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(deliveredProductsConfirmed !== undefined && { deliveredProductsConfirmed }),
        ...(receiverOnSite !== undefined && { receiverOnSite }),
        ...(receiverName !== undefined && { receiverName }),
        ...(signatureImage !== undefined && { signatureImage }),
        ...(deliveryNotes !== undefined && { deliveryNotes }),
        ...(unloadedPhotos !== undefined && { unloadedPhotos }),
        ...(receivedPhotos !== undefined && { receivedPhotos }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverAppKeys.assignedDockets() });
    },
  });
};
