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
import { getQuotationColumns } from './(components)/(data-tables)/quotation/columns';
import { FormDialog } from '@/components/form-dialog';
import { Quotation } from '@/lib/types/quotation';
import QuotationForm from './(components)/forms/quotation-form';
import { useQuotationStore } from '@/app/stores/quotation-store';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  QuotationsListQueryOptions,
  QuotationsInfiniteListQueryOptions,
  QuotesFilterQueryOptions,
  QuotationReportingQueryOptions,
  toQuoteApiSortParams,
  toQuoteApiFilterParams,
  buildQuoteFacetOptions,
  getQuoteItemsFromListResponse,
  getQuotesFromInfinitePages,
} from '@/lib/api/quotation';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QuotationBulkActions } from './(components)/(data-tables)/quotation/quotation-bulk-actions';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { QuotationTableActions } from './(components)/(data-tables)/quotation/quotation-table-actions';
import { formatLocalDate } from '@/lib/utils/date';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export default function QuotationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currencyCode, taxLabel, formatCentsToCurrency } =
    useTenantCurrencyTax();
  const isMobile = useIsMobile();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [facetFilters, setFacetFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);

  const apiSortParams = React.useMemo(
    () => toQuoteApiSortParams(sorting),
    [sorting],
  );
  const apiFilterParams = React.useMemo(
    () => toQuoteApiFilterParams(facetFilters),
    [facetFilters],
  );

  const linkedQuotationIdsParam = searchParams.get('linkedQuotationIds');
  const openQuoteIdParam = searchParams.get('openQuoteId');
  const linkedQuotationIds = React.useMemo(() => {
    const raw = linkedQuotationIdsParam ?? openQuoteIdParam;
    if (!raw) return undefined;
    const ids = raw
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return ids.length ? ids : undefined;
  }, [linkedQuotationIdsParam, openQuoteIdParam]);

  const {
    data: quotationsList,
    isLoading,
    isFetching,
    isError,
  } = useQuery(
    QuotationsListQueryOptions({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ids: linkedQuotationIds,
      ...apiSortParams,
      ...apiFilterParams,
    }),
  );

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: infiniteIsFetching,
  } = useInfiniteQuery({
    ...QuotationsInfiniteListQueryOptions({
      pageSize: 25,
      search: search.trim() || undefined,
      ids: linkedQuotationIds,
      ...apiFilterParams,
    }),
    enabled: isMobile && !linkedQuotationIds,
  });

  const items: Quotation[] = React.useMemo(
    () => getQuoteItemsFromListResponse(quotationsList) as Quotation[],
    [quotationsList],
  );

  const mobileItems = React.useMemo(
    () => getQuotesFromInfinitePages(infiniteData?.pages) as Quotation[],
    [infiniteData?.pages],
  );

  const quotesPage = quotationsList?.quotes;
  const totalElements = quotesPage?.totalElements ?? items.length;
  const totalPages =
    quotesPage?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const { data: quoteFilters } = useQuery(QuotesFilterQueryOptions());
  const facetOptions = React.useMemo(
    () => buildQuoteFacetOptions(quoteFilters ?? null),
    [quoteFilters],
  );

  const { data: reportingData } = useQuery(QuotationReportingQueryOptions());

  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation,
  );
  const setQuotations = useQuotationStore((state) => state.setQuotations);

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

  const quotesChange = Math.round(
    reportingData?.totalQuotesChangeVsLastMonth ?? 0,
  );
  const quotesValueChange =
    reportingData?.totalQuotesValueChangeVsLastMonth ?? 0;

  const formatCountChange = (value: number) =>
    `${value > 0 ? '+' : ''}${value} vs last month`;

  const formatValueChange = (value: number) =>
    `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatCentsToCurrency(Math.abs(value))} vs last month`;

  const changeColor = (value: number) => {
    if (value > 0) return 'text-[#00A63E]';
    if (value < 0) return 'text-[#E7000B]';
    return 'text-[#737373]';
  };

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
      value: formatCentsToCurrency(
        reportingData?.totalValueOfQuotesRaisedThisMonth || 0,
      ),
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

  const [selectedQuotations, setSelectedQuotations] = React.useState<
    Quotation[]
  >([]);
  const [rowSelectionKey, setRowSelectionKey] = React.useState(0);

  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    selectedQuotationForActions,
  );

  const autoOpenedQuoteIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const openQuoteId = openQuoteIdParam ? Number(openQuoteIdParam) : null;
    if (!openQuoteId) {
      autoOpenedQuoteIdRef.current = null;
      return;
    }
    if (autoOpenedQuoteIdRef.current === openQuoteId) return;

    const quotation = items.find((q) => q.id === openQuoteId);
    if (quotation) {
      autoOpenedQuoteIdRef.current = openQuoteId;
      setSelectedQuotation(quotation);
      setSelectedQuotationId(quotation.id);
      actions.view(quotation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openQuoteIdParam, items]);

  const handleRowClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setSelectedQuotationId(quotation.id);
    actions.view(quotation);
  };
  const handleRowClickRef = React.useRef(handleRowClick);
  handleRowClickRef.current = handleRowClick;
  const stableHandleRowClick = React.useCallback(
    (quotation: Quotation) => handleRowClickRef.current(quotation),
    [],
  );
  const quotationColumns = React.useMemo(
    () => getQuotationColumns(currencyCode, taxLabel, stableHandleRowClick),
    [currencyCode, taxLabel, stableHandleRowClick],
  );

  const handleRowSelectionChange = (selected: Quotation[]) => {
    setSelectedQuotations(selected);
  };

  const renderQuotationCard = React.useCallback(
    (quotation: Quotation) => {
      const formattedTotal = formatCentsToCurrency(
        quotation.totalSellPrice ?? 0,
      );
      const expiryDate = quotation.expiryDate || '-';
      const formattedExpiryDate =
        expiryDate === '-' ? '-' : formatLocalDate(expiryDate);

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
    },
    [formatCentsToCurrency],
  );

  const handleClearSelection = () => {
    setSelectedQuotations([]);
    setRowSelectionKey((prev) => prev + 1);
  };

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPageIndex(0);
  }, []);

  const facetFiltersKeyRef = React.useRef('[]');
  const handleFacetFiltersChange = React.useCallback(
    (filters: ColumnFiltersState) => {
      const serialized = JSON.stringify(filters);
      if (facetFiltersKeyRef.current !== serialized) {
        facetFiltersKeyRef.current = serialized;
        setPageIndex(0);
      }
      setFacetFilters(filters);
    },
    [],
  );

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(
      newSorting.length > 0 ? newSorting : [{ id: 'created_at', desc: true }],
    );
    setPageIndex(0);
  }, []);

  const handlePaginationChange = React.useCallback(
    (newPage: number, newSize: number) => {
      setPageIndex(newPage);
      setPageSize(newSize);
    },
    [],
  );

  const facetDefs: FacetDefinition[] = React.useMemo(
    () => [
      {
        column: 'status',
        title: 'Status',
        options: facetOptions.statuses,
      },
      {
        column: 'customer_name',
        title: 'Customer Name',
        options: facetOptions.customers,
      },
      {
        column: 'account_manager',
        title: 'Account Manager',
        options: facetOptions.accountManagers,
      },
    ],
    [facetOptions],
  );

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
            {linkedQuotationIds && (
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
                linkedQuotationIds
                  ? 'quotation_linked_data_table'
                  : 'quotation_main_data_table'
              }
              data={items ?? []}
              columns={quotationColumns}
              facetDefinition={facetDefs}
              searchPlaceHolder="Search quotes..."
              onRowClick={handleRowClick}
              enableRowSelection={true}
              onRowSelectionChange={handleRowSelectionChange}
              defaultSorting={[{ id: 'created_at', desc: true }]}
              mobileCardRenderer={renderQuotationCard}
              mobileInfinite={
                !linkedQuotationIds
                  ? {
                      items: mobileItems,
                      hasNextPage,
                      isFetchingNextPage,
                      isLoading: infiniteIsFetching,
                      fetchNextPage,
                    }
                  : undefined
              }
              totalElements={totalElements}
              totalPages={totalPages}
              externalPageIndex={pageIndex}
              externalPageSize={pageSize}
              externalSorting={sorting}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchChange}
              onFacetFiltersChange={handleFacetFiltersChange}
              onSortingChange={handleSortingChange}
              isLoading={isFetching}
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
