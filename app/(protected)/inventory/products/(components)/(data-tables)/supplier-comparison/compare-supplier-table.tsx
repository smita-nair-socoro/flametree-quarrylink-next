'use client';

import React from 'react';
import { QuarriesWithProduct } from '@/lib/types/quarry';
import { Tab } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CompareDataTable } from './compare-data-table-client';
import { MobileScrollableTabs } from '@/components/mobile/mobile-scrollable-tabs';
import {
  computePricingMeta,
  createPricingColumns,
  MobilePricingList,
} from './pricing-columns';
import { createTruckRateColumns, MobileTruckRateList } from './truck-rate-columns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompareSupplierTableProps {
  data: QuarriesWithProduct[];
  productName?: string;
}

const TAB_NAMES = [
  'TN Pricing',
  'm³ Pricing',
  '20kg Pricing',
  'Bulka Pricing',
  'Truck Rates',
] as const;

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CompareSupplierTable({
  data,
  productName,
}: CompareSupplierTableProps) {
  const [activeTab, setActiveTab] = React.useState<string>('TN Pricing');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const tnMeta = React.useMemo(() => computePricingMeta(data, 'tn'), [data]);
  const m3Meta = React.useMemo(() => computePricingMeta(data, 'm3'), [data]);
  const kgMeta = React.useMemo(() => computePricingMeta(data, 'kg'), [data]);
  const bulkaMeta = React.useMemo(
    () => computePricingMeta(data, 'bulka'),
    [data],
  );

  const lowestTn = React.useMemo(() => {
    const rates = data.map((r) => r.tnTruckRate).filter((v) => v > 0);
    return rates.length ? Math.min(...rates) : null;
  }, [data]);

  const tnColumns = React.useMemo(
    () => createPricingColumns('tn', tnMeta),
    [tnMeta],
  );
  const m3Columns = React.useMemo(
    () => createPricingColumns('m3', m3Meta),
    [m3Meta],
  );
  const kgColumns = React.useMemo(
    () => createPricingColumns('kg', kgMeta),
    [kgMeta],
  );
  const bulkaColumns = React.useMemo(
    () => createPricingColumns('bulka', bulkaMeta),
    [bulkaMeta],
  );
  const truckColumns = React.useMemo(
    () => createTruckRateColumns(lowestTn),
    [lowestTn],
  );

  // Desktop: Tab component handles both nav + content together
  const desktopTabs = React.useMemo(
    () => [
      {
        name: 'TN Pricing',
        content: (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <CompareDataTable
              columns={tnColumns}
              data={data}
              defaultSorting={[{ id: 'cost_price', desc: false }]}
              getRowClassName={(row) =>
                tnMeta.lowestCost !== null &&
                row.perTnCostPrice === tnMeta.lowestCost &&
                row.perTnCostPrice > 0
                  ? 'bg-[#F0FDF4]'
                  : undefined
              }
            />
          </div>
        ),
      },
      {
        name: 'm³ Pricing',
        content: (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <CompareDataTable
              columns={m3Columns}
              data={data}
              defaultSorting={[{ id: 'cost_price', desc: false }]}
              getRowClassName={(row) =>
                m3Meta.lowestCost !== null &&
                row.perM3CostPrice === m3Meta.lowestCost &&
                row.perM3CostPrice > 0
                  ? 'bg-[#F0FDF4]'
                  : undefined
              }
            />
          </div>
        ),
      },
      {
        name: '20kg Pricing',
        content: (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <CompareDataTable
              columns={kgColumns}
              data={data}
              defaultSorting={[{ id: 'cost_price', desc: false }]}
              getRowClassName={(row) =>
                kgMeta.lowestCost !== null &&
                row.per20kgCostPrice === kgMeta.lowestCost &&
                row.per20kgCostPrice > 0
                  ? 'bg-[#F0FDF4]'
                  : undefined
              }
            />
          </div>
        ),
      },
      {
        name: 'Bulka Pricing',
        content: (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <CompareDataTable
              columns={bulkaColumns}
              data={data}
              defaultSorting={[{ id: 'cost_price', desc: false }]}
              getRowClassName={(row) =>
                bulkaMeta.lowestCost !== null &&
                row.perBulkaCostPrice === bulkaMeta.lowestCost &&
                row.perBulkaCostPrice > 0
                  ? 'bg-[#F0FDF4]'
                  : undefined
              }
            />
          </div>
        ),
      },
      {
        name: 'Truck Rates',
        content: (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <CompareDataTable
              columns={truckColumns}
              data={data}
              defaultSorting={[{ id: 'truck_tn_rate', desc: false }]}
              getRowClassName={(row) =>
                lowestTn !== null &&
                row.tnTruckRate === lowestTn &&
                row.tnTruckRate > 0
                  ? 'bg-[#F0FDF4]'
                  : undefined
              }
            />
          </div>
        ),
      },
    ],
    [data, tnColumns, m3Columns, kgColumns, bulkaColumns, truckColumns],
  );

  // Mobile: MobileScrollableTabs handles nav; content rendered separately
  const mobileTabs = TAB_NAMES.map((name) => ({ value: name, label: name }));

  const mobileContent = React.useMemo(() => {
    switch (activeTab) {
      case 'TN Pricing':
        return (
          <MobilePricingList
            data={data}
            pricingType="tn"
            lowestCost={tnMeta.lowestCost}
            bestMargin={tnMeta.bestMargin}
          />
        );
      case 'm³ Pricing':
        return (
          <MobilePricingList
            data={data}
            pricingType="m3"
            lowestCost={m3Meta.lowestCost}
            bestMargin={m3Meta.bestMargin}
          />
        );
      case '20kg Pricing':
        return (
          <MobilePricingList
            data={data}
            pricingType="kg"
            lowestCost={kgMeta.lowestCost}
            bestMargin={kgMeta.bestMargin}
          />
        );
      case 'Bulka Pricing':
        return (
          <MobilePricingList
            data={data}
            pricingType="bulka"
            lowestCost={bulkaMeta.lowestCost}
            bestMargin={bulkaMeta.bestMargin}
          />
        );
      case 'Truck Rates':
        return <MobileTruckRateList data={data} lowestTn={lowestTn} />;
      default:
        return null;
    }
  }, [activeTab, data, tnMeta, m3Meta, kgMeta, bulkaMeta, lowestTn]);

  return (
    <div className="flex flex-col gap-1 overflow-x-hidden">
      {productName && (
        <p className="text-sm font-medium text-[#101828]">{productName}</p>
      )}
      <p className="text-sm text-muted-foreground">
        Pricing Comparison · {activeTab}
      </p>

      {isDesktop ? (
        <Tab
          tabs={desktopTabs}
          variant="underline"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2"
        />
      ) : (
        <div className="mt-2">
          <MobileScrollableTabs
            tabs={mobileTabs}
            value={activeTab}
            onValueChange={setActiveTab}
          />
          {mobileContent}
        </div>
      )}
    </div>
  );
}
