'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  CirclePlay,
  Undo2,
  CircleX,
  CircleCheckBig,
  Square,
  ReceiptText,
  Receipt,
  Check,
  Trash2,
  LucideIcon,
  UserRoundPlus,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

interface DocketActionButtonsProps {
  docket: DocketDTO | null | undefined;
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
    { label: 'Start Preparing', icon: CirclePlay, action: 'startPreparing', separator: true },
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
    { label: 'Back to Pending', icon: Undo2, action: 'backToPending', separator: true },
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
    { label: 'Mark Collected', icon: CircleCheckBig, action: 'markCollected', separator: true },
    { label: 'Back to Preparing', icon: Undo2, action: 'backToPreparing', separator: true },
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
    { label: 'Cash Sale', icon: ReceiptText, action: 'cashSale', separator: true },
    { label: 'Invoice', icon: Receipt, action: 'invoice', separator: true },
  ],
  [DOCKET_STATUS.CASH_SALE]: [
    { label: 'Cash Receipts', icon: ReceiptText, action: 'cashReceipts', separator: true },
  ],
  [DOCKET_STATUS.INVOICED]: [
    { label: 'View Invoice', icon: Receipt, action: 'viewInvoice', separator: true },
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
    { label: 'Start Transit', icon: CirclePlay, action: 'startTransit', separator: true },
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
    { label: 'Mark Arrived', icon: CircleCheckBig, action: 'markArrived', separator: true },
    { label: 'Stop', icon: Square, action: 'stop', className: 'text-red-600', separator: true },
  ],
  [DOCKET_STATUS.STOPPED]: [
    { label: 'Resume Transit', icon: ReceiptText, action: 'resumeTransit', separator: true },
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
    { label: 'Mark Delivered', icon: CircleCheckBig, action: 'markDelivered', separator: true },
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

export function DocketActionButtons({ docket }: DocketActionButtonsProps) {
  const { actions, confirmDialogs, viewDialog } = useDocketActions(docket);

  if (!docket || !docket.id) {
    return null;
  }

  let currentActions = [...(ACTION_CONFIG[docket.docketStatus] || [])];

  if (docket.docketStatus === DOCKET_STATUS.INVOICED && docket.invoiceStatus === 'FAILED') {
    currentActions = [{
      label: 'Retry Sync',
      icon: RefreshCw,
      action: 'retrySync',
    }];
  }

  if (currentActions.length === 0) {
    return (
      <>
        {confirmDialogs}
        {viewDialog}
      </>
    );
  }

  const primaryAction = currentActions[0];
  const secondaryActions = currentActions.slice(1);

  return (
    <div className="flex items-start">
      {confirmDialogs}
      {viewDialog}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => actions[primaryAction.action]?.()}
          className={`rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800 ${primaryAction.className || ''}`}
        >
          <primaryAction.icon className="h-4 w-4 mr-2" />
          {primaryAction.label}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {secondaryActions.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {item.separator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onSelect={() => actions[item.action]?.()}
                  className={item.className}
                >
                  <item.icon
                    className={`h-4 w-4 mr-2 ${item.className || ''}`}
                  />
                  {item.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => actions['duplicate']?.()}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
