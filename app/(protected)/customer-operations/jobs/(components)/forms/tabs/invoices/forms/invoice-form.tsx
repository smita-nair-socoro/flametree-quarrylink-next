'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocketDTO } from '@/lib/types/docket';
import { DocketsByJobIdQueryOptions, getDocketItemsFromListResponse } from '@/lib/api/docket';
import { DataTableClient } from '@/components/ui/data-table-client';
// import { Spinner } from '@/components/ui/spinner';
import { getCreateInvoiceColumns } from '../(data-tables)/create-invoice-columns';
import { Truck, PackageOpen } from 'lucide-react';
import { Tab } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { InvoiceActions } from '../../../invoice-actions';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import {
  isCashSaleEligible,
  isInvoiceEligible,
} from '@/lib/utils/docket-financial-eligibility';

interface FormProps {
  jobId: number;
}

export default function InvoiceForm({
  jobId,
}: FormProps) {

  const { currencyCode, taxLabel } = useTenantCurrencyTax();
  const [activeTab, setActiveTab] = React.useState<'all' | 'delivery' | 'collection'>('all');

  const { data: docketPage } = useQuery(DocketsByJobIdQueryOptions(jobId));

  const docketList = React.useMemo(
    () => getDocketItemsFromListResponse(docketPage),
    [docketPage],
  );

  // Show dockets eligible for invoice and/or cash sale so each action can enable independently.
  const selectableDockets = React.useMemo(
    () =>
      docketList.filter(
        (docket) => isInvoiceEligible(docket) || isCashSaleEligible(docket),
      ),
    [docketList],
  );

  const items: DocketDTO[] = React.useMemo(() => {
    return selectableDockets
      .filter((docket) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'delivery') return docket.jobItem?.jobItemType === 'DELIVERY';
        if (activeTab === 'collection') return docket.jobItem?.jobItemType === 'COLLECTION';
        return true;
      })
      .map((docket) => ({
        ...docket,
      })) as DocketDTO[];
  }, [selectableDockets, activeTab]);

  const allCount = selectableDockets.length;

  const deliveryCount = React.useMemo(
    () =>
      selectableDockets.filter(
        (d) => d.jobItem?.jobItemType === 'DELIVERY',
      ).length,
    [selectableDockets],
  );

  const collectionCount = React.useMemo(
    () =>
      selectableDockets.filter(
        (d) => d.jobItem?.jobItemType === 'COLLECTION',
      ).length,
    [selectableDockets],
  );


  const [selectedDockets, setSelectedDockets] = React.useState<DocketDTO[]>([]);

  const handlRowSelectionChange = (selected: DocketDTO[]) => {
    setSelectedDockets(selected);
  };

  const handleClearSelection = () => {
    setSelectedDockets([]);
  };

  return (
    <div className="w-full relative">
      {/* {isSubmitting && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center pt-10">
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              Creating Invoice...
            </p>
          </div>
        </div>
      )} */}

      {/* Tabs */}
      <Tab
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as 'all' | 'delivery' | 'collection');
          setSelectedDockets([]);
        }}
        tabsClassName="w-fit mb-4 bg-gray-50/50 p-1 rounded-xl border border-gray-100"
        tabsTriggerClassName="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200/60 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg"
        tabs={[
          {
            name: 'All Dockets',
            value: 'all',
            rightElement: (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium',
                  activeTab === 'all'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-200/50 text-gray-500'
                )}
              >
                {allCount}
              </span>
            ),
            content: null,
          },
          {
            name: 'Delivery Dockets',
            value: 'delivery',
            icon: <Truck className="h-4 w-4" />,
            rightElement: (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium',
                  activeTab === 'delivery'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-200/50 text-gray-500'
                )}
              >
                {deliveryCount}
              </span>
            ),
            content: null,
          },
          {
            name: 'Collection Dockets',
            value: 'collection',
            icon: <PackageOpen className="h-4 w-4" />,
            rightElement: (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium',
                  activeTab === 'collection'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-200/50 text-gray-500'
                )}
              >
                {collectionCount}
              </span>
            ),
            content: null,
          },
        ]}
      />

      <DataTableClient
        isShowHideColumns={false}
        key={activeTab}
        columns={getCreateInvoiceColumns(currencyCode, taxLabel)}
        data={items}
        searchPlaceHolder="Search dockets by keyword…"
        defaultSorting={[{ id: 'docketNumber', desc: false }]}
        enableRowSelection={true}
        onRowSelectionChange={handlRowSelectionChange}
        bulkActionsSlot={
          <InvoiceActions
            selectedDockets={selectedDockets}
            onClearSelection={handleClearSelection}
          />
        }
      />
      {allCount === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">
          No eligible dockets on this job. Collection dockets must be Collected
          and delivery dockets must be Delivered, and not already invoiced or
          cash sold.
        </p>
      ) : null}
    </div>
  );
}
