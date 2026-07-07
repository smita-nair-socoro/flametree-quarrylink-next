'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { JobDTO } from '@/lib/types/job';
import { JOB_STATUS } from '@/lib/types/job-enums';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { JobTableActions } from './job-table-actions';
// import { DateCell } from '@/components/date-cell';
import { HelpCircle } from 'lucide-react';
import { centsToDollars } from '@/lib/utils/currency';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  getCurrencySymbol,
  getExTaxLabel,
} from '@/lib/utils/tenant-config-helper';

export const getJobColumns = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<JobDTO>[] => [
    {
      id: 'jobNumber',
      accessorFn: (row) => row.jobNumber,
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Job Number" />;
      },
      cell: (info) => {
        const value = (info.getValue() as string) || 'N/A';
        return <div className="py-2">{value}</div>;
      },
      meta: 'Job Number',
    },
    {
      id: 'customerName',
      accessorFn: (row) =>
        row.customerDto?.businessName ||
        row.customerDto?.individualContactName ||
        row.contactPersonName ||
        'N/A',
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Customer" />;
      },
      cell: ({ row }) => {
        const customerType = row.original.customerDto?.customerType;
        if (customerType === 'INDIVIDUAL') {
          return <div className="py-2">{row.original.customerDto?.individualContactName}
          </div>;
        } else if (customerType === 'BUSINESS') {
          return <div className="py-2">{row.original.customerDto?.businessName}</div>;
        } else {
          return <div className="py-2">N/A</div>;
        }
      },
      meta: 'Customer Name',
    },
    {
      id: 'projectName',
      accessorFn: (row) => row.projectName,
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Project Name" />;
      },
      cell: ({ row }) => {
        const projectName = row.original.projectName;
        return <div className="py-2">{projectName}</div>;
      },
      meta: 'Project Name',
    },
    {
      id: 'status',
      accessorFn: (row) => row.jobStatus,
      header: () => {
        return <div>Status</div>;
      },
      cell: ({ getValue }) => {
        const names = getValue<string>() as JOB_STATUS;
        return (
          <div className="py-2">
            <TableBadges names={names} visibleCount={1} />
          </div>
        );
      },
      meta: 'Status',
    },
    {
      id: 'uninvoicedDockets',
      accessorFn: (row) => row.uninvoicedDocketsAmount,
      enableSorting: false,
      header: () => {
        return (
          <div className="flex items-center gap-1">
            Uninvoiced Dockets{' '}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getExTaxLabel(taxLabel)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.uninvoicedDocketsAmount ?? 0;
        return (
          <div>
            {getCurrencySymbol(currencyCode)}
            {centsToDollars(amount)}
          </div>
        );
      },
      meta: 'Uninvoiced Dockets',
    },
    {
      id: 'accountManagerName',
      accessorFn: (row) => row.customerDto?.accountManagerName,
      enableSorting: false,
      header: () => {
        return <div>Account Manager</div>;
      },
      cell: ({ row }) => {
        const accountManagerName = row.original.customerDto?.accountManagerName;
        return <div className="py-2">{accountManagerName}</div>;
      },
      meta: 'Account Manager',
    },

    // {
    //   id: 'createdAt',
    //   accessorFn: (row) => row.createdAt,
    //   header: ({ column }) => {
    //     return <TableClientSortableHeader column={column} title="Created At" />;
    //   },
    //   cell: ({ getValue }) => {
    //     return <DateCell dateString={getValue<string>()} side="top" />;
    //   },
    //   meta: 'Created At',
    // },
    {
      id: 'actions',
      header: () => {
        return <div></div>;
      },
      cell: ({ row }) => {
        // return <div>Actions</div>
        const job = row.original;
        return <JobTableActions job={job} />;
      },
    },
  ];
