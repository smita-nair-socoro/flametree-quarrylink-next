'use client';

import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/quarryResponseData.json';
import { Quarry } from '@/lib/types/quarry';
import { quarriesSuppliersColumns } from './(components)/(data-tables)/quarries/columns';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

export default function QuarriesSuppliersPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items } = convertedJson as unknown as {
    items: Quarry[];
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'type', title: 'Type', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Quarries & Suppliers</h1>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="quarry_suppliers_table"
          data={items ?? []}
          columns={quarriesSuppliersColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search Quarries & Suppliers..."
        />
      </div>
    </div>
  );
}
