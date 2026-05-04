import { useQuery } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverAppKeys } from './keys';
import { DocketDTO } from '../types/docket';

export const DriverAppAssignedDocketsQueryOptions = () => ({
  queryKey: DriverAppKeys.assignedDockets(),
  queryFn: () => APIClient.driverApp.getAssignedDockets(),
});

export const DriverAppAssignedDocketDetailQueryOptions = (docketId: number) => ({
  queryKey: DriverAppKeys.assignedDocketDetail(docketId),
  queryFn: () => APIClient.driverApp.getAssignedDocketById(docketId),
});

export function useDriverAppAssignedDockets() {
  return useQuery(DriverAppAssignedDocketsQueryOptions());
}

export function useDriverAppAssignedDocketDetail(docketId: number) {
  return useQuery({
    ...DriverAppAssignedDocketDetailQueryOptions(docketId),
    enabled: docketId > 0,
  });
}
