'use client';

import { Control, UseFormWatch } from 'react-hook-form';
import { NewSupplierFormSchema } from '../schemas/supplier-form-schema';
import z from 'zod';
import {
  FormTable,
  FormTableHeader,
  CellConfig,
  FormTableRow,
} from '@/components/ui/form-table';

interface PricingConfigurationTableProps {
  control: Control<z.infer<typeof NewSupplierFormSchema>>;
  watch: UseFormWatch<z.infer<typeof NewSupplierFormSchema>>;
}

export function PricingConfigurationTable({
  control,
  watch,
}: PricingConfigurationTableProps) {
  // Calculate margin percentage
  const calculateMargin = (costPrice: number, sellPrice: number): number => {
    if (!costPrice || !sellPrice || costPrice <= 0) return 0;
    return ((sellPrice - costPrice) / costPrice) * 100;
  };

  // Headers configuration
  const headers: FormTableHeader[] = [
    { key: 'unit', label: 'Unit', className: 'w-15' },
    { key: 'cost_price', label: 'Cost Price ($)', className: 'w-20' },
    { key: 'sell_price', label: 'Sell Price ($)', className: 'w-20' },
    { key: 'margin', label: 'Margin %', className: 'w-20' },
    {
      key: 'available_for_sale',
      label: 'Available for Sale',
      className: 'w-20',
    },
  ];

  // Rows configuration
  const rows: FormTableRow[] = [
    { id: 'TN', label: 'TN' },
    { id: 'M3', label: 'm³' },
    { id: 'KG', label: '25Kg' },
    { id: 'Bulk', label: 'Bulk' },
  ];

  // Cells configuration
  const cells: CellConfig[] = [
    {
      key: 'unit',
      type: 'display',
      render: (row) => row.label,
      className: 'w-15',
    },
    {
      key: 'cost_price',
      type: 'currency',
      placeholder: '0.00',
      decimalPlaces: 2,
      thousandSeparator: true,
      className: 'w-25',
    },
    {
      key: 'sell_price',
      type: 'currency',
      placeholder: '0.00',
      decimalPlaces: 2,
      thousandSeparator: true,
      className: 'w-25',
    },
    {
      key: 'margin',
      type: 'calculated',
      className: 'w-25',
      calculate: (row, watch) => {
        const costPrice = (watch(`cost_price_${row.id}`) as number) || 0;
        const sellPrice = (watch(`sell_price_${row.id}`) as number) || 0;
        const margin = calculateMargin(costPrice, sellPrice);

        if (margin > 0) {
          return (
            <span className="font-normal text-green-600">
              {margin.toFixed(1)}%
            </span>
          );
        }
        return (
          <span className="text-muted-foreground">
            <span className="font-normal text-green-600">0.00%</span>
          </span>
        );
      },
    },
    {
      key: 'available_for_sale',
      type: 'switch',
      showLabel: true,
      className: 'w-36',
    },
  ];

  return (
    <FormTable
      headers={headers}
      rows={rows}
      cells={cells}
      control={control}
      watch={watch}
    />
  );
}
