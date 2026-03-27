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

interface TruckRatesTableProps {
  control: Control<z.infer<typeof NewSupplierFormSchema>>;
}

export function TruckRatesTable({ control }: TruckRatesTableProps) {
  // Headers configuration
  const headers: FormTableHeader[] = [
    { key: 'rate_type', label: 'Rate Type', className: 'w-30' },
    { key: 'rate', label: 'Rate ($)', className: 'w-30', tooltip: '(ex-GST)' },
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
      id: 'tn_rate',
      label: 'TN Rate',
      data: { unit: 'per TN' },
    },
    {
      id: 'm3_rate',
      label: 'm³ Rate',
      data: { unit: 'per m³' },
    },
    {
      id: 'kg_rate',
      label: '20kg Rate',
      data: { unit: 'per 20kg' },
    },
    {
      id: 'bulka_rate',
      label: 'Bulka Rate',
      data: { unit: 'per bulka' },
    },
    {
      id: 'hourly_rate',
      label: 'Hourly Rate',
      data: { unit: 'per hour' },
    },
    {
      id: 'load_rate',
      label: 'Load Rate',
      data: { unit: 'per load' },
    },
    {
      id: 'km_rate',
      label: 'Distance Rate',
      data: { unit: 'per KM' },
    },
  ];

  // Cells configuration
  const cells: CellConfig<z.infer<typeof NewSupplierFormSchema>>[] = [
    {
      key: 'rate_type',
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
      placeholder: '0.00',
      decimalPlaces: 2,
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
      key: 'available_truck',
      type: 'switch',
      className: 'w-20',
      disabled: (row) => row.id === 'tn_rate',
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
    />
  );
}
