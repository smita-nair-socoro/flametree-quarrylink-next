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
import { useQueryClient } from '@tanstack/react-query';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { DocketByIdQueryOptions } from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { INVOICE_STATUS } from '@/lib/types/invoice-enums';
import { notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

interface DocketTableActionsProps {
  docketId: number;
  status: string;
  invoiceStatus?: INVOICE_STATUS | string;
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

export function DocketTableActions({
  docketId,
  status,
  invoiceStatus,
}: Readonly<DocketTableActionsProps>) {
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [fullDocket, setFullDocket] = React.useState<DocketDTO | null>(null);
  const pendingActionRef = React.useRef<ActionType | 'view' | null>(null);

  const statusStub = React.useMemo(
    () =>
      ({
        id: docketId,
        docketStatus: status as DOCKET_STATUS,
        invoiceStatus: invoiceStatus as INVOICE_STATUS | undefined,
      }) as DocketDTO,
    [docketId, status, invoiceStatus],
  );

  const resolvedDocket =
    fullDocket?.id === docketId ? fullDocket : statusStub;
  const { actions, confirmDialogs, viewDialog } =
    useDocketActions(resolvedDocket);

  const resolveFullDocket = React.useCallback(async () => {
    if (fullDocket?.id === docketId) return fullDocket;
    try {
      const data = await queryClient.fetchQuery(
        DocketByIdQueryOptions(docketId),
      );
      setFullDocket(data);
      return data;
    } catch (error) {
      notifyError(extractErrorMessage(error));
      return null;
    }
  }, [docketId, fullDocket, queryClient]);

  React.useEffect(() => {
    const pending = pendingActionRef.current;
    if (!pending || fullDocket?.id !== docketId) return;
    pendingActionRef.current = null;
    if (pending === 'view') {
      actions.view(fullDocket);
    } else {
      actions[pending]?.();
    }
  }, [fullDocket, docketId, actions]);

  const handleDropdownOpenChange = React.useCallback(
    (open: boolean) => {
      setDropdownOpen(open);
      if (open) {
        void resolveFullDocket();
      }
    },
    [resolveFullDocket],
  );

  const handleView = async () => {
    setDropdownOpen(false);
    pendingActionRef.current = 'view';
    const data = await resolveFullDocket();
    if (!data) {
      pendingActionRef.current = null;
      return;
    }
    if (fullDocket?.id === docketId) {
      pendingActionRef.current = null;
      actions.view(data);
    }
  };

  const handleAction = async (actionType: ActionType) => {
    setDropdownOpen(false);
    pendingActionRef.current = actionType;
    const data = await resolveFullDocket();
    if (!data) {
      pendingActionRef.current = null;
      return;
    }
    if (fullDocket?.id === docketId) {
      pendingActionRef.current = null;
      actions[actionType]?.();
    }
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
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
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
    </div>
  );
}
