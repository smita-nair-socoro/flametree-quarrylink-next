'use client';

import React from 'react';
import { Plus, UsersRound, UserCheck, Truck, TriangleAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DriversListQueryOptions } from '@/lib/api/driver';
import { UsersListQueryOptions } from '@/lib/api/user';
import { DriverDTO } from '@/lib/types/driver';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { driverColumns } from './(components)/(data-tables)/driver/columns';
import { FormDialog } from '@/components/form-dialog';
import DriverForm from './(components)/forms/driver-form';
import { useDriverActions } from '@/hooks/use-driver-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

export default function DriversPage() {
  const { data: drivers } = useQuery(DriversListQueryOptions());

  // TEMP: Fetch users to resolve driver app invitation sub by email match.
  // Once the backend adds userSub to DriverDTO, remove this query and the
  // emailToSubMap memo, and read userSub directly from the driver row.
  const { data: users } = useQuery(UsersListQueryOptions());

  const emailToSubMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (!users) return map;
    users.forEach((u) => {
      if (u.groups?.includes('driver') && u.email && u.sub) {
        map.set(u.email.toLowerCase(), u.sub);
      }
    });
    return map;
  }, [users]);
  // END TEMP

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

  const statsCards: StatsCardData[] = [
    {
      title: 'Total Drivers',
      value: '3',
      description: '2 Internal | 1 External',
      icon: UsersRound,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Available for Dispatch',
      value: '3',
      description: '0 out of 3 on duty',
      icon: UserCheck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Assigned to Trucks',
      value: '0',
      description: '3 drivers without a truck',
      icon: Truck,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Failed pre-starters',
      value: '0',
      description: 'Since last week',
      icon: TriangleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#737373]',
    },
  ];

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

      <StatsCards
        cards={statsCards}
        mobileGridCols={1}
        desktopGridCols={4}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="driver_main_data_table"
          data={items}
          columns={driverColumns(emailToSubMap)}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search drivers..."
          defaultSorting={[{ id: 'driverName', desc: false }]}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
