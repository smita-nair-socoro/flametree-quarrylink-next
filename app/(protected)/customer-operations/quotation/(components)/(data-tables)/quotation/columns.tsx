'use client';
import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { dateSortingFn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Quotation } from '@/lib/types/quotation';
import { QuotationTableActions } from './quotation-table-actions';
import { centsToDollars } from '@/lib/utils/currency';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export const quotationColumns: ColumnDef<Quotation>[] = [
  {
    id: 'quote_number',
    accessorFn: (row) => row.quoteNumber,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quotation" />;
    },
    cell: (info) => info.getValue(),
    meta: 'Quotation Number',
  },
  {
    id: 'customer_name',
    accessorFn: (row) => row.customerName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Customer" />;
    },
    cell: (info) => info.getValue(),
    meta: 'Customer Name',
  },
  {
    id: 'quote_type',
    accessorFn: (row) => row.quoteType,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quote Type" />;
    },
    cell: ({ row }) => {
      const quote_type = row.original.quoteType;
      if (!quote_type) return <span className="text-muted-foreground">-</span>;
      return <TableBadges names={[quote_type]} visibleCount={1} />;
    },
    meta: 'Quote Type',
  },
  {
    id: 'created_at',
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Date Issued" />;
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    sortingFn: dateSortingFn,
    meta: 'Date Issued',
  },
  {
    id: 'expiry_date',
    accessorFn: (row) => row.expiryDate,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Expiry Date" />;
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    sortingFn: dateSortingFn,
    meta: 'Expiry Date',
  },
  {
    id: 'total_sell_price',
    accessorFn: (row) => row.totalSellPrice,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Total Sell Price{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const total_sell_price = row.original.totalSellPrice
        ? centsToDollars(row.original.totalSellPrice)
        : '0';
      return <div>${total_sell_price}</div>;
    },
    meta: 'Total Price',
  },
  {
    id: 'account_manager',
    accessorFn: (row) => row.accountManagerName,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Account Manager" />
      );
    },
    cell: (info) => info.getValue(),
    meta: 'Account Manager',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="py-2">
          <TableBadges names={[status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const quotation = row.original;
      return (
        <div>
          <QuotationTableActions quotation={quotation} />
        </div>
      );
    },
  },
];
