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
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { useCustomerStore } from '@/app/stores/customer-store';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { Card, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

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
  const statsCards = [
    {
      title: 'Total Customers',
      value: 248,
      description: '+12 this month',
      icon: Users,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Active Customers',
      value: 185,
      description: '75% of total',
      icon: UserCheck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Total Business Customers',
      value: 142,
      description: '45% requested quotes',
      icon: Activity,
      iconBgColor: 'bg-[#F3E8FF]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Total Individual Customers',
      value: 63,
      description: '45% requested quotes',
      icon: Briefcase,
      iconBgColor: 'bg-[#FCE7F3]',
      iconColor: 'text-[#0A0A0AB2]',
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading
          ? // Skeleton loading state for cards
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-5">
                <CardContent className="p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-[140px]" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-[100px] mt-4" />
                  <Skeleton className="h-3 w-[120px] mt-2" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="p-5">
                  <CardContent className="p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#737373] font-medium">
                        {card.title}
                      </span>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${card.iconBgColor}`}
                      >
                        <Icon
                          className={`h-5 w-5 opacity-70 ${card.iconColor}`}
                        />
                      </div>
                    </div>
                    <div className="text-3xl font-bold pt-2">{card.value}</div>
                    <div
                      className={`text-sm font-normal ${card.descriptionColor}`}
                    >
                      {card.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

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
