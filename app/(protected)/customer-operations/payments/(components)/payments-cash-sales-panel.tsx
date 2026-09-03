'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PaymentsListToolbar } from '@/components/payments-list-toolbar';
import {
  DateRangeValue,
  toIsoDate,
} from '@/components/date-range-presets';
import { PaymentsCashSalesQueryOptions } from '@/lib/api/payments';
import { getPaymentsCashSaleColumns } from './payments-cash-sale-columns';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';

export function PaymentsCashSalesPanel({
  initialFailedOnly,
  initialSearch = '',
}: {
  initialFailedOnly: boolean;
  initialSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currencyCode } = useTenantCurrencyTax();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState(initialSearch);
  const [failedOnly, setFailedOnly] = React.useState(initialFailedOnly);
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({});
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'recordedAt', desc: true },
  ]);

  React.useEffect(() => {
    setFailedOnly(initialFailedOnly);
  }, [initialFailedOnly]);

  const syncFailedOnlyParam = React.useCallback(
    (checked: boolean) => {
      setFailedOnly(checked);
      setPageIndex(0);
      const params = new URLSearchParams(searchParams.toString());
      if (checked) {
        params.set('failedOnly', 'true');
      } else {
        params.delete('failedOnly');
      }
      params.set('tab', 'cash-payments');
      router.replace(`/customer-operations/payments?${params.toString()}`);
    },
    [router, searchParams],
  );

  const sort = sorting[0];
  const listParams = React.useMemo(
    () => ({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      failedOnly: failedOnly || undefined,
      fromDate: toIsoDate(dateRange.from),
      toDate: toIsoDate(dateRange.to),
      sortBy: sort?.id,
      sortOrder: sort?.desc ? 'desc' : 'asc',
    }),
    [pageIndex, pageSize, search, failedOnly, dateRange, sort],
  );

  const { data, isFetching } = useQuery(PaymentsCashSalesQueryOptions(listParams));
  const columns = React.useMemo(
    () =>
      getPaymentsCashSaleColumns(currencyCode, {
        referenceTitle: 'Cash Sale',
        dateTitle: 'Recorded Date',
      }),
    [currencyCode],
  );

  return (
    <div className="flex flex-col gap-4">
      <PaymentsListToolbar
        dateRange={dateRange}
        onDateRangeChange={(value) => {
          setDateRange(value);
          setPageIndex(0);
        }}
        failedOnly={failedOnly}
        onFailedOnlyChange={syncFailedOnlyParam}
      />
      <DataTableClient
        tableId="payments_cash_sales"
        data={data?.content ?? []}
        columns={columns}
        searchPlaceHolder="Search cash payments..."
        defaultSorting={[{ id: 'recordedAt', desc: true }]}
        totalElements={data?.totalElements ?? 0}
        totalPages={data?.totalPages ?? 1}
        externalPageIndex={pageIndex}
        externalPageSize={pageSize}
        externalSorting={sorting}
        onPaginationChange={(page, size) => {
          setPageIndex(page);
          setPageSize(size);
        }}
        onSearchChange={(value) => {
          if (!value && search === initialSearch && initialSearch) return;
          setSearch(value);
          setPageIndex(0);
        }}
        onSortingChange={(next) => {
          setSorting(
            next.length > 0 ? next : [{ id: 'recordedAt', desc: true }],
          );
          setPageIndex(0);
        }}
        isLoading={isFetching}
      />
    </div>
  );
}
