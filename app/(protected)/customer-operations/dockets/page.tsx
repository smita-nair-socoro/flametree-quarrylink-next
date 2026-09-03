'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormDialog } from '@/components/form-dialog';
import {
  Package,
  FileText,
  Wallet,
  CircleAlert,
  User,
  Calendar,
  Hash,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocketForm from './(components)/forms/docket-form';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  DocketsTableQueryOptions,
  DocketsByJobIdQueryOptions,
  DocketsByJobIdInfiniteQueryOptions,
  DocketsByDriverIdQueryOptions,
  DocketsByDriverIdInfiniteQueryOptions,
  DocketsByTruckIdQueryOptions,
  DocketsByTruckIdInfiniteQueryOptions,
  DocketStatisticsQueryOptions,
  DocketsTableInfiniteQueryOptions,
  getDocketTableRowsFromInfinitePages,
  getDocketTableRowsFromTableResponse,
  getDocketTableRowsFromDtoPayload,
  toDocketApiFilterParams,
  toDocketApiSortParams,
  getDocketsPageFromListResponse,
  getDocketsTablePage,
  buildDocketFacetOptions,
} from '@/lib/api/docket';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DocketsListResponse,
  DocketsTableResponse,
  DocketTableRow,
} from '@/lib/types/docket';
import type { DocketsPage } from '@/lib/types/docket';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { usePullFromAccSoftware } from '@/lib/api/invoices';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import {
  useAccountingSoftwareProvider,
  useTenantCurrencyTax,
} from '@/lib/utils/tenant-config-helper';
import { getDocketColumns } from './(components)/(data-tables)/docket/columns';
import { DocketTableActions } from './(components)/(data-tables)/docket/docket-table-actions';
import {
  DocketRowActionsProvider,
  useDocketTableActionHost,
} from './(components)/(data-tables)/docket/docket-table-action-host';
import { InvoiceDetailsDialog } from '@/hooks/use-invoice-actions';
import { InvoiceRetryProgressBar } from '@/components/invoice-retry-progress-bar';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { formatLocalDate } from '@/lib/utils/date';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { notifyError, notifySuccess } from '@/lib/toast';

