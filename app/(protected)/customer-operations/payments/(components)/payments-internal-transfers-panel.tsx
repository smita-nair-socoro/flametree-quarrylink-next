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
import { PaymentsInternalTransfer, INTERNAL_TRANSFER_VOID_REASONS } from '@/lib/types/payments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { formatCalendarDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/tenant-config-helper';
import { useHasVoidTransactions } from '@/app/stores/user-store';
import { useUpdateDocketStatus } from '@/lib/api/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { SelectOptions } from '@/components/ui/select-options';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { useQueryClient } from '@tanstack/react-query';
import { PaymentsKeys } from '@/lib/api/keys';

export function PaymentsInternalTransfersPanel({
  initialFailedOnly,
  initialSearch = '',
}: {
  initialFailedOnly: boolean;
  initialSearch?: string;
}) {
  const { currencyCode } = useTenantCurrencyTax();
  const retryJournal = useRetryInternalTransferJournal();
  const canVoid = useHasVoidTransactions();
  const voidDocket = useUpdateDocketStatus();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState(initialSearch);
  const [failedOnly, setFailedOnly] = React.useState(initialFailedOnly);
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({});
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'transferDate', desc: true },
  ]);
  const [journalRow, setJournalRow] =
    React.useState<PaymentsInternalTransfer | null>(null);
  const [voidRow, setVoidRow] =
    React.useState<PaymentsInternalTransfer | null>(null);
  const [voidReason, setVoidReason] = React.useState('');
  const [voidDetail, setVoidDetail] = React.useState('');

  React.useEffect(() => {
    setFailedOnly(initialFailedOnly);
  }, [initialFailedOnly]);

  React.useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

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
        canVoid ? setVoidRow : undefined,
      ),
    [currencyCode, retryJournal, canVoid],
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
          if (!value && search === initialSearch && initialSearch) return;
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
      <Dialog
        open={voidRow != null}
        onOpenChange={(open) => {
          if (!open) {
            setVoidRow(null);
            setVoidReason('');
            setVoidDetail('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void internal transfer</DialogTitle>
          </DialogHeader>
          <SelectOptions
            searchLabel="void reason"
            options={INTERNAL_TRANSFER_VOID_REASONS.map((reason) => ({
              value: reason,
              label: reason,
            }))}
            value={voidReason}
            onChange={(value) => setVoidReason(String(value))}
            placeholder="Select a reason..."
          />
          {voidReason === 'Other' ? (
            <Textarea
              value={voidDetail}
              onChange={(event) => setVoidDetail(event.target.value)}
              placeholder="Detail required"
            />
          ) : null}
          <Button
            variant="destructive"
            disabled={
              voidDocket.isPending ||
              !voidReason ||
              (voidReason === 'Other' && !voidDetail.trim())
            }
            onClick={async () => {
              if (!voidRow) return;
              try {
                await voidDocket.mutateAsync({
                  docketId: voidRow.docketId,
                  docketStatus: DOCKET_STATUS.VOIDED,
                  reason: voidReason,
                  notes: voidDetail || undefined,
                });
                queryClient.invalidateQueries({ queryKey: PaymentsKeys.all });
                setVoidRow(null);
              } catch (error) {
                notifyError(extractErrorMessage(error));
              }
            }}
          >
            Void
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
