import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';

export const SchedulerKeys = {
  all: ['scheduler'] as const,
  trucks: (start: string, end: string) =>
    [...SchedulerKeys.all, 'trucks', start, end] as const,
  drivers: (start: string, end: string) =>
    [...SchedulerKeys.all, 'drivers', start, end] as const,
};

export const SchedulerTrucksQueryOptions = (start: string, end: string) =>
  queryOptions({
    queryKey: SchedulerKeys.trucks(start, end),
    queryFn: () => APIClient.scheduler.getTrucks(start, end),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const SchedulerDriversQueryOptions = (start: string, end: string) =>
  queryOptions({
    queryKey: SchedulerKeys.drivers(start, end),
    queryFn: () => APIClient.scheduler.getDrivers(start, end),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
