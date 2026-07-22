'use client';

import React from 'react';
import { Building2, Truck, Users, Mail, Phone } from 'lucide-react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  HauliersListQueryOptions,
  HaulierStatisticsQueryOptions,
  HauliersInfiniteListQueryOptions,
  getHaulierItemsFromInfinitePages,
  toHaulierApiSortParams,
  getHaulierItemsFromListResponse,
} from '@/lib/api/haulier';
import { useIsMobile } from '@/hooks/use-mobile';
import { HaulierDTO } from '@/lib/types/haulier';
import { DataTableClient } from '@/components/ui/data-table-client';
import { haulierColumns } from './(components)/(data-tables)/haulier/columns';
import { HaulierTableActions } from './(components)/(data-tables)/haulier/haulier-table-actions';
import { FormDialog } from '@/components/form-dialog';
import HaulierForm from './(components)/forms/haulier-form';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useTenantStore } from '@/app/stores/tenant-store';
import { useHaulierActions } from '@/hooks/use-haulier-actions';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils/phone-helper';
import type { SortingState } from '@tanstack/react-table';

export default function HaulierPage() {
  const tenantEmail = useTenantStore((state) => state.tenantEmail);
  const { actions, viewDialog } = useHaulierActions();
  const handleRowClick = (haulier: HaulierDTO) => actions.view(haulier);

  const { data: statistics } = useQuery(HaulierStatisticsQueryOptions());

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'haulierName', desc: false },
  ]);

  const apiSortParams = React.useMemo(
    () => toHaulierApiSortParams(sorting),
    [sorting],
  );

  const {
    data: hauliersData,
    isFetching,
  } = useQuery(
    HauliersListQueryOptions({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ...apiSortParams,
    }),
  );

  const items: HaulierDTO[] = React.useMemo(
    () => getHaulierItemsFromListResponse(hauliersData),
    [hauliersData],
  );

  const totalElements = hauliersData?.totalElements ?? items.length;
  const totalPages =
    hauliersData?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPageIndex(0);
  }, []);

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(
      newSorting.length > 0 ? newSorting : [{ id: 'haulierName', desc: false }],
    );
    setPageIndex(0);
  }, []);

  const handlePaginationChange = React.useCallback(
    (newPage: number, newSize: number) => {
      setPageIndex(newPage);
      setPageSize(newSize);
    },
    [],
  );

  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: infiniteIsFetching,
  } = useInfiniteQuery({
    ...HauliersInfiniteListQueryOptions({
      pageSize: 25,
      search: search.trim() || undefined,
    }),
    enabled: isMobile,
  });

  const mobileItems = React.useMemo(
    () => getHaulierItemsFromInfinitePages(infiniteData?.pages),
    [infiniteData?.pages],
  );

  const renderHaulierCard = React.useCallback(
    (haulier: HaulierDTO) => {
      const haulierType = isInternalHaulier(haulier.emailAddress, tenantEmail)
        ? 'INTERNAL'
        : 'SUBCONTRACTOR';
      return (
        <MobileCard
          title={haulier.haulierName || '-'}
          badges={<TableBadges names={[haulierType]} visibleCount={1} />}
          actions={<HaulierTableActions haulier={haulier} />}
          fields={[
            { icon: <Mail className="h-4 w-4" />, label: 'Email', value: haulier.emailAddress || '-' },
            { icon: <Phone className="h-4 w-4" />, label: 'Phone', value: formatPhoneNumber(normalizePhoneNumber(haulier.phoneNumber)) || '-' },
          ]}
        />
      );
    },
    [tenantEmail],
  );

  const statsCards: StatsCardData[] = [
    {
      title: 'Total Hauliers',
      value: statistics?.totalHauliers ?? totalElements,
      description: 'External haulage companies',
      icon: Building2,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Trucks Managed',
      value: statistics?.trucksManaged ?? 0,
      description: 'Across all hauliers',
      icon: Truck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Drivers Managed',
      value: statistics?.driversManaged ?? 0,
      description: 'Across all hauliers',
      icon: Users,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {viewDialog}
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
          columns={haulierColumns(tenantEmail)}
          onRowClick={handleRowClick}
          mobileCardRenderer={renderHaulierCard}
          mobileInfiniteItems={mobileItems}
          mobileHasNextPage={hasNextPage}
          mobileIsFetchingNextPage={isFetchingNextPage}
          mobileIsLoading={infiniteIsFetching}
          onFetchNextPage={fetchNextPage}
          searchPlaceHolder="Search hauliers..."
          defaultSorting={[{ id: 'haulierName', desc: false }]}
          totalElements={totalElements}
          totalPages={totalPages}
          externalPageIndex={pageIndex}
          externalPageSize={pageSize}
          externalSorting={sorting}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          onSortingChange={handleSortingChange}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
