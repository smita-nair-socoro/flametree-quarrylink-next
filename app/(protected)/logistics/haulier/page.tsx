'use client';

import React from 'react';
import { Building2, Truck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { HauliersListQueryOptions } from '@/lib/api/haulier';
import { TrucksListQueryOptions } from '@/lib/api/truck';
import { DriversListQueryOptions } from '@/lib/api/driver';
import { HaulierDTO } from '@/lib/types/haulier';
import { DataTableClient } from '@/components/ui/data-table-client';
import { haulierColumns } from './(components)/(data-tables)/haulier/columns';
import { FormDialog } from '@/components/form-dialog';
import HaulierForm from './(components)/forms/haulier-form';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useClientStore } from '@/app/stores/client-store';

export default function HaulierPage() {
  const businessName = useClientStore((state) => state.businessName);
  const { data: hauliers } = useQuery(HauliersListQueryOptions());
  const { data: trucks } = useQuery(TrucksListQueryOptions());
  const { data: drivers } = useQuery(DriversListQueryOptions());

  const items: HaulierDTO[] = React.useMemo(
    () => (Array.isArray(hauliers) ? hauliers : []),
    [hauliers],
  );

  const trucksManaged = React.useMemo(
    () => (Array.isArray(trucks) ? trucks.filter((t) => t.haulierId).length : 0),
    [trucks],
  );

  const driversManaged = React.useMemo(
    () => (Array.isArray(drivers) ? drivers.filter((d) => d.haulierId).length : 0),
    [drivers],
  );

  const statsCards: StatsCardData[] = [
    {
      title: 'Total Hauliers',
      value: items.length,
      description: 'External haulage companies',
      icon: Building2,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Trucks Managed',
      value: trucksManaged,
      description: 'Across all hauliers',
      icon: Truck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Drivers Managed',
      value: driversManaged,
      description: 'Across all hauliers',
      icon: Users,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Hauliers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Haulier"
            dialogDescription="Fill in the required fields to add a new haulier."
            buttonTitle="Add Haulier"
          >
            <HaulierForm />
          </FormDialog>
        </div>
      </div>

      <StatsCards cards={statsCards} mobileGridCols={1} desktopGridCols={3} />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="haulier_main_data_table"
          data={items}
          columns={haulierColumns(businessName)}
          searchPlaceHolder="Search hauliers..."
          defaultSorting={[{ id: 'haulierName', desc: false }]}
        />
      </div>
    </div>
  );
}
