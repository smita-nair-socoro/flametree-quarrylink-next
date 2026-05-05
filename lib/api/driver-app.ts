import { useMutation } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverAppKeys } from './keys';

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
