'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  CirclePlay,
  Undo2,
  CircleX,
  CircleCheckBig,
  Square,
  ReceiptText,
  Receipt,
  Check,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { Docket } from '@/lib/types/docket';

interface DocketTableActionsProps {
  docket: Docket;
}

export function DocketTableActions({ docket }: DocketTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useDocketActions(docket);

  const createHandler = (actionFn: () => void) => () => {
    setDropdownOpen(false);
    actionFn();
  };

  const status = docket.status;

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Always available */}
          <DropdownMenuItem onClick={createHandler(actions.viewDetails)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          {/* DELIVERY statuses */}
          {status === 'UNASSIGNED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.assign)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'ASSIGNED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.startTransit)}>
                <CirclePlay className="h-4 w-4 mr-2" />
                Start Transit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.unassign)}>
                <Undo2 className="h-4 w-4 mr-2" />
                Unassign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'IN_TRANSIT' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.markArrived)}>
                <CircleCheckBig className="h-4 w-4 mr-2" />
                Mark Arrived
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.stop)}
                className="text-red-600 focus:text-red-600"
              >
                <Square className="h-4 w-4 mr-2 text-red-600" />
                Stop
              </DropdownMenuItem>
            </>
          )}

          {status === 'STOPPED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.resumeTransit)}>
                <ReceiptText className="h-4 w-4 mr-2" />
                Resume Transit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.unassign)}>
                <Undo2 className="h-4 w-4 mr-2" />
                Unassign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'ARRIVED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.markDelivered)}>
                <CircleCheckBig className="h-4 w-4 mr-2" />
                Mark Delivered
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'DELIVERED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.invoice)}>
                <Receipt className="h-4 w-4 mr-2" />
                Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'INVOICED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.viewInvoice)}>
                <Receipt className="h-4 w-4 mr-2" />
                View Invoice
              </DropdownMenuItem>
            </>
          )}

          {/* COLLECTION statuses */}
          {status === 'PENDING' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.startPreparing)}>
                <CirclePlay className="h-4 w-4 mr-2" />
                Start Preparing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'PREPARING' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.markReady)}>
                <Check className="h-4 w-4 mr-2" />
                Mark Ready
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.backToPending)}>
                <Undo2 className="h-4 w-4 mr-2" />
                Back to Pending
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'READY' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.markCollected)}>
                <CircleCheckBig className="h-4 w-4 mr-2" />
                Mark Collected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.backToPreparing)}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Back to Preparing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cancel)}>
                <CircleX className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={createHandler(actions.void)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Void
              </DropdownMenuItem>
            </>
          )}

          {status === 'COLLECTED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cashSale)}>
                <ReceiptText className="h-4 w-4 mr-2" />
                Cash Sale
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.invoice)}>
                <Receipt className="h-4 w-4 mr-2" />
                Invoice
              </DropdownMenuItem>
            </>
          )}

          {status === 'CASH_SALE' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={createHandler(actions.cashReceipts)}>
                <ReceiptText className="h-4 w-4 mr-2" />
                Cash Receipts
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
