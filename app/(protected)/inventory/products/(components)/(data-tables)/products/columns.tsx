'use client';

import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ProductWithCategoriesAndQuarry } from '@/lib/types/product';
import { dateSortingFn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { TableActions } from '@/components/table-actions';

export const productColumns: ColumnDef<ProductWithCategoriesAndQuarry>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.product.name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="NAME" />;
    },
    cell: (info) => info.getValue(),
    meta: 'PRODUCT',
  },

  {
    id: 'category',
    accessorFn: (row) => row.categories.map((c) => c.name),
    header: 'CATEGORIES',
    cell: ({ getValue }) => {
      const names = getValue<string[]>();
      return <TableBadges names={names} visibleCount={1} />;
    },
    meta: 'CATEGORY',
  },

  {
    id: 'cost_price',
    accessorFn: (row) => row.quarries[0]?.price?.cost_price ?? 0,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="COST PRICE" />;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.getValue('cost_price'));
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);

      return <div className="font-medium">{formatted}</div>;
    },
    meta: 'COST PRICE',
  },

  {
    id: 'sell_price',
    accessorFn: (row) => row.quarries[0]?.price?.sell_price ?? 0,

    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="SELL PRICE" />;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.getValue('sell_price'));
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);

      return <div className="font-medium">{formatted}</div>;
    },
    meta: 'SELL PRICE',
  },

  {
    id: 'margin',
    accessorFn: (row) => {
      const { cost_price: cost, sell_price: sell } = row.quarries[0].price;
      return cost === 0 ? 0 : Math.round(((sell - cost) / cost) * 100);
    },
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="MARGIN" />;
    },
    cell: ({ getValue }) => {
      const marginValue = getValue<number>();
      const colorClass = marginValue < 0 ? 'text-red-600' : 'text-green-600';

      return (
        <div className="flex items-center font-medium">
          <span className={colorClass}>{marginValue}%</span>
        </div>
      );
    },
    meta: 'MARGIN',
  },

  {
    id: 'quarries',
    accessorFn: (row) => row.quarries.map((q) => q.quarry.name),
    header: 'QUARRY SUPPLY',
    cell: ({ getValue }) => {
      const names = getValue<string[]>();
      return <TableBadges names={names} visibleCount={1} />;
    },
    meta: 'QUARRY SUPPLY',
  },

  {
    id: 'update_at',
    accessorFn: (row) => row.product.updated_at,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="LAST UPDATED AT" />
      );
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    sortingFn: dateSortingFn,

    meta: 'LAST UPDATE',
  },

  {
    id: 'status',
    accessorFn: (row) => row.quarries[0]?.price?.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="STATUS" />;
    },
    cell: ({ getValue }) => {
      const names = getValue<string>();
      return <TableBadges names={names} visibleCount={1} />;
    },
    meta: 'STATUS',
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const productId = row.original.product.id;

      return <TableActions productId={productId} />;
    },
  },
];
