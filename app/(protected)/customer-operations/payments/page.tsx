'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tab } from '@/components/ui/tabs';
import { FailedSyncBanner } from '@/components/failed-sync-banner';
import { InvoiceDetailsDialog } from '@/hooks/use-invoice-actions';
import { PaymentsInvoicesPanel } from './(components)/payments-invoices-panel';
import { PaymentsCashSalesPanel } from './(components)/payments-cash-sales-panel';

/** Cash Payments enabled; Internal Transfers deferred (Slice 6). */
const TAB_VALUES = ['invoices', 'cash-payments'] as const;

function parseTab(value: string | null): (typeof TAB_VALUES)[number] {
  if (value === 'cash-payments' || value === 'cash') return 'cash-payments';
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
            content: (
              <PaymentsInvoicesPanel
                initialFailedOnly={failedOnly}
                initialSearch={initialSearch}
              />
            ),
          },
          {
            name: 'Cash Payments',
            value: 'cash-payments',
            content: (
              <PaymentsCashSalesPanel
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
