'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  UsersRound,
  UserCheck,
  Truck,
  TriangleAlert,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import {
  DriversListQueryOptions,
  DriverStatisticsQueryOptions,
} from '@/lib/api/driver';
import { UsersListQueryOptions } from '@/lib/api/user';
import { DriverDTO } from '@/lib/types/driver';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { driverColumns } from './(components)/(data-tables)/driver/columns';
import { DriverTableActions } from './(components)/(data-tables)/driver/driver-table-actions';
import { FormDialog } from '@/components/form-dialog';
import DriverForm from './(components)/forms/driver-form';
import { useDriverActions } from '@/hooks/use-driver-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import {
  formatPhoneNumber,
  normalizePhoneNumber,
} from '@/lib/utils/phone-helper';

export default function DriversPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: drivers } = useQuery(DriversListQueryOptions());
  const { data: statistics } = useQuery(DriverStatisticsQueryOptions());

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

  const haulierId = searchParams.get('haulierId');

  const items: DriverDTO[] = React.useMemo(() => {
    const all = Array.isArray(drivers) ? drivers : [];
    return haulierId
      ? all.filter((d) => d.haulier?.id === Number(haulierId))
      : all;
  }, [drivers, haulierId]);

  const facetDefs: FacetDefinition[] = [
    { column: 'driverStatus', title: 'Status' },
    { column: 'driverType', title: 'Driver Type' },
    { column: 'haulier', title: 'Haulier' },
  ];

  const { actions, confirmDialogs, viewDialog } = useDriverActions();

  // Auto-open driver view when navigated from checklist failed email link
  React.useEffect(() => {
    const openDriverId = searchParams.get('openDriverId');
    const section = searchParams.get('section');
    if (!openDriverId || items.length === 0) return;

    const driver = items.find((d) => d.id === Number(openDriverId));
    if (driver) {
      actions.view(driver, { scrollToSection: section ?? undefined });
    }
    router.replace('/logistics/drivers');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, items]);

  const handleRowClick = (driverData: DriverDTO) => {
    actions.view(driverData);
  };

  const renderDriverCard = React.useCallback(
    (driver: DriverDTO) => {
      const userSub = emailToSubMap.get(
        driver.emailAddress?.toLowerCase() ?? '',
      );
      return (
        <MobileCard
          title={driver.driverName || '-'}
          badges={
            <>
              <TableBadges
                names={[driver.driverType as string]}
                visibleCount={1}
              />
              <TableBadges
                names={[driver.driverStatus as string]}
                visibleCount={1}
              />
            </>
          }
          actions={<DriverTableActions driver={driver} userSub={userSub} />}
          fields={[
            {
              icon: <Building2 className="h-4 w-4" />,
              label: 'Haulier',
              value: driver.haulier?.haulierName || '-',
            },
            {
              icon: <Mail className="h-4 w-4" />,
              label: 'Email',
              value: driver.emailAddress || '-',
            },
            //need to update formatPhoneNumber for international numbers, currently it only works for AU numbers
            {
              icon: <Phone className="h-4 w-4" />,
              label: 'Phone',
              value: formatPhoneNumber(driver.phoneNumber) || '-',
            },
          ]}
        />
      );
    },
    [emailToSubMap],
  );

  const statsCards: StatsCardData[] = [
    {
      title: 'Total Drivers',
      value: statistics?.totalDrivers ?? 0,
      description: `${statistics?.internalDrivers ?? 0} Internal | ${statistics?.externalDrivers ?? 0} External`,
      icon: UsersRound,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Available for Dispatch',
      value: statistics?.driversAvailableForDispatch ?? 0,
      description: `${statistics?.driversOnDuty ?? 0} out of ${statistics?.totalDrivers ?? 0} on duty`,
      icon: UserCheck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Assigned to Trucks',
      value: statistics?.driversAssignedToTrucks ?? 0,
      description: `${statistics?.driversWithoutTrucks ?? 0} drivers without a truck`,
      icon: Truck,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Failed pre-starters',
      value: statistics?.failedPrestartsLast7Days ?? 0,
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

      <StatsCards cards={statsCards} mobileGridCols={1} desktopGridCols={4} />

      {haulierId && (
        <div className="flex flex-row items-center gap-5 mb-3">
          <div className="mt-1 text-sm text-muted-foreground">
            <span>
              Showing{' '}
              {items.length === 1 ? '1 driver' : `${items.length} drivers`} for
              this haulier
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/logistics/drivers')}
          >
            Reset Filter
          </Button>
        </div>
      )}

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          key={
            haulierId ? `driver_haulier_${haulierId}` : 'driver_main_data_table'
          }
          tableId="driver_main_data_table"
          data={items}
          columns={driverColumns(emailToSubMap)}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search drivers..."
          defaultSorting={[{ id: 'driverName', desc: false }]}
          onRowClick={handleRowClick}
          mobileCardRenderer={renderDriverCard}
        />
      </div>
    </div>
  );
}
