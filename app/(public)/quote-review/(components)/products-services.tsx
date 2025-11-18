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
  forPdf?: boolean;
}

const createColumns = (forPdf: boolean): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <p className={`font-semibold text-gray-900 ${forPdf ? 'text-lg' : 'text-sm'}`}>
          {row.original.name}
        </p>
        <p className={`text-gray-500 ${forPdf ? 'text-base' : 'text-xs'}`}>
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
        <p className={`text-gray-900 ${forPdf ? 'text-lg' : 'text-sm'}`}>
          {row.original.truckType}
        </p>
        <p className={`text-gray-500 ${forPdf ? 'text-base' : 'text-xs'}`}>
          {row.original.capacity}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <p className={`text-gray-900 ${forPdf ? 'text-lg' : 'text-sm'}`}>
        {row.original.quantity}
      </p>
    ),
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total Price',
    cell: ({ row }) => (
      <p className={`font-semibold text-gray-900 ${forPdf ? 'text-lg' : 'text-sm'}`}>
        ${centsToDollars(row.original.totalPrice)}
      </p>
    ),
  },
];

export function ProductsServices({ products, forPdf = false }: ProductsServicesProps) {
  return (
    <div className={`bg-white ${forPdf ? 'px-10 py-6 pt-8 mb-3' : 'px-8 py-4 pt-10 mb-4'}`}>
      <h2 className={`font-bold text-[rgba(142,81,255,1)] mb-3 ${forPdf ? 'text-2xl' : 'text-lg'}`}>
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <DataTableClient
        columns={createColumns(forPdf)}
        data={products}
        simpleTable={true}
        isShowHideColumns={false}
      />
    </div>
  );
}
