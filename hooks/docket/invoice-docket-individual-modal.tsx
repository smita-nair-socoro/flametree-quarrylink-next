import React, { useState } from 'react';
import { DocketDTO } from '@/lib/types/docket';
import { Switch } from '@/components/ui/switch';
import { centsToDollars } from '@/lib/utils/currency';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCreateInvoice } from '@/lib/api/invoices';

interface InvoiceDocketIndividualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docket: DocketDTO | null | undefined;
}

export function InvoiceDocketIndividualModal({
  open,
  onOpenChange,
  docket,
}: InvoiceDocketIndividualModalProps) {
  const [includeDeliveryPrices, setIncludeDeliveryPrices] = useState(false);

  const createInvoiceMutation = useCreateInvoice({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  if (!docket) return null;

  const hasDeliveryCost = docket.jobItem?.jobItemType !== 'COLLECTION';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        <div className="px-6 pt-5 pb-1 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-[#8E51FF] font-extrabold" />
          </div>
          <DialogHeader className="items-center space-y-2 text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Create Individual Invoice
            </DialogTitle>
            <DialogDescription className="text-[15px] text-slate-600 mb-4">
              Create a separate invoice for this docket?
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
                        <p>(ex-GST)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-bold v text-lg">
                    $
                    {centsToDollars(
                      docket.totalProductAmount,
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
                        <p>(ex-GST)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <span className="font-bold text-[#101828] text-lg">
                    $
                    {centsToDollars(
                      docket.totalDeliveryAmount,
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
                      <p>(ex-GST)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="font-bold text-[#101828] text-lg">
                  $
                  {centsToDollars(
                    docket.totalInvoiceAmount,
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-lg bg-[#8E51FF] font-semibold text-white hover:bg-[#7c46e0]"
            disabled={createInvoiceMutation.isPending}
            onClick={() => {
              createInvoiceMutation.mutate({
                mode: 'INDIVIDUAL',
                docketIds: [docket.id],
                inclDeliveryCost: hasDeliveryCost
                  ? includeDeliveryPrices
                  : false,
              });
            }}
          >
            {createInvoiceMutation.isPending
              ? 'Creating...'
              : 'Create Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
