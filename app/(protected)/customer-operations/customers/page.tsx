'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import CustomerForm from './(components)/forms/customer-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { Customer } from '@/lib/types/customer';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { customerColumns } from './(components)/(data-tables)/customer/columns';
import {
  Plus,
  Users,
  UserCheck,
  Activity,
  Building2,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { useCustomerStore } from '@/app/stores/customer-store';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { TableSkeleton } from '@/components/table-skeleton';
import { useAuth } from '@/hooks/use-auth';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { TenantsListQueryOptions } from '@/lib/api/tenant';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

export default function CustomersPage() {
  const setSelectedCustomer = useCustomerStore(
    (state) => state.setSelectedCustomer
  );
  const [selectedCustomerForActions, setSelectedCustomerForActions] =
    React.useState<Customer | null>(null);

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Total Customers',
      value: 248,
      description: '+12 this month',
      icon: Users,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Active Customers',
      value: 185,
      description: '75% of total',
      icon: UserCheck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Total Business Customers',
      value: 142,
      description: '45% requested quotes',
      icon: Activity,
      iconBgColor: 'bg-[#F3E8FF]',
      iconColor: 'text-[#8E51FF]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Total Individual Customers',
      value: 63,
      description: '45% requested quotes',
      icon: Building2,
      iconBgColor: 'bg-[#FCE7F3]',
      iconColor: 'text-[#DB2777]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const { actions, confirmDialogs, viewDialog } = useCustomerActions(
    selectedCustomerForActions?.id,
    selectedCustomerForActions
  );

  // Role-based feature detection
  const { attributes } = useAuth();
  const userRole =
    attributes?.['custom:role'] || attributes?.role || 'Essentials';
  const isEssentials = userRole === 'Essentials';

  // Filter columns based on user role
  const filteredColumns = React.useMemo(() => {
    if (isEssentials) {
      // Hide remaining_credit column for Essentials users
      return customerColumns.filter(
        (column) => column.id !== 'remaining_credit'
      );
    }
    return customerColumns;
  }, [isEssentials]);

  // Use React Query to fetch customers data
  const {
    data: customersData,
    isLoading,
    isFetching,
    error,
    isError,
  } = useQuery(CustomersListQueryOptions());

  console.log('customersData', customersData);

  const { data: tenants } = useQuery(TenantsListQueryOptions());
  console.log('tenants', tenants);

  React.useEffect(() => {
    if (isError && error) {
      console.error('Customer API Error:', error);
    }
  }, [isError, error]);

  // Handle row click to open customer details
  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedCustomerForActions(customer);
    actions.view();
  };

  // Transform the API data to match our component expectations
  const items: Customer[] =
    customersData?.map((customer) => {
      // Convert API response to snake_case if needed
      const convertedCustomer = convertKeysToSnakeCase(customer);

      return {
        ...convertedCustomer,
        customer_type: convertedCustomer.customer_type as CUSTOMER_TYPE,
        customer_status: convertedCustomer.customer_status as CUSTOMER_STATUS,
      };
    }) || [];

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'customer_type', title: 'Customer Type', icon: Plus },
    { column: 'account_manager', title: 'Account Manager', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Customers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Customer"
            dialogDescription="Fill in the required fields to add a new customer."
            buttonTitle="Add Customer"
          >
            <CustomerForm />
          </FormDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        cards={statsCards}
        isLoading={isLoading}
        mobileGridCols={1}
        desktopGridCols={4}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {isLoading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-destructive">
              Error loading customers
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Subtle loading indicator during background refresh */}
            {isFetching && !isLoading && (
              <div className="absolute top-2 right-2 z-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <DataTableClient
              tableId="customer_main_data_table"
              data={items ?? []}
              columns={filteredColumns}
              facetDefination={facetDefs}
              searchPlaceHolder="Search customers..."
              onRowClick={handleRowClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
