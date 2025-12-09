'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import QuarrySupplierForm from './(components)/forms/quarry-supplier-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/quarryResponseData.json';
import { Quarry } from '@/lib/types/quarry';
import { quarriesSuppliersColumns } from './(components)/(data-tables)/quarries/columns';
import { Plus, DollarSign, Building, Mountain, Factory } from 'lucide-react';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

export default function QuarriesSuppliersPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items } = convertedJson as unknown as {
    items: Quarry[];
  };

  const setSelectedQuarrySupplier = useQuarrySupplierStore(
    (state) => state.setSelectedQuarrySupplier
  );
  const [
    selectedQuarrySupplierForActions,
    setSelectedQuarrySupplierForActions,
  ] = React.useState<Quarry | null>(null);

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Monthly Value - Suppliers',
      value: '$645,890',
      description: '+12% vs last month',
      icon: DollarSign,
      iconBgColor: 'bg-[#ECFCCA]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Top Supplier',
      value: 'Summit Stone Co.',
      description: '$198,750 this month',
      icon: Building,
      iconBgColor: 'bg-[#E0E7FF]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Monthly Value - Quarries',
      value: '$397,680',
      description: '-3.5% vs last month',
      icon: Mountain,
      iconBgColor: 'bg-[#F1F5F9]',
      iconColor: 'text-[#71717B]',
      descriptionColor: 'text-[#F54900]',
    },
    {
      title: 'Top Quarry',
      value: 'RedRock Quarry',
      description: '$156,420 this month',
      icon: Factory,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#D08700]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const { actions, viewDialog } = useQuarrySupplierActions(
    selectedQuarrySupplierForActions?.id,
    selectedQuarrySupplierForActions
  );

  // Handle row click to open quarry/supplier details
  const handleRowClick = (quarrySupplier: Quarry) => {
    setSelectedQuarrySupplier(quarrySupplier);
    setSelectedQuarrySupplierForActions(quarrySupplier);
    actions.view();
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'type', title: 'Type', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'suburb', title: 'Suburb', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {viewDialog}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Quarries & Suppliers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Quarry / Supplier"
            dialogDescription="Fill in the details to add a new quarry or supplier to your system."
            buttonTitle="Add Quarry / Supplier"
          >
            <QuarrySupplierForm />
          </FormDialog>
        </div>
      </div>
      {/* Statistics Cards */}
      <StatsCards cards={statsCards} />
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="quarry_suppliers_table"
          data={items ?? []}
          columns={quarriesSuppliersColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search Quarries & Suppliers..."
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
