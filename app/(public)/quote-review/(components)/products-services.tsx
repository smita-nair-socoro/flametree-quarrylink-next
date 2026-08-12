'use client';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { centsToDollars } from '@/lib/utils/currency';
import { DataTableClient } from '@/components/ui/data-table-client';
import { ColumnDef } from '@tanstack/react-table';
import { TableBadges } from '@/components/table-badges';
import { QuoteCurrencyTax } from '@/lib/types/quotation';

export interface Product {
  name: string;
  type?: string;
  deliveryAddress: string;
  truckType: string;
  capacity: string;
  unit: string;
  quantity: string;
  rawQty: number;
  unitPrice: number;
  totalPrice: number;
  deliveryPrice?: number;
}

export interface ProductsServicesProps {
  products: Product[];
  currencyTax: QuoteCurrencyTax;
  includeDeliveryPrices?: boolean;
}

const calcUnitPriceCents = (product: Product, includeDeliveryPrices: boolean): number => {
  if (includeDeliveryPrices) return product.unitPrice;
  const combinedPrice = product.totalPrice + (product.deliveryPrice || 0);
  return product.rawQty > 0 ? combinedPrice / product.rawQty : 0;
};

const deliveryCol = (currencySymbol: string): ColumnDef<Product> => ({
  accessorKey: 'deliveryPrice',
  header: 'Delivery',
  cell: ({ row }) => (
    <span className="inline-block px-2 py-1 rounded-md bg-[#F3EEFF] text-[#8E51FF] font-semibold text-sm">
      {currencySymbol}
      {centsToDollars(row.original.deliveryPrice || 0)}
    </span>
  ),
  size: 100,
});

const createColumns = (
  includeDeliveryPrices: boolean,
  currencySymbol: string,
): ColumnDef<Product>[] => [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p
            className="font-semibold text-gray-900 text-sm"
            title={row.original.name}
          >
            {row.original.name}
          </p>
          <p
            className="text-gray-500 text-xs whitespace-normal"
            title={row.original.deliveryAddress}
          >
            {row.original.deliveryAddress}
          </p>
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="inline-flex">
          <TableBadges names={[String(row.original.type || '').toUpperCase()]} />
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <p className="text-gray-900 text-sm whitespace-nowrap">{row.original.quantity}</p>
      ),
      size: 140,
    },
    ...(includeDeliveryPrices ? [deliveryCol(currencySymbol)] : []),
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => (
        <p className="text-gray-900 text-sm">
          {currencySymbol}
          {centsToDollars(calcUnitPriceCents(row.original, includeDeliveryPrices))}
          {row.original.unit ? `/${row.original.unit}` : ''}
        </p>
      ),
      size: 120,
    },
    {
      accessorKey: 'totalPrice',
      header: includeDeliveryPrices ? 'Product Price' : 'Total Price',
      cell: ({ row }) => {
        const price = includeDeliveryPrices
          ? row.original.totalPrice
          : row.original.totalPrice + (row.original.deliveryPrice || 0);
        return (
          <p className="font-semibold text-gray-900 text-sm">
            {currencySymbol}
            {centsToDollars(price)}
          </p>
        );
      },
      size: 100,
    },
  ];

export function ProductsServices({
  products,
  currencyTax,
  includeDeliveryPrices = false,
}: Readonly<ProductsServicesProps>) {
  const columns = React.useMemo(
    () => createColumns(includeDeliveryPrices, currencyTax.currencySymbol),
    [includeDeliveryPrices, currencyTax.currencySymbol],
  );
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="font-bold text-[rgba(142,81,255,1)] mb-3 text-lg">
        Products & Services
      </h2>
      <Separator className="mb-4" />
      <DataTableClient
        columns={columns}
        data={products}
        simpleTable={true}
        enablePagination={false}
        isShowHideColumns={false}
        useColumnSizing={true}
      />
    </div>
  );
}
