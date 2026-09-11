'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';
import { CASH_SALE_PAYMENT_TYPES } from '@/lib/types/payments';
import { centsToDollars } from '@/lib/utils/currency';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import {
  useCreatePrepaidJobCashSale,
  useCreatePrepaidQuoteCashSale,
} from '@/lib/api/payments';
import { QuotationWithLineItemsQueryOptions } from '@/lib/api/quotation';
import { JobItemsQueryOptions } from '@/lib/api/job';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { notifyError } from '@/lib/toast';
import { prepaidCashSaleBreakdown } from '@/lib/utils/prepaid';
import { Spinner } from '@/components/ui/spinner';
import type { Quotation, QuotationLineItem } from '@/lib/types/quotation';
import type { JobDetails, JobItem } from '@/lib/types/job';

type PaidLine = {
  id: number;
  productName: string;
  quantity: number;
  uom?: string;
  unitPrice: number;
  lineTotal: number;
};

function quoteLines(quote?: Quotation | null): PaidLine[] {
  return (quote?.quoteItems ?? []).map((item: QuotationLineItem) => ({
    id: item.id ?? 0,
    productName: item.productName,
    quantity: item.productSellQty,
    uom: item.productSellUom,
    unitPrice: item.productSellPrice,
    lineTotal:
      (item.totalProductSellPrice ?? 0) + (item.totalTruckSellPrice ?? 0),
  }));
}

function jobLines(job?: JobDetails | null): PaidLine[] {
  return (job?.jobItems?.content ?? []).map((item: JobItem) => ({
    id: item.id,
    productName: item.product?.productName ?? 'Product',
    quantity: item.productSellQty,
    uom: item.productSellUom,
    unitPrice: item.productSellPrice,
    lineTotal:
      (item.totalProductSellPrice ?? 0) + (item.totalTruckSellPrice ?? 0),
  }));
}

export function PrepaidCashSaleDialog({
  open,
  onOpenChange,
  quoteId,
  jobId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId?: number;
  jobId?: number;
}) {
  const { currencySymbol } = useTenantCurrencyTax();
  const createQuoteSale = useCreatePrepaidQuoteCashSale();
  const createJobSale = useCreatePrepaidJobCashSale();
  const [paymentType, setPaymentType] = React.useState<string>('');

  const quoteQuery = useQuery({
    ...QuotationWithLineItemsQueryOptions(quoteId ?? 0),
    enabled: open && Boolean(quoteId),
  });
  const jobQuery = useQuery({
    ...JobItemsQueryOptions(jobId ?? 0, { page: 1, pageSize: 100 }),
    enabled: open && Boolean(jobId),
  });

  React.useEffect(() => {
    if (open) setPaymentType('');
  }, [open]);

  const isQuote = Boolean(quoteId);
  const quote = quoteQuery.data as Quotation | undefined;
  const job = jobQuery.data as JobDetails | undefined;
  const isLoading = isQuote ? quoteQuery.isFetching : jobQuery.isFetching;
  const lines = isQuote ? quoteLines(quote) : jobLines(job);
  const reference = isQuote
    ? quote?.quoteNumber
    : job?.jobNumber;
  const customerName = isQuote
    ? quote?.customerName
    : job?.customerDto?.businessName ||
      job?.customerDto?.individualContactName ||
      job?.contactPersonName ||
      '';
  const materialAmount = isQuote
    ? (quote?.totalSellPrice ?? 0)
    : (job?.totalProductSellPrice ?? 0) + (job?.totalTruckSellPrice ?? 0);
  const breakdown = prepaidCashSaleBreakdown(materialAmount, paymentType);
  const showSurcharge = breakdown.surchargeAmount > 0;
  const isPending = createQuoteSale.isPending || createJobSale.isPending;
  const canRecord = Boolean(paymentType) && lines.length > 0 && materialAmount > 0;

  const record = async () => {
    if (!canRecord) return;
    try {
      if (quoteId) {
        await createQuoteSale.mutateAsync({ quoteId, paymentType });
      } else if (jobId) {
        await createJobSale.mutateAsync({ jobId, paymentType });
      }
      onOpenChange(false);
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
              {isLoading
                ? 'Loading line items…'
                : `Pay in full for ${reference || 'this document'}${
                    customerName ? ` · ${customerName}` : ''
                  }. Quantity and price will lock after payment.`}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl bg-slate-100 py-10">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-slate-100 p-4 flex flex-col gap-2">
                {lines.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Add line items before recording a cash sale.
                  </p>
                ) : (
                  lines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {line.productName}
                        {line.quantity != null
                          ? ` · ${line.quantity}${line.uom ? ` ${line.uom}` : ''}`
                          : ''}
                      </span>
                      <span className="font-medium">
                        {currencySymbol}
                        {centsToDollars(line.lineTotal ?? 0)}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between pt-2 border-t text-sm font-semibold">
                  <span>Material Total</span>
                  <span>
                    {currencySymbol}
                    {centsToDollars(breakdown.materialAmount)}
                  </span>
                </div>
                {showSurcharge ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span>Credit Card Surcharge (3.75%)</span>
                      <span>
                        {currencySymbol}
                        {centsToDollars(breakdown.surchargeAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>Total Charged</span>
                      <span>
                        {currencySymbol}
                        {centsToDollars(breakdown.totalCharged)}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Payment type</span>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASH_SALE_PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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
          <Button
            type="button"
            className="h-11 flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]"
            disabled={isPending || isLoading || !canRecord}
            onClick={() => void record()}
          >
            Record Cash Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
