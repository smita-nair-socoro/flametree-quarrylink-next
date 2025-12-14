'use client';

import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ProductDetails } from '@/lib/types/product';
import { ColumnDef } from '@tanstack/react-table';
import { ProductTableActions } from './product-table-actions';

export const productColumns: ColumnDef<ProductDetails>[] = [
  {
    id: 'product_code',
    accessorFn: (row) => row.product_code,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product Code" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Product Code',
  },
  {
    id: 'product_name',
    accessorFn: (row) => row.product_name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product Name" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Product Name',
  },

  {
    id: 'material_type',
    accessorFn: (row) => row.material?.name || '',
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Material Type" />
      );
    },
    cell: ({ row }) => {
      const material_type = row.original.material?.name || '';
      return (
        <div className="py-2">
          <TableBadges names={material_type} visibleCount={1} />
        </div>
      );
    },
    meta: 'Material Type',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: 'status',
    accessorFn: (row) => (row.is_active === true ? 'Available' : 'Unavailable'),
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status =
        row.original.is_active === true ? 'Available' : 'Unavailable';
      return (
        <div className="py-2">
          <TableBadges names={[status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: 'actions',
    header: () => {
      return <div className="text-right pr-4"></div>;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex justify-end pr-4">
          <ProductTableActions product={product} />
        </div>
      );
    },
  },
];
