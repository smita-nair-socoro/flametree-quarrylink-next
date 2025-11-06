'use client';

import React from 'react';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Activity, Factory, Tags } from 'lucide-react';
import { quotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import { Quotation, QuotationDTO } from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { useQuotationStore } from '@/app/stores/quotation-store';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { useQuery } from '@tanstack/react-query';
import { QuotationsListQueryOptions } from '@/lib/api/quotation';

export default function QuotationsPage() {
  // Use React Query to fetch quotations data
  const {
    data: quotationsData,
    isLoading,
    error,
    isError,
  } = useQuery(QuotationsListQueryOptions());

  console.log('RAW quotation Response:', quotationsData);
  React.useEffect(() => {
    if (isError && error) {
      console.error('Quotation API Error:', error);
    }
    if (!isLoading && !isError) {
      console.log('✅ Quotations fetched successfully');
    }
  }, [isError, error, isLoading]);

  // Transform the API data to match our component expectations
  const items: Quotation[] = React.useMemo(() => {
    return (
      (Array.isArray(quotationsData)
        ? quotationsData
        : quotationsData?.content || []
      )?.map((quotation) => {
        // Convert API response to snake_case if needed
        const convertedQuotation = convertKeysToSnakeCase(
          quotation
        ) as QuotationDTO;

        return {
          ...convertedQuotation,
          quoteId: convertedQuotation.id,
          status: convertedQuotation.quote_status, // Map quote_status to status for columns
        } as Quotation;
      }) || []
    );
  }, [quotationsData]);

  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation
  );
  const setQuotations = useQuotationStore((state) => state.setQuotations);

  // Populate the Zustand store with quotations data
  React.useEffect(() => {
    if (items && items.length > 0) {
      setQuotations(items);
      console.log('✅ Quotations stored in Zustand:', items.length, 'items');
    }
  }, [items, setQuotations]);

  const [selectedQuotationForActions, setSelectedQuotationForActions] =
    React.useState<Quotation | null>(null);

  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    selectedQuotationForActions?.id,
    selectedQuotationForActions
  );

  const handleRowClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSelectedQuotationForActions(quotation);
    actions.view();
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading quotations...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Error loading quotations</div>
          </div>
        ) : (
          <DataTableClient
            tableId="quotation_main_data_table"
            data={items ?? []}
            columns={quotationColumns}
            facetDefination={facetDefs}
            searchPlaceHolder="Search quotes..."
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>
  );
}
