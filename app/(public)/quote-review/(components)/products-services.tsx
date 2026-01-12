'use client';
import { Separator } from '@/components/ui/separator';
import { centsToDollars } from '@/lib/utils/currency';
import { DataTableClient } from '@/components/ui/data-table-client';
import { ColumnDef } from '@tanstack/react-table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Product {
  name: string;
  code: string;
  truckType: string;
  capacity: string;
  quantity: string;
  totalPrice: number;
}

export interface ProductsServicesProps {
  products: Product[];
}

const createColumns = (): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div className="max-w-full">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <p className="font-semibold text-gray-900 text-sm truncate">
              {row.original.name}
            </p>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{row.original.name}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <p className="text-gray-500 text-xs truncate">{row.original.code}</p>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{row.original.code}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: 'truckType',
    header: 'Truck Configuration',
    cell: ({ row }) => (
      <div>
        <p className="text-gray-900 text-sm">{row.original.truckType}</p>
        <p className="text-gray-500 text-xs">{row.original.capacity}</p>
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <p className="text-gray-900 text-sm">{row.original.quantity}</p>
    ),
    size: 70,
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total Price (ex-GST)',
    cell: ({ row }) => (
      <p className="font-semibold text-gray-900 text-sm">
        ${centsToDollars(row.original.totalPrice)}
      </p>
    ),
    size: 100,
  },
];

export function ProductsServices({ products }: ProductsServicesProps) {
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="font-bold text-[rgba(142,81,255,1)] mb-3 text-lg">
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <DataTableClient
        columns={createColumns()}
        data={products}
        simpleTable={true}
        isShowHideColumns={false}
        useColumnSizing={true}
      />
    </div>
  );
}
