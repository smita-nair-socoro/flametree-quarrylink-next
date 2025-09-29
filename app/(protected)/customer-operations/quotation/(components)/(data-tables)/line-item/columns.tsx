'use client';

import { ColumnDef } from '@tanstack/react-table';
import { QuotationLineItem } from '@/lib/types/quotation';
import { centsToDollars } from '@/lib/utils/currency';

export const quotationLineItemColumns: ColumnDef<QuotationLineItem>[] = [
  {
    id: 'product_name',
    accessorFn: (row) => row.product_name,
    header: () => {
      return <div>Product</div>;
    },
    cell: (info) => info.getValue(),
    meta: 'Product Name',
  },
  {
    id: 'quarry_name',
    accessorFn: (row) => row.quarry_name,
    header: () => {
      return <div>Supplier</div>;
    },
    cell: (info) => info.getValue(),
    meta: 'quarry_name',
  },
  {
    id: 'total_product_cost_price',
    accessorFn: (row) => row.total_product_cost_price,
    header: () => {
      return <div>Total Cost</div>;
    },
    cell: ({ row }) => {
      const total_product_cost_price = row.original.total_product_cost_price
        ? centsToDollars(row.original.total_product_cost_price)
        : '0';
      return <div>${total_product_cost_price}</div>;
    },
    meta: 'Total Product Cost Price',
  },
  {
    id: 'total_product_sell_price',
    accessorFn: (row) => row.total_product_sell_price,
    header: () => {
      return <div>Total Sell</div>;
    },
    cell: ({ row }) => {
      const total_product_sell_price = row.original.total_product_sell_price
        ? centsToDollars(row.original.total_product_sell_price)
        : '0';
      return <div>${total_product_sell_price}</div>;
    },
    meta: 'Total Product Sell Price',
  },
  {
    id: 'product_sell_qty',
    accessorFn: (row) => row.product_sell_qty,
    header: () => {
      return <div>QTY</div>;
    },
    cell: ({ row }) => {
      const product_sell_qty = row.original.product_sell_qty;
      const product_sell_uom = row.original.product_sell_uom;
      return (
        <div>
          {product_sell_qty} {product_sell_uom}
        </div>
      );
    },
    meta: 'Product Sell QTY',
  },
  {
    id: 'truck_type',
    accessorFn: (row) => row.truck_type,
    header: () => {
      return <div>Truck</div>;
    },
    cell: ({ row }) => {
      const truck_type = row.original.truck_type;
      return <div>{truck_type}</div>;
    },
    meta: 'Truck Type',
  },
  {
    id: 'gross_profit',
    accessorFn: (row) => row.gross_profit,
    header: () => {
      return <div>GP</div>;
    },
    cell: ({ row }) => {
      const gross_profit = row.original.gross_profit;
      return <div>{gross_profit}%</div>;
    },
    meta: 'Gross Profit',
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: () => {
      return <div></div>;
    },
  },
];
