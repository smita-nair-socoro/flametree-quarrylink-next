'use client';

import React from 'react';
import { Truck, Activity, CircleUser, TriangleAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TrucksListQueryOptions } from '@/lib/api/truck';
import { TruckDTO } from '@/lib/types/truck';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { truckColumns } from './(components)/(data-tables)/truck/columns';
import { FormDialog } from '@/components/form-dialog';
import TruckForm from './(components)/forms/truck-form';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

export default function TrucksPage() {
  const { data: trucks } = useQuery(TrucksListQueryOptions());
  const { actions, confirmDialogs, viewDialog } = useTruckActions();

  const handleRowClick = (truckData: TruckDTO) => {
    actions.view(truckData);
  };

  const statsCards: StatsCardData[] = [
    {
      title: 'Total Trucks',
      value: '7',
      description: '3 combination | 4 single unit',
      icon: Truck,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Trucks on duty',
      value: '2',
      description: '2 out of 7 on duty',
      icon: Activity,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Drivers assigned',
      value: '0',
      description: '7 trucks without a driver',
      icon: CircleUser,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Failed inspections',
      value: '0',
      description: 'Since last week',
      icon: TriangleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const items: TruckDTO[] = React.useMemo(() => {
    return Array.isArray(trucks) ? trucks : [];
  }, [trucks]);

  const facetDefs: FacetDefinition[] = [
    { column: 'truckStatus', title: 'Status' },
    { column: 'truckType', title: 'Truck Type' },
    { column: 'haulierName', title: 'Haulier' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
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

      <StatsCards
        cards={statsCards}
        mobileGridCols={1}
        desktopGridCols={4}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="truck_main_data_table"
          data={items}
          columns={truckColumns}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search trucks..."
          defaultSorting={[{ id: 'licensePlate', desc: false }]}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
