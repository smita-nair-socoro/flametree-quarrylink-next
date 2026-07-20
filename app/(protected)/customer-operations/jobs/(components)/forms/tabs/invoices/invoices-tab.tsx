'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  InvoicesListQueryOptions,
  toInvoiceApiSortParams,
} from '@/lib/api/invoices';
import type { SortingState } from '@tanstack/react-table';
import { getInvoicesColumns } from './(data-tables)/columns';
import { DataTableClient } from '@/components/ui/data-table-client';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { FormDialog } from '@/components/form-dialog';
import InvoiceForm from './forms/invoice-form';
import { Button } from '@/components/ui/button';
import { useRetrySync } from '@/lib/api/invoices';
import { RefreshCw } from 'lucide-react';
import { useSelectedJob } from '@/app/stores/job-store';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';

export default function InvoicesTab({ jobId }: { jobId: number }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { currencyCode, taxLabel } = useTenantCurrencyTax();

  const retrySyncMutation = useRetrySync();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'invoice', desc: false },
  ]);

  const apiSortParams = React.useMemo(
    () => toInvoiceApiSortParams(sorting),
    [sorting],
  );

  const { data: invoicesPage, isFetching } = useQuery(
    InvoicesListQueryOptions(jobId, {
      page: pageIndex,
      pageSize,
      ...apiSortParams,
    }),
  );

  const invoices = invoicesPage?.content ?? [];
  const totalElements = invoicesPage?.totalElements ?? 0;
  const totalPages =
    invoicesPage?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(
      newSorting.length > 0 ? newSorting : [{ id: 'invoice', desc: false }],
    );
    setPageIndex(0);
  }, []);

  const handlePaginationChange = React.useCallback(
    (newPage: number, newSize: number) => {
      setPageIndex(newPage);
      setPageSize(newSize);
    },
    [],
  );

  const selectedJob = useSelectedJob();
  const jobStatus = React.useMemo(() => selectedJob?.jobStatus, [selectedJob]);

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div
        className={cn(
          isDesktop
            ? 'flex justify-between items-center'
            : 'flex flex-col gap-4',
        )}
      >
        <span className="text-lg font-semibold">Invoices</span>
        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              retrySyncMutation.mutate(jobId);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry Sync
          </Button>
          {jobStatus !== JOB_STATUS.CANCELLED && (
            <FormDialog dialogTitle="Create Invoice" buttonTitle="Create Invoice">
              <InvoiceForm jobId={jobId} />
            </FormDialog>
          )}
        </div>
      </div>

      <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
        <DataTableClient
          tableId={`job_invoices_${jobId}`}
          columns={getInvoicesColumns(currencyCode, taxLabel)}
          data={invoices}
          simpleTable={true}
          defaultSorting={[{ id: 'invoice', desc: false }]}
          totalElements={totalElements}
          totalPages={totalPages}
          externalPageIndex={pageIndex}
          externalPageSize={pageSize}
          externalSorting={sorting}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
