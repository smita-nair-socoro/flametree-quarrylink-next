import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverAppKeys } from './keys';
import { DriverAppStatusUpdateRequest } from '../types/docket';

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
    mutationFn: ({ id, ...body }: { id: number } & DriverAppStatusUpdateRequest) =>
      APIClient.driverApp.updateDocketStatus(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverAppKeys.assignedDockets() });
    },
  });
};
