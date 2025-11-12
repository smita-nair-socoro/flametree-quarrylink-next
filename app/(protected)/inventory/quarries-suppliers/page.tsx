'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import QuarrySupplierForm from './(components)/forms/quarry-supplier-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/quarryResponseData.json';
import { Quarry } from '@/lib/types/quarry';
import { quarriesSuppliersColumns } from './(components)/(data-tables)/quarries/columns';
import { Plus, DollarSign, Building, Mountain, Building2 } from 'lucide-react';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { Card, CardContent } from '@/components/ui/card';

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
  const [selectedQuarrySupplierForActions, setSelectedQuarrySupplierForActions] =
    React.useState<Quarry | null>(null);

  // Statistics cards data
  const statsCards = [
    {
      title: 'Monthly Value - Suppliers',
      value: '$645,890',
      description: '+12% vs last month',
      icon: DollarSign,
      descriptionColor: 'text-green-600',
    },
    {
      title: 'Top Supplier',
      value: 'Summit Stone Co.',
      description: '$198,750 this month',
      icon: Building,
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Monthly Value - Quarries',
      value: '$397,680',
      description: '-3.5% vs last month',
      icon: Mountain,
      descriptionColor: 'text-red-600',
    },
    {
      title: 'Top Quarry',
      value: 'RedRock Quarry',
      description: '$156,420 this month',
      icon: Building2,
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-5">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-[#737373]">{card.title}</span>
                  <Icon className="h-5 w-5 text-[#737373]" />
                </div>
                <div className="text-2xl font-semibold">{card.value}</div>
                <div className={`text-sm ${card.descriptionColor}`}>
                  {card.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
