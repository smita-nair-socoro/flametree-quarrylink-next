'use client';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
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

// Header configuration
export interface FormTableHeader {
  key: string;
  label: string;
  className?: string;
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
}

export interface DisplayCellConfig extends BaseCellConfig {
  type: 'display';
  render: (rowData: any) => React.ReactNode;
}

export interface CalculatedCellConfig extends BaseCellConfig {
  type: 'calculated';
  calculate: (rowData: any, watch: UseFormWatch<any>) => React.ReactNode;
}

export type CellConfig =
  | TextCellConfig
  | CurrencyCellConfig
  | NumberCellConfig
  | SwitchCellConfig
  | DisplayCellConfig
  | CalculatedCellConfig;

// Row configuration
export interface FormTableRow {
  id: string;
  label?: string;
  data?: Record<string, any>;
}

export interface FormTableProps<T extends FieldValues> {
  headers: FormTableHeader[];
  rows: FormTableRow[];
  cells: CellConfig[];
  control: Control<T>;
  watch?: UseFormWatch<T>;
  className?: string;
  title?: string;
  description?: string;
}

export function FormTable<T extends FieldValues>({
  headers,
  rows,
  cells,
  control,
  watch,
  className,
  title,
  description,
}: FormTableProps<T>) {
  const renderCell = (cell: CellConfig, row: FormTableRow) => {
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
                <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'switch':
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
                    />
                  </div>
                </FormControl>
                <FormMessage />
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
                {header.label}
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
