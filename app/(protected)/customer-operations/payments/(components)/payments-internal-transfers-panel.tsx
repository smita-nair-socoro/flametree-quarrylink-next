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
  PaymentsInternalTransfersQueryOptions,
  useRetryInternalTransferJournal,
} from '@/lib/api/payments';
import { getPaymentsInternalTransferColumns } from './payments-internal-transfer-columns';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { PaymentsInternalTransfer } from '@/lib/types/payments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { formatCalendarDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/tenant-config-helper';

export function PaymentsInternalTransfersPanel({
  initialFailedOnly,
}: {
  initialFailedOnly: boolean;
}) {
  const { currencyCode } = useTenantCurrencyTax();
  const retryJournal = useRetryInternalTransferJournal();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [failedOnly, setFailedOnly] = React.useState(initialFailedOnly);
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({});
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'transferDate', desc: true },
  ]);
  const [journalRow, setJournalRow] =
    React.useState<PaymentsInternalTransfer | null>(null);

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

  const { data, isFetching } = useQuery(
    PaymentsInternalTransfersQueryOptions(listParams),
  );

  const columns = React.useMemo(
    () =>
      getPaymentsInternalTransferColumns(
        (journalId) => retryJournal.mutate(journalId),
        setJournalRow,
        retryJournal.isPending ? retryJournal.variables : undefined,
        currencyCode,
      ),
    [currencyCode, retryJournal],
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
        onFailedOnlyChange={(checked) => {
          setFailedOnly(checked);
          setPageIndex(0);
        }}
      />
      <DataTableClient
        tableId="payments_internal_transfers"
        data={data?.content ?? []}
        columns={columns}
        searchPlaceHolder="Search internal transfers..."
        defaultSorting={[{ id: 'transferDate', desc: true }]}
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
            next.length > 0 ? next : [{ id: 'transferDate', desc: true }],
          );
          setPageIndex(0);
        }}
        isLoading={isFetching}
      />
      <Dialog
        open={journalRow != null}
        onOpenChange={(open) => {
          if (!open) setJournalRow(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Internal transfer journal</DialogTitle>
          </DialogHeader>
          {journalRow ? (
            <div className="flex flex-col gap-2 text-sm">
              <p>
                Docket:{' '}
                <span className="font-medium">{journalRow.docketNumber}</span>
              </p>
              <p>
                Journal ID:{' '}
                <span className="font-medium">
                  {journalRow.journalId ?? 'Not created'}
                </span>
              </p>
              <p>
                Transfer date:{' '}
                {formatCalendarDate(journalRow.transferDate)}
              </p>
              <p>
                Cost value:{' '}
                {formatCurrency(Number(journalRow.costValue) / 100, currencyCode)}
              </p>
              <AccountingSyncBadge
                status={journalRow.accountingSync}
                failureReason={journalRow.failureReason}
                onRetry={
                  journalRow.journalId
                    ? () => retryJournal.mutate(journalRow.journalId as number)
                    : undefined
                }
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
