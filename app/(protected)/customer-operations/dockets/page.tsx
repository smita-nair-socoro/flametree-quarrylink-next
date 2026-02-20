'use client';

import React from 'react';
// import { FormDialog } from '@/components/form-dialog';
// import JobForm from './(components)/forms/job-form';
import rawJson from '@/lib/tests/docketsResponseData.json';
import { Docket } from '@/lib/types/docket';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { docketColumns } from './(components)/(data-tables)/docket/columns';

export default function DocketsPage() {
  const { items } = rawJson as unknown as {
    items: Docket[];
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'product', title: 'Product', icon: Plus },
    { column: 'customer', title: 'Customer', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Dockets</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* <FormDialog
            dialogTitle="Add New Job"
            dialogDescription="Fill in the required fields to add a new job."
            buttonTitle="Add Job"
          >
            <JobForm />
          </FormDialog> */}
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="docket_main_data_table"
          data={items ?? []}
          columns={docketColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search jobs..."
          defaultSorting={[{ id: 'docketNumber', desc: false }]}
        />
      </div>
    </div>
  );
}
