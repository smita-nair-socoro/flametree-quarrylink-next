'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocketDTO } from '@/lib/types/docket';
import { Switch } from '@/components/ui/switch';
import { FileText, ShoppingCart, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { centsToDollars } from '@/lib/utils/currency';

interface InvoicesBulkActionsProps {
  selectedDockets: DocketDTO[];
  onClearSelection: () => void;
}

/** Placeholder totals until invoice preview is wired to the API */
const PLACEHOLDER_PRODUCT_TOTAL = centsToDollars(2400000);
const PLACEHOLDER_DELIVERY_TOTAL = centsToDollars(400000);

export function InvoicesBulkActions({
  selectedDockets,
  onClearSelection,
}: InvoicesBulkActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [includeDeliveryPrices, setIncludeDeliveryPrices] =
    React.useState(false);
  // const bulkCreateInvoiceMutation = useBulkCreateInvoice();

  const handleBulkCreateInvoiceClick = () => {
    if (selectedDockets.length > 0) {
      setDropdownOpen(false);
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
          <div className="px-6 pt-5 pb-1 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center">
              <FileText className="h-10 w-10 text-[#8E51FF] font-extrabold" />
            </div>
            <DialogHeader className="items-center space-y-2 text-center -mt-2">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Create Bulk Invoice
              </DialogTitle>
              <DialogDescription className="text-[15px] text-slate-600 mb-4">
                Create a single invoice with {selectedDockets.length} docket
                {selectedDockets.length === 1 ? '' : 's'} as line items?
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-4">
            <div className="flex flex-col gap-3 rounded-xl bg-slate-100 p-4">
              {includeDeliveryPrices ? (
                <>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-700">Total Product Amount:</span>
                    <span className="font-bold v text-lg">
                      ${PLACEHOLDER_PRODUCT_TOTAL}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-700">
                      Total Delivery Amount:
                    </span>
                    <span className="font-bold text-[#101828] text-lg">
                      ${PLACEHOLDER_DELIVERY_TOTAL}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="font-bold text-[#101828] text-lg">
                    ${PLACEHOLDER_PRODUCT_TOTAL + PLACEHOLDER_DELIVERY_TOTAL}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-5">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-md font-semibold text-[#101828]">
                    Include Delivery Prices
                  </p>
                  <p className="text-sm leading-relaxed text-[#6A7282]">
                    {includeDeliveryPrices ? (
                      <>
                        Delivery prices will be shown as separate line items for
                        each docket
                      </>
                    ) : (
                      <>
                        Delivery prices will be included in the product line
                        items for each docket
                      </>
                    )}
                  </p>
                </div>
                <Switch
                  checked={includeDeliveryPrices}
                  onCheckedChange={setIncludeDeliveryPrices}
                  className="mt-0.5 shrink-0 data-[state=checked]:bg-[#8E51FF]"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-row gap-3 border-t border-gray-100 px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-lg border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-lg bg-[#8E51FF] font-semibold text-white hover:bg-[#7c46e0]"
            >
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-4 rounded-md border p-3 bg-[#EFF6FF] border-[#BEDBFF]">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">
            {selectedDockets.length}{' '}
            {selectedDockets.length === 1 ? 'item' : 'items'} selected
          </p>
          <Button
            variant="link"
            onClick={onClearSelection}
            className="text-sm text-[#155DFC] underline cursor-pointer"
          >
            Clear Selection
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={selectedDockets.length === 0}
                className="bg-[#8E51FF] text-white text-sm p-4"
              >
                Actions ({selectedDockets.length} selected)
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[250px] rounded-xl border border-gray-200 bg-white shadow-md"
            >
              <DropdownMenuItem
                onClick={handleBulkCreateInvoiceClick}
                className="cursor-pointer gap-3 rounded-lg p-2 focus:bg-gray-50 focus:text-gray-900"
              >
                <FileText
                  className="size-[18px] shrink-0 text-gray-500 stroke-[1.5]"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-sm font-semibold text-gray-900">
                    Bulk Invoice
                  </span>
                  <span className="text-xs font-normal leading-snug text-slate-500">
                    All dockets as line items in one invoice
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleBulkCreateInvoiceClick}
                className="cursor-pointer gap-3 rounded-lg p-2 focus:bg-gray-50 focus:text-gray-900"
              >
                <ShoppingCart
                  className="size-[18px] shrink-0 text-gray-500 stroke-[1.5]"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-sm font-semibold text-gray-900">
                    Individual Invoices
                  </span>
                  <span className="text-xs font-normal leading-snug text-slate-500">
                    Separate invoice for each docket
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
