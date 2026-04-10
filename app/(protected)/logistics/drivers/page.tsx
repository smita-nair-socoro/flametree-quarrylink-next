'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DriversListQueryOptions } from '@/lib/api/driver';
import { DriverDTO } from '@/lib/types/driver';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { driverColumns } from './(components)/(data-tables)/driver/columns';
import { FormDialog } from '@/components/form-dialog';
import DriverForm from './(components)/forms/driver-form';
import { useDriverActions } from '@/hooks/use-driver-actions';

export default function DriversPage() {
  const { data: drivers } = useQuery(DriversListQueryOptions());

  const items: DriverDTO[] = React.useMemo(() => {
    return Array.isArray(drivers) ? drivers : [];
  }, [drivers]);

  const facetDefs: FacetDefinition[] = [
    { column: 'driverStatus', title: 'Status', icon: Plus },
    { column: 'driverType', title: 'Driver Type', icon: Plus },
    { column: 'haulier', title: 'Haulier', icon: Plus },
  ];

  const { actions, confirmDialogs, viewDialog } = useDriverActions();

  const handleRowClick = (driverData: DriverDTO) => {
    actions.view(driverData);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
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
          data={items}
          columns={driverColumns}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search drivers..."
          defaultSorting={[{ id: 'driverName', desc: false }]}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
