'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Docket } from '@/lib/types/docket';
import { centsToDollars } from '@/lib/utils/currency';
// import { JobLineItemTableActions } from './job-line-items-table-actions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';

export const docketsColumns: ColumnDef<Docket>[] = [
  {
    id: 'docketNumber',
    accessorFn: (row) => row.docketNumber,
    header: () => {
      return <div>Docket Number</div>;
    },
    cell: ({ row }) => {
      const docketNumber = row.original.docketNumber || 'N/A';
      return (
        <div className="min-w-0 w-[70px] sm:w-[90px] md:w-[110px] lg:w-[130px] xl:w-[150px]">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {docketNumber}
          </p>
        </div>
      );
    },
    meta: 'Docket Number',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ row }) => {
      return <TableBadges names={[row.original.status]} visibleCount={1} />;
    },
    meta: 'Status',
  },
  {
    id: 'loadSize',
    accessorFn: (row) => row.selectedJobLineItem.loadSize,
    header: () => {
      return <div>Product Sell QTY</div>;
    },
    cell: ({ row }) => {
      const productSellQty = row.original.selectedJobLineItem.loadSize;
      const productSellUom = row.original.selectedJobLineItem.productUoM;
      const displayText = `${productSellQty} ${productSellUom}`;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block w-[30px] sm:w-[40px] md:w-[50px] lg:w-[60px] xl:w-[70px]">
              {displayText}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{displayText}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Product Sell QTY',
  },

  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: () => {
      return (
        <div>
          <>Actions</>
        </div>
      );
    },
    // cell: ({ row }) => {
    // 	return (
    // 		<div>
    // 			<JobLineItemTableActions jobLineItem={row.original} />
    // 		</div>
    // 	);
    // },
  },
];
