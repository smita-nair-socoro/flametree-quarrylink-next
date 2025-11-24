'use client';

import { DataTableClient } from '@/components/ui/data-table-client';
import { invoiceColumns } from '../../(data-tables)/invoices/columns';
import rawInvoiceResponseData from '@/lib/tests/invoiceResponseData.json';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';

export default function BillingHistoryTab() {
  const convertedInvoiceResponseData = convertKeysToSnakeCase(
    rawInvoiceResponseData
  );
  const invoices = convertedInvoiceResponseData.items;

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold mt-2">Billing History</h1>

        <DataTableClient
          columns={invoiceColumns}
          data={invoices}
          simpleTable={true}
          tableId="billing-history-table"
        />
      </div>
    </div>
  );
}
