'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { DocketDTO } from '@/lib/types/docket';
import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
import { DocketTableActions } from './docket-table-actions';

export const docketColumns: ColumnDef<DocketDTO>[] = [
  {
    id: 'docketNumber',
    accessorFn: (row) => row.docketNumber,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Docket #" />;
    },
    cell: (info) => {
      const value = (info.getValue() as string) || 'N/A';
      return <div className="py-2">{value}</div>;
    },
    meta: 'Docket Number',
  },
  {
    id: 'jobReference',
    accessorFn: (row) => row.job.jobNumber,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Job Reference" />
      );
    },
    cell: ({ row }) => {
      const jobNumber = row.original.job.jobNumber;
      return <div className="py-2">{jobNumber}</div>;
    },
    meta: 'Job Reference',
  },
  {
    id: 'status',
    accessorFn: (row) => row.docketStatus,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status =
        (row.original.docketStatus as string) === 'READY_FOR_COLLECTION'
          ? 'READY'
          : row.original.docketStatus;
      return <TableBadges names={[status]} visibleCount={1} />;
    },
    meta: 'Status',
  },
  {
    id: 'customer',
    accessorFn: (row) => row.customerContactName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Customer" />;
    },
    cell: ({ row }) => {
      const customerName = row.original.customerContactName;
      return <div className="py-2">{customerName}</div>;
    },
    meta: 'Customer',
  },
  {
    id: 'product',
    accessorFn: (row) => row.jobItem.product.productName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product" />;
    },
    cell: ({ row }) => {
      const productName = row.original.jobItem.product.productName;
      return <div className="py-2">{productName}</div>;
    },
    meta: 'Product',
  },
  {
    id: 'deliveryDate',
    accessorFn: (row) => row.deliveredAt,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Delivery Date" />
      );
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    meta: 'Delivery Date',
  },
  {
    id: 'loadSize',
    accessorFn: (row) => row.loadSize,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quantity" />;
    },
    cell: ({ row }) => {
      const loadSize = row.original.loadSize;
      const productUom = row.original.jobItem.productSellUom;
      console.log(row.original.jobItem);
      const formattedLoadSize =
        productUom === 'TN'
          ? `${loadSize} TN`
          : productUom === 'M3'
            ? `${loadSize} m³`
            : productUom === 'KG_20'
              ? `${loadSize} x 20kg`
              : productUom === 'BULKA'
                ? `${loadSize} Bulka`
                : loadSize;
      console.log(formattedLoadSize);
      return <div className="py-2">{formattedLoadSize}</div>;
    },
    meta: 'Load Size',
  },
  // {
  //   id: 'totalInvoice',
  //   accessorFn: (row) => row.totalInvoice,
  //   header: ({ column }) => {
  //     return (
  //       <TableClientSortableHeader column={column} title="Total Invoice" />
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const cents = parseFloat(row.original.totalInvoice.toString());
  //     const dollars = cents / 100;
  //     const formatted = new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: 'USD',
  //     }).format(dollars);
  //     return (
  //       <Tooltip delayDuration={300}>
  //         <TooltipTrigger asChild>
  //           <div className="py-2 font-medium w-36 max-w-36 truncate">
  //             {formatted}
  //           </div>
  //         </TooltipTrigger>
  //         <TooltipContent variant="white">
  //           <p>{formatted}</p>
  //         </TooltipContent>
  //       </Tooltip>
  //     );
  //   },
  //   meta: 'Total Invoice',
  // },

  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const docket = row.original;
      return <DocketTableActions docket={docket} />;
    },
  },
];
