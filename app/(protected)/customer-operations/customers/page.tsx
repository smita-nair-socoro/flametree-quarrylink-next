'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import CustomerForm from './(components)/forms/customer-form';
import { CustomerDTO } from '@/lib/types/customer';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { getCustomerColumns } from './(components)/(data-tables)/customer/columns';
import {
  Users,
  UserCheck,
  Activity,
  Building2,
  User,
  Mail,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  CustomersListQueryOptions,
  CustomerReportingQueryOptions,
  CustomersInfiniteListQueryOptions,
  getCustomerItemsFromInfinitePages,
  toCustomerApiFilterParams,
  toCustomerApiSortParams,
  getCustomersPageFromListResponse,
  buildCustomerFacetOptions,
  isCustomersListResponse,
  usePullFromAccSoftware,
} from '@/lib/api/customer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { formatCustomerStatus } from '@/lib/utils/customer-helper';
import { CustomerTableActions } from './(components)/(data-tables)/customer/customer-table-actions';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export default function CustomersPage() {
  const { actions, confirmDialogs, viewDialog } = useCustomerActions();
  const { formatCentsToCurrency, currencyCode } = useTenantCurrencyTax();

  const accSoftwareProvider = useAccountingSoftwareProvider();
  const readOnly = accSoftwareProvider === 'MYOB_ACUMATICA';

  const syncCustomerFromAcumatica = usePullFromAccSoftware();

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

  const handleSyncCustomerFromAcumatica = React.useCallback(async () => {
    if (syncCustomerFromAcumatica.isPending || isSyncDisabled) {
      return;
    }

    setIsSyncDisabled(true);
    syncCooldownTimeoutRef.current = setTimeout(() => {
      setIsSyncDisabled(false);
      syncCooldownTimeoutRef.current = null;
    }, 10000);

    try {
      await syncCustomerFromAcumatica.mutateAsync();
      notifySuccess('Customers synced from Acumatica successfully');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  }, [syncCustomerFromAcumatica, isSyncDisabled]);

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [facetFilters, setFacetFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'customer_name', desc: false },
  ]);

  const apiSortParams = React.useMemo(
    () => toCustomerApiSortParams(sorting),
    [sorting],
  );

  const apiFilterParams = React.useMemo(
    () => toCustomerApiFilterParams(facetFilters),
    [facetFilters],
  );

  const {
    data: customersData,
    isLoading,
    isFetching,
    error,
    isError,
  } = useQuery(
    CustomersListQueryOptions({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ...apiSortParams,
      ...apiFilterParams,
    }),
  );

  const { data: reportingData } = useQuery(CustomerReportingQueryOptions());

  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: infiniteIsFetching,
  } = useInfiniteQuery({
    ...CustomersInfiniteListQueryOptions({
      pageSize: 25,
      search: search.trim() || undefined,
      ...apiFilterParams,
    }),
    enabled: isMobile,
  });

  const mobileItems = React.useMemo(
    () => getCustomerItemsFromInfinitePages(infiniteData?.pages),
    [infiniteData?.pages],
  );

  const customerPage = React.useMemo(
    () => getCustomersPageFromListResponse(customersData),
    [customersData],
  );

  const facetOptions = React.useMemo(
    () =>
      buildCustomerFacetOptions(
        isCustomersListResponse(customersData) ? customersData : null,
      ),
    [customersData],
  );

  const items: CustomerDTO[] = React.useMemo(() => {
    return (customerPage?.content ?? []).map((customer) => ({
      ...customer,
      customerType: customer.customerType as CUSTOMER_TYPE,
      customerStatus: customer.customerStatus as CUSTOMER_STATUS,
    })) as CustomerDTO[];
  }, [customerPage]);

  const totalElements = customerPage?.totalElements ?? items.length;
  const totalPages =
    customerPage?.totalPages ??
    Math.max(1, Math.ceil(totalElements / pageSize));

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
        : [{ id: 'customer_name', desc: false }],
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

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Total Customers',
      value: reportingData?.totalCustomers || 0,
      description: `+${reportingData?.totalCustomersChangePercentThisMonth || 0
        } this month`,
      icon: Users,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Active Customers',
      value: reportingData?.totalActiveCustomers || 0,
      description: `${reportingData?.activeCustomersPercentOfTotal || 0
        }% of total`,
      icon: UserCheck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Active Business Customers',
      value: reportingData?.totalActiveBusinessCustomers || 0,
      description: `${reportingData?.businessCustomerQuotesPercent || 0
        }% requested quotes`,
      icon: Activity,
      iconBgColor: 'bg-[#F3E8FF]',
      iconColor: 'text-[#8E51FF]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Active Individual Customers',
      value: reportingData?.totalActiveIndividualCustomers || 0,
      description: `${reportingData?.individualCustomerQuotesPercent || 0
        }% requested quotes`,
      icon: Building2,
      iconBgColor: 'bg-[#FCE7F3]',
      iconColor: 'text-[#DB2777]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  React.useEffect(() => {
    if (isError && error) {
      console.error('Customer API Error:', error);
      notifyError(extractErrorMessage(error));
    }
  }, [isError, error]);

  const handleRowClick = (customer: CustomerDTO) => {
    actions.view(customer);
  };

  const customerColumns = React.useMemo(
    () => getCustomerColumns(currencyCode),
    [currencyCode],
  );

  const renderCustomerCard = React.useCallback(
    (customer: CustomerDTO) => {
      const formattedStatus = formatCustomerStatus(
        customer.customerStatus as CUSTOMER_STATUS,
      );

      let displayName: string;
      let contactName: string;
      let customerEmail: string;
      if (customer.customerType === CUSTOMER_TYPE.BUSINESS) {

        displayName = customer.businessName ?? '';
        customerEmail = customer.businessEmail ?? '';
        const first = customer.contactPersonFirstName ?? '';
        const last = customer.contactPersonLastName ?? '';
        contactName = `${first} ${last}`.trim() || 'N/A';
      } else {
        displayName = customer.individualContactName ?? '';
        customerEmail = customer.contactPersonEmail ?? '';
        contactName = customer.individualContactName ?? '';
      }

      return (
        <MobileCard
          title={displayName}
          badges={
            <>
              <TableBadges names={[customer.customerType]} visibleCount={1} />
              <TableBadges names={[formattedStatus]} visibleCount={1} />
            </>
          }
          actions={<CustomerTableActions customer={customer} />}
          fields={[
            {
              icon: <User className="h-4 w-4" />,
              label: 'Contact',
              value: contactName,
            },
            {
              icon: <Mail className="h-4 w-4" />,
              label: 'Email',
              value: customerEmail,
            },
            {
              icon: <CreditCard className="h-4 w-4" />,
              label: 'Credit Limit',
              value: formatCentsToCurrency(customer.creditLimit),
            },
            {
              icon: <User className="h-4 w-4" />,
              label: 'Account Manager',
              value: customer.accountManagerName || '-',
            },
          ]}
        />
      );
    },
    [formatCentsToCurrency],
  );

  const facetDefs: FacetDefinition[] = React.useMemo(
    () => [
      {
        column: 'status',
        title: 'Status',
        options: facetOptions.statuses,
      },
      {
        column: 'customer_type',
        title: 'Customer Type',
        options: facetOptions.types,
      },
      {
        column: 'account_manager',
        title: 'Account Manager',
        options: facetOptions.accountManagers,
      },
    ],
    [facetOptions],
  );

  let tableContent: React.ReactNode;
  if (isLoading && !customersData) {
    tableContent = (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  } else if (isError) {
    tableContent = (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-destructive">
          Error loading customers
        </div>
      </div>
    );
  } else {
    tableContent = (
      <DataTableClient
        tableId="customer_main_data_table"
        data={items ?? []}
        columns={customerColumns}
        facetDefinition={facetDefs}
        searchPlaceHolder="Search customers..."
        onRowClick={handleRowClick}
        defaultSorting={[{ id: 'customer_name', desc: false }]}
        mobileCardRenderer={renderCustomerCard}
        mobileInfinite={{
          items: mobileItems,
          hasNextPage,
          isFetchingNextPage,
          isLoading: infiniteIsFetching,
          fetchNextPage,
        }}
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
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Customers</h1>
        </div>
        {readOnly ? (
          <Button
            onClick={handleSyncCustomerFromAcumatica}
            disabled={
              syncCustomerFromAcumatica.isPending || isSyncDisabled
            }
          >
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${syncCustomerFromAcumatica.isPending ? 'animate-spin' : ''}`}
              />
              {syncCustomerFromAcumatica.isPending
                ? 'Syncing'
                : 'Sync Customer'}
            </div>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <FormDialog
              dialogTitle="Add New Customer"
              dialogDescription="Fill in the required fields to add a new customer."
              buttonTitle="Add Customer"
              hideButton={readOnly}
            >
              <CustomerForm />
            </FormDialog>
          </div>
        )}
      </div>

      <StatsCards
        cards={statsCards}
        isLoading={isLoading && !customersData}
        mobileGridCols={1}
        desktopGridCols={4}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {tableContent}
      </div>
    </div>
  );
}
