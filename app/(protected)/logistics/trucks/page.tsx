'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Truck, Activity, CircleUser, TriangleAlert, Building2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { TrucksListQueryOptions, TruckStatisticsQueryOptions } from '@/lib/api/truck';
import { TruckDTO } from '@/lib/types/truck';
import { normalizeTruckStatus } from '@/lib/types/truck-enums';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { truckColumns } from './(components)/(data-tables)/truck/columns';
import { TruckTableActions } from './(components)/(data-tables)/truck/truck-table-actions';
import { FormDialog } from '@/components/form-dialog';
import TruckForm from './(components)/forms/truck-form';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { formatNumberThousandSeparator } from '@/lib/utils/number';

export default function TrucksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: trucks } = useQuery(TrucksListQueryOptions());
  const { data: statistics } = useQuery(TruckStatisticsQueryOptions());
  const { actions, confirmDialogs, viewDialog } = useTruckActions();

  const handleRowClick = (truckData: TruckDTO) => {
    actions.view(truckData);
  };

  const statsCards: StatsCardData[] = [
    {
      title: 'Total Trucks',
      value: statistics?.totalTrucks ?? 0,
      description: `${statistics?.combinationTrucks ?? 0} combination | ${statistics?.singleUnitTrucks ?? 0} single unit`,
      icon: Truck,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Trucks on duty',
      value: statistics?.trucksOnDuty ?? 0,
      description: `${statistics?.trucksOnDuty ?? 0} out of ${statistics?.totalTrucks ?? 0} on duty`,
      icon: Activity,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Drivers assigned',
      value: statistics?.trucksWithDrivers ?? 0,
      description: `${statistics?.trucksWithoutDrivers ?? 0} trucks without a driver`,
      icon: CircleUser,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Failed inspections',
      value: statistics?.failedInspectionsLast7Days ?? 0,
      description: 'Since last week',
      icon: TriangleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const haulierId = searchParams.get('haulierId');

  const items: TruckDTO[] = React.useMemo(() => {
    const all = Array.isArray(trucks) ? trucks : [];
    return haulierId ? all.filter((t) => t.haulier?.id === Number(haulierId)) : all;
  }, [trucks, haulierId]);

  // Auto-open truck view when navigated from inspection failed email link
  React.useEffect(() => {
    const openTruckId = searchParams.get('openTruckId');
    const section = searchParams.get('section');
    if (!openTruckId || items.length === 0) return;

    const truck = items.find((t) => t.id === Number(openTruckId));
    if (truck) {
      actions.view(truck, { scrollToSection: section ?? undefined });
    }
    router.replace('/logistics/trucks');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, items]);

  const renderTruckCard = React.useCallback((truck: TruckDTO) => {
    const isGeneric = truck.model === 'GENERIC';
    const truckType = isGeneric ? 'GENERIC' : truck.truckType;
    const status = normalizeTruckStatus(truck.truckStatus);
    return (
      <MobileCard
        title={isGeneric ? '--' : (truck.licensePlate || '-')}
        badges={
          <>
            <TableBadges names={[truckType]} visibleCount={1} />
            <TableBadges names={status ? [status as string] : [truck.truckStatus as string]} visibleCount={1} />
          </>
        }
        actions={<TruckTableActions truck={truck} />}
        fields={[
          { icon: <Truck className="h-4 w-4" />, label: 'Make & Model', value: isGeneric ? '--' : (truck.model || '-') },
          { icon: <Building2 className="h-4 w-4" />, label: 'Haulier', value: truck.haulier?.haulierName || '-' },
          { icon: <Package className="h-4 w-4" />, label: 'Volume', value: truck.tankVolumeM3 != null ? `${truck.tankVolumeM3} m³` : '-' },
          { icon: <Activity className="h-4 w-4" />, label: 'GVM', value: truck.combinationGvm != null ? `${formatNumberThousandSeparator(truck.combinationGvm)} TN` : '-' },
        ]}
      />
    );
  }, []);

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

      {haulierId && (
        <div className="flex flex-row items-center gap-5 mb-3">
          <div className="mt-1 text-sm text-muted-foreground">
            <span>
              Showing{' '}
              {items.length === 1 ? '1 truck' : `${items.length} trucks`} for
              this haulier
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/logistics/trucks')}
          >
            Reset Filter
          </Button>
        </div>
      )}

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          key={haulierId ? `truck_haulier_${haulierId}` : 'truck_main_data_table'}
          tableId="truck_main_data_table"
          data={items}
          columns={truckColumns}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search trucks..."
          defaultSorting={[{ id: 'licensePlate', desc: false }]}
          onRowClick={handleRowClick}
          mobileCardRenderer={renderTruckCard}
        />
      </div>
    </div>
  );
}
