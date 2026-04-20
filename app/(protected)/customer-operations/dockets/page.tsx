'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormDialog } from '@/components/form-dialog';
import { Package, FileText, Plus, Wallet, CircleAlert } from 'lucide-react';
import DocketForm from './(components)/forms/docket-form';

import { useQuery } from '@tanstack/react-query';
import {
  DocketsByJobIdQueryOptions,
  DocketsListQueryOptions,
} from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { Button } from '@/components/ui/button';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { docketColumns } from './(components)/(data-tables)/docket/columns';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

export default function DocketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedJobIdParam = searchParams.get('linkedJobId');
  const linkedJobNumberParam = searchParams.get('linkedJobNumber');

  const linkedJobId = React.useMemo(() => {
    const parsed = Number(linkedJobIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [linkedJobIdParam]);

  const {
    data: allDockets,
    isLoading: isAllDocketsLoading,
    error: allDocketsError,
    isError: isAllDocketsError,
  } = useQuery({
    ...DocketsListQueryOptions(),
    enabled: !linkedJobId,
  });

  const {
    data: linkedDockets,
    isLoading: isLinkedDocketsLoading,
    error: linkedDocketsError,
    isError: isLinkedDocketsError,
  } = useQuery({
    ...DocketsByJobIdQueryOptions(linkedJobId ?? 0),
    enabled: !!linkedJobId,
  });

  const dockets = linkedJobId ? linkedDockets : allDockets;
  const isLoading = linkedJobId ? isLinkedDocketsLoading : isAllDocketsLoading;
  const isError = linkedJobId ? isLinkedDocketsError : isAllDocketsError;
  const error = linkedJobId ? linkedDocketsError : allDocketsError;

  const items: DocketDTO[] = React.useMemo(() => {
    const list: DocketDTO[] = Array.isArray(dockets)
      ? dockets
      : (dockets?.content ?? []);
    return list.map((docket) => ({
      ...docket,
    })) as DocketDTO[];
  }, [dockets]);

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Scheduled Dockets Today',
      value: '15',
      description: '12 Delivery | 3 Collection',
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Unassigned Dockets',
      title2: '(Next 7 Days)',
      value: '3',
      description: 'Need attention',
      icon: CircleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
    {
      title: 'Value of Uninvoiced Dockets',
      value: '$1,043,570',
      description: '12 Delivery | 10 Collection',
      icon: Wallet,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Quantity Scheduled Today',
      title2: '(Tonnes)',
      value: '342.5',
      description: 'Across 24 dockets',
      icon: Package,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const docketIdsParam = searchParams.get('docketId');
  const docketIdsSet = React.useMemo(() => {
    if (!docketIdsParam) return null;
    const ids = docketIdsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return new Set(ids);
  }, [docketIdsParam]);

  const filteredItems = React.useMemo(() => {
    if (!docketIdsSet) return items;
    return items.filter((d) => docketIdsSet.has(d.id));
  }, [items, docketIdsSet]);

  const { actions, viewDialog, confirmDialogs } = useDocketActions();

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'product', title: 'Product', icon: Plus },
    { column: 'customer', title: 'Customer', icon: Plus },
    { column: 'docketType', title: 'Type', icon: Plus },
  ];

  const handleRowClick = (row: DocketDTO) => {
    actions.view(row);
  };

  React.useEffect(() => {
    if (isError && error) {
      console.error('Docket API Error:', error);
    }
  }, [isError, error]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
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

      {/* Statistics Cards */}
      <StatsCards cards={statsCards} mobileGridCols={1} desktopGridCols={4} />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading dockets...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Error loading dockets</div>
          </div>
        ) : (
          <>
            {(linkedJobId || docketIdsSet) && (
              <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
                <div className="mt-1 text-sm text-muted-foreground">
                  {docketIdsSet ? (
                    <>
                      <span>Showing a selected docket</span>
                    </>
                  ) : linkedJobNumberParam ? (
                    <>
                      <span>Showing dockets</span>
                      <span>{' for '}</span>
                      <span className="font-semibold text-foreground">
                        {linkedJobNumberParam}
                      </span>
                    </>
                  ) : (
                    <span>{` for job #${linkedJobId}`}</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/customer-operations/dockets')}
                >
                  Reset Filter
                </Button>
              </div>
            )}
            <DataTableClient
              tableId={
                docketIdsSet
                  ? `docket_filtered_${Array.from(docketIdsSet).join('_')}`
                  : linkedJobId
                    ? `docket_linked_${linkedJobId}`
                    : 'docket_main_data_table'
              }
              data={filteredItems ?? []}
              columns={docketColumns}
              facetDefinition={facetDefs}
              searchPlaceHolder="Search dockets..."
              onRowClick={handleRowClick}
              defaultSorting={[{ id: 'docketNumber', desc: false }]}
            />
          </>
        )}
      </div>
    </div>
  );
}
