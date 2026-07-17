'use client';

import { Control, UseFormWatch } from 'react-hook-form';
import { NewSupplierFormSchema } from '../schemas/supplier-form-schema';
import z from 'zod';
import {
  FormTable,
  FormTableHeader,
  CellConfig,
  FormTableRow,
  buildFormTableFieldName,
} from '@/components/ui/form-table';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';

interface PricingConfigurationTableProps {
  control: Control<z.infer<typeof NewSupplierFormSchema>>;
  watch: UseFormWatch<z.infer<typeof NewSupplierFormSchema>>;
}

export function PricingConfigurationTable({
  control,
  watch,
}: PricingConfigurationTableProps) {
  const { exTaxLabel } = useTenantCurrencyTax();

  const calculateMargin = (costPrice: number, sellPrice: number): number => {
    if (!sellPrice || sellPrice <= 0) return 0;
    return ((sellPrice - costPrice) / sellPrice) * 100;
  };

  const headers: FormTableHeader[] = [
    { key: 'unit', label: 'Unit', className: 'w-15' },
    {
      key: 'costPrice',
      label: 'Cost Price*',
      className: 'md:w-20',
      tooltip: exTaxLabel,
    },
    {
      key: 'sellPrice',
      label: 'Sell Price*',
      className: 'md:w-20',
      tooltip: exTaxLabel,
    },
    { key: 'Margin', label: 'Profit Margin %', className: 'w-25' },
    {
      key: 'availableForSale',
      label: 'Available for Sale',
      mobileLabel: 'For Sale',
      className: 'md:w-20',
      tooltip: 'TN is required as the base UoM',
    },
  ];

  const rows: FormTableRow[] = [
    { id: 'tn', label: 'TN*' },
    { id: 'm3', label: 'm³' },
    { id: 'kg', label: '20kg' },
    { id: 'bulka', label: 'Bulka' },
  ];

  const cells: CellConfig<z.infer<typeof NewSupplierFormSchema>>[] = [
    {
      key: 'unit',
      type: 'display',
      render: (row) => row.label,
      className: 'w-15',
    },
    {
      key: 'costPrice',
      type: 'currency',
      placeholder: '0.00',
      decimalPlaces: 2,
      thousandSeparator: true,
      className: 'md:w-25',
    },
    {
      key: 'sellPrice',
      type: 'currency',
      placeholder: '0.00',
      decimalPlaces: 2,
      thousandSeparator: true,
      className: 'md:w-25',
    },
    {
      key: 'margin',
      type: 'calculated',
      className: 'w-20',
      calculate: (row, watchFn) => {
        const costPrice =
          (watchFn(
            buildFormTableFieldName(
              'costPrice',
              row.id,
            ) as keyof z.infer<typeof NewSupplierFormSchema>,
          ) as number) || 0;
        const sellPrice =
          (watchFn(
            buildFormTableFieldName(
              'sellPrice',
              row.id,
            ) as keyof z.infer<typeof NewSupplierFormSchema>,
          ) as number) || 0;

        const marginValue = calculateMargin(costPrice, sellPrice);

        const marginIcon =
          marginValue > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : marginValue < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-600" />
          ) : (
            <span className="w-4 h-4 text-gray-600" />
          );

        const displayValue = `${marginValue.toFixed(2)}%`;
        const textColor =
          marginValue > 0
            ? 'text-green-600'
            : marginValue < 0
              ? 'text-red-600'
              : 'text-gray-600';

        return (
          <div className="flex justify-start gap-2">
            {marginIcon}
            <span className={`font-normal ${textColor}`}>{displayValue}</span>
          </div>
        );
      },
    },
    {
      key: 'availableForSale',
      type: 'switch',
      className: 'md:w-36',
      disabled: (row) => row.id === 'tn',
    },
  ];

  return (
    <FormTable<z.infer<typeof NewSupplierFormSchema>>
      headers={headers}
      rows={rows}
      cells={cells}
      control={control}
      watch={watch}
      mobileStackedLabel
      mobileHiddenCells={[0, 3]}
      className="overflow-x-hidden"
      mobileStackedLabelRender={(row) => {
        const costPrice =
          (watch(
            buildFormTableFieldName(
              'costPrice',
              row.id,
            ) as keyof z.infer<typeof NewSupplierFormSchema>,
          ) as number) || 0;
        const sellPrice =
          (watch(
            buildFormTableFieldName(
              'sellPrice',
              row.id,
            ) as keyof z.infer<typeof NewSupplierFormSchema>,
          ) as number) || 0;
        const marginValue = calculateMargin(costPrice, sellPrice);
        const textColor =
          marginValue > 0
            ? 'text-green-600'
            : marginValue < 0
              ? 'text-red-600'
              : 'text-gray-500';
        return (
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{row.label}</span>
            <div
              className={`bg-gray-100 rounded px-2 py-0.5 text-xs font-medium ${textColor}`}
            >
              {marginValue.toFixed(2)}%
            </div>
          </div>
        );
      }}
    />
  );
}
