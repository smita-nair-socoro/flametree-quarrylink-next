'use client';
import { Separator } from '@/components/ui/separator';
import { centsToDollars } from '@/lib/utils/currency';
import { DataTableClient } from '@/components/ui/data-table-client';
import { ColumnDef } from '@tanstack/react-table';

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

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {row.original.name}
        </p>
        <p className="text-xs text-gray-500">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'truckType',
    header: 'Truck Configuration',
    cell: ({ row }) => (
      <div>
        <p className="text-sm text-gray-900">
          {row.original.truckType}
        </p>
        <p className="text-xs text-gray-500">
          {row.original.capacity}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <p className="text-sm text-gray-900">
        {row.original.quantity}
      </p>
    ),
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total Price',
    cell: ({ row }) => (
      <p className="text-sm font-semibold text-gray-900">
        ${centsToDollars(row.original.totalPrice)}
      </p>
    ),
  },
];

export function ProductsServices({ products }: ProductsServicesProps) {
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="text-lg font-bold text-[rgba(142,81,255,1)] mb-3">
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <DataTableClient
        columns={columns}
        data={products}
        simpleTable={true}
        isShowHideColumns={false}
      />
    </div>
  );
}
