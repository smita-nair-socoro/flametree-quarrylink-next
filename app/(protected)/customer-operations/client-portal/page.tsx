'use client';

import React from 'react';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/clientResponseData.json';
import { Client } from '@/lib/types/client';
import { clientColumns } from './(components)/(data-tables)/clients/columns';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

export default function ClientPortalPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items } = convertedJson as unknown as {
    items: Client[];
  };

  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'subscription', title: 'Subscription', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="client_portal_data_table"
          data={items ?? []}
          columns={clientColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search clients..."
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
