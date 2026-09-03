'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';
import { CASH_SALE_PAYMENT_TYPES } from '@/lib/types/payments';
import { centsToDollars } from '@/lib/utils/currency';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useCreateCashSale } from '@/lib/api/payments';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { notifyError } from '@/lib/toast';
import { docketTypeLabel } from '@/lib/utils/docket-financial-eligibility';

export function CashSaleConfirmDialog({
  open,
  onOpenChange,
  dockets,
  onRecorded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dockets: DocketDTO[];
  onRecorded?: () => void;
}) {
  const { currencySymbol } = useTenantCurrencyTax();
  const createCashSale = useCreateCashSale();
  const total = dockets.reduce((sum, docket) => sum + (docket.totalInvoiceAmount ?? 0), 0);

  const confirm = async (paymentType: string) => {
    try {
      await createCashSale.mutateAsync({
        docketIds: dockets.map((docket) => docket.id),
        paymentType,
      });
      onOpenChange(false);
      onRecorded?.();
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <div className="px-6 pt-5 pb-1 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden />
          </div>
          <DialogHeader className="items-center space-y-2 text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Record Cash Sale
            </DialogTitle>
            <DialogDescription className="text-[15px] text-slate-600">
              Record cash/EFTPOS payment for {dockets.length} docket
              {dockets.length === 1 ? '' : 's'}? No invoice will be created.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-4">
          <div className="rounded-xl bg-slate-100 p-4 flex flex-col gap-2">
            {dockets.map((docket) => (
              <div
                key={docket.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {docket.docketNumber} · {docketTypeLabel(docket)}
                </span>
                <span className="font-medium">
                  {currencySymbol}
                  {centsToDollars(docket.totalInvoiceAmount ?? 0)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t text-sm font-semibold">
              <span>Total Amount Received</span>
              <span>
                {currencySymbol}
                {centsToDollars(total)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row gap-3 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="h-11 flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]"
                disabled={createCashSale.isPending || dockets.length === 0}
              >
                Confirm Sale
                <ChevronDown className="ml-1.5 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {CASH_SALE_PAYMENT_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => void confirm(type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DialogContent>
    </Dialog>
  );
}
