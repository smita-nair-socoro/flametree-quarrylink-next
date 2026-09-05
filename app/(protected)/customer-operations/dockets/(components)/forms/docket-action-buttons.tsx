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
  Printer,
  FileText,
} from 'lucide-react';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { notifyWarning } from '@/lib/toast';
import { isInternalTransferDocket } from '@/lib/utils/docket-financial-eligibility';
import { useHasVoidTransactions } from '@/app/stores/user-store';

interface DocketActionButtonsProps {
  docket: DocketDTO | null | undefined;
  hasUnsavedChanges?: boolean;
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
  | 'viewJournal'
  | 'assign'
  | 'backToPending'
  // | 'backToPreparing'
  | 'retrySync'
  | 'print';

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
    { label: 'Cancel', icon: CircleX, action: 'cancel' },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.PREPARING]: [
    { label: 'Mark Ready', icon: Check, action: 'markReady', separator: true },
    { label: 'Back to Pending', icon: Undo2, action: 'backToPending' },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.READY]: [
    {
      label: 'Mark Collected',
      icon: CircleCheckBig,
      action: 'markCollected',
      separator: true,
    },
    // { label: 'Back to Preparing', icon: Undo2, action: 'backToPreparing' },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.COLLECTED]: [
    { label: 'Cash Sale', icon: ReceiptText, action: 'cashSale', separator: true },
    { label: 'Invoice', icon: Receipt, action: 'invoice' },
    { label: 'Duplicate', icon: Copy, action: 'duplicate' },

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
    { label: 'Duplicate', icon: Copy, action: 'duplicate' },
  ],
  [DOCKET_STATUS.INVOICED]: [
    {
      label: 'View Invoice',
      icon: Receipt,
      action: 'viewInvoice',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate' },
  ],
  [DOCKET_STATUS.UNASSIGNED]: [
    { label: 'Assign', icon: UserRoundPlus, action: 'assign', separator: true },
    { label: 'Cancel', icon: CircleX, action: 'cancel' },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.ASSIGNED]: [
    {
      label: 'Start Transit',
      icon: CirclePlay,
      action: 'startTransit',
      separator: true,
    },
    { label: 'Unassign', icon: Undo2, action: 'unassign' },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.IN_TRANSIT]: [
    {
      label: 'Mark Arrived',
      icon: CircleCheckBig,
      action: 'markArrived',
      separator: true,
    },
    { label: 'Stop', icon: Square, action: 'stop', className: 'text-red-600' },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.STOPPED]: [
    {
      label: 'Resume Transit',
      icon: ReceiptText,
      action: 'resumeTransit',
      separator: true,
    },
    { label: 'Unassign', icon: Undo2, action: 'unassign' },
    { label: 'Cancel', icon: CircleX, action: 'cancel', separator: true },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.ARRIVED]: [
    {
      label: 'Mark Delivered',
      icon: CircleCheckBig,
      action: 'markDelivered',
      separator: true,
    },
    { label: 'Cancel', icon: CircleX, action: 'cancel' },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
  [DOCKET_STATUS.DELIVERED]: [
    // Delivery dockets: invoice only — never Cash Sale (spec §3 / §14).
    { label: 'Invoice', icon: Receipt, action: 'invoice' },
    { label: 'Cancel', icon: CircleX, action: 'cancel' },
    {
      label: 'Void',
      icon: Trash2,
      action: 'void',
      className: 'text-red-600',
      separator: true,
    },
    { label: 'Duplicate', icon: Copy, action: 'duplicate', separator: true },
  ],
};

export function DocketActionButtons({
  docket,
  hasUnsavedChanges = false,
}: Readonly<DocketActionButtonsProps>) {
  const { actions, confirmDialogs, viewDialog } = useDocketActions(docket);
  const canVoidTransactions = useHasVoidTransactions();
  const isInternalTransfer = isInternalTransferDocket(docket);

  const handleAction = (action: ActionType) => {
    if (hasUnsavedChanges) {
      notifyWarning('You have unsaved changes. Please save first');
      return;
    }
    actions[action]?.();
  };

  if (!docket?.id) {
    return null;
  }

  let currentActions = [...(ACTION_CONFIG[docket.docketStatus] || [])];

  if (isInternalTransfer) {
    const completed =
      docket.docketStatus === DOCKET_STATUS.DELIVERED ||
      docket.docketStatus === DOCKET_STATUS.COLLECTED;
    const voided = docket.docketStatus === DOCKET_STATUS.VOIDED;
    currentActions = currentActions.filter(
      (item) => item.action !== 'invoice' && item.action !== 'cashSale',
    );
    if (voided) {
      // Spec: voided transfer ⋯ is View Journal only (immutable audit record).
      currentActions = [
        { label: 'View Journal', icon: FileText, action: 'viewJournal' },
      ];
    } else if (completed) {
      currentActions = [
        { label: 'View Journal', icon: FileText, action: 'viewJournal' },
        ...(canVoidTransactions
          ? [
              {
                label: 'Void',
                icon: Trash2,
                action: 'void' as ActionType,
                className: 'text-red-600',
              },
            ]
          : []),
      ];
    }
  }

  if (
    docket.docketStatus === DOCKET_STATUS.INVOICED &&
    docket.invoiceStatus === 'FAILED'
  ) {
    currentActions = [
      {
        label: 'Retry Sync',
        icon: RefreshCw,
        action: 'retrySync',
        separator: true,
      },
      { label: 'Duplicate', icon: Copy, action: 'duplicate' },
    ];
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
  const secondaryActions: ActionItem[] = [
    ...currentActions.slice(1),
    { label: 'Print Docket', icon: Printer, action: 'print', separator: true },
  ];

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(primaryAction.action)}
          className={`rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800 ${primaryAction.className || ''}`}
        >
          <primaryAction.icon className="h-4 w-4 mr-2" />
          {primaryAction.label}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {secondaryActions.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {item.separator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onSelect={() => handleAction(item.action)}
                  className={item.className}
                >
                  <item.icon
                    className={`h-4 w-4 mr-2 ${item.className || ''}`}
                  />
                  {item.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
