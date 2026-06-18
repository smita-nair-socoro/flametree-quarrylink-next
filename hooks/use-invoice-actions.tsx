'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  InvoiceByIdQueryOptions,
  InvoicePdfQueryOptions,
  InvoiceUrlQueryOptions,
} from '@/lib/api/invoices';
import { centsToDollars } from '@/lib/utils/currency';
import { format, formatDate } from 'date-fns';
import { Button } from '@/components/ui/button';
import { HelpCircle, Loader2 } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInvoiceDetailsDialogStore } from '@/app/stores/invoice-details-dialog-store';
import { INVOICE_STATUS } from '@/lib/types/invoice-enums';
import { useTenantStore } from '@/app/stores/tenant-store';

/** Single shared invoice details dialog — mount once per page (e.g. dockets page, invoices tab). */
export function InvoiceDetailsDialog() {
  const queryClient = useQueryClient();
  const open = useInvoiceDetailsDialogStore((s) => s.open);
  const invoiceId = useInvoiceDetailsDialogStore((s) => s.invoiceId);
  const closeDialog = useInvoiceDetailsDialogStore((s) => s.closeDialog);
  const accountingSoftware = useTenantStore(
    (s) => s.tenantDetails?.accountingSoftware ?? null,
  );

  const { data: invoice, isLoading } = useQuery({
    ...InvoiceByIdQueryOptions(invoiceId as number),
    enabled: open && invoiceId !== undefined,
  });

  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    if (!open) setIsDownloading(false);
  }, [open]);

  const handleDownload = async () => {
    if (invoiceId == null || isDownloading) return;

    setIsDownloading(true);
    try {
      if (accountingSoftware === 'XERO') {
        const invoiceUrl = await queryClient.fetchQuery(
          InvoiceUrlQueryOptions(invoiceId),
        );
        if (invoiceUrl?.invoiceLink) {
          window.open(invoiceUrl.invoiceLink, '_blank');
        }
        return;
      }

      if (accountingSoftware === 'MYOB_BUSINESS') {
        const invoicePdf = await queryClient.fetchQuery(
          InvoicePdfQueryOptions(invoiceId),
        );
        if (!(invoicePdf instanceof Blob)) return;

        const url = URL.createObjectURL(invoicePdf);
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice-${invoice?.invoiceNumber ?? invoiceId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl p-0">
        {isLoading || !invoice ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Loading Invoice Details</DialogTitle>
              <DialogDescription>
                Please wait while the invoice details are being loaded.
              </DialogDescription>
            </DialogHeader>
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#8E51FF]" />
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pb-4">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Invoice {invoice.invoiceNumber}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Details for invoice {invoice.invoiceNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.customerName || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>(ex-GST)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${centsToDollars(invoice.totalAmount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.invoiceDate
                      ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')
                      : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.dueDate
                      ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                      : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Xero Status</p>
                  <TableBadges names={[invoice.status]} visibleCount={1} />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Included Dockets ({invoice.dockets?.length || 0})
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-900">
                          Docket #
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-900">
                          Product
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-900">
                          Quantity
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-900">
                          Delivery Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {invoice.dockets?.map((docket) => (
                        <tr key={docket.id}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {docket.docketNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="truncate block w-[80px]">
                              {docket.jobItem?.product?.productName || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatNumberThousandSeparator(
                              docket.actualLoadSize ||
                                docket.plannedLoadSize ||
                                0,
                            )}{' '}
                            {docket.jobItem?.productSellUom === 'TN'
                              ? 'TN'
                              : docket.jobItem?.productSellUom === 'M3' ||
                                  docket.jobItem?.productSellUom === 'm3'
                                ? 'm³'
                                : docket.jobItem?.productSellUom === 'KG_20'
                                  ? 'x 20kg'
                                  : docket.jobItem?.productSellUom === 'BULKA'
                                    ? 'Bulka'
                                    : docket.jobItem?.productSellUom || ''}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {docket.deliveryCollectionDate
                              ? formatDate(
                                  docket.deliveryCollectionDate,
                                  'MMM dd, yyyy',
                                )
                              : '-'}
                          </td>
                        </tr>
                      ))}
                      {(!invoice.dockets || invoice.dockets.length === 0) && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-gray-500"
                          >
                            No dockets found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {invoice.status !== INVOICE_STATUS.FAILED && (
              <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="h-10 rounded-lg border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading…
                    </>
                  ) : (
                    'Download PDF'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function useInvoiceActions(invoiceId: number | undefined) {
  const openDialog = useInvoiceDetailsDialogStore((s) => s.openDialog);

  const actions = {
    viewDetails: () => {
      if (invoiceId != null) {
        openDialog(invoiceId);
      }
    },
  };

  return { actions };
}
