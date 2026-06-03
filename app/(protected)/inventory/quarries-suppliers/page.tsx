'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import QuarrySupplierForm from './(components)/forms/quarry-supplier-form';
import { Quarry } from '@/lib/types/quarry';
import { QuarryType, QuarryStatus } from '@/lib/types/quarry-enums';
import { quarriesSuppliersColumns } from './(components)/(data-tables)/quarries/columns';
import {
  DollarSign,
  Building,
  Mountain,
  Factory,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  QuarryListQueryOptions,
  QuarryReportingQueryOptions,
} from '@/lib/api/quarries';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { centsToDollars } from '@/lib/utils/currency';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { QuarrySupplierTableActions } from './(components)/(data-tables)/quarries/quarry-supplier-table-actions';

export default function QuarriesSuppliersPage() {
  const setSelectedQuarrySupplier = useQuarrySupplierStore(
    (state) => state.setSelectedQuarrySupplier,
  );
  const [createFormType, setCreateFormType] = React.useState<QuarryType>(
    QuarryType.QUARRY,
  );
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Reset form type and clear selected quarry when opening Add dialog so create form doesn't show previously viewed quarry.
  const handleCreateDialogOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        setCreateFormType(QuarryType.QUARRY);
        setSelectedQuarrySupplier(null);
      }
      setCreateDialogOpen(open);
    },
    [setSelectedQuarrySupplier],
  );

  // Use React Query to fetch quarries and suppliers data
  const {
    data: quarriesData,
    isLoading,
    error,
    isError,
  } = useQuery(QuarryListQueryOptions());

  const { data: reportingData } = useQuery(QuarryReportingQueryOptions());

  React.useEffect(() => {
    if (isError && error) {
      console.error('Quarry API Error:', error);
    }
  }, [isError, error]);

  const suppliersChange = reportingData?.suppliersMonthlyProfitValueChangeVsLastMonth ?? 0;
  const quarriesChange = reportingData?.quarriesMonthlyProfitValueChangeVsLastMonth ?? 0;

  const formatValueChange = (value: number) =>
    `${value > 0 ? '+' : value < 0 ? '-' : ''}$${centsToDollars(Math.abs(value))} vs last month`;

  const changeColor = (value: number) => {
    if (value > 0) return 'text-[#00A63E]';
    if (value < 0) return 'text-[#E7000B]';
    return 'text-[#737373]';
  };

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Monthly Value - Suppliers',
      value: `$${centsToDollars(
        reportingData?.supplierTotalMonthlyProfitValueOfQuotedProducts || 0,
      )}`,
      description: formatValueChange(suppliersChange),
      icon: DollarSign,
      iconBgColor: 'bg-[#ECFCCA]',
      iconColor: 'text-[#016630]',
      descriptionColor: changeColor(suppliersChange),
    },
    {
      title: 'Top Supplier',
      value: reportingData?.topSupplierOfTheMonth || 'QuarryLink-Supplier',
      description: `$${centsToDollars(
        reportingData?.topSupplierQuotedProfitValueThisMonth || 0,
      )} this month`,
      icon: Building,
      iconBgColor: 'bg-[#E0E7FF]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Monthly Value - Quarries',
      value: `$${centsToDollars(
        reportingData?.quarriesTotalMonthlyProfitValueOfQuotedProducts || 0,
      )}`,
      description: formatValueChange(quarriesChange),
      icon: Mountain,
      iconBgColor: 'bg-[#F1F5F9]',
      iconColor: 'text-[#71717B]',
      descriptionColor: changeColor(quarriesChange),
    },
    {
      title: 'Top Quarry',
      value: reportingData?.topQuarryOfTheMonth || 'QuarryLink-Quarry',
      description: `$${centsToDollars(
        reportingData?.topQuarryQuotedProfitValueThisMonth || 0,
      )} this month`,
      icon: Factory,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#D08700]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  const { actions, confirmDialogs, viewDialog } = useQuarrySupplierActions();

  // Transform the API data to match our component expectations
  const items: Quarry[] = React.useMemo(() => {
    return (
      quarriesData?.map((quarry) => {
        const quarryType = (quarry.quarrySupplierType ||
          'QUARRY') as QuarryType;

        // Check if is_active field exists (from API response)
        const isActive =
          'isActive' in quarry
            ? (quarry as Record<string, unknown>).isActive
            : undefined;

        const transformed = {
          ...quarry,
          quarrySupplierType: quarryType,
          status: (isActive === false
            ? 'ARCHIVED'
            : quarry.status || 'ACTIVE') as QuarryStatus,
          address: quarry.address,
          // Extract suburb from address object for table display
          suburb: quarry.address?.suburb || '',
          email: quarry.email || '',
          phone: quarry.phone || '',
          opening_closing_times: quarry.openingClosingInfo || '',
        };

        return transformed;
      }) || []
    );
  }, [quarriesData]);

  // Handle row click: pass clicked quarry so store updates before dialog opens (avoids stale header)
  const handleRowClick = (quarrySupplier: Quarry) => {
    actions.view(quarrySupplier);
  };

  const renderQuarrySupplierCard = React.useCallback(
    (quarrySupplier: Quarry) => {
      const suburb =
        quarrySupplier.suburb || quarrySupplier.address?.suburb || '';

      return (
        <MobileCard
          title={quarrySupplier.name}
          badges={
            <>
              <TableBadges
                names={[quarrySupplier.quarrySupplierType]}
                visibleCount={1}
              />
              {quarrySupplier.status && (
                <TableBadges names={[quarrySupplier.status]} visibleCount={1} />
              )}
            </>
          }
          actions={
            <QuarrySupplierTableActions quarrySupplier={quarrySupplier} />
          }
          fields={[
            {
              icon: <MapPin className="h-4 w-4" />,
              label: 'Suburb',
              value: suburb || '-',
            },
            {
              icon: <Mail className="h-4 w-4" />,
              label: 'Email',
              value: quarrySupplier.email || '-',
            },
            {
              icon: <Phone className="h-4 w-4" />,
              label: 'Phone',
              value: quarrySupplier.phone || '-',
            },
          ]}
        />
      );
    },
    [],
  );

  const facetDefs: FacetDefinition[] = [
    { column: 'quarry_supplier_type', title: 'Type' },
    { column: 'status', title: 'Status' },
    { column: 'suburb', title: 'Suburb' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Quarries & Suppliers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle={`Add New ${
              createFormType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'
            }`}
            dialogDescription="Fill in the details to add a new quarry or supplier to your system."
            buttonTitle="Add Quarry / Supplier"
            open={createDialogOpen}
            onOpenChangeAction={handleCreateDialogOpenChange}
          >
            <QuarrySupplierForm onTypeChange={setCreateFormType} />
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
            <div className="text-center">
              Error loading quarries & suppliers
            </div>
          </div>
        ) : (
          <DataTableClient
            tableId="quarry_suppliers_table"
            data={items ?? []}
            columns={quarriesSuppliersColumns}
            facetDefinition={facetDefs}
            searchPlaceHolder="Search Quarries & Suppliers..."
            onRowClick={handleRowClick}
            defaultSorting={[{ id: 'name', desc: false }]}
            mobileCardRenderer={renderQuarrySupplierCard}
          />
        )}
      </div>
    </div>
  );
}
