import { queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { ChecklistKeys, DocketKeys } from './keys';


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
