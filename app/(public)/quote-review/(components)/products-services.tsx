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
  deliveryPrice?: number; // Optional delivery price
}

export interface ProductsServicesProps {
  products: Product[];
  includeDeliveryPrices?: boolean;
}

const createColumns = (includeDeliveryPrices: boolean): ColumnDef<Product>[] => {
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="max-w-full">
          <p className="font-semibold text-gray-900 text-sm truncate" title={row.original.name}>
            {row.original.name}
          </p>
          <p className="text-gray-500 text-xs truncate" title={row.original.code}>{row.original.code}</p>
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
  ];

  // Add Delivery column if includeDeliveryPrices is true
  if (includeDeliveryPrices) {
    columns.push({
      accessorKey: 'deliveryPrice',
      header: 'Delivery',
      cell: ({ row }) => (
        <p className="font-semibold text-[#8E51FF] text-sm">
          ${centsToDollars(row.original.deliveryPrice || 0)}
        </p>
      ),
      size: 100,
    });
  }

  // Add Product Price column
  columns.push({
    accessorKey: 'totalPrice',
    header: 'Product Price',
    cell: ({ row }) => (
      <p className="font-semibold text-gray-900 text-sm">
        ${centsToDollars(row.original.totalPrice)}
      </p>
    ),
    size: 100,
  });

  return columns;
};

export function ProductsServices({
  products,
  includeDeliveryPrices = false,
}: ProductsServicesProps) {
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="font-bold text-[rgba(142,81,255,1)] mb-3 text-lg">
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <DataTableClient
        columns={createColumns(includeDeliveryPrices)}
        data={products}
        simpleTable={true}
        isShowHideColumns={false}
        useColumnSizing={true}
      />
    </div>
  );
}
