'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormDialog } from '@/components/form-dialog';
import JobForm from './(components)/forms/job-form';
import { JobDTO } from '@/lib/types/job';
import { FileText, Wallet, Package, CircleAlert, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { getJobColumns } from './(components)/(data-tables)/job/columns';
import { JobTableActions } from './(components)/(data-tables)/job/job-table-actions';
import { useJobActions } from '@/hooks/use-job-actions';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  JobsListQueryOptions,
  JobStatisticsQueryOptions,
  JobsInfiniteListQueryOptions,
  getJobsFromInfinitePages,
  toJobApiSortParams,
  toJobApiFilterParams,
  buildJobFacetOptions,
} from '@/lib/api/job';
import { APIClient } from '@/lib/api/APIClient';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { Tab } from '@/components/ui/tabs';
import { InternalTransferJobsTab } from './(components)/internal-transfer-jobs-tab';
import { FailedSyncBanner } from '@/components/failed-sync-banner';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currencyCode, taxLabel, formatCentsToCurrency } =
    useTenantCurrencyTax();
  const jobColumns = React.useMemo(
    () => getJobColumns(currencyCode, taxLabel),
    [currencyCode, taxLabel],
  );

  const { data: statistics } = useQuery(JobStatisticsQueryOptions());

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [facetFilters, setFacetFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'jobNumber', desc: true },
  ]);

  const apiSortParams = React.useMemo(
    () => toJobApiSortParams(sorting),
    [sorting],
  );

  const apiFilterParams = React.useMemo(
    () => toJobApiFilterParams(facetFilters),
    [facetFilters],
  );

  const jobsTab =
    searchParams.get('tab') === 'internal-transfers'
      ? 'internal-transfers'
      : 'jobs';
  const idsParam = searchParams.get('ids');
  const idsFilter = React.useMemo(() => {
    if (!idsParam) return undefined;
    const ids = idsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return ids.length ? ids : undefined;
  }, [idsParam]);

  const {
    data: jobsList,
    isLoading,
    isFetching,
  } = useQuery(
    JobsListQueryOptions({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ids: idsFilter,
      ...apiSortParams,
      ...apiFilterParams,
    }),
  );

  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: infiniteIsFetching,
  } = useInfiniteQuery({
    ...JobsInfiniteListQueryOptions({
      pageSize: 25,
      search: search.trim() || undefined,
      ids: idsFilter,
      ...apiFilterParams,
    }),
    enabled: isMobile && !idsFilter,
  });

  const mobileItems = React.useMemo(
    () => getJobsFromInfinitePages(infiniteData?.pages),
    [infiniteData?.pages],
  );

  const jobsPage = jobsList?.jobs;

  const facetOptions = React.useMemo(
    () => buildJobFacetOptions(jobsList ?? null),
    [jobsList],
  );

  const searchPurchaseOrders = React.useCallback(async (query: string) => {
    const purchaseOrders = await APIClient.jobs.searchPurchaseOrders(query);
    return (purchaseOrders ?? []).map((po) => ({
      value: po,
      label: po,
    }));
  }, []);

  const items: JobDTO[] = React.useMemo(
    () => (jobsPage?.content ?? []) as JobDTO[],
    [jobsPage],
  );

  const totalElements = jobsPage?.totalElements ?? items.length;
  const totalPages =
    jobsPage?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const statsCards: StatsCardData[] = [
    {
      title: 'Jobs In Progress',
      value: statistics?.jobsInProgress ?? 0,
      description: 'Jobs requiring resources',
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
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
      title: 'Completed Jobs',
      value: statistics?.completedJobsReadyForInvoicing ?? 0,
      description: `${statistics?.completedDocketsReadyForInvoicing ?? 0} dockets ready for invoicing`,
      icon: Package,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Paused Jobs',
      value: statistics?.pausedJobs ?? 0,
      description: 'Need attention',
      icon: CircleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
  ];

  const { actions, viewDialog, confirmDialogs } = useJobActions();

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
      newSorting.length > 0 ? newSorting : [{ id: 'jobNumber', desc: true }],
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

  // Keep `ids` in the URL after auto-opening so an accidental dialog close
  // still shows just that job instead of the full list.
  const autoOpenedIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const singleId = idsFilter?.length === 1 ? idsFilter[0] : null;
    if (!singleId) {
      autoOpenedIdRef.current = null;
      return;
    }
    if (autoOpenedIdRef.current === singleId) return;

    const job = items.find((j) => j.id === singleId);
    if (job) {
      autoOpenedIdRef.current = singleId;
      actions.view(job);
    }
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
        column: 'customerName',
        title: 'Customer',
        options: facetOptions.customers,
      },
      {
        column: 'quarrySupplierName',
        title: 'Quarry / Supplier',
        options: facetOptions.quarrySuppliers,
        hideSearch: true,
      },
      {
        column: 'poNumber',
        title: 'PO',
        asyncSearch: searchPurchaseOrders,
      },
      {
        column: 'accountManagerName',
        title: 'Account Manager',
        options: facetOptions.accountManagers,
      },
    ],
    [facetOptions, searchPurchaseOrders],
  );

  const handleRowClick = (row: JobDTO) => {
    actions.view(row);
  };

  const renderJobCard = React.useCallback(
    (job: JobDTO) => {
      const customerName =
        job.customerDto?.customerType === 'INDIVIDUAL'
          ? job.customerDto?.individualContactName
          : job.customerDto?.businessName || job.contactPersonName || 'N/A';
      const uninvoiced = formatCentsToCurrency(
        job.uninvoicedDocketsAmount ?? 0,
      );

      return (
        <MobileCard
          title={job.jobNumber || 'N/A'}
          badges={<TableBadges names={[job.jobStatus]} visibleCount={1} />}
          actions={<JobTableActions job={job} />}
          fields={[
            {
              icon: <User className="h-4 w-4" />,
              label: 'Customer',
              value: customerName || '-',
            },
            {
              icon: <Package className="h-4 w-4" />,
              label: 'Project',
              value: job.projectName || '-',
            },
            {
              icon: <Wallet className="h-4 w-4" />,
              label: 'Uninvoiced',
              value: uninvoiced,
            },
            {
              icon: <User className="h-4 w-4" />,
              label: 'Account Manager',
              value: job.customerDto?.accountManagerName || '-',
            },
          ]}
        />
      );
    },
    [formatCentsToCurrency],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Jobs</h1>
        </div>
      </div>
      <FailedSyncBanner />
      <Tab
        value={jobsTab}
        onValueChange={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          if (value === 'internal-transfers') {
            params.set('tab', 'internal-transfers');
          } else {
            params.delete('tab');
          }
          const query = params.toString();
          router.replace(
            query
              ? `/customer-operations/jobs?${query}`
              : '/customer-operations/jobs',
          );
        }}
        className="w-full"
        tabsClassName="h-10 w-full overflow-x-auto flex-nowrap rounded-md"
        tabsTriggerClassName="h-8 flex-1 justify-center"
        enableDropdownOnMobile
        tabs={[
          {
            name: 'Jobs',
            value: 'jobs',
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <FormDialog
                    dialogTitle="Add New Job"
                    dialogDescription="Fill in the required fields to add a new job."
                    buttonTitle="Add Job"
                  >
                    <JobForm />
                  </FormDialog>
                </div>
                <StatsCards
                  cards={statsCards}
                  mobileGridCols={1}
                  desktopGridCols={4}
                />
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                  {isLoading && !jobsList ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p>Loading jobs...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {idsFilter && (
                        <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
                          <div className="mt-1 text-sm text-muted-foreground">
                            <span>Showing filtered jobs</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              router.push('/customer-operations/jobs')
                            }
                          >
                            Reset Filter
                          </Button>
                        </div>
                      )}
                      <DataTableClient
                        tableId="job_main_data_table"
                        data={items ?? []}
                        columns={jobColumns}
                        facetDefinition={facetDefs}
                        searchPlaceHolder="Search jobs..."
                        defaultSorting={[{ id: 'jobNumber', desc: true }]}
                        onRowClick={handleRowClick}
                        mobileCardRenderer={renderJobCard}
                        mobileInfinite={
                          !idsFilter
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
                      />
                    </>
                  )}
                </div>
              </div>
            ),
          },
          {
            name: 'Internal Transfers',
            value: 'internal-transfers',
            content: <InternalTransferJobsTab />,
          },
        ]}
      />
    </div>
  );
}
