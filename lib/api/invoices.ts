import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { InvoicesKeys } from './keys';

export const InvoicesListQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: InvoicesKeys.list(jobId),
    queryFn: () => APIClient.invoices.getAll(jobId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const InvoiceByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: InvoicesKeys.detail(id),
    queryFn: () => APIClient.invoices.getById(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
