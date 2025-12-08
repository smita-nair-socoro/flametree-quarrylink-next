'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import QuarrySupplierForm from './(components)/forms/quarry-supplier-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { Quarry } from '@/lib/types/quarry';
import { QuarryType, QuarryStatus } from '@/lib/types/quarry-enums';
import { quarriesSuppliersColumns } from './(components)/(data-tables)/quarries/columns';
import { Plus, DollarSign, Building, Mountain, Factory } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { QuarryListQueryOptions } from '@/lib/api/quarries';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

export default function QuarriesSuppliersPage() {
  const setSelectedQuarrySupplier = useQuarrySupplierStore(
    (state) => state.setSelectedQuarrySupplier
  );
  const [
    selectedQuarrySupplierForActions,
    setSelectedQuarrySupplierForActions,
  ] = React.useState<Quarry | null>(null);

  // Use React Query to fetch quarries and suppliers data
  const {
    data: quarriesData,
    isLoading,
    error,
    isError,
  } = useQuery(QuarryListQueryOptions());

  React.useEffect(() => {
    if (isError && error) {
      console.error('Quarry API Error:', error);
    }
  }, [isError, error]);

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Monthly Value - Suppliers',
      value: '$645,890',
      description: '+12% vs last month',
      icon: DollarSign,
      iconBgColor: 'bg-[#ECFCCA]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Top Supplier',
      value: 'Summit Stone Co.',
      description: '$198,750 this month',
      icon: Building,
      iconBgColor: 'bg-[#E0E7FF]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Monthly Value - Quarries',
      value: '$397,680',
      description: '-3.5% vs last month',
      icon: Mountain,
      iconBgColor: 'bg-[#F1F5F9]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#F54900]',
    },
    {
      title: 'Top Quarry',
      value: 'RedRock Quarry',
      description: '$156,420 this month',
      icon: Factory,
      iconBgColor: 'bg-[#FFEDD4]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const { actions, viewDialog } = useQuarrySupplierActions(
    selectedQuarrySupplierForActions?.id,
    selectedQuarrySupplierForActions
  );

  // Transform the API data to match our component expectations
  const items: Quarry[] = React.useMemo(() => {
    return (
      quarriesData?.map((quarry) => {
        const convertedQuarry = convertKeysToSnakeCase(quarry);

        const quarryType = (convertedQuarry.quarry_supplier_type || convertedQuarry.type || 'QUARRY') as QuarryType;

        // Check if is_active field exists (from API response)
        const isActive = 'is_active' in convertedQuarry ? (convertedQuarry as Record<string, unknown>).is_active : undefined;

        const transformed = {
          ...convertedQuarry,
          type: quarryType,
          quarry_supplier_type: quarryType, // Preserve for editing
          status: (isActive === false ? 'ARCHIVED' : convertedQuarry.status || 'ACTIVE') as QuarryStatus,
          // Preserve address in original camelCase format (backend uses camelCase for Address)
          address: quarry.address,
          // Extract suburb from address object for table display
          suburb: quarry.address?.suburb || '',
          email: convertedQuarry.email || '',
          phone: convertedQuarry.phone || '',
          opening_closing_times: convertedQuarry.opening_closing_info || '',
        };

        return transformed;
      }) || []
    );
  }, [quarriesData]);


  // Get Zustand store actions
  const setSelectedQuarrySupplierInStore = useQuarrySupplierStore((state) => state.setSelectedQuarrySupplier);

  // Handle row click to open quarry/supplier details
  const handleRowClick = (quarrySupplier: Quarry) => {
    setSelectedQuarrySupplier(quarrySupplier);
    setSelectedQuarrySupplierForActions(quarrySupplier);
    setSelectedQuarrySupplierInStore(quarrySupplier); // Set in Zustand store
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading quarries & suppliers...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Error loading quarries & suppliers</div>
          </div>
        ) : (
          <DataTableClient
            tableId="quarry_suppliers_table"
            data={items ?? []}
            columns={quarriesSuppliersColumns}
            facetDefination={facetDefs}
            searchPlaceHolder="Search Quarries & Suppliers..."
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>
  );
}
