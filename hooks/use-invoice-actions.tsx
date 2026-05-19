'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { InvoiceByIdQueryOptions } from '@/lib/api/invoices';
import { centsToDollars } from '@/lib/utils/currency';
import { format, formatDate } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';
import { formatNumberThousandSeparator } from '@/lib/utils/number';

export function useInvoiceActions(invoiceId: number | undefined) {
  const [isViewDetailsOpen, setIsViewDetailsOpen] = React.useState(false);

  const actions = {
    viewDetails: () => {
      setIsViewDetailsOpen(true);
    },

    download: () => {
      console.log('Download invoice:', invoiceId);
    },
  };

  const InvoiceDetailsDialog = () => {
    const { data: invoice, isLoading } = useQuery({
      ...InvoiceByIdQueryOptions(invoiceId as number),
      enabled: isViewDetailsOpen && invoiceId !== undefined,
    });

    return (
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
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

                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-900">
                      {invoice.customerName || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Total Amount</p>
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
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Xero Invoice ID</p>
                    <p className="font-semibold text-gray-900">
                      {invoice.externalInvoiceId || '-'}
                    </p>
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
                                : docket.jobItem?.productSellUom === 'M3'
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

              <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="h-10 rounded-lg border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={actions.download}
                >
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return {
    actions,
    InvoiceDetailsDialog,
  };
}
