import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverAppKeys } from './keys';
import { DriverAppStatusUpdateRequest } from '../types/docket';

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

export const useDriverAppOperationalUpdate = () =>
  useMutation({
    mutationFn: ({
      id,
      actualLoadSize,
    }: {
      id: number;
      actualLoadSize: number;
    }) => APIClient.driverApp.operationalUpdate(id, actualLoadSize),
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DriverAppKeys.assignedDockets(),
      });
    },
  });
};
