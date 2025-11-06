import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuotationKeys } from './keys';

export const QuotationsListQueryOptions = () =>
  queryOptions({
    queryKey: QuotationKeys.list(),
    queryFn: () => APIClient.quotations.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuotationDetailQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: QuotationKeys.detail(quotationId),
    queryFn: () => APIClient.quotations.getById(quotationId),
    staleTime: 5_000,
    enabled: !!quotationId && quotationId > 0,
  });
