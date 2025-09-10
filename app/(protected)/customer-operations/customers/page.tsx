'use client';

import { FormDialog } from '@/components/form-dialog';
import CustomerForm from './(components)/forms/customer-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/customerResponseData.json';
import { CustomerDetails } from '@/lib/types/customer';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { customerColumns } from './(components)/(data-tables)/customer/columns';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

export default function CustomersPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items: rawItems } = convertedJson as unknown as {
    items: Array<
      Omit<CustomerDetails, 'customerType' | 'customerStatus'> & {
        customerType: string;
        customerStatus: string;
      }
    >;
  };

  const items: CustomerDetails[] = rawItems.map((item) => ({
    ...item,
    customerType: item.customerType as CUSTOMER_TYPE,
    customerStatus: item.customerStatus as CUSTOMER_STATUS,
  }));

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'customer_type', title: 'Customer Type', icon: Plus },
    { column: 'account_manager', title: 'Account Manager', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
        <DataTableClient
          tableId="customer_main_data_table"
          data={items ?? []}
          columns={customerColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search customers..."
        />
      </div>
    </div>
  );
}
