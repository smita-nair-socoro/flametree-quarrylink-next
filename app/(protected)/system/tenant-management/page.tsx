'use client';

import React from 'react';
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
import Step4SuccessfulDialog from './(components)/forms/steps/step-4-successful-dialog';
import { Button } from '@/components/ui/button';
import { centsToDollars } from '@/lib/utils/currency';
import { useClientActions } from '@/hooks/use-client-actions';
import { useClientStore } from '@/app/stores/client-store';

export default function ClientPortalPage() {
  const { items } = rawJson as unknown as {
    items: Client[];
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'name', title: 'Client', icon: Plus },
    { column: 'subscription', title: 'Subscription', icon: Plus },
    { column: 'client_status', title: 'Client Status', icon: Plus },
  ];

  const statsCards = [
    {
      title: 'Active Tenants',
      value: 329,
      percentage: 25,
    },
    {
      title: 'Problem Tenants',
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

  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [newClientData, setNewClientData] = React.useState<{
    name: string;
    email: string;
  } | null>(null);

  const { actions, confirmDialogs, viewDialog } = useClientActions(
    selectedClientForActions?.id,
    selectedClientForActions,
  );

  const handleClientSuccess = (clientName: string, clientEmail: string) => {
    console.log('handleClientSuccess called with:', clientName, clientEmail);
    setNewClientData({ name: clientName, email: clientEmail });
    setShowSuccessDialog(true);
  };

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
              <span className="text-2xl font-semibold">Tenants</span>
              <span className="text-sm">Onbaord a new Tenant</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline">
                <Share />
                Export
              </Button>
              <FormDialog
                dialogTitle="Add New Tenant"
                dialogDescription="Fill in the required fields to add a new Tenant."
                buttonTitle="Add Tenant"
                dialogWidth="700px"
              >
                <ClientForm onClientAdded={handleClientSuccess} />
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
                  {card.title === 'Monthly Recurring Revenue'
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
          facetDefinition={facetDefs}
          searchPlaceHolder="Search Tenants..."
          onRowClick={handleRowClick}
          defaultSorting={[{ id: 'name', desc: false }]}
        />
      </div>

      {/* Success Dialog - Shown after client is added */}
      {newClientData && (
        <Step4SuccessfulDialog
          open={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            setNewClientData(null);
          }}
          clientName={newClientData.name}
          clientEmail={newClientData.email}
        />
      )}
    </div>
  );
}
