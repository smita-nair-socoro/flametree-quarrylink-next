import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverAppKeys } from './keys';
import {
  DocketDTO,
  DriverAppStatusUpdateRequest,
  DocketOperationalUpdateRequest,
} from '../types/docket';

export const DriverAppAssignedDocketsQueryOptions = () => ({
  queryKey: DriverAppKeys.assignedDockets(),
  queryFn: () => APIClient.driverApp.getAssignedDockets(),
});

export const DriverAppAssignedDocketDetailQueryOptions = (
  docketId: number,
) => ({
  queryKey: DriverAppKeys.assignedDocketDetail(docketId),
  queryFn: () => APIClient.driverApp.getAssignedDocketById(docketId),
});

export const useDriverAppOperationalUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & DocketOperationalUpdateRequest) =>
      APIClient.driverApp.operationalUpdate(id, data),
    onSuccess: (data, variables) => {
      if (data?.docket) {
        queryClient.setQueryData(
          DriverAppKeys.assignedDocketDetail(variables.id),
          data.docket,
        );
      } else {
        queryClient.setQueryData<DocketDTO>(
          DriverAppKeys.assignedDocketDetail(variables.id),
          (old) =>
            old
              ? {
                  ...old,
                  actualLoadSize: variables.actualLoadSize ?? old.actualLoadSize,
                }
              : old,
        );
      }
      queryClient.invalidateQueries({
        queryKey: DriverAppKeys.assignedDocketDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: DriverAppKeys.assignedDockets(),
      });
    },
  });
};

export const useDriverAppUpdateDocketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: number } & DriverAppStatusUpdateRequest) => {
      const formData = new FormData();
      formData.append('docketStatus', body.docketStatus);
      if (body.reason != null) formData.append('reason', body.reason);
      if (body.notes != null) formData.append('notes', body.notes);
      if (body.latitude != null)
        formData.append('latitude', String(body.latitude));
      if (body.longitude != null)
        formData.append('longitude', String(body.longitude));
      if (body.deliveredProductsConfirmed != null)
        formData.append(
          'deliveredProductsConfirmed',
          String(body.deliveredProductsConfirmed),
        );
      if (body.receiverOnSite != null)
        formData.append('receiverOnSite', String(body.receiverOnSite));
      if (body.receiverName != null)
        formData.append('receiverName', body.receiverName);
      if (body.signatureImage != null)
        formData.append('signatureImage', body.signatureImage);
      if (body.deliveryNotes != null)
        formData.append('deliveryNotes', body.deliveryNotes);
      body.unloadedPhotos?.forEach((photo) =>
        formData.append('unloadedPhotos', photo),
      );
      body.receivedPhotos?.forEach((photo) =>
        formData.append('receivedPhotos', photo),
      );
      return APIClient.driverApp.updateDocketStatus(id, formData);
    },
    onSuccess: (data, variables) => {
      // Seed the detail cache from the response so fields set by the status
      // change (e.g. arrivedAt, used by the waiting-time counter) are
      // available immediately, before the invalidation refetch lands.
      queryClient.setQueryData<DocketDTO>(
        DriverAppKeys.assignedDocketDetail(variables.id),
        (old) =>
          old
            ? {
                ...old,
                docketStatus: data?.docketStatus ?? variables.docketStatus,
                arrivedAt: data?.arrivedAt ?? old.arrivedAt,
              }
            : old,
      );
      if (variables.docketStatus === 'DELIVERED') {
        queryClient.refetchQueries({
          queryKey: DriverAppKeys.assignedDockets(),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: DriverAppKeys.assignedDockets(),
        });
      }
    },
  });
};
