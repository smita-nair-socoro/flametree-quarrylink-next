'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { DocketDTO } from '@/lib/types/docket';
import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-[120px]">{value}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Docket Number',
  },
  {
    id: 'docketType',
    accessorFn: (row) => row.jobItem?.jobItemType || 'N/A',
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Type" />;
    },
    cell: ({ row }) => {
      return (
        <TableBadges
          names={[row.original.jobItem?.jobItemType]}
          visibleCount={1}
        />
      );
    },
    meta: 'Type',
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
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-[120px]">{jobNumber}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{jobNumber}</p>
          </TooltipContent>
        </Tooltip>
      );
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
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-[120px]">{customerName}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{customerName}</p>
          </TooltipContent>
        </Tooltip>
      );
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
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-[120px]">{productName}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{productName}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Product',
  },
  {
    id: 'deliveryDate',
    accessorFn: (row) => row.deliveryCollectionDate,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Delivery Date" />
      );
    },
    cell: ({ row }) => {
      const deliveryDate =
        row.original.deliveredAt || row.original.deliveryCollectionDate;
      return <DateCell dateString={deliveryDate.toString()} side="top" />;
    },
    meta: 'Delivery Date',
  },
  {
    id: 'loadSize',
    accessorFn: (row) =>
      row.plannedLoadSize ?? row.actualLoadSize ?? row.loadSize,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quantity" />;
    },
    cell: ({ row }) => {
      const loadSize =
        row.original.plannedLoadSize ??
        row.original.actualLoadSize ??
        row.original.loadSize;
      const productUom = row.original.jobItem.productSellUom;
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
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-[120px]">
              {formattedLoadSize}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{formattedLoadSize}</p>
          </TooltipContent>
        </Tooltip>
      );
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
