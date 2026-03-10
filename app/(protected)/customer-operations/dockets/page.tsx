'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { Plus } from 'lucide-react';
import DocketForm from './(components)/forms/docket-form';

import { useQuery } from '@tanstack/react-query';
import { DocketsListQueryOptions } from '@/lib/api/docket';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { docketColumns } from './(components)/(data-tables)/docket/columns';

export default function DocketsPage() {
  const { data: dockets } = useQuery(DocketsListQueryOptions());

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
          <FormDialog
            dialogTitle="Add New Docket"
            dialogDescription="Fill in the required fields to add a new docket."
            buttonTitle="Add Docket"
          >
            <DocketForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="docket_main_data_table"
          data={dockets ?? []}
          columns={docketColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search dockets..."
          defaultSorting={[{ id: 'docketNumber', desc: false }]}
        />
      </div>
    </div>
  );
}
