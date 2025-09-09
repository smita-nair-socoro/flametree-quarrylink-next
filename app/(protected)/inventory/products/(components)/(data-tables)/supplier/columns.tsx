'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { TableTwoDataInOneCell } from '@/components/table-two-data-in-one-cell';

export const supplierColumns: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'quarry_name',
    accessorFn: (row) => row.quarry_name,
    header: ({}) => {
      return <div>Quarry Name</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Quarry Name',
  },
  {
    id: 'supplier_product_name',
    accessorFn: (row) => row.supplier_product_name,
    header: ({}) => {
      return <div>Supplier Product</div>;
    },
    cell: ({ row }) => (
      <TableTwoDataInOneCell
        primaryData={row.original.supplier_product_name}
        secondaryData={row.original.supplier_product_code}
      />
    ),
    meta: 'Supplier Product',
  },
  {
    id: 'cost_price',
    accessorFn: (row) => row.price.TN_cost_price,
    header: ({}) => {
      return <div>Cost Price</div>;
    },
    cell: () => <div>Cost Price</div>,
    meta: 'Cost Price',
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.price.TN_sell_price,
    header: ({}) => {
      return <div>Sell Price</div>;
    },
    cell: () => <div>Sell Price</div>,
    meta: 'Sell Price',
  },
  {
    id: 'margin',
    accessorFn: (row) => row.price.margin_TN,
    header: ({}) => {
      return <div>Margin</div>;
    },
    cell: () => <div>Margin</div>,
    meta: 'Margin',
  },
  {
    id: 'action',
    accessorFn: (row) => row.id,
    header: ({}) => {
      return <div>Action</div>;
    },
    cell: () => <div>Action</div>,
    meta: 'Action',
  },
];
