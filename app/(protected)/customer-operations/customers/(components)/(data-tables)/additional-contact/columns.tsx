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
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils/phone-helper';

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
      id: 'email',
      accessorFn: (row) => row.email,
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Email" />;
      },
      cell: (info) => {
        const value = (info.getValue() as string) || 'N/A';
        return (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="truncate block w-[105px] sm:w-[125px] md:w-[145px] lg:w-[165px] xl:w-[185px]">
                {value}
              </div>
            </TooltipTrigger>
            <TooltipContent variant="white">
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      meta: 'Email',
    },

    {
      id: 'phone',
      accessorFn: (row) => row.phone,
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Phone" />;
      },
      cell: ({ row }) => {
        const phone = formatPhoneNumber(
          normalizePhoneNumber(row.original.phone),
        );
        return (
          <div className="py-2">{phone || 'N/A'}</div>
        );
      },
      meta: 'Phone',
    },

    {
      id: 'position',
      accessorFn: (row) => row.position,
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
