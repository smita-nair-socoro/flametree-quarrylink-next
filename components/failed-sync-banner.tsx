'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaymentsFailedCountQueryOptions } from '@/lib/api/payments';
import { CircleAlert } from 'lucide-react';

export function FailedSyncBanner() {
  const { data } = useQuery(PaymentsFailedCountQueryOptions());
  const count = data?.failedCount ?? 0;
  if (count < 1) return null;

  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>Accounting sync failed</AlertTitle>
      <AlertDescription>
        {count} document{count === 1 ? '' : 's'} failed to sync (invoices, cash
        payments, or internal transfers).{' '}
        <Link
          href="/customer-operations/payments?tab=internal-transfers&failedOnly=true"
          className="underline font-medium"
        >
          View failed transfers
        </Link>
        {' · '}
        <Link
          href="/customer-operations/payments?tab=invoices&failedOnly=true"
          className="underline font-medium"
        >
          View failed invoices
        </Link>
      </AlertDescription>
    </Alert>
  );
}
