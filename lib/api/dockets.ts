import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys } from './keys';
import type { DOCKET_STATUS } from '../types/docket-enums';

export const useUpdateDocketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      docketId,
      docketStatus,
      reason,
      notes,
      latitude,
      longitude,
      deliveredProductsConfirmed,
      receiverOnSite,
      receiverName,
      signatureImage,
      unloadedPhoto,
      receiptPhoto,
    }: {
      docketId: number;
      docketStatus: DOCKET_STATUS;
      reason?: string;
      notes?: string;
      latitude?: string;
      longitude?: string;
      deliveredProductsConfirmed?: boolean;
      receiverOnSite?: boolean;
      receiverName?: string;
      signatureImage?: File | null;
      unloadedPhoto?: File | null;
      receiptPhoto?: File | null;
    }) => {
      const formData = new FormData();
      formData.append('docketStatus', docketStatus);
      if (reason !== undefined) formData.append('reason', reason);
      if (notes !== undefined) formData.append('notes', notes);
      if (latitude !== undefined) formData.append('latitude', latitude);
      if (longitude !== undefined) formData.append('longitude', longitude);
      if (deliveredProductsConfirmed !== undefined)
        formData.append('deliveredProductsConfirmed', String(deliveredProductsConfirmed));
      if (receiverOnSite !== undefined)
        formData.append('receiverOnSite', String(receiverOnSite));
      if (receiverName !== undefined) formData.append('receiverName', receiverName);
      if (signatureImage) formData.append('signatureImage', signatureImage);
      if (unloadedPhoto) formData.append('unloadedPhotos', unloadedPhoto);
      if (receiptPhoto) formData.append('receivedPhotos', receiptPhoto);

      return APIClient.dockets.updateStatus(docketId, formData);
    },

    onSuccess: (_data, { docketId }) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(docketId) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};
