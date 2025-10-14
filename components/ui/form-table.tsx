'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Control, UseFormWatch, FieldPath, FieldValues } from 'react-hook-form';
import { InputMask } from '@/components/ui/input-mask';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

// Header configuration
export interface FormTableHeader {
  key: string;
  label: string;
  className?: string;
  tooltip?: string;
}

// Cell configuration types
export interface BaseCellConfig {
  key: string;
  type: 'text' | 'currency' | 'number' | 'switch' | 'display' | 'calculated';
  className?: string;
}

export interface TextCellConfig extends BaseCellConfig {
  type: 'text';
  placeholder?: string;
}

export interface CurrencyCellConfig extends BaseCellConfig {
  type: 'currency';
  placeholder?: string;
  prefix?: string;
  decimalPlaces?: number;
  thousandSeparator?: boolean;
}

export interface NumberCellConfig extends BaseCellConfig {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface SwitchCellConfig extends BaseCellConfig {
  type: 'switch';
  showLabel?: boolean;
  disabled?: (row: FormTableRow) => boolean;
}

export interface DisplayCellConfig extends BaseCellConfig {
  type: 'display';
  render: (row: FormTableRow) => React.ReactNode;
}

export interface CalculatedCellConfig<T extends FieldValues = FieldValues>
  extends BaseCellConfig {
  type: 'calculated';
  calculate: (row: FormTableRow, watch: UseFormWatch<T>) => React.ReactNode;
}

export type CellConfig<T extends FieldValues = FieldValues> =
  | TextCellConfig
  | CurrencyCellConfig
  | NumberCellConfig
  | SwitchCellConfig
  | DisplayCellConfig
  | CalculatedCellConfig<T>;

// Row data types
export interface FormTableRowData {
  unit?: string;
  [key: string]: unknown;
}

// Row configuration
export interface FormTableRow {
  id: string;
  label?: string;
  data?: FormTableRowData;
}

export interface FormTableProps<T extends FieldValues = FieldValues> {
  headers: FormTableHeader[];
  rows: FormTableRow[];
  cells: CellConfig<T>[];
  control: Control<T>;
  watch?: UseFormWatch<T>;
  className?: string;
  title?: string;
  description?: string;
}

export function FormTable<T extends FieldValues = FieldValues>({
  headers,
  rows,
  cells,
  control,
  watch,
  className,
  title,
  description,
}: FormTableProps<T>) {
  const renderCell = (cell: CellConfig<T>, row: FormTableRow) => {
    const fieldName = `${cell.key}_${row.id}` as FieldPath<T>;

    switch (cell.type) {
      case 'text':
        return (
          <FormField
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={cell.placeholder || ''}
                    className={cn('h-9 w-full', cell.className)}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'currency':
        return (
          <FormField
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputMask
                    type="currency"
                    decimalPlaces={cell.decimalPlaces ?? 2}
                    thousandSeparator={cell.thousandSeparator ?? true}
                    placeholder={cell.placeholder || '$0.00'}
                    className={cn('h-9 w-full', cell.className)}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value as number}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={cell.placeholder || '0'}
                    min={cell.min}
                    max={cell.max}
                    className={cn('h-9 w-full', cell.className)}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'switch':
        const isDisabled = cell.disabled ? cell.disabled(row) : false;
        return (
          <FormField
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      disabled={isDisabled}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'display':
        return (
          <div className={cn('text-sm', cell.className)}>
            {cell.render(row)}
          </div>
        );

      case 'calculated':
        return (
          <div className={cn('text-sm font-medium', cell.className)}>
            {watch ? cell.calculate(row, watch) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header.key} className={header.className}>
                <div className="flex items-center gap-1">
                  {header.label}
                  {header.tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{header.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {cells.map((cell, index) => (
                <TableCell
                  key={`${row.id}-${cell.key}`}
                  className={cell.className}
                >
                  {index === 0 && row.label ? (
                    <div className="font-medium text-sm">{row.label}</div>
                  ) : (
                    renderCell(cell, row)
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
