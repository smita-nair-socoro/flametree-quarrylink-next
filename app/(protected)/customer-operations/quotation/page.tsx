'use client';

import React from 'react';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import {
  Activity,
  Factory,
  Tags,
  FileText,
  Clock,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { quotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import { Quotation, QuotationDTO } from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { useQuotationStore } from '@/app/stores/quotation-store';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { useQuery } from '@tanstack/react-query';
import { QuotationsListQueryOptions } from '@/lib/api/quotation';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { QuotationBulkActions } from './(components)/(data-tables)/quotation/quotation-bulk-actions';

export default function QuotationsPage() {
  // Use React Query to fetch quotations data
  const {
    data: quotationsData,
    isLoading,
    isError,
  } = useQuery(QuotationsListQueryOptions());

  // Transform the API data to match our component expectations
  const items: Quotation[] = React.useMemo(() => {
    const list: QuotationDTO[] = Array.isArray(quotationsData)
      ? (quotationsData as QuotationDTO[])
      : (quotationsData?.content as QuotationDTO[]) || [];

    return list.map((quotation) => ({
      ...quotation,
      quoteId: quotation.id,
      status: quotation.quoteStatus,
    })) as Quotation[];
  }, [quotationsData]);

  console.log('items', items);

  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation
  );
  const setQuotations = useQuotationStore((state) => state.setQuotations);

  // Populate the Zustand store with quotations data
  React.useEffect(() => {
    if (items && items.length > 0) {
      setQuotations(items);
    }
  }, [items, setQuotations]);

  const [selectedQuotationForActions, setSelectedQuotationForActions] =
    React.useState<Quotation | null>(null);

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Total Quotations',
      value: 15,
      description: '+25% vs last month',
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Pending Approval',
      value: 3,
      description: 'Need attention',
      icon: AlertCircle,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Total Quote Value',
      value: '$1,043,570',
      description: '+15% vs last month',
      icon: Wallet,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0D542B]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Expiring Soon',
      value: 0,
      description: 'Within 7 days',
      icon: Clock,
      iconBgColor: 'bg-[#FFE4E6]',
      iconColor: 'text-[#7E2A0C]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  // State for bulk selection
  const [selectedQuotations, setSelectedQuotations] = React.useState<
    Quotation[]
  >([]);
  const [rowSelectionKey, setRowSelectionKey] = React.useState(0);

  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    selectedQuotationForActions?.id,
    selectedQuotationForActions
  );

  const handleRowClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSelectedQuotationForActions(quotation);
    actions.view();
  };

  const handleRowSelectionChange = (selected: Quotation[]) => {
    setSelectedQuotations(selected);
  };

  const handleClearSelection = () => {
    setSelectedQuotations([]);
    // Force re-render of table to clear checkboxes
    setRowSelectionKey((prev) => prev + 1);
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

      {/* Statistics Cards */}
      <StatsCards cards={statsCards} />

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
            key={rowSelectionKey}
            tableId="quotation_main_data_table"
            data={items ?? []}
            columns={quotationColumns}
            facetDefination={facetDefs}
            searchPlaceHolder="Search quotes..."
            onRowClick={handleRowClick}
            enableRowSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            // bulkActions={true}
            bulkActionsSlot={
              <QuotationBulkActions
                selectedQuotations={selectedQuotations}
                onClearSelection={handleClearSelection}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
