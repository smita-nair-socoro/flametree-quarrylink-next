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
import { FileText, ShoppingCart, ChevronDown, HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { centsToDollars } from '@/lib/utils/currency';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useCreateInvoice } from '@/lib/api/invoices';
import { CashSaleConfirmDialog } from '@/components/cash-sale-confirm-dialog';
import { isCashSaleEligible, isInvoiceEligible } from '@/lib/utils/docket-financial-eligibility';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InvoicesBulkActionsProps {
  selectedDockets: DocketDTO[];
  onClearSelection: () => void;
}

export function InvoiceActions({
  selectedDockets,
  onClearSelection,
}: InvoicesBulkActionsProps) {
  const [dialogType, setDialogType] = React.useState<
    'bulk' | 'individual' | null
  >(null);
  const [cashSaleOpen, setCashSaleOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { currencySymbol, exTaxLabel } = useTenantCurrencyTax();
  const [includeDeliveryPrices, setIncludeDeliveryPrices] =
    React.useState(false);

  const hasDeliveryCost = selectedDockets.some(
    (d) => d.jobItem?.jobItemType !== 'COLLECTION',
  );

  const createInvoiceMutation = useCreateInvoice({
    jobId: selectedDockets[0]?.jobId,
    onSuccess: () => {
      setDialogType(null);
      onClearSelection();
    },
  });

  const handleActionClick = (type: 'bulk' | 'individual') => {
    if (selectedDockets.length > 0) {
      setDropdownOpen(false);
      setDialogType(type);
    }
  };

  const invoiceEnabled =
    selectedDockets.length > 0 && selectedDockets.every(isInvoiceEligible);
  const cashSaleEnabled =
    selectedDockets.length > 0 && selectedDockets.every(isCashSaleEligible);
  const cashSaleDisabledReason =
    selectedDockets.length === 0
      ? 'Select at least one docket'
      : cashSaleEnabled
        ? undefined
        : 'Cash Sale requires Collected collection dockets or Delivered delivery dockets that are not invoiced or cash sold';
  const invoiceDisabledReason =
    selectedDockets.length === 0
      ? 'Select at least one docket'
      : invoiceEnabled
        ? undefined
        : 'Invoice requires Collected collection dockets or Delivered delivery dockets that are not invoiced or cash sold';

  if (selectedDockets.length === 0) return null;

  const isIndividual = dialogType === 'individual';

  return (
    <>
      <Dialog
        open={dialogType !== null}
        onOpenChange={(open) => !open && setDialogType(null)}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
          <div className="px-6 pt-5 pb-1 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center">
              {isIndividual ? (
                <ShoppingCart className="h-10 w-10 text-[#8E51FF] font-extrabold" />
              ) : (
                <FileText className="h-10 w-10 text-[#8E51FF] font-extrabold" />
              )}
            </div>
            <DialogHeader className="items-center space-y-2 text-center">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isIndividual
                  ? 'Create Individual Invoices'
                  : 'Create Bulk Invoice'}
              </DialogTitle>
              <DialogDescription className="text-[15px] text-slate-600 mb-4">
                {isIndividual
                  ? `Create ${selectedDockets.length} separate invoice(s), one for each docket?`
                  : `Create a single invoice with ${selectedDockets.length} docket${selectedDockets.length === 1 ? '' : 's'} as line items?`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-4">
            <div className="flex flex-col gap-3 rounded-xl bg-slate-100 p-4">
              {hasDeliveryCost && includeDeliveryPrices ? (
                <>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Total Product Amount</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help mt-0.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{exTaxLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-bold v text-lg">
                      {currencySymbol}
                      {centsToDollars(
                        selectedDockets.reduce(
                          (acc, docket) => acc + docket.totalProductAmount,
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Total Delivery Amount</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help mt-0.5 -ml-0.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{exTaxLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <span className="font-bold text-[#101828] text-lg">
                      {currencySymbol}
                      {centsToDollars(
                        selectedDockets.reduce(
                          (acc, docket) => acc + docket.totalDeliveryAmount,
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">Total Amount</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help mt-0.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{exTaxLabel}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-bold text-[#101828] text-lg">
                    {currencySymbol}
                    {centsToDollars(
                      selectedDockets.reduce(
                        (acc, docket) => acc + docket.totalInvoiceAmount,
                        0,
                      ),
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {hasDeliveryCost && (
            <div className="px-6 pb-5">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-md font-semibold text-[#101828]">
                      Separate Delivery Line Items
                    </p>
                    <p className="text-sm leading-relaxed text-[#6A7282]">
                      {includeDeliveryPrices ? (
                        <>
                          Delivery charges will appear as separate invoice for
                          each docket.
                        </>
                      ) : (
                        <>
                          Delivery charges will be included in the product line
                          item totals for each docket.
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
          )}

          <div className="flex w-full flex-row gap-3 border-gray-100 px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-lg border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setDialogType(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-lg bg-[#8E51FF] font-semibold text-white hover:bg-[#7c46e0]"
              disabled={createInvoiceMutation.isPending}
              onClick={() => {
                createInvoiceMutation.mutate({
                  mode: isIndividual ? 'INDIVIDUAL' : 'BULK',
                  docketIds: selectedDockets.map((d) => d.id),
                  inclDeliveryCost: hasDeliveryCost
                    ? !includeDeliveryPrices
                    : false,
                });
              }}
            >
              {createInvoiceMutation.isPending
                ? 'Creating...'
                : isIndividual
                  ? 'Create Invoices'
                  : 'Create Invoice'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-4 rounded-xl border p-3 bg-[#F8FAFC] border-[#E2E8F0] shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <p className="text-[15px] font-bold text-[#0F172A] pl-2">
            {selectedDockets.length}{' '}
            {selectedDockets.length === 1 ? 'item' : 'items'} selected
          </p>
          <Button
            variant="link"
            onClick={onClearSelection}
            className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] px-2"
          >
            Clear Selection
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={!cashSaleEnabled}
            title={cashSaleDisabledReason}
            onClick={() => setCashSaleOpen(true)}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold h-9 px-4 rounded-lg shadow-sm transition-colors"
          >
            Cash Sale ({selectedDockets.length} selected)
          </Button>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={!invoiceEnabled}
                title={invoiceDisabledReason}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold h-9 px-4 rounded-lg shadow-sm transition-colors"
              >
                Invoice ({selectedDockets.length} selected)
                <ChevronDown className="h-4 w-4 ml-1.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[250px] rounded-xl border border-gray-200 bg-white shadow-lg p-1.5"
            >
              <DropdownMenuItem
                onClick={() => handleActionClick('bulk')}
                className="cursor-pointer gap-3 rounded-lg p-2.5 focus:bg-gray-50 focus:text-gray-900 transition-colors"
              >
                <FileText
                  className="size-[18px] shrink-0 text-[#8B5CF6] stroke-[2]"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-[13px] font-medium">Bulk Invoice</span>
                  <span className="text-[11px] font-medium leading-snug text-slate-500">
                    All dockets as line items in one invoice
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick('individual')}
                className="cursor-pointer gap-3 rounded-lg p-2.5 focus:bg-gray-50 focus:text-gray-900 transition-colors"
              >
                <ShoppingCart
                  className="size-[18px] shrink-0 text-[#8B5CF6] stroke-[2]"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-[13px] font-medium">
                    Individual Invoices
                  </span>
                  <span className="text-[11px] font-medium leading-snug text-slate-500">
                    Separate invoice for each docket
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CashSaleConfirmDialog
        open={cashSaleOpen}
        onOpenChange={setCashSaleOpen}
        dockets={selectedDockets}
        onRecorded={onClearSelection}
      />
    </>
  );
}
