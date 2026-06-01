import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, JobKeys, SchedulerKeys } from './keys';

function getCurrentISOWithOffset(): string {
  const d = new Date();
  const tzOffset = -d.getTimezoneOffset();
  const sign = tzOffset >= 0 ? '+' : '-';
  const absOffset = Math.abs(tzOffset);
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(Math.floor(absOffset / 60));
  const mm = pad(absOffset % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${hh}:${mm}`;
}
import {
  DocketAssignRequest,
  DocketDTO,
  DocketOperationalUpdateRequest,
  ConflictCheckRequest,
  DuplicateDocketRequest,
} from '../types/docket';
import { DOCKET_STATUS } from '../types/docket-enums';
import { useJobStore } from '@/app/stores/job-store';

export const DocketStatisticsQueryOptions = () => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  return queryOptions({
    queryKey: [...DocketKeys.statistics(), dateKey],
    queryFn: () => APIClient.dockets.statistics(getCurrentISOWithOffset()),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
};

export const DocketsListQueryOptions = (params?: {
  page?: number;
  size?: number;
}) =>
  queryOptions({
    queryKey: [...DocketKeys.list(), params],
    queryFn: () => APIClient.dockets.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DocketDTO>) => APIClient.dockets.create(data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      if (data.jobId) {
        queryClient.invalidateQueries({ queryKey: JobKeys.list() });
        try {
          const updatedJob = await APIClient.jobs.getJobItems(data.jobId);
          useJobStore.getState().setSelectedJob(updatedJob);
        } catch {
          useJobStore.getState().setSelectedJob(null);
        }
      }
    },
  });
};

export const DocketsByJobIdQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: [...DocketKeys.byJobId(jobId)],
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

    onSuccess: async (_data, { docketId, docketStatus }) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(docketId) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      if (
        _data.jobId &&
        (docketStatus === DOCKET_STATUS.DELIVERED ||
          docketStatus === DOCKET_STATUS.COLLECTED ||
          docketStatus === DOCKET_STATUS.VOIDED ||
          docketStatus === DOCKET_STATUS.CANCELLED)
      ) {
        queryClient.invalidateQueries({ queryKey: JobKeys.list() });
        try {
          const updatedJob = await APIClient.jobs.getJobItems(_data.jobId);
          useJobStore.getState().setSelectedJob(updatedJob);
        } catch {
          useJobStore.getState().setSelectedJob(null);
        }
      }
    },
  });
};

export const useOperationalUpdateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DocketOperationalUpdateRequest;
    }) => APIClient.dockets.operationalUpdate(id, data),
    onSuccess: (response) => {
      if (response.docket) {
        queryClient.invalidateQueries({
          queryKey: DocketKeys.detail(response.docket.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: SchedulerKeys.all });
    },
  });
};

export const useDuplicateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DuplicateDocketRequest }) =>
      APIClient.dockets.duplicate(id, data),
    onSuccess: async (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      const jobId = data.dockets[0]?.jobId;
      if (jobId) {
        try {
          const updatedJob = await APIClient.jobs.getJobItems(jobId);
          useJobStore.getState().setSelectedJob(updatedJob);
        } catch {
          useJobStore.getState().setSelectedJob(null);
        }
      }
    },
  });
};

export const DocketConflictCheckQueryOptions = (
  docketId: number | undefined,
  request: ConflictCheckRequest | null,
) =>
  queryOptions({
    queryKey: [
      'docket-conflict-check',
      docketId,
      request?.truckId,
      request?.driverId,
    ],
    queryFn: () => APIClient.dockets.conflictCheck(docketId!, request!),
    enabled: !!request && !!docketId,
    staleTime: 0,
  });
