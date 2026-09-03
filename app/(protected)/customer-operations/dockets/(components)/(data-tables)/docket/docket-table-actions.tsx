'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  CircleX,
  Undo2,
  CircleCheckBig,
  Check,
  ReceiptText,
  Square,
  CirclePlay,
  Receipt,
  Trash2,
  LucideIcon,
  UserRoundPlus,
  Copy,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { INVOICE_STATUS } from '@/lib/types/invoice-enums';
import {
  useDocketRowActions,
  type DocketTableActionType,
} from './docket-table-action-host';

interface DocketTableActionsProps {
  docketId: number;
  status: string;
  invoiceStatus?: INVOICE_STATUS | string;
}

export type { DocketTableActionType };

interface ActionItem {
  label: string;
  icon: LucideIcon;
  action: DocketTableActionType;
  className?: string;
  separator?: boolean;
}

const ACTION_CONFIG: Partial<Record<DOCKET_STATUS, ActionItem[]>> = {
  [DOCKET_STATUS.PENDING]: [
    {
      label: 'Start Preparing',
      icon: CirclePlay,
      action: 'startPreparing',
      separator: true,
    },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.PREPARING]: [
    { label: 'Mark Ready', icon: Check, action: 'markReady', separator: true },
    {
      label: 'Back to Pending',
      icon: Undo2,
      action: 'backToPending',
      separator: true,
    },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.READY]: [
    {
      label: 'Mark Collected',
      icon: CircleCheckBig,
      action: 'markCollected',
      separator: true,
    },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.COLLECTED]: [
    { label: 'Invoice', icon: Receipt, action: 'invoice', separator: true },
    { label: 'Cash Sale', icon: ReceiptText, action: 'cashSale', separator: true },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.CASH_SALE]: [
    {
      label: 'View Receipt',
      icon: ReceiptText,
      action: 'cashReceipts',
      separator: true,
    },
  ],
  [DOCKET_STATUS.INVOICED]: [
    {
      label: 'View Invoice',
      icon: Receipt,
      action: 'viewInvoice',
      separator: true,
    },
  ],
  [DOCKET_STATUS.UNASSIGNED]: [
    { label: 'Assign', icon: UserRoundPlus, action: 'assign', separator: true },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.ASSIGNED]: [
    {
      label: 'Start Transit',
      icon: CirclePlay,
      action: 'startTransit',
      separator: true,
    },
    { label: 'Unassign', icon: Undo2, action: 'unassign', separator: true },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.IN_TRANSIT]: [
    {
      label: 'Mark Arrived',
      icon: CircleCheckBig,
      action: 'markArrived',
      separator: true,
    },
    {
      label: 'Stop',
      icon: Square,
      action: 'stop',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.STOPPED]: [
    {
      label: 'Resume Transit',
      icon: ReceiptText,
      action: 'resumeTransit',
      separator: true,
    },
    { label: 'Unassign', icon: Undo2, action: 'unassign', separator: true },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.ARRIVED]: [
    {
      label: 'Mark Delivered',
      icon: CircleCheckBig,
      action: 'markDelivered',
      separator: true,
    },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
  [DOCKET_STATUS.DELIVERED]: [
    { label: 'Invoice', icon: Receipt, action: 'invoice', separator: true },
    { label: 'Cash Sale', icon: ReceiptText, action: 'cashSale', separator: true },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
  ],
};

/** Row action menu only — dialogs/actions live on the parent via useDocketTableActionHost. */
export function DocketTableActions({
  docketId,
  status,
  invoiceStatus,
}: Readonly<DocketTableActionsProps>) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { runAction } = useDocketRowActions();

  const handleView = () => {
    setDropdownOpen(false);
    runAction(docketId, 'view');
  };

  const handleAction = (actionType: DocketTableActionType) => {
    setDropdownOpen(false);
    runAction(docketId, actionType);
  };

  let currentActions = [
    ...(ACTION_CONFIG[status as DOCKET_STATUS] || []),
  ];

  if (status === DOCKET_STATUS.INVOICED && invoiceStatus === 'FAILED') {
    currentActions = [
      {
        label: 'Retry Sync',
        icon: RefreshCw,
        action: 'retrySync',
        separator: true,
      },
    ];
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>

        {currentActions.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => handleAction(item.action)}
              className={item.className}
            >
              <item.icon className={`h-4 w-4 mr-2 ${item.className || ''}`} />
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAction('duplicate')}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAction('print')}>
          <Printer className="h-4 w-4 mr-2" />
          Print Docket
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
