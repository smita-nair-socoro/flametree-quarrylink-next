'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PaymentsListToolbar } from '@/components/payments-list-toolbar';
import {
  DateRangeValue,
  toIsoDate,
} from '@/components/date-range-presets';
import {
  PaymentsInvoicesQueryOptions,
  PaymentsInvoiceStatisticsQueryOptions,
  useRetryInvoice,
} from '@/lib/api/payments';
import { getPaymentsInvoiceColumns } from './payments-invoice-columns';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { FileText, Wallet, CircleAlert, Clock } from 'lucide-react';

export function PaymentsInvoicesPanel({
  initialFailedOnly,
}: {
  initialFailedOnly: boolean;
}) {
  const { currencyCode, taxLabel, formatCentsToCurrency } =
    useTenantCurrencyTax();
  const retryInvoice = useRetryInvoice();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [failedOnly, setFailedOnly] = React.useState(initialFailedOnly);
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({});
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'invoiceNumber', desc: true },
  ]);

  React.useEffect(() => {
    setFailedOnly(initialFailedOnly);
  }, [initialFailedOnly]);

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

  const { data, isFetching } = useQuery(PaymentsInvoicesQueryOptions(listParams));
  const { data: statistics } = useQuery(PaymentsInvoiceStatisticsQueryOptions());

  const columns = React.useMemo(
    () =>
      getPaymentsInvoiceColumns(
        (id) => retryInvoice.mutate(id),
        retryInvoice.isPending ? retryInvoice.variables : undefined,
        currencyCode,
        taxLabel,
      ),
    [currencyCode, taxLabel, retryInvoice],
  );

  const statsCards: StatsCardData[] = [
    {
      title: 'Total invoices',
      value: statistics?.totalInvoices ?? 0,
      description: 'All invoices',
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Overdue unpaid',
      value: statistics?.overdueInvoices ?? 0,
      description: 'Past due date',
      icon: CircleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Uninvoiced dockets',
      value: formatCentsToCurrency(statistics?.uninvoicedDocketsValue ?? 0),
      description: `${statistics?.uninvoicedDeliveryDockets ?? 0} Delivery | ${statistics?.uninvoicedCollectionDockets ?? 0} Collection`,
      icon: Wallet,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Due payment',
      value: statistics?.duePayment ?? 0,
      description: 'Not yet overdue',
      icon: Clock,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <StatsCards cards={statsCards} mobileGridCols={1} desktopGridCols={4} />
      <PaymentsListToolbar
        dateRange={dateRange}
        onDateRangeChange={(value) => {
          setDateRange(value);
          setPageIndex(0);
        }}
        failedOnly={failedOnly}
        onFailedOnlyChange={(checked) => {
          setFailedOnly(checked);
          setPageIndex(0);
        }}
      />
      <DataTableClient
        tableId="payments_invoices"
        data={data?.content ?? []}
        columns={columns}
        searchPlaceHolder="Search invoices..."
        defaultSorting={[{ id: 'invoiceNumber', desc: true }]}
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
          setSearch(value);
          setPageIndex(0);
        }}
        onSortingChange={(next) => {
          setSorting(
            next.length > 0 ? next : [{ id: 'invoiceNumber', desc: true }],
          );
          setPageIndex(0);
        }}
        isLoading={isFetching}
      />
    </div>
  );
}
