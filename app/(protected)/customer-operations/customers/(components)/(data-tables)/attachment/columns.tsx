'use client';

import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { CustomerAttachmentDTO } from '@/lib/types/customer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CUSTOMER_ATTACHMENT_CATEGORY_LABELS } from '@/app/(protected)/customer-operations/customers/(components)/forms/schemas/customer-attachment-form-schema';
import { formatLocalDate } from '@/lib/utils/date';
import { openCustomerAttachment } from '@/lib/utils/customer-attachment-helper';
import { CustomerAttachmentTableActions } from './customer-attachment-table-actions';

export const getCustomerAttachmentColumns = (
  customerId: number,
): ColumnDef<CustomerAttachmentDTO>[] => [
    {
      id: 'fileName',
      accessorFn: (row) => row.fileName,
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="File Name" />;
      },
      cell: ({ row }) => {
        const attachment = row.original;
        const value = attachment.fileName || 'N/A';

        return (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="block w-[180px] truncate text-left text-sm font-medium text-[#155DFC] underline sm:w-[210px] md:w-[250px] lg:w-[270px] xl:w-[290px] cursor-pointer"
                onClick={() => void openCustomerAttachment(customerId, attachment)}
              >
                {value}
              </button>
            </TooltipTrigger>
            <TooltipContent variant="white">
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      meta: 'File Name',
    },
    {
      id: 'category',
      accessorFn: (row) =>
        CUSTOMER_ATTACHMENT_CATEGORY_LABELS[row.category] ?? row.category,
      header: ({ column }) => {
        return <TableClientSortableHeader column={column} title="Category" />;
      },
      cell: (info) => {
        const value = (info.getValue() as string) || 'N/A';
        return (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="block w-[140px] truncate sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]">
                {value}
              </div>
            </TooltipTrigger>
            <TooltipContent variant="white">
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      meta: 'Category',
    },
    {
      id: 'uploadedAt',
      accessorFn: (row) => row.uploadedAt,
      header: ({ column }) => {
        return (
          <TableClientSortableHeader column={column} title="Date Uploaded" />
        );
      },
      cell: (info) => {
        const value = info.getValue() as string;
        const formatted = value ? formatLocalDate(value) : 'N/A';
        return <div className="py-2">{formatted}</div>;
      },
      meta: 'Date Uploaded',
    },
    {
      id: 'actions',
      header: () => {
        return <div></div>;
      },
      cell: ({ row }) => {
        const attachment = row.original;
        return (
          <CustomerAttachmentTableActions
            customerId={customerId}
            attachment={attachment}
          />
        );
      },
    },
  ];
