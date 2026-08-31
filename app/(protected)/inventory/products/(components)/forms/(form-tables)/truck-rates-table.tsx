'use client';

import { Control } from 'react-hook-form';
import { NewSupplierFormSchema } from '../schemas/supplier-form-schema';
import z from 'zod';
import {
  FormTable,
  FormTableHeader,
  CellConfig,
  FormTableRow,
} from '@/components/ui/form-table';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';

interface TruckRatesTableProps {
  control: Control<z.infer<typeof NewSupplierFormSchema>>;
  readOnly?: boolean;
}

export function TruckRatesTable({ control, readOnly = false }: TruckRatesTableProps) {
  const { currencySymbol, exTaxLabel, unitPriceDecimalPlaces } = useTenantCurrencyTax();

  // Headers configuration
  const headers: FormTableHeader[] = [
    { key: 'rateType', label: 'Rate Type', className: 'w-30' },
    {
      key: 'rate',
      label: `Rate (${currencySymbol})`,
      className: 'w-30',
      tooltip: exTaxLabel,
    },
    { key: 'unit', label: 'Unit', className: 'w-25' },
    {
      key: 'available',
      label: 'Available',
      className: 'w-20',
      tooltip: 'TN is required as the base UoM',
    },
  ];

  // Rows configuration
  const rows: FormTableRow[] = [
    {
      id: 'tnRate',
      label: 'TN Rate',
      data: { unit: 'per TN' },
    },
    {
      id: 'm3Rate',
      label: 'm³ Rate',
      data: { unit: 'per m³' },
    },
    {
      id: 'kgRate',
      label: '20kg Rate',
      data: { unit: 'per 20kg' },
    },
    {
      id: 'bulkaRate',
      label: 'Bulka Rate',
      data: { unit: 'per bulka' },
    },
    {
      id: 'hourlyRate',
      label: 'Hourly Rate',
      data: { unit: 'per hour' },
    },
    {
      id: 'loadRate',
      label: 'Load Rate',
      data: { unit: 'per load' },
    },
    {
      id: 'kmRate',
      label: 'Distance Rate',
      data: { unit: 'per KM' },
    },
  ];

  // Cells configuration
  const cells: CellConfig<z.infer<typeof NewSupplierFormSchema>>[] = [
    {
      key: 'rateType',
      type: 'display',
      className: 'w-30',
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.label}</div>
          <div className="text-xs text-muted-foreground">{row.data?.unit}</div>
        </div>
      ),
    },
    {
      key: 'truck',
      type: 'currency',
      placeholder: unitPriceDecimalPlaces === 4 ? '0.0000' : '0.00',
      decimalPlaces: unitPriceDecimalPlaces,
      thousandSeparator: true,
      className: 'w-30',
    },
    {
      key: 'unit',
      type: 'display',
      className: 'w-25',
      render: (row) => row.data?.unit,
    },
    {
      key: 'availableTruck',
      type: 'switch',
      className: 'w-20',
      disabled: (row) => row.id === 'tnRate',
    },
  ];

  return (
    <FormTable<z.infer<typeof NewSupplierFormSchema>>
      headers={headers}
      rows={rows}
      cells={cells}
      control={control}
      mobileHiddenCells={[2]}
      className="overflow-x-hidden"
      readOnly={readOnly}
    />
  );
}
