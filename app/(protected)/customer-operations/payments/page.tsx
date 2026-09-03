'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tab } from '@/components/ui/tabs';
import { FailedSyncBanner } from '@/components/failed-sync-banner';
import { InvoiceRetryProgressBar } from '@/components/invoice-retry-progress-bar';
import { InvoiceDetailsDialog } from '@/hooks/use-invoice-actions';
import { PaymentsInvoicesPanel } from './(components)/payments-invoices-panel';
import { PaymentsCashSalesPanel } from './(components)/payments-cash-sales-panel';
import { PaymentsInternalTransfersPanel } from './(components)/payments-internal-transfers-panel';

const TAB_VALUES = ['invoices', 'cash-payments', 'internal-transfers'] as const;

function parseTab(value: string | null): (typeof TAB_VALUES)[number] {
  if (value === 'cash-payments' || value === 'cash') return 'cash-payments';
  if (value === 'internal-transfers' || value === 'transfers') {
    return 'internal-transfers';
  }
  return 'invoices';
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = parseTab(searchParams.get('tab'));
  const failedOnly = searchParams.get('failedOnly') === 'true';
  const initialSearch = searchParams.get('search') ?? '';

  const handleTabChange = React.useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', value);
      router.replace(`/customer-operations/payments?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <InvoiceDetailsDialog />
      <div>
        <h1 className="text-2xl">Payments</h1>
      </div>
      <FailedSyncBanner />
      <InvoiceRetryProgressBar />
      <Tab
        value={tab}
        onValueChange={handleTabChange}
        className="w-full"
        tabsClassName="h-10 w-full overflow-x-auto flex-nowrap rounded-md"
        tabsTriggerClassName="h-8 flex-1 justify-center"
        enableDropdownOnMobile
        tabs={[
          {
            name: 'Invoices',
            value: 'invoices',
            content: <PaymentsInvoicesPanel initialFailedOnly={failedOnly} initialSearch={initialSearch} />,
          },
          {
            name: 'Cash Payments',
            value: 'cash-payments',
            content: <PaymentsCashSalesPanel initialFailedOnly={failedOnly} initialSearch={initialSearch} />,
          },
          {
            name: 'Internal Transfers',
            value: 'internal-transfers',
            content: (
              <PaymentsInternalTransfersPanel
                initialFailedOnly={failedOnly}
                initialSearch={initialSearch}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
