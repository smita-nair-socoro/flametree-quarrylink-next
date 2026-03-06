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
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { Docket } from '@/lib/types/docket';

interface DocketActionButtonsProps {
  docket: Docket | null | undefined;
  layout?: 'compact' | 'expanded';
  hideViewDetails?: boolean;
  suppressViewDialog?: boolean;
}

export function DocketActionButtons({
  docket,
  layout = 'expanded',
  suppressViewDialog = false,
}: DocketActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { actions, confirmDialogs, viewDialog } = useDocketActions(docket);

  if (!docket || !docket.id) {
    return null;
  }

  const status = docket.status;

  // Statuses that have secondary (···) dropdown actions
  const hasSecondaryActions = [
    'UNASSIGNED',
    'ASSIGNED',
    'IN_TRANSIT',
    'STOPPED',
    'ARRIVED',
    'DELIVERED',
    'PENDING',
    'PREPARING',
    'READY',
  ].includes(status ?? '');

  // Mobile / compact — everything in a single dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {!suppressViewDialog && viewDialog}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {status === 'UNASSIGNED' && (
              <DropdownMenuItem onClick={actions.assign}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </DropdownMenuItem>
            )}
            {status === 'ASSIGNED' && (
              <>
                <DropdownMenuItem onClick={actions.startTransit}>
                  <CirclePlay className="h-4 w-4 mr-2" />
                  Start Transit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.unassign}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Unassign
                </DropdownMenuItem>
              </>
            )}
            {status === 'IN_TRANSIT' && (
              <DropdownMenuItem onClick={actions.markArrived}>
                <CircleCheckBig className="h-4 w-4 mr-2" />
                Mark Arrived
              </DropdownMenuItem>
            )}
            {status === 'STOPPED' && (
              <>
                <DropdownMenuItem onClick={actions.resumeTransit}>
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Resume Transit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.unassign}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Unassign
                </DropdownMenuItem>
              </>
            )}
            {status === 'ARRIVED' && (
              <DropdownMenuItem onClick={actions.markDelivered}>
                <CircleCheckBig className="h-4 w-4 mr-2" />
                Mark Delivered
              </DropdownMenuItem>
            )}
            {status === 'DELIVERED' && (
              <DropdownMenuItem onClick={actions.invoice}>
                <Receipt className="h-4 w-4 mr-2" />
                Invoice
              </DropdownMenuItem>
            )}
            {status === 'INVOICED' && (
              <DropdownMenuItem onClick={actions.viewInvoice}>
                <Receipt className="h-4 w-4 mr-2" />
                View Invoice
              </DropdownMenuItem>
            )}
            {status === 'PENDING' && (
              <DropdownMenuItem onClick={actions.startPreparing}>
                <CirclePlay className="h-4 w-4 mr-2" />
                Start Preparing
              </DropdownMenuItem>
            )}
            {status === 'PREPARING' && (
              <>
                <DropdownMenuItem onClick={actions.markReady}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark Ready
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.backToPending}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Back to Pending
                </DropdownMenuItem>
              </>
            )}
            {status === 'READY' && (
              <>
                <DropdownMenuItem onClick={actions.markCollected}>
                  <CircleCheckBig className="h-4 w-4 mr-2" />
                  Mark Collected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.backToPreparing}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Back to Preparing
                </DropdownMenuItem>
              </>
            )}
            {status === 'COLLECTED' && (
              <>
                <DropdownMenuItem onClick={actions.cashSale}>
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Cash Sale
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.invoice}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Invoice
                </DropdownMenuItem>
              </>
            )}
            {status === 'CASH_SALE' && (
              <DropdownMenuItem onClick={actions.cashReceipts}>
                <ReceiptText className="h-4 w-4 mr-2" />
                Cash Receipts
              </DropdownMenuItem>
            )}
            {/* Secondary actions */}
            {(status === 'IN_TRANSIT') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={actions.stop}
                  className="text-red-600 focus:text-red-600"
                >
                  <Square className="h-4 w-4 mr-2 text-red-600" />
                  Stop
                </DropdownMenuItem>
              </>
            )}
            {[
              'UNASSIGNED',
              'ASSIGNED',
              'STOPPED',
              'ARRIVED',
              'DELIVERED',
              'PENDING',
              'PREPARING',
              'READY',
            ].includes(status ?? '') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={actions.cancel}>
                  <CircleX className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={actions.void}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                  Void
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop expanded — inline colored buttons + ··· overflow
  return (
    <div className="flex items-start">
      {confirmDialogs}
      {!suppressViewDialog && viewDialog}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {/* DELIVERY primary actions */}
        {status === 'UNASSIGNED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.assign}
            className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        )}

        {status === 'ASSIGNED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.startTransit}
            className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
          >
            <CirclePlay className="h-4 w-4 mr-2" />
            Start Transit
          </Button>
        )}

        {status === 'IN_TRANSIT' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.markArrived}
            className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
          >
            <CircleCheckBig className="h-4 w-4 mr-2" />
            Mark Arrived
          </Button>
        )}

        {status === 'STOPPED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.resumeTransit}
            className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
          >
            <ReceiptText className="h-4 w-4 mr-2" />
            Resume Transit
          </Button>
        )}

        {status === 'ARRIVED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.markDelivered}
            className="rounded-none border-r border-gray-200 bg-purple-50 hover:bg-purple-100 text-purple-900 hover:text-purple-800"
          >
            <CircleCheckBig className="h-4 w-4 mr-2" />
            Mark Delivered
          </Button>
        )}

        {status === 'DELIVERED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.invoice}
            className="rounded-none border-r border-gray-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 hover:text-indigo-800"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        )}

        {status === 'INVOICED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.viewInvoice}
            className="rounded-none border-r border-gray-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 hover:text-indigo-800"
          >
            <Receipt className="h-4 w-4 mr-2" />
            View Invoice
          </Button>
        )}

        {/* COLLECTION primary actions */}
        {status === 'PENDING' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.startPreparing}
            className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
          >
            <CirclePlay className="h-4 w-4 mr-2" />
            Start Preparing
          </Button>
        )}

        {status === 'PREPARING' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.markReady}
            className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark Ready
          </Button>
        )}

        {status === 'READY' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.markCollected}
            className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
          >
            <CircleCheckBig className="h-4 w-4 mr-2" />
            Mark Collected
          </Button>
        )}

        {status === 'COLLECTED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.cashSale}
              className="rounded-none border-r border-gray-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 hover:text-yellow-800"
            >
              <ReceiptText className="h-4 w-4 mr-2" />
              Cash Sale
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.invoice}
              className="rounded-none border-r border-gray-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 hover:text-indigo-800"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Invoice
            </Button>
          </>
        )}

        {status === 'CASH_SALE' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.cashReceipts}
            className="rounded-none border-r border-gray-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 hover:text-yellow-800"
          >
            <ReceiptText className="h-4 w-4 mr-2" />
            Cash Receipts
          </Button>
        )}

        {/* ··· secondary actions dropdown */}
        {hasSecondaryActions && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {status === 'ASSIGNED' && (
                <>
                  <DropdownMenuItem onClick={actions.unassign}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Unassign
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {status === 'STOPPED' && (
                <>
                  <DropdownMenuItem onClick={actions.unassign}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Unassign
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {status === 'IN_TRANSIT' && (
                <>
                  <DropdownMenuItem
                    onClick={actions.stop}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Square className="h-4 w-4 mr-2 text-red-600" />
                    Stop
                  </DropdownMenuItem>
                </>
              )}
              {status === 'PREPARING' && (
                <>
                  <DropdownMenuItem onClick={actions.backToPending}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Back to Pending
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {status === 'READY' && (
                <>
                  <DropdownMenuItem onClick={actions.backToPreparing}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Back to Preparing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {![
                'IN_TRANSIT',
                'COLLECTED',
                'CASH_SALE',
                'INVOICED',
              ].includes(status ?? '') && (
                <>
                  <DropdownMenuItem onClick={actions.cancel}>
                    <CircleX className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={actions.void}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                    Void
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