export default function DocketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedJobIdParam = searchParams.get('linkedJobId');
  const linkedJobNumberParam = searchParams.get('linkedJobNumber');
  const driverIdParam = searchParams.get('driverId');
  const driverNameParam = searchParams.get('driverName');
  const truckIdParam = searchParams.get('truckId');
  const truckNameParam = searchParams.get('truckName');

  const accSoftwareProvider = useAccountingSoftwareProvider();
  const showSyncInvoice = accSoftwareProvider === 'MYOB_ACUMATICA';

  const syncInvoice = usePullFromAccSoftware();

  const [isSyncDisabled, setIsSyncDisabled] = React.useState(false);
  const syncCooldownTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  React.useEffect(() => {
    return () => {
      if (syncCooldownTimeoutRef.current) {
        clearTimeout(syncCooldownTimeoutRef.current);
      }
    };
  }, []);

  const handleSyncInvoiceFromAcumatica = React.useCallback(async () => {
    if (syncInvoice.isPending || isSyncDisabled) {
      return;
    }

    setIsSyncDisabled(true);
    syncCooldownTimeoutRef.current = setTimeout(() => {
      setIsSyncDisabled(false);
      syncCooldownTimeoutRef.current = null;
    }, 10000);

    try {
      await syncInvoice.mutateAsync();
      notifySuccess('Invoices synced from Acumatica successfully');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  }, [syncInvoice, isSyncDisabled]);

  const { currencyCode, taxLabel, formatCentsToCurrency } =
    useTenantCurrencyTax();
  const docketColumns = React.useMemo(
    () => getDocketColumns(currencyCode, taxLabel),
    [currencyCode, taxLabel],
  );

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

  // `ids` is the canonical param; `docketId` is kept for older links.
  const docketIdsParam =
    searchParams.get('ids') ?? searchParams.get('docketId');
  const idsFilter = React.useMemo(() => {
    if (!docketIdsParam) return undefined;
    const ids = docketIdsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return ids.length ? ids : undefined;
  }, [docketIdsParam]);

  const { data: statistics, isLoading: isStatisticsLoading } = useQuery(
    DocketStatisticsQueryOptions(),
  );

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [facetFilters, setFacetFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'deliveryDate', desc: true },
  ]);

  const apiSortParams = React.useMemo(() => {
    const params = toDocketApiSortParams(sorting);
    // Job/driver/truck list endpoints still use the nested DocketDTO field names.
    if (linkedJobId || driverId || truckId) {
      const nestedSortBy: Record<string, string> = {
        deliveryDate: 'deliveryCollectionDate',
        type: 'jobItemType',
      };
      return {
        ...params,
        sortBy: nestedSortBy[params.sortBy ?? ''] ?? params.sortBy,
      };
    }
    return params;
  }, [sorting, linkedJobId, driverId, truckId]);

  const apiFilterParams = React.useMemo(
    () => toDocketApiFilterParams(facetFilters),
    [facetFilters],
  );

  const listQueryParams = React.useMemo(
    () => ({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ids: idsFilter,
      ...apiSortParams,
      ...apiFilterParams,
    }),
    [pageIndex, pageSize, search, idsFilter, apiSortParams, apiFilterParams],
  );

  const allDocketsQuery = useQuery({
    ...DocketsTableQueryOptions(listQueryParams),
    enabled: !linkedJobId && !driverId && !truckId,
  });

  const driverDocketsQuery = useQuery({
    ...DocketsByDriverIdQueryOptions(driverId ?? 0, listQueryParams),
    enabled: !!driverId,
  });

  const truckDocketsQuery = useQuery({
    ...DocketsByTruckIdQueryOptions(truckId ?? 0, listQueryParams),
    enabled: !!truckId,
  });

  const jobDocketsQuery = useQuery({
    ...DocketsByJobIdQueryOptions(linkedJobId ?? 0, listQueryParams),
    enabled: !!linkedJobId,
  });

  /** Which docket source is currently driving the table. Every other 4-way
   * selection below (loading state, table id, filter banner, infinite-scroll
   * props) is keyed off this one discriminant instead of repeating the branch. */
  let activeDocketSource: 'job' | 'driver' | 'truck' | 'default';
  if (linkedJobId) {
    activeDocketSource = 'job';
  } else if (driverId) {
    activeDocketSource = 'driver';
  } else if (truckId) {
    activeDocketSource = 'truck';
  } else {
    activeDocketSource = 'default';
  }

  const docketSourceQueries = {
    job: jobDocketsQuery,
    driver: driverDocketsQuery,
    truck: truckDocketsQuery,
    default: allDocketsQuery,
  } as const;

  const {
    data: docketsResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = docketSourceQueries[activeDocketSource];

  const docketsListResponse = React.useMemo(():
    | DocketsListResponse
    | DocketsTableResponse
    | null => {
    if (
      docketsResponse &&
      typeof docketsResponse === 'object' &&
      'dockets' in docketsResponse
    ) {
      return docketsResponse as DocketsListResponse | DocketsTableResponse;
    }
    return null;
  }, [docketsResponse]);

  const totalElements = React.useMemo(() => {
    if (!docketsResponse) return 0;
    if (activeDocketSource === 'default') {
      return (
        getDocketsTablePage(docketsResponse as DocketsTableResponse)
          ?.totalElements ?? 0
      );
    }
    const page = getDocketsPageFromListResponse(
      docketsResponse as DocketsListResponse | DocketsPage,
    );
    return page?.totalElements ?? 0;
  }, [docketsResponse, activeDocketSource]);

  const totalPages = React.useMemo(() => {
    if (!docketsResponse) return 1;
    if (activeDocketSource === 'default') {
      return (
        getDocketsTablePage(docketsResponse as DocketsTableResponse)
          ?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize))
      );
    }
    const page = getDocketsPageFromListResponse(
      docketsResponse as DocketsListResponse | DocketsPage,
    );
    return page?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));
  }, [docketsResponse, activeDocketSource, totalElements, pageSize]);

  const facetOptions = React.useMemo(
    () => buildDocketFacetOptions(docketsListResponse),
    [docketsListResponse],
  );

  const isMobile = useIsMobile();

  const infiniteBaseParams = {
    pageSize: 25,
    search: search.trim() || undefined,
    ...apiFilterParams,
  };

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: infiniteIsFetching,
  } = useInfiniteQuery({
    ...DocketsTableInfiniteQueryOptions(infiniteBaseParams),
    enabled: isMobile && !linkedJobId && !driverId && !truckId && !idsFilter,
  });

  const {
    data: driverInfiniteData,
    fetchNextPage: driverFetchNextPage,
    hasNextPage: driverHasNextPage,
    isFetchingNextPage: driverIsFetchingNextPage,
    isFetching: driverInfiniteIsFetching,
  } = useInfiniteQuery({
    ...DocketsByDriverIdInfiniteQueryOptions(driverId ?? 0, infiniteBaseParams),
    enabled: isMobile && !!driverId && !idsFilter,
  });

  const {
    data: truckInfiniteData,
    fetchNextPage: truckFetchNextPage,
    hasNextPage: truckHasNextPage,
    isFetchingNextPage: truckIsFetchingNextPage,
    isFetching: truckInfiniteIsFetching,
  } = useInfiniteQuery({
    ...DocketsByTruckIdInfiniteQueryOptions(truckId ?? 0, infiniteBaseParams),
    enabled: isMobile && !!truckId && !idsFilter,
  });

  const {
    data: jobInfiniteData,
    fetchNextPage: jobFetchNextPage,
    hasNextPage: jobHasNextPage,
    isFetchingNextPage: jobIsFetchingNextPage,
    isFetching: jobInfiniteIsFetching,
  } = useInfiniteQuery({
    ...DocketsByJobIdInfiniteQueryOptions(linkedJobId ?? 0, {
      pageSize: 25,
      search: search.trim() || undefined,
      ...apiSortParams,
      ...apiFilterParams,
    }),
    enabled: isMobile && !!linkedJobId && !idsFilter,
  });

  const mobileItems = React.useMemo(
    () => getDocketTableRowsFromInfinitePages(infiniteData?.pages, 'table'),
    [infiniteData?.pages],
  );
  const driverMobileItems = React.useMemo(
    () => getDocketTableRowsFromInfinitePages(driverInfiniteData?.pages, 'dto'),
    [driverInfiniteData?.pages],
  );
  const truckMobileItems = React.useMemo(
    () => getDocketTableRowsFromInfinitePages(truckInfiniteData?.pages, 'dto'),
    [truckInfiniteData?.pages],
  );
  const jobMobileItems = React.useMemo(
    () => getDocketTableRowsFromInfinitePages(jobInfiniteData?.pages, 'dto'),
    [jobInfiniteData?.pages],
  );

  const items: DocketTableRow[] = React.useMemo(() => {
    if (!docketsResponse) return [];
    if (activeDocketSource === 'default') {
      return getDocketTableRowsFromTableResponse(
        docketsResponse as DocketsTableResponse,
      );
    }
    return getDocketTableRowsFromDtoPayload(
      docketsResponse as DocketsListResponse | DocketsPage,
    );
  }, [docketsResponse, activeDocketSource]);

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
      newSorting.length > 0 ? newSorting : [{ id: 'deliveryDate', desc: true }],
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
      value: formatCentsToCurrency(statistics?.uninvoicedDocketsValue ?? 0),
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

  const { runAction, viewDialog, confirmDialogs } = useDocketTableActionHost();

  // Keep `ids` in the URL after auto-opening so an accidental dialog close
  // still shows just that docket instead of the full list.
  const autoOpenedIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const singleId = idsFilter?.length === 1 ? idsFilter[0] : null;
    if (!singleId) {
      autoOpenedIdRef.current = null;
      return;
    }
    if (autoOpenedIdRef.current === singleId) return;

    const row = items.find((d) => d.id === singleId);
    if (!row) return;

    autoOpenedIdRef.current = singleId;
    runAction(row.id, 'view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsFilter, items]);

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

  const handleRowClick = (row: DocketTableRow) => {
    runAction(row.id, 'view');
  };

  const renderDocketCard = React.useCallback((docket: DocketTableRow) => {
    const date = docket.deliveryDate
      ? formatLocalDate(docket.deliveryDate.toString())
      : '-';
    const loadSize = docket.actualLoadSize ?? docket.quantity ?? 0;
    const uom = docket.quantityUom;
    const qty = uom
      ? `${formatNumberThousandSeparator(loadSize)} ${formatUomLabel(uom)}`
      : formatNumberThousandSeparator(loadSize);
    const displayStatus =
      docket.status === 'READY_FOR_COLLECTION' ? 'READY' : docket.status;

    return (
      <MobileCard
        title={docket.docketNumber || 'N/A'}
        description={
          <>
            <Hash className="h-3.5 w-3.5" />
            <span className="truncate">{docket.jobReference || '-'}</span>
          </>
        }
        badges={
          <>
            <TableBadges names={[displayStatus]} visibleCount={1} />
            <TableBadges names={[docket.type]} visibleCount={1} />
          </>
        }
        actions={
          <DocketTableActions
            docketId={docket.id}
            status={docket.status}
            invoiceStatus={docket.invoiceStatus}
          />
        }
        fields={[
          {
            icon: <User className="h-4 w-4" />,
            label: 'Customer',
            value: docket.customerName || 'N/A',
          },
          {
            icon: <Package className="h-4 w-4" />,
            label: 'Product',
            value: docket.productName || '-',
          },
          {
            icon: <Calendar className="h-4 w-4" />,
            label: 'Date',
            value: date,
          },
          {
            icon: <FileText className="h-4 w-4" />,
            label: 'Quantity',
            value: qty,
          },
        ]}
      />
    );
  }, []);

  React.useEffect(() => {
    if (isError && error) {
      console.error('Docket API Error:', error);
    }
  }, [isError, error]);

  const tableIdBySource = {
    job: `docket_linked_${linkedJobId}`,
    driver: `docket_driver_${driverId}`,
    truck: `docket_truck_${truckId}`,
    default: 'docket_main_data_table',
  } as const;
  const tableId = idsFilter
    ? `docket_filtered_${idsFilter.join('_')}`
    : tableIdBySource[activeDocketSource];

  const filterDescriptionBySource: Record<
    typeof activeDocketSource,
    React.ReactNode
  > = {
    driver: (
      <>
        <span>Showing dockets assigned to </span>
        <span className="font-semibold text-foreground">
          {driverNameParam || `driver #${driverId}`}
        </span>
      </>
    ),
    truck: (
      <>
        <span>Showing dockets linked to </span>
        <span className="font-semibold text-foreground">
          {truckNameParam || `truck #${truckId}`}
        </span>
      </>
    ),
    job: linkedJobNumberParam ? (
      <>
        <span>Showing dockets</span>
        <span>{' for '}</span>
        <span className="font-semibold text-foreground">
          {linkedJobNumberParam}
        </span>
      </>
    ) : (
      <span>{`Showing dockets for job #${linkedJobId}`}</span>
    ),
    default: null,
  };
  const filterDescription = idsFilter ? (
    <span>
      Showing{' '}
      {idsFilter.length === 1
        ? 'a selected docket'
        : `${idsFilter.length} selected dockets`}
    </span>
  ) : (
    filterDescriptionBySource[activeDocketSource]
  );

  const mobileInfinitePropsBySource = {
    job: {
      items: jobMobileItems,
      hasNextPage: jobHasNextPage,
      isFetchingNextPage: jobIsFetchingNextPage,
      isLoading: jobInfiniteIsFetching,
      fetchNextPage: jobFetchNextPage,
    },
    driver: {
      items: driverMobileItems,
      hasNextPage: driverHasNextPage,
      isFetchingNextPage: driverIsFetchingNextPage,
      isLoading: driverInfiniteIsFetching,
      fetchNextPage: driverFetchNextPage,
    },
    truck: {
      items: truckMobileItems,
      hasNextPage: truckHasNextPage,
      isFetchingNextPage: truckIsFetchingNextPage,
      isLoading: truckInfiniteIsFetching,
      fetchNextPage: truckFetchNextPage,
    },
    default: {
      items: mobileItems,
      hasNextPage,
      isFetchingNextPage,
      isLoading: infiniteIsFetching,
      fetchNextPage,
    },
  } as const;
  const mobileInfiniteProps = idsFilter
    ? undefined
    : mobileInfinitePropsBySource[activeDocketSource];

  let tableContent: React.ReactNode;
  if (isLoading && !docketsResponse) {
    tableContent = (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading dockets...</p>
        </div>
      </div>
    );
  } else if (isError) {
    tableContent = (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Error loading dockets</div>
      </div>
    );
  } else {
    tableContent = (
      <>
        {!!(linkedJobId || idsFilter || driverId || truckId) && (
          <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
            <div className="mt-1 text-sm text-muted-foreground">
              {filterDescription}
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
        <DataTableClient
          key={tableId}
          tableId={tableId}
          data={items ?? []}
          columns={docketColumns}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search dockets..."
          onRowClick={handleRowClick}
          mobileCardRenderer={renderDocketCard}
          mobileInfinite={mobileInfiniteProps}
          defaultSorting={[{ id: 'deliveryDate', desc: true }]}
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
      </>
    );
  }

  return (
    <DocketRowActionsProvider runAction={runAction}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {confirmDialogs}
        {viewDialog}
        <InvoiceDetailsDialog />
        <InvoiceRetryProgressBar />
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-2xl">Dockets</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {showSyncInvoice && (
              <Button
                onClick={handleSyncInvoiceFromAcumatica}
                disabled={syncInvoice.isPending || isSyncDisabled}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw
                    className={`h-4 w-4 ${syncInvoice.isPending ? 'animate-spin' : ''}`}
                  />
                  {syncInvoice.isPending ? 'Syncing' : 'Sync Invoice'}
                </div>
              </Button>
            )}
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
        </div>

        {/* Statistics Cards */}
        <StatsCards
          cards={statsCards}
          mobileGridCols={1}
          desktopGridCols={4}
          isLoading={isStatisticsLoading}
        />

        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          {tableContent}
        </div>
      </div>
    </DocketRowActionsProvider>
  );
}
