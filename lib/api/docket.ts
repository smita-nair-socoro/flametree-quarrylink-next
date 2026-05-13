import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, SchedulerKeys } from './keys';
import {
  DocketAssignRequest,
  DocketDTO,
  DocketOperationalUpdateRequest,
  ConflictCheckRequest,
  ConflictingDocket,
  ConflictCheckResponse,
} from '../types/docket';
import type { DOCKET_STATUS } from '../types/docket-enums';

export type { ConflictCheckRequest, ConflictingDocket, ConflictCheckResponse };

export const DocketsListQueryOptions = () =>
  queryOptions({
    queryKey: DocketKeys.list(),
    queryFn: () => APIClient.dockets.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DocketDTO>) => APIClient.dockets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};

export const DocketsByJobIdQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: DocketKeys.byJobId(jobId),
    queryFn: () => APIClient.dockets.getByJobId(jobId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const DocketByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: DocketKeys.detail(id),
    queryFn: () => APIClient.dockets.getById(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useUpdateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocketDTO> }) =>
      APIClient.dockets.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};

export const useAssignDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DocketAssignRequest) => APIClient.dockets.assign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: SchedulerKeys.all });
    },
  });
};

export const useUnassignDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { docketId: number }) =>
      APIClient.dockets.unassign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: SchedulerKeys.all });
    },
  });
};

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
      if (deliveredProductsConfirmed !== undefined) {
        formData.append(
          'deliveredProductsConfirmed',
          String(deliveredProductsConfirmed),
        );
      }
      if (receiverOnSite !== undefined) {
        formData.append('receiverOnSite', String(receiverOnSite));
      }
      if (receiverName !== undefined)
        formData.append('receiverName', receiverName);
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

export const useOperationalUpdateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocketOperationalUpdateRequest }) =>
      APIClient.dockets.operationalUpdate(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(response.docket.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};

export const DocketConflictCheckQueryOptions = (
  docketId: number | undefined,
  request: ConflictCheckRequest | null,
) =>
  queryOptions({
    queryKey: ['docket-conflict-check', docketId, request?.truckId, request?.driverId],
    queryFn: () => APIClient.dockets.conflictCheck(docketId!, request!),
    enabled: !!request && !!docketId,
    staleTime: 0,
  });

