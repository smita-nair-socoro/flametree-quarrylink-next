'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormDialog } from '@/components/form-dialog';
import { Package, FileText, Wallet, CircleAlert } from 'lucide-react';
import DocketForm from './(components)/forms/docket-form';

import { useQuery } from '@tanstack/react-query';
import {
  DocketsListQueryOptions,
  DocketsByDriverIdQueryOptions,
  DocketsByTruckIdQueryOptions,
  DocketStatisticsQueryOptions,
  toDocketApiFilterParams,
  toDocketApiSortParams,
  getDocketsPageFromListResponse,
  buildDocketFacetOptions,
  isDocketsListResponse,
} from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { Button } from '@/components/ui/button';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { centsToDollars } from '@/lib/utils/currency';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { getDocketColumns } from './(components)/(data-tables)/docket/columns';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { InvoiceDetailsDialog } from '@/hooks/use-invoice-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

export default function DocketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedJobIdParam = searchParams.get('linkedJobId');
  const linkedJobNumberParam = searchParams.get('linkedJobNumber');
  const driverIdParam = searchParams.get('driverId');
  const driverNameParam = searchParams.get('driverName');
  const truckIdParam = searchParams.get('truckId');
  const truckNameParam = searchParams.get('truckName');

  const { currencyCode, taxLabel } = useTenantCurrencyTax();

  const linkedJobId = React.useMemo(() => {
    const parsed = Number(linkedJobIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [linkedJobIdParam]);

  const driverId = React.useMemo(() => {
    const parsed = Number(driverIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [driverIdParam]);

  const truckId = React.useMemo(() => {
    const parsed = Number(truckIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [truckIdParam]);

  const { data: statistics, isLoading: isStatisticsLoading } = useQuery(
    DocketStatisticsQueryOptions(),
  );

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [facetFilters, setFacetFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'docketNumber', desc: false },
  ]);

  const apiSortParams = React.useMemo(
    () => toDocketApiSortParams(sorting),
    [sorting],
  );

  const apiFilterParams = React.useMemo(
    () => toDocketApiFilterParams(facetFilters),
    [facetFilters],
  );

  const listQueryParams = React.useMemo(
    () => ({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ...apiSortParams,
      ...apiFilterParams,
    }),
    [pageIndex, pageSize, search, apiSortParams, apiFilterParams],
  );

  const useAllDocketsQuery = !linkedJobId && !driverId && !truckId;

  const {
    data: allDockets,
    isLoading: isAllDocketsLoading,
    isFetching: isAllDocketsFetching,
    error: allDocketsError,
    isError: isAllDocketsError,
  } = useQuery({
    ...DocketsListQueryOptions(listQueryParams),
    enabled: useAllDocketsQuery,
  });

  const {
    data: driverDockets,
    isLoading: isDriverDocketsLoading,
    isFetching: isDriverDocketsFetching,
    error: driverDocketsError,
    isError: isDriverDocketsError,
  } = useQuery({
    ...DocketsByDriverIdQueryOptions(driverId ?? 0, listQueryParams),
    enabled: !!driverId,
  });

  const {
    data: truckDockets,
    isLoading: isTruckDocketsLoading,
    isFetching: isTruckDocketsFetching,
    error: truckDocketsError,
    isError: isTruckDocketsError,
  } = useQuery({
    ...DocketsByTruckIdQueryOptions(truckId ?? 0, listQueryParams),
    enabled: !!truckId,
  });

  const docketsResponse = driverId
    ? driverDockets
    : truckId
      ? truckDockets
      : allDockets;

  const docketPage = React.useMemo(
    () => getDocketsPageFromListResponse(docketsResponse),
    [docketsResponse],
  );

  const facetOptions = React.useMemo(
    () =>
      buildDocketFacetOptions(
        isDocketsListResponse(docketsResponse) ? docketsResponse : null,
      ),
    [docketsResponse],
  );

  const isLoading = driverId
    ? isDriverDocketsLoading
    : truckId
      ? isTruckDocketsLoading
      : isAllDocketsLoading;
  const isFetching = driverId
    ? isDriverDocketsFetching
    : truckId
      ? isTruckDocketsFetching
      : isAllDocketsFetching;
  const isError = driverId
    ? isDriverDocketsError
    : truckId
      ? isTruckDocketsError
      : isAllDocketsError;
  const error = driverId
    ? driverDocketsError
    : truckId
      ? truckDocketsError
      : allDocketsError;

  const items: DocketDTO[] = React.useMemo(() => {
    return (docketPage?.content ?? []).map((docket) => ({
      ...docket,
    })) as DocketDTO[];
  }, [docketPage]);

  const totalElements = docketPage?.totalElements ?? items.length;
  const totalPages =
    docketPage?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));


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
      newSorting.length > 0
        ? newSorting
        : [{ id: 'docketNumber', desc: false }],
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

  const statsCards: StatsCardData[] = [
    {
      title: 'Scheduled Dockets Today',
      value: statistics?.scheduledDocketsToday ?? 0,
      description: `${statistics?.scheduledDeliveryDocketsToday ?? 0} Delivery | ${statistics?.scheduledCollectionDocketsToday ?? 0} Collection`,
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Unassigned Dockets',
      title2: '(Next 7 Days)',
      value: statistics?.unassignedDocketsNext7Days ?? 0,
      description:
        (statistics?.unassignedDocketsNext7Days ?? 0) > 0
          ? 'Need attention'
          : '',
      icon: CircleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor:
        (statistics?.unassignedDocketsNext7Days ?? 0) > 0
          ? 'text-[#E7000B]'
          : 'text-[#737373]',
    },
    {
      title: 'Value of Uninvoiced Dockets',
      value: `$${centsToDollars(statistics?.uninvoicedDocketsValue ?? 0)}`,
      description: `${statistics?.uninvoicedDeliveryDockets ?? 0} Delivery | ${statistics?.uninvoicedCollectionDockets ?? 0} Collection`,
      icon: Wallet,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Quantity Scheduled Today',
      value: `${statistics?.quantityScheduledToday ?? 0} ${statistics?.quantityScheduledTodayUnit ?? ''}`,
      description: `Across ${statistics?.quantityScheduledTodayDockets ?? 0} dockets`,
      icon: Package,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const docketIdsParam = searchParams.get('docketId');
  const docketIdsSet = React.useMemo(() => {
    if (!docketIdsParam) return null;
    const ids = docketIdsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return new Set(ids);
  }, [docketIdsParam]);

  const filteredItems = React.useMemo(() => {
    if (!docketIdsSet) return items;
    return items.filter((d) => docketIdsSet.has(d.id));
  }, [items, docketIdsSet]);

  const { actions, viewDialog, confirmDialogs } = useDocketActions();

  const facetDefs: FacetDefinition[] = React.useMemo(
    () => [
      {
        column: 'status',
        title: 'Status',
        options: facetOptions.statuses,
      },
      {
        column: 'product',
        title: 'Product',
        options: facetOptions.products,
      },
      {
        column: 'customer',
        title: 'Customer',
        options: facetOptions.customers,
      },
      {
        column: 'docketType',
        title: 'Type',
        options: facetOptions.types,
      },
    ],
    [facetOptions],
  );

  const handleRowClick = (row: DocketDTO) => {
    actions.view(row);
  };

  React.useEffect(() => {
    if (isError && error) {
      console.error('Docket API Error:', error);
    }
  }, [isError, error]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <InvoiceDetailsDialog />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Dockets</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Docket"
            dialogDescription="Fill in the required fields to add a new docket."
            buttonTitle="Add Docket"
          >
            <DocketForm />
          </FormDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        cards={statsCards}
        mobileGridCols={1}
        desktopGridCols={4}
        isLoading={isStatisticsLoading}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {isLoading && !docketsResponse ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading dockets...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Error loading dockets</div>
          </div>
        ) : (
          <>
            {(linkedJobId || docketIdsSet || driverId || truckId) && (
              <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
                <div className="mt-1 text-sm text-muted-foreground">
                  {docketIdsSet ? (
                    <span>
                      Showing{' '}
                      {docketIdsSet.size === 1
                        ? 'a selected docket'
                        : `${docketIdsSet.size} selected dockets`}
                    </span>
                  ) : driverId ? (
                    <>
                      <span>Showing dockets assigned to </span>
                      <span className="font-semibold text-foreground">
                        {driverNameParam || `driver #${driverId}`}
                      </span>
                    </>
                  ) : truckId ? (
                    <>
                      <span>Showing dockets linked to </span>
                      <span className="font-semibold text-foreground">
                        {truckNameParam || `truck #${truckId}`}
                      </span>
                    </>
                  ) : linkedJobNumberParam ? (
                    <>
                      <span>Showing dockets</span>
                      <span>{' for '}</span>
                      <span className="font-semibold text-foreground">
                        {linkedJobNumberParam}
                      </span>
                    </>
                  ) : (
                    <span>{`Showing dockets for job #${linkedJobId}`}</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/customer-operations/dockets')}
                >
                  Reset Filter
                </Button>
              </div>
            )}
            {(() => {
              const tableId = docketIdsSet
                ? `docket_filtered_${Array.from(docketIdsSet).join('_')}`
                : driverId
                  ? `docket_driver_${driverId}`
                  : truckId
                    ? `docket_truck_${truckId}`
                    : linkedJobId
                      ? `docket_linked_${linkedJobId}`
                      : 'docket_main_data_table';
              return (
                <DataTableClient
                  key={tableId}
                  tableId={tableId}
                  data={filteredItems ?? []}
                  columns={getDocketColumns(currencyCode, taxLabel)}
                  facetDefinition={facetDefs}
                  searchPlaceHolder="Search dockets..."
                  onRowClick={handleRowClick}
                  defaultSorting={[{ id: 'docketNumber', desc: false }]}
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
                />
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
