'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { TruckDTO } from '@/lib/types/truck';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { truckColumns } from './(components)/(data-tables)/truck/columns';
import rawJson from '@/lib/tests/trucksResponseData.json';
import { FormDialog } from '@/components/form-dialog';
import TruckForm from './(components)/forms/truck-form';

export default function TrucksPage() {
  const items: TruckDTO[] = React.useMemo(() => {
    return (rawJson.items as TruckDTO[]) ?? [];
  }, []);

  const facetDefs: FacetDefinition[] = [
    { column: 'truckStatus', title: 'Status', icon: Plus },
    { column: 'truckType', title: 'Truck Type', icon: Plus },
    { column: 'haulierName', title: 'Haulier', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Trucks</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Truck"
            dialogDescription="Fill in the required fields to add a new truck."
            buttonTitle="Add Truck"
          >
            <TruckForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="truck_main_data_table"
          data={items}
          columns={truckColumns}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search trucks..."
          defaultSorting={[{ id: 'licensePlate', desc: false }]}
        />
      </div>
    </div>
  );
}
