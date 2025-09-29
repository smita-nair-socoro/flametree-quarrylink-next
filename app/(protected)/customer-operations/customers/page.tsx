'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import CustomerForm from './(components)/forms/customer-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { Customer } from '@/lib/types/customer';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { customerColumns } from './(components)/(data-tables)/customer/columns';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { useCustomerStore } from '@/app/stores/customer-store';
import { useCustomerActions } from '@/hooks/use-customer-actions';

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

  const { actions, confirmDialogs, viewDialog } = useCustomerActions(
    selectedCustomerForActions?.id,
    selectedCustomerForActions
  );

  // Use React Query to fetch customers data
  const {
    data: customersData,
    isLoading,
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

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading customers...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Error loading customers</div>
          </div>
        ) : (
          <DataTableClient
            tableId="customer_main_data_table"
            data={items ?? []}
            columns={customerColumns}
            facetDefination={facetDefs}
            searchPlaceHolder="Search customers..."
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>
  );
}
