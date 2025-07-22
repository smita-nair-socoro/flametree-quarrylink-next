'use client';

import { ColumnDef } from '@tanstack/react-table';
import { QuarriesWithPrice } from '@/lib/types/quarry';
import React from 'react';
import { QuarrySourcesActionCell } from './quarry-sources-action-cell';
import { Badge } from '@/components/ui/badge';
import { StatusToggle } from '../quarry-sources-status-toggle';

export const quarrySourcesColumns: ColumnDef<QuarriesWithPrice>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.quarry.name,
    header: ({}) => {
      return <div>NAME</div>;
    },
    cell: (info) => info.getValue(),
    meta: 'NAME',
  },

  {
    id: 'cost_price',
    accessorFn: (row) => row.price.cost_price,
    header: ({}) => {
      return <div>COST PRICE</div>;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.getValue('cost_price'));
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);

      return <div className="text-center font-medium">{formatted}</div>;
    },
    meta: 'COST PRICE',
  },

  {
    id: 'sell_price',
    accessorFn: (row) => row.price.sell_price,
    header: () => <div>SELL PRICE</div>,
    cell: ({ row }) => {
      const costCents = row.original.price.cost_price;
      const sellCents = row.getValue<number>('sell_price');

      const sellDollars = sellCents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(sellDollars);

      return (
        <div className="flex flex-col items-center">
          <div className="text-center font-medium">{formatted}</div>
          {sellCents < costCents && (
            <Badge
              variant="destructive"
              className="mt-1 px-2 py-0.5 text-xs font-medium border border-current"
            >
              Alert: Below Cost
            </Badge>
          )}
        </div>
      );
    },
    meta: 'SELL PRICE',
  },

  {
    id: 'status',
    header: () => <div className="">STATUS</div>,
    accessorFn: (row) => row.price.status,
    cell: ({ row }) => {
      const status = row.original.price.status;
      const priceId = row.original.price.id;
      return <StatusToggle priceId={priceId} currentStatus={status} />;
    },
    meta: 'STATUS',
  },

  {
    id: 'actions',
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      const quarry = row.original.quarry;
      const price = row.original.price;
      const quarryProductId = row.original.quarry_product_id;

      return (
        <QuarrySourcesActionCell
          quarry={quarry}
          quarry_product_price={price}
          quarry_product_id={quarryProductId}
        />
      );
    },
    meta: 'ACTIONS',
  },
];
