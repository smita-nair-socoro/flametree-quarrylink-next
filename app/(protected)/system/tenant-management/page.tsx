'use client';

import React from 'react';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/clientResponseData.json';
import { Client } from '@/lib/types/client';
import { clientColumns } from './(components)/(data-tables)/clients/columns';
import { Plus, Share } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { FormDialog } from '@/components/form-dialog';
import ClientForm from './(components)/forms/client-form';
import { Button } from '@/components/ui/button';
import { centsToDollars } from '@/lib/utils/currency';
import { useClientActions } from '@/hooks/use-client-actions';
import { useClientStore } from '@/app/stores/client-store';

export default function ClientPortalPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items } = convertedJson as unknown as {
    items: Client[];
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'name', title: 'Client', icon: Plus },
    { column: 'subscription', title: 'Subscription', icon: Plus },
    { column: 'client_status', title: 'Client Status', icon: Plus },
  ];

  const statsCards = [
    {
      title: 'Active Clients',
      value: 329,
      percentage: 25,
    },
    {
      title: 'Problem Clients',
      value: 329,
      percentage: 25,
    },
    {
      title: 'Monthly Recurring Revenue',
      value: 1532900,
      percentage: 10,
    },
  ];

  const setSelectedClient = useClientStore((state) => state.setSelectedClient);

  const [selectedClientForActions, setSelectedClientForActions] =
    React.useState<Client | null>(null);

  const { actions, confirmDialogs, viewDialog } = useClientActions(
    selectedClientForActions?.id,
    selectedClientForActions
  );

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setSelectedClientForActions(client);
    actions.view();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-md p-5 bg-white">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-semibold">Clients</span>
              <span className="text-sm">Onbaord a new client</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline">
                <Share />
                Export
              </Button>
              <FormDialog
                dialogTitle="Add New Client"
                dialogDescription="Fill in the required fields to add a new client."
                buttonTitle="Add Client"
                dialogWidth="700px"
              >
                <ClientForm />
              </FormDialog>
            </div>
          </div>
        </div>

        {statsCards.map((card) => (
          <div key={card.title} className="border rounded-md p-5 bg-white">
            <div className="flex flex-col gap-1.5">
              <span className="text-[#737373] text-sm">{card.title}</span>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold">
                  {card.title === 'MMR'
                    ? `$${centsToDollars(card.value)}`
                    : card.value}
                </span>
                <span className="text-xs text-[#737373]">
                  {card.percentage}% compared to last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
