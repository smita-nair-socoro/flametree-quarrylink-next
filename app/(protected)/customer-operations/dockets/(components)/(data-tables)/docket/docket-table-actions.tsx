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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

interface DocketTableActionsProps {
  docket: DocketDTO;
}

type ActionType =
  | 'view'
  | 'cancel'
  | 'markArrived'
  | 'markDelivered'
  | 'markReady'
  | 'markCollected'
  | 'stop'
  | 'void'
  | 'remove'
  | 'duplicate'
  | 'startTransit'
  | 'resumeTransit'
  | 'unassign'
  | 'startPreparing'
  | 'cashSale'
  | 'invoice'
  | 'cashReceipts'
  | 'viewInvoice'
  | 'assign'
  | 'backToPending'
  | 'backToPreparing'
  | 'retrySync';

interface ActionItem {
  label: string;
  icon: LucideIcon;
  action: ActionType;
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
    {
      label: 'Back to Preparing',
      icon: Undo2,
      action: 'backToPreparing',
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
      label: 'Cash Receipts',
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

export function DocketTableActions({ docket }: DocketTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useDocketActions(docket);

  const handleView = () => {
    setDropdownOpen(false);
    actions.view();
  };

  const handleAction = (actionType: ActionType) => {
    setDropdownOpen(false);
    actions[actionType]?.();
  };

  let currentActions = [...(ACTION_CONFIG[docket.docketStatus] || [])];

  if (docket.docketStatus === DOCKET_STATUS.INVOICED && docket.invoiceStatus === 'FAILED') {
    currentActions = [{
      label: 'Retry Sync',
      icon: RefreshCw,
      action: 'retrySync',
      separator: true,
    }];
  }

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
