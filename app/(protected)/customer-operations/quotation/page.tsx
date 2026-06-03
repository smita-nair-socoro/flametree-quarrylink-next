'use client';

import React from 'react';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import {
  FileText,
  Clock,
  Wallet,
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  User,
} from 'lucide-react';
import { quotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import { Quotation, QuotationDTO } from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { useQuotationStore } from '@/app/stores/quotation-store';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { useQuery } from '@tanstack/react-query';
import {
  QuotationsListQueryOptions,
  QuotationReportingQueryOptions,
} from '@/lib/api/quotation';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { centsToDollars } from '@/lib/utils/currency';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QuotationBulkActions } from './(components)/(data-tables)/quotation/quotation-bulk-actions';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { QuotationTableActions } from './(components)/(data-tables)/quotation/quotation-table-actions';
import { parseISO, format } from 'date-fns';
// import { QuotationBulkActions } from './(components)/(data-tables)/quotation/quotation-bulk-actions';

export default function QuotationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    })) as Quotation[];
  }, [quotationsData]);

  const { data: reportingData } = useQuery(QuotationReportingQueryOptions());

  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation,
  );
  const setQuotations = useQuotationStore((state) => state.setQuotations);

  // Populate the Zustand store with quotations data
  React.useEffect(() => {
    if (items && items.length > 0) {
      setQuotations(items);
    }
  }, [items, setQuotations]);

  const [selectedQuotationId, setSelectedQuotationId] = React.useState<
    number | null
  >(null);

  const selectedQuotationForActions = React.useMemo(() => {
    if (!selectedQuotationId) return null;
    return items.find((q) => q.id === selectedQuotationId) || null;
  }, [items, selectedQuotationId]);

  // URL-driven filtering for linked quotations
  const linkedQuotationIdsParam = searchParams.get('linkedQuotationIds');
  const linkedQuotationIdsSet = React.useMemo(() => {
    if (!linkedQuotationIdsParam) return null;
    const ids = linkedQuotationIdsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return new Set(ids);
  }, [linkedQuotationIdsParam]);

  const filteredItems = React.useMemo(() => {
    if (!linkedQuotationIdsSet) return items;
    return items.filter((q) => linkedQuotationIdsSet.has(q.id));
  }, [items, linkedQuotationIdsSet]);

  const quotesChange = reportingData?.totalQuotesChangeVsLastMonth ?? 0;
  const quotesValueChange = reportingData?.totalQuotesValueChangeVsLastMonth ?? 0;

  const formatCountChange = (value: number) =>
    `${value > 0 ? '+' : ''}${formatNumberThousandSeparator(value)} vs last month`;

  const formatValueChange = (value: number) =>
    `${value > 0 ? '+' : value < 0 ? '-' : ''}$${centsToDollars(Math.abs(value))} vs last month`;

  const changeColor = (value: number) => {
    if (value > 0) return 'text-[#00A63E]';
    if (value < 0) return 'text-[#E7000B]';
    return 'text-[#737373]';
  };

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Total Quotations',
      value: reportingData?.totalQuotesRaisedThisMonth || 0,
      description: formatCountChange(quotesChange),
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: changeColor(quotesChange),
    },
    {
      title: 'Pending Approval',
      value: reportingData?.totalPendingQuotes || 0,
      description: 'Need attention',
      icon: AlertCircle,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Total Quote Value',
      value: `$${centsToDollars(
        reportingData?.totalValueOfQuotesRaisedThisMonth || 0,
      )}`,
      description: formatValueChange(quotesValueChange),
      icon: Wallet,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0D542B]',
      descriptionColor: changeColor(quotesValueChange),
    },
    {
      title: 'Expiring Soon',
      value: reportingData?.totalQuotesExpiringIn7Days || 0,
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
    selectedQuotationForActions,
  );

  const handleRowClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSelectedQuotationId(quotation.id);
    actions.view(quotation);
  };

  const handleRowSelectionChange = (selected: Quotation[]) => {
    setSelectedQuotations(selected);
  };
  // Mobile card renderer
  const renderQuotationCard = React.useCallback((quotation: Quotation) => {
    const formattedTotal = quotation.totalSellPrice
      ? `$${centsToDollars(quotation.totalSellPrice)}`
      : '$0.00';
    const expiryDate = quotation.expiryDate || '-';

    const date = parseISO(expiryDate);
    const formattedExpiryDate = format(date, 'dd MMM yyyy');

    return (
      <MobileCard
        title={quotation.projectName || 'Untitled Project'}
        description={
          <>
            <Hash className="h-3.5 w-3.5" />
            <span className="truncate">{quotation.quoteNumber}</span>
          </>
        }
        badges={
          <>
            {quotation.quoteStatus && (
              <TableBadges names={[quotation.quoteStatus]} visibleCount={1} />
            )}
          </>
        }
        actions={<QuotationTableActions quotation={quotation} />}
        fields={[
          {
            icon: <User className="h-4 w-4" />,
            label: 'Customer',
            value: quotation.customerName,
          },
          {
            icon: <DollarSign className="h-4 w-4" />,
            label: 'Total',
            value: formattedTotal,
          },
          {
            icon: <Calendar className="h-4 w-4" />,
            label: 'Expiry',
            value: formattedExpiryDate,
          },
          {
            icon: <User className="h-4 w-4" />,
            label: 'Account Manager',
            value: quotation.accountManagerName || '-',
          },
        ]}
      />
    );
  }, []);

  // const handleRowSelectionChange = (selected: Quotation[]) => {
  //   setSelectedQuotations(selected);
  // };

  const handleClearSelection = () => {
    setSelectedQuotations([]);
    // Force re-render of table to clear checkboxes
    setRowSelectionKey((prev) => prev + 1);
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status' },
    { column: 'customer_name', title: 'Customer Name' },
    { column: 'account_manager', title: 'Account Manager' },
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
          <>
            {linkedQuotationIdsSet && (
              <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
                <div className="mt-1 text-sm text-muted-foreground">
                  <span>Showing linked quotations</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/customer-operations/quotation')}
                >
                  Reset Filter
                </Button>
              </div>
            )}
            <DataTableClient
              key={rowSelectionKey}
              tableId={
                linkedQuotationIdsSet
                  ? 'quotation_linked_data_table'
                  : 'quotation_main_data_table'
              }
              data={filteredItems ?? []}
              columns={quotationColumns}
              facetDefinition={facetDefs}
              searchPlaceHolder="Search quotes..."
              onRowClick={handleRowClick}
              enableRowSelection={true}
              onRowSelectionChange={handleRowSelectionChange}
              defaultSorting={[{ id: 'created_at', desc: true }]}
              mobileCardRenderer={renderQuotationCard}
              bulkActionsSlot={
                <QuotationBulkActions
                  selectedQuotations={selectedQuotations}
                  onClearSelection={handleClearSelection}
                />
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
