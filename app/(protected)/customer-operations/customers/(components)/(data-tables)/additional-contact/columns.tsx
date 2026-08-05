'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { AdditionalContactDTO } from '@/lib/types/customer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdditionalContactTableActions } from './additional-contacat-table-actions';

export const getAdditionalContactColumns = (
  customerId: number,
): ColumnDef<AdditionalContactDTO>[] => [
    {
      id: 'name',
      accessorFn: (row) =>
        [row.firstName, row.lastName].filter(Boolean).join(' '),
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Name" />;
      },
      cell: (info) => {
        const value = (info.getValue() as string) || 'N/A';
        return (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="truncate block w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]">
                {value}
              </div>
            </TooltipTrigger>
            <TooltipContent variant="white">
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      meta: 'Name',
    },

    {
      id: 'positionRole',
      accessorFn: (row) => row.positionRole,
      header: ({ column }) => {
        return (
          <TableClientSortableHeader column={column} title="Position / Role" />
        );
      },
      cell: (info) => {
        const value = (info.getValue() as string) || 'N/A';
        return (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="truncate block w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]">
                {value}
              </div>
            </TooltipTrigger>
            <TooltipContent variant="white">
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      meta: 'Position',
    },

    {
      id: 'actions',
      header: () => {
        return <div></div>;
      },
      cell: ({ row }) => {
        const additionalContact = row.original;
        return (
          <AdditionalContactTableActions
            customerId={customerId}
            additionalContact={additionalContact}
          />
        );
      },
    },
  ];
