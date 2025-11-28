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
import { TrendingDown, TrendingUp } from 'lucide-react';

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
    {
      key: 'cost_price',
      label: 'Cost Price*',
      className: 'w-20',
      tooltip: '(ex-GST)',
    },
    {
      key: 'sell_price',
      label: 'Sell Price*',
      className: 'w-20',
      tooltip: '(ex-GST)',
    },
    { key: 'margin', label: 'Margin %', className: 'w-25' },
    {
      key: 'available_for_sale',
      label: 'Available for Sale',
      className: 'w-20',
      tooltip: 'TN is required as the base UoM',
    },
  ];

  // Rows configuration
  const rows: FormTableRow[] = [
    { id: 'tn', label: 'TN*' },
    { id: 'm3', label: 'm³' },
    { id: 'kg', label: '20kg' },
    { id: 'bulka', label: 'Bulka' },
  ];

  // Cells configuration
  const cells: CellConfig<z.infer<typeof NewSupplierFormSchema>>[] = [
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
      className: 'w-20',
      calculate: (row, watch) => {
        const costPrice =
          (watch(
            `cost_price_${row.id}` as keyof z.infer<
              typeof NewSupplierFormSchema
            >
          ) as number) || 0;
        const sellPrice =
          (watch(
            `sell_price_${row.id}` as keyof z.infer<
              typeof NewSupplierFormSchema
            >
          ) as number) || 0;

        // Always calculate and display margin regardless of availability switch
        const marginValue = calculateMargin(costPrice, sellPrice);

        const marginIcon =
          marginValue > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          );

        const displayValue = `${marginValue.toFixed(2)}%`;

        // Determine text color based on margin value
        const textColor = marginValue < 0 ? 'text-red-600' : 'text-green-600';

        return (
          <div className="flex justify-start gap-2">
            {marginIcon}

            <span className={`font-normal ${textColor}`}>{displayValue}</span>
          </div>
        );
      },
    },
    {
      key: 'available_for_sale',
      type: 'switch',
      showLabel: true,
      className: 'w-36',
      disabled: (row) => row.id === 'tn', // TN is always available for sale
    },
  ];

  return (
    <FormTable<z.infer<typeof NewSupplierFormSchema>>
      headers={headers}
      rows={rows}
      cells={cells}
      control={control}
      watch={watch}
    />
  );
}
