'use client';

import React from 'react';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Activity, Factory, Tags } from 'lucide-react';
import { quotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import rawJson from '@/lib/tests/quotationResponseData.json';
import { Quotation } from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { useQuotationStore } from '@/app/stores/quotation-store';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { QuotationBulkActions } from './(components)/(data-tables)/quotation/quotation-bulk-actions';

export default function QuotationsPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);
  const { items: rawItems } = convertedJson as unknown as {
    items: Array<
      Omit<Quotation, 'quoteId'> & {
        quoteId: number;
      }
    >;
  };

  const items: Quotation[] = rawItems.map((item) => ({
    ...item,
    quoteId: item.id,
  }));

  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation
  );

  const [selectedQuotationForActions, setSelectedQuotationForActions] =
    React.useState<Quotation | null>(null);

  const [selectedQuotations, setSelectedQuotations] = React.useState<
    Quotation[]
  >([]);
  const [tableKey, setTableKey] = React.useState(0);

  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    selectedQuotationForActions?.id,
    selectedQuotationForActions
  );

  const handleRowClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSelectedQuotationForActions(quotation);
    actions.view();
  };

  const handleRowSelectionChange = React.useCallback((selected: Quotation[]) => {
    setSelectedQuotations(selected);
  }, []);

  const handleClearSelection = () => {
    setSelectedQuotations([]);
    setTableKey((prev) => prev + 1); // Force table re-render to clear selection
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Factory },
    { column: 'quote_type', title: 'Quote Type', icon: Tags },
    { column: 'customer_name', title: 'Customer Name', icon: Activity },
    { column: 'account_manager', title: 'Account Manager', icon: Factory },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-2xl">Quotations</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Quote"
            dialogDescription="Create a new customer quotation"
            buttonTitle="Add Quote"
          >
            <QuotationForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min mt-3">
        <DataTableClient
          key={tableKey}
          tableId="quotation_main_data_table"
          data={items ?? []}
          columns={quotationColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search quotes..."
          onRowClick={handleRowClick}
          enableRowSelection={true}
          onRowSelectionChange={handleRowSelectionChange}
          rowSelectionFilter={(row) => row.status !== 'ARCHIVED'}
          bulkActionsSlot={
            <QuotationBulkActions
              selectedQuotations={selectedQuotations}
              onClearSelection={handleClearSelection}
            />
          }
        />
      </div>
    </div>
  );
}
