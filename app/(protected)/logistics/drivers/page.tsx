'use client';

import React from 'react';
import { Driver } from '@/lib/types/driver';
import rawJson from '@/lib/tests/driversResponseData.json';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { driverColumns } from './(components)/(data-tables)/driver/columns';
import { FormDialog } from '@/components/form-dialog';
import DriverForm from './(components)/forms/driver-form';

export default function CustomersPage() {
  const { items } = rawJson as unknown as {
    items: Driver[];
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'type', title: 'Driuver Type', icon: Plus },
    { column: 'haulier', title: 'Haulier', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Drivers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Driver"
            dialogDescription="Fill in the required fields to add a new driver."
            buttonTitle="Add Driver"
          >
            <DriverForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="driver_main_data_table"
          data={items ?? []}
          columns={driverColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search drivers..."
          defaultSorting={[{ id: 'name', desc: false }]}
        />
      </div>
    </div>
  );
}
