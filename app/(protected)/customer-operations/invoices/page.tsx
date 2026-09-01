'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicesRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/customer-operations/payments?tab=invoices');
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
      Redirecting to Payments…
    </div>
  );
}
