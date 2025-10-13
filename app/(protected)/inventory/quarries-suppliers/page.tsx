'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import QuarrySupplierForm from './(components)/forms/quarry-supplier-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/quarryResponseData.json';
import { Quarry } from '@/lib/types/quarry';
import { quarriesSuppliersColumns } from './(components)/(data-tables)/quarries/columns';
import { Plus } from 'lucide-react';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';

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
