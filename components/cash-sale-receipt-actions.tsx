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
import { SelectOptions } from '@/components/ui/select-options';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal } from 'lucide-react';
import {
  CASH_SALE_PAYMENT_TYPES,
  CASH_SALE_VOID_REASONS,
  PaymentsCashSale,
} from '@/lib/types/payments';
import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import {
  useAmendCashSalePaymentType,
  useRetryCashSale,
  useVoidCashSale,
  CashSaleDetailQueryOptions,
} from '@/lib/api/payments';
import { useQuery } from '@tanstack/react-query';
import { centsToDollars } from '@/lib/utils/currency';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { downloadCashSaleReceiptPdf } from '@/lib/utils/cash-sale-receipt-pdf';
import { useIsAdmin, useHasVoidTransactions } from '@/app/stores/user-store';
import { useTenantStore } from '@/app/stores/tenant-store';
import { notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { TableBadges } from '@/components/table-badges';
import { APIClient } from '@/lib/api/APIClient';
import { formatLocalDate } from '@/lib/utils/date';

export function CashSaleReceiptActions({
  receipt,
  defaultDetailsOpen = false,
  hideMenu = false,
  onDetailsOpenChange,
}: {
  receipt: PaymentsCashSale;
  defaultDetailsOpen?: boolean;
  hideMenu?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
}) {
  const { currencySymbol } = useTenantCurrencyTax();
  const businessName = useTenantStore((state) => state.businessName);
  const isAdmin = useIsAdmin();
  const canVoid = useHasVoidTransactions();
  const retry = useRetryCashSale();
  const amend = useAmendCashSalePaymentType();
  const voidSale = useVoidCashSale();
  const [detailsOpen, setDetailsOpen] = React.useState(defaultDetailsOpen);
  const [amendOpen, setAmendOpen] = React.useState(false);
  const [voidOpen, setVoidOpen] = React.useState(false);
  const [paymentType, setPaymentType] = React.useState(receipt.paymentType);
  const [voidReason, setVoidReason] = React.useState('');
  const [voidDetail, setVoidDetail] = React.useState('');

  const { data: detail } = useQuery(
    CashSaleDetailQueryOptions(
      detailsOpen || amendOpen || voidOpen ? receipt.id : null,
    ),
  );

  React.useEffect(() => {
    setPaymentType(receipt.paymentType);
  }, [receipt.paymentType]);

  const openPdf = async () => {
    try {
      const data = detail ?? (await APIClient.payments.cashSale(receipt.id));
      await downloadCashSaleReceiptPdf(
        data,
        currencySymbol,
        businessName ?? undefined,
      );
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  return (
    <>
      {hideMenu ? null : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Receipt actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void openPdf()}>
            Download Receipt
          </DropdownMenuItem>
          {isAdmin && !receipt.voided ? (
            <DropdownMenuItem onClick={() => setAmendOpen(true)}>
              Amend Payment Type
            </DropdownMenuItem>
          ) : null}
          {canVoid && !receipt.voided ? (
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setVoidOpen(true)}
            >
              Void
            </DropdownMenuItem>
          ) : null}
          {isAdmin &&
          !receipt.voided &&
          receipt.accountingSync !== 'SYNCED' ? (
            <DropdownMenuItem onClick={() => retry.mutate(receipt.id)}>
              Retry Sync
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      )}

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          onDetailsOpenChange?.(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cash Sale {receipt.reference}</DialogTitle>
            <DialogDescription>Cash sale receipt</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-sm">
            {receipt.voided ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <TableBadges names={['VOID']} visibleCount={1} />
                <p className="mt-2">
                  Voided by {detail?.voidedBy || '—'}
                  {detail?.voidedAt
                    ? ` on ${formatLocalDate(detail.voidedAt)}`
                    : ''}
                  {detail?.voidReason ? ` · ${detail.voidReason}` : ''}
                  {detail?.voidReasonDetail
                    ? ` — ${detail.voidReasonDetail}`
                    : ''}
                </p>
              </div>
            ) : null}
            <div>Customer: {receipt.customerName || '—'}</div>
            <div>
              Total Amount: {currencySymbol}
              {centsToDollars(receipt.amount)}
            </div>
            <div>Recorded Date: {formatLocalDate(receipt.recordedAt)}</div>
            <div className="flex items-center gap-2">
              Payment Type:{' '}
              <TableBadges
                names={[receipt.paymentType || 'N/A']}
                visibleCount={1}
              />
              {(detail?.amendments?.length ?? 0) > 0 ? (
                <span className="text-muted-foreground">(amended)</span>
              ) : null}
            </div>
            <div>Payment Received By: {receipt.paymentReceivedBy || '—'}</div>
            <AccountingSyncBadge
              status={receipt.accountingSync}
              failureReason={receipt.failureReason}
              onRetry={
                receipt.accountingSync === 'FAILED' && !receipt.voided
                  ? () => retry.mutate(receipt.id)
                  : undefined
              }
              retrying={retry.isPending}
            />
            <div className="pt-2 font-medium">
              Included Dockets ({detail?.dockets?.length ?? receipt.docketCount})
            </div>
            {(detail?.dockets ?? []).map((line) => (
              <div key={line.docketId} className="flex flex-col gap-0.5">
                <span>
                  {line.docketNumber} · {line.docketType}
                  {line.productName ? ` · ${line.productName}` : ''}
                </span>
                <span className="text-muted-foreground">
                  {line.quantity != null ? `Qty ${line.quantity}` : null}
                  {line.deliveryDate
                    ? ` · ${formatLocalDate(line.deliveryDate)}`
                    : ''}
                  {' · '}
                  {currencySymbol}
                  {centsToDollars(line.amount)}
                </span>
              </div>
            ))}
            {(detail?.amendments ?? []).length > 0 ? (
              <div className="pt-2 border-t text-muted-foreground">
                Amended payment type
                {detail?.amendments.map((amendment) => (
                  <div key={`${amendment.amendedAt}-${amendment.newPaymentType}`}>
                    {amendment.previousPaymentType} → {amendment.newPaymentType}{' '}
                    by {amendment.amendedBy}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => void openPdf()}>
            Download PDF
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={amendOpen} onOpenChange={setAmendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amend payment type</DialogTitle>
          </DialogHeader>
          <SelectOptions
            searchLabel="payment type"
            options={CASH_SALE_PAYMENT_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
            value={paymentType}
            onChange={(value) => setPaymentType(String(value))}
          />
          <Button
            disabled={amend.isPending}
            onClick={async () => {
              try {
                await amend.mutateAsync({ id: receipt.id, paymentType });
                setAmendOpen(false);
              } catch (error) {
                notifyError(extractErrorMessage(error));
              }
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void cash sale</DialogTitle>
          </DialogHeader>
          <SelectOptions
            searchLabel="void reason"
            options={CASH_SALE_VOID_REASONS.map((reason) => ({
              value: reason,
              label: reason,
            }))}
            value={voidReason}
            onChange={(value) => setVoidReason(String(value))}
            placeholder="Select a reason..."
          />
          {voidReason === 'Other' ? (
            <Textarea
              value={voidDetail}
              onChange={(event) => setVoidDetail(event.target.value)}
              placeholder="Detail required"
            />
          ) : null}
          <Button
            variant="destructive"
            disabled={
              voidSale.isPending ||
              !voidReason ||
              (voidReason === 'Other' && !voidDetail.trim())
            }
            onClick={async () => {
              try {
                await voidSale.mutateAsync({
                  id: receipt.id,
                  reason: voidReason,
                  reasonDetail: voidDetail || undefined,
                });
                setVoidOpen(false);
              } catch (error) {
                notifyError(extractErrorMessage(error));
              }
            }}
          >
            Void
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
