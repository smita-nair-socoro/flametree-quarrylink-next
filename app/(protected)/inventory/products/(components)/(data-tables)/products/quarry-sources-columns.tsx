'use client';

import { ColumnDef } from '@tanstack/react-table';
import { QuarriesWithPrice } from '@/lib/types/quarry';
import { Switch } from '@/components/ui/switch';
import React from 'react';
import { QuarrySourcesActionCell } from '../quarry-sources-action-cell';
import { Badge } from '@/components/ui/badge';

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
            <Badge variant="destructive" className="mt-1">
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
      const current = row.original.price.status;
      const isActive = current === 'ACTIVE';

      //TODO: Call Patch api endpoint to update price status

      return (
        <div className="flex w-full  gap-2">
          <Switch checked={isActive} />
          <span className="text-sm text-muted-foreground">{current}</span>
        </div>
      );
    },
    meta: 'STATUS',
  },

  {
    id: 'actions',
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      const id = row.original.price.id;
      const cost = row.original.price.cost_price;
      const sell = row.original.price.sell_price;

      return (
        <QuarrySourcesActionCell id={id} cost_price={cost} sell_price={sell} />
      );
    },
    meta: 'ACTIONS',
  },
];
