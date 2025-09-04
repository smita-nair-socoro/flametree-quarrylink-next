'use client';

import { ColumnDef } from '@tanstack/react-table';
import { QuoteItem } from '@/lib/types/quotation';
import { QuotationItemsTableActions } from './quote-items-table-actions';

export const quoteItemColumns: ColumnDef<QuoteItem>[] = [
  {
    id: 'product',
    accessorFn: (row) => row.product_id,
    header: ({}) => {
      return <div> Product </div>;
    },
    cell: (info) => info.getValue(),
    meta: 'Product',
  },

  //TODO: Update this and the above to get product from the product itself so QuoteItem needs product object
  {
    id: 'supplier',
    accessorFn: (row) => row.id,
    header: ({}) => {
      return <div> Supplier </div>;
    },
    cell: (info) => info.getValue(),
    meta: 'Supplier',
  },

  //TODO: This will also be Product COST....
  {
    id: 'cost',
    accessorFn: (row) => row.override_cost_price_per_m3,
    header: ({}) => {
      return <div> Cost </div>;
    },
    cell: ({ row }) => {
      const cents = parseFloat(
        row.original.override_cost_price_per_m3.toString(),
      );
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);

      return <div className="text-center font-medium">{formatted}</div>;
    },
    meta: 'Cost',
  },

  //TODO: This will also be Product SELL....
  {
    id: 'sell',
    accessorFn: (row) => row.override_sell_price_per_m3,
    header: ({}) => {
      return <div> Sell </div>;
    },
    cell: ({ row }) => {
      const cents = parseFloat(
        row.original.override_cost_price_per_m3.toString(),
      );
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);

      return <div className="text-center font-medium">{formatted}</div>;
    },
    meta: 'Sell',
  },

  {
    id: 'qty',
    accessorFn: (row) => row.total_quantity_required,
    header: ({}) => {
      return <div> QTY </div>;
    },
    cell: (info) => info.getValue(),
    meta: 'Qty',
  },

  {
    id: 'truck',
    accessorFn: (row) => row.selected_truck_rate_type,
    header: ({}) => {
      return <div> Truck </div>;
    },
    cell: (info) => info.getValue(),
    meta: 'Truck',
  },

  //TODO: Find out what's GP? Where can I find GP value or data?
  {
    id: 'gp',
    accessorFn: (row) => row.override_cost_price_per_m3,
    header: ({}) => {
      return <div> GP </div>;
    },
    cell: (info) => info.getValue(),
    meta: 'GP',
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const quoteItem = row.original;
      return <QuotationItemsTableActions quoteItem={quoteItem} />;
    },
  },
];
