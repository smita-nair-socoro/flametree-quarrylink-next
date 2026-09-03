'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTableClient } from '@/components/ui/data-table-client';
import { FormDialog } from '@/components/form-dialog';
import InvoiceForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/invoices/forms/invoice-form';
import { useSelectedJob } from '@/app/stores/job-store';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { JobCashSalesQueryOptions } from '@/lib/api/payments';
import { getPaymentsCashSaleColumns } from '@/app/(protected)/customer-operations/payments/(components)/payments-cash-sale-columns';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { TableBadges } from '@/components/table-badges';
import { PaymentsCashSale } from '@/lib/types/payments';
import { centsToDollars } from '@/lib/utils/currency';

function matchesCashSaleSearch(receipt: PaymentsCashSale, search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  const amountDollars = centsToDollars(receipt.amount ?? 0);
  const amountRaw = String(receipt.amount ?? '');
  const amountCompact = amountDollars.replace(/,/g, '');
  return [
    receipt.reference,
    receipt.paymentType,
    receipt.paymentReceivedBy,
    amountRaw,
    amountDollars,
    amountCompact,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

export default function CashSalesTab({ jobId }: { jobId: number }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { currencyCode } = useTenantCurrencyTax();
  const selectedJob = useSelectedJob();
  const jobStatus = selectedJob?.jobStatus;
  const [search, setSearch] = React.useState('');

  const { data: receipts = [], isFetching } = useQuery(
    JobCashSalesQueryOptions(jobId),
  );
  const failedCount = receipts.filter(
    (receipt) => receipt.accountingSync === 'FAILED',
  ).length;
  const visible = receipts.filter((receipt) =>
    matchesCashSaleSearch(receipt, search),
  );
  const columns = React.useMemo(
    () =>
      getPaymentsCashSaleColumns(currencyCode, {
        includeJob: false,
        includeCustomer: false,
        referenceTitle: 'Cash Sale',
        dateTitle: 'Recorded Date',
        receivedByTitle: 'Payment Received By',
      }),
    [currencyCode],
  );

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div
        className={cn(
          isDesktop
            ? 'flex justify-between items-center'
            : 'flex flex-col gap-4',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Cash Sales</span>
          {failedCount > 0 ? (
            <TableBadges names={[`${failedCount} Failed`]} visibleCount={1} />
          ) : null}
        </div>
        {jobStatus !== JOB_STATUS.CANCELLED && (
          <FormDialog
            dialogTitle="Create Cash Sale"
            buttonTitle="Create Cash Sale"
          >
            <InvoiceForm jobId={jobId} />
          </FormDialog>
        )}
      </div>
      <DataTableClient
        tableId={`job_cash_sales_${jobId}`}
        columns={columns}
        data={visible}
        searchPlaceHolder="Search Cash Sales by keyword…"
        defaultSorting={[{ id: 'recordedAt', desc: true }]}
        isLoading={isFetching}
        onSearchChange={setSearch}
      />
    </div>
  );
}
