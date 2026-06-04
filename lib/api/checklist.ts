import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { ChecklistKeys, DocketKeys, DriverAppKeys } from './keys';
import type { ChecklistSubmitRequest } from '../types/checklist-submission';
import { notifyError } from '../toast';
import { extractErrorMessage } from '../utils/error-message-helper';

export const TruckChecklistTemplateQueryOptions = () =>
  queryOptions({
    queryKey: ChecklistKeys.truckTemplate(),
    queryFn: () => APIClient.checklists.getTruckTemplate(),
    staleTime: 5 * 60 * 1000,
  });

export const DriverChecklistTemplateQueryOptions = () =>
  queryOptions({
    queryKey: ChecklistKeys.driverTemplate(),
    queryFn: () => APIClient.checklists.getDriverTemplate(),
    staleTime: 5 * 60 * 1000,
  });

export const DocketTruckInspectionQueryOptions = (docketId: number) =>
  queryOptions({
    queryKey: DocketKeys.truckInspection(docketId),
    queryFn: () => APIClient.dockets.getTruckInspection(docketId),
    enabled: docketId > 0,
    staleTime: 5_000,
  });

export const DocketPreStartChecklistQueryOptions = (docketId: number) =>
  queryOptions({
    queryKey: DocketKeys.preStartChecklist(docketId),
    queryFn: () => APIClient.dockets.getPreStartChecklist(docketId),
    enabled: docketId > 0,
    staleTime: 5_000,
  });

export const TruckSubmissionQueryOptions = (submissionId: number) =>
  queryOptions({
    queryKey: ChecklistKeys.truckSubmission(submissionId),
    queryFn: () => APIClient.checklists.getTruckSubmission(submissionId),
    enabled: submissionId > 0,
    staleTime: 5_000,
  });

export const DriverSubmissionQueryOptions = (submissionId: number) =>
  queryOptions({
    queryKey: ChecklistKeys.driverSubmission(submissionId),
    queryFn: () => APIClient.checklists.getDriverSubmission(submissionId),
    enabled: submissionId > 0,
    staleTime: 5_000,
  });

export const useSubmitChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      request,
      photos,
    }: {
      request: ChecklistSubmitRequest;
      photos?: File[];
    }) => {
      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify(request)], { type: 'application/json' }),
      );
      photos?.forEach((photo) => formData.append('photos', photo));
      return APIClient.checklists.submit(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverAppKeys.assignedDockets() });
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 413) {
        notifyError('Image too large! Maximum size allowed is 8MB.');
        return;
      }
      const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const detail = data?.detail ?? data?.title;
      const message = typeof detail === 'string' ? detail : extractErrorMessage(error);
      notifyError('Submission Failed', { description: message });
    },
  });
};
